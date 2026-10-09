#!/usr/bin/env node
// Screens marketing copy against a claims register. A text-pattern screen, not a
// legal review: it matches words, so a clean run does not prove the copy is safe.
//
//   node check-copy.mjs claims_register.json copy.md [--json]
//
// Exit code 1 when any P0 is found, 2 on bad input.
import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const FUTURE = /\b(will|soon|coming|planned|later this|next (month|year|release|update)|roadmap|in the future|not yet)\b/i;
const QUALIFIED_BETA = /\b(beta|early access|preview|in testing|pilot|waitlist)\b/i;
const UNIVERSAL = /\b(every|always|never|all|guarantee[sd]?|completely|fully|perfect(ly)?|zero|instant(ly)?|anywhere|forever)\b|100\s?%/i;
const NUMBER = /[$€£]\s?\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s?(?:%|x\b|×|seconds?|secs?\b|minutes?|mins?\b|hours?|days?|weeks?|students|users|languages|GB|MB)/gi;

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const [registerPath, copyPath] = args.filter((a) => a !== '--json');
if (!registerPath || !copyPath) {
  console.error('Usage: node check-copy.mjs claims_register.json copy.md [--json]');
  process.exit(2);
}

let register, copy;
try {
  register = JSON.parse(await readFile(resolve(registerPath), 'utf8'));
  copy = await readFile(resolve(copyPath), 'utf8');
} catch (e) {
  console.error(`Could not read input: ${e.message}`);
  process.exit(2);
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Leading word boundary only, so "quiz" also matches "quizzes".
const term = (s) => new RegExp(`(^|[^\\p{L}\\p{N}])${escape(s)}`, 'iu');
const claims = register.claims.map((c) => ({ ...c, re: (c.match ?? []).map(term) }));
const sourced = register.claims.map((c) => [c.statement, ...(c.approved_phrasings ?? [])].join(' ')).join(' ');

// Split into sentences, keeping line numbers. Skip fenced code.
const sentences = [];
let fenced = false;
copy.split('\n').forEach((raw, i) => {
  if (/^\s*```/.test(raw)) { fenced = !fenced; return; }
  if (fenced) return;
  const line = raw.replace(/^\s*(#{1,6}\s+|[-*+]\s+|>\s+|\d+\.\s+)/, '').replace(/[*_`]/g, '').trim();
  if (!line) return;
  for (const text of line.split(/(?<=[.!?])\s+/)) if (text.trim()) sentences.push({ line: i + 1, text: text.trim() });
});

const findings = [];
const add = (severity, s, code, message, claim) =>
  findings.push({ severity, line: s.line, sentence: s.text, code, claim: claim?.id ?? null, message });
const used = new Set();

for (const s of sentences) {
  for (const b of register.banned ?? []) {
    if (term(b.phrase).test(s.text)) add('P0', s, 'banned', `"${b.phrase}": ${b.reason} Try: ${b.rewrite}`);
  }
  const hits = claims.filter((c) => c.re.some((re) => re.test(s.text)));
  for (const c of hits) {
    used.add(c.id);
    if (c.status === 'proposed') add('P0', s, 'proposed', 'Proposed claims cannot appear on any public surface.', c);
    if (c.status === 'retired') add('P0', s, 'retired', 'This claim is retired; the product no longer does this.', c);
    if (c.status === 'planned') {
      if (!FUTURE.test(s.text)) add('P0', s, 'planned-present', 'Planned claim written as if it already works. Use future tense, or cut it.', c);
      else if (!c.surfaces?.length) add('P1', s, 'planned-no-surface', 'No surface is approved to name this planned claim yet.', c);
      else add('P2', s, 'planned-surface', `Planned claim: only allowed on ${c.surfaces.join(', ')}.`, c);
    }
    if (c.status === 'beta' && !QUALIFIED_BETA.test(s.text))
      add('P1', s, 'beta-unqualified', 'Beta claim without a qualifier such as "in beta" or "early access".', c);
    for (const o of c.overreach_phrasings ?? [])
      if (term(o).test(s.text)) add('P1', s, 'overreach', `"${o}" overreaches for this claim. Approved: ${(c.approved_phrasings ?? []).join(' / ') || 'none listed'}.`, c);
  }
  // Approved phrasings are pre-cleared, so their wording does not count as a universal promise.
  const unapproved = hits
    .flatMap((c) => c.approved_phrasings ?? [])
    .reduce((text, phrase) => text.replace(new RegExp(escape(phrase), 'ig'), ' '), s.text);
  const universal = unapproved.match(UNIVERSAL);
  if (hits.length && universal)
    add('P1', s, 'universal', `"${universal[0]}" makes a universal promise. Prefer capability framing ("lets you…").`, hits[0]);
  for (const n of s.text.match(NUMBER) ?? []) {
    const digits = n.match(/\d+(?:[.,]\d+)?/)[0];
    if (!sourced.includes(digits)) add('P2', s, 'unsourced-number', `"${n.trim()}" appears in no claim. Add a sourced claim or remove the number.`);
  }
}

const order = { P0: 0, P1: 1, P2: 2 };
findings.sort((a, b) => order[a.severity] - order[b.severity] || a.line - b.line);
const counts = { P0: 0, P1: 0, P2: 0 };
for (const f of findings) counts[f.severity]++;

if (asJson) {
  console.log(JSON.stringify({ register: basename(registerPath), copy: basename(copyPath), as_of: register.as_of, counts, claims_used: [...used].sort(), findings }, null, 2));
} else {
  console.log(`Claims check: ${basename(copyPath)} against ${basename(registerPath)} (register as of ${register.as_of})\n`);
  for (const f of findings) {
    const claim = f.claim ? ` ${f.claim}` : '';
    console.log(`${f.severity}  line ${f.line}${claim}  ${f.sentence}`);
    console.log(`    ${f.message}\n`);
  }
  console.log(`${counts.P0} P0 · ${counts.P1} P1 · ${counts.P2} P2 · claims used: ${[...used].sort().join(', ') || 'none'}`);
  console.log('A text screen, not a verdict: read every sentence yourself.');
}
process.exit(counts.P0 ? 1 : 0);

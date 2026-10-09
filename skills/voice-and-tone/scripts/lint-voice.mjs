#!/usr/bin/env node
// Screens copy against a voice guide: phrases to avoid, preferred words, and
// mechanics (case, contractions, exclamation marks, emoji, sentence length).
// A screen, not an editor: it cannot hear tone.
//
//   node lint-voice.mjs voice.json copy.md [--json]
//
// Exit code 1 when any P1 is found, 2 on bad input.
import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const [voicePath, copyPath] = args.filter((a) => a !== '--json');
if (!voicePath || !copyPath) {
  console.error('Usage: node lint-voice.mjs voice.json copy.md [--json]');
  process.exit(2);
}

let voice, copy;
try {
  voice = JSON.parse(await readFile(resolve(voicePath), 'utf8'));
  copy = await readFile(resolve(copyPath), 'utf8');
} catch (e) {
  console.error(`Could not read input: ${e.message}`);
  process.exit(2);
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const word = (s) => new RegExp(`(^|[^\\p{L}\\p{N}])${escape(s)}(?=$|[^\\p{L}\\p{N}])`, 'iu');
const EMOJI = /\p{Extended_Pictographic}/u;
const UNCONTRACTED = [
  ['you are', "you're"], ['we are', "we're"], ['it is', "it's"], ['that is', "that's"], ['do not', "don't"],
  ['does not', "doesn't"], ['cannot', "can't"], ['will not', "won't"], ['is not', "isn't"], ['are not', "aren't"],
];
const CONTRACTION = /\b\w+'(re|s|t|ll|ve|d|m)\b/i;
const SMALL = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);
const m = voice.mechanics ?? {};

const findings = [];
const add = (severity, line, text, code, message) => findings.push({ severity, line, text, code, message });
let exclamations = 0;
let fenced = false;

copy.split('\n').forEach((raw, i) => {
  const line = i + 1;
  if (/^\s*```/.test(raw)) { fenced = !fenced; return; }
  if (fenced || !raw.trim()) return;
  const heading = /^\s*#{1,6}\s+/.test(raw);
  const text = raw.replace(/^\s*(#{1,6}\s+|[-*+]\s+|>\s+|\d+\.\s+)/, '').replace(/[*_`]/g, '').trim();

  for (const a of voice.vocabulary?.avoid ?? [])
    if (word(a.phrase).test(text)) add('P1', line, text, 'avoid', `"${a.phrase}": ${a.why} Try: ${a.instead}`);
  for (const p of voice.vocabulary?.prefer ?? []) {
    // Longest first, one finding per entry: "devotional content" shouldn't also report "content".
    const hit = [...p.instead_of].sort((x, y) => y.length - x.length).find((w) => word(w).test(text));
    if (hit) add('P2', line, text, 'prefer', `Say "${p.word}" rather than "${hit}".`);
  }

  if (heading && m.case === 'sentence') {
    const words = text.split(/\s+/).slice(1).filter((w) => /^\p{L}/u.test(w) && !SMALL.has(w.toLowerCase()));
    if (words.length >= 2 && words.every((w) => /^\p{Lu}/u.test(w))) add('P2', line, text, 'case', 'Heading is in Title Case; the voice uses sentence case.');
  }
  const bangs = (text.match(/!/g) ?? []).length;
  exclamations += bangs;
  if (bangs && m.exclamation_marks === 'never') add('P1', line, text, 'exclamation', 'The voice never uses exclamation marks.');
  if (EMOJI.test(text) && m.emoji === 'never') add('P1', line, text, 'emoji', 'The voice never uses emoji.');
  if (m.contractions === true)
    for (const [long, short] of UNCONTRACTED) if (word(long).test(text)) add('P2', line, text, 'contraction', `Use "${short}" rather than "${long}".`);
  if (m.contractions === false && CONTRACTION.test(text)) add('P2', line, text, 'contraction', 'The voice avoids contractions.');
  if (m.max_sentence_words)
    for (const s of text.split(/(?<=[.!?])\s+/)) {
      const n = s.split(/\s+/).filter(Boolean).length;
      if (n > m.max_sentence_words) add('P2', line, s, 'length', `${n} words; the voice keeps sentences under ${m.max_sentence_words}.`);
    }
});
if (m.exclamation_marks === 'rare' && exclamations > 1)
  add('P2', 0, '', 'exclamation', `${exclamations} exclamation marks; the voice allows one at most per piece.`);

const order = { P1: 0, P2: 1 };
findings.sort((a, b) => order[a.severity] - order[b.severity] || a.line - b.line);
const counts = { P1: 0, P2: 0 };
for (const f of findings) counts[f.severity]++;

if (asJson) {
  console.log(JSON.stringify({ voice: basename(voicePath), copy: basename(copyPath), counts, findings }, null, 2));
} else {
  console.log(`Voice check: ${basename(copyPath)} against ${basename(voicePath)} (${voice.brand})\n`);
  for (const f of findings) {
    console.log(`${f.severity}  ${f.line ? `line ${f.line}  ${f.text}` : 'whole piece'}`);
    console.log(`    ${f.message}\n`);
  }
  console.log(`${counts.P1} P1 · ${counts.P2} P2`);
  console.log('A screen, not an editor: read it aloud as well.');
}
process.exit(counts.P1 ? 1 : 0);

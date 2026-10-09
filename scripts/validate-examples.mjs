// Validates skills and example outputs. No dependencies; run from anywhere:
//   node scripts/validate-examples.mjs            (all skills + every file under brands/)
//   node scripts/validate-examples.mjs path.json  (one output; skill inferred from filename)
import { readFile, readdir } from 'node:fs/promises';
import { basename, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const skillsDir = join(root, 'skills');
const brandsDir = join(root, 'brands');

// Example filename -> skill whose schema it must match.
const OUTPUTS = {
  'art_direction.json': 'art-direction-extractor',
  'naming_candidates.json': 'brand-naming-rubric',
  'logo_directions.json': 'logo-identity-directions',
};

const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);

// --- Minimal JSON Schema subset: type, enum, required, properties,
// additionalProperties:false, items, min/maxItems, minimum/maximum, minLength, pattern.
function check(schema, value, path, where) {
  const type = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
  if (schema.type) {
    const ok = schema.type === 'integer' ? Number.isInteger(value) : schema.type === type;
    if (!ok) return fail(where, `${path} should be ${schema.type}, got ${type}`);
  }
  if (schema.enum && !schema.enum.includes(value)) fail(where, `${path} must be one of ${schema.enum.join(', ')}`);
  if (type === 'string') {
    if (schema.minLength && value.length < schema.minLength) fail(where, `${path} is empty`);
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) fail(where, `${path} "${value}" does not match ${schema.pattern}`);
  }
  if (type === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) fail(where, `${path} below ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) fail(where, `${path} above ${schema.maximum}`);
  }
  if (type === 'array') {
    if (schema.minItems !== undefined && value.length < schema.minItems) fail(where, `${path} needs at least ${schema.minItems} items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) fail(where, `${path} allows at most ${schema.maxItems} items`);
    if (schema.items) value.forEach((item, i) => check(schema.items, item, `${path}[${i}]`, where));
  }
  if (type === 'object') {
    for (const key of schema.required ?? []) if (!(key in value)) fail(where, `${path} missing "${key}"`);
    for (const [key, child] of Object.entries(value)) {
      const sub = schema.properties?.[key];
      if (sub) check(sub, child, `${path}.${key}`, where);
      else if (schema.additionalProperties === false) fail(where, `${path} has unknown field "${key}"`);
    }
  }
}

// --- Rules the schema cannot express.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const RULES = {
  'art-direction-extractor'(data, where) {
    const ids = new Set((data.references ?? []).map((r) => r.id));
    if (ids.size) {
      for (const o of data.observations) for (const ref of o.evidence)
        if (!ids.has(ref)) fail(where, `observation "${o.pattern}" cites unknown reference ${ref}`);
    }
    for (const o of data.observations)
      if (o.evidence.length < 2) fail(where, `observation "${o.pattern}" needs at least two references`);
    const palette = data.color_mood.palette_candidates ?? [];
    const ground = palette.find((p) => p.role === 'ground');
    const text = palette.find((p) => p.role === 'text');
    if (ground && text) {
      const ratio = contrast(ground.hex, text.hex);
      if (ratio < 4.5) fail(where, `text ${text.hex} on ground ${ground.hex} is ${ratio.toFixed(2)}:1, below WCAG AA 4.5:1`);
    }
  },
  'brand-naming-rubric'(data, where) {
    const names = data.top_10.map((n) => n.name);
    data.top_10.forEach((n, i) => {
      const sum = Object.values(n.scores).reduce((a, b) => a + b, 0);
      if (sum !== n.score_total) fail(where, `${n.name} score_total ${n.score_total} should be ${sum}`);
      const prev = data.top_10[i - 1];
      if (prev && (prev.score_total < n.score_total ||
        (prev.score_total === n.score_total && prev.scores.distinctiveness < n.scores.distinctiveness)))
        fail(where, `${n.name} should rank above ${prev.name} (total, then distinctiveness)`);
    });
    if (new Set(names).size !== names.length) fail(where, 'top_10 has duplicate names');
    for (const list of ['safe_5', 'wildcard_5'])
      if (new Set(data[list]).size !== data[list].length) fail(where, `${list} has duplicates`);
    for (const f of data.filtered_out ?? [])
      if (names.includes(f.name)) fail(where, `${f.name} is both filtered out and in top_10`);
  },
  'logo-identity-directions'(data, where) {
    const names = data.directions.map((d) => d.direction_name);
    if (new Set(names).size !== names.length) fail(where, 'direction names must be unique');
    if (!names.includes(data.explore_first.direction_name))
      fail(where, `explore_first "${data.explore_first.direction_name}" is not one of the directions`);
  },
};

async function loadSchema(skill) {
  return JSON.parse(await readFile(join(skillsDir, skill, 'schema.json'), 'utf8'));
}

async function validateOutput(file) {
  const where = relative(root, file);
  const skill = OUTPUTS[basename(file)];
  if (!skill) return fail(where, `unknown output type; expected one of ${Object.keys(OUTPUTS).join(', ')}`);
  let data;
  try {
    data = JSON.parse(await readFile(file, 'utf8'));
  } catch (e) {
    return fail(where, `invalid JSON (${e.message})`);
  }
  const before = errors.length;
  check(await loadSchema(skill), data, '$', where);
  if (errors.length === before) RULES[skill]?.(data, where);
  if (errors.length === before) console.log(`ok  ${where}`);
}

async function validateSkills() {
  for (const dir of (await readdir(skillsDir, { withFileTypes: true })).filter((d) => d.isDirectory())) {
    const where = `skills/${dir.name}/SKILL.md`;
    const before = errors.length;
    const text = await readFile(join(skillsDir, dir.name, 'SKILL.md'), 'utf8');
    const front = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1];
    if (!front) { fail(where, 'missing frontmatter'); continue; }
    const name = front.match(/^name:\s*(.+)$/m)?.[1].trim();
    const description = front.match(/^description:\s*(.+)$/m)?.[1].trim() ?? '';
    if (name !== dir.name) fail(where, `name "${name}" must match folder "${dir.name}"`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name ?? '') || name.length > 64) fail(where, 'name must be kebab-case, max 64 chars');
    if (!description || description.length > 1024) fail(where, 'description is required, max 1024 chars');
    if (!/\bUse when\b/.test(description)) fail(where, 'description should say "Use when …" so agents know when to load it');
    try {
      await loadSchema(dir.name);
    } catch {
      fail(where, 'schema.json missing or invalid next to SKILL.md');
    }
    for (const [, block] of text.matchAll(/```json\n([\s\S]*?)```/g)) {
      try { JSON.parse(block); } catch (e) { fail(where, `example JSON block does not parse (${e.message})`); }
    }
    if (errors.length === before) console.log(`ok  ${where}`);
  }
}

async function exampleFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await exampleFiles(full)));
    else if (entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

const targets = process.argv.slice(2);
if (targets.length) {
  for (const t of targets) await validateOutput(resolve(t));
} else {
  await validateSkills();
  for (const file of await exampleFiles(brandsDir)) await validateOutput(file);
}

if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

#!/usr/bin/env node
// Computes total, per-dimension floors and the verdict for a QA scorecard, so the
// verdict always follows from the numbers.
//
//   node score.mjs qa_scorecard.json           print the result
//   node score.mjs qa_scorecard.json --write   also write total/verdict/below_floor back
//
// Exit code 1 when the input is inconsistent (weights not 100, score above weight).
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function score(card) {
  const problems = [];
  const weights = card.dimensions.reduce((sum, d) => sum + d.weight, 0);
  if (weights !== 100) problems.push(`weights add up to ${weights}, not 100`);
  const ratio = card.floor_ratio ?? 0.7;
  const dimensions = card.dimensions.map((d) => {
    if (d.score > d.weight) problems.push(`${d.id} scores ${d.score}, above its weight ${d.weight}`);
    if (d.score < d.weight && !d.fix) problems.push(`${d.id} lost points but has no fix`);
    return { ...d, below_floor: d.score < d.weight * ratio };
  });
  const total = Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) * 10) / 10;
  const failed = (card.hard_failures ?? []).filter((h) => h.triggered);
  const low = dimensions.filter((d) => d.below_floor);
  const verdict = failed.length ? 'reject' : total < card.threshold || low.length ? 'revise' : 'pass';
  const reasons = [
    ...failed.map((h) => `${h.id} ${h.rule}`),
    ...(total < card.threshold ? [`total ${total} is under ${card.threshold}`] : []),
    ...low.map((d) => `${d.label} below floor (${d.score}/${d.weight})`),
  ];
  return { card: { ...card, dimensions, total, verdict }, reasons, problems };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const [path, flag] = process.argv.slice(2);
  if (!path) {
    console.error('Usage: node score.mjs qa_scorecard.json [--write]');
    process.exit(2);
  }
  const file = resolve(path);
  const { card, reasons, problems } = score(JSON.parse(await readFile(file, 'utf8')));
  const width = Math.max(...card.dimensions.map((d) => d.label.length));
  console.log(`${card.asset.name} · ${card.asset.channel} · seen at ${card.asset.smallest_view}\n`);
  for (const d of card.dimensions) {
    const bar = '█'.repeat(Math.round((d.score / d.weight) * 10)).padEnd(10, '·');
    console.log(`${d.label.padEnd(width)}  ${bar}  ${String(d.score).padStart(4)}/${d.weight}${d.below_floor ? '  below floor' : ''}`);
  }
  console.log(`\n${card.verdict.toUpperCase()}  ${card.total}/100 (threshold ${card.threshold})`);
  for (const r of reasons) console.log(`  · ${r}`);
  if (!card.reviewer?.independent) console.log('  · reviewer is not independent: get a second review');
  if (problems.length) {
    console.error(`\nInput problems:\n${problems.map((p) => `  ✗ ${p}`).join('\n')}`);
    process.exit(1);
  }
  if (flag === '--write') {
    await writeFile(file, `${JSON.stringify(card, null, 2)}\n`);
    console.log(`\nWrote total, verdict and floors to ${path}`);
  }
}

#!/usr/bin/env node
// Turns a tokens.json file into CSS custom properties and a contrast report.
//
//   node tokens.mjs tokens.json            contrast report (declared pairs + full matrix)
//   node tokens.mjs tokens.json --css      print CSS custom properties
//
// Exit code 1 when a declared contrast pair misses its minimum, 2 on bad input.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const GROUPS = ['color', 'font', 'font-size', 'line-height', 'font-weight', 'radius', 'space', 'duration', 'easing'];

// Follows "{group.name}" aliases, as in the Design Tokens Community Group format.
export function lookup(tokens, ref, seen = new Set()) {
  const path = ref.replace(/^\{|\}$/g, '');
  if (seen.has(path)) throw new Error(`alias loop at ${path}`);
  seen.add(path);
  const [group, ...rest] = path.split('.');
  const token = tokens[group]?.[rest.join('.')];
  if (!token) throw new Error(`unknown token ${ref}`);
  const value = token.$value;
  return typeof value === 'string' && /^\{.+\}$/.test(value) ? lookup(tokens, value, seen) : value;
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

export function checkPairs(tokens) {
  return (tokens.contrast_pairs ?? []).map((p) => {
    const ratio = contrast(lookup(tokens, p.text), lookup(tokens, p.background));
    return { ...p, ratio, pass: ratio >= p.min };
  });
}

function cssValue(token, tokens) {
  let v = token.$value;
  if (typeof v === 'string' && /^\{.+\}$/.test(v)) return `var(--${v.slice(1, -1).replace('.', '-')})`;
  if (token.$type === 'fontFamily') v = [].concat(v).map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(', ');
  if (token.$type === 'cubicBezier') v = `cubic-bezier(${v.join(', ')})`;
  return String(v);
}

export function toCss(tokens) {
  const lines = [`/* ${tokens.meta?.name ?? 'Tokens'}, generated from ${tokens.meta?.source ?? 'tokens.json'} */`, ':root {'];
  for (const group of GROUPS) {
    for (const [name, token] of Object.entries(tokens[group] ?? {})) {
      lines.push(`  --${group}-${name}: ${cssValue(token, tokens)};`);
    }
  }
  lines.push('}');
  return lines.join('\n');
}

export function matrix(tokens) {
  const colors = Object.entries(tokens.color ?? {}).map(([name, t]) => ({ name, role: t.role, hex: lookup(tokens, `{color.${name}}`) }));
  const fg = colors.filter((c) => c.role === 'text');
  const bg = colors.filter((c) => c.role === 'background' || c.role === 'fill');
  return { fg, bg, cells: fg.map((f) => bg.map((b) => contrast(f.hex, b.hex))) };
}

const grade = (r) => (r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'large' : 'fail');

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const [path, flag] = process.argv.slice(2);
  if (!path) {
    console.error('Usage: node tokens.mjs tokens.json [--css]');
    process.exit(2);
  }
  let tokens, pairs;
  try {
    tokens = JSON.parse(await readFile(resolve(path), 'utf8'));
    pairs = checkPairs(tokens);
  } catch (e) {
    console.error(`Could not read tokens: ${e.message}`);
    process.exit(2);
  }
  if (flag === '--css') {
    console.log(toCss(tokens));
  } else {
    console.log(`Contrast: ${tokens.meta?.name ?? path}\n`);
    for (const p of pairs) {
      const mark = p.pass ? 'pass' : 'FAIL';
      console.log(`${mark.padEnd(5)} ${String(p.ratio.toFixed(2)).padStart(5)}:1  min ${p.min}  ${p.text} on ${p.background}  (${p.use})`);
    }
    const { fg, bg, cells } = matrix(tokens);
    const w = Math.max(...fg.map((f) => f.name.length), 4);
    console.log(`\nEvery text colour on every background (WCAG: AA 4.5, large/UI 3)\n`);
    console.log(`${''.padEnd(w)}  ${bg.map((b) => b.name.padEnd(14)).join('')}`);
    fg.forEach((f, i) => {
      console.log(`${f.name.padEnd(w)}  ${cells[i].map((r) => `${r.toFixed(2)} ${grade(r)}`.padEnd(14)).join('')}`);
    });
    const failed = pairs.filter((p) => !p.pass);
    console.log(`\n${pairs.length - failed.length}/${pairs.length} declared pairs pass.`);
    if (failed.length) process.exit(1);
  }
}

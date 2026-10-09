#!/usr/bin/env node
// Builds a single, offline HTML page that shows candidate names in context:
// wordmark, app icon at three sizes, browser tab and address bar, social handle,
// running sentences, and a button that speaks each name. Also prints flags.
//
//   node preview.mjs naming_candidates.json [--out preview.html]
//   node preview.mjs Numo Verveo Lumor [--out preview.html]
//
// Mock contexts only: nothing checks trademarks, domains or handles.
import { readFile, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

// Shared with the page, so edits made in the browser get the same flags.
function analyze(list) {
  const clean = list.map((c) => ({ ...c, name: String(c.name).trim() })).filter((c) => c.name);
  return clean.map((c) => {
    const flags = [];
    const first = c.name[0].toLowerCase();
    const twins = clean.filter((o) => o.name !== c.name && o.name[0].toLowerCase() === first).map((o) => o.name);
    if (twins.length) flags.push(`Same first letter as ${twins.join(', ')}: identical monogram at 16px.`);
    const letters = c.name.replace(/[^\p{L}]/gu, '').length;
    if (letters > 10) flags.push(`${letters} letters: long for an app icon label and a wordmark at small sizes.`);
    if (/[sxz]$/i.test(c.name)) flags.push(`Ends in "${c.name.slice(-1)}": the possessive "${c.name}'s" is awkward to say and write.`);
    const confusable = ['rn', 'vv', 'cl', 'nn', 'ii'].filter((p) => c.name.toLowerCase().includes(p));
    if (confusable.length) flags.push(`Contains "${confusable.join('", "')}": can blur together at small sizes ("rn" reads as "m").`);
    if (/[^a-z0-9]/i.test(c.name)) flags.push('Has spaces, accents or symbols: check how it becomes a handle and a URL.');
    return { ...c, letters, flags };
  });
}

function fromArgs(args) {
  return args.map((name) => ({ name }));
}

async function load(args) {
  if (args.length === 1 && args[0].endsWith('.json')) {
    const data = JSON.parse(await readFile(resolve(args[0]), 'utf8'));
    const list = (data.top_10 ?? []).map((n) => ({ name: n.name, pronunciation: n.pronunciation, score: n.score_total }));
    return { list, source: basename(args[0]), idea: data.idea ?? '' };
  }
  return { list: fromArgs(args), source: 'command line', idea: '' };
}

const page = (data) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Name in context</title>
<style>
  :root { --bg: #fff; --ink: #000; --muted: #6b6b6b; --line: #000; --soft: #f2f2f2; --mono: ui-monospace, "SF Mono", Menlo, monospace; }
  :root[data-theme="dark"] { --bg: #000; --ink: #fff; --muted: #9a9a9a; --line: #fff; --soft: #141414; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 14px/1.45 var(--mono); }
  header { padding: 28px 32px 20px; border-bottom: 1px solid var(--line); display: grid; gap: 14px; }
  h1 { margin: 0; font-size: 13px; letter-spacing: .14em; text-transform: uppercase; font-weight: 500; }
  .meta { color: var(--muted); font-size: 12px; }
  .controls { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }
  label { display: grid; gap: 6px; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
  textarea, select, button { font: 13px var(--mono); color: var(--ink); background: var(--bg); border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; }
  textarea { width: min(420px, 100%); height: 64px; resize: vertical; }
  button { cursor: pointer; white-space: nowrap; }
  button:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
  section { padding: 24px 32px; border-bottom: 1px solid var(--line); }
  .kicker { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; margin: 0 0 16px; }
  .strip { display: flex; flex-wrap: wrap; gap: 22px; }
  .strip figure { margin: 0; display: grid; justify-items: center; gap: 6px; font-size: 11px; color: var(--muted); }
  .icon { display: grid; place-items: center; background: var(--ink); color: var(--bg); font-family: var(--wm); font-weight: 600; }
  .clash .icon { outline: 1px dashed var(--ink); outline-offset: 3px; }
  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(560px, 100%), 1fr)); gap: 20px; }
  .card { border: 1px solid var(--line); border-radius: 14px; padding: 20px; display: grid; gap: 18px; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .wordmark { font-family: var(--wm); font-size: 44px; line-height: 1.05; font-weight: 600; letter-spacing: -.01em; overflow-wrap: anywhere; }
  .sub { color: var(--muted); font-size: 12px; margin-top: 6px; }
  .contexts { display: grid; grid-template-columns: 120px 1fr; gap: 18px; align-items: start; }
  .home { display: grid; justify-items: center; gap: 6px; }
  .home .label { font-family: system-ui, sans-serif; font-size: 11px; max-width: 76px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sizes { display: flex; gap: 10px; align-items: end; margin-top: 4px; }
  .browser { border: 1px solid var(--line); border-radius: 10px; overflow: hidden; font-family: system-ui, sans-serif; font-size: 12px; }
  .tab { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  .bar { padding: 7px 12px; border-top: 1px solid var(--line); margin-top: -1px; background: var(--soft); }
  .bar small { color: var(--muted); font-family: var(--mono); font-size: 10px; letter-spacing: .08em; margin-left: 8px; text-transform: uppercase; }
  .lines { display: grid; gap: 6px; font-family: system-ui, sans-serif; font-size: 14px; margin-top: 12px; }
  .lines .handle { font-weight: 600; }
  .flags { margin: 0; padding: 12px 0 0; border-top: 1px dashed var(--line); list-style: none; display: grid; gap: 6px; font-size: 12px; }
  .flags li::before { content: "WATCH  "; letter-spacing: .1em; font-size: 10px; }
  .flags .ok::before { content: "OK  "; }
  footer { padding: 20px 32px 40px; color: var(--muted); font-size: 12px; }
</style>
</head>
<body>
<header>
  <h1>Name in context</h1>
  <div class="meta" id="meta"></div>
  <div class="controls">
    <label>Names, one per line<textarea id="names" spellcheck="false" autocomplete="off"></textarea></label>
    <label>Wordmark
      <select id="font">
        <option value="system-ui, sans-serif">Sans</option>
        <option value="ui-serif, Georgia, serif">Serif</option>
        <option value="ui-rounded, system-ui, sans-serif">Rounded</option>
        <option value="ui-monospace, Menlo, monospace">Mono</option>
      </select>
    </label>
    <button id="case" type="button">lowercase</button>
    <button id="theme" type="button">Dark</button>
  </div>
</header>
<section>
  <p class="kicker">At 16px, side by side</p>
  <div class="strip" id="strip"></div>
</section>
<section>
  <p class="kicker">In context</p>
  <div class="cards" id="cards"></div>
</section>
<footer>Mock contexts for judgement only. Nothing on this page checks trademarks, domains, app stores or handles. Speech uses your browser's built-in voices and stays on this device.</footer>
<script>
const DATA = ${JSON.stringify(data).replace(/</g, '\\u003c')};
${analyze.toString()}
const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
let lower = false;
const known = new Map(DATA.list.map((c) => [c.name, c]));
function icon(name, size) {
  const n = el('div', 'icon', name[0].toUpperCase());
  n.style.width = n.style.height = size + 'px';
  n.style.borderRadius = Math.round(size * 0.23) + 'px';
  n.style.fontSize = Math.round(size * 0.55) + 'px';
  return n;
}
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  speechSynthesis.speak(u);
}
function render() {
  const list = $('names').value.split('\\n').map((n) => known.get(n.trim()) ?? { name: n.trim() });
  const rows = analyze(list);
  const show = (n) => (lower ? n.toLowerCase() : n);
  $('meta').textContent = rows.length + (rows.length === 1 ? ' name' : ' names') + ' · from ' + DATA.source + (DATA.idea ? ' · ' + DATA.idea : '');
  const strip = $('strip'); strip.replaceChildren();
  for (const r of rows) {
    const f = el('figure', r.flags.some((x) => x.startsWith('Same first letter')) ? 'clash' : '');
    f.append(icon(r.name, 16), el('figcaption', '', r.name));
    strip.append(f);
  }
  const cards = $('cards'); cards.replaceChildren();
  for (const r of rows) {
    const card = el('article', 'card');
    const top = el('div', 'top');
    const left = el('div');
    left.append(el('div', 'wordmark', show(r.name)));
    const bits = [r.pronunciation, r.score != null ? r.score + '/25' : null, r.letters + ' letters'].filter(Boolean);
    left.append(el('div', 'sub', bits.join(' · ')));
    const say = el('button', '', 'Say it');
    say.type = 'button';
    say.setAttribute('aria-label', 'Say ' + r.name + ' aloud');
    say.onclick = () => speak(r.name);
    top.append(left, say);
    const ctx = el('div', 'contexts');
    const home = el('div', 'home');
    home.append(icon(r.name, 60), el('div', 'label', r.name));
    const sizes = el('div', 'sizes');
    sizes.append(icon(r.name, 29), icon(r.name, 16));
    home.append(sizes);
    const right = el('div');
    const browser = el('div', 'browser');
    const tab = el('div', 'tab');
    tab.append(icon(r.name, 14), el('span', '', r.name));
    const slug = r.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bar = el('div', 'bar', slug + '.com');
    bar.append(el('small', '', 'mock · not checked'));
    browser.append(tab, bar);
    const lines = el('div', 'lines');
    lines.append(el('div', 'handle', '@' + slug));
    lines.append(el('div', '', 'Have you tried ' + r.name + '?'));
    lines.append(el('div', '', r.name + "'s new update is out."));
    lines.append(el('div', '', 'I sent it to you on ' + r.name + '.'));
    right.append(browser, lines);
    ctx.append(home, right);
    const flags = el('ul', 'flags');
    if (r.flags.length) for (const f of r.flags) flags.append(el('li', '', f));
    else flags.append(el('li', 'ok', 'Nothing flagged. Still say it aloud and read it at 16px.'));
    card.append(top, ctx, flags);
    cards.append(card);
  }
}
$('names').value = DATA.list.map((c) => c.name).join('\\n');
$('names').addEventListener('input', render);
$('font').addEventListener('change', (e) => document.documentElement.style.setProperty('--wm', e.target.value));
$('case').addEventListener('click', (e) => { lower = !lower; e.target.textContent = lower ? 'As written' : 'lowercase'; render(); });
$('theme').addEventListener('click', (e) => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  e.target.textContent = dark ? 'Light' : 'Dark';
});
document.documentElement.style.setProperty('--wm', $('font').value);
render();
</script>
</body>
</html>
`;

const args = process.argv.slice(2);
const outIndex = args.indexOf('--out');
const out = outIndex >= 0 ? args[outIndex + 1] : 'name-preview.html';
const inputs = outIndex >= 0 ? args.filter((_, i) => i !== outIndex && i !== outIndex + 1) : args;
if (!inputs.length) {
  console.error('Usage: node preview.mjs naming_candidates.json [--out preview.html]\n       node preview.mjs Name1 Name2 … [--out preview.html]');
  process.exit(2);
}
let data;
try {
  data = await load(inputs);
} catch (e) {
  console.error(`Could not read input: ${e.message}`);
  process.exit(2);
}
await writeFile(resolve(out), page(data));
console.log(`Name in context: ${data.list.length} names from ${data.source}\n`);
for (const r of analyze(data.list)) {
  console.log(`${r.name}${r.flags.length ? '' : '  (nothing flagged)'}`);
  for (const f of r.flags) console.log(`  · ${f}`);
}
console.log(`\nWrote ${out}. Open it in a browser; it works offline.`);

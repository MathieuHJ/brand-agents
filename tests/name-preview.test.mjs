import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('..', import.meta.url));
const script = join(root, 'skills/name-in-context/scripts/preview.mjs');
async function generate(names, check) {
  const dir = await mkdtemp(join(tmpdir(), 'name-preview-'));
  try {
    const out = join(dir, 'preview.html');
    const log = execFileSync(process.execPath, [script, ...names, '--out', out], { encoding: 'utf8' });
    await check(await readFile(out, 'utf8'), log);
  } finally { await rm(dir, { recursive: true, force: true }); }
}

test('untrusted names stay data, never HTML or executable script', async () => {
  const name = '</script><img src=https://example.invalid onerror=alert(1)> & "quote"';
  await generate([name, 'Numo'], (html) => {
    assert.equal((html.match(/<script>/g) ?? []).length, 1);
    assert.equal((html.match(/<\/script>/g) ?? []).length, 1);
    assert.ok(!html.includes('<img'));
    const js = html.match(/<script>\n([\s\S]*)<\/script>/)[1];
    new vm.Script(js);
    const dataLine = js.split('\n')[0].replace('const DATA = ', '').replace(/;$/, '');
    assert.equal(JSON.parse(dataLine).list[0].name, name);
    assert.doesNotMatch(html, /(?:src|href)\s*=\s*["']https?:|fetch\(|XMLHttpRequest|innerHTML\s*=/);
  });
});

test('shared initials are advisory, not a rendered-pixel claim', async () => {
  await generate(['Numo', 'Nova', 'rn'], (html, log) => {
    assert.match(log, /shared initial; compare the rendered samples/);
    assert.doesNotMatch(log, /identical monogram/);
    assert.match(log, /can blur together/);
    assert.match(html, /not Windows ClearType or OS scaling/);
  });
});

test('checked-in offline example matches the generator', async () => {
  await generate([join(root, 'brands/test_project/naming_candidates.json')], async (html) => {
    assert.equal(html, await readFile(join(root, 'brands/test_project/name_preview.html'), 'utf8'));
  });
});

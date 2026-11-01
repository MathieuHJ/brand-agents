// Optional browser regression suite: requires Playwright and Chromium in the test environment.
// NODE_PATH=/path/to/node_modules CHROMIUM_PATH=/path/to/chromium node tests/name-preview.browser.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { resolve } = require('node:path');
const { readFileSync } = require('node:fs');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, headless: true, args: ['--no-sandbox'] });
  try {
    for (const deviceScaleFactor of [1, 1.25]) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor });
      const page = await context.newPage();
      const errors = [], requests = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('request', r => { if (/^https?:/.test(r.url())) requests.push(r.url()); });
      const html = readFileSync(resolve(__dirname, '../brands/test_project/name_preview.html'), 'utf8');
      await page.setContent(html);
      assert.equal(await page.locator('#strip figure').count(), 10);
      const sample = () => page.locator('#strip .sample.light canvas').first().evaluate(c => ({
        pixels: c.toDataURL(), width: c.width, css: c.getBoundingClientRect().width,
        colors: new Set(Array.from(c.getContext('2d').getImageData(0, 0, c.width, c.height).data)).size
      }));
      for (let cycle = 0; cycle < 2; cycle++) {
        for (const density of ['1', '1.25']) {
          await page.selectOption('#density', density);
          for (let font = 0; font < 4; font++) {
            await page.selectOption('#font', { index: font });
            const upper = await sample();
            assert.equal(upper.width, Math.round(16 * Number(density)));
            assert.equal(upper.css, 16);
            assert.ok(upper.colors > 2, 'raster includes antialiased pixels');
            await page.locator('#case').focus();
            await page.keyboard.press('Enter');
            assert.equal(await page.locator('#case').getAttribute('aria-pressed'), 'true');
            assert.notEqual((await sample()).pixels, upper.pixels, 'case redraws raster');
            assert.equal(await page.locator('.home .icon').first().textContent(), 'n');
            await page.keyboard.press('Space');
            assert.equal((await sample()).pixels, upper.pixels, 'case toggles back exactly');
            const dark = await page.locator('#strip .sample.dark canvas').first().evaluate(c => c.toDataURL());
            assert.notEqual(dark, upper.pixels);
            await page.locator('#theme').click();
            assert.equal((await sample()).pixels, upper.pixels, 'paired samples stay stable across page themes');
            await page.locator('#theme').click();
          }
        }
      }
      await page.selectOption('#font', { index: 0 }); const sans = (await sample()).pixels;
      await page.selectOption('#font', { index: 1 }); assert.notEqual((await sample()).pixels, sans, 'font redraws raster');
      const hostile = '</script><img src=https://example.invalid onerror=alert(1)>';
      await page.fill('#names', 'Numo\nNova\n' + hostile + '\nÉlan');
      assert.equal(await page.locator('#strip figure').count(), 4);
      assert.equal(await page.locator('img').count(), 0);
      await page.fill('#names', ''); assert.equal(await page.locator('#strip figure').count(), 0);
      await page.goto('about:blank');
      await page.setContent(html);
      for (const width of [1280, 375, 320]) {
        await page.setViewportSize({ width, height: 900 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow at ' + width);
        await page.selectOption('#density', '1.25');
        await page.screenshot({ path: '/tmp/name-preview-' + deviceScaleFactor + '-' + width + '.png', fullPage: true });
      }
      await page.locator('#theme').click();
      await page.locator('#case').click();
      await page.selectOption('#font', { index: 1 });
      await page.screenshot({ path: '/tmp/name-preview-dark-' + deviceScaleFactor + '.png' });
      assert.deepEqual(requests, []);
      assert.deepEqual(errors, []);
      await context.close();
    }
    console.log('PASS: browser rasters, 2 densities, 4 fonts, case/theme/keyboard cycles, edits, reload, narrow layouts, no external requests or errors.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

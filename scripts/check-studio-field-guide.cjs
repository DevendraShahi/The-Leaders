const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
(async () => {
  const { createServer } = await import('vite');
  const server = await createServer({ configFile: path.resolve('src/test/field-guide-preview/vite.config.ts') });
  await server.listen();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const root = path.resolve('public/studio/template-guide');
    const manifest = JSON.parse(await fs.readFile(path.join(root, 'manifest.json'), 'utf8'));
    const page = await browser.newPage({ viewport: { width: 1450, height: 1000 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4187/');
    await page.waitForFunction(() => typeof window.renderTemplateExample === 'function');
    for (let index = 0; index < manifest.examples.length; index++) {
      await page.evaluate(index => window.renderTemplateExample(index), index);
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
      await page.waitForFunction(() => !document.querySelector('[data-text-ready="false"]'));
      await page.getByTestId('post-artwork').screenshot({ path: path.join(root, 'previews', `${manifest.examples[index].id}.jpg`), type: 'jpeg', quality: 90 });
      manifest.examples[index].regions = await page.evaluate(() => window.checkTemplateExample().regions);
      assert(manifest.examples[index].regions.length > 0, 'Every example needs section highlights.');
    }
    await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    await fs.writeFile(path.join(root, 'data.js'), 'window.STUDIO_GUIDE_DATA = ' + JSON.stringify(manifest).replace(/</g, '\\u003c') + ';\n');
    await page.goto('http://127.0.0.1:4187/studio/template-guide/index.html');
    for (const example of manifest.examples) {
      await page.locator(`button[data-id="${example.id}"]`).click();
      await page.waitForFunction(title => document.querySelector('#title').textContent === title, example.title);
      assert.equal(await page.locator('#title').textContent(), example.title);
      assert(await page.locator('.field').count() > 0);
      await page.locator('#preview').evaluate(image => image.decode());
      const response = await page.request.get('http://127.0.0.1:4187/studio/template-guide/samples/' + example.id + '.json');
      assert(response.ok()); assert.deepEqual(await response.json(), example.response);
      const section = page.locator('#sections button').first();
      await section.click(); assert.equal(await section.getAttribute('aria-pressed'), 'true');
    }
    await page.goto('http://127.0.0.1:4187/studio/template-guide/index.html#scorecard');
    await page.locator('#preview').evaluate(image => image.decode());
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(root, 'guide-desktop.png') });
    for (const width of [320, 390, 768, 1280, 1450]) {
      await page.setViewportSize({ width, height: 900 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Guide overflow at ${width}px`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(root, 'guide-mobile.png') });
    await page.goto('http://127.0.0.1:4187/studio/template-guide/index.html#not-a-template');
    assert.equal(await page.locator('#title').textContent(), manifest.examples[0].title);
    await page.locator('#search').fill('wicket'); assert(await page.locator('.nav-item').count() > 0);
    await page.locator('#search').fill('no such template xyz'); assert.equal(await page.locator('.nav-item').count(), 0);
    await page.goto('http://127.0.0.1:4187/studio/template-guide/gallery.html');
    await page.setViewportSize({ width: 1450, height: 1000 });
    await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
    assert.equal(await page.locator('.gallery a').count(), 18);
    await page.screenshot({ path: path.join(root, 'overview.png'), fullPage: true });
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ examples: manifest.examples.length, linksAndJson: 'passed', sectionHighlights: 'passed', widths: [320, 390, 768, 1280, 1450], browserErrors: errors }));
  } finally { await browser.close(); await server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

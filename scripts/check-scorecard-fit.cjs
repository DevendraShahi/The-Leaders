const path = require('node:path');
const fs = require('node:fs/promises');
const { chromium } = require('@playwright/test');
(async () => {
  const { createServer } = await import('vite');
  const server = await createServer({ configFile: path.resolve('src/test/field-guide-preview/vite.config.ts') });
  await server.listen();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const failures = [], errors = [];
  let cases = 0, exports = 0;
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4187/');
    await page.waitForFunction(() => !!window.renderTemplateExample);
    const manifest = JSON.parse(await fs.readFile('public/studio/template-guide/manifest.json', 'utf8'));
    const index = manifest.examples.findIndex(example => example.id === 'scorecard');
    for (const format of ['portrait', 'square', 'story', 'landscape']) for (const language of ['en', 'ne']) for (const paper of [false, true]) for (const rows of [[11, 6], [11, 11], [3, 2]]) {
      await page.evaluate(({ index, format, language, paper, rows }) => window.renderTemplateExample(index, format, language, paper, false, rows), { index, format, language, paper, rows });
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.waitForFunction(() => !document.querySelector('[data-text-ready="false"]'), null, { timeout: 5000 }).catch(async () => { throw new Error(JSON.stringify({ format, language, paper, rows, pending: await page.locator('[data-text-ready="false"]').evaluateAll(nodes => nodes.map(node => ({ text: node.textContent, w: node.clientWidth, h: node.clientHeight }))) })); });
      const result = await page.evaluate(() => window.checkTemplateExample());
      cases++;
      if (result.error || result.overflow.length) failures.push({ format, language, paper, rows, error: result.error, overflow: result.overflow });
      else if (rows[0] === 11 && rows[1] === 11 && !paper) { await page.evaluate(() => window.exportTemplateExample()); exports++; }
      // Manual re-fit must recover corrupted slot sizing without editing post data.
      if (process.argv.includes('--manual')) {
        await page.evaluate(() => { const root = document.querySelector('[data-managed-layout]'); root.querySelectorAll('[data-export-fit]').forEach(node => { node.style.fontSize = '120px'; }); root.dispatchEvent(new Event('studio:refit')); });
        await page.waitForFunction(() => !document.querySelector('[data-text-ready="false"]'));
        const refit = await page.evaluate(() => window.checkTemplateExample());
        if (refit.overflow.length) failures.push({ format, language, rows, manual: refit.overflow });
      }
      if (format === 'portrait' && language === 'en' && !paper && rows[1] === 6) await page.getByTestId('post-artwork').screenshot({ path: '/tmp/scorecard-fit.png' });
    }
    await fs.writeFile('/tmp/scorecard-fit-audit.json', JSON.stringify({ cases, exports, failures, errors }, null, 2));
    console.log(JSON.stringify({ cases, exports, failures: failures.length, errors, examples: failures.slice(0, 3) }, null, 2));
    if (failures.length || errors.length) process.exitCode = 1;
  } finally { await browser.close(); await server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

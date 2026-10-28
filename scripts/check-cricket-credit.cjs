const path = require('node:path');
const fs = require('node:fs/promises');
const { chromium } = require('@playwright/test');
(async () => {
  const { createServer } = await import('vite');
  const server = await createServer({ configFile: path.resolve('src/test/field-guide-preview/vite.config.ts') });
  await server.listen();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const failures = [], errors = []; let cases = 0, exports = 0;
  try {
    const manifest = JSON.parse(await fs.readFile('public/studio/template-guide/manifest.json', 'utf8'));
    const page = await browser.newPage({ viewport: { width: 1100, height: 1000 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4187/');
    await page.waitForFunction(() => typeof window.renderTemplateExample === 'function');
    for (let index = 0; index < manifest.examples.length; index++) {
      const example = manifest.examples[index]; if (!example.design.cricket) continue;
      for (const format of ['portrait', 'square', 'story', 'landscape']) for (const language of ['en', 'ne']) for (const paper of [false, true]) {
        await page.evaluate(({ index, format, language, paper }) => window.renderTemplateExample(index, format, language, paper), { index, format, language, paper });
        await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
        await page.waitForFunction(() => !document.querySelector('[data-text-ready="false"]'));
        const check = await page.evaluate(() => {
          const result = window.checkTemplateExample();
          const credit = document.querySelector('[data-testid="echo11-credit"]');
          const content = document.querySelector('[data-credit-content],[data-credit-flow]');
          const band = credit?.getBoundingClientRect(), body = content?.getBoundingClientRect();
          return { ...result, missingCredit: !credit || credit.getAttribute('aria-label') !== 'echo11 · Web development agency', overlaps: !!(body && band && body.bottom > band.top + 1) };
        });
        cases++;
        if (check.error || check.overflow.length || check.missingCredit || check.overlaps) failures.push({ id: example.id, format, language, paper, ...check });
        if (!check.error && !check.overflow.length && format === 'portrait' && language === 'en' && !paper && ['wicket', 'result', 'scorecard', 'matchday'].includes(example.id)) {
          const png = await page.evaluate(() => window.exportTemplateExample(true));
          await fs.writeFile(`/tmp/cricket-echo11-${example.id}.png`, Buffer.from(png.dataUrl.split(',')[1], 'base64')); exports++;
        }
      }
    }
    await fs.writeFile('/tmp/cricket-echo11-audit.json', JSON.stringify({ cases, exports, failures, errors }, null, 2));
    console.log(JSON.stringify({ cases, exports, failures: failures.map(({ id, format, language, paper, error, overflow, overlaps, missingCredit }) => ({ id, format, language, paper, error, overflow, overlaps, missingCredit })), errors }, null, 2));
    if (failures.length || errors.length) process.exitCode = 1;
  } finally { await browser.close(); await server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

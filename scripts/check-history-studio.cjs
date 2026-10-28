const path = require('node:path');
const fs = require('node:fs/promises');
const { chromium } = require('@playwright/test');
const sharp = require('sharp');
(async () => {
  const { createServer } = await import('vite');
  const server = await createServer({ configFile: path.resolve('src/test/history-preview/vite.config.ts') });
  await server.listen();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const failures = [], errors = [], screenshots = [];
  let cases = 0, exports = 0;
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 1 });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4189/');
    await page.waitForFunction(() => typeof window.renderHistoryExample === 'function');
    const formats = ['square', 'portrait', 'story', 'landscape'];
    for (const paragraph of [false, true]) for (const stress of [false, true]) for (const format of formats) for (const language of ['en', 'ne']) {
      await page.evaluate(({ format, language, stress, paragraph }) => window.renderHistoryExample('on-this-day', format, language, stress, stress, paragraph), { format, language, stress, paragraph });
      await page.evaluate(async () => { await Promise.all(['Lora_700Bold', 'Lora_400Regular', 'Hind_700Bold'].map(font => document.fonts.load(`16px ${font}`))); await document.fonts.ready; });
      await page.waitForFunction(() => !document.querySelector('[data-text-ready="false"],[data-photo-ready="false"]'));
      const check = await page.evaluate(() => window.checkHistoryExample());
      cases++;
      if (check.error || check.overflow.length || !check.fonts) failures.push({ paragraph, stress, format, language, ...check });
      if (!stress && !check.error && !check.overflow.length && ['portrait', 'landscape'].includes(format)) {
        try {
          const data = await page.evaluate(() => window.exportHistoryExample());
          const output = `/tmp/history-${paragraph ? 'paragraph' : 'cover'}-${format}-${language}.png`;
          const buffer = Buffer.from(data.split(',')[1], 'base64');
          await fs.writeFile(output, buffer);
          const meta = await sharp(buffer).metadata();
          const size = format === 'portrait' ? [1080, 1350] : [1920, 1080];
          if (meta.width !== size[0] || meta.height !== size[1]) failures.push({ paragraph, format, language, incorrectPngSize: meta });
          const pixel = await sharp(buffer).extract({ left: 10, top: 10, width: 1, height: 1 }).removeAlpha().raw().toBuffer();
          if (pixel[0] < 200 || pixel[1] < 190 || pixel[2] < 175) failures.push({ paragraph, format, language, incorrectPaperBackground: [...pixel] });
          screenshots.push(output); exports++;
        } catch (error) { failures.push({ paragraph, format, language, exportError: error.message }); }
      }
    }
    for (const desk of ['desk', 'cricket']) {
      await page.goto(`http://127.0.0.1:4189/?${desk}=1`);
      for (const theme of ['light', 'dark']) for (const width of [1280, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
        await page.locator('select').first().waitFor();
        await page.evaluate(() => document.fonts.ready);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
        if (overflow) failures.push({ desk, theme, width, overflow: true });
        const select = page.locator('select').nth(desk === 'desk' ? 0 : 1);
        const control = await select.evaluate(node => ({ height: node.getBoundingClientRect().height, color: getComputedStyle(node).color, background: getComputedStyle(node).backgroundColor, border: getComputedStyle(node).borderRadius }));
        if (control.height < 44 || control.border === '0px') failures.push({ desk, theme, width, badSelect: control });
        await select.click();
        await page.screenshot({ path: `/tmp/studio-dropdown-${desk}-${theme}-${width}.png` });
        await select.press('Escape');
        if (desk === 'desk') {
          await select.selectOption('ne');
          if (await select.inputValue() !== 'ne') failures.push({ desk, theme, width, selectionFailed: true });
          await select.selectOption('en');
        }
        await page.screenshot({ path: `/tmp/history-${desk}-${theme}-${width}.png` });
      }
    }
    const report = { cases, exports, failures, errors, screenshots };
    await fs.writeFile('/tmp/history-studio-audit.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    if (failures.length || errors.length) process.exitCode = 1;
  } finally { await browser.close(); await server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

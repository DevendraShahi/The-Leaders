const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('@playwright/test');

(async () => {
  const { createServer } = await import('vite');
  const server = await createServer({ configFile: path.resolve('src/test/field-guide-preview/vite.config.ts') });
  await server.listen();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const root = path.resolve('public/studio/template-guide');
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'manifest.json'), 'utf8'));
  const withoutSummary = process.argv.includes('--without-summary');
  const withoutMetadata = process.argv.includes('--without-metadata');
  const failures = [], errors = [];
  let cases = 0, exports = 0;
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 2 });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4187/' + (process.argv.includes('--short-wicket') ? '?short-wicket=1' : ''));
    await page.waitForFunction(() => typeof window.renderTemplateExample === 'function');
    for (let index = 0; index < manifest.examples.length; index++) {
      const example = manifest.examples[index];
      const only = process.argv.find(arg => arg.startsWith('--only='))?.slice(7);
      if (only && !only.split(',').includes(example.id)) continue;
      const formats = example.design.cricket ? ['portrait', 'square', 'story', 'landscape'] : ['portrait'];
      for (const format of formats) for (const language of example.design.cricket ? ['en', 'ne'] : ['en']) for (const paper of example.design.cricket ? [false, true] : [false]) {
        await page.evaluate(({ index, format, language, paper, withoutMetadata, withoutSummary }) => window.renderTemplateExample(index, format, language, paper, withoutMetadata, undefined, withoutSummary), { index, format, language, paper, withoutMetadata, withoutSummary });
        await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await page.waitForFunction(() => !document.querySelector('[data-text-ready="false"]'), null, { timeout: 5000 }).catch(async () => { throw new Error(JSON.stringify({ id: example.id, format, language, pending: await page.locator('[data-text-ready="false"]').evaluateAll(nodes => nodes.map(node => ({ text: node.textContent, width: node.clientWidth, height: node.clientHeight, cls: node.className }))) })); });
        const result = await page.evaluate(() => window.checkTemplateExample());
        if (result.error || result.overflow.length) failures.push({ id: example.id, format, language, paper, ...result });
        const letterOverflow = await page.evaluate(() => [...document.querySelectorAll('svg[data-event-letter]')].flatMap(svg => {
          const canvas = document.createElement('canvas'), context = canvas.getContext('2d'), view = svg.viewBox.baseVal;
          // SVG getBBox includes unused font ascender/descender space; check painted ink instead.
          const bounds = [...svg.querySelectorAll('text')].map(text => {
            const style = getComputedStyle(text);
            context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            const metrics = context.measureText(text.textContent), scale = text.textLength.baseVal.value / metrics.width;
            const x = text.x.baseVal.getItem(0).value, y = text.y.baseVal.getItem(0).value;
            return { left: x - metrics.actualBoundingBoxLeft * scale, right: x + metrics.actualBoundingBoxRight * scale, top: y - metrics.actualBoundingBoxAscent, bottom: y + metrics.actualBoundingBoxDescent };
          });
          return bounds.some(box => box.left < -1 || box.top < -1 || box.right > view.width + 1 || box.bottom > view.height + 1) ? [{ value: svg.dataset.eventLetter, bounds }] : [];
        }));
        if (letterOverflow.length) failures.push({ id: example.id, format, language, paper, letterOverflow });
        cases++;
        if (example.design.cricket && (language === 'en' || process.argv.includes('--export-nepali')) && !paper && result.regions.length && !result.error && !result.overflow.length) {
          try {
            const exported = await page.evaluate(include => window.exportTemplateExample(include), process.argv.includes('--save-export'));
            if (exported.dataUrl) await fs.writeFile(`/tmp/studio-${example.id}-${format}-${language}.png`, Buffer.from(exported.dataUrl.split(',')[1], 'base64'));
            const sizes = { portrait: [1080, 1350], square: [1080, 1080], story: [1080, 1920], landscape: [1920, 1080] }[format];
            if (exported.width !== sizes[0] || exported.height !== sizes[1] || !exported.bytes) throw new Error('Incorrect export dimensions or empty PNG.');
            exports++;
          } catch (error) { failures.push({ id: example.id, format, exportError: error.message }); }
        }
        if (!withoutMetadata && !withoutSummary && format === 'portrait' && language === 'en' && !paper) {
          example.regions = result.regions;
          await page.getByTestId('post-artwork').screenshot({ path: path.join(root, 'previews', `${example.id}.jpg`), type: 'jpeg', quality: 90 });
        }
      }
      console.log('Checked ' + example.id);
    }
    if (!withoutMetadata && !withoutSummary) await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    if (!withoutMetadata && !withoutSummary) await fs.writeFile(path.join(root, 'data.js'), 'window.STUDIO_GUIDE_DATA = ' + JSON.stringify(manifest).replace(/</g, '\\u003c') + ';\n');
    await fs.writeFile(withoutSummary ? '/tmp/studio-without-summary-audit.json' : withoutMetadata ? '/tmp/studio-without-metadata-audit.json' : '/tmp/studio-field-guide-audit.json', JSON.stringify({ cases, exports, failures, errors }, null, 2));
    console.log(JSON.stringify({ cases, exports, failures: failures.length, errors, examples: failures.slice(0, 8) }, null, 2));
  } finally { await browser.close(); await server.close(); }
  if (failures.length || errors.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });

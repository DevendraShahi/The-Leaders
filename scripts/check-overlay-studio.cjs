const path = require('node:path');
const fs = require('node:fs/promises');
const { execFileSync, spawnSync } = require('node:child_process');
const { chromium } = require('@playwright/test');
const sharp = require('sharp');
(async () => {
  execFileSync('/opt/homebrew/bin/ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=size=640x360:rate=30', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000', '-t', '2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '/tmp/leaders-overlay-input.mp4']);
  const { createServer } = await import('vite');
  const server = await createServer({ configFile: path.resolve('src/test/overlay-preview/vite.config.ts') });
  await server.listen();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [], cases = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 1100 }, acceptDownloads: true });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4191');
    await page.getByRole('button', { name: 'Download transparent overlay PNG' }).waitFor();
    await page.getByRole('button', { name: 'Download transparent overlay PNG' }).waitFor();
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent.includes('Download transparent overlay PNG') && !button.disabled));
    await page.locator('input[type=file]').setInputFiles(path.resolve('public/studio/cricket/backgrounds/stadium-01.jpg'));
    await page.getByLabel('Headline · optional').fill('Stories that bring us closer.');
    await page.getByLabel('Label · optional', { exact: true }).fill('THE LEADERS');
    await page.getByLabel('Photo / video credit · optional').fill('Photo: The Leaders');
    await page.locator('summary[aria-label="Canvas & crop"]').click();
    for (const [template, name] of [['signature', 'Signature'], ['lower-third', 'News lower third'], ['editorial', 'Editorial']]) {
      await page.getByRole('button', { name: new RegExp(`^${name}`) }).click();
      for (const format of ['original', 'square', 'portrait', 'story', 'landscape']) for (const ne of [false, true]) {
        if (template !== 'signature') await page.getByLabel('Headline · optional').fill(ne ? 'समाचारको केन्द्रमा तपाईं, हरेक कथामा हामी' : 'Stories that bring us closer.');
        await page.locator('select').nth(1).selectOption(format);
        const state = await page.locator('canvas').evaluate(canvas => ({ w: canvas.width, h: canvas.height, nonempty: canvas.getContext('2d').getImageData(60, 60, 1, 1).data[3] > 0 }));
        if (!state.nonempty) throw new Error(`Blank preview: ${template}/${format}/${ne}`);
        cases.push({ template, format, ne, ...state });
      }
    }
    await page.getByRole('button', { name: /^Editorial/ }).click();
    await page.locator('select').nth(1).selectOption('portrait');
    await page.getByLabel('Headline · optional').fill('Stories that bring us closer.');
    const photoDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export branded photo', exact: true }).click();
    const photo = await photoDownload; await photo.saveAs('/tmp/leaders-overlay-photo.png');
    const meta = await sharp('/tmp/leaders-overlay-photo.png').metadata();
    if (meta.width !== 1080 || meta.height !== 1350) throw new Error('Wrong photo export dimensions');
    const transparentDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download transparent overlay PNG' }).click();
    await (await transparentDownload).saveAs('/tmp/leaders-overlay-transparent.png');
    const alpha = await sharp('/tmp/leaders-overlay-transparent.png').extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer();
    if (alpha[3] !== 0) throw new Error('Overlay PNG background is not transparent');
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: '/tmp/leaders-overlay-studio.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Mobile layout overflows horizontally');
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: '/tmp/leaders-overlay-mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1400, height: 1100 });
    await page.locator('input[type=file]').setInputFiles('/tmp/leaders-overlay-input.mp4');
    await page.getByRole('button', { name: 'Export branded video', exact: true }).waitFor();
    await page.locator('select').nth(1).selectOption('original');
    const videoDownload = page.waitForEvent('download', { timeout: 30000 });
    await page.getByRole('button', { name: 'Export branded video', exact: true }).click();
    const clip = await videoDownload, extension = clip.suggestedFilename().split('.').pop();
    const videoPath = `/tmp/leaders-overlay-video.${extension}`; await clip.saveAs(videoPath);
    const probe = JSON.parse(execFileSync('/opt/homebrew/bin/ffprobe', ['-v', 'quiet', '-show_streams', '-show_format', '-of', 'json', videoPath], { encoding: 'utf8' }));
    const picture = probe.streams.find(item => item.codec_type === 'video'), audio = probe.streams.find(item => item.codec_type === 'audio');
    if (!picture || picture.width !== 640 || picture.height !== 360 || !audio || Number(probe.format.duration) < 1.8) throw new Error(`Bad recorded video ${JSON.stringify(probe)}`);
    const volume = spawnSync('/opt/homebrew/bin/ffmpeg', ['-hide_banner', '-i', videoPath, '-af', 'volumedetect', '-vn', '-sn', '-dn', '-f', 'null', '-'], { encoding: 'utf8' });
    const meanVolume = Number(volume.stderr.match(/mean_volume: ([-.0-9]+)/)?.[1] ?? '-100');
    if (meanVolume < -50) throw new Error('Source audio was lost or muted during export');
    // Export can be cancelled and controls recover for another edit.
    await page.getByRole('button', { name: 'Export branded video', exact: true }).click();
    await page.getByRole('button', { name: 'Cancel export', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Export cancelled' }).waitFor();
    await page.getByRole('button', { name: 'Export branded video', exact: true }).waitFor({ state: 'visible' });
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(JSON.stringify({ cases: cases.length, photo: [meta.width, meta.height], transparent: alpha[3], video: { path: videoPath, width: picture.width, height: picture.height, audio: audio.codec_name, meanVolume, duration: probe.format.duration }, mobileOverflow: false, cancellation: 'passed', errors }, null, 2));
  } finally { await browser.close(); await server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

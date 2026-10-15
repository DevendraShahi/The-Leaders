const { test } = require('node:test');
const assert = require('node:assert/strict');
const { unzipSync, strFromU8 } = require('fflate');
const load = require('./load-ts.cjs')({ '@react-native-async-storage/async-storage': { getItem: async () => null, setItem: async () => {} } });
const { packageCarousel, carouselEntries } = load('src/features/daily-social/package.ts');
const edition = { id: 'edition1', date: '2026-10-14', edition: 'morning', title: { en: 'Morning', ne: 'बिहान' }, caption: { en: 'English caption', ne: 'नेपाली क्याप्सन' }, sources: [{ name: 'Source', url: 'https://example.test/report' }], slides: [{ section: 'headlines', headline: { en: 'Headline', ne: 'समाचार' }, body: { en: 'Body', ne: 'विवरण' } }] };
test('ZIP preserves language folders, numbered image bytes, captions and sources', () => {
    const png = new Uint8Array([137, 80, 78, 71]);
    const files = unzipSync(packageCarousel(edition, { 'ne/01.png': png, 'en/01.png': png }, 'both'));
    assert.deepEqual(files['ne/01.png'], png);
    assert.equal(strFromU8(files['ne/caption.txt']), edition.caption.ne);
    assert.equal(strFromU8(files['en/caption.txt']), edition.caption.en);
    assert.match(strFromU8(files['sources.txt']), /https:\/\/example.test\/report/);
    const nepali = unzipSync(packageCarousel(edition, { 'ne/01.png': png }, 'ne'));
    assert.equal(nepali['en/caption.txt'], undefined);
});
test('carousel entries put cover first and number each selected language independently', async () => {
    const entries = await carouselEntries('export-test', edition, 'both');
    assert.deepEqual(entries.map(entry => entry.path), ['ne/01.png', 'ne/02.png', 'en/01.png', 'en/02.png']);
    assert.equal(entries[0].draft.design.headline, 'बिहान');
    assert.equal(entries[2].draft.design.headline, 'Morning');
    const english = await carouselEntries('export-test', edition, 'en');
    assert.deepEqual(english.map(entry => entry.path), ['en/01.png', 'en/02.png']);
});

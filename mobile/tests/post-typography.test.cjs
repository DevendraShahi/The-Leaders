const { test } = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-ts.cjs')();
const { defaultPostDesign } = load('src/features/post-designer/types.ts');
const { textTypographyStyle } = load('src/features/post-designer/typography.ts');
test('Nepali glyphs retain safe leading and untracked shaping across formats and font choices', () => {
    for (const format of ['square', 'portrait', 'story', 'landscape']) {
        for (const font of ['auto', 'onest', 'hind']) {
            const design = { ...defaultPostDesign, format, headline: 'बाहिर निस्कनुअघि: आजको मौसम', summary: 'यात्राअघि पछिल्लो पूर्वानुमान हेर्नुहोस्।', textTypography: { ...defaultPostDesign.textTypography, headline: { font, size: 100, lineSpacing: 90, shadow: 0 } } };
            const headline = textTypographyStyle(design, 'headline');
            assert.match(headline.fontFamily, /Hind/);
            assert.ok(headline.lineHeight >= headline.fontSize * 1.5);
            assert.equal(headline.letterSpacing, 0);
            const body = textTypographyStyle(design, 'supporting');
            assert.ok(body.lineHeight >= body.fontSize * 1.6);
            assert.match(textTypographyStyle(design, 'kicker', 'मौसम').fontFamily, /Hind/);
        }
    }
});
test('English auto typography keeps its existing font and spacing', () => {
    const style = textTypographyStyle({ ...defaultPostDesign, headline: 'Today’s weather' }, 'headline');
    assert.match(style.fontFamily, /Onest/);
    assert.equal(style.lineHeight, 31);
    assert.equal(style.letterSpacing, undefined);
});

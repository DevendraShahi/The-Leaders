const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const system = require('../src/theme/design-system.json');
function load(relative) {
    const filename = path.resolve(__dirname, '..', relative);
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
    const module = { exports: {} };
    new Function('require', 'module', 'exports', compiled)((id) => id === '@/theme/tokens' ? tokens : id.endsWith('design-system.json') ? system : require(id), module, module.exports);
    return module.exports;
}
const tokens = load('src/theme/tokens.ts');
const editorial = load('src/utils/editorial.ts');
function luminance(hex) {
    const channels = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4);
    return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
}
function contrast(a,b) { const values=[luminance(a),luminance(b)].sort((a,b)=>b-a); return (values[0]+.05)/(values[1]+.05); }
test('normal text and brand accents have AA contrast on every app surface', () => {
    for (const scheme of ['light','dark']) {
        const colors=tokens.colorsFor(scheme);
        for (const surface of ['background','surface','surfaceSecondary','surfaceElevated']) {
            for (const ink of ['textPrimary','textSecondary','textTertiary','brandRed']) {
                assert.ok(contrast(colors[ink],colors[surface]) >= 4.5, `${scheme}: ${ink} on ${surface}`);
            }
        }
        for (const action of ['primary','destructive']) assert.ok(contrast(colors.onPrimary,colors[action])>=4.5, `${scheme}: ${action} label`);
    }
});
test('a single brand edit propagates to native colors, utility variables and dark accents', () => {
    const original=system.brand.red;
    const originalSofts = Object.fromEntries(["light", "dark"].map(scheme => [scheme, tokens.colorsFor(scheme).brandRedSoft]));
    try {
        system.brand.red='#123456';
        for (const scheme of ['light','dark']) {
            const colors=tokens.colorsFor(scheme);
            assert.equal(colors.primary,'#123456');
            assert.equal(tokens.themeVariables(colors)['--primary'],'18 52 86');
            assert.notEqual(colors.brandRedSoft,originalSofts[scheme]);
        }
    } finally { system.brand.red=original; }
});
test('every Tailwind semantic color variable is provided by the runtime theme', () => {
    const config=fs.readFileSync(path.resolve(__dirname,'../tailwind.config.js'),'utf8');
    for (const scheme of ['light','dark']) {
        const vars=tokens.themeVariables(tokens.colorsFor(scheme));
        for (const [,name] of config.matchAll(/var\((--[\w-]+)\)/g)) assert.ok(vars[name], `${scheme}: missing ${name}`);
    }
});
test('small phones retain useful story width and minimum control targets', () => {
    assert.ok(tokens.layout.touchTarget>=44);
    assert.ok(320-2*tokens.spacing.gutter-tokens.layout.thumbnailWidth-tokens.layout.rowGap>=160);
    assert.ok(320/5>=tokens.layout.touchTarget);
    assert.ok(tokens.layout.readerMaxWidth<=tokens.layout.contentMaxWidth);
    for (const token of Object.values(tokens.typography)) assert.ok(token.lineHeight>=token.size*1.15);
});
test('breaking labels expire; invalid and future dates cannot become breaking', () => {
    const now=Date.parse('2026-10-12T16:00:00Z');
    assert.equal(editorial.isRecentBreaking('2026-10-12T15:00:00Z',now),true);
    assert.equal(editorial.isRecentBreaking('2026-10-10T15:00:00Z',now),false);
    assert.equal(editorial.isRecentBreaking('bad date',now),false);
    assert.equal(editorial.isRecentBreaking('2026-10-13T15:00:00Z',now),false);
    assert.ok(!editorial.storyDate('2026-01-01T15:00:00Z','en',now).includes('ago'));
    assert.equal(editorial.storyDate('bad date','ne',now),'');
});
test('every design-system font face is actually loaded by the app', () => {
    const layout=fs.readFileSync(path.resolve(__dirname,'../app/_layout.tsx'),'utf8');
    for (const family of [...Object.values(system.fonts), ...Object.values(system.editorialFonts)]) for (const face of Object.values(family)) assert.ok(layout.includes(face), `Unloaded font: ${face}`);
});

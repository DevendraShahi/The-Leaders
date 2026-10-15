const { test } = require('node:test');
const assert = require('node:assert/strict');
const loader = require('./load-ts.cjs');
function fixture() {
    const data = new Map();
    const storage = { getItem: async key => data.get(key) ?? null, setItem: async (key, value) => { data.set(key, value); } };
    const load = loader({ '@react-native-async-storage/async-storage': storage });
    return { data, storage, ...load('src/features/post-designer/drafts.ts') };
}
test('drafts reopen their complete designs and stay isolated by account', async () => {
    const f = fixture(), a = await f.createDraft('admin-a', 'First'), b = await f.createDraft('admin-a', 'Second');
    await f.updateDraft('admin-a', a.id, { design: { ...a.design, headline: 'Distinct', format: 'portrait', lockedLayers: ['footer'], imageUri: 'file:///photo.jpg' } });
    assert.equal((await f.readDraft('admin-a', a.id)).design.headline, 'Distinct');
    assert.equal((await f.readDraft('admin-a', b.id)).design.format, 'square');
    assert.deepEqual(await f.listDrafts('admin-b'), []);
    await assert.rejects(f.readDraft('admin-b', a.id));
});
test('concurrent save and rename preserve both changes', async () => {
    const f = fixture(), a = await f.createDraft('admin', 'Initial');
    await Promise.all([f.updateDraft('admin', a.id, { design: { ...a.design, headline: 'New headline' } }), f.updateDraft('admin', a.id, { name: 'Renamed' })]);
    const restored = await f.readDraft('admin', a.id);
    assert.equal(restored.name, 'Renamed'); assert.equal(restored.design.headline, 'New headline');
});
test('duplicates have independent design state', async () => {
    const f = fixture(), a = await f.createDraft('admin', 'Original'), b = await f.duplicateDraft('admin', a.id);
    assert.notEqual(a.id, b.id);
    await f.updateDraft('admin', b.id, { design: { ...b.design, headline: 'Edited copy' } });
    assert.notEqual((await f.readDraft('admin', a.id)).design.headline, 'Edited copy');
});
test('trash can be restored and autosave cannot resurrect a trashed draft', async () => {
    const f = fixture(), a = await f.createDraft('admin', 'Recoverable');
    await f.setDraftTrashed('admin', a.id, true);
    await assert.rejects(f.updateDraft('admin', a.id, { name: 'Unexpected' }));
    assert.equal((await f.listDrafts('admin')).length, 1);
    await f.setDraftTrashed('admin', a.id, false);
    assert.equal((await f.readDraft('admin', a.id)).name, 'Recoverable');
});
test('failed writes report failure and preserve the previous draft', async () => {
    const f = fixture(), a = await f.createDraft('admin', 'Before quota failure');
    f.storage.setItem = async () => { throw new Error('Quota exceeded'); };
    await assert.rejects(f.updateDraft('admin', a.id, { name: 'Not saved' }), /Quota/);
    assert.equal((await f.readDraft('admin', a.id)).name, 'Before quota failure');
});
test('invalid saved records are preserved rather than overwritten', async () => {
    const f = fixture(); f.data.set('the-leaders:studio:drafts:v1:admin', '{"version":99,"drafts":[]}');
    await assert.rejects(f.createDraft('admin'));
    assert.equal(f.data.get('the-leaders:studio:drafts:v1:admin'), '{"version":99,"drafts":[]}');
});
test('previous single design is available for explicit import without deleting the original', async () => {
    const f = fixture(), draft = await f.createDraft('admin', 'Fixture');
    const original = JSON.stringify(draft.design);
    f.data.set('the-leaders:creator-studio:mobile-draft', original);
    const restored = await f.readPreviousLocalDesign();
    await f.createDraft('other-admin', 'Imported', restored);
    assert.equal(f.data.get('the-leaders:creator-studio:mobile-draft'), original);
});
test('release builds reject the sample editor without opening storage or admin data', () => {
    const Redirect = () => null;
    const forbidden = () => { throw new Error('Preview data accessed in release'); };
    const load = loader({
        'expo-router': { Redirect },
        '@tanstack/react-query': { useQuery: forbidden },
        '@/features/post-designer/drafts': { createDraft: forbidden, listDrafts: forbidden },
        '@/features/post-designer/PostEditor': { PostDesignerEditor: forbidden },
        '@/ui/StateView': { StateView: forbidden },
    }, false);
    const screen = load('app/studio-preview.tsx').default();
    assert.equal(screen.type, Redirect);
    assert.equal(screen.props.href, '/profile');
});
test('canvas fits each viewport and keeps the exact export aspect ratio', () => {
    const { fitPostCanvas } = loader()('src/features/post-designer/layout.ts');
    for (const [width, height] of [[320, 188], [464, 393], [480, 720]]) {
        for (const [format, ratio] of [['square', 1], ['portrait', 0.8], ['story', 0.5625], ['landscape', 16 / 9]]) {
            const result = fitPostCanvas(width, height, format);
            assert.ok(result.cardWidth <= width - 32 + 0.001);
            assert.ok(result.cardHeight <= height - 80 + 0.001);
            assert.ok(Math.abs(result.cardWidth / result.cardHeight - ratio) < 0.00001);
            assert.equal(result.cardWidth, 360 * result.canvasScale);
        }
    }
});
test('text positions persist per layer and older designs acquire neutral defaults', async () => {
    const f = fixture(), a = await f.createDraft('admin', 'Positioned');
    const { positionText } = loader()('src/features/post-designer/positioning.ts');
    const design = positionText(a.design, 'headline', { x: 7, y: -12 });
    await f.updateDraft('admin', a.id, { design });
    const restored = await f.readDraft('admin', a.id);
    assert.deepEqual(restored.design.textPositions.headline, { x: 7, y: -12 });
    assert.deepEqual(restored.design.textPositions.supporting, { x: 0, y: 0 });
    const legacy = { ...a.design }; delete legacy.textPositions;
    assert.deepEqual(f.postDesignSchema.parse(legacy).textPositions.headline, { x: 0, y: 0 });
});
test('text positioning uses consistent artwork coordinates and respects locks', async () => {
    const f = fixture(), a = await f.createDraft('admin', 'Positioning');
    const { positionText, textPositionStyle } = loader()('src/features/post-designer/positioning.ts');
    for (const [format, height] of [['square', 360], ['portrait', 450], ['story', 640], ['landscape', 202.5]]) {
        const design = positionText({ ...a.design, format }, 'headline', { x: 10, y: 10 });
        assert.deepEqual(textPositionStyle(design, 'headline').transform, [{ translateX: 36 }, { translateY: height / 10 }]);
    }
    const locked = { ...a.design, lockedLayers: ['headline'] };
    assert.equal(positionText(locked, 'headline', { x: 20 }), locked);
    assert.equal(positionText(a.design, 'footer', { x: 100 }).textPositions.footer.x, 50);
});
test('a continuous positioning gesture commits one undo step and ignores an unchanged gesture', async () => {
    const f = fixture(), draft = await f.createDraft('admin', 'Gesture');
    const { positionText } = loader()('src/features/post-designer/positioning.ts');
    const { commitInteraction } = loader()('src/features/post-designer/history.ts');
    const initial = draft.design;
    let current = initial;
    for (let y = 1; y <= 25; y++) current = positionText(current, 'headline', { y });
    const undo = commitInteraction(initial, current, []);
    assert.equal(undo.length, 1);
    assert.deepEqual(undo[0].textPositions.headline, { x: 0, y: 0 });
    assert.equal(current.textPositions.headline.y, 25);
    assert.equal(commitInteraction(current, current, undo), undo);
});
test('studio sliders emit live changes before the drag is released', () => {
    const Slider = () => null;
    const live = [], completed = [];
    const load = loader({
        'react-native': { View: 'View', StyleSheet: { create: value => value } },
        '@react-native-community/slider': Slider,
        './StudioVerticalSlider': { StudioVerticalSlider: () => null },
        '@/theme/Theme': { useColors: () => ({}) },
        '@/ui/primitives/AppText': { AppText: 'Text' },
    });
    const tree = load('src/features/post-designer/StudioSlider.tsx').StudioSlider({ label: 'Horizontal', min: -50, max: 50, value: 0, onStart() {}, onChange: value => live.push(value), onEnd: value => completed.push(value) });
    const find = node => {
        if (!node || typeof node !== 'object') return null;
        if (node.type === Slider) return node;
        const children = node.props?.children;
        for (const child of Array.isArray(children) ? children.flat(Infinity) : [children]) { const match = find(child); if (match) return match; }
        return null;
    };
    const control = find(tree);
    control.props.onSlidingStart();
    control.props.onValueChange(62);
    assert.deepEqual(live, [12]);
    assert.deepEqual(completed, []);
    control.props.onSlidingComplete(62);
    assert.deepEqual(completed, [12]);
});

test('vertical positioning maps the top to up, centre to zero and bottom to down', () => {
    const { valueFromVerticalPoint, TRACK_HEIGHT } = loader()('src/features/post-designer/vertical-slider.ts');
    assert.equal(valueFromVerticalPoint(0, -50, 50, 1), -50);
    assert.equal(valueFromVerticalPoint(TRACK_HEIGHT / 2, -50, 50, 1), 0);
    assert.equal(valueFromVerticalPoint(TRACK_HEIGHT, -50, 50, 1), 50);
    assert.ok(valueFromVerticalPoint(50, -50, 50, 1) < 0);
    assert.ok(valueFromVerticalPoint(120, -50, 50, 1) > 0);
});
test('image ball moves in the supplied direction, clamps bounds and respects visibility/locks', async () => {
    const f = fixture(), draft = await f.createDraft('admin', 'Image');
    const { moveImage, wheelMovement } = loader()('src/features/post-designer/image-positioning.ts');
    const design = { ...draft.design, imageUri: 'file:///sample.png' };
    const moved = moveImage(design, 12, -7);
    assert.equal(moved.imageOffsetX, 12); assert.equal(moved.imageOffsetY, -7);
    assert.equal(moveImage(moved, 1000, -1000).imageOffsetX, 90);
    assert.equal(moveImage(moved, 1000, -1000).imageOffsetY, -90);
    const locked = { ...design, lockedLayers: ['visual'] };
    const hidden = { ...design, hiddenLayers: ['visual'] };
    assert.equal(moveImage(locked, 5, 5), locked);
    assert.equal(moveImage(hidden, 5, 5), hidden);
    assert.equal(moveImage(draft.design, 5, 5), draft.design);
    assert.deepEqual(wheelMovement(10, -20, 0), { x: 3.5, y: -7 });
    assert.deepEqual(wheelMovement(0, 20, 0, true), { x: 7, y: 0 });
});
test('image zoom survives draft reopening and legacy designs retain their existing crop', async () => {
    const f = fixture(), draft = await f.createDraft('admin', 'Zoom');
    await f.updateDraft('admin', draft.id, { design: { ...draft.design, imageZoom: 2.25 } });
    assert.equal((await f.readDraft('admin', draft.id)).design.imageZoom, 2.25);
    const legacy = { ...draft.design }; delete legacy.imageZoom;
    assert.equal(f.postDesignSchema.parse(legacy).imageZoom, 1.08);
    assert.equal(f.postDesignSchema.safeParse({ ...draft.design, imageZoom: 4 }).success, false);
});
test('image effects persist, default off for older drafts, and reject invalid strengths', async () => {
    const f = fixture(), draft = await f.createDraft('admin', 'Effects');
    const effects = { imageBlur: 24, imageVintage: 65, imageFeather: 40 };
    await f.updateDraft('admin', draft.id, { design: { ...draft.design, ...effects } });
    const reopened = (await f.readDraft('admin', draft.id)).design;
    for (const [key, value] of Object.entries(effects)) {
        assert.equal(reopened[key], value);
        assert.equal(f.postDesignSchema.safeParse({ ...draft.design, [key]: 101 }).success, false);
        assert.equal(f.postDesignSchema.safeParse({ ...draft.design, [key]: -1 }).success, false);
    }
    const legacy = { ...draft.design };
    for (const key of Object.keys(effects)) delete legacy[key];
    const migrated = f.postDesignSchema.parse(legacy);
    for (const key of Object.keys(effects)) assert.equal(migrated[key], 0);
});
test('image effects preserve alpha and respect absent, locked and hidden image layers', async () => {
    const f = fixture(), draft = await f.createDraft('admin', 'Effects');
    const { setImageEffect, vintageMatrix } = loader()('src/features/post-designer/image-effects.ts');
    const design = { ...draft.design, imageUri: 'file:///sample.jpg' };
    assert.equal(setImageEffect(design, 'imageBlur', 200).imageBlur, 100);
    assert.equal(setImageEffect(design, 'imageFeather', -5).imageFeather, 0);
    for (const unavailable of [draft.design, { ...design, lockedLayers: ['visual'] }, { ...design, hiddenLayers: ['visual'] }]) {
        assert.equal(setImageEffect(unavailable, 'imageVintage', 50), unavailable);
    }
    assert.equal(setImageEffect(design, 'imageBlur', NaN), design);
    assert.deepEqual(vintageMatrix(0), [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0]);
    assert.deepEqual(vintageMatrix(100).slice(15), [0,0,0,1,0]);
});
test('text colors persist per layer and legacy drafts keep their template colors', async () => {
    const f = fixture(), draft = await f.createDraft('admin', 'Palette');
    const { setTextColor, textColorStyle, normalizeTextColor } = loader()('src/features/post-designer/text-colors.ts');
    const colored = setTextColor(setTextColor(draft.design, 'headline', '#e9bd68'), 'supporting', '#abc');
    await f.updateDraft('admin', draft.id, { design: colored });
    const restored = (await f.readDraft('admin', draft.id)).design;
    assert.equal(restored.textColors.headline, '#E9BD68');
    assert.equal(restored.textColors.supporting, '#AABBCC');
    assert.equal(restored.textColors.footer, null);
    assert.deepEqual(textColorStyle(restored, 'headline'), { color: '#E9BD68' });
    const legacy = { ...draft.design }; delete legacy.textColors;
    assert.deepEqual(f.postDesignSchema.parse(legacy).textColors, { kicker: null, headline: null, supporting: null, footer: null });
    assert.deepEqual(textColorStyle(legacy, 'headline'), {});
    assert.equal(normalizeTextColor(' b71c1c '), '#B71C1C');
    assert.equal(normalizeTextColor('red'), null);
    assert.equal(normalizeTextColor('#12345678'), null);
    assert.equal(setTextColor(restored, 'headline', 'invalid'), restored);
    const locked = { ...restored, lockedLayers: ['headline'] };
    assert.equal(setTextColor(locked, 'headline', '#FFFFFF'), locked);
    assert.equal(setTextColor(restored, 'headline', null).textColors.headline, null);
    assert.equal(f.postDesignSchema.safeParse({ ...restored, textColors: { ...restored.textColors, footer: 'red' } }).success, false);
});
test('landscape format and custom artwork accents survive saving and reopening', async () => {
    const f = fixture(), draft = await f.createDraft('admin', 'Landscape');
    await f.updateDraft('admin', draft.id, { design: { ...draft.design, format: 'landscape', accent: '#E9BD68' } });
    const restored = (await f.readDraft('admin', draft.id)).design;
    assert.equal(restored.format, 'landscape');
    assert.equal(restored.accent, '#E9BD68');
    const { postOutputDimensions } = loader()('src/features/post-designer/types.ts');
    assert.deepEqual(postOutputDimensions.landscape, [1920, 1080]);
});
test('typography persists per layer and uses the same size and language rules for rendering', async () => {
    const f = fixture(), draft = await f.createDraft('admin', 'Typography');
    const { setTextTypography, textTypographyStyle } = loader()('src/features/post-designer/typography.ts');
    let design = setTextTypography(draft.design, 'supporting', { font: 'hind', size: 120, lineSpacing: 140, shadow: 50 });
    design = setTextTypography(design, 'headline', { size: 130 });
    await f.updateDraft('admin', draft.id, { design });
    const restored = (await f.readDraft('admin', draft.id)).design;
    assert.equal(restored.textTypography.supporting.font, 'hind');
    assert.equal(restored.headlineScale, 1.3);
    assert.equal(textTypographyStyle(restored, 'supporting').fontSize, 13.2);
    assert.equal(textTypographyStyle(restored, 'supporting').textShadowRadius, 3);
    assert.equal(textTypographyStyle({ ...restored, headline: 'नेपाल समाचार', textTypography: draft.design.textTypography }, 'headline').fontFamily, 'Hind_600SemiBold');
    const locked = { ...restored, lockedLayers: ['supporting'] };
    assert.equal(setTextTypography(locked, 'supporting', { size: 80 }), locked);
    const legacy = { ...draft.design }; delete legacy.textTypography;
    assert.equal(f.postDesignSchema.parse(legacy).textTypography.headline.font, 'auto');
    assert.equal(textTypographyStyle(legacy, 'headline').fontSize, 29);
    assert.equal(f.postDesignSchema.safeParse({ ...restored, textTypography: { ...restored.textTypography, footer: { ...restored.textTypography.footer, size: 500 } } }).success, false);
});
test('canvas snapping returns close offsets to the template and can be disabled', () => {
    const { snapTextPosition } = loader()('src/features/post-designer/positioning.ts');
    assert.equal(snapTextPosition(1.4, true), 0);
    assert.equal(snapTextPosition(-1.4, true), 0);
    assert.equal(snapTextPosition(3, true), 3);
    assert.equal(snapTextPosition(1.4, false), 1.4);
});
test('photo replacement preserves adjustments or resets them without altering text', async () => {
    const f = fixture(), draft = await f.createDraft('admin', 'Crop');
    const { replaceImage, resetImageAdjustments, setImageFit } = loader()('src/features/post-designer/image-positioning.ts');
    const design = { ...draft.design, imageUri: 'file:///old.jpg', imageOffsetX: 20, imageOffsetY: -30, imageZoom: 2.1, imageTone: 'warm', imageBlur: 40, imageVintage: 55, imageFeather: 25 };
    const replacement = replaceImage(design, 'file:///new.jpg');
    assert.equal(replacement.imageUri, 'file:///new.jpg');
    for (const key of ['imageOffsetX', 'imageOffsetY', 'imageZoom', 'imageTone', 'imageBlur', 'imageVintage', 'imageFeather']) assert.equal(replacement[key], design[key]);
    const fresh = replaceImage(design, 'file:///new.jpg', false);
    assert.equal(fresh.imageOffsetX, 0); assert.equal(fresh.imageZoom, 1.08); assert.equal(fresh.imageBlur, 0); assert.equal(fresh.imageTone, 'ink');
    assert.equal(fresh.headline, design.headline); assert.deepEqual(fresh.textPositions, design.textPositions);
    const fit = setImageFit(design, 'contain');
    assert.equal(fit.imageZoom, 1); assert.equal(fit.imageOffsetY, 0); assert.equal(fit.imageFit, 'contain');
    await f.updateDraft('admin', draft.id, { design: fit });
    assert.equal((await f.readDraft('admin', draft.id)).design.imageFit, 'contain');
    assert.equal(resetImageAdjustments(fit).imageFit, 'cover');
    const legacy = { ...draft.design }; delete legacy.imageFit;
    assert.equal(f.postDesignSchema.parse(legacy).imageFit, 'cover');
    const locked = { ...design, lockedLayers: ['visual'] };
    assert.equal(replaceImage(locked, 'file:///new.jpg'), locked);
    assert.equal(resetImageAdjustments(locked), locked);
    assert.equal(setImageFit(locked, 'contain'), locked);
    assert.equal(replaceImage(design, ''), design);
});
test('native photos are copied out of temporary storage before the durable URI is returned', async () => {
    const files = new Set(['file:///cache/photo.png']);
    const actions = [];
    class Directory { constructor(...parts) { this.uri = parts.join('/') + '/'; } create(options) { actions.push(options); } }
    class File {
        constructor(...parts) { this.uri = parts.map(part => typeof part === 'string' ? part : part.uri).join('/').replace('/studio-images//', '/studio-images/'); }
        get exists() { return files.has(this.uri); }
        async copy(target) { await Promise.resolve(); files.add(target.uri); actions.push('copied'); }
    }
    const { preserveStudioImage } = loader({ 'react-native': { Platform: { OS: 'ios' } }, 'expo-file-system': { Directory, File, Paths: { document: 'file:///documents' } } })('src/features/post-designer/image-storage.ts');
    const [a, b] = await Promise.all([preserveStudioImage('file:///cache/photo.png'), preserveStudioImage('file:///cache/photo.png')]);
    assert.equal(a, b);
    assert.ok(a.startsWith('file:///documents/studio-images/'));
    files.delete('file:///cache/photo.png');
    assert.equal(await preserveStudioImage(a), a);
    assert.equal(actions.filter(action => action === 'copied').length, 1);
    await assert.rejects(preserveStudioImage('file:///cache/missing.png'), /missing/);
});
test('overflow checks use each format line limit and preserve a small layout rounding tolerance', () => {
    const { textLineLimit, exceedsTextLines } = loader()('src/features/post-designer/text-overflow.ts');
    assert.equal(textLineLimit('landscape', 'headline'), 3);
    assert.equal(textLineLimit('story', 'supporting'), 4);
    assert.equal(exceedsTextLines(124, 31, 4), false);
    assert.equal(exceedsTextLines(124.5, 31, 4), false);
    assert.equal(exceedsTextLines(155, 31, 4), true);
});
test('designer verifies the admin scope before enabling any draft reads', () => {
    const cases = [{ isAdmin: false, data: { studioScope: 'admin-scope' } }, { isAdmin: true, data: { studioScope: null } }, { isAdmin: true, data: { studioScope: 'admin-scope' } }];
    for (const account of cases) {
        let options;
        const load = loader({
            'react-native': { View: 'View' }, 'expo-router': { Redirect: 'Redirect', router: {}, useLocalSearchParams: () => ({ draft: 'draft-id' }) },
            '@tanstack/react-query': { useQuery: input => { options = input; return { isPending: false, data: { id: 'draft-id' } }; } },
            '@/services/useAdminAccount': { useAdminAccount: () => ({ ...account, isPending: false }) },
            '@/features/post-designer/drafts': { readDraft: () => { throw new Error('No real storage during route check'); } },
            '@/features/post-designer/PostEditor': { PostDesignerEditor: 'Editor' }, '@/ui/StateView': { StateView: 'State' },
            '@/components/ui/button': { Button: 'Button' }, '@/ui/primitives/AppText': { AppText: 'Text' },
        });
        const tree = load('app/designer.tsx').default();
        const allowed = account.isAdmin && Boolean(account.data.studioScope);
        assert.equal(options.enabled, allowed);
        assert.equal(tree.type, allowed ? 'Editor' : 'Redirect');
    }
});
test('browser export creates PNGs at each exact output size and releases download URLs', async () => {
    const previous = { document: global.document, getComputedStyle: global.getComputedStyle, setTimeout: global.setTimeout };
    const downloads = [], options = [];
    const fontOverrides = Object.fromEntries(['onest/400Regular/Onest_400Regular', 'onest/600SemiBold/Onest_600SemiBold', 'onest/700Bold/Onest_700Bold', 'hind/400Regular/Hind_400Regular', 'hind/600SemiBold/Hind_600SemiBold', 'hind/700Bold/Hind_700Bold'].map(font => [`@expo-google-fonts/${font}.ttf`, 1]));
    global.document = { fonts: { ready: Promise.resolve() }, body: { appendChild() {} }, createElement: () => ({ click() { downloads.push(this.download); }, remove() {} }) };
    global.getComputedStyle = () => ({ fontFamily: 'system-ui' });
    global.setTimeout = callback => { callback(); return 0; };
    try {
        const { downloadArtwork } = loader({ ...fontOverrides, 'expo-asset': { Asset: {} }, 'html-to-image': { toCanvas: async (_node, input) => { options.push(input); return { width: input.canvasWidth, height: input.canvasHeight, toBlob: callback => callback(new Blob(['PNG'], { type: 'image/png' })) }; } } })('src/features/post-designer/export-web.ts');
        const node = { querySelectorAll: () => [] };
        for (const format of ['square', 'portrait', 'story', 'landscape']) await downloadArtwork(node, format, format);
        assert.deepEqual(options.map(option => [option.canvasWidth, option.canvasHeight]), [[1080,1080],[1080,1350],[1080,1920],[1920,1080]]);
        assert.ok(options.every(option => option.pixelRatio === 1));
        assert.deepEqual(downloads, ['square.png','portrait.png','story.png','landscape.png']);
    } finally { Object.assign(global, previous); }
});
test('designer waits for fresh storage data instead of mounting an editor with a stale cached draft', () => {
    let options;
    const load = loader({
        'react-native': { View: 'View' }, 'expo-router': { Redirect: 'Redirect', router: {}, useLocalSearchParams: () => ({ draft: 'draft-id' }) },
        '@tanstack/react-query': { useQuery: input => { options = input; return { isPending: false, isFetching: true, data: { id: 'draft-id', design: { headline: 'Old cached headline' } } }; } },
        '@/services/useAdminAccount': { useAdminAccount: () => ({ isAdmin: true, isPending: false, data: { studioScope: 'admin-scope' } }) },
        '@/features/post-designer/drafts': { readDraft: () => {} }, '@/features/post-designer/PostEditor': { PostDesignerEditor: 'Editor' },
        '@/ui/StateView': { StateView: 'State' }, '@/components/ui/button': { Button: 'Button' }, '@/ui/primitives/AppText': { AppText: 'Text' },
    });
    const tree = load('app/designer.tsx').default();
    assert.equal(tree.type, 'State');
    assert.equal(tree.props.loading, true);
    assert.equal(options.gcTime, 0);
    assert.equal(options.refetchOnWindowFocus, false);
    assert.equal(options.refetchOnReconnect, false);
});

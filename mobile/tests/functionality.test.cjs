const { test } = require('node:test');
const assert = require('node:assert/strict');
const loader = require('./load-ts.cjs');
const bilingual = value => ({ en: value, ne: value });
const card = { slug: 'full-story', source: 'article', title: bilingual('A story'), excerpt: bilingual('A short summary'), author: bilingual('Desk'), category: bilingual('Politics'), image: '', publishedAt: '2026-10-13T00:00:00Z', tags: [] };
const detail = { ...card, content: bilingual('A complete article, with all the reporting.'), availableLanguages: ['en', 'ne'] };
function bookmarkFixture(fetchArticle) {
    const saved = new Map();
    const state = { language: 'en', ids: [], notice: null, setSavedArticleSaved(slug, yes) { this.ids = yes ? [...this.ids, slug] : this.ids.filter(value => value !== slug); }, setNotice(value) { this.notice = value; } };
    const load = loader({ '@/api/client': { apiGet: fetchArticle }, '@/storage/saved': { readSaved: slug => saved.get(slug), removeSaved: slug => saved.delete(slug), saveArticle: article => saved.set(article.slug, article) }, '@/state/useAppStore': { useAppStore: { getState: () => state } }, './telemetry': { recordUsage: () => {} } });
    return { ...load('src/services/bookmarks.ts'), state, saved };
}
test('saving from a feed fetches and persists the complete body and publishing metadata', async () => {
    let calls = 0;
    const fixture = bookmarkFixture(async route => { calls++; assert.equal(route, '/api/v1/articles/full-story'); return detail; });
    await fixture.toggleBookmark(card);
    assert.equal(calls, 1);
    assert.equal(fixture.saved.get(card.slug).contentEn, detail.content.en);
    assert.equal(fixture.saved.get(card.slug).article.publishedAt, card.publishedAt);
    assert.equal(fixture.state.ids.includes(card.slug), true);
    await fixture.toggleBookmark(card);
    assert.equal(fixture.saved.size, 0);
    assert.equal(fixture.state.ids.length, 0);
});
test('failed downloads never create summary-only bookmarks', async () => {
    const fixture = bookmarkFixture(async () => { throw new Error('offline'); });
    await fixture.toggleBookmark(card);
    assert.equal(fixture.saved.size, 0);
    assert.equal(fixture.state.ids.length, 0);
    assert.match(fixture.state.notice, /Could not save/);
});
test('repeated taps share the in-flight save instead of toggling or downloading twice', async () => {
    let resolve, calls = 0;
    const waiting = new Promise(done => { resolve = done; });
    const fixture = bookmarkFixture(() => { calls++; return waiting; });
    const first = fixture.toggleBookmark(card), second = fixture.toggleBookmark(card);
    resolve(detail); await Promise.all([first, second]);
    assert.equal(calls, 1); assert.equal(fixture.saved.size, 1);
});
test('release API configuration fails closed without a public HTTPS endpoint', () => {
    const previous = process.env.EXPO_PUBLIC_API_URL;
    try {
        const { apiBase } = loader({ 'expo-constants': { expoConfig: {} } }, false)('src/api/config.ts');
        delete process.env.EXPO_PUBLIC_API_URL; assert.throws(apiBase, /not configured/);
        process.env.EXPO_PUBLIC_API_URL = 'http://localhost:3000'; assert.throws(apiBase, /HTTPS/);
        process.env.EXPO_PUBLIC_API_URL = 'https://news.example.com/'; assert.equal(apiBase(), 'https://news.example.com');
    } finally { if (previous === undefined) delete process.env.EXPO_PUBLIC_API_URL; else process.env.EXPO_PUBLIC_API_URL = previous; }
});
test('API contracts reject incomplete reader bodies and keep author results separate from leaders', () => {
    const { responseContract } = loader()('src/api/contracts.ts');
    assert.equal(responseContract('/api/v1/articles/full-story').safeParse(card).success, false);
    assert.equal(responseContract('/api/v1/articles/full-story').safeParse(detail).success, true);
    const search = responseContract('/api/v1/search?q=Desk').parse({ articles: [card], authors: [bilingual('Desk')], leaders: [], briefs: [], factChecks: [], episodes: [] });
    assert.equal(search.authors[0].en, 'Desk'); assert.equal(search.leaders.length, 0);
});
test('radio reports actual playback, handles buffering and disposes the stream on close', async t => {
    let callback, removed = false;
    const player = { volume: 0, play() {}, pause() {}, setActiveForLockScreen() {}, remove() { removed = true; }, addListener(_event, listener) { callback = listener; return { remove() {} }; } };
    const { useAudioStore } = loader({ 'expo-audio': { createAudioPlayer: () => player, setAudioModeAsync: async () => {} }, 'react-native': { Platform: { OS: 'web' } } })('src/state/useAudioStore.ts');
    t.after(() => useAudioStore.getState().close());
    await useAudioStore.getState().play({ id: 'station', title: 'Station', author: '96.1 MHz', artwork: '', url: 'https://example.com/live' });
    assert.equal(useAudioStore.getState().isPlaying, false);
    callback({ playbackState: 'ready', isLoaded: true, isBuffering: false, playing: true });
    assert.equal(useAudioStore.getState().isPlaying, true);
    callback({ playbackState: 'ready', isLoaded: true, isBuffering: true, playing: false });
    assert.equal(useAudioStore.getState().status, 'loading');
    useAudioStore.getState().pause(); assert.equal(useAudioStore.getState().isPlaying, false);
    useAudioStore.getState().setVolume(2); assert.equal(player.volume, 1);
    useAudioStore.getState().close(); assert.equal(removed, true);
});
test('telemetry never sends events without consent', () => {
    let calls = 0;
    const { recordUsage } = loader({ '@react-native-async-storage/async-storage': {}, '@/api/config': { apiBase: () => 'https://news.example.com' }, '@/state/useAppStore': { useAppStore: { getState: () => ({ usageSharing: false, language: 'en' }) } } })('src/services/telemetry.ts');
    const previous = global.fetch; global.fetch = () => { calls++; };
    try { recordUsage('article_open'); assert.equal(calls, 0); } finally { global.fetch = previous; }
});
test('saved data validation preserves legacy bookmarks and rejects corrupt browser records', () => {
    const { savedArticleSchema } = loader()('src/storage/saved-schema.ts');
    const old = { slug: card.slug, source: 'article', titleEn: 'Headline', titleNe: '', excerptEn: 'Summary', excerptNe: '', contentEn: 'Full body', contentNe: '', savedAt: '2026-10-13T00:00:00Z' };
    assert.equal(savedArticleSchema.safeParse(old).success, true);
    assert.equal(savedArticleSchema.safeParse({ ...old, article: detail }).success, true);
    assert.equal(savedArticleSchema.safeParse({ slug: 'broken' }).success, false);
});
test('opt-in usage sends only an event enum and language to the existing backend', async () => {
    let captured;
    const { recordUsage } = loader({ '@react-native-async-storage/async-storage': {}, '@/api/config': { apiBase: () => 'https://news.example.com' }, '@/state/useAppStore': { useAppStore: { getState: () => ({ usageSharing: true, language: 'ne' }) } } })('src/services/telemetry.ts');
    const previous = global.fetch;
    global.fetch = async (url, options) => { captured = { url, body: JSON.parse(options.body) }; return {}; };
    try { recordUsage('article_open'); await Promise.resolve(); assert.deepEqual(captured, { url: 'https://news.example.com/api/v1/usage', body: { event: 'article_open', language: 'ne' } }); }
    finally { global.fetch = previous; }
});


test('radio close pauses and releases the stream even when lock-screen cleanup throws', async () => {
    const calls = [];
    let callback;
    const player = {
        volume: 0, play() {}, pause() { calls.push('pause'); },
        setActiveForLockScreen() { calls.push('lock-screen'); throw new Error('unsupported'); },
        remove() { calls.push('remove'); },
        addListener(_event, listener) { callback = listener; return { remove() { calls.push('listener'); } }; },
    };
    const { useAudioStore } = loader({ 'expo-audio': { createAudioPlayer: () => player, setAudioModeAsync: async () => {} }, 'react-native': { Platform: { OS: 'web' } } })('src/state/useAudioStore.ts');
    await useAudioStore.getState().play({ id: 'station', title: 'Station', author: '', artwork: '', url: 'https://example.com/live' });
    useAudioStore.getState().close();
    assert.deepEqual(calls, ['listener', 'pause', 'lock-screen', 'remove']);
    callback({ playbackState: 'ready', isLoaded: true, isBuffering: false, playing: true });
    assert.equal(useAudioStore.getState().status, 'idle');
    assert.equal(useAudioStore.getState().currentTrack, null);
    assert.equal(useAudioStore.getState().isVisible, false);
});

test('closing radio while audio setup is pending cannot start playback afterward', async () => {
    let finishSetup;
    let creates = 0;
    const { useAudioStore } = loader({
        'expo-audio': { createAudioPlayer: () => { creates++; throw new Error('Should never start'); }, setAudioModeAsync: () => new Promise(resolve => { finishSetup = resolve; }) },
        'react-native': { Platform: { OS: 'ios' } },
    })('src/state/useAudioStore.ts');
    const pending = useAudioStore.getState().play({ id: 'station', title: 'Station', author: '', artwork: '', url: 'https://example.com/live' });
    useAudioStore.getState().close();
    finishSetup();
    await pending;
    assert.equal(creates, 0);
    assert.equal(useAudioStore.getState().status, 'idle');
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const loader = require('./load-ts.cjs');
const rules = loader({ '@/lib/trusted-sources': { isSafeExternalUrl: value => !new URL(value).hostname.includes('localhost') } })('../src/lib/daily-social.ts');
const copy = { en: 'Source-backed copy', ne: 'स्रोतमा आधारित सामग्री' };
const fixture = () => ({ date: rules.nepalDay(), edition: 'morning', title: copy, caption: copy, sources: [{ id: 'source', name: 'Source', url: 'https://example.test/news', publishedAt: new Date(Date.now() - 3600000).toISOString(), verifiedAt: new Date().toISOString(), support: 'The source confirms this development.' }], slides: [{ section: 'headlines', headline: copy, body: copy, sourceIds: ['source'] }], omissions: [] });
test('schedule is stable in Nepal time across Toronto daylight saving changes', () => {
    for (const date of ['2026-10-14', '2026-12-14']) {
        assert.equal(rules.dueEdition(new Date(`${date}T01:15:00Z`)), 'morning');
        assert.equal(rules.dueEdition(new Date(`${date}T15:15:00Z`)), 'evening');
        assert.equal(rules.dueEdition(new Date(`${date}T10:00:00Z`)), null);
    }
    assert.equal(rules.nepalDay(new Date('2026-10-13T20:00:00Z')), '2026-10-14');
});
test('bilingual editions require citations, recent evidence and confirmed event details', () => {
    assert.equal(rules.dailySocialInput.safeParse(fixture()).success, true);
    const noCitation = fixture(); noCitation.slides[0].sourceIds = ['missing'];
    assert.equal(rules.dailySocialInput.safeParse(noCitation).success, false);
    const missingTranslation = fixture(); missingTranslation.caption = { en: 'Only English' };
    assert.equal(rules.dailySocialInput.safeParse(missingTranslation).success, false);
    const stale = fixture(); stale.sources[0].verifiedAt = new Date(Date.now() - 3 * 3600000).toISOString();
    assert.equal(rules.dailySocialInput.safeParse(stale).success, false);
    const oldNews = fixture(); oldNews.sources[0].publishedAt = new Date(Date.now() - 48 * 3600000).toISOString();
    assert.equal(rules.dailySocialInput.safeParse(oldNews).success, false);
    const event = fixture(); event.slides[0].section = 'enjoy';
    assert.equal(rules.dailySocialInput.safeParse(event).success, false);
    event.slides[0].eventDate = rules.nepalDay(); event.slides[0].venue = 'Organizer-confirmed venue';
    assert.equal(rules.dailySocialInput.safeParse(event).success, true);
    const night = fixture(); night.edition = 'evening'; night.slides[0].section = 'recap';
    assert.equal(rules.dailySocialInput.safeParse(night).success, false);
    night.slides[0].happenedOn = night.date;
    assert.equal(rules.dailySocialInput.safeParse(night).success, true);
});
test('automation cannot overwrite existing daily content and requires its ingestion credential', async () => {
    const previous = process.env.STUDIO_ATTENTION_AUTOMATION_SECRET;
    process.env.STUDIO_ATTENTION_AUTOMATION_SECRET = 'test-key';
    let update;
    const route = loader({
        '@/lib/db': async () => {},
        '@/lib/daily-social': { ...rules, dueEdition: () => 'morning' },
        '@/models/DailySocialEdition': { updateOne: async (_filter, value) => { update = value; return { upsertedCount: 0 }; }, exists: async () => true },
        '@/lib/mobile-auth': { mobileAuthResponse: (_request, body, status = 200) => Response.json(body, { status }) },
    })('../src/app/api/v1/auth/daily-social/ingest/route.ts');
    const request = key => new Request('https://example.test', { method: 'POST', headers: { authorization: `Bearer ${key}` }, body: JSON.stringify(fixture()) });
    try {
        assert.equal((await route.POST(request('wrong'))).status, 401);
        assert.equal((await route.POST(new Request('https://example.test', { method: 'POST', headers: { authorization: 'Bearer test-key' }, body: '{broken' }))).status, 400);
        assert.equal(update, undefined);
        assert.equal((await (await route.POST(request('test-key'))).json()).created, false);
        assert.ok(update.$setOnInsert);
        assert.equal(update.$set, undefined);
        assert.equal((await (await route.GET(request('test-key'))).json()).due, false);
    } finally { if (previous === undefined) delete process.env.STUDIO_ATTENTION_AUTOMATION_SECRET; else process.env.STUDIO_ATTENTION_AUTOMATION_SECRET = previous; }
});
test('bilingual carousel import is atomic, repeatable and preserves existing edits', async () => {
    let stored = null; let saves = 0;
    const load = loader({ '@react-native-async-storage/async-storage': { getItem: async () => stored, setItem: async (_key, value) => { stored = value; saves++; } } });
    const drafts = load('src/features/post-designer/drafts.ts');
    const { defaultPostDesign } = load('src/features/post-designer/types.ts');
    const entries = ['ne', 'en'].map(language => ({ id: `daily-1-${language}-0`, name: language, design: { ...defaultPostDesign, headline: `Original ${language}` } }));
    await drafts.createDraftCollection('approved-admin', entries);
    assert.equal(saves, 1); assert.equal((await drafts.listDrafts('approved-admin')).length, 2);
    await drafts.updateDraft('approved-admin', entries[0].id, { design: { ...defaultPostDesign, headline: 'Admin edited this slide' } });
    await drafts.createDraftCollection('approved-admin', entries);
    assert.equal((await drafts.readDraft('approved-admin', entries[0].id)).design.headline, 'Admin edited this slide');
    assert.equal((await drafts.listDrafts('approved-admin')).length, 2);
});

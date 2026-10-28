import { beforeEach, describe, expect, it, vi } from 'vitest';
const storage = vi.hoisted(() => ({ data: new Map<string, string>(), fail: false }));
vi.mock('@/lib/post-studio/storage', () => ({ default: { getItem: async (key: string) => storage.data.get(key) ?? null, setItem: async (key: string, value: string) => { if (storage.fail) throw new Error('Storage full'); storage.data.set(key, value); } } }));
import { createDraft, listDrafts, restoreDraftCopies, setDraftTrashed } from '@/lib/post-studio/drafts';
import { prepareDraftRestore, serializeDraftBackup } from '@/lib/post-studio/backup';
import { currentReview, publicationChecks, similarTopics } from '@/lib/post-studio/editorial';
import { recoverStudioJson } from '@/lib/post-studio/json-recovery';
import { createNewsDesign } from '@/lib/post-studio/news-design';
import { generateCreationPrompt, digestCreationResponse, type PromptOptions } from '@/lib/post-studio/prompt-engine';
beforeEach(() => { storage.data.clear(); storage.fail = false; vi.restoreAllMocks(); });
const design = () => ({ ...createNewsDesign('do-you-know'), headline: 'A verified headline', summary: 'The supporting context.', sourceUrls: ['https://example.org/evidence'] });
describe('Editorial review', () => {
    it('does not treat a URL as verification and invalidates reviews after copy or source edits', () => {
        const original = design(), review = currentReview(original);
        expect(publicationChecks(original).some(check => check.label.includes('still need'))).toBe(true);
        review.claims.forEach(claim => { claim.status = 'verified'; claim.sources = original.sourceUrls; }); review.languageChecked = true;
        const checked = { ...original, editorialReview: review };
        expect(currentReview(checked).claims.every(claim => claim.status === 'verified')).toBe(true);
        for (const next of [{ ...checked, headline: 'A changed claim' }, { ...checked, sourceUrls: ['https://example.org/different'] }]) {
            expect(currentReview(next).claims.every(claim => claim.status === 'needs-checking')).toBe(true);
            expect(currentReview(next).languageChecked).toBe(false);
        }
        expect(currentReview({ ...checked, accent: '#ff0000' }).claims[0].status).toBe('verified');
    });
    it('flags unsupported copy, missing source links and hidden headlines', () => {
        const original = design(), review = currentReview(original); review.claims[0].status = 'unsupported';
        expect(publicationChecks({ ...original, editorialReview: review }).some(check => check.level === 'error' && check.label.includes('unsupported'))).toBe(true);
        expect(publicationChecks({ ...original, hiddenLayers: ['headline'] })[0].level).toBe('error');
        expect(publicationChecks({ ...original, contentLanguage: 'ne' }).some(check => check.label.includes('selected language'))).toBe(true);
        expect(publicationChecks({ ...original, sourceUrls: [] }).some(check => check.level === 'warning' && check.label.startsWith('No source'))).toBe(true);
    });
    it('recognizes normalized English and Nepali repeats without flagging unrelated subjects', () => {
        expect(similarTopics('नेपालको राष्ट्रिय झण्डा', [{ headline: 'नेपालको राष्ट्रिय झण्डा!', name: 'Flag' }])).toHaveLength(1);
        expect(similarTopics('Woolly mammoths were alive when pyramids were built', [{ headline: 'Woolly mammoths survived when the pyramids were built', name: 'Mammoths' }])).toHaveLength(1);
        expect(similarTopics('Nepal has a unique flag', [{ headline: 'Dolphins use distinctive whistles', name: 'Nature' }])).toHaveLength(0);
    });
});
describe('Recoverable formatting', () => {
    it('previews HTML spaces, trailing backslashes and Markdown source URLs without importing automatically', () => {
        const raw = '&#x20;{\\\n"posts":[{"template":"breaking","headline":"A fact","summary":"Context"}],\\\n"sources":["[Evidence](https://example.org/evidence)"]\\\n}';
        const fixed = recoverStudioJson(raw);
        expect(fixed.changes).toHaveLength(3);
        const options: PromptOptions = { kind: 'news', templates: ['breaking'], newsStyle: 'do-you-know', format: 'portrait', language: 'en', brief: '' };
        expect(digestCreationResponse(fixed.text, options).designs[0].sourceUrls).toEqual(['https://example.org/evidence']);
        expect(raw).toContain('&#x20;');
    });
    it('preserves escaped newlines inside strings and refuses to invent missing JSON', () => {
        const fixed = recoverStudioJson('```json\n{"summary":"First\\nSecond"}\n```');
        expect(JSON.parse(fixed.text).summary).toBe('First\nSecond');
        expect(() => recoverStudioJson('{"posts":[')).toThrow('cannot be safely');
        expect(() => recoverStudioJson('{"posts":[]}')).toThrow('No recognized');
    });
});
describe('Portable backups', () => {
    it('restores artwork, review, images, order and Trash as copies in another account without overwriting existing work', async () => {
        const original = design(); original.imageUri = 'data:image/png;base64,aGVsbG8=';
        const first = await createDraft('a', 'First', { ...original, series: { topic: 'Nature', issue: '012' }, editorialReview: currentReview(original) }, { carouselId: 'pack', carouselOrder: 0 });
        const second = await createDraft('a', 'Second', design(), { carouselId: 'pack', carouselOrder: 1 });
        await setDraftTrashed('a', second.id, true);
        const backup = await serializeDraftBackup(await listDrafts('a'));
        const prepared = prepareDraftRestore(backup);
        expect(prepared.active).toBe(1); expect(prepared.trashed).toBe(1);
        expect(prepared.drafts.map(item => item.id)).not.toContain(first.id);
        expect(new Set(prepared.drafts.map(item => item.carouselId)).size).toBe(1);
        await createDraft('b', 'Existing', design());
        await restoreDraftCopies('b', prepared.drafts); await restoreDraftCopies('b', prepared.drafts);
        const restored = await listDrafts('b'); expect(restored).toHaveLength(3);
        const imported = restored.find(item => item.name === 'First')!;
        expect(imported.design.series).toEqual({ topic: 'Nature', issue: '012' });
        expect(imported.design.imageUri).toBe(original.imageUri);
        expect(imported.design.editorialReview?.fingerprint).toBe(currentReview(original).fingerprint);
        expect((await listDrafts('a'))).toHaveLength(2);
    });
    it('validates every draft and preserves storage on failed restores', async () => {
        const text = await serializeDraftBackup([await createDraft('a', 'Original', design())]);
        const malformed = JSON.parse(text); malformed.drafts[0].design.template = 'unknown';
        expect(() => prepareDraftRestore(JSON.stringify(malformed))).toThrow('not a supported');
        const external = JSON.parse(text); external.drafts[0].design.imageUri = 'https://example.org/remote.png';
        expect(() => prepareDraftRestore(JSON.stringify(external))).toThrow('external or unsupported');
        const prepared = prepareDraftRestore(text); storage.fail = true;
        await expect(restoreDraftCopies('b', prepared.drafts)).rejects.toThrow('Storage full');
        expect(await listDrafts('b')).toHaveLength(0);
    });
    it('embeds a remote raster and fails rather than exporting an unavailable photo', async () => {
        const draft = await createDraft('a', 'Photo', { ...design(), imageUri: 'https://example.org/photo.png' });
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: async () => ({ type: 'image/png', size: 5, arrayBuffer: async () => new TextEncoder().encode('image').buffer }) }));
        const text = await serializeDraftBackup([draft]);
        expect(prepareDraftRestore(text).drafts[0].design.imageUri).toMatch(/^data:image\/png;base64,/);
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
        await expect(serializeDraftBackup([draft])).rejects.toThrow('No incomplete backup');
        vi.unstubAllGlobals();
    });
});
describe('Research controls', () => {
    it('applies international science scope and avoids prior draft subjects without requiring a brief', () => {
        const options: PromptOptions = { kind: 'news', templates: ['breaking'], newsStyle: 'interesting-facts', format: 'portrait', language: 'en', brief: '', researchScope: { region: 'world', topic: 'science' }, recentHeadlines: ['Nepal has a unique flag'] };
        const prompt = generateCreationPrompt(options);
        expect(prompt).toContain('outside Nepal'); expect(prompt).toContain('Focus on Science'); expect(prompt).toContain('RECENT TOPICS TO AVOID'); expect(prompt).toContain('Nepal has a unique flag');
        const design = digestCreationResponse(JSON.stringify({ posts: [{ template: 'breaking', headline: 'A fact', summary: 'Context' }] }), options).designs[0];
        expect(design.researchTopic).toBe('science'); expect(design.contentLanguage).toBe('en');
    });
});

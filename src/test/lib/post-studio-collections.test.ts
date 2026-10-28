import { beforeEach, describe, expect, it, vi } from 'vitest';
const storage = vi.hoisted(() => ({ data: new Map<string, string>(), fail: false }));
vi.mock('@/lib/post-studio/storage', () => ({ default: {
    getItem: async (key: string) => storage.data.get(key) ?? null,
    setItem: async (key: string, value: string) => { if (storage.fail) throw new Error('Quota exceeded'); storage.data.set(key, value); },
} }));
import { createDraftCollection, readDraft, saveDraftCollection, setDraftTrashed, updateDraft, listDrafts } from '@/lib/post-studio/drafts';
import { canonicalCarouselId, findCarouselSiblings } from '@/lib/post-studio/carousel';
import { createHistoryDesign, createHistoryParagraphDesign } from '@/lib/post-studio/history-design';
import { defaultPostDesign } from '@/lib/post-studio/types';
beforeEach(() => { storage.data.clear(); storage.fail = false; });
async function pack() {
    return createDraftCollection('account', [1, 2, 3].map(index => ({ id: `pack-${index}`, name: `Story · ${index}/3`, design: { ...defaultPostDesign, headline: `Headline ${index}` } })));
}
describe('Atomic carousel persistence', () => {
    it('stores a random ad choice per post and keeps it through editing and import retries', async () => {
        const created = await pack();
        created.forEach(item => { expect(item.design.echo11Variant).toBeGreaterThanOrEqual(0); expect(item.design.echo11Variant).toBeLessThan(8); });
        const first = created[0];
        await updateDraft('account', first.id, { design: { ...first.design, headline: 'Edited story' } });
        expect((await readDraft('account', first.id)).design.echo11Variant).toBe(first.design.echo11Variant);
        const retried = await pack();
        expect(retried.map(item => item.design.echo11Variant)).toEqual(created.map(item => item.design.echo11Variant));
    });

    it('recovers both History stories from old split carousel IDs without merging unrelated batches or Trash', async () => {
        const base = 'prompt-11111111-1111-4111-8111-111111111111';
        const national = createHistoryDesign('on-this-day'); national.history!.storyScope = 'national';
        const international = createHistoryDesign('on-this-day'); international.history!.storyScope = 'international';
        international.headline = 'International event';
        const entries = await createDraftCollection('account', [
            { id: 'history-1', name: 'Nepal', carouselId: `${base}-national`, carouselOrder: 0, design: national },
            { id: 'history-2', name: 'Nepal context', carouselId: `${base}-national`, carouselOrder: 1, design: createHistoryParagraphDesign(national, 'National context') },
            { id: 'history-3', name: 'International', carouselId: `${base}-international`, carouselOrder: 0, design: international },
            { id: 'history-4', name: 'International context', carouselId: `${base}-international`, carouselOrder: 1, design: createHistoryParagraphDesign(international, 'International context') },
            { id: 'unrelated', name: 'Another batch', carouselId: 'unrelated-national', carouselOrder: 0, design: national },
        ]);
        await setDraftTrashed('account', 'history-4', true);
        const all = await listDrafts('account');
        for (const opened of [entries[0], entries[2]]) {
            const pages = findCarouselSiblings(opened, all);
            expect(pages.map(item => item.id)).toEqual(['history-1', 'history-2', 'history-3']);
            expect(canonicalCarouselId(opened)).toBe(base);
        }
        const recovered = findCarouselSiblings(entries[0], all).map((item, index) => ({ ...item, carouselId: base, carouselOrder: index }));
        await saveDraftCollection('account', recovered);
        expect(findCarouselSiblings(await readDraft('account', 'history-3'), await listDrafts('account')).map(item => item.id)).toEqual(['history-1', 'history-2', 'history-3']);
    });
    it('persists order and membership independently of names and legacy identifiers', async () => {
        const original = await pack();
        const ordered = [original[2], original[0], original[1]].map((item, index) => ({ ...item, carouselId: 'pack', carouselOrder: index }));
        await saveDraftCollection('account', ordered);
        await updateDraft('account', original[0].id, { name: 'Renamed page' });
        const all = await listDrafts('account');
        expect(findCarouselSiblings(await readDraft('account', original[0].id), all).map(item => item.id)).toEqual(['pack-3', 'pack-1', 'pack-2']);
    });
    it('preserves a rename queued alongside a shared design save', async () => {
        const entries = await pack();
        await Promise.all([
            updateDraft('account', 'pack-2', { name: 'Renamed elsewhere' }),
            saveDraftCollection('account', entries.map(item => ({ ...item, design: { ...item.design, textAlign: 'center' } }))),
        ]);
        expect(await readDraft('account', 'pack-2')).toMatchObject({ name: 'Renamed elsewhere', design: { textAlign: 'center' } });
    });
    it('does not save part of a carousel if another page is missing or in Trash', async () => {
        const entries = await pack();
        await setDraftTrashed('account', 'pack-2', true);
        await expect(saveDraftCollection('account', entries.map(item => ({ ...item, design: { ...item.design, textAlign: 'center' } })))).rejects.toThrow('unavailable');
        expect((await readDraft('account', 'pack-1')).design.textAlign).toBe('left');
    });
    it('leaves the entire saved collection intact on a failed write and permits retry', async () => {
        const entries = await pack();
        const changed = entries.map(item => ({ ...item, design: { ...item.design, imageBlur: 30 } }));
        storage.fail = true; await expect(saveDraftCollection('account', changed)).rejects.toThrow();
        expect((await listDrafts('account')).every(item => item.design.imageBlur === 0)).toBe(true);
        storage.fail = false; await saveDraftCollection('account', changed);
        expect((await listDrafts('account')).every(item => item.design.imageBlur === 30)).toBe(true);
        expect(await listDrafts('another-account')).toHaveLength(0);
    });
});

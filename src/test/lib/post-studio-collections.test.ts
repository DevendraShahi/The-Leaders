import { beforeEach, describe, expect, it, vi } from 'vitest';
const storage = vi.hoisted(() => ({ data: new Map<string, string>(), fail: false }));
vi.mock('@/lib/post-studio/storage', () => ({ default: {
    getItem: async (key: string) => storage.data.get(key) ?? null,
    setItem: async (key: string, value: string) => { if (storage.fail) throw new Error('Quota exceeded'); storage.data.set(key, value); },
} }));
import { createDraftCollection, readDraft, saveDraftCollection, setDraftTrashed, updateDraft, listDrafts } from '@/lib/post-studio/drafts';
import { findCarouselSiblings } from '@/lib/post-studio/carousel';
import { defaultPostDesign } from '@/lib/post-studio/types';
beforeEach(() => { storage.data.clear(); storage.fail = false; });
async function pack() {
    return createDraftCollection('account', [1, 2, 3].map(index => ({ id: `pack-${index}`, name: `Story · ${index}/3`, design: { ...defaultPostDesign, headline: `Headline ${index}` } })));
}
describe('Atomic carousel persistence', () => {
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

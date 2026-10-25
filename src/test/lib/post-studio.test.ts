import { beforeEach, describe, expect, it, vi } from 'vitest';
const storage = vi.hoisted(() => ({ data: new Map<string, string>(), fail: false }));
vi.mock('@/lib/post-studio/storage', () => ({ default: {
    getItem: async (key: string) => storage.data.get(key) ?? null,
    setItem: async (key: string, value: string) => { if (storage.fail) throw new Error('Quota exceeded'); storage.data.set(key, value); },
} }));
import { createDraft, createDraftCollection, duplicateDraft, listDrafts, readDraft, setDraftTrashed, updateDraft } from '@/lib/post-studio/drafts';
import { defaultPostDesign, postOutputDimensions } from '@/lib/post-studio/types';
import { moveImage, replaceImage, resetImageAdjustments, setImageFit, wheelMovement } from '@/lib/post-studio/image-positioning';
import { positionText, snapTextPosition } from '@/lib/post-studio/positioning';
import { setTextTypography, textTypographyStyle } from '@/lib/post-studio/typography';
import { setTextColor, normalizeTextColor } from '@/lib/post-studio/text-colors';
import { setImageEffect } from '@/lib/post-studio/image-effects';
import { commitInteraction } from '@/lib/post-studio/history';
beforeEach(() => { storage.data.clear(); storage.fail = false; });

describe('mobile-equivalent web draft library', () => {
    it('restores a complete design and keeps accounts isolated', async () => {
        const draft = await createDraft('a', 'First');
        const design = { ...draft.design, headline: 'Distinct', format: 'story' as const, imageUri: 'data:image/png;base64,sample', lockedLayers: ['footer' as const] };
        await updateDraft('a', draft.id, { design });
        expect((await readDraft('a', draft.id)).design).toEqual(design);
        expect(await listDrafts('b')).toEqual([]);
        await expect(readDraft('b', draft.id)).rejects.toThrow('unavailable');
    });
    it('serializes overlapping autosave and rename without losing either change', async () => {
        const draft = await createDraft('a', 'Original');
        await Promise.all([updateDraft('a', draft.id, { design: { ...draft.design, headline: 'New headline' } }), updateDraft('a', draft.id, { name: 'Renamed' })]);
        const saved = await readDraft('a', draft.id);
        expect(saved.name).toBe('Renamed'); expect(saved.design.headline).toBe('New headline');
    });
    it('duplicates independently and recovers drafts from trash', async () => {
        const original = await createDraft('a', 'Original'), copy = await duplicateDraft('a', original.id);
        await updateDraft('a', copy.id, { design: { ...copy.design, headline: 'Only the copy' } });
        expect((await readDraft('a', original.id)).design.headline).not.toBe('Only the copy');
        await setDraftTrashed('a', copy.id, true);
        await expect(updateDraft('a', copy.id, { name: 'Must not resurrect' })).rejects.toThrow('unavailable');
        await setDraftTrashed('a', copy.id, false);
        expect((await readDraft('a', copy.id)).design.headline).toBe('Only the copy');
    });
    it('preserves data when storage fails or the library is invalid', async () => {
        const draft = await createDraft('a', 'Saved'); storage.fail = true;
        await expect(updateDraft('a', draft.id, { name: 'Lost' })).rejects.toThrow('Quota');
        expect((await readDraft('a', draft.id)).name).toBe('Saved');
        storage.fail = false;
        storage.data.set('the-leaders:studio:web-drafts:v1:b', '{"version":99,"drafts":[]}');
        await expect(createDraft('b')).rejects.toThrow('preserved');
        expect(storage.data.get('the-leaders:studio:web-drafts:v1:b')).toContain('99');
    });
    it('re-importing carousels preserves saved edits and never resurrects trash', async () => {
        const entries = [{ id: 'daily-id-en-0', name: 'Cover', design: defaultPostDesign }];
        await createDraftCollection('a', entries);
        await updateDraft('a', entries[0].id, { design: { ...defaultPostDesign, headline: 'Reviewed edits' } });
        expect((await createDraftCollection('a', entries))[0].design.headline).toBe('Reviewed edits');
        await setDraftTrashed('a', entries[0].id, true);
        await expect(createDraftCollection('a', entries)).rejects.toThrow('Trash');
    });
});
describe('mobile editor behavior parity', () => {
    it('uses exactly the four mobile output dimensions', () => {
        expect(postOutputDimensions).toEqual({ square: [1080, 1080], portrait: [1080, 1350], story: [1080, 1920], landscape: [1920, 1080] });
    });
    it('preserves crop/effects on replacement and resets them as a single design update', () => {
        const design = { ...defaultPostDesign, imageUri: 'old', imageZoom: 2, imageBlur: 45 };
        expect(replaceImage(design, 'new').imageBlur).toBe(45);
        expect(replaceImage(design, 'new', false).imageZoom).toBe(1.08);
        expect(setImageFit(design, 'contain')).toMatchObject({ imageZoom: 1, imageOffsetX: 0, imageOffsetY: 0 });
        expect(resetImageAdjustments(design)).toMatchObject({ imageBlur: 0, imageFit: 'cover', imageTone: 'ink' });
    });
    it('respects layer locks for image, position, typography, and colors', () => {
        const design = { ...defaultPostDesign, imageUri: 'photo', lockedLayers: ['visual' as const, 'headline' as const] };
        for (const value of [moveImage(design, 20, 20), setImageEffect(design, 'imageBlur', 20), replaceImage(design, 'other'), positionText(design, 'headline', { x: 10 }), setTextTypography(design, 'headline', { size: 150 }), setTextColor(design, 'headline', '#123456')]) expect(value).toBe(design);
    });
    it('uses Hind for Devanagari even when Onest was explicitly selected', () => {
        const design = setTextTypography({ ...defaultPostDesign, headline: 'नेपालको समाचार' }, 'headline', { font: 'onest', size: 140 });
        const style = textTypographyStyle(design, 'headline');
        expect(style.fontFamily).toBe('Hind_600SemiBold'); expect(style.lineHeight).toBeGreaterThanOrEqual(style.fontSize * 1.5);
    });
    it('clamps positions and colors and records one undo step per gesture', () => {
        expect(positionText(defaultPostDesign, 'headline', { x: 100 }).textPositions.headline.x).toBe(50);
        expect(snapTextPosition(1.4, true)).toBe(0);
        expect(normalizeTextColor('#abc')).toBe('#AABBCC'); expect(normalizeTextColor('no')).toBeNull();
        const next = { ...defaultPostDesign, headline: 'Edited' };
        expect(commitInteraction(defaultPostDesign, next, [])).toEqual([defaultPostDesign]);
        expect(commitInteraction(next, next, [])).toEqual([]);
        expect(wheelMovement(0, 10, 0, true)).toEqual({ x: 3.5, y: 0 });
    });
});

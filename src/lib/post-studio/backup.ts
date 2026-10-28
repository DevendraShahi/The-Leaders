import { z } from 'zod';
import { draftSchema, type PostDraft } from './drafts';
export const backupLimit = 60 * 1024 * 1024;
const backupSchema = z.object({ kind: z.literal('the-leaders-studio'), version: z.literal(1), exportedAt: z.string().datetime(), drafts: z.array(draftSchema).min(1).max(500) });
const rasterData = /^data:image\/(png|jpeg|webp|avif|gif);base64,[A-Za-z0-9+/=\s]+$/i;
export async function serializeDraftBackup(drafts: PostDraft[]): Promise<string> {
    const cache = new Map<string, Promise<string>>();
    const embed = (uri: string): Promise<string> => {
        if (rasterData.test(uri)) return Promise.resolve(uri);
        if (!/^(https?:\/\/|\/(?!\/))/.test(uri)) return Promise.reject(new Error('A draft has a temporary or unsupported image. Replace it before making a portable backup.'));
        if (!cache.has(uri)) cache.set(uri, (async () => {
            const response = await fetch(uri, { signal: AbortSignal.timeout(15000) });
            if (!response.ok) throw new Error('An image could not be included. No incomplete backup was downloaded.');
            const blob = await response.blob();
            if (!/^image\/(png|jpeg|webp|avif|gif)$/i.test(blob.type) || blob.size > 20 * 1024 * 1024) throw new Error('Backup images must be PNG, JPG, WebP, AVIF or GIF under 20 MB.');
            const bytes = new Uint8Array(await blob.arrayBuffer());
            let binary = ''; for (let offset = 0; offset < bytes.length; offset += 32768) binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
            return `data:${blob.type};base64,${btoa(binary)}`;
        })());
        return cache.get(uri)!;
    };
    const prepared: PostDraft[] = [];
    for (const draft of drafts) {
        const copy = structuredClone(draft);
        if (copy.design.imageUri) copy.design.imageUri = await embed(copy.design.imageUri);
        for (const image of copy.design.placedImages ?? []) image.uri = await embed(image.uri);
        prepared.push(copy);
        if (JSON.stringify(prepared).length > backupLimit) throw new Error('This backup exceeds 60 MB. Back up a smaller selection of drafts.');
    }
    const text = JSON.stringify(backupSchema.parse({ kind: 'the-leaders-studio', version: 1, exportedAt: new Date().toISOString(), drafts: prepared }));
    if (new TextEncoder().encode(text).length > backupLimit) throw new Error('This backup exceeds 60 MB. Back up a smaller selection of drafts.');
    return text;
}
export function prepareDraftRestore(text: string): { drafts: PostDraft[]; active: number; trashed: number } {
    if (new TextEncoder().encode(text).length > backupLimit) throw new Error('Choose a Studio backup smaller than 60 MB.');
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch { throw new Error('The backup is not valid JSON.'); }
    const result = backupSchema.safeParse(parsed);
    if (!result.success) throw new Error('This is not a supported Studio backup. Your existing drafts have not changed.');
    const ids = new Set(result.data.drafts.map(draft => draft.id));
    if (ids.size !== result.data.drafts.length) throw new Error('This backup contains duplicate draft IDs.');
    const prefix = `restore-${crypto.randomUUID()}`, carousels = new Map<string, string>();
    const drafts = result.data.drafts.map((draft, index) => {
        for (const uri of [draft.design.imageUri, ...(draft.design.placedImages ?? []).map(image => image.uri)]) if (uri && !rasterData.test(uri)) throw new Error('This backup has an external or unsupported image. Restore requires embedded raster images.');
        if (draft.carouselId && !carousels.has(draft.carouselId)) carousels.set(draft.carouselId, `${prefix}-carousel-${carousels.size}`);
        return { ...draft, id: `${prefix}-${index}`, carouselId: draft.carouselId ? carousels.get(draft.carouselId) : undefined };
    });
    return { drafts, active: drafts.filter(draft => !draft.trashedAt).length, trashed: drafts.filter(draft => draft.trashedAt).length };
}

import { echo11Variant, randomEcho11Variant } from './echo11-copy';
// Ported from mobile/src/features/post-designer; keep artwork behavior in sync.
import AsyncStorage from "./storage";
import { z } from "zod";
import { cricketDataSchema } from './cricket-data';
import { historyDataSchema } from './history-data';
import { defaultPostDesign, defaultTextPositions, defaultTextColors, defaultTextTypography, type PostDesign, type PlacedImage } from "./types";

const layer = z.enum(["visual", "kicker", "headline", "supporting", "footer"]);
const position = z.object({ x: z.number().min(-50).max(50), y: z.number().min(-50).max(50) });
const typographySettings = z.object({ font: z.enum(["auto", "onest", "hind"]), size: z.number().min(40).max(180), lineSpacing: z.number().min(90).max(180), shadow: z.number().min(0).max(100) });
export const placedImageSchema: z.ZodType<PlacedImage> = z.object({
    id: z.string(),
    uri: z.string(),
    x: z.number(),
    y: z.number(),
    scale: z.number(),
    rotation: z.number().optional(),
    opacity: z.number().optional(),
    borderRadius: z.number().optional(),
    fit: z.enum(['cover', 'contain']).optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    placement: z.enum(['custom', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'center', 'split-left', 'split-right']).optional(),
    layer: z.enum(['back', 'middle', 'front']).optional(),
    credit: z.string().optional(),
    hidden: z.boolean().optional(),
    locked: z.boolean().optional(),
});
export const postDesignSchema = z.object({
    template: z.enum(["breaking", "explainer", "quote", "book-review", "book-analysis", "book-takeaways", "book-verdict", "cricket", "history"]), format: z.enum(["square", "portrait", "story", "landscape"]),
    category: z.string(), eyebrow: z.string(), headline: z.string(), summary: z.string(), author: z.string(),
    imageUri: z.string().nullable(), imageCredit: z.string().max(2000).default(''), accent: z.string().regex(/^#[\da-f]{6}$/i),
    headlineScale: z.number().finite().positive(), textAlign: z.enum(["left", "center"]), imageTone: z.enum(["ink", "clear", "warm"]),
    imageOffsetX: z.number().finite(), imageOffsetY: z.number().finite(), hiddenLayers: z.array(layer), lockedLayers: z.array(layer),
    textPositions: z.object({ kicker: position, headline: position, supporting: position, footer: position }).default(defaultTextPositions),
    textColors: z.object({ kicker: z.string().regex(/^#[\da-f]{6}$/i).nullable(), headline: z.string().regex(/^#[\da-f]{6}$/i).nullable(), supporting: z.string().regex(/^#[\da-f]{6}$/i).nullable(), footer: z.string().regex(/^#[\da-f]{6}$/i).nullable() }).default(defaultTextColors),
    textTypography: z.object({ headline: typographySettings, supporting: typographySettings, kicker: typographySettings, footer: typographySettings }).default(defaultTextTypography),
    imageFit: z.enum(["cover", "contain"]).default("cover"),
    imageZoom: z.number().min(0.1).max(10).default(1.08),
    imageBlur: z.number().min(0).max(100).default(0),
    imageVintage: z.number().min(0).max(100).default(0),
    imageFeather: z.number().min(0).max(100).default(0),
    backgroundColor: z.string().nullable().optional(),
    backgroundGradient: z.string().nullable().optional(),
    cricket: cricketDataSchema.optional(),
    history: historyDataSchema.optional(),
    contentLanguage: z.enum(['en', 'ne']).optional(),
    researchTopic: z.string().max(80).optional(),
    series: z.object({ topic: z.string().max(40), issue: z.string().max(12) }).optional(),
    editorialReview: z.object({ fingerprint: z.string().max(100000), languageChecked: z.boolean(), claims: z.array(z.object({ text: z.string().max(10000), status: z.enum(['needs-checking', 'verified', 'unsupported']), sources: z.array(z.string().url().refine(value => /^https?:\/\//i.test(value))).max(10), note: z.string().max(2000) })).max(10) }).optional(),
    newsStyle: z.enum(['daily', 'hot', 'report', 'do-you-know', 'interesting-facts']).optional(),
    echo11Variant: z.number().int().min(0).max(7).optional(),
    placedImages: z.array(placedImageSchema).optional(),
    sourceUrls: z.array(z.string().url().refine(value => /^https?:\/\//i.test(value))).max(10).optional(),
    fixtureId: z.string().min(1).optional(),
    cricketStyle: z.enum(['stadium', 'editorial', 'classic']).optional(),
    playerPhotoId: z.string().min(1).optional(),
});
export const draftSchema = z.object({ id: z.string().min(1), name: z.string().trim().min(1).max(100), createdAt: z.string().datetime(), updatedAt: z.string().datetime(), trashedAt: z.string().datetime().nullable(), design: postDesignSchema,
    carouselId: z.string().min(1).optional(), carouselOrder: z.number().int().nonnegative().optional(),
});
const librarySchema = z.object({ version: z.literal(1), drafts: z.array(draftSchema) });
export type PostDraft = z.infer<typeof draftSchema>;
const queues = new Map<string, Promise<unknown>>();
export async function readPreviousLocalDesign() {
    const stored = localStorage.getItem("the-leaders:news-post-designer:draft");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return postDesignSchema.parse({ ...defaultPostDesign, ...parsed.design, imageUri: parsed.design?.imageUrl || null });
}
const keyFor = (scope: string) => {
    if (!scope.trim()) throw new Error("Sign in before opening drafts.");
    return `the-leaders:studio:web-drafts:v1:${scope}`;
};
async function read(scope: string) {
    const stored = await AsyncStorage.getItem(keyFor(scope));
    if (!stored) return [];
    const parsed = librarySchema.safeParse(JSON.parse(stored));
    if (!parsed.success) throw new Error("Your draft library could not be read. The saved data has been preserved.");
    return parsed.data.drafts.map(draft => ({ ...draft, design: { ...draft.design, echo11Variant: echo11Variant(draft.design.echo11Variant, draft.id) } }));
}
async function change<T>(scope: string, operation: (drafts: PostDraft[]) => T) {
    const previous = queues.get(scope) ?? Promise.resolve();
    const operationWithStorage = async () => {
        const drafts = await read(scope);
        const result = operation(drafts);
        await AsyncStorage.setItem(keyFor(scope), JSON.stringify(librarySchema.parse({ version: 1, drafts })));
        return result;
    };
    const pending = previous.catch(() => undefined).then(async (): Promise<T> => {
        if (typeof navigator !== "undefined" && navigator.locks) return await navigator.locks.request(keyFor(scope), operationWithStorage);
        return await operationWithStorage();
    });
    queues.set(scope, pending);
    try { return await pending; } finally { if (queues.get(scope) === pending) queues.delete(scope); }
}
export async function listDrafts(scope: string) {
    await queues.get(scope)?.catch(() => undefined);
    return (await read(scope)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export async function readDraft(scope: string, id: string) {
    const draft = (await listDrafts(scope)).find(item => item.id === id && !item.trashedAt);
    if (!draft) throw new Error("This draft is unavailable. Open another draft from Studio.");
    return draft;
}
export function createDraft(scope: string, name = "Untitled post", design: PostDesign = defaultPostDesign, carousel?: { carouselId: string; carouselOrder: number }) {
    return change(scope, drafts => {
        const now = new Date().toISOString();
        const draft = draftSchema.parse({ id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`, name, createdAt: now, updatedAt: now, trashedAt: null, design: { ...design, echo11Variant: design.echo11Variant ?? randomEcho11Variant() }, ...carousel });
        drafts.push(draft); return draft;
    });
}
export function updateDraft(scope: string, id: string, patch: { name?: string; design?: PostDesign }) {
    return change(scope, drafts => {
        const index = drafts.findIndex(item => item.id === id && !item.trashedAt);
        if (index < 0) throw new Error("This draft is unavailable. Return to Studio.");
        drafts[index] = draftSchema.parse({ ...drafts[index], ...patch, updatedAt: new Date().toISOString() });
        return drafts[index];
    });
}

/** Persist a complete carousel edit in one transaction, preserving concurrent renames. */
export function saveDraftCollection(scope: string, entries: PostDraft[]) {
    return change(scope, drafts => {
        if (!entries.length || new Set(entries.map(entry => entry.id)).size !== entries.length) throw new Error("Invalid carousel draft set.");
        const now = new Date().toISOString();
        const prepared = entries.map(entry => {
            const index = drafts.findIndex(item => item.id === entry.id && !item.trashedAt);
            if (index < 0) throw new Error("A slide is unavailable. Keep the editor open and restore it from Trash before retrying.");
            return { index, value: draftSchema.parse({ ...drafts[index], design: entry.design, carouselId: entry.carouselId, carouselOrder: entry.carouselOrder, updatedAt: now }) };
        });
        for (const { index, value } of prepared) drafts[index] = value;
    });
}
export async function duplicateDraft(scope: string, id: string) {
    const original = await readDraft(scope, id);
    return createDraft(scope, `${original.name.slice(0, 93)} (copy)`, original.design);
}
export function setDraftTrashed(scope: string, id: string, trashed: boolean) {
    return change(scope, drafts => {
        const draft = drafts.find(item => item.id === id);
        if (!draft) throw new Error("Draft not found.");
        draft.trashedAt = trashed ? new Date().toISOString() : null;
    });
}


/** Import a prepared carousel atomically and keep any existing editor changes. */
export function createDraftCollection(scope: string, entries: { id: string; name: string; design: PostDesign; carouselId?: string; carouselOrder?: number }[]) {
    return change(scope, drafts => {
        if (!entries.length || entries.length > 20 || new Set(entries.map(entry => entry.id)).size !== entries.length) throw new Error("Invalid carousel draft set.");
        const now = new Date().toISOString();
        const prepared = entries.map(entry => {
            const existing = drafts.find(draft => draft.id === entry.id);
            if (existing?.trashedAt) throw new Error("This carousel is in Trash. Restore it before opening it again.");
            return existing ?? draftSchema.parse({ ...entry, design: { ...entry.design, echo11Variant: entry.design.echo11Variant ?? randomEcho11Variant() }, createdAt: now, updatedAt: now, trashedAt: null });
        });
        for (const draft of prepared) if (!drafts.some(existing => existing.id === draft.id)) drafts.push(draft);
        return prepared;
    });
}


/** Restore a validated backup atomically as copies, preserving existing local work. */
export function restoreDraftCopies(scope: string, copies: PostDraft[]) {
    return change(scope, drafts => {
        if (!copies.length || copies.length > 500 || new Set(copies.map(draft => draft.id)).size !== copies.length) throw new Error('Invalid backup draft set.');
        const prepared = copies.map(draft => draftSchema.parse(draft));
        for (const draft of prepared) {
            const existing = drafts.find(item => item.id === draft.id);
            if (existing && JSON.stringify(existing) !== JSON.stringify(draft)) throw new Error('An imported copy changed. Choose the backup again to restore another copy.');
        }
        for (const draft of prepared) if (!drafts.some(item => item.id === draft.id)) drafts.push(draft);
        return prepared.length;
    });
}

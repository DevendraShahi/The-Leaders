import { z } from "zod";

export const socialPostTemplates = ["news", "breaking", "quote", "data"] as const;
export const socialPostFormats = ["square", "portrait", "story"] as const;
export const socialPostLocales = ["en", "ne"] as const;
export const socialPostStates = ["draft", "in_review", "changes_requested", "approved", "exported"] as const;
export const socialPhotoFilters = ["none", "vintage", "mono", "warm", "cool", "dramatic"] as const;
export const socialFontBounds = { headlineSize: [36, 96], deckSize: [16, 40] } as const;
export type SocialTypography = Partial<Record<SocialPostLocale, { headlineSize?: number; deckSize?: number }>>;

export type SocialPostTemplate = (typeof socialPostTemplates)[number];
export type SocialPostFormat = (typeof socialPostFormats)[number];
export type SocialPostLocale = (typeof socialPostLocales)[number];
export type SocialPostState = (typeof socialPostStates)[number];

export const socialPostDimensions: Record<SocialPostFormat, readonly [number, number]> = {
    square: [1080, 1080],
    portrait: [1080, 1350],
    story: [1080, 1920],
};

const localizedCopySchema = z.object({
    headline: z.string().trim().max(180).default(""),
    deck: z.string().trim().max(360).default(""),
    category: z.string().trim().max(48).default("NEWS"),
    eyebrow: z.string().trim().max(72).default(""),
    quoteSpeaker: z.string().trim().max(120).default(""),
    quoteContext: z.string().trim().max(180).default(""),
    statisticValue: z.string().trim().max(48).default(""),
    statisticLabel: z.string().trim().max(120).default(""),
    statisticAsOf: z.string().trim().max(80).default(""),
    captionInstagram: z.string().trim().max(2200).default(""),
    captionFacebook: z.string().trim().max(5000).default(""),
    hashtags: z.array(z.string().trim().max(60)).max(20).default([]),
    linkText: z.string().trim().max(120).default(""),
    altText: z.string().trim().max(500).default(""),
});

const cropSchema = z.object({
    focalX: z.number().min(0).max(1).default(0.5),
    focalY: z.number().min(0).max(1).default(0.5),
    zoom: z.number().min(1).max(2.5).default(1),
});
const typographySchema = z.object({
    headlineSize: z.number().int().min(socialFontBounds.headlineSize[0]).max(socialFontBounds.headlineSize[1]).optional(),
    deckSize: z.number().int().min(socialFontBounds.deckSize[0]).max(socialFontBounds.deckSize[1]).optional(),
});

const sourceSchema = z.object({
    url: z.string().url(),
    publisher: z.string().trim().max(160).default(""),
    title: z.string().trim().max(300).default(""),
    publishedAt: z.string().datetime().optional(),
    excerpt: z.string().trim().max(5000).default(""),
    trusted: z.boolean().default(false),
    verifiedAt: z.string().datetime().optional(),
    verifiedBy: z.string().optional(),
});

export const socialPostCreateSchema = z.object({
    title: z.string().trim().min(1).max(160).default("Untitled social post"),
    templateId: z.enum(socialPostTemplates).default("news"),
    format: z.enum(socialPostFormats).default("portrait"),
    outputLanguage: z.enum(socialPostLocales).default("ne"),
    reviewerId: z.string().optional().nullable(),
    sourceStory: z.object({ entityType: z.enum(["article", "brief", "column"]), id: z.string() }).optional().nullable(),
});

export const socialPostPatchSchema = z.object({
    revision: z.number().int().min(0),
    title: z.string().trim().min(1).max(160).optional(),
    templateId: z.enum(socialPostTemplates).optional(),
    format: z.enum(socialPostFormats).optional(),
    outputLanguage: z.enum(socialPostLocales).optional(),
    typography: z.object({ en: typographySchema.optional(), ne: typographySchema.optional() }).optional(),
    reviewerId: z.string().nullable().optional(),
    copy: z.object({
        en: localizedCopySchema.optional(),
        ne: localizedCopySchema.optional(),
    }).optional(),
    media: z.object({
        mediaId: z.string().nullable().optional(),
        credit: z.string().trim().max(200).optional(),
        rightsStatus: z.enum(["licensed", "owned", "public_domain", "permission_granted", "unknown"]).optional(),
        filter: z.enum(socialPhotoFilters).optional(),
        filterIntensity: z.number().min(0).max(1).optional(),
        crop: cropSchema.optional(),
    }).optional(),
    sources: z.array(sourceSchema).max(12).optional(),
    sourceStory: z.object({ entityType: z.enum(["article", "brief", "column"]), id: z.string() }).nullable().optional(),
    internalNotes: z.string().trim().max(4000).optional(),
    verification: z.object({ claimsConfirmed: z.boolean(), sourcesConfirmed: z.boolean() }).optional(),
});

export type SocialPostPatch = z.infer<typeof socialPostPatchSchema>;

export function isContentChange(patch: SocialPostPatch): boolean {
    return ["title", "templateId", "format", "outputLanguage", "typography", "copy", "media", "sources", "sourceStory", "verification"].some(
        (key) => Object.prototype.hasOwnProperty.call(patch, key),
    );
}

export function canTransition(from: SocialPostState, to: SocialPostState): boolean {
    const transitions: Record<SocialPostState, SocialPostState[]> = {
        draft: ["in_review"],
        in_review: ["changes_requested", "approved"],
        changes_requested: ["draft", "in_review"],
        approved: ["exported"],
        exported: [],
    };
    return transitions[from].includes(to);
}

export function outputFilename(title: string, locale: SocialPostLocale, format: SocialPostFormat, revision: number) {
    const stem = title
        .normalize("NFKD")
        .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 72) || "the-leaders-social-post";
    return `${stem}-${locale}-${format}-r${revision}.png`;
}

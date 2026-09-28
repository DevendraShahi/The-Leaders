import { z } from "zod";

export const bilingualSchema = z.object({
    en: z.string(),
    ne: z.string(),
});

export const pageSchema = <T extends z.ZodType>(item: T) =>
    z.object({
        items: z.array(item),
        page: z.number().int().positive(),
        limit: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        hasMore: z.boolean(),
    });

export const articleCardSchema = z.object({
    slug: z.string(),
    source: z.enum(["article", "column", "analysis"]),
    title: bilingualSchema,
    excerpt: bilingualSchema,
    author: bilingualSchema,
    category: bilingualSchema,
    image: z.string(),
    publishedAt: z.string(),
    tags: z.array(z.string()),
});

export const articleDetailSchema = articleCardSchema.extend({
    content: bilingualSchema,
});

export const briefCardSchema = z.object({
    slug: z.string(),
    title: bilingualSchema,
    summary: bilingualSchema,
    image: z.string(),
    date: z.string(),
    tags: z.array(z.string()),
});

export const briefDetailSchema = briefCardSchema.extend({
    content: bilingualSchema,
});

export const factCheckCardSchema = z.object({
    slug: z.string(),
    claim: bilingualSchema,
    claimBy: bilingualSchema,
    verdict: z.enum(["true", "false", "misleading", "unverified"]),
    image: z.string(),
    date: z.string(),
});

export const factCheckDetailSchema = factCheckCardSchema.extend({
    analysis: bilingualSchema,
    sources: z.array(z.string()),
});

export const leaderCardSchema = z.object({
    slug: z.string(),
    name: bilingualSchema,
    desc: bilingualSchema,
    party: bilingualSchema,
    position: bilingualSchema,
    years: bilingualSchema,
    image: z.string(),
    cover: z.string(),
    isActive: z.boolean(),
});

export const leaderDetailSchema = leaderCardSchema.extend({
    bio: bilingualSchema,
    stats: z.array(z.object({
        key: z.string(),
        value: bilingualSchema,
    })),
    timeline: z.array(z.object({
        year: z.string(),
        event: bilingualSchema,
    })),
});

export const historyEpisodeSchema = z.object({
    id: z.string(),
    eraId: z.string(),
    title: bilingualSchema,
    description: bilingualSchema,
    year: z.string(),
    image: z.string(),
});

export const historyEraSchema = z.object({
    id: z.string(),
    title: bilingualSchema,
    description: bilingualSchema,
    period: bilingualSchema,
    episodes: z.array(historyEpisodeSchema),
});

export const partyCardSchema = z.object({
    id: z.string(),
    name: bilingualSchema,
    shortName: z.string(),
    leader: z.string(),
    symbol: z.string(),
    logo: z.string(),
    status: z.string(),
    ideology: z.string(),
    seats: z.number(),
});

export const candidateCardSchema = z.object({
    slug: z.string(),
    name: z.string(),
    party: z.string(),
    district: z.string(),
    constituency: z.string(),
    province: z.string(),
    gender: z.string(),
    image: z.string(),
    age: z.number().nullable(),
});

export const manifestoCardSchema = z.object({
    slug: z.string(),
    partyName: bilingualSchema,
    partyShort: z.string(),
    blurb: bilingualSchema,
    year: z.string(),
    fileUrl: z.string(),
    fileSizeLabel: z.string(),
});

export const snapshotSchema = z.object({
    electionDate: z.string(),
    cycleLabel: bilingualSchema,
    stats: z.array(z.object({
        id: z.string(),
        label: bilingualSchema,
        value: bilingualSchema,
        hint: bilingualSchema,
        source: bilingualSchema,
    })),
    seats: z.array(z.object({
        party: z.string(),
        partySlug: z.string(),
        seats: z.number(),
        fptpSeats: z.number(),
        prSeats: z.number(),
        voteShare: z.number(),
    })),
});

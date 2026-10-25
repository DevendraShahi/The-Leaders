import { z } from 'zod';
const bilingual = z.object({ en: z.string(), ne: z.string() });
export const dailyEdition = z.object({
    id: z.string(), date: z.string(), edition: z.enum(['morning', 'evening']), title: bilingual, caption: bilingual,
    status: z.enum(['draft', 'in_review', 'ready', 'reviewed']).transform(value => value === 'reviewed' ? 'ready' as const : value), updatedAt: z.string().datetime(), createdAt: z.string().datetime(),
    reviewedAt: z.string().datetime().nullish(), reviewInvalidatedAt: z.string().datetime().nullish(),
    sources: z.array(z.object({ id: z.string(), name: z.string(), url: z.string().url(), publishedAt: z.string().datetime(), verifiedAt: z.string().datetime(), support: z.string() })),
    slides: z.array(z.object({ section: z.string(), headline: bilingual, body: bilingual, sourceIds: z.array(z.string()), eventDate: z.string().optional(), eventTime: z.string().datetime().optional(), venue: z.string().optional() })),
    omissions: z.array(bilingual),
});
export type DailyEdition = z.infer<typeof dailyEdition>;
export type DailyReviewChanges = { id: string; updatedAt: string; status?: 'draft' | 'in_review' | 'ready'; caption?: { en: string; ne: string } };

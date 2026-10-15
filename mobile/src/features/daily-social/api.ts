import { z } from 'zod';
import { accountApiBase } from '@/services/admin-account';
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
export async function dailyRequest(token: string | null, body?: DailyReviewChanges) {
    if (!token) throw new Error('Sign in before opening daily editions.');
    const response = await fetch(`${accountApiBase()}/api/v1/auth/daily-social`, { method: body ? 'PATCH' : 'GET', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to load daily social drafts.');
    return body ? null : z.object({ editions: z.array(dailyEdition) }).parse(data).editions;
}

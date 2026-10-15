import { z } from 'zod';
import { isSafeExternalUrl } from '@/lib/trusted-sources';
const bilingual = (max: number) => z.object({ en: z.string().trim().min(1).max(max), ne: z.string().trim().min(1).max(max) }).strict();
export function nepalDay(at = new Date()) {
    const parts = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Kathmandu', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(at);
    const part = (type: string) => parts.find(value => value.type === type)?.value;
    return `${part('year')}-${part('month')}-${part('day')}`;
}
export function dueEdition(at = new Date()): 'morning' | 'evening' | null {
    const hour = Number(new Intl.DateTimeFormat('en', { timeZone: 'Asia/Kathmandu', hour: '2-digit', hourCycle: 'h23' }).format(at));
    return hour >= 7 && hour < 10 ? 'morning' : hour >= 21 ? 'evening' : null;
}
export const dailySocialInput = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), edition: z.enum(['morning', 'evening']),
    title: bilingual(120), caption: bilingual(1800),
    sources: z.array(z.object({ id: z.string().regex(/^[a-z\d-]{1,40}$/), name: z.string().min(1).max(100), url: z.string().url().refine(value => value.startsWith('https://') && isSafeExternalUrl(value)), publishedAt: z.string().datetime(), verifiedAt: z.string().datetime(), support: z.string().trim().min(10).max(400) }).strict()).min(1).max(20),
    slides: z.array(z.object({
        section: z.enum(['headlines', 'watch', 'go', 'enjoy', 'recap', 'tomorrow', 'weather', 'sports', 'good-news', 'context']),
        headline: bilingual(120), body: bilingual(320), sourceIds: z.array(z.string()).min(1).max(4),
        happenedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), eventTime: z.string().datetime().optional(), venue: z.string().trim().min(1).max(150).optional(),
    }).strict()).min(1).max(9),
    omissions: z.array(bilingual(200)).max(10).default([]),
}).strict().superRefine((value, ctx) => {
    const now = Date.now();
    const error = (message: string) => ctx.addIssue({ code: 'custom', message });
    if (value.date !== nepalDay()) error('Only the current Nepal date can be prepared.');
    const ids = new Set(value.sources.map(source => source.id));
    if (ids.size !== value.sources.length) error('Source identifiers must be unique.');
    for (const source of value.sources) {
        if (Date.parse(source.verifiedAt) > now + 300000 || Date.parse(source.verifiedAt) < now - 2 * 3600000) error('Sources need a recent actual verification timestamp.');
        if (Date.parse(source.publishedAt) > now + 300000) error('Source publication cannot be in the future.');
    }
    for (const slide of value.slides) {
        if (value.edition === 'evening' && ['recap', 'headlines', 'sports', 'good-news'].includes(slide.section) && slide.happenedOn !== value.date) error('Evening recap claims must identify a development from the edition day.');
        if (slide.sourceIds.some(id => !ids.has(id))) error('Every slide must reference supplied source evidence.');
        if (['go', 'enjoy'].includes(slide.section) && (!slide.eventDate || !slide.venue)) error('Go/enjoy items require a confirmed event date and venue.');
        if (slide.eventDate && slide.eventDate !== value.date && !(slide.section === 'tomorrow' && slide.eventDate === nepalDay(new Date(now + 86400000)))) error('Event dates must match the edition day (or the next day for tomorrow).');
        if (slide.eventTime && (!slide.eventDate || nepalDay(new Date(slide.eventTime)) !== slide.eventDate)) error('Event time must match its confirmed Nepal date.');
        if (['headlines', 'recap', 'weather', 'sports'].includes(slide.section)) {
            const selected = value.sources.filter(source => slide.sourceIds.includes(source.id));
            if (selected.some(source => Date.parse(source.publishedAt) < now - 36 * 3600000)) error('News slides require recent reporting, not old headlines.');
        }
    }
});
export type DailySocialInput = z.infer<typeof dailySocialInput>;

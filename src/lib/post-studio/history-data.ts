import { z } from 'zod';
import { historyPromptFields, historyTemplateIds, type HistoryFieldId, type HistoryTemplateId } from './history-catalog';

const text = (max: number) => z.string().max(max);

/** Character ceilings per event field; drives inspector limits and prompt validation. */
export const historyFieldLimits: Record<HistoryFieldId, number> = {
    year: 30, dateLabel: 60, subject: 120, role: 120, era: 60, place: 120, lifespan: 40, fact: 240, body: 900,
};

export const historyDataSchema = z.object({
    template: z.enum(historyTemplateIds),
    language: z.enum(['en', 'ne']),
    sample: z.boolean().default(false),
    pageKind: z.enum(['cover', 'paragraph']).default('cover'),
    storyScope: z.enum(['national', 'international']).optional(),
    body: text(historyFieldLimits.body).default(''),
    year: text(historyFieldLimits.year),
    dateLabel: text(historyFieldLimits.dateLabel),
    subject: text(historyFieldLimits.subject),
    role: text(historyFieldLimits.role),
    era: text(historyFieldLimits.era),
    place: text(historyFieldLimits.place),
    lifespan: text(historyFieldLimits.lifespan),
    fact: text(historyFieldLimits.fact),
    sourceUrl: z.string().refine(value => value === '' || /^https?:\/\/[^\s]+$/.test(value), 'Use a source URL beginning with https://.'),
    updatedAt: z.string().refine(value => value === '' || !Number.isNaN(Date.parse(value)), 'Use a valid update timestamp.'),
});
export type HistoryData = z.infer<typeof historyDataSchema>;

/** Empty event fields for authored drafts; gallery samples live in history-design.ts. */
export function blankHistoryData(template: HistoryTemplateId = 'on-this-day'): HistoryData {
    return { template, language: 'en', sample: false, pageKind: 'cover', body: '', year: '', dateLabel: '', subject: '', role: '', era: '', place: '', lifespan: '', fact: '', sourceUrl: '', updatedAt: '' };
}

/** Every sample/blank carries all fields so artwork reads never hit undefined. */
export const defaultHistoryData = blankHistoryData;

/** Devanagari digit form used for year and counts in Nepali copies. */
export const historyNumber = (value: number | string | null, language: 'en' | 'ne') => {
    const rendered = value === null || value === '' ? '—' : String(value);
    return language === 'ne' ? rendered.replace(/\d/g, digit => '०१२३४५६७८९'[Number(digit)]) : rendered;
};

export const historyFieldsFor = (id: HistoryTemplateId): readonly HistoryFieldId[] => historyPromptFields[id];

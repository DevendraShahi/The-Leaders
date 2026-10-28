import { describe, expect, it } from 'vitest';
import { historyTemplateIds, historyTemplates } from '@/lib/post-studio/history-catalog';
import { blankHistoryData, historyDataSchema } from '@/lib/post-studio/history-data';
import { createHistoryDesign, createHistoryParagraphDesign, historyIssues } from '@/lib/post-studio/history-design';
import { digestCreationResponse, generateCreationPrompt, generateCreationRepairPrompt, type PromptOptions } from '@/lib/post-studio/prompt-engine';
import { historyEditions } from '@/lib/post-studio/history-prompt';
import { creationGaps } from '@/lib/post-studio/creation-workflow';
import { postOutputDimensions } from '@/lib/post-studio/types';
const options: PromptOptions = { kind: 'history', templates: ['on-this-day'], language: 'en', format: 'portrait', brief: '', historyDate: '2026-03-04' };
const extract = () => JSON.parse(generateCreationPrompt(options).split('RETURN THIS JSON OBJECT:\n```json\n')[1].split('\n```')[0]);
const filled = () => ({ posts: historyEditions.map(({ scope, language }) => ({ template: 'on-this-day', scope, language,
    headline: `${scope} ${language} test event`, data: { year: scope === 'national' ? '1900 B.S.' : '1800', dateLabel: scope === 'national' ? 'Nepali month/day (B.S.)' : '4 MARCH', subject: `${scope} test event`, fact: 'Illustrative test fixture.' },
    sources: [`https://example.org/${scope}`], paragraphs: [] as { heading: string; body: string }[],
})) });
describe('Bilingual History carousel contracts', () => {
    it('retains one artwork design and returns four fixed editions in the requested order', () => {
        expect(historyTemplates.map(item => item.id)).toEqual(['on-this-day']);
        expect(extract().posts.map((post: { scope: string; language: string }) => `${post.scope}-${post.language}`)).toEqual(['national-ne', 'national-en', 'international-en', 'international-ne']);
    });
    for (const format of Object.keys(postOutputDimensions) as (keyof typeof postOutputDimensions)[]) it(`${format}: imports all four editions with their own language and scope`, () => {
        const prepared = digestCreationResponse(JSON.stringify(filled()), { ...options, format });
        expect(prepared.designs).toHaveLength(4);
        expect(prepared.designs.map(design => `${design.history?.storyScope}-${design.history?.language}`)).toEqual(['national-ne', 'national-en', 'international-en', 'international-ne']);
        expect(prepared.designs.every(design => design.format === format && design.history?.sample === false)).toBe(true);
        expect(prepared.designs.flatMap(historyIssues)).toEqual([]);
        expect(creationGaps(prepared.designs)).toEqual([]);
    });
    it('keeps paragraph pages immediately after their own cover without dropping later covers', () => {
        const payload = filled();
        payload.posts[0].paragraphs = [{ heading: 'National Nepali context', body: 'Context for the first edition.' }];
        payload.posts[2].paragraphs = [{ heading: 'International English context', body: 'Context for the third edition.' }];
        const prepared = digestCreationResponse(JSON.stringify(payload), options);
        expect(prepared.designs.map(design => design.headline)).toEqual(['national ne test event', 'National Nepali context', 'national en test event', 'international en test event', 'International English context', 'international ne test event']);
        expect(prepared.designs[4].history).toMatchObject({ language: 'en', storyScope: 'international', pageKind: 'paragraph' });
        expect(prepared.designs.slice(0, 3).every(design => design.sourceUrls?.[0] === 'https://example.org/national')).toBe(true);
        expect(prepared.designs.slice(3).every(design => design.sourceUrls?.[0] === 'https://example.org/international')).toBe(true);
    });
    it('leaves unknown research facts blank in all four slots instead of inserting samples', () => {
        const prepared = digestCreationResponse(JSON.stringify(extract()), options);
        expect(prepared.designs).toHaveLength(4);
        expect(prepared.designs[0].history).toEqual({ ...blankHistoryData(), language: 'ne', storyScope: 'national' });
        expect(prepared.warnings).toHaveLength(4);
    });
    it('rejects missing editions, wrong ordering, unsafe links and excessive page totals', () => {
        const payload = filled();
        expect(() => digestCreationResponse(JSON.stringify({ posts: payload.posts.slice(0, 2) }), options)).toThrow();
        const reversed = filled(); reversed.posts.reverse();
        expect(() => digestCreationResponse(JSON.stringify(reversed), options)).toThrow();
        const excessive = filled(); excessive.posts.forEach(post => { post.paragraphs = Array.from({ length: 5 }, () => ({ heading: 'Context', body: 'Text' })); });
        expect(() => digestCreationResponse(JSON.stringify(excessive), options)).toThrow('20 pages total');
        payload.posts[0].sources = ['javascript:alert(1)'];
        expect(() => digestCreationResponse(JSON.stringify(payload), options)).toThrow();
    });
    it('keeps B.S. research for national editions and Gregorian research for international editions during creation and repair', () => {
        for (const prompt of [generateCreationPrompt(options), generateCreationRepairPrompt(options, '{broken', 'Invalid JSON')]) {
            expect(prompt).toContain('NATIONAL CALENDAR — BIKRAM SAMBAT');
            expect(prompt).toContain('calendar-conversion URL');
            expect(prompt).toContain('INTERNATIONAL CALENDAR — GREGORIAN');
            expect(prompt).toContain('National-Nepali, National-English, International-English, International-Nepali');
            expect(prompt).toContain('WEB RESEARCH REQUIRED');
            expect(prompt).not.toContain('image-first');
        }
    });
    it('does not substitute cover context for empty paragraph prose', () => {
        const paragraph = createHistoryParagraphDesign(createHistoryDesign('on-this-day'));
        expect(creationGaps([paragraph]).map(gap => gap.path)).toEqual(['history.body']);
    });
    it('keeps legacy saved topic drafts readable', () => {
        for (const template of historyTemplateIds) expect(historyDataSchema.parse({ ...blankHistoryData(template), pageKind: undefined, body: undefined }).pageKind).toBe('cover');
    });
});

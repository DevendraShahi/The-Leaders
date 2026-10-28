import { describe, expect, it } from 'vitest';
import { createNewsDesign, newsStyles } from '@/lib/post-studio/news-design';
import { postDesignSchema } from '@/lib/post-studio/drafts';
import { digestCreationResponse, generateCreationPrompt, responseSchema, type PromptOptions } from '@/lib/post-studio/prompt-engine';
describe('News desk', () => {
    it.each(newsStyles)('$title keeps its layout in saved drafts and imports one focused story', ({ id }) => {
        const design = postDesignSchema.parse(createNewsDesign(id));
        expect(design.newsStyle).toBe(id); expect(design.headline).toBe(''); expect(design.summary).toBe('');
        const options: PromptOptions = { kind: 'news', templates: ['breaking'], newsStyle: id, format: 'portrait', language: 'ne', brief: 'Confirmed source material' };
        const prompt = generateCreationPrompt(options);
        expect(prompt).toContain('Create ONE'); expect(prompt).toContain('120');
        const payload = { version: 1, title: 'News fixture', sources: [], posts: [{ template: 'breaking', headline: 'पुष्टि भएको समाचार', summary: 'समाचारको सन्दर्भ।' }] };
        const imported = digestCreationResponse(JSON.stringify(payload), options);
        expect(imported.designs).toHaveLength(1); expect(imported.designs[0].newsStyle).toBe(id);
        expect(imported.designs[0].eyebrow).not.toMatch(/DEVELOPING STORY/);
        expect(responseSchema(options).safeParse({ ...payload, posts: [{ ...payload.posts[0], headline: 'x'.repeat(121) }] }).success).toBe(false);
    });
});


describe('Knowledge and curiosity templates', () => {
    for (const style of ['do-you-know', 'interesting-facts'] as const) {
        it(`${style} asks for researched facts and preserves their sources`, () => {
            const options: PromptOptions = { kind: 'news', templates: ['breaking'], newsStyle: style, format: 'story', language: 'en', brief: 'A fact about Nepal' };
            const prompt = generateCreationPrompt(options);
            expect(prompt).toContain('Research reliable primary sources');
            expect(prompt).not.toContain('BREAKING: headline');
            const imported = digestCreationResponse(JSON.stringify({ version: 1, title: 'Verified fact', sources: ['https://example.org/evidence'], posts: [{ template: 'breaking', headline: 'A verified fact', summary: 'Its explanation and context.' }] }), options);
            expect(imported.designs[0].sourceUrls).toEqual(['https://example.org/evidence']);
            expect(imported.designs[0].newsStyle).toBe(style);
            expect(imported.designs[0].format).toBe('story');
        });
        for (const language of ['en', 'ne'] as const) it(`${style} starts with blank content and a localized label (${language})`, () => {
            const design = createNewsDesign(style, 'square', language);
            expect(design.headline).toBe('');
            expect(design.summary).toBe('');
            expect(design.category).not.toBe('NEWS');
            expect(design.eyebrow).toBe(style === 'do-you-know' ? language === 'ne' ? 'के तपाईंलाई थाहा छ?' : 'DO YOU KNOW?' : language === 'ne' ? 'रोचक तथ्य' : 'INTERESTING FACTS');
        });
    }
});


describe('Focused researched copy', () => {
    it.each(['do-you-know', 'interesting-facts'] as const)('%s avoids duplicate labels, unrelated discoveries and unsupported dates', newsStyle => {
        const prompt = generateCreationPrompt({ kind: 'news', templates: ['breaking'], newsStyle, format: 'portrait', language: 'en', brief: '' });
        expect(prompt).toContain('ONE verified fact');
        expect(prompt).toContain('Do not combine separate discoveries');
        expect(prompt).toContain('Do not repeat template labels');
        expect(prompt).toContain('Preserve approximate dates');
        expect(prompt).toContain('directly support the published claim');
        expect(prompt).toContain('"sources": []');
        expect(prompt).toContain('"template": "breaking"');
        expect(prompt).not.toContain('notOut');
        expect(prompt).not.toContain('innings');
        expect(prompt).not.toContain('player and proper names');
    });
});


it('imports the copyable JSON code block requested by the prompt', () => {
    const options: PromptOptions = { kind: 'news', templates: ['breaking'], newsStyle: 'do-you-know', format: 'portrait', language: 'en', brief: '' };
    const prompt = generateCreationPrompt(options);
    expect(prompt).toContain('exactly ONE fenced code block labelled json');
    expect(prompt).toContain('never Markdown links');
    expect(prompt).not.toContain('without Markdown');
    const response = '```json\n' + JSON.stringify({ posts: [{ template: 'breaking', headline: 'A verified fact', summary: 'Confirmed context.' }], sources: ['https://example.org/source'] }, null, 2) + '\n```';
    const imported = digestCreationResponse(response, options);
    expect(imported.designs[0].headline).toBe('A verified fact');
    expect(imported.designs[0].sourceUrls).toEqual(['https://example.org/source']);
});

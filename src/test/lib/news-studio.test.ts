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
        expect(prompt).toContain('Create exactly one story'); expect(prompt).toContain('120');
        const payload = { version: 1, title: 'News fixture', sources: [], posts: [{ template: 'breaking', headline: 'पुष्टि भएको समाचार', summary: 'समाचारको सन्दर्भ।' }] };
        const imported = digestCreationResponse(JSON.stringify(payload), options);
        expect(imported.designs).toHaveLength(1); expect(imported.designs[0].newsStyle).toBe(id);
        expect(imported.designs[0].eyebrow).not.toMatch(/DEVELOPING STORY/);
        expect(responseSchema(options).safeParse({ ...payload, posts: [{ ...payload.posts[0], headline: 'x'.repeat(121) }] }).success).toBe(false);
    });
});

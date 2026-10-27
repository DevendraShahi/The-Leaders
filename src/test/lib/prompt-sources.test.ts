// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/post-studio/storage', () => ({ default: { getItem: async () => null, setItem: async () => {} } }));
import { cricketTemplateIds } from '@/lib/post-studio/cricket-catalog';
import { generateCreationPrompt, generateCreationRepairPrompt, type PromptOptions } from '@/lib/post-studio/prompt-engine';
import { generateBookReviewMasterPrompt } from '@/lib/post-studio/book-review';

function expectImageFirst(prompt: string) {
    expect(prompt).toContain('IF AN IMAGE/PHOTO IS ATTACHED: Read it and update the response');
    expect(prompt).toContain('Do not search the web, replace its figures with newer online scores');
    expect(prompt).toContain('ONLY IF NO IMAGE/PHOTO IS ATTACHED:');
    expect(prompt).toContain('An unreadable or unrelated attachment does not authorize a web search.');
    expect(prompt).toContain('Do not invent a URL or verification timestamp for an attachment.');
}
describe('Image-first evidence in every Studio prompt', () => {
    it.each(cricketTemplateIds)('uses attached images before web sources in %s creation and repair', template => {
        for (const language of ['en', 'ne'] as const) {
            const options: PromptOptions = { kind: 'cricket', templates: [template], language, format: 'portrait', brief: '', teams: { teamId: 'lumbini', opponentId: 'sudurpaschim' } };
            expectImageFirst(generateCreationPrompt(options));
            expectImageFirst(generateCreationRepairPrompt(options, '{bad', 'Invalid JSON'));
            expect(generateCreationRepairPrompt(options, '{bad', 'Invalid JSON')).toContain('do not browse, even when some fields are unreadable');
        }
    });
    it.each(['breaking', 'explainer', 'quote'])('uses the same hierarchy for %s', template => {
        const options: PromptOptions = { kind: 'news', templates: [template], language: 'en', format: 'portrait', brief: 'Confirmed reporting' };
        expectImageFirst(generateCreationPrompt(options));
        expectImageFirst(generateCreationRepairPrompt(options, '{bad', 'Invalid JSON'));
    });
    it('applies the same rule to book reviews and multi-post cricket packs', () => {
        expectImageFirst(generateBookReviewMasterPrompt('The Republic', 'Plato'));
        expectImageFirst(generateCreationPrompt({ kind: 'cricket', templates: ['score', 'wicket', 'playing-xi'], language: 'en', format: 'portrait', brief: '' }));
    });
});

// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/post-studio/storage', () => ({ default: { getItem: async () => null, setItem: async () => {} } }));
import { cricketTemplateIds } from '@/lib/post-studio/cricket-catalog';
import { cricketFixtures, playoffFixture } from '@/lib/post-studio/cricket-fixtures';
import { cricketPromptFields, digestCreationResponse, generateCreationPrompt, generateCreationRepairPrompt, responseSchema, type PromptOptions } from '@/lib/post-studio/prompt-engine';

function contentObject(prompt: string) {
    const marker = prompt.indexOf('RETURN THIS JSON OBJECT');
    expect(marker).toBeGreaterThan(-1);
    return JSON.parse(prompt.slice(prompt.indexOf('\n{', marker) + 1).split('\n\nREPAIR REQUEST:')[0]);
}
const base: PromptOptions = { kind: 'cricket', templates: ['matchday'], language: 'en', format: 'portrait', brief: '' };
const fixture = cricketFixtures[1];
const contexts: Partial<PromptOptions>[] = [
    {},
    { teams: { teamId: 'janakpur', opponentId: 'chitwan' } },
    { fixture, teams: { teamId: fixture.teamId, opponentId: fixture.opponentId } },
    { fixture, teams: { teamId: fixture.opponentId, opponentId: fixture.teamId } },
    { fixture: playoffFixture('2026-11-19', 'janakpur', 'chitwan'), teams: { teamId: 'janakpur', opponentId: 'chitwan' } },
];

describe('Generated prompt examples match the importer', () => {
    it.each(cricketTemplateIds)('imports the actual %s prompt example across languages, formats and fixture contexts', template => {
        for (const context of contexts) for (const language of ['en', 'ne'] as const) for (const format of ['portrait', 'square', 'story', 'landscape'] as const) {
            const options = { ...base, ...context, language, format, templates: [template] };
            const payload = contentObject(generateCreationPrompt(options));
            expect(responseSchema(options, true).safeParse(payload).success).toBe(true);
            expect(Object.keys(payload.posts[0].data).sort()).toEqual(cricketPromptFields(template).sort());
            const [design] = digestCreationResponse(JSON.stringify(payload), options).designs;
            expect(design.cricket).toMatchObject({ template, language, sample: false, runs: null });
            if (context.fixture) expect(design.cricket?.matchDate).toBe(context.fixture.matchDate);
        }
    });

    it.each(['breaking', 'explainer', 'quote'])('imports empty and completed %s news content without cricket instructions', template => {
        for (const language of ['en', 'ne'] as const) {
            const options: PromptOptions = { ...base, kind: 'news', language, templates: [template] };
            const prompt = generateCreationPrompt(options), payload = contentObject(prompt);
            expect(prompt).not.toContain('oversLimit');
            expect(prompt).not.toContain('DLS');
            expect(payload).not.toHaveProperty('match');
            expect(payload.posts[0]).not.toHaveProperty('data');
            expect(digestCreationResponse(JSON.stringify(payload), options).designs[0].headline).toBe('');
            payload.posts[0].headline = 'Confirmed content';
            payload.posts[0].summary = 'Sourced context';
            expect(digestCreationResponse(JSON.stringify(payload), options).designs[0].summary).toBe('Sourced context');
        }
    });

    it('keeps multi-post examples and repair templates in the requested order', () => {
        for (const templates of [cricketTemplateIds.slice(0, 20), cricketTemplateIds.slice(20), ['matchday', 'playing-xi', 'toss', 'score', 'four', 'six', 'wicket', 'innings', 'result', 'player-of-match']]) {
            const options: PromptOptions = { ...base, templates: [...templates], ...contexts[2] };
            const repair = generateCreationRepairPrompt(options, '{bad', 'Invalid JSON');
            const payload = contentObject(repair);
            expect(payload.posts.map((post: { template: string }) => post.template)).toEqual(templates);
            expect(digestCreationResponse(JSON.stringify(payload), options).designs).toHaveLength(templates.length);
        }
    });

    it.each([
        ['toss', 'TOSS:', ['PLAYING XI:', 'TEAM SPOTLIGHT:']],
        ['team', 'TEAM SPOTLIGHT:', ['TOSS:', 'PLAYING XI:']],
        ['powerplay', 'POWERPLAY:', ['PARTNERSHIP:']],
        ['partnership', 'PARTNERSHIP:', ['POWERPLAY:']],
        ['four', 'FOUR/SIX:', ['WICKET:']],
        ['wicket', 'WICKET:', ['FOUR/SIX:']],
    ] as const)('includes only the relevant %s instructions', (template, included, excluded) => {
        const prompt = generateCreationPrompt({ ...base, templates: [template] });
        expect(prompt).toContain(included);
        for (const instruction of excluded) expect(prompt).not.toContain(instruction);
    });

    it('keeps semantic checks after a complete response replaces the empty example', () => {
        const options = { ...base, templates: ['score'] };
        const payload = contentObject(generateCreationPrompt(options));
        Object.assign(payload.posts[0].data, { runs: 10, wickets: 1, overs: '2', scoreInnings: 'first', target: 20 });
        expect(() => digestCreationResponse(JSON.stringify(payload), options)).toThrow('first-innings');
    });
});

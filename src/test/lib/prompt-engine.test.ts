// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const storage = vi.hoisted(() => ({ data: new Map<string, string>() }));
vi.mock('@/lib/post-studio/storage', () => ({ default: {
    getItem: async (key: string) => storage.data.get(key) ?? null,
    setItem: async (key: string, value: string) => { storage.data.set(key, value); },
} }));
import { cricketPromptFields, digestCreationResponse, generateCreationPrompt, type PromptOptions } from '@/lib/post-studio/prompt-engine';
import { blankCricketData, type CricketData } from '@/lib/post-studio/cricket-data';
import { phaseHeadline } from '@/lib/post-studio/phase-posts';
import { cricketTemplate, cricketTemplateIds } from '@/lib/post-studio/cricket-catalog';
import { createDraftCollection, listDrafts, postDesignSchema } from '@/lib/post-studio/drafts';
import { generateInstagramCaption } from '@/lib/post-studio/carousel';

const options: PromptOptions = { kind: 'cricket', templates: ['score', 'result'], language: 'ne', format: 'portrait', brief: 'Use these confirmed match facts.' };
function response(config = options) {
    const data = blankCricketData();
    const match = Object.fromEntries(['teamId', 'opponentId', 'competition', 'matchLabel', 'venue', 'matchDate', 'startTime', 'oversLimit', 'sourceUrl', 'updatedAt'].map(key => [key, data[key as keyof CricketData]]));
    return { version: 1, title: 'Match coverage', sources: ['https://example.com/scorecard'], match,
        posts: config.templates.map((id, i) => ({ template: id, headline: id === 'powerplay' || id === 'partnership' ? phaseHeadline(id, config.language) : ['four', 'six', 'wicket'].includes(id) ? config.language === 'ne' ? cricketTemplate(id as typeof cricketTemplateIds[number]).headlineNe : cricketTemplate(id as typeof cricketTemplateIds[number]).headline : id === 'score' ? config.language === 'ne' ? 'स्कोर अपडेट' : 'SCORE UPDATE' : ['toss', 'playing-xi', 'team'].includes(id) ? config.language === 'ne' ? ({toss:'टस अपडेट','playing-xi':'प्लेइङ ११',team:'टोली परिचय'} as Record<string,string>)[id] : ({toss:'TOSS UPDATE','playing-xi':'THE PLAYING XI',team:'MEET THE TEAM'} as Record<string,string>)[id] : id === 'head-to-head' ? config.language === 'ne' ? 'आमनेसामने' : 'HEAD TO HEAD' : id === 'fixtures' ? config.language === 'ne' ? 'खेल तालिका' : 'FIXTURES' : id === 'matchday' ? config.language === 'ne' ? 'आजको खेल' : 'MATCHDAY' : `Confirmed moment ${i + 1}`, summary: '',
            data: Object.fromEntries(cricketPromptFields(id as typeof cricketTemplateIds[number]).map(key => [key, data[key]])),
        })),
    };
}
beforeEach(() => storage.data.clear());
describe('Prompt creation contract', () => {
    it.each(cricketTemplateIds)('generates a schema and imports %s without example scores', id => {
        const config = { ...options, templates: [id] };
        const prompt = generateCreationPrompt(config);
        expect(prompt).toContain('JSON SCHEMA:');
        expect(prompt).toContain('Do not invent');
        const result = digestCreationResponse(JSON.stringify(response(config)), config);
        expect(result.designs[0].cricket?.template).toBe(id);
        expect(result.designs[0].cricket?.runs).toBeNull();
        expect(result.designs[0].cricket?.batter.name).toBe('');
        expect(result.designs[0].cricket?.language).toBe('ne');
        expect(postDesignSchema.safeParse(result.designs[0]).success).toBe(true);
    });
    it('applies shared facts once while preserving per-post snapshots', () => {
        const payload = response(); payload.match.venue = 'Verified ground';
        Object.assign(payload.posts[0].data, { runs: 100, wickets: 2, overs: '12.3' });
        Object.assign(payload.posts[1].data, { runs: 180, wickets: 4, overs: '19.2', result: 'Won by six wickets' });
        const result = digestCreationResponse(JSON.stringify(payload), options);
        expect(result.designs.map(design => design.cricket?.venue)).toEqual(['Verified ground', 'Verified ground']);
        expect(result.designs.map(design => design.cricket?.runs)).toEqual([100, 180]);
        expect(result.warnings).toContain('Match.matchDate: missing information');
    });
    it('binds the response to the selected teams and rejects a different matchup', () => {
        const config = { ...options, teams: { teamId: 'lumbini' as const, opponentId: 'sudurpaschim' as const } };
        expect(generateCreationPrompt(config)).toContain('EDITOR SELECTED MATCH:');
        expect(digestCreationResponse(JSON.stringify(response()), config).designs[0].cricket?.teamId).toBe('lumbini');
        const payload = response(); payload.match.teamId = 'janakpur';
        expect(() => digestCreationResponse(JSON.stringify(payload), config)).toThrow('match.teamId');
        expect(() => generateCreationPrompt({ ...config, teams: { teamId: 'lumbini', opponentId: 'lumbini' } })).toThrow('different teams');
    });
    it('accepts omitted content as missing review fields without introducing sample values', () => {
        const config = { ...options, templates: ['fifty'] };
        const payload = response(config);
        const partial = { ...payload, posts: [{ data: { batter: { name: 'Verified player', runs: 50 } } }] };
        const result = digestCreationResponse(JSON.stringify(partial), config);
        expect(result.designs[0]).toMatchObject({ headline: '', summary: '', cricket: { runs: null, batter: { name: 'Verified player', runs: 50, balls: null } } });
        expect(result.warnings).toContain('Post 1.batter.balls: missing information');
    });
    it('rejects wrong post order, extra properties, same-team matches and invalid overs', () => {
        const payload = response();
        expect(() => digestCreationResponse(JSON.stringify({ ...payload, posts: [...payload.posts].reverse() }), options)).toThrow('posts.0.template');
        expect(() => digestCreationResponse(JSON.stringify({ ...payload, imageUri: 'https://example.com/unrequested.png' }), options)).toThrow('Unrecognized');
        expect(() => digestCreationResponse(JSON.stringify({ ...payload, match: { ...payload.match, opponentId: payload.match.teamId } }), options)).toThrow('different teams');
        payload.posts[0].data.overs = '14.6';
        expect(() => digestCreationResponse(JSON.stringify(payload), options)).toThrow('posts.0.data.overs');
        payload.posts[0].data.overs = '21';
        expect(() => digestCreationResponse(JSON.stringify(payload), options)).toThrow('Overs exceed');
        payload.posts[0].data.overs = '12';
        payload.posts[1].data.opponentOvers = '21';
        expect(() => digestCreationResponse(JSON.stringify(payload), options)).toThrow('opponentOvers: Overs exceed');
    });
    it('accepts a JSON code fence, rejects malformed/oversized input and unsafe sources', () => {
        expect(digestCreationResponse('```json\n' + JSON.stringify(response()) + '\n```', options).designs).toHaveLength(2);
        expect(() => digestCreationResponse('{bad', options)).toThrow('Invalid JSON');
        expect(() => digestCreationResponse(' '.repeat(250001), options)).toThrow('too large');
        expect(() => digestCreationResponse(JSON.stringify({ ...response(), sources: ['javascript:alert(1)'] }), options)).toThrow('source');
    });
    it('creates an atomic, retry-safe collection and retains sources in captions', async () => {
        const prepared = digestCreationResponse(JSON.stringify(response()), options);
        const entries = prepared.designs.map((design, index) => ({ id: `import-${index}`, name: `Coverage ${index}`, carouselId: 'import', carouselOrder: index, design }));
        const drafts = await createDraftCollection('editor', entries);
        await createDraftCollection('editor', entries);
        expect(await listDrafts('editor')).toHaveLength(2);
        expect(await listDrafts('other-editor')).toHaveLength(0);
        expect(generateInstagramCaption(drafts)).toContain('https://example.com/scorecard');
    });
    it('imports news and preserves sources without requiring cricket fields', async () => {
        const config: PromptOptions = { ...options, kind: 'news', templates: ['breaking', 'quote'] };
        expect(generateCreationPrompt(config)).not.toContain('Supported team identifiers');
        const prepared = digestCreationResponse(JSON.stringify({ version: 1, title: 'News pack', sources: ['https://example.com/report'], posts: [
            { template: 'breaking', headline: 'Verified story', summary: 'Confirmed context' },
            { template: 'quote', headline: 'Verified quotation', summary: 'Speaker and context' },
        ] }), config);
        const drafts = await createDraftCollection('news', prepared.designs.map((design, i) => ({ id: `news-${i}`, name: 'News', design })));
        expect(prepared.designs.every(design => !design.cricket)).toBe(true);
        expect(generateInstagramCaption(drafts)).toContain('https://example.com/report');
    });
});

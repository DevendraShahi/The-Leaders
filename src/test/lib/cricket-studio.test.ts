import { beforeEach, describe, expect, it, vi } from 'vitest';
const storage = vi.hoisted(() => ({ data: new Map<string, string>() }));
vi.mock('@/lib/post-studio/storage', () => ({ default: { getItem: async (key: string) => storage.data.get(key) ?? null, setItem: async (key: string, value: string) => { storage.data.set(key, value); } } }));
import { cricketTemplateIds, cricketTemplates, nplTeams } from '@/lib/post-studio/cricket-catalog';
import { chaseEquation, cricketDataSchema, cricketNumber, defaultCricketData, oversToBalls, runRate, strikeRate } from '@/lib/post-studio/cricket-data';
import { createCricketDesign } from '@/lib/post-studio/cricket-design';
import { createDraft, postDesignSchema, readDraft, updateDraft } from '@/lib/post-studio/drafts';
import { shareStyles } from '@/lib/post-studio/shared-styles';
beforeEach(() => storage.data.clear());
describe('Cricket coverage templates', () => {
    it.each(cricketTemplateIds)('restores the complete %s template without losing cricket fields', async id => {
        const design = createCricketDesign(id, 'janakpur', 'kathmandu', 'portrait', 'ne');
        expect(postDesignSchema.parse(design)).toEqual(design);
        const saved = await createDraft('sports-editor', id, design);
        expect((await readDraft('sports-editor', saved.id)).design).toEqual(design);
        expect(design.cricket?.sample).toBe(false);
        expect(design.headline).toBe(cricketTemplates.find(item => item.id === id)!.headlineNe);
    });
    it('provides a distinct identity and local asset path for each of the eight teams', () => {
        expect(new Set(nplTeams.map(team => team.id)).size).toBe(8);
        expect(new Set(cricketTemplates.map(item => item.id)).size).toBe(28);
        for (const team of nplTeams) {
            const design = createCricketDesign('matchday', team.id, team.id === 'lumbini' ? 'sudurpaschim' : 'lumbini');
            expect(design.accent).toBe(team.primary); expect(design.backgroundColor).toBe(team.dark);
        }
    });
    it('rejects invalid overs, impossible dates, duplicate table entries and same-team fixtures', () => {
        const valid = defaultCricketData();
        expect(cricketDataSchema.safeParse({ ...valid, overs: '14.6' }).success).toBe(false);
        expect(cricketDataSchema.safeParse({ ...valid, overs: '21' }).success).toBe(false);
        expect(cricketDataSchema.safeParse({ ...valid, matchDate: '2026-02-31' }).success).toBe(false);
        expect(cricketDataSchema.safeParse({ ...valid, opponentId: valid.teamId }).success).toBe(false);
        expect(cricketDataSchema.safeParse({ ...valid, standings: [valid.standings[0], valid.standings[0]] }).success).toBe(false);
        expect(cricketDataSchema.safeParse({ ...valid, fixtures: [{ ...valid.fixtures[0], opponentId: valid.fixtures[0].teamId }] }).success).toBe(false);
    });
    it('does not replace score data when a shared team identity is applied', () => {
        const source = createCricketDesign('four', 'chitwan', 'janakpur');
        const target = createCricketDesign('wicket', 'chitwan', 'janakpur');
        target.cricket = { ...target.cricket!, runs: 91, wickets: 4, sample: false, sourceUrl: 'https://example.com/scorecard', updatedAt: '2026-10-26T10:00:00Z' };
        const shared = shareStyles(target, source, ['cricket', 'typography', 'alignment']);
        expect(shared.cricket).toMatchObject({ teamId: 'chitwan', opponentId: 'janakpur', template: 'wicket', runs: 91, wickets: 4, sample: false, sourceUrl: 'https://example.com/scorecard', updatedAt: '2026-10-26T10:00:00Z' });
        expect(shared.headline).toBe(target.headline);
        expect(shared.accent).toBe(source.accent);
    });
    it('preserves locked visuals when sharing cricket identities', () => {
        const source = createCricketDesign('four', 'chitwan', 'janakpur');
        const target = createCricketDesign('wicket', 'lumbini', 'sudurpaschim'); target.lockedLayers = ['visual'];
        expect(shareStyles(target, source, ['cricket'])).toMatchObject({ accent: target.accent, backgroundColor: target.backgroundColor, cricket: { teamId: 'lumbini', opponentId: 'sudurpaschim', teamLogoUri: null } });
    });
    it('keeps cricket scores isolated by account and preserves a customized logo', async () => {
        const design = createCricketDesign('score'); design.cricket!.teamLogoUri = 'data:image/png;base64,example';
        const draft = await createDraft('sports-editor', 'Score', design);
        await updateDraft('sports-editor', draft.id, { design: { ...design, cricket: { ...design.cricket!, runs: 142, overs: '16.1' } } });
        expect((await readDraft('sports-editor', draft.id)).design.cricket).toMatchObject({ runs: 142, overs: '16.1', teamLogoUri: 'data:image/png;base64,example' });
        await expect(readDraft('other-editor', draft.id)).rejects.toThrow('unavailable');
    });
});
describe('Cricket arithmetic', () => {
    it.each([['0', 0], ['0.5', 5], ['3.2', 20], ['14.2', 86], ['19.5', 119], ['20', 120], ['20.0', 120], ['14.6', null], ['14.8', null], ['-1', null], ['1.25', null], ['', null]])('interprets %s as %s legal balls', (overs, balls) => expect(oversToBalls(overs)).toBe(balls));
    it('calculates strike rate, run rate and economy without treating overs as decimal numbers', () => {
        expect(runRate(128, '14.2')).toBe('8.93'); expect(runRate(24, '3.2')).toBe('7.20');
        expect(strikeRate(68, 42)).toBe('161.90'); expect(strikeRate(0, 0)).toBe('—'); expect(runRate(0, '0')).toBe('—');
    });
    it('calculates a chase from the remaining legal deliveries and handles a completed target', () => {
        const data = defaultCricketData('score');
        expect(chaseEquation(data)).toEqual({ runs: 52, balls: 34, rate: '9.18' });
        expect(chaseEquation({ ...data, runs: 180 })).toMatchObject({ runs: 0, rate: '0.00' });
        expect(chaseEquation({ ...data, overs: '20' })).toMatchObject({ runs: 52, balls: 0, rate: '—' });
        expect(chaseEquation({ ...data, target: null })).toBeNull();
    });
    it('keeps Nepali digits, slash scores and cricket overs intact', () => {
        expect(cricketNumber('128/3', 'ne')).toBe('१२८/३'); expect(cricketNumber('14.2', 'ne')).toBe('१४.२');
        expect(cricketNumber(null, 'ne')).toBe('—');
    });
});

describe('Cricket captions', () => {
    it('uses cricket tags without adding a sample prefix or political tags', async () => {
        const { generateInstagramCaption } = await import('@/lib/post-studio/carousel');
        const draft = await createDraft('sports-editor', 'Six', createCricketDesign('six'));
        const caption = generateInstagramCaption([draft]);
        expect(caption).not.toContain('SAMPLE CONTENT'); expect(caption).toContain('#NepalCricket');
        expect(caption).toContain('128/3'); expect(caption).not.toContain('#NepalPolitics');
    });
    it('preserves sources, Nepali digits and an all-round performance in the caption', async () => {
        const { generateInstagramCaption } = await import('@/lib/post-studio/carousel');
        const design = createCricketDesign('player-of-match', 'chitwan', 'kathmandu', 'portrait', 'ne');
        design.cricket = { ...design.cricket!, awardPerformance: 'all-round', sourceUrl: 'https://example.com/sample-scorecard' };
        const draft = await createDraft('sports-editor', 'Award', design);
        const caption = generateInstagramCaption([draft]);
        expect(caption).not.toContain('नमुना सामग्री'); expect(caption).toContain('६८*');
        expect(caption).toContain('३/२४'); expect(caption).toContain('https://example.com/sample-scorecard');
        expect(caption).toContain('#ChitwanRhinos');
    });
});


describe('Label-free authored cricket drafts', () => {
    it('opens new templates with blank factual fields and preserves the visual identity', async () => {
        const { createCricketDraftDesign } = await import('@/lib/post-studio/cricket-design');
        const design = createCricketDraftDesign('bowling', 'chitwan', 'kathmandu', 'square', 'ne');
        expect(postDesignSchema.parse(design)).toEqual(design);
        expect(design.cricket).toMatchObject({ sample: false, teamId: 'chitwan', opponentId: 'kathmandu', runs: null, wickets: null, overs: '', bowler: { name: '', wickets: null, runs: null }, target: null });
        expect(design.format).toBe('square'); expect(design.headline).toBe('शानदार बलिङ');
    });
    it('removes rendered labels and caption prefixes even for older stored drafts', async () => {
        const { createElement } = await import('react');
        const { renderToStaticMarkup } = await import('react-dom/server');
        const { Artwork } = await import('@/components/admin/post-studio/Artwork');
        const { generateInstagramCaption } = await import('@/lib/post-studio/carousel');
        const design = createCricketDesign('score'); design.cricket!.sample = true;
        const html = renderToStaticMarkup(createElement(Artwork, { design }));
        expect(html).not.toContain('SAMPLE'); expect(html).toMatch(/CRICKET/i);
        const draft = await createDraft('sports-editor', 'Legacy', design);
        expect(generateInstagramCaption([draft])).not.toContain('SAMPLE CONTENT');
    });
});

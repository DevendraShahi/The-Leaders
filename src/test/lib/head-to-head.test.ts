// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/post-studio/storage', () => ({ default: { getItem: async () => null, setItem: async () => {} } }));
import { createCricketDraftDesign } from '@/lib/post-studio/cricket-design';
import { headToHeadIssues, rebindHeadToHead } from '@/lib/post-studio/head-to-head';
import { digestCreationResponse, generateCreationPrompt, type PromptOptions } from '@/lib/post-studio/prompt-engine';
import { shareStyles } from '@/lib/post-studio/shared-styles';
import { creationGaps } from '@/lib/post-studio/creation-workflow';
import { generateCricketCaption } from '@/lib/post-studio/cricket-caption';
const options: PromptOptions = { kind: 'cricket', templates: ['head-to-head'], language: 'en', format: 'portrait', brief: '', teams: { teamId: 'lumbini', opponentId: 'sudurpaschim' } };
const response = () => ({ version: 1, title: 'Record comparison', sources: ['https://example.com/history'], match: { teamId: 'lumbini', opponentId: 'sudurpaschim', competition: 'NPL 2026', matchLabel: 'MATCH 01', venue: 'Kirtipur', matchDate: '2026-10-26', startTime: '16:30', oversLimit: 20, sourceUrl: 'https://example.com/history', updatedAt: '' }, posts: [{ template: 'head-to-head', headline: 'HEAD TO HEAD', summary: '', data: { headToHead: { played: 5, teamWins: 3, opponentWins: 1, ties: 1, noResults: 0, asOf: '2026-10-25' } } }] });
const design = () => digestCreationResponse(JSON.stringify(response()), options).designs[0];
describe('Head to Head benchmark contract', () => {
    it('maps paired wins, separate outcomes, cutoff and source into the draft', () => {
        const result = design(); expect(result.cricket?.headToHead?.teamWins).toBe(3); expect(result.cricket?.headToHead?.opponentWins).toBe(1);
        expect(headToHeadIssues(result)).toEqual([]); expect(result.cricket?.runs).toBeNull();
        expect(generateCreationPrompt(options)).toContain('Do not infer counts from the fixture sheet');
        expect(generateCreationPrompt(options)).toContain('Super Over');
    });
    it('rejects contradictory totals, future cutoff, negative counts, free-text statistics and extra keys', () => {
        for (const change of [
            (p: ReturnType<typeof response>) => { p.posts[0].data.headToHead.played = 6; },
            (p: ReturnType<typeof response>) => { p.posts[0].data.headToHead.asOf = '2026-10-26'; },
            (p: ReturnType<typeof response>) => { p.posts[0].data.headToHead.teamWins = -1; },
            (p: ReturnType<typeof response>) => { p.posts[0].headline = 'The matchup'; },
            (p: ReturnType<typeof response>) => { Object.assign(p.posts[0].data, { statRows: [{ label: 'Wins', value: '3-1' }] }); },
        ]) { const p = response(); change(p); expect(() => digestCreationResponse(JSON.stringify(p), options)).toThrow(); }
    });
    it('keeps unknown counts empty and reviewable, distinguishes a confirmed zero record', () => {
        const blank = createCricketDraftDesign('head-to-head');
        expect(blank.cricket?.headToHead?.played).toBeNull(); expect(creationGaps([blank]).some(gap => gap.path === 'cricket.headToHead.played')).toBe(true);
        expect(headToHeadIssues(blank).join(' ')).toContain('Unknown is different from zero');
        const zero = design(); Object.assign(zero.cricket!.headToHead!, { played: 0, teamWins: 0, opponentWins: 0, ties: 0, noResults: 0 });
        expect(headToHeadIssues(zero)).toEqual([]);
    });
    it('swaps wins on a side reversal and clears evidence for an unrelated pairing', () => {
        const original = design(), reversed = rebindHeadToHead(original, 'sudurpaschim', 'lumbini');
        expect(reversed.cricket?.headToHead).toMatchObject({ played: 5, teamWins: 1, opponentWins: 3 }); expect(reversed.cricket?.sourceUrl).toBe(original.cricket?.sourceUrl);
        const changed = rebindHeadToHead(original, 'lumbini', 'janakpur');
        expect(changed.cricket?.headToHead?.played).toBeNull(); expect(changed.sourceUrls).toEqual([]); expect(changed.cricket?.sourceUrl).toBe('');
        expect(original.cricket?.headToHead?.played).toBe(5);
    });
    it('invalidates a historical record when teams are shared from a different match', () => {
        const source = createCricketDraftDesign('matchday', 'janakpur', 'chitwan');
        const target = shareStyles(design(), source, ['cricket']);
        expect(target.cricket?.headToHead?.teamWins).toBeNull(); expect(target.sourceUrls).toEqual([]);
    });
    it('retains ambiguous legacy rows without treating them as a verified paired record', () => {
        const legacy = design(); delete legacy.cricket!.headToHead; legacy.cricket!.statRows = [{ label: 'Wins', value: '3' }];
        expect(headToHeadIssues(legacy).join(' ')).toContain('Legacy statistic rows are retained'); expect(legacy.cricket!.statRows[0].value).toBe('3');
        expect(headToHeadIssues({ ...legacy, template: 'breaking' })).toEqual([]);
    });
    it('keeps the paired record and cutoff in the generated caption and omits sources', () => {
        const result = design();
        const caption = generateCricketCaption([{ id: 'test', name: 'Illustrative record', design: result, createdAt: '', updatedAt: '', trashedAt: null }]);
        expect(caption).toContain('Lumbini Lions: 3 wins'); expect(caption).toContain('Sudurpaschim Royals: 1 win');
        expect(caption).toContain('Record as of: 2026-10-25'); expect(caption).not.toContain('https://example.com/history');
    });
});

// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/post-studio/storage', () => ({ default: { getItem: async () => null, setItem: async () => {} } }));
import { createCricketDraftDesign } from '@/lib/post-studio/cricket-design';
import { scoreChase, scoreState, scoreUpdateIssues, setScoreInnings, hasBatter } from '@/lib/post-studio/score-update';
import { rebindCricketEvidence, redatePrematch } from '@/lib/post-studio/prematch-posts';
import { digestCreationResponse, generateCreationPrompt, type PromptOptions } from '@/lib/post-studio/prompt-engine';
import { creationGaps, updateCreationValue } from '@/lib/post-studio/creation-workflow';
import { shareStyles } from '@/lib/post-studio/shared-styles';
import { generateCricketCaption } from '@/lib/post-studio/cricket-caption';

const options: PromptOptions = { kind: 'cricket', templates: ['score'], language: 'en', format: 'portrait', brief: '', teams: { teamId: 'lumbini', opponentId: 'sudurpaschim' } };
const response = () => ({ version: 1, title: 'Illustrative score snapshot', sources: ['https://example.com/scorecard'], match: { teamId: 'lumbini', opponentId: 'sudurpaschim', competition: 'NPL 2026', matchLabel: 'MATCH 01', venue: 'Kirtipur', matchDate: '2026-10-26', startTime: '16:30', oversLimit: 20, sourceUrl: 'https://example.com/scorecard', updatedAt: '' }, posts: [{ template: 'score', headline: 'SCORE UPDATE', summary: '', data: { runs: 128, wickets: 3, overs: '14.2', target: 180, scoreInnings: 'chase', batter: { name: 'Illustrative batter', runs: 68, balls: 42, fours: 6, sixes: 3, notOut: true }, secondBatter: { name: 'Illustrative partner', runs: 45, balls: 31, fours: 3, sixes: 2, notOut: true } } }] });
const design = () => digestCreationResponse(JSON.stringify(response()), options).designs[0];
describe('Score Update benchmark', () => {
    it('uses legal-ball arithmetic and keeps the selected batting team attached to the snapshot', () => {
        const result = design(); expect(scoreUpdateIssues(result)).toEqual([]);
        expect(scoreChase(result.cricket!)).toEqual({ runs: 52, balls: 34, rate: '9.18' });
        expect(generateCreationPrompt(options)).toContain('featured BATTING team'); expect(generateCreationPrompt(options)).toContain('never calculate or guess DLS');
    });
    it('does not create scores, a target or an innings phase from fixture defaults', () => {
        const blank = createCricketDraftDesign('score'); expect(blank.cricket).toMatchObject({ runs: null, wickets: null, overs: '', target: null, scoreInnings: null });
        expect(scoreUpdateIssues(blank).length).toBeGreaterThan(0); expect(creationGaps([blank]).some(gap => gap.path === 'cricket.scoreInnings')).toBe(true);
    });
    it('rejects wrong overs, unsupported fields, invalid targets and contradictory batter values', () => {
        for (const change of [
            (p: ReturnType<typeof response>) => { p.posts[0].data.overs = '14.6'; },
            (p: ReturnType<typeof response>) => { p.posts[0].data.overs = '20.1'; },
            (p: ReturnType<typeof response>) => { p.posts[0].data.target = 0; },
            (p: ReturnType<typeof response>) => { p.posts[0].data.scoreInnings = 'first'; },
            (p: ReturnType<typeof response>) => { p.posts[0].data.secondBatter.name = 'Illustrative batter'; },
            (p: ReturnType<typeof response>) => { p.posts[0].data.batter.runs = 150; },
            (p: ReturnType<typeof response>) => { p.posts[0].data.batter.sixes = 20; },
            (p: ReturnType<typeof response>) => { Object.assign(p.posts[0].data, { requiredRunRate: '9.18' }); },
        ]) { const p = response(); change(p); expect(() => digestCreationResponse(JSON.stringify(p), options)).toThrow(); }
    });
    it('keeps batters optional and flags incomplete supplied batter slots', () => {
        const result = design(), empty = createCricketDraftDesign('score').cricket!;
        result.cricket!.batter = empty.batter; result.cricket!.secondBatter = empty.secondBatter;
        expect(hasBatter(result.cricket!.batter)).toBe(false); expect(scoreUpdateIssues(result)).toEqual([]);
        result.cricket!.batter.notOut = true; expect(hasBatter(result.cricket!.batter)).toBe(true);
        expect(scoreUpdateIssues(result).join(' ')).toContain('provide name, runs and balls');
    });
    it('accepts zero-over and zero-score snapshots without an infinite rate or invented chase', () => {
        const result = design(), data = result.cricket!, empty = createCricketDraftDesign('score').cricket!;
        Object.assign(data, { scoreInnings: 'first', runs: 0, wickets: 0, overs: '0', target: null, batter: empty.batter, secondBatter: empty.secondBatter });
        expect(scoreUpdateIssues(result)).toEqual([]); expect(scoreChase(data)).toBeNull(); expect(scoreState(data)).toBe('first');
        Object.assign(data, { scoreInnings: 'chase', runs: 1, target: 1 });
        expect(scoreState(data)).toBe('target-reached'); expect(scoreUpdateIssues(result)).toEqual([]);
    });
    it.each(['all-out', 'target-reached', 'overs-complete'] as const)('suppresses live chase requirements for %s', state => {
        const data = design().cricket!;
        if (state === 'all-out') data.wickets = 10;
        if (state === 'target-reached') data.runs = 180;
        if (state === 'overs-complete') data.overs = '20';
        expect(scoreState(data)).toBe(state); expect(scoreChase(data)).toBeNull();
    });
    it('clears the last innings snapshot when changing batting side, date, innings or shared match context', () => {
        const original = design();
        for (const result of [rebindCricketEvidence(original, 'sudurpaschim', 'lumbini'), redatePrematch(original, '2026-10-28'), setScoreInnings(original, 'first'), shareStyles(original, createCricketDraftDesign('matchday', 'janakpur', 'chitwan'), ['cricket'])]) {
            expect(result.cricket).toMatchObject({ runs: null, wickets: null, overs: '', target: null }); expect(result.sourceUrls).toEqual([]);
        }
        expect(original.cricket?.runs).toBe(128);
    });
    it('supports Review phase correction and exposes the newly required target', () => {
        const result = design(); result.cricket!.scoreInnings = null; result.cricket!.target = null;
        const prepared = { title: 'Draft', designs: [result], warnings: [] };
        const chase = updateCreationValue(prepared, 0, 'cricket.scoreInnings', 'chase');
        expect(creationGaps(chase.designs).some(gap => gap.path === 'cricket.target')).toBe(true);
        const first = updateCreationValue({ ...prepared, designs: [design()] }, 0, 'cricket.scoreInnings', 'first');
        expect(first.designs[0].cricket?.target).toBeNull();
    });
    it('keeps score, batters and derived chase facts consistent in captions', () => {
        const result = design(); const caption = generateCricketCaption([{ id: 'test', name: 'Illustrative score', design: result, createdAt: '', updatedAt: '', trashedAt: null }]);
        expect(caption).toContain('128/3'); expect(caption).toContain('52 needed from 34 balls'); expect(caption).toContain('Illustrative batter: 68* (42)'); expect(caption).toContain('https://example.com/scorecard');
    });
});

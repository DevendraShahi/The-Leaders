// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/post-studio/storage', () => ({ default: { getItem: async () => null, setItem: async () => {} } }));
import { studioTemplateExamples } from '@/lib/post-studio/template-examples';
import { coverageIds, coverageIssues, coverageContradictions } from '@/lib/post-studio/coverage-posts';
import { createCricketDraftDesign } from '@/lib/post-studio/cricket-design';
import { digestCreationResponse, type PromptOptions } from '@/lib/post-studio/prompt-engine';
import { momentIssues } from '@/lib/post-studio/moment-posts';
import { phaseIssues } from '@/lib/post-studio/phase-posts';
import { scoreUpdateIssues } from '@/lib/post-studio/score-update';
import { prematchIssues } from '@/lib/post-studio/prematch-posts';
const examples = studioTemplateExamples();
describe('Remaining coverage templates', () => {
    it.each(['toss', 'playing-xi', 'score', 'four', 'six', 'wicket', 'powerplay', 'partnership'])('keeps unused date metadata optional for %s', id => {
        const design = structuredClone(examples.find(item => item.id === id)!.design);
        design.cricket!.matchDate = '';
        expect([...momentIssues(design), ...phaseIssues(design), ...scoreUpdateIssues(design), ...prematchIssues(design)]).toEqual([]);
    });
    it.each(coverageIds)('exports %s without optional date metadata', id => {
        const design = structuredClone(examples.find(item => item.id === id)!.design);
        design.cricket!.matchDate = '';
        expect(coverageIssues(design)).toEqual([]);
    });
    it('accepts the reported innings break without unused player details', () => {
        const design = createCricketDraftDesign('innings');
        design.headline = 'INNINGS BREAK';
        Object.assign(design.cricket!, { teamId: 'chitwan', opponentId: 'sudurpaschim', runs: 157, wickets: 3, overs: '20', target: 158, matchDate: '' });
        expect(coverageIssues(design)).toEqual([]);
    });
    it('only requires all-round bowling figures printed on the award', () => {
        const design = structuredClone(examples.find(item => item.id === 'player-of-match-all-round')!.design);
        Object.assign(design.cricket!.bowler, { name: '', overs: '', maidens: null });
        expect(coverageIssues(design)).toEqual([]);
        design.cricket!.bowler.wickets = null;
        expect(coverageIssues(design).join(' ')).toContain('displayed all-round');
    });
    it('accepts a standings excerpt without requiring undisplayed teams', () => {
        const design = structuredClone(examples.find(item => item.id === 'points-table')!.design);
        design.cricket!.standings = design.cricket!.standings.slice(0, 3);
        expect(coverageIssues(design)).toEqual([]);
    });
    it('ignores undisplayed scorecard boundaries during export while checking imported data', () => {
        const design = structuredClone(examples.find(item => item.id === 'scorecard')!.design);
        design.cricket!.batting[0].fours = 999;
        expect(coverageIssues(design)).toEqual([]);
        expect(coverageContradictions(design.cricket!).join(' ')).toContain('boundary runs');
    });
    it.each(coverageIds)('provides a complete, validated %s editor example', id => {
        const example = examples.find(item => item.id === id)!;
        expect(coverageIssues(example.design)).toEqual([]);
        expect(coverageIssues(createCricketDraftDesign(id)).length).toBeGreaterThan(0);
        expect(example.fields.some(field => field.section === 'Footer')).toBe(true);
        expect(example.fields.some(field => !field.section.includes('Setup'))).toBe(true);
    });
    it('documents every current template plus award modes and book slides', () => {
        expect(examples).toHaveLength(38);
        expect(new Set(examples.map(example => example.id)).size).toBe(38);
        expect(examples.filter(example => example.id.startsWith('player-of-match'))).toHaveLength(3);
        expect(examples.filter(example => example.id.startsWith('book-'))).toHaveLength(5);
    });
    it('rejects impossible milestones and bowler figures without inventing corrections', () => {
        const fifty = structuredClone(examples.find(example => example.id === 'fifty')!.design.cricket!);
        fifty.batter.runs = 49; expect(coverageContradictions(fifty).join(' ')).toContain('at least 50');
        const bowling = structuredClone(examples.find(example => example.id === 'five-for')!.design.cricket!);
        bowling.bowler.wickets = 4; expect(coverageContradictions(bowling).join(' ')).toContain('at least five');
        bowling.bowler.wickets = 9; expect(coverageContradictions(bowling).join(' ')).toContain('opposition wickets');
    });
    it('catches contradictory scorecards and standings', () => {
        const scorecard = structuredClone(examples.find(example => example.id === 'scorecard')!.design.cricket!);
        scorecard.runs = 50; expect(coverageContradictions(scorecard).join(' ')).toContain('innings total');
        const table = structuredClone(examples.find(example => example.id === 'points-table')!.design.cricket!);
        table.standings[0].played = 1; expect(coverageContradictions(table).join(' ')).toContain('matches played');
    });
    it('keeps target fields pending when no official target was supplied', () => {
        const design = structuredClone(examples.find(example => example.id === 'dls')!.design);
        design.cricket!.target = null;
        expect(coverageIssues(design).join(' ')).toContain('officially announced');
        expect(design.cricket!.target).toBeNull();
    });
    it('uses the same copy constraints in import and export', () => {
        const example = examples.find(item => item.id === 'rain')!;
        const response = structuredClone(example.response) as { posts: { summary: string; headline: string }[] };
        const options: PromptOptions = { kind: 'cricket', templates: ['rain'], language: 'en', format: 'portrait', brief: '', teams: { teamId: 'lumbini', opponentId: 'sudurpaschim' } };
        response.posts[0].summary = 'a'.repeat(141);
        expect(() => digestCreationResponse(JSON.stringify(response), options)).toThrow('summary');
        response.posts[0].summary = ''; response.posts[0].headline = 'a'.repeat(65);
        expect(() => digestCreationResponse(JSON.stringify(response), options)).toThrow('headline');
    });
});

// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/post-studio/storage', () => ({ default: { getItem: async () => null, setItem: async () => {} } }));
import { createCricketDraftDesign } from '@/lib/post-studio/cricket-design';
import { cricketTeamIssues, knownPlayerTeam, reconcileEditedPlayerTeams, resetCricketTemplate } from '@/lib/post-studio/cricket-team-context';
import { cricketFixtures } from '@/lib/post-studio/cricket-fixtures';
import { digestCreationResponse, generateCreationPrompt, type PromptOptions } from '@/lib/post-studio/prompt-engine';
import { playerPhotoSubject, applyPlayerPortrait, selectPlayerPortrait } from '@/lib/post-studio/player-portraits';
import { nplPlayers } from '@/lib/post-studio/cricket-players';
import { updateCreationValue } from '@/lib/post-studio/creation-workflow';
import { shareStyles } from '@/lib/post-studio/shared-styles';
import { rebindCricketEvidence, redatePrematch } from '@/lib/post-studio/prematch-posts';
import { postDesignSchema } from '@/lib/post-studio/drafts';

const options: PromptOptions = { kind: 'cricket', templates: ['wicket'], language: 'en', format: 'portrait', brief: '', teams: { teamId: 'lumbini', opponentId: 'sudurpaschim' }, fixture: cricketFixtures[0] };
function response(config = options) {
    const prompt = generateCreationPrompt(config), marker = prompt.indexOf('RETURN THIS JSON OBJECT');
    return JSON.parse(prompt.slice(prompt.indexOf('\n{', marker) + 1).split('\n```')[0]);
}
function wicket() {
    const design = createCricketDraftDesign('wicket', 'lumbini', 'sudurpaschim');
    Object.assign(design.cricket!, { batter: { ...design.cricket!.batter, name: 'Rohit Paudel' }, bowler: { ...design.cricket!.bowler, name: 'Dipendra Singh Airee' }, wicketType: 'caught', dismissal: 'Caught at cover', runs: 100, wickets: 2, overs: '12', sourceUrl: 'https://example.com/event' });
    design.fixtureId = cricketFixtures[0].id;
    return design;
}

describe('Fixture identity and per-post team context', () => {
    it('resolves a reversed wicket response and portraits without changing the selected fixture or score', () => {
        const payload = response();
        Object.assign(payload.posts[0].data, { batter: { name: 'Dipendra Singh Airee' }, bowler: { name: 'Rohit Paudel' }, wicketType: 'caught', dismissal: 'Caught', runs: 100, wickets: 2, overs: '12' });
        const result = digestCreationResponse(JSON.stringify(payload), options), design = result.designs[0];
        expect(design.cricket).toMatchObject({ teamId: 'sudurpaschim', opponentId: 'lumbini', runs: 100, wickets: 2, overs: '12' });
        expect(design.fixtureId).toBe(cricketFixtures[0].id);
        expect(playerPhotoSubject(design)).toMatchObject({ role: 'bowler', name: 'Rohit Paudel', teamId: 'lumbini' });
        expect(design.playerPhotoId).toBe('rohit-paudel');
        expect(result.warnings.join(' ')).toContain('Post side resolved');
        expect(postDesignSchema.safeParse(design).success).toBe(true);
    });
    it('accepts a sourced post side for unknown players and rejects a third franchise', () => {
        const payload = response(); payload.posts[0].teamId = 'sudurpaschim';
        payload.posts[0].data.batter.name = 'Unlisted overseas batter';
        payload.posts[0].data.bowler.name = 'Unlisted overseas bowler';
        payload.posts[0].data.wicketType = 'caught';
        expect(digestCreationResponse(JSON.stringify(payload), options).designs[0].cricket?.teamId).toBe('sudurpaschim');
        payload.posts[0].teamId = 'chitwan';
        expect(() => digestCreationResponse(JSON.stringify(payload), options)).toThrow('posts.0.teamId');
    });
    it('accepts a legacy response that reverses the same fixture and preserves its innings ownership', () => {
        const payload = response();
        Object.assign(payload.match, { teamId: 'sudurpaschim', opponentId: 'lumbini' });
        delete payload.posts[0].teamId;
        Object.assign(payload.posts[0].data, { runs: 90, wickets: 2, overs: '10', wicketType: 'caught', batter: { name: 'Dipendra Singh Airee' }, bowler: { name: 'Rohit Paudel' } });
        const design = digestCreationResponse(JSON.stringify(payload), options).designs[0];
        expect(design.cricket).toMatchObject({ teamId: 'sudurpaschim', opponentId: 'lumbini', runs: 90 });
        expect(design.fixtureId).toBe(cricketFixtures[0].id);
    });
    it('remaps historical win columns when an old response reverses the fixture order', () => {
        const config = { ...options, templates: ['head-to-head'] }, payload = response(config);
        Object.assign(payload.match, { teamId: 'sudurpaschim', opponentId: 'lumbini' });
        Object.assign(payload.posts[0].data.headToHead, { teamWins: 3, opponentWins: 1 });
        const record = digestCreationResponse(JSON.stringify(payload), config).designs[0].cricket?.headToHead;
        expect(record).toMatchObject({ teamWins: 1, opponentWins: 3 });
    });
    it('resolves score snapshots, batting, bowling and awards independently inside the same match pack', () => {
        const config = { ...options, templates: ['four', 'bowling', 'player-of-match', 'score'] };
        const payload = response(config);
        payload.posts[0].data.batter.name = 'Dipendra Singh Airee';
        payload.posts[1].data.bowler.name = 'Rohit Paudel';
        payload.posts[2].data.awardPerformance = 'bowling'; payload.posts[2].data.bowler.name = 'Dipendra Singh Airee';
        Object.assign(payload.posts[2].data, { opponentRuns: 100, opponentWickets: 9, opponentOvers: '20' });
        payload.posts[3].teamId = 'lumbini'; // Compact score posts identify the side directly; they do not request batter fields.
        const designs = digestCreationResponse(JSON.stringify(payload), config).designs;
        expect(designs.map(design => design.cricket?.teamId)).toEqual(['sudurpaschim', 'lumbini', 'sudurpaschim', 'lumbini']);
        expect(designs[2].cricket).toMatchObject({ opponentRuns: 100, opponentWickets: 9, opponentOvers: '20' });
    });
    it('does not guess partial identities or silently move to a franchise outside the fixture', () => {
        expect(knownPlayerTeam('Rohit')).toBeUndefined();
        expect(knownPlayerTeam('  ROHIT   PAUDEL (c) ')).toBe('lumbini');
        const design = wicket(); design.cricket!.batter.name = nplPlayers.find(player => player.teamId === 'chitwan')!.name;
        expect(cricketTeamIssues(design.cricket!).join(' ')).toContain('Chitwan');
    });
    it('keeps inconsistent partnerships reviewable with a clear player-team warning', () => {
        const config = { ...options, templates: ['partnership'] }, payload = response(config);
        payload.posts[0].data.batter.name = 'Rohit Paudel'; payload.posts[0].data.secondBatter.name = 'Dipendra Singh Airee';
        const result = digestCreationResponse(JSON.stringify(payload), config);
        expect(result.warnings.join(' ')).toContain('conflicting teams');
        expect(cricketTeamIssues(result.designs[0].cricket!).length).toBeGreaterThan(0);
    });
    it('keeps scorecard batters and opposition bowlers in the same innings', () => {
        const config = { ...options, templates: ['scorecard'] }, payload = response(config);
        Object.assign(payload.posts[0].data, { runs: 100, wickets: 2, overs: '12', batting: [{ name: 'Dipendra Singh Airee', runs: 40, balls: 20, fours: 4, sixes: 2, notOut: true }], bowling: [{ name: 'Rohit Paudel', runs: 20, wickets: 1, maidens: 0, overs: '2' }] });
        const design = digestCreationResponse(JSON.stringify(payload), config).designs[0];
        expect(design.cricket).toMatchObject({ teamId: 'sudurpaschim', opponentId: 'lumbini', runs: 100 });
        expect(cricketTeamIssues(design.cricket!)).toEqual([]);
    });
    it('does not combine two different players into one all-round award', () => {
        const design = createCricketDraftDesign('player-of-match');
        design.cricket!.awardPerformance = 'all-round';
        design.cricket!.batter.name = 'Rohit Paudel'; design.cricket!.bowler.name = 'Aakash Tripathi';
        expect(cricketTeamIssues(design.cricket!).join(' ')).toContain('same player');
    });
    it('detects a dismissed batter edit, keeps fixture identity and clears the previous innings snapshot', () => {
        const before = wicket(), edited = structuredClone(before);
        edited.cricket!.batter.name = 'Dipendra Singh Airee';
        const next = reconcileEditedPlayerTeams(before, edited);
        expect(next.cricket).toMatchObject({ teamId: 'sudurpaschim', opponentId: 'lumbini', runs: null, wickets: null, overs: '', sourceUrl: '', bowler: { name: '' } });
        expect(next.cricket!.batter.name).toBe('Dipendra Singh Airee');
        expect(next.fixtureId).toBe(before.fixtureId);
        expect(before.cricket!.runs).toBe(100);
    });
    it('handles bowler-driven edits and review fields through the same team resolver', () => {
        const before = wicket(); before.cricket!.batter.name = '';
        const next = updateCreationValue({ title: 'Wicket', warnings: [], designs: [before] }, 0, 'cricket.bowler.name', 'Rohit Paudel').designs[0];
        expect(next.cricket).toMatchObject({ teamId: 'sudurpaschim', opponentId: 'lumbini', bowler: { name: 'Rohit Paudel' }, runs: null });
        expect(playerPhotoSubject(next)?.teamId).toBe('lumbini');
    });
    it('allows either fixture team in the portrait picker while clearing old player figures', () => {
        const before = applyPlayerPortrait(wicket()), player = nplPlayers.find(item => item.id === 'rohit-paudel')!;
        const next = selectPlayerPortrait(before, player);
        expect(next.cricket).toMatchObject({ teamId: 'sudurpaschim', opponentId: 'lumbini', bowler: { name: 'Rohit Paudel', runs: null }, runs: null });
        expect(next.playerPhotoId).toBe('rohit-paudel');
        expect(selectPlayerPortrait(before, nplPlayers.find(item => item.teamId === 'chitwan')!)).toBe(before);
    });
    it('keeps a bowler’s portrait and a dismissed batter’s portrait separate', () => {
        const before = wicket();
        expect(applyPlayerPortrait(before).playerPhotoId).toBe('dipendra-singh-airee');
        before.cricket!.momentPhotoRole = 'batter';
        expect(applyPlayerPortrait(before).playerPhotoId).toBe('rohit-paudel');
        before.cricket!.wicketType = 'run-out'; before.cricket!.momentPhotoRole = 'bowler';
        expect(playerPhotoSubject(before)?.role).toBe('batter');
    });
    it('shares a fixture without replacing another page’s batting side or score', () => {
        const source = wicket(), target = createCricketDraftDesign('four', 'sudurpaschim', 'lumbini');
        Object.assign(target.cricket!, { runs: 50, wickets: 1, overs: '5', teamLogoUri: 'old-sudur', opponentLogoUri: 'old-lumbini' });
        Object.assign(source.cricket!, { teamLogoUri: 'lumbini-logo', opponentLogoUri: 'sudur-logo' });
        const next = shareStyles(target, source, ['cricket']);
        expect(next.cricket).toMatchObject({ teamId: 'sudurpaschim', opponentId: 'lumbini', runs: 50, teamLogoUri: 'sudur-logo', opponentLogoUri: 'lumbini-logo' });
    });
    it('clears old snapshot data on template, pairing or date changes for bowling and awards too', () => {
        const before = wicket();
        const next = resetCricketTemplate(before, 'four');
        expect(next.cricket).toMatchObject({ template: 'four', runs: null, batter: { name: '' }, bowler: { name: '' }, dismissal: '' });
        expect(next.fixtureId).toBe(before.fixtureId);
        const bowling = createCricketDraftDesign('bowling'); bowling.cricket!.bowler = { name: 'Rohit Paudel', runs: 20, wickets: 3, maidens: 0, overs: '4' };
        for (const changed of [rebindCricketEvidence(bowling, 'chitwan', 'sudurpaschim'), redatePrematch(bowling, '2026-10-27')]) {
            expect(changed.cricket!.bowler).toMatchObject({ name: '', runs: null, wickets: null });
        }
    });
});

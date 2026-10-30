import { describe, expect, it } from 'vitest';
import { bestPlayerNameMatches } from '@/lib/post-studio/player-names';
import { findPlayers, nplPlayers, resolveNplPlayer } from '@/lib/post-studio/cricket-players';
import { applyPlayerPortrait, matchingPortraitFor, portraitIsCurrent } from '@/lib/post-studio/player-portraits';
import { createCricketDraftDesign } from '@/lib/post-studio/cricket-design';
import { cricketTeamIssues, knownPlayerTeam, reconcileEditedPlayerTeams } from '@/lib/post-studio/cricket-team-context';
import { phaseContradictions } from '@/lib/post-studio/phase-posts';
import { scoreContradictions } from '@/lib/post-studio/score-update';
import { lineupProblems } from '@/lib/post-studio/prematch-posts';
import { digestCreationResponse, generateCreationPrompt, type PromptOptions } from '@/lib/post-studio/prompt-engine';

describe('Cricket player name resolution', () => {
    it.each(['D.S Airee', 'D.S.Airee', 'D S Airee', 'DS Airee', 'D Airee', 'D. Singh Airee', 'Dipendra Airee', '  D.S. AIRÉE* (c)  '])('resolves %s to the same team and portrait', name => {
        expect(matchingPortraitFor(name, 'sudurpaschim')?.id).toBe('dipendra-singh-airee');
        expect(knownPlayerTeam(name)).toBe('sudurpaschim');
    });
    it.each([
        ['S. Kami', 'sompal-kami'], ['K. C.', undefined], ['Karan K.C.', 'karan-kc'],
        ['K.S. Bharat', 'ks-bharat'], ['D Arcy Short', 'd-arcy-short'],
        ['Jisan Alam', 'jishan-alam'], ['Bipin Archarya', 'bipin-acharya'],
    ])('normalizes punctuation and recorded variants: %s', (name, id) => {
        expect(resolveNplPlayer(name)?.id).toBe(id);
    });
    it('uses existing Nepali names as aliases without changing the JSON name', () => {
        const dipendra = nplPlayers.find(player => player.id === 'dipendra-singh-airee')!;
        const nepali = dipendra.aliases!.find(name => /[\u0900-\u097f]/.test(name))!;
        expect(matchingPortraitFor(nepali, 'sudurpaschim')?.id).toBe(dipendra.id);
        expect(findPlayers('sudurpaschim', 'D.S Airee').map(player => player.id)).toContain(dipendra.id);
    });
    it('does not guess a first name, surname, typo or the wrong team', () => {
        for (const name of ['Dipendra', 'Airee', 'D.S Aire', 'Unknown Player']) expect(resolveNplPlayer(name)).toBeUndefined();
        expect(matchingPortraitFor('D.S Airee', 'lumbini')).toBeUndefined();
        expect(matchingPortraitFor('Kamal Singh Airee', 'sudurpaschim')).toBeUndefined();
    });
    it('retains ambiguous initial matches and prioritizes an exact identity', () => {
        const players = [{ id: 'one', name: 'Kamal Shah' }, { id: 'two', name: 'Kiran Shah' }];
        expect(bestPlayerNameMatches('K. Shah', players).map(player => player.id)).toEqual(['one', 'two']);
        expect(bestPlayerNameMatches('Kamal Shah', players).map(player => player.id)).toEqual(['one']);
        expect(bestPlayerNameMatches('K. Shah', [...players, { id: 'three', name: 'K. Shah' }]).map(player => player.id)).toEqual(['three']);
    });
    it('uses team context for cross-team initials, but refuses same-team collisions', () => {
        expect(resolveNplPlayer('A. Sheikh')).toBeUndefined();
        expect(matchingPortraitFor('A. Sheikh', 'lumbini')?.id).toBe('aasif-sheikh');
        expect(matchingPortraitFor('A. Sheikh', 'sudurpaschim')?.id).toBe('aarif-sheikh');
        expect(knownPlayerTeam('A. Sheikh', ['sudurpaschim', 'karnali'])).toBe('sudurpaschim');
        expect(knownPlayerTeam('A. Sheikh', ['sudurpaschim', 'lumbini'])).toBeUndefined();
        expect(matchingPortraitFor('S. Patel', 'kathmandu')).toBeUndefined();
        expect(matchingPortraitFor('H. Ali', 'janakpur')).toBeUndefined();
    });
    it('keeps the portrait current and preserves figures when only the spelling changes', () => {
        const before = createCricketDraftDesign('batting', 'sudurpaschim', 'lumbini');
        before.cricket!.batter = { ...before.cricket!.batter, name: 'Dipendra Singh Airee', runs: 51, balls: 36 };
        const pictured = applyPlayerPortrait(before), edited = structuredClone(pictured);
        edited.cricket!.batter.name = 'D.S Airee';
        const next = applyPlayerPortrait(reconcileEditedPlayerTeams(pictured, edited));
        expect(next.playerPhotoId).toBe('dipendra-singh-airee'); expect(portraitIsCurrent(next)).toBe(true);
        expect(next.cricket!.batter).toMatchObject({ name: 'D.S Airee', runs: 51, balls: 36 });
        next.imageUri = '/studio/cricket/players/dipendra-singh-airee-old.webp';
        expect(applyPlayerPortrait(next).imageUri).toBe(nplPlayers.find(player => player.id === next.playerPhotoId)!.photo!.url);
        next.playerPhotoId = undefined; next.imageUri = 'data:image/png;base64,custom';
        expect(applyPlayerPortrait(next).imageUri).toBe(next.imageUri);
    });
    it('uses the same identity checks for awards, partnerships, scores and playing XIs', () => {
        const design = createCricketDraftDesign('player-of-match', 'sudurpaschim', 'lumbini'), data = design.cricket!;
        data.awardPerformance = 'all-round'; data.batter.name = 'Dipendra Singh Airee'; data.bowler.name = 'D.S Airee';
        expect(cricketTeamIssues(data)).toEqual([]);
        data.template = 'partnership'; data.secondBatter.name = 'DS Airee';
        expect(phaseContradictions(data)).toContain('Choose two different batters for the partnership.');
        expect(scoreContradictions(data)).toContain('The same batter cannot occupy both batter slots.');
        expect(lineupProblems(['Dipendra Singh Airee (c)', 'D.S Airee'])).toContain('Each player can appear only once in the Playing XI.');
    });
    it('attaches the correct portrait to pasted JSON and resolves the post side from initials', () => {
        const options: PromptOptions = { kind: 'cricket', templates: ['four'], language: 'en', format: 'portrait', brief: '', teams: { teamId: 'lumbini', opponentId: 'sudurpaschim' } };
        const prompt = generateCreationPrompt(options), marker = prompt.indexOf('RETURN THIS JSON OBJECT');
        const payload = JSON.parse(prompt.slice(prompt.indexOf('\n{', marker) + 1).split('\n```')[0]);
        Object.assign(payload.posts[0].data, { batter: { name: 'D.S Airee' }, runs: 120, wickets: 2, overs: '14' });
        payload.posts[0].teamId = null;
        const imported = digestCreationResponse(JSON.stringify(payload), options).designs[0];
        expect(imported.cricket).toMatchObject({ teamId: 'sudurpaschim', batter: { name: 'D.S Airee' }, runs: 120 });
        expect(imported.playerPhotoId).toBe('dipendra-singh-airee'); expect(portraitIsCurrent(imported)).toBe(true);
    });
});

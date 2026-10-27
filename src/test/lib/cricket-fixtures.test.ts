// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { applyCricketFixture, cricketFixtures, cricketPlayoffs, cricketRestDays, dayFixtureRows, fixtureContext, fixturesForDate, nepalDate, playoffFixture } from '@/lib/post-studio/cricket-fixtures';
import { createCricketDraftDesign } from '@/lib/post-studio/cricket-design';
import { digestCreationResponse, generateCreationPrompt, type PromptOptions } from '@/lib/post-studio/prompt-engine';
import { postDesignSchema } from '@/lib/post-studio/drafts';

describe('Published NPL fixture context', () => {
    it('contains each of the 28 league pairings once, with seven matches per team', () => {
        expect(cricketFixtures).toHaveLength(28);
        expect(new Set(cricketFixtures.map(fixture => fixture.id)).size).toBe(28);
        expect(new Set(cricketFixtures.map(fixture => [fixture.teamId, fixture.opponentId].sort().join(':'))).size).toBe(28);
        const appearances = cricketFixtures.flatMap(fixture => [fixture.teamId, fixture.opponentId]);
        for (const id of new Set(appearances)) expect(appearances.filter(team => team === id)).toHaveLength(7);
    });
    it('retains both games and their individual start times on a double-header date', () => {
        const matches = fixturesForDate('2026-10-27');
        expect(matches.map(match => match.startTime)).toEqual(['12:30', '16:30']);
        expect(matches.map(match => match.teamId)).toEqual(['biratnagar', 'karnali']);
        expect(dayFixtureRows('2026-10-27')).toHaveLength(2);
        expect(fixturesForDate('2026-10-26')).toHaveLength(1);
        expect(fixturesForDate('2026-10-30')).toHaveLength(0);
    });
    it('uses the Nepal calendar date independently of the browser timezone', () => {
        expect(nepalDate(new Date('2026-10-26T19:00:00Z'))).toBe('2026-10-27');
        expect(nepalDate(new Date('2026-10-26T18:00:00Z'))).toBe('2026-10-26');
    });
    it('prefills both games in a daily-fixtures graphic and keeps scores blank', () => {
        const fixture = fixturesForDate('2026-10-27')[1];
        const design = applyCricketFixture(createCricketDraftDesign('fixtures', fixture.teamId, fixture.opponentId), fixture);
        expect(postDesignSchema.safeParse(design).success).toBe(true);
        expect(design.fixtureId).toBe(fixture.id);
        expect(design.cricket?.fixtures.map(row => row.teamId)).toEqual(['biratnagar', 'karnali']);
        expect(design.cricket?.runs).toBeNull();
    });
    it('carries selected game metadata through prompt and import without mixing the other game', () => {
        const fixture = fixturesForDate('2026-10-27')[1];
        const options: PromptOptions = { kind: 'cricket', templates: ['matchday'], language: 'en', format: 'portrait', brief: '', fixture, teams: { teamId: fixture.teamId, opponentId: fixture.opponentId } };
        expect(generateCreationPrompt(options)).toContain('do not substitute the other game');
        const response = { title: 'Game 2', posts: [{ headline: 'MATCHDAY', data: {} }] };
        const result = digestCreationResponse(JSON.stringify(response), options);
        expect(result.designs[0]).toMatchObject({ fixtureId: fixture.id, cricket: { teamId: 'karnali', opponentId: 'janakpur', matchDate: '2026-10-27', startTime: '16:30', matchLabel: 'MATCH 03', runs: null } });
        const wrong = { ...response, match: { ...fixtureContext(fixture), teamId: fixture.teamId, opponentId: fixture.opponentId, oversLimit: 20, startTime: '12:30' } };
        expect(() => digestCreationResponse(JSON.stringify(wrong), options)).toThrow('match.startTime');
    });
    it('keeps independently created drafts bound to different fixtures on the same day', () => {
        const designs = fixturesForDate('2026-10-27').map(fixture => applyCricketFixture(createCricketDraftDesign('score', fixture.teamId, fixture.opponentId), fixture));
        designs[0].cricket!.runs = 99;
        expect(designs[1].cricket?.runs).toBeNull();
        expect(designs[0].fixtureId).not.toBe(designs[1].fixtureId);
    });
    it('retains the sheet rest days and all four playoff rounds without invented teams', () => {
        expect(cricketRestDays).toEqual(['2026-10-30', '2026-11-04', '2026-11-08', '2026-11-11']);
        expect(cricketPlayoffs.map(item => item.matchDate)).toEqual(['2026-11-17', '2026-11-18', '2026-11-19', '2026-11-21']);
        expect(cricketPlayoffs.every(item => !('teamId' in item))).toBe(true);
        const confirmed = playoffFixture('2026-11-19', 'janakpur', 'chitwan')!;
        expect(confirmed.label).toBe('Qualifier 2'); expect(confirmed.startTime).toBe('');
        expect(fixtureContext(confirmed).matchLabel).toBe('Qualifier 2');
    });
    it('applies a confirmed timing change to only the selected game, including daily-fixtures output', () => {
        const fixture = { ...fixturesForDate('2026-10-27')[1], startTime: '17:00' };
        const rows = dayFixtureRows(fixture.matchDate, fixture);
        expect(rows[0].when).toContain('12:30'); expect(rows[1].when).toContain('17:00');
        expect(fixturesForDate(fixture.matchDate)[1].startTime).toBe('16:30');
    });
});

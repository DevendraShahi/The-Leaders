import { describe, expect, it } from 'vitest';
import { nplResultUpdates, nplUpdate, standingsFromResults } from '@/lib/npl-season-update';
import { cricketFixtures, cricketPlayoffs } from '@/lib/post-studio/cricket-fixtures';
import { nplTeams } from '@/lib/post-studio/cricket-catalog';
import { nplCompletedMatches } from '@/lib/npl-match-data';
import { getNplStandings } from '@/lib/npl-data';
import { selectNplSpotlight } from '@/lib/npl-spotlight';

describe('NPL editorial update integrity', () => {
    it('keeps every confirmed result bound to the correct date, teams and source', () => {
        expect(new Set(nplResultUpdates.map(row => row.matchNumber)).size).toBe(nplResultUpdates.length);
        for (const row of nplResultUpdates) {
            expect(row.matchNumber).toBeLessThanOrEqual(28);
            expect(row.teamId).not.toBe(row.opponentId);
            expect([row.teamId, row.opponentId]).toContain(row.winnerId);
            expect(row.sourceUrl).toMatch(/^https:\/\//);
            expect(row.teamNrrBalls).toBeGreaterThan(0); expect(row.opponentNrrBalls).toBeGreaterThan(0);
            expect(new Date(`${row.matchDate}T00:00:00+05:45`).getTime()).toBeLessThanOrEqual(Date.parse(nplUpdate.checkedAt));
            expect(cricketFixtures.find(f => f.matchNumber === row.matchNumber)).toMatchObject({ matchDate: row.matchDate, teamId: row.teamId, opponentId: row.opponentId, status: 'completed', teamScore: row.teamScore, opponentScore: row.opponentScore, winnerId: row.winnerId });
        }
    });
    it('calculates standings from aggregate legal balls, counting all-out innings as 20 overs', () => {
        const standings = getNplStandings();
        expect(standings.map(row => row.teamId)).toEqual(['lumbini', 'karnali', 'chitwan', 'kathmandu', 'pokhara', 'biratnagar', 'janakpur', 'sudurpaschim']);
        expect(standings.map(row => row.nrr)).toEqual(['+4.599', '+0.950', '+0.400', '+0.000', '+0.000', '-0.400', '-0.950', '-4.599']);
        expect(standings.reduce((sum, row) => sum + row.played, 0)).toBe(nplResultUpdates.length * 2);
        expect(standings.reduce((sum, row) => sum + row.points, 0)).toBe(nplResultUpdates.length * 2);
        expect(standingsFromResults(nplTeams.map(row => row.id), []).every(row => row.points === 0 && row.played === 0)).toBe(true);
    });
    it('aggregates runs and balls across matches rather than averaging per-match NRR', () => {
        const results = [nplResultUpdates[0], { ...nplResultUpdates[0], teamRuns: 100, opponentRuns: 90, teamNrrBalls: 120, opponentNrrBalls: 120 }];
        expect(standingsFromResults(['lumbini', 'sudurpaschim'], results)[0].nrr).toBe('+1.877');
    });
    it('does not publish disputed Match 3 overs or fabricate its full scorecard', () => {
        expect(cricketFixtures[2].opponentScore).toBe('113 all out');
        expect(nplCompletedMatches[3]).toBeUndefined();
        expect(nplUpdate.pending.length).toBeGreaterThan(0);
    });
    it('uses the revised evening schedule and retains a pending current match after its start', () => {
        expect(cricketFixtures.every(row => ['12:30', '17:00'].includes(row.startTime))).toBe(true);
        expect(cricketPlayoffs.every(row => row.startTime === '17:00')).toBe(true);
        const selected = selectNplSpotlight(cricketFixtures, nplCompletedMatches, new Date('2026-10-28T18:00:00+05:45'));
        expect(selected.featured?.fixture.matchNumber).toBe(4); expect(selected.featured?.state).toBe('awaiting-update');
        expect(selected.result?.matchNumber).toBe(3);
    });
    it('never displays impossible ball notation in retained scorecards', () => {
        for (const card of Object.values(nplCompletedMatches)) for (const innings of [card.innings1, card.innings2]) {
            expect(innings.overs).toMatch(/^\d+(\.[0-5])?$/);
            for (const bowler of innings.bowling) expect(bowler.overs).toMatch(/^\d+(\.[0-5])?$/);
            for (const wicket of innings.fow) expect(wicket.over).toMatch(/^\d+(\.[0-5])?$/);
        }
    });
});

import { describe, expect, it } from 'vitest';
import { cricketFixtures as latestFixtures, type CricketFixture } from '@/lib/post-studio/cricket-fixtures';
// Historical checkpoint for selection behavior; independent of later published results.
const cricketFixtures = latestFixtures.map(row => row.matchNumber <= 3 ? row : {
    ...row, status: 'upcoming' as const, teamScore: undefined, opponentScore: undefined,
    result: undefined, resultNe: undefined, winnerId: undefined, playerOfTheMatch: undefined,
});
import { nplCompletedMatches, nplMatch1Scorecard } from '@/lib/npl-match-data';
import { completedFixture, confirmedNplFixtures, fixtureScorecard, fixtureTeamScore, selectNplSpotlight } from '@/lib/npl-spotlight';
const at = (local: string) => new Date(`${local}+05:45`);
const fixture = (number: number, patch: Partial<CricketFixture> = {}) => ({ ...cricketFixtures[number - 1], ...patch });
describe('NPL match spotlight selection', () => {
    it('shows October 28’s actual fixture instead of always choosing Match 2', () => {
        const selected = selectNplSpotlight(cricketFixtures, nplCompletedMatches, at('2026-10-28T14:00:00'));
        expect(selected.featured?.fixture.matchNumber).toBe(4);
        expect(selected.featured).toMatchObject({ state: 'scheduled', isToday: true });
        expect(selected.result?.matchNumber).toBe(3);
    });
    it('uses Nepal’s date near midnight, regardless of the server timezone', () => {
        const selected = selectNplSpotlight(cricketFixtures, nplCompletedMatches, new Date('2026-10-27T18:30:00Z'));
        expect(selected.featured?.fixture.matchNumber).toBe(4); expect(selected.featured?.isToday).toBe(true);
    });
    it('prefers an explicitly live match over the next scheduled fixture', () => {
        const fixtures = [fixture(2, { status: 'live', teamScore: '45/1' }), fixture(3)];
        const selected = selectNplSpotlight(fixtures, {}, at('2026-10-27T14:00:00'));
        expect(selected.featured?.fixture.matchNumber).toBe(2); expect(selected.featured?.state).toBe('live');
    });
    it('moves to the second double-header match once the first has a confirmed result', () => {
        const selected = selectNplSpotlight([fixture(2, { status: 'completed' }), fixture(3, { status: 'upcoming' })], {}, at('2026-10-27T15:00:00'));
        expect(selected.result?.matchNumber).toBe(2); expect(selected.featured?.fixture.matchNumber).toBe(3);
    });
    it('skips rest days and does not label a later fixture as today', () => {
        const selected = selectNplSpotlight(cricketFixtures, nplCompletedMatches, at('2026-10-30T10:00:00'));
        expect(selected.featured?.fixture.matchNumber).toBe(7); expect(selected.featured?.isToday).toBe(false);
    });
    it('does not invent live scores or a result just because the start time passed', () => {
        const selected = selectNplSpotlight([fixture(4)], {}, at('2026-10-28T18:00:00'));
        expect(selected.featured?.state).toBe('awaiting-update'); expect(selected.result).toBeUndefined();
        expect(fixtureTeamScore(selected.featured!.fixture, 'pokhara')).toBeUndefined();
    });
    it('selects the latest completed result even if fixtures arrive out of order', () => {
        const selected = selectNplSpotlight([fixture(3, { status: 'completed' }), fixture(1), fixture(2, { status: 'completed' })], nplCompletedMatches, at('2026-10-28T10:00:00'));
        expect(selected.result?.matchNumber).toBe(3);
    });
    it('maps innings scores to the correct team rather than fixture/innings array order', () => {
        expect(fixtureTeamScore(fixture(1), 'lumbini', nplMatch1Scorecard)).toBe('88/3 (9.5 ov)');
        expect(fixtureTeamScore(fixture(1), 'sudurpaschim', nplMatch1Scorecard)).toBe('87 (17.2 ov)');
    });
    it('refuses to reuse an unrelated or mismatched scorecard', () => {
        expect(fixtureScorecard(fixture(2), nplCompletedMatches)).toBeUndefined();
        expect(fixtureScorecard(fixture(1, { teamId: 'pokhara' }), nplCompletedMatches)).toBeUndefined();
        expect(fixtureScorecard(fixture(1, { matchDate: '2026-10-27' }), nplCompletedMatches)).toBeUndefined();
    });
    it('derives fixture list results from confirmed scorecards without mutating the schedule', () => {
        const original = fixture(1, { status: 'upcoming', teamScore: undefined });
        const [enriched] = confirmedNplFixtures([original], nplCompletedMatches);
        expect(enriched.status).toBe('completed'); expect(enriched.teamScore).toBe('88/3 (9.5 ov)');
        expect(original.status).toBe('upcoming'); expect(original.teamScore).toBeUndefined();
        expect(completedFixture(original, nplCompletedMatches)).toBe(true);
    });
    it('handles an empty schedule and a fully completed tournament', () => {
        expect(selectNplSpotlight([], {}, at('2026-10-28T10:00:00')).featured).toBeUndefined();
        const selected = selectNplSpotlight([fixture(1)], nplCompletedMatches, at('2026-11-22T10:00:00'));
        expect(selected.featured).toBeUndefined(); expect(selected.result?.matchNumber).toBe(1);
    });
});

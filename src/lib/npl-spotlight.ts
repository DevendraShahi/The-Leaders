import { nepalDate, type CricketFixture } from './post-studio/cricket-fixtures';
import type { CompletedMatchScorecard } from './npl-match-data';

export type FeaturedFixture = { fixture: CricketFixture; state: 'live' | 'scheduled' | 'awaiting-update'; isToday: boolean };
export function fixtureScorecard(fixture: CricketFixture, cards: Record<number, CompletedMatchScorecard>) {
    const card = cards[fixture.matchNumber];
    if (!card || card.matchNumber !== fixture.matchNumber || card.matchDate !== fixture.matchDate || fixture.teamId === fixture.opponentId) return undefined;
    const ids = [card.innings1.teamId, card.innings2.teamId];
    return ids.includes(fixture.teamId) && ids.includes(fixture.opponentId) ? card : undefined;
}
export function completedFixture(fixture: CricketFixture, cards: Record<number, CompletedMatchScorecard>) {
    return fixture.status === 'completed' || Boolean(fixtureScorecard(fixture, cards));
}
function scheduledAt(fixture: CricketFixture) {
    return Date.parse(`${fixture.matchDate}T${fixture.startTime || '23:59'}:00+05:45`);
}
export function selectNplSpotlight(fixtures: CricketFixture[], cards: Record<number, CompletedMatchScorecard>, now = new Date()) {
    const sorted = [...fixtures].sort((a, b) => scheduledAt(a) - scheduledAt(b) || a.matchNumber - b.matchNumber);
    const today = nepalDate(now);
    const result = [...sorted].reverse().find(fixture => completedFixture(fixture, cards));
    const unplayed = sorted.filter(fixture => !completedFixture(fixture, cards));
    const live = [...unplayed].reverse().find(fixture => fixture.status === 'live');
    const upcoming = unplayed.find(fixture => scheduledAt(fixture) >= now.getTime());
    const recentPending = [...unplayed].reverse().find(fixture => scheduledAt(fixture) < now.getTime());
    const todayPending = [...unplayed].reverse().find(fixture => fixture.matchDate === today && scheduledAt(fixture) < now.getTime());
    const fixture = live || todayPending || upcoming || recentPending;
    const featured: FeaturedFixture | undefined = fixture ? {
        fixture, state: fixture.status === 'live' ? 'live' : scheduledAt(fixture) < now.getTime() ? 'awaiting-update' : 'scheduled', isToday: fixture.matchDate === today,
    } : undefined;
    return { featured, result, scorecard: result ? fixtureScorecard(result, cards) : undefined };
}
export function fixtureTeamScore(fixture: CricketFixture, teamId: string, card?: CompletedMatchScorecard) {
    const innings = card && [card.innings1, card.innings2].find(item => item.teamId === teamId);
    if (innings) return `${innings.score}${innings.overs ? ` (${innings.overs} ov)` : ''}`;
    return teamId === fixture.teamId ? fixture.teamScore : teamId === fixture.opponentId ? fixture.opponentScore : undefined;
}

/** One confirmed scorecard updates the hero and fixture list without duplicating results. */
export function confirmedNplFixtures(fixtures: CricketFixture[], cards: Record<number, CompletedMatchScorecard>) {
    return fixtures.map(fixture => {
        const card = fixtureScorecard(fixture, cards);
        if (!card) return fixture;
        return { ...fixture, status: 'completed' as const, result: card.result, resultNe: card.resultNe,
            winnerId: card.winnerId, teamScore: fixtureTeamScore(fixture, fixture.teamId, card), opponentScore: fixtureTeamScore(fixture, fixture.opponentId, card),
            playerOfTheMatch: card.playerOfTheMatch.name, playerOfTheMatchNe: card.playerOfTheMatch.nameNe, playerOfTheMatchPerf: card.playerOfTheMatch.performance };
    });
}

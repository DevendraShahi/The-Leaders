import type { NplTeamId } from './post-studio/cricket-catalog';

/** Editorial snapshot. Update this file first; see docs/NPL_UPDATES.md. */
export const nplUpdate = {
    checkedAt: '2026-10-28T09:07:12Z',
    scheduleSource: 'https://www.nepalpremierleague.org/news/npl-2026-season-preview',
    resultsSource: 'https://nplt20league.com/matches/2026/',
    crossCheckSource: 'https://ekantipur.com/npl',
    pending: ['Match 3 final overs: sources disagree (19.2 / 19.3).', 'Complete scorecards and player awards for Matches 2–3; season cap standings require complete player statistics.'],
};
export interface NplResultUpdate {
    matchNumber: number; matchDate: string; teamId: NplTeamId; opponentId: NplTeamId;
    winnerId: NplTeamId; teamScore: string; opponentScore: string; result: string; resultNe: string;
    /** Runs and NRR denominator in legal balls. All-out innings use the full allocation. */
    teamRuns: number; opponentRuns: number; teamNrrBalls: number; opponentNrrBalls: number;
    sourceUrl: string;
}
export const nplResultUpdates: NplResultUpdate[] = [
    { matchNumber: 1, matchDate: '2026-10-26', teamId: 'lumbini', opponentId: 'sudurpaschim', winnerId: 'lumbini',
        teamScore: '88/3 (9.5 ov)', opponentScore: '87 (17.2 ov)', teamRuns: 88, opponentRuns: 87, teamNrrBalls: 59, opponentNrrBalls: 120,
        result: 'Lumbini Lions won by 7 wickets (with 61 balls remaining)', resultNe: 'लुम्बिनी लायन्स ७ विकेटले विजयी (६१ बल बाँकी छँदै)',
        sourceUrl: 'https://nplt20league.com/matches/2026/' },
    { matchNumber: 2, matchDate: '2026-10-27', teamId: 'biratnagar', opponentId: 'chitwan', winnerId: 'chitwan',
        teamScore: '149 (19.3 ov)', opponentScore: '157/3 (20 ov)', teamRuns: 149, opponentRuns: 157, teamNrrBalls: 120, opponentNrrBalls: 120,
        result: 'Chitwan Rhinos won by 8 runs', resultNe: 'चितवन राइनोज ८ रनले विजयी',
        sourceUrl: 'https://nplt20league.com/matches/2026/biratnagar-kings-vs-chitwan-rhinos-npl-2nd-match-2026/' },
    { matchNumber: 3, matchDate: '2026-10-27', teamId: 'karnali', opponentId: 'janakpur', winnerId: 'karnali',
        teamScore: '132/9 (20 ov)', opponentScore: '113 all out', teamRuns: 132, opponentRuns: 113, teamNrrBalls: 120, opponentNrrBalls: 120,
        result: 'Karnali Yaks won by 19 runs', resultNe: 'कर्णाली याक्स १९ रनले विजयी',
        sourceUrl: 'https://nplt20league.com/matches/2026/karnali-yaks-vs-janakpur-bolts-npl-3rd-match-2026/' },
];

/** League results only; extend explicitly for ties/NR/DLS before entering those results. */
export function standingsFromResults(teamIds: NplTeamId[], results = nplResultUpdates) {
    const rows = teamIds.map(teamId => {
        let played = 0, won = 0, runsFor = 0, runsAgainst = 0, ballsFor = 0, ballsAgainst = 0;
        for (const result of results) {
            const first = result.teamId === teamId;
            if (!first && result.opponentId !== teamId) continue;
            played++; if (result.winnerId === teamId) won++;
            runsFor += first ? result.teamRuns : result.opponentRuns;
            runsAgainst += first ? result.opponentRuns : result.teamRuns;
            ballsFor += first ? result.teamNrrBalls : result.opponentNrrBalls;
            ballsAgainst += first ? result.opponentNrrBalls : result.teamNrrBalls;
        }
        const rate = ballsFor && ballsAgainst ? runsFor * 6 / ballsFor - runsAgainst * 6 / ballsAgainst : 0;
        return { teamId, played, won, lost: played - won, tied: 0, nr: 0, points: won * 2, rate };
    });
    return rows.sort((a, b) => b.points - a.points || b.rate - a.rate || a.teamId.localeCompare(b.teamId))
        .map(({ rate, ...row }, index) => ({ ...row, rank: index + 1, nrr: `${rate >= 0 ? '+' : ''}${rate.toFixed(3)}` }));
}

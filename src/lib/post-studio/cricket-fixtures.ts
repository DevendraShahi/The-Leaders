import { nplTeam, type NplTeamId } from './cricket-catalog';
import type { PostDesign } from './types';

export const fixtureScheduleSource = '/studio/cricket/fixtures-season3.png';
export const fixtureTimingSource = 'https://myrepublica.nagariknetwork.com/news/drs-to-be-used-in-all-npl-matches-schedule-revised-30-15.html';
export const fixtureScheduleChecked = '2026-10-26';
export interface CricketFixture {
    id: string; matchNumber: number; matchDate: string; startTime: string;
    teamId: NplTeamId; opponentId: NplTeamId; competition: string; venue: string; sourceUrl: string;
    label?: string;
    status?: 'completed' | 'live' | 'upcoming';
    result?: string;
    resultNe?: string;
    winnerId?: NplTeamId;
    teamScore?: string;
    opponentScore?: string;
    playerOfTheMatch?: string;
    playerOfTheMatchNe?: string;
    playerOfTheMatchPerf?: string;
}
// Transcribed from the fixture sheet supplied by the editor on October 26.
// The sheet's second-match time is 16:30. A separately reported revision says
// 17:00; callers may explicitly override a selected game's time after checking.
const league: [string, NplTeamId, NplTeamId, string][] = [
    ['10-26', 'lumbini', 'sudurpaschim', '16:30'],
    ['10-27', 'biratnagar', 'chitwan', '12:30'], ['10-27', 'karnali', 'janakpur', '16:30'],
    ['10-28', 'pokhara', 'sudurpaschim', '16:30'],
    ['10-29', 'janakpur', 'kathmandu', '12:30'], ['10-29', 'karnali', 'biratnagar', '16:30'],
    ['10-31', 'lumbini', 'chitwan', '12:30'], ['10-31', 'sudurpaschim', 'biratnagar', '16:30'],
    ['11-01', 'janakpur', 'pokhara', '16:30'],
    ['11-02', 'kathmandu', 'karnali', '12:30'], ['11-02', 'sudurpaschim', 'chitwan', '16:30'],
    ['11-03', 'biratnagar', 'janakpur', '12:30'], ['11-03', 'lumbini', 'pokhara', '16:30'],
    ['11-05', 'lumbini', 'janakpur', '12:30'], ['11-05', 'kathmandu', 'biratnagar', '16:30'],
    ['11-06', 'sudurpaschim', 'karnali', '12:30'], ['11-06', 'chitwan', 'pokhara', '16:30'],
    ['11-07', 'kathmandu', 'lumbini', '16:30'],
    ['11-09', 'pokhara', 'karnali', '12:30'], ['11-09', 'chitwan', 'kathmandu', '16:30'],
    ['11-10', 'sudurpaschim', 'janakpur', '16:30'],
    ['11-12', 'biratnagar', 'pokhara', '12:30'], ['11-12', 'karnali', 'lumbini', '16:30'],
    ['11-13', 'kathmandu', 'sudurpaschim', '12:30'], ['11-13', 'janakpur', 'chitwan', '16:30'],
    ['11-14', 'biratnagar', 'lumbini', '16:30'],
    ['11-15', 'chitwan', 'karnali', '12:30'], ['11-15', 'pokhara', 'kathmandu', '16:30'],
];
export const cricketFixtures: CricketFixture[] = league.map(([date, teamId, opponentId, startTime], index) => {
    const matchNumber = index + 1;
    const base: CricketFixture = {
        id: `npl-2026-league-${matchNumber}`,
        matchNumber,
        matchDate: `2026-${date}`,
        startTime,
        teamId,
        opponentId,
        competition: 'NPL 2026',
        venue: 'Tribhuvan University International Cricket Ground, Kirtipur',
        sourceUrl: '',
        status: matchNumber === 1 ? 'completed' : 'upcoming',
    };

    if (matchNumber === 1) {
        base.result = 'Lumbini Lions won by 7 wickets (with 61 balls remaining)';
        base.resultNe = 'लुम्बिनी लायन्स ७ विकेटले विजयी (६१ बल बाँकी छँदै)';
        base.winnerId = 'lumbini';
        base.teamScore = '88/3 (9.5 ov)';
        base.opponentScore = '87 (17.2 ov)';
        base.playerOfTheMatch = 'Sher Malla';
        base.playerOfTheMatchNe = 'शेर मल्ल';
        base.playerOfTheMatchPerf = '3/11 (4.0 ov)';
    }

    return base;
});
export const cricketRestDays = ['2026-10-30', '2026-11-04', '2026-11-08', '2026-11-11'];
export const cricketPlayoffs = [
    { id: 'npl-2026-qualifier-1', matchNumber: 29, matchDate: '2026-11-17', label: 'Qualifier 1', participants: '1st place vs 2nd place' },
    { id: 'npl-2026-eliminator', matchNumber: 30, matchDate: '2026-11-18', label: 'Eliminator', participants: '3rd place vs 4th place' },
    { id: 'npl-2026-qualifier-2', matchNumber: 31, matchDate: '2026-11-19', label: 'Qualifier 2', participants: 'Loser of Qualifier 1 vs winner of Eliminator' },
    { id: 'npl-2026-final', matchNumber: 32, matchDate: '2026-11-21', label: 'Grand Finale', participants: 'Winner of Qualifier 1 vs winner of Qualifier 2' },
];
export function playoffFixture(date: string, teamId: NplTeamId, opponentId: NplTeamId): CricketFixture | undefined {
    const playoff = cricketPlayoffs.find(item => item.matchDate === date);
    if (!playoff) return undefined;
    return { ...playoff, startTime: '', teamId, opponentId, competition: 'NPL 2026', venue: 'Tribhuvan University International Cricket Ground, Kirtipur', sourceUrl: '' };
}
export function fixturesForDate(date: string): CricketFixture[] {
    return cricketFixtures.filter(fixture => fixture.matchDate === date).sort((a, b) => a.startTime.localeCompare(b.startTime));
}
export function nepalDate(now = new Date()): string {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kathmandu', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)!.value).join('-');
}
export function fixtureContext(fixture: CricketFixture) {
    return { competition: fixture.competition, matchLabel: fixture.label ?? `MATCH ${String(fixture.matchNumber).padStart(2, '0')}`, venue: fixture.venue,
        matchDate: fixture.matchDate, startTime: fixture.startTime, sourceUrl: fixture.sourceUrl };
}
export function dayFixtureRows(date: string, override?: CricketFixture) {
    const games = fixturesForDate(date);
    if (override && !games.some(item => item.id === override.id)) games.push(override);
    return games.map(item => override?.id === item.id ? override : item).map(fixture => ({ teamId: fixture.teamId, opponentId: fixture.opponentId,
        when: `${fixture.matchDate} · ${fixture.startTime ? `${fixture.startTime} NPT` : 'Time to confirm'}`, venue: fixture.venue.slice(0, 80) }));
}
export function fixtureLabel(fixture: CricketFixture, gameIndex?: number): string {
    return `${fixture.label ?? (gameIndex === undefined ? `Match ${fixture.matchNumber}` : `Game ${gameIndex + 1}`)} · ${fixture.startTime ? `${fixture.startTime} NPT` : 'Time to confirm'} · ${nplTeam(fixture.teamId).name} vs ${nplTeam(fixture.opponentId).name}`;
}
export function applyCricketFixture(design: PostDesign, fixture: CricketFixture): PostDesign {
    if (!design.cricket) return design;
    const pair = [fixture.teamId, fixture.opponentId];
    if (!pair.includes(design.cricket.teamId) || !pair.includes(design.cricket.opponentId) || design.cricket.teamId === design.cricket.opponentId) throw new Error('The selected teams do not match this fixture. Choose the fixture again or use Custom match.');
    return { ...design, fixtureId: fixture.id, cricket: { ...design.cricket, ...fixtureContext(fixture),
        sourceUrl: design.cricket.sourceUrl || fixture.sourceUrl,
        ...(design.cricket.template === 'fixtures' ? { fixtures: dayFixtureRows(fixture.matchDate, fixture) } : {}),
    } };
}

import { cricketTeamIssues } from './cricket-team-context';
import { blankCricketData, chaseEquation, oversToBalls, type CricketData } from './cricket-data';
import type { PostDesign } from './types';
import type { NplTeamId } from './cricket-catalog';

export const scoreCopy = { headline: 48, summary: 100 } as const;
export const scoreHeadline = (language: 'en' | 'ne') => language === 'ne' ? 'स्कोर अपडेट' : 'SCORE UPDATE';
export const hasBatter = (batter: CricketData['batter']) => Boolean(batter.name.trim()) || batter.notOut || [batter.runs, batter.balls, batter.fours, batter.sixes].some(value => value !== null);
export function scoreContradictions(data: CricketData): string[] {
    const issues: string[] = [], balls = oversToBalls(data.overs);
    if (data.scoreInnings === 'first' && data.target !== null) issues.push('A first-innings update must not contain a chase target.');
    if (data.target !== null && data.target < 1) issues.push('A confirmed target must be at least one run.');
    const batters = [data.batter, data.secondBatter].filter(hasBatter);
    if (batters.length === 2 && batters[0].name.trim() && batters[0].name.normalize('NFKC').trim().toLocaleLowerCase() === batters[1].name.normalize('NFKC').trim().toLocaleLowerCase()) issues.push('The same batter cannot occupy both batter slots.');
    if (data.runs !== null && batters.reduce((sum, batter) => sum + (batter.runs ?? 0), 0) > data.runs) issues.push('The displayed batters’ runs exceed the team total.');
    batters.forEach((batter, index) => {
        if (batter.runs !== null && (batter.fours ?? 0) * 4 + (batter.sixes ?? 0) * 6 > batter.runs) issues.push(`Batter ${index + 1}: boundary runs exceed the batter’s score.`);
    });
    if (balls !== null && balls > data.oversLimit * 6) issues.push('Overs exceed the innings limit.');
    return issues;
}
export function scoreState(data: CricketData): 'pending' | 'first' | 'chase' | 'target-reached' | 'all-out' | 'overs-complete' {
    const balls = oversToBalls(data.overs);
    if (!data.scoreInnings || data.runs === null || data.wickets === null || balls === null) return 'pending';
    if (data.scoreInnings === 'chase' && data.target !== null && data.runs >= data.target) return 'target-reached';
    if (data.wickets === 10) return 'all-out';
    if (balls >= data.oversLimit * 6) return 'overs-complete';
    return data.scoreInnings;
}
export function scoreChase(data: CricketData) {
    return scoreState(data) === 'chase' && data.target !== null && data.target > 0 ? chaseEquation(data) : null;
}
export function scoreUpdateIssues(design: PostDesign): string[] {
    const data = design.cricket;
    if (design.template !== 'cricket' || data?.template !== 'score') return [];
    const issues = [...scoreContradictions(data), ...cricketTeamIssues(data)];
    if (!design.headline.trim() || design.hiddenLayers.includes('headline')) issues.push('Show the Score Update headline before exporting.');
    if (design.headline.length > scoreCopy.headline) issues.push('Keep the headline within 48 characters.');
    if (!design.hiddenLayers.includes('supporting') && design.summary.length > scoreCopy.summary) issues.push('Keep supporting copy within 100 characters.');
    if (!data.scoreInnings) issues.push('Confirm first innings or a chase.');
    if (data.runs === null || data.wickets === null || oversToBalls(data.overs) === null) issues.push('Confirm the team runs, wickets and overs.');
    if (data.scoreInnings === 'chase' && data.target === null) issues.push('Enter the officially confirmed chase target.');
    [data.batter, data.secondBatter].forEach((batter, index) => {
        if (hasBatter(batter) && (!batter.name.trim() || batter.runs === null || batter.balls === null)) issues.push(`Batter ${index + 1}: provide name, runs and balls, or clear the optional batter slot.`);
    });
    return issues;
}
/** A score snapshot belongs to one batting side and fixture, not just to a team pair. */
export function rebindScore(design: PostDesign, teamId: NplTeamId, opponentId: NplTeamId, matchDate = design.cricket?.matchDate ?? ''): PostDesign {
    const data = design.cricket;
    if (design.template !== 'cricket' || data?.template !== 'score' || (data.teamId === teamId && data.opponentId === opponentId && data.matchDate === matchDate)) return design;
    const empty = blankCricketData('score');
    return { ...design, fixtureId: undefined, sourceUrls: [], cricket: { ...data, teamId, opponentId, matchDate, scoreInnings: null, runs: null, wickets: null, overs: '', target: null, batter: empty.batter, secondBatter: empty.secondBatter, opponentRuns: null, opponentWickets: null, opponentOvers: '', sourceUrl: '', updatedAt: '' } };
}
export function setScoreInnings(design: PostDesign, scoreInnings: CricketData['scoreInnings']): PostDesign {
    const data = design.cricket;
    if (design.template !== 'cricket' || data?.template !== 'score' || data.scoreInnings === scoreInnings) return design;
    if (data.scoreInnings) {
        const empty = blankCricketData('score');
        return { ...design, sourceUrls: [], cricket: { ...data, scoreInnings, runs: null, wickets: null, overs: '', target: null, batter: empty.batter, secondBatter: empty.secondBatter, opponentRuns: null, opponentWickets: null, opponentOvers: '', sourceUrl: '', updatedAt: '' } };
    }
    return { ...design, cricket: { ...data, scoreInnings, ...(scoreInnings === 'first' ? { target: null } : {}) } };
}

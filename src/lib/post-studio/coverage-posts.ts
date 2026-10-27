import { oversToBalls, type CricketData } from './cricket-data';
import type { CricketTemplateId } from './cricket-catalog';
import { cricketTeamIssues } from './cricket-team-context';
import type { PostDesign } from './types';

export const coverageIds = ['innings', 'target', 'dls', 'rain', 'fifty', 'century', 'batting', 'bowling', 'five-for', 'hat-trick', 'player-of-match', 'result', 'scorecard', 'points-table', 'qualified', 'champions'] as const;
export const isCoverageTemplate = (id: string): id is typeof coverageIds[number] => coverageIds.includes(id as typeof coverageIds[number]);
export const coverageCopy = { headline: 64, summary: 140 } as const;
export const isBowlingCoverage = (data: CricketData) => ['bowling', 'five-for', 'hat-trick'].includes(data.template) || (data.template === 'player-of-match' && data.awardPerformance === 'bowling');
export const isPlayerCoverage = (id: CricketTemplateId) => ['fifty', 'century', 'batting', 'bowling', 'five-for', 'hat-trick', 'player-of-match'].includes(id);

export function coverageContradictions(data: CricketData, visibleOnly = false): string[] {
    if (!isCoverageTemplate(data.template)) return [];
    const issues: string[] = [];
    const batting = ['fifty', 'century', 'batting'].includes(data.template) || (data.template === 'player-of-match' && data.awardPerformance !== 'bowling');
    if (batting && data.batter.runs !== null && (data.batter.fours ?? 0) * 4 + (visibleOnly && data.template === 'player-of-match' && data.awardPerformance === 'all-round' ? 0 : data.batter.sixes ?? 0) * 6 > data.batter.runs) issues.push('Boundary runs cannot exceed the batter’s innings runs.');
    if (batting && data.runs !== null && data.batter.runs !== null && data.batter.runs > data.runs) issues.push('The batter’s runs cannot exceed the team score.');
    if (data.template === 'fifty' && data.batter.runs !== null && data.batter.runs < 50) issues.push('A fifty requires at least 50 confirmed batter runs.');
    if (data.template === 'century' && data.batter.runs !== null && data.batter.runs < 100) issues.push('A century requires at least 100 confirmed batter runs.');
    if (data.template === 'five-for' && data.bowler.wickets !== null && data.bowler.wickets < 5) issues.push('A five-wicket haul requires at least five credited wickets.');
    if (data.template === 'hat-trick' && data.bowler.wickets !== null && data.bowler.wickets < 3) issues.push('A hat-trick requires at least three credited wickets and a confirmed consecutive-ball sequence.');
    if ((isBowlingCoverage(data) || (!visibleOnly && data.template === 'player-of-match' && data.awardPerformance === 'all-round')) && data.bowler.wickets !== null && data.opponentWickets !== null && data.bowler.wickets > data.opponentWickets) issues.push('The bowler’s wickets cannot exceed opposition wickets lost.');
    const bowlerBalls = oversToBalls(data.bowler.overs);
    if ((isBowlingCoverage(data) || (!visibleOnly && data.template === 'player-of-match' && data.awardPerformance === 'all-round')) && bowlerBalls !== null) {
        if (bowlerBalls > data.oversLimit * 6) issues.push('Bowler overs cannot exceed the innings limit.');
        if (data.bowler.maidens !== null && data.bowler.maidens > Math.floor(bowlerBalls / 6)) issues.push('Maiden overs cannot exceed completed bowler overs.');
    }
    if (data.target !== null && ['target', 'dls', 'innings'].includes(data.template) && data.target < 1) issues.push('An official target must be a positive number of runs.');
    if (data.template === 'scorecard') {
        if (data.runs !== null && data.batting.reduce((sum, row) => sum + (row.runs ?? 0), 0) > data.runs) issues.push('Scorecard batter runs cannot exceed the innings total.');
        if (!visibleOnly) for (const row of data.batting) if (row.runs !== null && (row.fours ?? 0) * 4 + (row.sixes ?? 0) * 6 > row.runs) issues.push(`${row.name || 'Batter'}: boundary runs exceed innings runs.`);
        if (data.wickets !== null && data.bowling.reduce((sum, row) => sum + (row.wickets ?? 0), 0) > data.wickets) issues.push('Credited bowling wickets cannot exceed innings wickets lost.');
        const inningsBalls = oversToBalls(data.overs);
        if (inningsBalls !== null && data.bowling.reduce((sum, row) => sum + (oversToBalls(row.overs) ?? 0), 0) > inningsBalls) issues.push('Scorecard bowler overs cannot exceed the innings overs.');
    }
    if (data.template === 'points-table') for (const row of data.standings) if (row.played !== null && row.won !== null && row.lost !== null && row.won + row.lost > row.played) issues.push('Standings wins and losses cannot exceed matches played.');
    return [...new Set(issues)];
}
export function coverageIssues(design: PostDesign): string[] {
    const data = design.cricket;
    if (design.template !== 'cricket' || !data || !isCoverageTemplate(data.template)) return [];
    const issues = [...coverageContradictions(data, true), ...cricketTeamIssues(data)];
    if (!design.headline.trim() || design.hiddenLayers.includes('headline')) issues.push('Show the post headline before exporting.');
    if (design.headline.length > coverageCopy.headline || (!design.hiddenLayers.includes('supporting') && design.summary.length > coverageCopy.summary)) issues.push('Keep the headline within 64 characters and supporting copy within 140.');
    const snapshot = (opposition = false) => {
        const runs = opposition ? data.opponentRuns : data.runs, wickets = opposition ? data.opponentWickets : data.wickets, overs = opposition ? data.opponentOvers : data.overs;
        if (runs === null || wickets === null || oversToBalls(overs) === null) issues.push(`Confirm ${opposition ? 'the opposition' : 'the batting team'} runs, wickets and overs.`);
    };
    if (['innings', 'scorecard', 'result', 'champions'].includes(data.template) || (isPlayerCoverage(data.template) && !isBowlingCoverage(data))) snapshot();
    if (isBowlingCoverage(data) || ['result', 'champions'].includes(data.template)) snapshot(true);
    if (['target', 'dls'].includes(data.template) && data.target === null) issues.push('Enter the officially announced target; never guess a DLS target.');
    if (['rain', 'qualified', 'result', 'champions'].includes(data.template) && !data.result.trim()) issues.push('Add the confirmed status or result.');
    if (isPlayerCoverage(data.template)) {
        if (!isBowlingCoverage(data) && (!data.batter.name.trim() || data.batter.runs === null || data.batter.balls === null)) issues.push('Confirm the batter name, runs and balls.');
        if (isBowlingCoverage(data) && (!data.bowler.name.trim() || data.bowler.wickets === null || data.bowler.runs === null || oversToBalls(data.bowler.overs) === null)) issues.push('Confirm the bowler name, credited wickets, runs conceded and overs.');
        if (data.template === 'player-of-match' && data.awardPerformance === 'all-round' && (data.bowler.wickets === null || data.bowler.runs === null)) issues.push('Confirm the displayed all-round wickets and runs conceded.');
    }
    if (data.template === 'scorecard' && (!data.batting.length || !data.bowling.length)) issues.push('Add batting and opposition bowling rows from the same innings.');
    if (data.template === 'scorecard' && (data.batting.some(row => !row.name.trim() || row.runs === null || row.balls === null) || data.bowling.some(row => !row.name.trim() || row.wickets === null || row.runs === null || oversToBalls(row.overs) === null))) issues.push('Complete the names and displayed figures in each scorecard row.');
    if (data.template === 'points-table' && (!data.standings.length || data.standings.some(row => [row.played, row.won, row.lost, row.points].some(value => value === null)))) issues.push('Complete the displayed standings rows; unknown values are not zero.');
    return [...new Set(issues)];
}

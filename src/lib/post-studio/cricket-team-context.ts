import { blankCricketData, type CricketData } from './cricket-data';
import { nplTeam, type CricketTemplateId, type NplTeamId } from './cricket-catalog';
import { resolveNplPlayer, samePlayerName } from './cricket-players';
import type { PostDesign } from './types';

const fixedPairTemplates = new Set<CricketTemplateId>(['matchday', 'fixtures', 'head-to-head', 'toss']);
export const hasPostTeam = (template: CricketTemplateId) => !fixedPairTemplates.has(template);
export const isOtherMatchSnapshot = (template: CricketTemplateId) => ['batting', 'fifty', 'century', 'bowling', 'five-for', 'hat-trick', 'player-of-match', 'innings', 'target', 'dls', 'rain', 'result', 'qualified', 'champions', 'scorecard'].includes(template);
export const postTeamLabel = (data: CricketData) => data.template === 'player-of-match' ? 'Award winner’s team' : ['bowling', 'five-for', 'hat-trick'].includes(data.template) ? 'Bowler’s team' : ['four', 'six', 'wicket', 'score', 'powerplay', 'partnership', 'innings', 'target', 'dls', 'batting', 'fifty', 'century', 'scorecard'].includes(data.template) ? 'Batting team' : data.template === 'playing-xi' ? 'Lineup team' : 'Post team';
const creditedDismissals = new Set(['bowled', 'caught', 'lbw', 'stumped', 'hit-wicket']);

/** Resolve roster identity independently of photo availability. */
export function knownPlayerTeam(name: string, teams?: readonly NplTeamId[]): NplTeamId | undefined {
    return resolveNplPlayer(name, teams)?.teamId;
}
export function postPlayerRoles(data: CricketData): { role: 'batter' | 'secondBatter' | 'bowler'; opposition: boolean }[] {
    if (data.template === 'wicket') return [{ role: 'batter', opposition: false }, ...(data.wicketType && creditedDismissals.has(data.wicketType) ? [{ role: 'bowler' as const, opposition: true }] : [])];
    if (['bowling', 'five-for', 'hat-trick'].includes(data.template)) return [{ role: 'bowler', opposition: false }];
    if (data.template === 'player-of-match') return data.awardPerformance === 'bowling' ? [{ role: 'bowler', opposition: false }] : [{ role: 'batter', opposition: false }, ...(data.awardPerformance === 'all-round' ? [{ role: 'bowler' as const, opposition: false }] : [])];
    if (['score', 'innings', 'partnership'].includes(data.template)) return [{ role: 'batter', opposition: false }, { role: 'secondBatter', opposition: false }];
    if (['four', 'six', 'batting', 'fifty', 'century'].includes(data.template)) return [{ role: 'batter', opposition: false }];
    return [];
}
function participants(data: CricketData): { name: string; opposition: boolean }[] {
    const rows = postPlayerRoles(data).map(({ role, opposition }) => ({ name: data[role].name, opposition }));
    if (data.template === 'playing-xi') rows.push(...data.lineup.map(name => ({ name, opposition: false })));
    if (data.template === 'scorecard') rows.push(...data.batting.map(row => ({ name: row.name, opposition: false })), ...data.bowling.map(row => ({ name: row.name, opposition: true })));
    return rows;
}
export function cricketTeamIssues(data: CricketData): string[] {
    if (data.sample) return [];
    const issues = participants(data).flatMap(({ name, opposition }) => {
        const actual = knownPlayerTeam(name), expected = opposition ? data.opponentId : data.teamId;
        return actual && actual !== expected ? [`${name} is listed with ${nplTeam(actual).name}; ${opposition ? 'the credited bowler must belong to the fielding side' : 'this player must belong to the post’s featured side'}. Confirm the player or correct the post team.`] : [];
    });
    if (data.template === 'player-of-match' && data.awardPerformance === 'all-round' && data.batter.name.trim() && data.bowler.name.trim() && !samePlayerName(data.batter.name, data.bowler.name, data.teamId)) issues.push('An all-round award must use the same player for batting and bowling figures.');
    return issues;
}

/** A fixture is an unordered pair. Each post has its own score/performance perspective. */
export function resolveResponseTeam(data: CricketData, explicitTeam?: NplTeamId | null): { data: CricketData; warnings: string[] } {
    if (!hasPostTeam(data.template)) return { data, warnings: [] };
    const pair = [data.teamId, data.opponentId];
    const candidates = participants(data).flatMap(({ name, opposition }) => {
        const team = knownPlayerTeam(name, pair);
        return team && pair.includes(team) ? [opposition ? pair.find(id => id !== team)! : team] : [];
    });
    const detected = new Set(candidates);
    const teamId = explicitTeam ?? (detected.size === 1 ? [...detected][0] : data.teamId);
    if (!pair.includes(teamId)) throw new Error('The post team must be one of the two selected fixture teams.');
    const next = teamId === data.teamId ? data : { ...data, teamId, opponentId: data.teamId, teamLogoUri: data.opponentLogoUri, opponentLogoUri: data.teamLogoUri };
    return { data: next, warnings: [
        ...(teamId !== data.teamId ? [`Post side resolved to ${nplTeam(teamId).name}; the selected fixture is unchanged.`] : []),
        ...(detected.size > 1 ? ['Player names imply conflicting teams. Confirm the batting/featured side in Review.'] : []),
        ...cricketTeamIssues(next),
    ] };
}

/** Editing a player can change innings perspective, but cannot re-label an old score. */
export function reconcileEditedPlayerTeams(before: PostDesign, edited: PostDesign): PostDesign {
    const data = edited.cricket, previous = before.cricket;
    if (!data || !previous || data.template !== previous.template || !hasPostTeam(data.template)) return edited;
    const changed = postPlayerRoles(data).filter(({ role, opposition }) => !samePlayerName(previous[role].name, data[role].name, opposition ? previous.opponentId : previous.teamId));
    if (!changed.length) return edited;
    const blank = blankCricketData(data.template);
    let next = { ...data };
    for (const { role } of changed) next = { ...next, [role]: { ...blank[role], name: data[role].name } };
    const teams = new Set(changed.flatMap(({ role, opposition }) => {
        const team = knownPlayerTeam(data[role].name, [data.teamId, data.opponentId]);
        return team && [data.teamId, data.opponentId].includes(team) ? [opposition ? (team === data.teamId ? data.opponentId : data.teamId) : team] : [];
    }));
    const teamId = teams.size === 1 ? [...teams][0] : data.teamId;
    if (teamId === data.teamId || edited.lockedLayers.includes('visual')) return { ...edited, cricket: next };
    next = { ...next, teamId, opponentId: data.teamId, teamLogoUri: data.opponentLogoUri, opponentLogoUri: data.teamLogoUri,
        runs: null, wickets: null, overs: '', opponentRuns: null, opponentWickets: null, opponentOvers: '', target: null, scoreInnings: null,
        partnershipRuns: null, partnershipBalls: null, powerplayOvers: '', sourceUrl: '', updatedAt: '', dismissal: '',
    };
    for (const { role, opposition } of postPlayerRoles(next)) {
        const expected = opposition ? next.opponentId : next.teamId;
        const keepName = changed.some(item => item.role === role) || knownPlayerTeam(next[role].name) === expected;
        next = { ...next, [role]: { ...blank[role], name: keepName ? next[role].name : '' } };
    }
    return { ...edited, sourceUrls: [], imageUri: edited.playerPhotoId ? null : edited.imageUri,
        imageCredit: edited.playerPhotoId ? '' : edited.imageCredit, playerPhotoId: undefined,
        accent: edited.accent === nplTeam(data.teamId).primary ? nplTeam(teamId).primary : edited.accent,
        backgroundColor: edited.backgroundColor === nplTeam(data.teamId).dark ? nplTeam(teamId).dark : edited.backgroundColor,
        cricket: next,
    };
}

/** Template changes keep fixture identity and presentation, never a previous event’s facts. */
export function resetCricketTemplate(design: PostDesign, template: CricketTemplateId, force = false): PostDesign {
    const before = design.cricket;
    if (!before || (!force && before.template === template)) return design;
    const contextKeys = ['teamId', 'opponentId', 'competition', 'matchLabel', 'venue', 'matchDate', 'startTime', 'oversLimit', 'language', 'theme', 'teamLogoUri', 'opponentLogoUri', 'matchdayBackground', 'logoScale'] as const;
    const context = Object.fromEntries(contextKeys.map(key => [key, before[key]]));
    return { ...design, sourceUrls: [], imageUri: design.playerPhotoId ? null : design.imageUri, imageCredit: design.playerPhotoId ? '' : design.imageCredit, playerPhotoId: undefined,
        cricket: { ...blankCricketData(template), ...context },
    };
}

export function setCricketPostTeam(design: PostDesign, teamId: NplTeamId): PostDesign {
    const data = design.cricket;
    if (!data || teamId === data.teamId || teamId !== data.opponentId || design.lockedLayers.includes('visual')) return design;
    const team = nplTeam(teamId);
    return resetCricketTemplate({ ...design,
        accent: design.accent === nplTeam(data.teamId).primary ? team.primary : design.accent,
        backgroundColor: design.backgroundColor === nplTeam(data.teamId).dark ? team.dark : design.backgroundColor,
        cricket: { ...data, teamId, opponentId: data.teamId, teamLogoUri: data.opponentLogoUri, opponentLogoUri: data.teamLogoUri },
    }, data.template, true);
}

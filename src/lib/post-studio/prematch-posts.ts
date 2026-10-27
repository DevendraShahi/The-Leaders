import { cricketTemplate, type CricketLanguage, type NplTeamId } from './cricket-catalog';
import type { PostDesign } from './types';
import { rebindHeadToHead } from './head-to-head';
import { rebindScore } from './score-update';
import { rebindMoment } from './moment-posts';
import { rebindPhase } from './phase-posts';

export const prematchIds = ['toss', 'playing-xi', 'team'] as const;
export type PrematchId = typeof prematchIds[number];
export const prematchCopy = { headline: 48, summary: 100 } as const;
export const prematchHeadline = (id: PrematchId, language: CricketLanguage) => language === 'ne' ? cricketTemplate(id).headlineNe : cricketTemplate(id).headline;
const playerIdentity = (name: string) => name.normalize('NFKC').replace(/\((?:c|wk|c\s*[/,]\s*wk)\)/gi, '').replace(/\s+/g, ' ').trim().toLocaleLowerCase();
export function lineupProblems(lineup: string[]): string[] {
    const issues: string[] = [];
    if (lineup.length !== 11) issues.push('A confirmed Playing XI must contain exactly eleven players.');
    const names = lineup.map(playerIdentity);
    if (names.some(name => !name)) issues.push('Each Playing XI row needs a player name.');
    if (new Set(names).size !== names.length) issues.push('Each player can appear only once in the Playing XI.');
    if (lineup.filter(name => /\((?:c|c\s*[/,]\s*wk)\)/i.test(name)).length > 1) issues.push('Mark only one captain in the Playing XI.');
    return issues;
}
export function prematchIssues(design: PostDesign): string[] {
    const data = design.cricket;
    if (design.template !== 'cricket' || !data || !prematchIds.includes(data.template as PrematchId)) return [];
    const issues: string[] = [];
    if (!design.headline.trim()) issues.push('The headline is required.');
    if (design.headline.length > prematchCopy.headline) issues.push('Keep the headline within 48 characters.');
    if (design.summary.length > prematchCopy.summary) issues.push('Keep the supporting line within 100 characters.');
    if (design.hiddenLayers.includes('headline')) issues.push('Show the headline before exporting.');
    if (data.teamId === data.opponentId) issues.push('Choose two different teams.');
    if (['toss', 'playing-xi'].includes(data.template) && !data.matchDate) issues.push('Add the selected match date for this confirmed update.');
    if (data.template === 'toss') {
        if (!data.toss?.winnerId || ![data.teamId, data.opponentId].includes(data.toss.winnerId)) issues.push('Choose the confirmed toss winner from these two teams.');
        if (!data.toss?.decision) issues.push('Confirm whether the toss winner chose to bat or bowl.');
    }
    if (data.template === 'playing-xi') issues.push(...lineupProblems(data.lineup));
    if (data.template === 'team' && !Object.values(data.teamProfile ?? {}).some(value => value.trim())) issues.push('Add at least one confirmed team detail: captain, head coach or home city.');
    if (![data.sourceUrl, ...(design.sourceUrls ?? [])].some(url => /^https?:\/\/[^\s]+$/.test(url))) issues.push('Add a source URL for the confirmed information.');
    return issues;
}
/** Prevent a prior match's toss/XI, or another franchise's profile, following a team change. */
export function rebindPrematch(design: PostDesign, teamId: NplTeamId, opponentId: NplTeamId): PostDesign {
    const data = design.cricket;
    if (design.template !== 'cricket' || !data || (data.teamId === teamId && data.opponentId === opponentId)) return design;
    const samePair = data.teamId === opponentId && data.opponentId === teamId;
    const changedTeam = data.teamId !== teamId;
    const clearToss = !samePair && (data.template === 'toss' || data.toss);
    const clearLineup = (changedTeam || !samePair) && (data.template === 'playing-xi' || data.lineup.length > 0);
    const clearProfile = changedTeam && (data.template === 'team' || data.teamProfile);
    const clearEvidence = (data.template === 'toss' && clearToss) || (data.template === 'playing-xi' && clearLineup) || (data.template === 'team' && clearProfile);
    return { ...design, ...(clearEvidence ? { sourceUrls: [], fixtureId: undefined } : {}), cricket: { ...data, teamId, opponentId,
        ...(clearToss ? { toss: { winnerId: null, decision: null } } : {}), ...(clearLineup ? { lineup: [] } : {}),
        ...(clearProfile ? { teamProfile: { captain: '', headCoach: '', homeCity: '' } } : {}), ...(clearEvidence ? { sourceUrl: '' } : {}),
    } };
}
export function redatePrematch(design: PostDesign, matchDate: string): PostDesign {
    const data = design.cricket;
    if (data && ['powerplay', 'partnership'].includes(data.template)) return rebindPhase(design, data.teamId, data.opponentId, matchDate);
    if (data && ['four', 'six', 'wicket'].includes(data.template)) return rebindMoment(design, data.teamId, data.opponentId, matchDate);
    if (data?.template === 'score') return rebindScore(design, data.teamId, data.opponentId, matchDate);
    if (!data || data.matchDate === matchDate || !['toss', 'playing-xi'].includes(data.template)) return design;
    return { ...design, fixtureId: undefined, sourceUrls: [], cricket: { ...data, sourceUrl: '', matchDate,
        ...(data.template === 'toss' ? { toss: { winnerId: null, decision: null } } : { lineup: [] }),
    } };
}
export function rebindCricketEvidence(design: PostDesign, teamId: NplTeamId, opponentId: NplTeamId): PostDesign {
    if (!design.cricket) return design;
    const phased = rebindPhase(design, teamId, opponentId);
    const moment = rebindMoment({ ...phased, cricket: { ...phased.cricket!, teamId: design.cricket.teamId, opponentId: design.cricket.opponentId } }, teamId, opponentId);
    const scored = rebindScore({ ...moment, cricket: { ...moment.cricket!, teamId: design.cricket.teamId, opponentId: design.cricket.opponentId } }, teamId, opponentId);
    const historical = rebindHeadToHead({ ...scored, cricket: { ...scored.cricket!, teamId: design.cricket.teamId, opponentId: design.cricket.opponentId } }, teamId, opponentId);
    // Each safeguard compares against the original pair, while retaining earlier resets.
    return rebindPrematch({ ...historical, cricket: { ...historical.cricket!, teamId: design.cricket.teamId, opponentId: design.cricket.opponentId } }, teamId, opponentId);
}

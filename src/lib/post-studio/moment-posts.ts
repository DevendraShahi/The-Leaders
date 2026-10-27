import { blankCricketData } from './cricket-data';
import { cricketTemplate, type CricketLanguage, type NplTeamId } from './cricket-catalog';
import type { PostDesign } from './types';

export const momentIds = ['four', 'six', 'wicket'] as const;
export type MomentId = typeof momentIds[number];
export const momentCopy = { headline: 48, summary: 100 } as const;
export const momentHeadline = (id: MomentId, language: CricketLanguage) => language === 'ne' ? cricketTemplate(id).headlineNe : cricketTemplate(id).headline;
export const bowlerCreditedTypes = ['bowled', 'caught', 'lbw', 'stumped', 'hit-wicket'];
export function momentIssues(design: PostDesign): string[] {
    const data = design.cricket;
    if (design.template !== 'cricket' || !data || !momentIds.includes(data.template as MomentId)) return [];
    const issues: string[] = [];
    if (!design.headline.trim() || design.hiddenLayers.includes('headline')) issues.push('Show the event headline before exporting.');
    if (design.headline.length > momentCopy.headline) issues.push('Keep the headline within 48 characters.');
    if (design.summary.length > momentCopy.summary) issues.push('Keep supporting copy within 100 characters.');
    if (!data.matchDate) issues.push('Confirm the match date for this event.');
    if (data.runs === null || data.wickets === null || !data.overs) issues.push('Confirm runs, wickets and overs immediately after this event.');
    if (!data.batter.name.trim()) issues.push('Confirm the batter for this event.');
    if ((data.template === 'four' || data.template === 'six') && data.runs !== null && data.runs < (data.template === 'four' ? 4 : 6)) issues.push('The post-event team total cannot be below this boundary value.');
    if (data.template === 'wicket') {
        if (!data.wicketType) issues.push('Confirm the dismissal type.');
        if (!data.dismissal.trim()) issues.push('Add the confirmed dismissal details.');
        if (data.wickets === 0) issues.push('A wicket event must show at least one wicket lost.');
        if (data.batter.notOut) issues.push('The dismissed batter cannot be marked not out.');
        if (data.wicketType && bowlerCreditedTypes.includes(data.wicketType) && !data.bowler.name.trim()) issues.push('Name the credited bowler for this dismissal.');
    }
    if (![data.sourceUrl, ...(design.sourceUrls ?? [])].some(url => /^https?:\/\/[^\s]+$/.test(url))) issues.push('Add the source for this specific match event.');
    return issues;
}
export function rebindMoment(design: PostDesign, teamId: NplTeamId, opponentId: NplTeamId, matchDate = design.cricket?.matchDate ?? ''): PostDesign {
    const data = design.cricket;
    if (design.template !== 'cricket' || !data || !momentIds.includes(data.template as MomentId) || (data.teamId === teamId && data.opponentId === opponentId && data.matchDate === matchDate)) return design;
    const empty = blankCricketData(data.template);
    return { ...design, sourceUrls: [], fixtureId: undefined, imageUri: null, imageCredit: '', playerPhotoId: undefined, cricket: { ...data, teamId, opponentId, matchDate, runs: null, wickets: null, overs: '', batter: empty.batter, bowler: empty.bowler, dismissal: '', wicketType: null, sourceUrl: '', updatedAt: '' } };
}

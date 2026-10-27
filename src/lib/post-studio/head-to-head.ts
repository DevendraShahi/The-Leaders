import type { PostDesign } from './types';
import type { NplTeamId } from './cricket-catalog';

export const headToHeadCopy = { headline: 48, summary: 100 } as const;
export const headToHeadHeadline = (language: 'en' | 'ne') => language === 'ne' ? 'आमनेसामने' : 'HEAD TO HEAD';
/** Historical counts belong to a pair: swapping swaps sides, replacing a side clears evidence. */
export function rebindHeadToHead(design: PostDesign, teamId: NplTeamId, opponentId: NplTeamId): PostDesign {
    const before = design.cricket;
    if (design.template !== 'cricket' || !before || (before.template !== 'head-to-head' && !before.headToHead) || (before.teamId === teamId && before.opponentId === opponentId)) return design;
    const reversed = before.teamId === opponentId && before.opponentId === teamId;
    return { ...design, ...(reversed ? {} : { sourceUrls: [], fixtureId: undefined }), cricket: { ...before, teamId, opponentId,
        headToHead: reversed ? before.headToHead ? { ...before.headToHead, teamWins: before.headToHead.opponentWins, opponentWins: before.headToHead.teamWins } : undefined : { played: null, teamWins: null, opponentWins: null, ties: null, noResults: null, asOf: '' },
        sourceUrl: reversed ? before.sourceUrl : '',
    } };
}
export function headToHeadIssues(design: PostDesign): string[] {
    if (design.template !== 'cricket' || design.cricket?.template !== 'head-to-head') return [];
    const data = design.cricket, record = data.headToHead, issues: string[] = [];
    if (!design.headline.trim()) issues.push('Head to Head headline is required.');
    if (design.headline.length > headToHeadCopy.headline) issues.push('Keep the Head to Head headline within 48 characters.');
    if (!design.hiddenLayers.includes('supporting') && design.summary.length > headToHeadCopy.summary) issues.push('Keep the supporting line within 100 characters.');
    if (design.hiddenLayers.includes('headline')) issues.push('Show the Head to Head headline before exporting.');
    if (data.teamId === data.opponentId) issues.push('Choose two different teams.');
    if (!record) return [...issues, 'Enter the paired Head to Head record. Legacy statistic rows are retained but cannot establish each team’s wins.'];
    const counts = [record.played, record.teamWins, record.opponentWins, record.ties, record.noResults];
    if (counts.some(value => value === null)) issues.push('Confirm matches played, both win counts, ties and no results. Unknown is different from zero.');
    else if (record.played !== record.teamWins! + record.opponentWins! + record.ties! + record.noResults!) issues.push('Both win counts, ties and no results must add up to matches played.');
    if (!record.asOf) issues.push('Add the record cutoff date.');
    if (record.asOf && data.matchDate && record.asOf >= data.matchDate) issues.push('The record cutoff must be before the selected fixture date.');
    return issues;
}

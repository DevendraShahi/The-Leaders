import { cricketTeamIssues } from './cricket-team-context';
import { blankCricketData, oversToBalls, type CricketData } from './cricket-data';
import type { CricketLanguage, NplTeamId } from './cricket-catalog';
import type { PostDesign } from './types';

export const phaseIds = ['powerplay', 'partnership'] as const;
export type PhaseId = typeof phaseIds[number];
export const phaseCopy = { headline: 48, summary: 100 } as const;
export const phaseHeadline = (id: PhaseId, language: CricketLanguage) => id === 'powerplay' ? language === 'ne' ? 'पावरप्ले समाप्त' : 'POWERPLAY COMPLETE' : language === 'ne' ? 'साझेदारी' : 'THE PARTNERSHIP';
export function phaseContradictions(data: CricketData): string[] {
 const issues: string[] = [];
 if (data.template === 'powerplay' && data.powerplayOvers) {
  const end = oversToBalls(data.powerplayOvers);
  if (end === 0 || (end !== null && end > data.oversLimit * 6)) issues.push('Powerplay duration must be positive and within the innings limit.');
  if (data.overs && oversToBalls(data.overs) !== end) issues.push('Use the team score at the confirmed powerplay endpoint.');
 }
 if (data.template === 'partnership') {
  const a = data.batter.name.trim().normalize('NFKC').toLowerCase(), b = data.secondBatter.name.trim().normalize('NFKC').toLowerCase();
  if (a && a === b) issues.push('Choose two different batters for the partnership.');
  if (data.partnershipRuns !== null && data.runs !== null && data.partnershipRuns > data.runs) issues.push('Partnership runs cannot exceed the team score.');
  for (const batter of [data.batter,data.secondBatter]) {
   if ((batter.runs!==null)!==(batter.balls!==null)) issues.push('Supply both runs and balls for an optional individual innings, or leave both empty.');
   if (batter.runs!==null&&batter.fours!==null&&batter.sixes!==null&&batter.fours*4+batter.sixes*6>batter.runs) issues.push('An individual innings cannot have more boundary runs than total runs.');
  }
 }
 return issues;
}
export function phaseIssues(design: PostDesign): string[] {
 const data = design.cricket;
 if (design.template !== 'cricket' || !data || !phaseIds.includes(data.template as PhaseId)) return [];
 const issues = [...phaseContradictions(data), ...cricketTeamIssues(data)];
 if (!design.headline.trim() || design.hiddenLayers.includes('headline')) issues.push('Show the phase headline before exporting.');
 if (design.headline.length > phaseCopy.headline || (!design.hiddenLayers.includes('supporting') && design.summary.length > phaseCopy.summary)) issues.push('Keep the headline within 48 characters and supporting copy within 100.');
 if (data.runs === null || data.wickets === null || !data.overs) issues.push('Confirm the batting team score and overs for this snapshot.');
 if (data.template === 'powerplay' && !data.powerplayOvers) issues.push('Confirm the actual powerplay duration from the match.');
 if (data.template === 'partnership') {
  if (!data.batter.name.trim() || !data.secondBatter.name.trim()) issues.push('Name both partnership batters.');
  if (data.partnershipRuns === null || data.partnershipBalls === null) issues.push('Confirm partnership runs and balls.');
 }
 return issues;
}
export function rebindPhase(design: PostDesign, teamId: NplTeamId, opponentId: NplTeamId, matchDate = design.cricket?.matchDate ?? ''): PostDesign {
 const data = design.cricket;
 if (!data || !phaseIds.includes(data.template as PhaseId) || (data.teamId === teamId && data.opponentId === opponentId && data.matchDate === matchDate)) return design;
 const empty = blankCricketData(data.template);
 return { ...design, imageUri: null, imageCredit: '', playerPhotoId: undefined, fixtureId: undefined, sourceUrls: [], cricket: { ...data, teamId, opponentId, matchDate, runs: null, wickets: null, overs: '', powerplayOvers: '', partnershipRuns: null, partnershipBalls: null, batter: empty.batter, secondBatter: empty.secondBatter, sourceUrl: '', updatedAt: '' } };
}
/** One duration control owns both the phase endpoint and its score snapshot. */
export function setPowerplayDuration(design: PostDesign, value: string): PostDesign {
 const data = design.cricket;
 if (!data || data.template !== 'powerplay' || (value !== '' && oversToBalls(value) === null)) return design;
 const changed = Boolean(data.powerplayOvers && data.powerplayOvers !== value);
 return { ...design, ...(changed ? { sourceUrls: [] } : {}), cricket: { ...data, powerplayOvers: value, overs: value, ...(changed ? { runs: null, wickets: null, sourceUrl: '', updatedAt: '' } : {}) } };
}

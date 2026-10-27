// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/post-studio/storage', () => ({ default: { getItem: async () => null, setItem: async () => {} } }));
import { createCricketDraftDesign } from '@/lib/post-studio/cricket-design';
import { momentIssues } from '@/lib/post-studio/moment-posts';
import { applyPlayerPortrait, playerPhotoSubject, portraitIsCurrent, selectPlayerPortrait } from '@/lib/post-studio/player-portraits';
import { findPlayers } from '@/lib/post-studio/cricket-players';
import { rebindCricketEvidence, redatePrematch } from '@/lib/post-studio/prematch-posts';
import { creationGaps, updateCreationValue } from '@/lib/post-studio/creation-workflow';
import { shareStyles } from '@/lib/post-studio/shared-styles';
import { postDesignSchema } from '@/lib/post-studio/drafts';
import { generateCreationPrompt } from '@/lib/post-studio/prompt-engine';

const design = (template: 'four' | 'six' | 'wicket' = 'four') => {
 const d = createCricketDraftDesign(template, 'lumbini', 'sudurpaschim');
 Object.assign(d.cricket!, { matchDate: '2026-10-26', runs: 128, wickets: 3, overs: '14.2', sourceUrl: 'https://example.com/scorecard', wicketType: template === 'wicket' ? 'caught' : null, dismissal: template === 'wicket' ? 'Caught at cover' : '' });
 d.cricket!.batter.name = 'Rohit Paudel'; d.cricket!.bowler.name = template === 'wicket' ? 'Dipendra Singh Airee' : '';
 return d;
};
describe('Match moments and player portraits', () => {
 it.each(['four','six','wicket'] as const)('allows a confirmed %s with or without a portrait', template => {
  const d = design(template); expect(momentIssues(d)).toEqual([]);
  const photo = applyPlayerPortrait(d); expect(photo.imageUri).toBeTruthy(); expect(photo.imageCredit).toContain('Photo:'); expect(portraitIsCurrent(photo)).toBe(true);
  expect(postDesignSchema.parse(photo).playerPhotoId).toBe(photo.playerPhotoId);
  photo.cricket!.showPlayerPhoto = false; expect(momentIssues(photo)).toEqual([]);
 });
 it('only automatically matches an exact name and correct team', () => {
  const d = design(); d.cricket!.batter.name = 'Rohit'; expect(applyPlayerPortrait(d).imageUri).toBeNull();
  d.cricket!.batter.name = 'Dipendra Singh Airee'; expect(applyPlayerPortrait(d).imageUri).toBeNull();
  d.cricket!.batter.name = '  ROHIT   PAUDEL  '; expect(applyPlayerPortrait(d).playerPhotoId).toBe('rohit-paudel');
 });
 it('clears a tracked portrait when the named player changes and preserves custom uploads', () => {
  const d = applyPlayerPortrait(design()); d.cricket!.batter.name = 'Unknown batter'; expect(portraitIsCurrent(d)).toBe(false);
  expect(applyPlayerPortrait(d)).toMatchObject({ imageUri: null, imageCredit: '', playerPhotoId: undefined });
  d.playerPhotoId = undefined; d.imageUri = 'data:image/png;base64,custom'; expect(applyPlayerPortrait(d).imageUri).toContain('custom');
 });
 it('uses an opposition bowler portrait for credited wickets, and the dismissed batter for run-outs', () => {
  const d = applyPlayerPortrait(design('wicket')); expect(playerPhotoSubject(d)).toMatchObject({ role: 'bowler', teamId: 'sudurpaschim' });
  expect(d.playerPhotoId).toBe('dipendra-singh-airee');
  const runout = updateCreationValue({ title: 'Event', warnings: [], designs: [d] }, 0, 'cricket.wicketType', 'run-out').designs[0]; expect(runout.cricket!.bowler.name).toBe(''); expect(runout.playerPhotoId).toBe('rohit-paudel');
  expect(creationGaps([runout]).some(g => g.path === 'cricket.bowler.name')).toBe(false);
 });
 it('a portrait picker sets the named subject but never fills event scores', () => {
  const d = createCricketDraftDesign('four', 'lumbini', 'sudurpaschim'); const player = findPlayers('lumbini')[0];
  const next = selectPlayerPortrait(d, player); expect(next.cricket!.batter.name).toBe(player.name); expect(next.cricket!.runs).toBeNull();
  expect(selectPlayerPortrait(d, findPlayers('sudurpaschim')[0])).toBe(d);
 });
 it('does not copy a tracked portrait onto a differently named player when sharing backgrounds', () => {
  const source = applyPlayerPortrait(design()), target = design('six'); target.cricket!.batter.name = 'Unknown player';
  const next = shareStyles(target, source, ['background']); expect(next.imageUri).toBeNull(); expect(next.playerPhotoId).toBeUndefined();
 });
 it('allows filling an unknown date while invalidating a previously dated event in review', () => {
  const d = applyPlayerPortrait(design());
  expect(updateCreationValue({ title:'Event',warnings:[],designs:[d] },0,'cricket.matchDate','2026-10-27').designs[0].cricket!.runs).toBeNull();
  d.cricket!.matchDate = '';
  expect(updateCreationValue({ title:'Event',warnings:[],designs:[d] },0,'cricket.matchDate','2026-10-26').designs[0].cricket!.runs).toBe(128);
 });
 it('clears event facts and portraits when the fixture changes, including shared styles', () => {
  const d = applyPlayerPortrait(design());
  for (const next of [rebindCricketEvidence(d, 'chitwan', 'sudurpaschim'), redatePrematch(d, '2026-10-27'), shareStyles(d, { ...d, cricket: { ...d.cricket!, matchDate: '2026-10-27' } }, ['cricket'])]) {
   expect(next.cricket!.runs).toBeNull(); expect(next.cricket!.batter.name).toBe(''); expect(next.imageUri).toBeNull(); expect(next.sourceUrls).toEqual([]);
  }
 });
 it('blocks incomplete or contradictory wickets and keeps unrelated performance fields out of review', () => {
  const d = design('wicket'); d.cricket!.batter.notOut = true; expect(momentIssues(d).join(' ')).toContain('not out');
  d.cricket!.wickets = 0; expect(momentIssues(d).join(' ')).toContain('at least one');
  const paths = creationGaps([createCricketDraftDesign('wicket')]).map(g => g.path);
  expect(paths).toContain('cricket.wicketType'); expect(paths).toContain('cricket.matchDate'); expect(paths).not.toContain('cricket.batter.balls'); expect(paths).not.toContain('cricket.bowler.wickets');
  const six = design('six'); six.cricket!.runs = 3; expect(momentIssues(six).join(' ')).toContain('boundary value');
 });
 it('instructs structured event facts and local portrait resolution', () => {
  const prompt = generateCreationPrompt({ kind:'cricket',templates:['four','six','wicket'],language:'en',format:'portrait',brief:'' });
  expect(prompt).toContain('MATCH MOMENT'); expect(prompt).toContain('run-out'); expect(prompt).toContain('photo');
 });
});

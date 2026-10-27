// @vitest-environment node
import { describe,expect,it,vi } from 'vitest';
vi.mock('@/lib/post-studio/storage',()=>({default:{getItem:async()=>null,setItem:async()=>{}}}));
import { createCricketDraftDesign } from '@/lib/post-studio/cricket-design';
import { phaseContradictions,phaseIssues,phaseHeadline,setPowerplayDuration } from '@/lib/post-studio/phase-posts';
import { digestCreationResponse,generateCreationPrompt,cricketPromptFields,type PromptOptions } from '@/lib/post-studio/prompt-engine';
import { creationGaps,updateCreationValue } from '@/lib/post-studio/creation-workflow';
import { applyPlayerPortrait,matchingPortraitFor } from '@/lib/post-studio/player-portraits';
import { redatePrematch,rebindCricketEvidence } from '@/lib/post-studio/prematch-posts';
import { shareStyles } from '@/lib/post-studio/shared-styles';
import { generateCricketCaption } from '@/lib/post-studio/cricket-caption';
import type { PostDraft } from '@/lib/post-studio/drafts';

function design(template:'powerplay'|'partnership'='partnership'){
 const d=createCricketDraftDesign(template,'lumbini','sudurpaschim');
 Object.assign(d.cricket!,{matchDate:'2026-10-26',runs:128,wickets:3,overs:template==='powerplay'?'6':'14.2',powerplayOvers:template==='powerplay'?'6':'',partnershipRuns:76,partnershipBalls:48,sourceUrl:'https://example.com/scorecard'});
 d.cricket!.batter.name='Rohit Paudel';d.cricket!.secondBatter.name='Aakash Tripathi';return applyPlayerPortrait(d);
}
describe('Powerplay and Partnership',()=>{
 it.each(['powerplay','partnership'] as const)('starts %s with unknown facts and a canonical title',id=>{
  const d=createCricketDraftDesign(id);expect(d.headline).toBe(phaseHeadline(id,'en'));expect(d.cricket!.runs).toBeNull();expect(phaseIssues(d).length).toBeGreaterThan(0);
  expect(creationGaps([d]).map(g=>g.path)).toContain('cricket.matchDate');
 });
 it('accepts a sourced powerplay endpoint and reduced duration, never assuming six overs',()=>{
  const d=design('powerplay');expect(phaseIssues(d)).toEqual([]);d.cricket!.overs='3.2';d.cricket!.powerplayOvers='3.2';expect(phaseIssues(d)).toEqual([]);
  d.cricket!.overs='6';expect(phaseContradictions(d.cricket!).join(' ')).toContain('endpoint');
  d.cricket!.powerplayOvers='0';expect(phaseContradictions(d.cricket!).join(' ')).toContain('positive');
 });
 it('uses a minimal powerplay response without target or player scorecards',()=>{
  expect(cricketPromptFields('powerplay')).toEqual(['runs','wickets','overs','powerplayOvers']);
  const paths=creationGaps([createCricketDraftDesign('powerplay')]).map(g=>g.path);expect(paths).toContain('cricket.powerplayOvers');expect(paths).not.toContain('cricket.batter.name');expect(paths).not.toContain('cricket.target');
 });
 it('uses one powerplay duration field and clears figures from a different endpoint',()=>{
  const d=design('powerplay');const next=setPowerplayDuration(d,'3.2');expect(next.cricket).toMatchObject({powerplayOvers:'3.2',overs:'3.2',runs:null,wickets:null,sourceUrl:''});
  expect(creationGaps([createCricketDraftDesign('powerplay')]).map(g=>g.path)).not.toContain('cricket.overs');
  const draft=createCricketDraftDesign('powerplay');draft.cricket!.runs=48;expect(setPowerplayDuration(draft,'6').cricket!.runs).toBe(48);
 });
 it('accepts two named batters without individual innings figures and resolves both exact portraits',()=>{
  const d=design();expect(phaseIssues(d)).toEqual([]);expect(d.cricket!.batter.runs).toBeNull();expect(d.playerPhotoId).toBe('rohit-paudel');expect(matchingPortraitFor(d.cricket!.secondBatter.name,'lumbini')?.id).toBe('aakash-tripathi');
  expect(matchingPortraitFor('Aakash','lumbini')).toBeUndefined();expect(matchingPortraitFor('Aakash Tripathi','sudurpaschim')).toBeUndefined();
  const paths=creationGaps([d]).map(g=>g.path);expect(paths).not.toContain('cricket.batter.runs');expect(paths).not.toContain('cricket.secondBatter.balls');
 });
 it('rejects duplicate partners and an impossible stand total',()=>{
  const d=design();d.cricket!.secondBatter.name=' ROHIT PAUDEL ';expect(phaseContradictions(d.cricket!).join(' ')).toContain('different batters');d.cricket!.partnershipRuns=129;expect(phaseContradictions(d.cricket!).join(' ')).toContain('team score');
 });
 it('clears phase evidence and both players when changing date, team or shared context',()=>{
  const d=design();const results=[redatePrematch(d,'2026-10-27'),rebindCricketEvidence(d,'chitwan','sudurpaschim'),shareStyles(d,{...d,cricket:{...d.cricket!,matchDate:'2026-10-27'}},['cricket']),updateCreationValue({title:'Stand',designs:[d],warnings:[]},0,'cricket.matchDate','2026-10-27').designs[0]];
  for(const next of results){expect(next.cricket!.partnershipRuns).toBeNull();expect(next.cricket!.secondBatter.name).toBe('');expect(next.imageUri).toBeNull();expect(next.cricket!.sourceUrl).toBe('');}
 });
 it('retains both separate photo credits in captions and omits them when portraits are disabled',()=>{
  const d=design();const slide={design:d} as PostDraft;const caption=generateCricketCaption([slide]);expect(caption).toContain('Photo: Rohit Paudel');expect(caption).toContain('Photo: Aakash Tripathi');expect(caption).toContain('76 runs · 48 balls');d.cricket!.showPlayerPhoto=false;expect(generateCricketCaption([slide])).not.toContain('Photo:');
 });
 it('binds strict prompt titles and rejects contradictory imported powerplay facts',()=>{
  const options:PromptOptions={kind:'cricket',templates:['powerplay'],language:'en',format:'portrait',brief:'',teams:{teamId:'lumbini',opponentId:'sudurpaschim'}};
  const prompt=generateCreationPrompt(options);expect(prompt).toContain('PHASE CONTRACTS');expect(prompt).toContain('Do not assume six overs');
  const payload={sources:['https://example.com/scorecard'],match:{teamId:'lumbini',opponentId:'sudurpaschim',oversLimit:20,matchDate:'2026-10-26'},posts:[{template:'powerplay',headline:'POWERPLAY COMPLETE',summary:'',data:{runs:48,wickets:1,overs:'6',powerplayOvers:'6'}}]};
  expect(phaseIssues(digestCreationResponse(JSON.stringify(payload),options).designs[0])).toEqual([]);
  payload.posts[0].data.overs='';expect(digestCreationResponse(JSON.stringify(payload),options).designs[0].cricket!.overs).toBe('6');payload.posts[0].data.overs='6';
  payload.posts[0].data.powerplayOvers='5';expect(()=>digestCreationResponse(JSON.stringify(payload),options)).toThrow('endpoint');
 });
});

// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/post-studio/storage', () => ({ default: { getItem: async () => null, setItem: async () => {} } }));
import { createCricketDraftDesign } from '@/lib/post-studio/cricket-design';
import { prematchHeadline, prematchIssues, lineupProblems, rebindCricketEvidence, redatePrematch, type PrematchId } from '@/lib/post-studio/prematch-posts';
import { digestCreationResponse, generateCreationPrompt, type PromptOptions } from '@/lib/post-studio/prompt-engine';
import { shareStyles } from '@/lib/post-studio/shared-styles';
import { creationGaps } from '@/lib/post-studio/creation-workflow';
import { generateCricketCaption } from '@/lib/post-studio/cricket-caption';

const lineup = () => Array.from({ length: 11 }, (_, i) => `Illustrative player ${i + 1}${i === 0 ? ' (c)' : i === 1 ? ' (wk)' : ''}`);
const options = (id: PrematchId): PromptOptions => ({ kind: 'cricket', templates: [id], language: 'en', format: 'portrait', brief: '', teams: { teamId: 'lumbini', opponentId: 'sudurpaschim' } });
function payload(id: PrematchId) {
    return { version: 1, title: 'Illustrative prematch content', sources: ['https://example.com/official-update'], match: { teamId: 'lumbini', opponentId: 'sudurpaschim', competition: 'NPL 2026', matchLabel: 'MATCH 01', venue: 'Kirtipur', matchDate: '2026-10-26', startTime: '16:30', oversLimit: 20, sourceUrl: 'https://example.com/official-update', updatedAt: '' }, posts: [{ template: id, headline: prematchHeadline(id, 'en'), summary: '', data: id === 'toss' ? { toss: { winnerId: 'sudurpaschim', decision: 'bowl' } } : id === 'playing-xi' ? { lineup: lineup() } : { teamProfile: { captain: 'Illustrative captain', headCoach: '', homeCity: '' } } }] };
}
const imported = (id: PrematchId) => digestCreationResponse(JSON.stringify(payload(id)), options(id)).designs[0];
describe('Pre-match template contracts', () => {
    it.each(['toss', 'playing-xi', 'team'] as const)('imports %s into a complete managed draft', id => {
        const design = imported(id); expect(prematchIssues(design)).toEqual([]);
        expect(generateCreationPrompt(options(id))).toContain('PRE-MATCH TEMPLATE CONTRACTS');
        expect(generateCreationPrompt(options(id))).toContain('squad membership is not confirmation');
        expect(design.cricket?.runs).toBeNull();
    });
    it('keeps a toss unknown until both winner and decision are confirmed; accepts either side', () => {
        const blank = createCricketDraftDesign('toss'); expect(blank.cricket?.toss).toEqual({ winnerId: null, decision: null });
        expect(creationGaps([blank]).some(gap => gap.type === 'select' && gap.path.endsWith('winnerId'))).toBe(true);
        expect(prematchIssues(blank).join(' ')).toContain('confirmed toss winner');
        const toss = imported('toss'); expect(toss.cricket?.toss?.winnerId).toBe('sudurpaschim');
        const p = payload('toss'); Object.assign(p.posts[0].data, { toss: { winnerId: 'janakpur', decision: 'bat' } });
        expect(() => digestCreationResponse(JSON.stringify(p), options('toss'))).toThrow();
    });
    it('requires eleven distinct starters and at most one captain', () => {
        expect(lineupProblems(lineup())).toEqual([]); expect(lineupProblems(lineup().slice(0, 10)).join(' ')).toContain('exactly eleven');
        const duplicate = lineup(); duplicate[1] = 'Illustrative player 1 (wk)'; expect(lineupProblems(duplicate).join(' ')).toContain('only once');
        const captains = lineup(); captains[2] += ' (c)'; expect(lineupProblems(captains).join(' ')).toContain('one captain');
        const p = payload('playing-xi'); Object.assign(p.posts[0].data, { lineup: duplicate }); expect(() => digestCreationResponse(JSON.stringify(p), options('playing-xi'))).toThrow('only once');
    });
    it('leaves partial XIs reviewable but blocks publication and does not fill from the squad', () => {
        const p = payload('playing-xi'); Object.assign(p.posts[0].data, { lineup: lineup().slice(0, 8) });
        const design = digestCreationResponse(JSON.stringify(p), options('playing-xi')).designs[0];
        expect(design.cricket?.lineup).toHaveLength(8); expect(prematchIssues(design).join(' ')).toContain('exactly eleven');
        expect(creationGaps([design]).some(gap => gap.path === 'cricket.lineup')).toBe(true);
    });
    it('allows one confirmed profile fact, preserves unknown fields and rejects legacy announcement keys', () => {
        const team = imported('team'); expect(team.cricket?.teamProfile?.headCoach).toBe(''); expect(prematchIssues(team)).toEqual([]);
        const blank = createCricketDraftDesign('team'); expect(creationGaps([blank]).some(gap => gap.type === 'profile')).toBe(true);
        const p = payload('team'); Object.assign(p.posts[0].data, { statRows: [{ label: 'Captain', value: 'Someone' }] }); expect(() => digestCreationResponse(JSON.stringify(p), options('team'))).toThrow();
    });
    it('preserves the actual toss winner on reversal and clears match-specific facts for a new match', () => {
        const toss = imported('toss'); expect(rebindCricketEvidence(toss, 'sudurpaschim', 'lumbini').cricket?.toss?.winnerId).toBe('sudurpaschim');
        const changed = rebindCricketEvidence(toss, 'lumbini', 'janakpur'); expect(changed.cricket?.toss?.winnerId).toBeNull(); expect(changed.sourceUrls).toEqual([]);
        expect(redatePrematch(toss, '2026-10-28').cricket?.toss?.winnerId).toBeNull();
        const xi = imported('playing-xi'); expect(rebindCricketEvidence(xi, 'lumbini', 'janakpur').cricket?.lineup).toEqual([]);
        expect(redatePrematch(xi, '2026-10-28').cricket?.lineup).toEqual([]);
    });
    it('preserves a profile for the same franchise but clears it for a different featured team, including shared styles', () => {
        const team = imported('team'); expect(rebindCricketEvidence(team, 'lumbini', 'janakpur').cricket?.teamProfile?.captain).toBe('Illustrative captain');
        const source = createCricketDraftDesign('matchday', 'janakpur', 'chitwan'); expect(shareStyles(team, source, ['cricket']).cricket?.teamProfile?.captain).toBe('');
        expect(shareStyles(imported('playing-xi'), source, ['cricket']).cricket?.lineup).toEqual([]);
    });
    it.each(['toss', 'playing-xi', 'team'] as const)('keeps %s facts and sources in the caption', id => {
        const design = imported(id), caption = generateCricketCaption([{ id: 'test', name: 'Illustrative content', design, createdAt: '', updatedAt: '', trashedAt: null }]);
        expect(caption).toContain('https://example.com/official-update');
        expect(caption).toContain(id === 'toss' ? 'Sudurpaschim Royals' : id === 'playing-xi' ? '11. Illustrative player 11' : 'Captain: Illustrative captain');
    });
});

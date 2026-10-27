// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { creationGaps, suggestPostTemplates, updateCreationValue } from '@/lib/post-studio/creation-workflow';
import { createCricketDraftDesign } from '@/lib/post-studio/cricket-design';
import { cricketTemplateIds } from '@/lib/post-studio/cricket-catalog';

describe('Guided creation defaults and missing fields', () => {
    it('suggests clear, editable defaults without selecting future coverage', () => {
        expect(suggestPostTemplates('cricket', 'A match result post for Lumbini')).toEqual(['result']);
        expect(suggestPostTemplates('cricket', 'A half-century post')).toEqual(['fifty']);
        expect(suggestPostTemplates('cricket', 'Playing XI, then a toss post')).toEqual(['playing-xi', 'toss']);
        expect(suggestPostTemplates('news', 'Explain the new policy')).toEqual(['explainer']);
        expect(suggestPostTemplates('cricket', 'A post for our match')).toEqual(['matchday']);
    });
    it('asks for fixture facts once and never demands score data for a matchday', () => {
        const designs = [createCricketDraftDesign('matchday'), createCricketDraftDesign('matchday')];
        const gaps = creationGaps(designs);
        expect(gaps.filter(gap => gap.path === 'cricket.matchDate')).toHaveLength(1);
        expect(gaps.some(gap => gap.path === 'cricket.runs')).toBe(false);
        const edited = updateCreationValue({ title: 'Match', designs, warnings: [] }, null, 'cricket.matchDate', '2026-10-26');
        expect(edited.designs.every(design => design.cricket?.matchDate === '2026-10-26')).toBe(true);
        expect(designs[0].cricket?.matchDate).toBe('');
    });
    it('keeps moment scores independent when correcting a post', () => {
        const original = { title: 'Coverage', designs: [createCricketDraftDesign('score'), createCricketDraftDesign('result')], warnings: [] };
        const edited = updateCreationValue(original, 0, 'cricket.runs', 123);
        expect(edited.designs[0].cricket?.runs).toBe(123);
        expect(edited.designs[1].cricket?.runs).toBeNull();
    });
    it.each(cricketTemplateIds)('provides usable review fields for %s', id => {
        const gaps = creationGaps([createCricketDraftDesign(id)]);
        expect(gaps.every(gap => Boolean(gap.label) && Boolean(gap.path))).toBe(true);
        expect(gaps.filter(gap => gap.type === 'rows').every(gap => Boolean(gap.columns?.length))).toBe(true);
    });
    it('reviews bowler fields for a bowling player-of-match award', () => {
        const design = createCricketDraftDesign('player-of-match'); design.cricket!.awardPerformance = 'bowling';
        const paths = creationGaps([design]).map(gap => gap.path);
        expect(paths).toContain('cricket.bowler.name');
        expect(paths).not.toContain('cricket.batter.name');
    });
});

// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/post-studio/storage', () => ({ default: { getItem: async () => null, setItem: async () => {} } }));
import { createCricketDraftDesign } from '@/lib/post-studio/cricket-design';
import { fixtureSlot, fixturesPostIssues } from '@/lib/post-studio/fixtures-post';
import { applyCricketFixture, dayFixtureRows, fixturesForDate } from '@/lib/post-studio/cricket-fixtures';
import { digestCreationResponse, generateCreationPrompt, type PromptOptions } from '@/lib/post-studio/prompt-engine';
const fixture = fixturesForDate('2026-10-27')[1];
const options: PromptOptions = { kind: 'cricket', templates: ['fixtures'], language: 'en', format: 'portrait', brief: '', fixture, teams: { teamId: fixture.teamId, opponentId: fixture.opponentId } };
const response = () => ({ title: 'Daily schedule', posts: [{ headline: 'FIXTURES', data: { fixtures: dayFixtureRows(fixture.matchDate, fixture) } }] });
describe('Daily fixtures benchmark', () => {
    it('binds both games to the published day, teams, order, times and venues', () => {
        const design = digestCreationResponse(JSON.stringify(response()), options).designs[0];
        expect(design.cricket?.fixtures).toEqual(dayFixtureRows('2026-10-27'));
        expect(fixturesPostIssues(design)).toEqual([]); expect(design.cricket?.runs).toBeNull();
        expect(generateCreationPrompt(options)).toContain('FIXTURES CONTENT CONTRACT');
        expect(generateCreationPrompt(options)).toContain('Copy ALL games');
    });
    it('rejects dropped, swapped, retimed or substituted supplied fixtures', () => {
        for (const mutate of [
            (rows: ReturnType<typeof dayFixtureRows>) => rows.pop(),
            (rows: ReturnType<typeof dayFixtureRows>) => rows.reverse(),
            (rows: ReturnType<typeof dayFixtureRows>) => { rows[0].when = '2026-10-27 · 17:00 NPT'; },
            (rows: ReturnType<typeof dayFixtureRows>) => { rows[0].teamId = 'lumbini'; },
        ]) { const p = response(); mutate(p.posts[0].data.fixtures); expect(() => digestCreationResponse(JSON.stringify(p), options)).toThrow(); }
    });
    it('recognizes only valid calendar dates and 24-hour Nepal-time slots', () => {
        expect(fixtureSlot('2026-10-27 · 12:30 NPT')).toEqual({ date: '2026-10-27', time: '12:30' });
        for (const value of ['2026-02-30 · 12:30 NPT', '2026-10-27 · 24:00 NPT', '4pm', 'Time to confirm']) expect(fixtureSlot(value)).toBeNull();
    });
    it('blocks duplicates, mixed dates and longer schedules instead of silently hiding rows', () => {
        const design = applyCricketFixture(createCricketDraftDesign('fixtures'), fixturesForDate('2026-10-26')[0]);
        design.cricket!.fixtures = [...dayFixtureRows('2026-10-27'), dayFixtureRows('2026-10-27')[0]];
        const issues = fixturesPostIssues(design).join(' ');
        expect(issues).toContain('at most two'); expect(issues).toContain('same Nepal date'); expect(issues).toContain('already listed');
    });
    it('accepts empty lists only for a published rest day and isolates other templates', () => {
        const design = createCricketDraftDesign('fixtures'); design.cricket!.matchDate = '2026-10-30';
        expect(fixturesPostIssues(design)).toEqual([]);
        design.cricket!.matchDate = '2026-10-27'; expect(fixturesPostIssues(design).join(' ')).toContain('empty list does not establish');
        expect(fixturesPostIssues({ ...design, template: 'breaking' })).toEqual([]);
    });
});

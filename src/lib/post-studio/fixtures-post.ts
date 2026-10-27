import type { PostDesign } from './types';
import { cricketRestDays } from './cricket-fixtures';

export const fixturesCopy = { headline: 48, summary: 100 } as const;
export const fixturesHeadline = (language: 'en' | 'ne') => language === 'ne' ? 'खेल तालिका' : 'FIXTURES';
export function fixtureSlot(when: string) {
    const match = /^(\d{4}-\d{2}-\d{2})\s*·\s*([0-2]\d:[0-5]\d) NPT$/.exec(when);
    if (!match || Number(match[2].slice(0, 2)) > 23) return null;
    const date = new Date(`${match[1]}T12:00:00Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== match[1]) return null;
    return { date: match[1], time: match[2] };
}
export function fixturesPostIssues(design: PostDesign): string[] {
    if (design.template !== 'cricket' || design.cricket?.template !== 'fixtures') return [];
    const data = design.cricket, issues: string[] = [];
    if (!design.headline.trim()) issues.push('Fixtures headline is required.');
    if (!data.matchDate) issues.push('Choose the Nepal date for this fixtures post.');
    if (design.headline.length > fixturesCopy.headline) issues.push('Keep the Fixtures headline within 48 characters.');
    if (design.summary.length > fixturesCopy.summary) issues.push('Keep the supporting line within 100 characters.');
    if (design.hiddenLayers.includes('headline')) issues.push('Show the Fixtures headline before exporting.');
    if (data.fixtures.length > 2) issues.push('Use one Nepal date and at most two games per fixtures post. Split longer schedules into pages.');
    if (!data.fixtures.length && !cricketRestDays.includes(data.matchDate)) issues.push('Add the confirmed games for this date. An empty list does not establish a rest day.');
    if (data.fixtures.length && cricketRestDays.includes(data.matchDate)) issues.push('The published schedule marks this as a rest day. Check the date or confirmed schedule revision.');
    const seen = new Set<string>();
    data.fixtures.forEach((row, index) => {
        const slot = fixtureSlot(row.when), label = `Game ${index + 1}`;
        if (!slot) issues.push(`${label}: confirm its date and Nepal time (YYYY-MM-DD · HH:mm NPT).`);
        else if (slot.date !== data.matchDate) issues.push(`${label}: use the same Nepal date as the post.`);
        if (!row.venue.trim()) issues.push(`${label}: venue is required.`);
        if (row.teamId === row.opponentId) issues.push(`${label}: choose different teams.`);
        const key = [row.teamId, row.opponentId].sort().join(':');
        if (seen.has(key)) issues.push(`${label}: this pairing is already listed.`);
        seen.add(key);
    });
    return issues;
}

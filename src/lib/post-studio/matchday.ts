import type { PostDesign } from './types';

/** Copy limits shared by AI import, review and the managed artwork. */
export const matchdayCopy = { headline: 48, summary: 120 } as const;
export const matchdayBackgrounds = [
    { id: 'tu-1', label: 'TU Ground · sunset aerial', src: '/npl/TU-ground-1.png' },
    { id: 'tu-2', label: 'TU Ground · night crowd', src: '/npl/TU-ground-2.png' },
    { id: 'tu-3', label: 'TU Ground · sunset stands', src: '/npl/TU-ground-3.png' },
    { id: 'tu-4', label: 'TU Ground · daytime field', src: '/npl/TU-ground-4.png' },
    { id: 'tu-5', label: 'TU Ground · stadium panorama', src: '/npl/TU-ground-5.png' },
] as const;
export const matchdayHeadline = (language: 'en' | 'ne') => language === 'ne' ? 'आजको खेल' : 'MATCHDAY';
export function matchdayIssues(design: PostDesign): string[] {
    if (design.template !== 'cricket' || design.cricket?.template !== 'matchday') return [];
    const data = design.cricket, issues: string[] = [];
    for (const [label, value] of [['Headline', design.headline], ['Match date', data.matchDate], ['Start time', data.startTime], ['Venue', data.venue]]) {
        if (!value.trim()) issues.push(`${label} is required for Matchday.`);
    }
    if (data.startTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.startTime)) issues.push('Use a 24-hour start time such as 16:30 (Nepal time).');
    if (design.headline.length > matchdayCopy.headline) issues.push(`Matchday headline must be ${matchdayCopy.headline} characters or fewer.`);
    if (!design.hiddenLayers.includes('supporting') && design.summary.length > matchdayCopy.summary) issues.push(`Matchday supporting line must be ${matchdayCopy.summary} characters or fewer.`);
    if (design.hiddenLayers.includes('headline')) issues.push('Show the Matchday headline before exporting.');
    if (data.teamId === data.opponentId) issues.push('Choose two different teams.');
    return issues;
}

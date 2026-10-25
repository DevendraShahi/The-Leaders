import type { DailyEdition } from './daily';
import { defaultPostDesign } from './types';
const sections: Record<string, { en: string; ne: string }> = { headlines: { en: 'HEADLINES', ne: 'मुख्य समाचार' }, watch: { en: 'WATCH TODAY', ne: 'आज पछ्याउने' }, go: { en: 'GO TODAY', ne: 'आज जाने ठाउँ' }, enjoy: { en: 'ENJOY TODAY', ne: 'आज रमाइलो' }, recap: { en: 'DAY IN REVIEW', ne: 'आजको समीक्षा' }, tomorrow: { en: 'TOMORROW', ne: 'भोलि पछ्याउने' }, weather: { en: 'WEATHER', ne: 'मौसम' }, sports: { en: 'SPORTS', ne: 'खेलकुद' }, 'good-news': { en: 'GOOD NEWS', ne: 'सुखद समाचार' }, context: { en: 'IN CONTEXT', ne: 'पृष्ठभूमि' }, 'morning brief': { en: 'MORNING BRIEF', ne: 'बिहानको समाचार' }, 'day in review': { en: 'DAY IN REVIEW', ne: 'आजको समीक्षा' } };
export function editionDrafts(edition: DailyEdition) {
    return (['ne', 'en'] as const).flatMap(language => {
        const cover = { headline: edition.title[language], body: language === 'ne' ? `${edition.date} · मुख्य समाचार र उपयोगी जानकारी` : `${edition.date} · Headlines and useful context`, section: edition.edition === 'morning' ? 'morning brief' : 'day in review' };
        const slides = [cover, ...edition.slides.map(slide => ({ headline: slide.headline[language], body: slide.body[language], section: slide.section }))];
        return slides.map((slide, index) => ({
            id: `daily-${edition.id}-${language}-${index}`,
            name: `${edition.date} ${edition.edition} ${language.toUpperCase()} ${index + 1}/${slides.length}`,
            design: { ...defaultPostDesign, template: 'explainer' as const, format: 'portrait' as const,
                headline: slide.headline, summary: slide.body, author: 'The Leaders',
                category: sections[slide.section]?.[language] ?? slide.section.toUpperCase(), eyebrow: `${index + 1} / ${slides.length}`, imageUri: null,
                headlineScale: 0.92,
            },
        }));
    });
}
export function editionCaption(edition: DailyEdition) {
    return `${edition.caption.ne}\n\n${edition.caption.en}\n\nSources / स्रोत:\n${edition.sources.map(source => `${source.name}: ${source.url}`).join('\n')}`;
}

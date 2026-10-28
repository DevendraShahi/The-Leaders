import type { PostDraft } from './drafts';
import { historyNumber } from './history-data';
import { hasDevanagari } from './typography';
import { captionHashtag, composeCaption, uniqueCaptionParts } from './caption-utils';

export function generatePostCaption(slides: PostDraft[]): string {
    const blocks: string[] = [], tags = new Set(['#TheLeaders']);
    const bylines: string[] = [];
    for (const { design } of slides) {
        if (design.template === 'history') {
            const event = design.history;
            if (!event) continue;
            const ne = event.language === 'ne';
            // A cover already summarises its own continuation pages. A paragraph
            // shared alone still gets a caption using its actual prose.
            if (event.pageKind === 'paragraph' && slides.some(item => item.design.history?.pageKind === 'cover' && item.design.history?.language === event.language && item.design.history?.storyScope === event.storyScope && item.design.history?.subject === event.subject && item.design.history?.year === event.year)) continue;
            const scope = event.storyScope === 'national' ? ne ? 'नेपाल' : 'Nepal' : event.storyScope === 'international' ? ne ? 'विश्व' : 'World' : '';
            const label = [ne ? 'इतिहासमा आजको दिन' : 'Today in History', scope].filter(Boolean).join(' · ');
            const year = event.year.trim() ? historyNumber(event.year, event.language) : '';
            const date = [event.dateLabel, year && !event.dateLabel.includes(event.year) ? year : ''].filter(Boolean).join(' · ');
            const context = event.pageKind === 'paragraph' ? event.body : event.fact || design.summary;
            const copy = uniqueCaptionParts([design.headline, context]);
            if (copy.length) blocks.push([label, date, copy.join('\n\n')].filter(Boolean).join('\n\n'));
            tags.add('#TodayInHistory');
            if (event.storyScope === 'national') tags.add('#NepalHistory');
            if (event.storyScope === 'international') tags.add('#WorldHistory');
            continue;
        }
        const copy = uniqueCaptionParts([design.headline, design.summary]);
        if (!copy.length) continue;
        blocks.push(copy.join('\n\n'));
        if (design.author) bylines.push(design.author);
        if (design.template.startsWith('book-')) tags.add(design.template === 'book-analysis' ? '#BookAnalysis' : '#BookReview');
        else if (design.template === 'quote') tags.add('#Quotes');
        else if (design.template === 'explainer') tags.add('#Explainer');
        else if (design.template === 'breaking') tags.add(hasDevanagari(design.headline) ? '#समाचार' : '#News');
        if (design.category && !/^(?:book|books|quote|breaking|explainer|news|history|today in history|sample|training|on this day|politics)$/i.test(design.category.trim())) tags.add(captionHashtag(design.category));
    }
    return composeCaption(blocks, [...tags].filter(Boolean).slice(0, 7), uniqueCaptionParts(bylines).join(' · '));
}

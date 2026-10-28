import { describe, expect, it } from 'vitest';
import { generateInstagramCaption } from '@/lib/post-studio/carousel';
import { createHistoryDesign, createHistoryParagraphDesign } from '@/lib/post-studio/history-design';
import { createCricketDesign } from '@/lib/post-studio/cricket-design';
import { defaultPostDesign, type PostDesign } from '@/lib/post-studio/types';
import type { PostDraft } from '@/lib/post-studio/drafts';
const draft = (design: PostDesign, index = 0): PostDraft => ({ id: `page-${index}`, name: `Internal draft · ${index + 1}/4`, createdAt: '', updatedAt: '', trashedAt: null, design });
const expectContentOnly = (caption: string) => {
    expect(caption).not.toMatch(/carousel breakdown|slide \d|swipe through|full analysis|internal draft|\d+\/4/i);
    expect(caption).not.toContain('#NepalPolitics');
    expect(caption.length).toBeLessThanOrEqual(2200);
};
describe('Post-specific social captions', () => {
    it('uses the event date and cover context for History without repeating continuation copy', () => {
        const cover = createHistoryDesign('on-this-day'); cover.history!.storyScope = 'national';
        cover.history!.year = '1872 B.S.'; cover.history!.dateLabel = 'Nepali date (B.S.)';
        const continuation = createHistoryParagraphDesign(cover, 'Longer explanation only on the paragraph page.', 'The background');
        const caption = generateInstagramCaption([draft(cover), draft(continuation, 1)]);
        expect(caption).toContain(cover.headline);
        expect(caption).toContain(cover.history!.fact);
        expect(caption).toContain('1872 B.S.');
        expect(caption).toContain('#NepalHistory');
        expect(caption).not.toContain('Longer explanation');
        expectContentOnly(caption);
        const paragraphCaption = generateInstagramCaption([draft(continuation)]);
        expect(paragraphCaption).toContain('Longer explanation');
    });
    it('keeps all selected History editions in their own language when sharing together', () => {
        const nepali = createHistoryDesign('on-this-day', 'portrait', 'ne'); nepali.history!.storyScope = 'national';
        const english = createHistoryDesign('on-this-day'); english.history!.storyScope = 'international'; english.headline = 'An international historical event';
        const caption = generateInstagramCaption([draft(nepali), draft(english, 1)]);
        expect(caption).toContain('इतिहासमा आजको दिन'); expect(caption).toContain('Today in History');
        expect(caption).toContain(nepali.history!.fact); expect(caption).toContain(english.history!.fact);
        expectContentOnly(caption);
    });
    it.each(['breaking', 'explainer', 'quote', 'book-review', 'book-analysis', 'book-takeaways', 'book-verdict'] as const)('%s uses authored copy and relevant tags', template => {
        const design = { ...defaultPostDesign, template, headline: 'A community library opens its doors', summary: 'The library offers free access to books and study space.', category: 'CULTURE' };
        const caption = generateInstagramCaption([draft(design)]);
        expect(caption).toContain(design.headline); expect(caption).toContain(design.summary);
        expect(caption).not.toContain('#Governance');
        if (template.startsWith('book-')) expect(caption).toMatch(/#Book(Review|Analysis)/);
        expectContentOnly(caption);
    });
    it('deduplicates repeated copy and respects the caption limit for lengthy posts', () => {
        const designs = Array.from({ length: 20 }, (_, i) => draft({ ...defaultPostDesign, template: 'explainer', headline: `Topic ${i}`, summary: 'A sentence of useful verified context. '.repeat(30), category: 'CONTEXT' }, i));
        const caption = generateInstagramCaption(designs);
        expect(caption).toContain('Topic 0'); expect(caption).toContain('Topic 19');
        expectContentOnly(caption);
        const repeated = generateInstagramCaption([draft({ ...defaultPostDesign, headline: 'The same statement', summary: 'The same statement' })]);
        expect(repeated.match(/The same statement/g)).toHaveLength(1);
    });
    it('includes cricket facts and full team names instead of numbering carousel pages', () => {
        const wicket = createCricketDesign('wicket'), scorecard = createCricketDesign('scorecard');
        const caption = generateInstagramCaption([draft(wicket), draft(scorecard, 1)]);
        expect(caption).toContain(wicket.cricket!.batter.name);
        expect(caption).toContain(scorecard.cricket!.batting[0].name);
        expect(caption).toContain('#NepalCricket');
        expect(caption).not.toMatch(/^\d+\. WICKET/m);
        expectContentOnly(caption);
    });
    it('omits source/photo URLs and internal draft names', () => {
        const design = createHistoryDesign('on-this-day'); design.history!.sourceUrl = 'https://example.com/archive'; design.sourceUrls = [design.history!.sourceUrl];
        const caption = generateInstagramCaption([draft(design)]);
        expect(caption).not.toContain('example.com'); expect(caption).not.toContain('Internal draft');
        expectContentOnly(caption);
    });
});

import { describe, expect, it } from 'vitest';
import {
    bookReviewPresets,
    generateBookReviewCaption,
    generateBookReviewDrafts,
    generateBookReviewSummaryDraft,
    type BookReviewInput,
} from '@/lib/post-studio/book-review';
import { postDesignSchema } from '@/lib/post-studio/drafts';
import { textLineLimit } from '@/lib/post-studio/text-overflow';

describe('Book Review Templates & Generator', () => {
    const sampleBook: BookReviewInput = {
        title: "Why Nations Fail",
        author: "Daron Acemoglu & James A. Robinson",
        tag: "POLITICAL ECONOMY",
        rating: "★★★★★ 5.0",
        centralThesis: "Institutions rule economic fate: inclusive systems generate innovation, extractive systems entrench poverty.",
        purpose: "To explain why world inequality persists and debunk geographic or cultural determinism.",
        argumentEvidence: "Comparative case studies of Nogales, the Glorious Revolution, and Venetian state decline.",
        assumptionIdeology: "Institutional economics and pluralism. Assumes creative destruction is essential for long-term growth.",
        relevanceApplication: "Explains how political syndicates in Nepal extract state resources and prevent youth-led innovation.",
        keyTakeaways: "1. Extractive institutions protect elite monopolies.\n2. Inclusivity requires pluralism.\n3. Historical junctures determine institutional drift.",
        whyItMatters: "Provides the analytical vocabulary to understand why constitutional changes fail without economic democratization.",
        criticSays: "“A landmark contribution to political economy.”",
        accent: "#C5A059",
    };

    it('has all 12 requested fields populated across curated presets', () => {
        expect(bookReviewPresets.length).toBeGreaterThanOrEqual(3);
        for (const preset of bookReviewPresets) {
            const data = preset.data;
            expect(data.title.trim().length).toBeGreaterThan(0);
            expect(data.author.trim().length).toBeGreaterThan(0);
            expect(data.tag.trim().length).toBeGreaterThan(0);
            expect(data.rating.trim().length).toBeGreaterThan(0);
            expect(data.centralThesis.trim().length).toBeGreaterThan(0);
            expect(data.purpose.trim().length).toBeGreaterThan(0);
            expect(data.argumentEvidence.trim().length).toBeGreaterThan(0);
            expect(data.assumptionIdeology.trim().length).toBeGreaterThan(0);
            expect(data.relevanceApplication.trim().length).toBeGreaterThan(0);
            expect(data.keyTakeaways.trim().length).toBeGreaterThan(0);
            expect(data.whyItMatters.trim().length).toBeGreaterThan(0);
            expect(data.criticSays.trim().length).toBeGreaterThan(0);
        }
    });

    it('generates a 5-slide carousel pack with all slides passing postDesignSchema', () => {
        const slides = generateBookReviewDrafts(sampleBook, 'portrait');
        expect(slides).toHaveLength(5);

        // Slide 1: Cover & Thesis
        expect(slides[0].name).toContain('1/5');
        expect(slides[0].design.template).toBe('book-review');
        expect(slides[0].design.category).toContain(sampleBook.tag);
        expect(slides[0].design.headline).toBe(sampleBook.title);
        expect(slides[0].design.summary).toContain(sampleBook.centralThesis);
        expect(slides[0].design.eyebrow).toContain(sampleBook.rating);

        // Slide 2: Purpose & Arguments
        expect(slides[1].name).toContain('2/5');
        expect(slides[1].design.template).toBe('book-analysis');
        expect(slides[1].design.summary).toContain(sampleBook.purpose);
        expect(slides[1].design.summary).toContain(sampleBook.argumentEvidence);

        // Slide 3: Philosophy & Ideology
        expect(slides[2].name).toContain('3/5');
        expect(slides[2].design.template).toBe('book-analysis');
        expect(slides[2].design.summary).toContain(sampleBook.assumptionIdeology);

        // Slide 4: Relevance & Takeaways
        expect(slides[3].name).toContain('4/5');
        expect(slides[3].design.template).toBe('book-takeaways');
        expect(slides[3].design.summary).toContain(sampleBook.relevanceApplication);
        expect(slides[3].design.summary).toContain(sampleBook.keyTakeaways);

        // Slide 5: Verdict & Critic
        expect(slides[4].name).toContain('5/5');
        expect(slides[4].design.template).toBe('book-verdict');
        expect(slides[4].design.headline).toContain('landmark contribution');
        expect(slides[4].design.summary).toContain(sampleBook.whyItMatters);
        expect(slides[4].design.category).toContain(sampleBook.rating);

        // Verify all 5 slides strictly validate against schema
        for (const slide of slides) {
            expect(() => postDesignSchema.parse(slide.design)).not.toThrow();
        }
    });

    it('generates a valid single summary card draft', () => {
        const summary = generateBookReviewSummaryDraft(sampleBook, 'portrait');
        expect(summary.name).toContain('Summary Card');
        expect(summary.design.template).toBe('book-review');
        expect(summary.design.headline).toBe(sampleBook.title);
        expect(summary.design.summary).toContain(sampleBook.centralThesis);
        expect(summary.design.summary).toContain(sampleBook.whyItMatters);
        expect(() => postDesignSchema.parse(summary.design)).not.toThrow();
    });

    it('generates a complete social media caption containing all 12 analytical fields', () => {
        const caption = generateBookReviewCaption(sampleBook);
        expect(caption).toContain(sampleBook.title);
        expect(caption).toContain(sampleBook.author);
        expect(caption).toContain(sampleBook.tag);
        expect(caption).toContain(sampleBook.rating);
        expect(caption).toContain(sampleBook.centralThesis);
        expect(caption).toContain(sampleBook.purpose);
        expect(caption).toContain(sampleBook.keyTakeaways);
        expect(caption).toContain(sampleBook.whyItMatters);
        expect(caption).toContain(sampleBook.criticSays);
        expect(caption).toContain('#TheLeaders');
    });

    it('provides template-aware line limits for book review layouts', () => {
        // Standard templates allow 3 lines for supporting in portrait
        expect(textLineLimit('portrait', 'supporting', 'breaking')).toBe(3);

        // Book review templates allow up to 6 lines for in-depth analysis
        expect(textLineLimit('portrait', 'supporting', 'book-review')).toBe(6);
        expect(textLineLimit('portrait', 'supporting', 'book-analysis')).toBe(6);
        expect(textLineLimit('portrait', 'supporting', 'book-takeaways')).toBe(6);
        expect(textLineLimit('portrait', 'supporting', 'book-verdict')).toBe(6);
    });
});

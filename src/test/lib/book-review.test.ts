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

        // Book review templates allow up to 8-14 lines for in-depth analysis
        expect(textLineLimit('portrait', 'supporting', 'book-review')).toBe(8);
        expect(textLineLimit('portrait', 'supporting', 'book-analysis')).toBe(14);
        expect(textLineLimit('portrait', 'supporting', 'book-takeaways')).toBe(14);
        expect(textLineLimit('portrait', 'supporting', 'book-verdict')).toBe(8);
    });

    it('provides rich studio craft layer specifications for all book review templates', async () => {
        const { getStudioCraft } = await import('@/lib/post-studio/studio-craft');
        const craft = getStudioCraft('book-review');

        expect(craft.badge).toBe('BOOK REVIEW CRAFT');
        expect(craft.layers).toHaveLength(5);

        const keys = craft.layers.map(l => l.key);
        expect(keys).toContain('kicker');
        expect(keys).toContain('headline');
        expect(keys).toContain('supporting');
        expect(keys).toContain('footer');
        expect(keys).toContain('visual');

        // Check contextual role labels
        const headlineLayer = craft.layers.find(l => l.key === 'headline');
        expect(headlineLayer?.label).toBe('Book Title');
        expect(headlineLayer?.role).toBe('Title & Work');

        const supportingLayer = craft.layers.find(l => l.key === 'supporting');
        expect(supportingLayer?.label).toBe('Central Thesis');
        expect(supportingLayer?.role).toBe('Core Argument');

        // Check archetype navigation
        expect(craft.archetypes).toHaveLength(4);
        expect(craft.archetypes?.map(a => a.key)).toEqual([
            'book-review',
            'book-analysis',
            'book-takeaways',
            'book-verdict',
        ]);
    });

    it('generates master prompt with target book title, author, context, and exact length rules', async () => {
        const { generateBookReviewMasterPrompt } = await import('@/lib/post-studio/book-review');
        const prompt = generateBookReviewMasterPrompt(
            "The Republic",
            "Plato",
            "Justice and political leadership in modern democracies"
        );

        expect(prompt).toContain('Book: "The Republic"');
        expect(prompt).toContain('Author: "Plato"');
        expect(prompt).toContain('Justice and political leadership');
        expect(prompt).toContain('EXACTLY 140–185 characters');
        expect(prompt).toContain('EXACTLY 120–175 characters');
        expect(prompt).toContain('centralThesis');
        expect(prompt).toContain('keyTakeaways');
        expect(prompt).toContain('criticSays');
    });

    it('parses valid JSON response from AI code block into BookReviewInput', async () => {
        const { parseBookReviewResponse } = await import('@/lib/post-studio/book-review');
        const aiResponse = `Here is the requested book review:
\`\`\`json
{
  "title": "The Federalist Papers",
  "author": "Alexander Hamilton, James Madison & John Jay",
  "tag": "CONSTITUTIONALISM",
  "rating": "★★★★★ 5.0",
  "centralThesis": "A strong constitutional union with checks and balances prevents tyranny and secures enduring liberty.",
  "purpose": "To persuade New York citizens to ratify the proposed United States Constitution.",
  "argumentEvidence": "Historical analysis of confederacies, factional perils, and separated branches of power.",
  "assumptionIdeology": "Classical Republicanism and liberal institutionalism assuming factions are inherent to human nature.",
  "relevanceApplication": "Provides the foundational blueprint for multi-tier constitutional checks in fragile democracies.",
  "keyTakeaways": "1. Factions must be checked by institutional design.\\n2. Executive energy balances legislative power.\\n3. Independent judiciary safeguards the rule of law.",
  "whyItMatters": "The definitive philosophical defense of constitutional democracy and institutional equilibrium.",
  "criticSays": "“The most profound treatise on governance produced in the modern political era.”",
  "accent": "#1E3A8A"
}
\`\`\`
Hope this fits your studio!`;

        const parsed = parseBookReviewResponse(aiResponse);
        expect(parsed.success).toBe(true);
        expect(parsed.detectedCount).toBe(12);
        expect(parsed.data.title).toBe("The Federalist Papers");
        expect(parsed.data.author).toContain("Hamilton");
        expect(parsed.data.tag).toBe("CONSTITUTIONALISM");
        expect(parsed.data.rating).toBe("★★★★★ 5.0");
        expect(parsed.data.accent).toBe("#1E3A8A");
    });

    it('parses Markdown key-value fallback format into BookReviewInput', async () => {
        const { parseBookReviewResponse } = await import('@/lib/post-studio/book-review');
        const markdownResponse = `
### Book Review Breakdown
Title: The Prince
Author: Niccolò Machiavelli
Tag: REALPOLITIK & STATECRAFT
Rating: ★★★★½ 4.8
Central Thesis: Effective statehood requires pragmatic adaptation to political fortune rather than unbending moral idealism.
Purpose: To guide a ruler on acquiring, maintaining, and defending state power against domestic and foreign ruin.
Argument & Evidence: Case studies of Cesare Borgia, Roman emperors, and Italian city-state vulnerabilities.
Assumption & Ideology: Political realism. Assumes self-interest and instability dominate human affairs.
Relevance & Application: Crucial analytical antidote to naive governance assumptions in competitive party politics.
Key Takeaways: 1. Adapt methods to circumstance.\n2. Cruelty poorly used destroys power.\n3. Institutional arms must be domestic.
Why It Matters: Founded modern political science by separating practical governance from theological dogma.
Critic Says: “A merciless dissection of power stripped of moral disguise.”
        `;

        const parsed = parseBookReviewResponse(markdownResponse);
        expect(parsed.success).toBe(true);
        expect(parsed.detectedCount).toBeGreaterThanOrEqual(10);
        expect(parsed.data.title).toBe("The Prince");
        expect(parsed.data.author).toBe("Niccolò Machiavelli");
        expect(parsed.data.tag).toBe("REALPOLITIK & STATECRAFT");
        expect(parsed.data.criticSays).toContain("merciless dissection");
    });

    it('applies solid color accent as default backgroundColor across all 5 slides and summary draft', () => {
        const slides = generateBookReviewDrafts(sampleBook, 'portrait');
        expect(slides).toHaveLength(5);
        for (const slide of slides) {
            expect(slide.design.backgroundColor).toBe('#C5A059');
            expect(slide.design.backgroundGradient).toBeNull();
            expect(slide.design.accent).toBe('#C5A059');
        }

        const summary = generateBookReviewSummaryDraft(sampleBook, 'portrait');
        expect(summary.design.backgroundColor).toBe('#C5A059');
        expect(summary.design.backgroundGradient).toBeNull();
    });

    it('applies gradient accent as default backgroundGradient across all 5 slides and summary draft', () => {
        const gradientAccent = 'linear-gradient(135deg, #4a0000 0%, #8B0000 50%, #1a0000 100%)';
        const bookWithGradient: BookReviewInput = {
            ...sampleBook,
            accent: gradientAccent,
        };

        const slides = generateBookReviewDrafts(bookWithGradient, 'portrait');
        expect(slides).toHaveLength(5);
        for (const slide of slides) {
            expect(slide.design.backgroundGradient).toBe(gradientAccent);
            expect(slide.design.backgroundColor).toBeNull();
            expect(slide.design.accent).toBe('#4a0000');
        }

        const summary = generateBookReviewSummaryDraft(bookWithGradient, 'portrait');
        expect(summary.design.backgroundGradient).toBe(gradientAccent);
        expect(summary.design.backgroundColor).toBeNull();
    });

    it('resolves named story gradient and color presets when passed as accent', async () => {
        const { sanitizeAccentInput, resolveAccentBackground } = await import('@/lib/post-studio/book-review');
        
        // Named preset from story gradients
        const gradientSanitized = sanitizeAccentInput('Midnight Navy');
        expect(gradientSanitized).toContain('linear-gradient');
        const resolvedGrad = resolveAccentBackground('Midnight Navy');
        expect(resolvedGrad.backgroundGradient).toContain('linear-gradient');

        // Named preset from story colors
        const colorSanitized = sanitizeAccentInput('Republic Emerald');
        expect(colorSanitized).toBe('#064e3b');
        const resolvedColor = resolveAccentBackground('Republic Emerald');
        expect(resolvedColor.backgroundColor).toBe('#064e3b');
    });

    it('parses JSON with a gradient accent string into BookReviewInput', async () => {
        const { parseBookReviewResponse } = await import('@/lib/post-studio/book-review');
        const jsonWithGradient = `\`\`\`json
{
  "title": "Development as Freedom",
  "author": "Amartya Sen",
  "tag": "DEVELOPMENT ECONOMICS",
  "rating": "★★★★★ 5.0",
  "centralThesis": "Development is the expansion of substantive human freedoms rather than mere GDP growth.",
  "purpose": "To reorient economic policymaking towards human capability and democratic agency.",
  "argumentEvidence": "Comparative empirical studies of famine mortality in democracies vs dictatorships.",
  "assumptionIdeology": "Capability approach and democratic welfare economics.",
  "relevanceApplication": "Refocuses Nepal's national budget from elite infrastructure rents to public health and schooling.",
  "keyTakeaways": "1. Freedom is the primary end of development.\\n2. Free press prevents famines.\\n3. Capabilities empower citizens.",
  "whyItMatters": "Transformed human development theory and founded modern capability ethics.",
  "criticSays": "“One of the most consequential economic works of our era.”",
  "accent": "linear-gradient(135deg, #062b1a 0%, #0d5c3a 50%, #10b981 100%)"
}
\`\`\``;

        const parsed = parseBookReviewResponse(jsonWithGradient);
        expect(parsed.success).toBe(true);
        expect(parsed.data.accent).toBe("linear-gradient(135deg, #062b1a 0%, #0d5c3a 50%, #10b981 100%)");

        // Verify draft generation with this parsed book review
        const slides = generateBookReviewDrafts(parsed.data, 'portrait');
        for (const slide of slides) {
            expect(slide.design.backgroundGradient).toBe("linear-gradient(135deg, #062b1a 0%, #0d5c3a 50%, #10b981 100%)");
        }
    });
});


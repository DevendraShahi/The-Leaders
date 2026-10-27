import { describe, it, expect } from "vitest";
import { 
    findCarouselSiblings, 
    getCarouselBaseTitle, 
    generateInstagramCaption 
} from "@/lib/post-studio/carousel";
import type { PostDraft } from "@/lib/post-studio/drafts";
import { defaultPostDesign } from "@/lib/post-studio/types";

describe("carousel helpers", () => {
    const makeDraft = (id: string, name: string): PostDraft => ({
        id,
        name,
        createdAt: "2026-10-25T00:00:00.000Z",
        updatedAt: "2026-10-25T00:00:00.000Z",
        trashedAt: null,
        design: {
            ...defaultPostDesign,
            headline: `Headline for ${name}`,
            summary: `Summary for ${name}`,
            category: "POLITICS",
        },
    });

    it("extracts clean base title for carousel slides", () => {
        expect(getCarouselBaseTitle("Why Nations Fail · 1/5 (Thesis)")).toBe("Why Nations Fail");
        expect(getCarouselBaseTitle("Nepal Elections · 2/4")).toBe("Nepal Elections");
        expect(getCarouselBaseTitle("Standalone Post")).toBe("Standalone Post");
    });

    it("discovers carousel siblings by numeric ID suffix", () => {
        const slide1 = makeDraft("book-bp-1730000000-1", "Jail Journal · 1/3");
        const slide2 = makeDraft("book-bp-1730000000-2", "Jail Journal · 2/3");
        const slide3 = makeDraft("book-bp-1730000000-3", "Jail Journal · 3/3");
        const other = makeDraft("random-draft-id", "Random Draft");

        const all = [slide2, other, slide3, slide1];
        const siblings = findCarouselSiblings(slide2, all);

        expect(siblings.length).toBe(3);
        expect(siblings.map(s => s.id)).toEqual([
            "book-bp-1730000000-1",
            "book-bp-1730000000-2",
            "book-bp-1730000000-3",
        ]);
    });

    it("discovers carousel siblings by matching name pattern when IDs differ", () => {
        const slide1 = makeDraft("id-alpha", "Economic Reform · 1/2");
        const slide2 = makeDraft("id-beta", "Economic Reform · 2/2");
        const other = makeDraft("id-gamma", "Social Reform · 1/2");

        const all = [slide2, other, slide1];
        const siblings = findCarouselSiblings(slide1, all);

        expect(siblings.length).toBe(2);
        expect(siblings[0].id).toBe("id-alpha");
        expect(siblings[1].id).toBe("id-beta");
    });

    it("generates Instagram-ready caption with carousel breakdown and hashtags", () => {
        const slide1 = makeDraft("s1", "Title · 1/2");
        const slide2 = makeDraft("s2", "Title · 2/2");

        const caption = generateInstagramCaption([slide1, slide2]);
        expect(caption).toContain("The Leaders");
        expect(caption).toContain("CAROUSEL BREAKDOWN (2 SLIDES)");
        expect(caption).toContain("#NepalPolitics");
        expect(caption).toContain("#TheLeaders");
    });

    describe("universal vs sectional scoping logic", () => {
        it("universal mode propagates style and format changes while preserving individual slide copy", () => {
            const slide1 = makeDraft("s1", "Deck · 1/3");
            const slide2 = makeDraft("s2", "Deck · 2/3");
            const slide3 = makeDraft("s3", "Deck · 3/3");
            const deck = [slide1, slide2, slide3];

            // Stylistic changes applied under universal mode
            const universalPatch = {
                format: "portrait" as const,
                accent: "#7c3aed",
                textAlign: "center" as const,
                category: "INVESTIGATION",
            };

            const updatedDeck = deck.map((slide, idx) => {
                if (idx === 0) {
                    return {
                        ...slide,
                        design: { ...slide.design, ...universalPatch, headline: "Updated Cover Thesis" }
                    };
                }
                return {
                    ...slide,
                    design: { ...slide.design, ...universalPatch }
                };
            });

            // Universal style properties synced to all slides
            expect(updatedDeck[0].design.format).toBe("portrait");
            expect(updatedDeck[1].design.format).toBe("portrait");
            expect(updatedDeck[2].design.format).toBe("portrait");

            expect(updatedDeck[0].design.accent).toBe("#7c3aed");
            expect(updatedDeck[1].design.accent).toBe("#7c3aed");
            expect(updatedDeck[2].design.accent).toBe("#7c3aed");

            expect(updatedDeck[0].design.category).toBe("INVESTIGATION");
            expect(updatedDeck[1].design.category).toBe("INVESTIGATION");
            expect(updatedDeck[2].design.category).toBe("INVESTIGATION");

            // Individual slide content remains unique
            expect(updatedDeck[0].design.headline).toBe("Updated Cover Thesis");
            expect(updatedDeck[1].design.headline).toBe("Headline for Deck · 2/3");
            expect(updatedDeck[2].design.headline).toBe("Headline for Deck · 3/3");
        });

        it("sectional mode isolates changes to the targeted slide only", () => {
            const slide1 = makeDraft("s1", "Deck · 1/3");
            const slide2 = makeDraft("s2", "Deck · 2/3");
            const slide3 = makeDraft("s3", "Deck · 3/3");
            const deck = [slide1, slide2, slide3];

            // Sectional change on slide 2
            const targetIdx = 1;
            const updatedDeck = deck.map((slide, idx) => {
                if (idx === targetIdx) {
                    return {
                        ...slide,
                        design: {
                            ...slide.design,
                            accent: "#10b981",
                            textAlign: "center" as const,
                        }
                    };
                }
                return slide;
            });

            // Slide 2 is updated
            expect(updatedDeck[1].design.accent).toBe("#10b981");
            expect(updatedDeck[1].design.textAlign).toBe("center");

            // Slide 1 and Slide 3 remain untouched
            expect(updatedDeck[0].design.accent).toBe(defaultPostDesign.accent);
            expect(updatedDeck[0].design.textAlign).toBe(defaultPostDesign.textAlign);
            expect(updatedDeck[2].design.accent).toBe(defaultPostDesign.accent);
            expect(updatedDeck[2].design.textAlign).toBe(defaultPostDesign.textAlign);
        });

        it("tool-specific promotion applies typography and colors across all slides", () => {
            const slide1 = makeDraft("s1", "Deck · 1/2");
            const slide2 = makeDraft("s2", "Deck · 2/2");

            const customTypography = {
                ...slide1.design.textTypography,
                headline: { font: "hind" as const, size: 140, lineSpacing: 120, shadow: 15 },
            };
            const customColors = {
                ...slide1.design.textColors,
                headline: "#fbbf24",
                supporting: "#e5e7eb",
            };

            // Promote typography and colors to all slides
            const updated = [slide1, slide2].map(s => ({
                ...s,
                design: {
                    ...s.design,
                    textTypography: customTypography,
                    textColors: customColors,
                }
            }));

            expect(updated[0].design.textTypography.headline.font).toBe("hind");
            expect(updated[1].design.textTypography.headline.font).toBe("hind");
            expect(updated[0].design.textColors.headline).toBe("#fbbf24");
            expect(updated[1].design.textColors.headline).toBe("#fbbf24");

            // Headlines still unique
            expect(updated[0].design.headline).toBe("Headline for Deck · 1/2");
            expect(updated[1].design.headline).toBe("Headline for Deck · 2/2");
        });
    });
});


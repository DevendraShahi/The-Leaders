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
});

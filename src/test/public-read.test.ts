import { describe, expect, it } from "vitest";
import { bilingual, pagePayload, publicImage, readPageParams, slicePage } from "@/lib/public-read/shape";
import { articleDetailSchema } from "@/lib/public-read/schemas";

describe("public read shapes", () => {
    it("fills both languages from a single string", () => {
        expect(bilingual("Nepal")).toEqual({ en: "Nepal", ne: "Nepal" });
    });

    it("falls back when one language is missing", () => {
        expect(bilingual({ en: "Leaders", ne: "" })).toEqual({ en: "Leaders", ne: "Leaders" });
        expect(bilingual({ ne: "नेता" })).toEqual({ en: "नेता", ne: "नेता" });
    });

    it("keeps absolute images and prefixes site paths", () => {
        expect(publicImage("https://res.cloudinary.com/demo/image.jpg")).toBe(
            "https://res.cloudinary.com/demo/image.jpg"
        );
        expect(publicImage("/logo.svg")).toBe("https://the-leadersnp.com/logo.svg");
    });

    it("clamps pagination", () => {
        const params = readPageParams(new URLSearchParams("page=0&limit=500"));
        expect(params).toEqual({ page: 1, limit: 50, skip: 0 });
        expect(pagePayload(["a"], 3, 1, 1).hasMore).toBe(true);
        expect(slicePage([1, 2, 3], 2, 2)).toEqual({
            items: [3],
            page: 2,
            limit: 2,
            total: 3,
            hasMore: false,
        });
    });

    it("drops private editorial workflow fields from public article responses", () => {
        const article = articleDetailSchema.parse({
            slug: "private-notes-stay-private",
            source: "article",
            title: { en: "Headline", ne: "शीर्षक" },
            excerpt: { en: "Summary", ne: "सारांश" },
            author: { en: "Desk", ne: "डेस्क" },
            category: { en: "Politics", ne: "राजनीति" },
            image: "https://example.com/image.png",
            publishedAt: "2026-10-01T00:00:00.000Z",
            tags: ["news"],
            content: { en: "Public content", ne: "सार्वजनिक सामग्री" },
            editorialWorkflow: {
                projectName: "Internal plan",
                handoffNotes: "Do not publish before legal review.",
            },
        });

        expect(article).not.toHaveProperty("editorialWorkflow");
    });
});

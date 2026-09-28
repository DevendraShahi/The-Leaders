import { describe, expect, it } from "vitest";
import { bilingual, pagePayload, publicImage, readPageParams, slicePage } from "@/lib/public-read/shape";

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
});

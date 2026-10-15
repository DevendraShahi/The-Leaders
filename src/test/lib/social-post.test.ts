import { describe, expect, it } from "vitest";
import { canTransition, outputFilename, socialPostPatchSchema } from "@/lib/social-post";
import { createSocialPostSvg, socialPostPreflight } from "@/lib/social-artboard";

const readyPost: any = {
    templateId: "news", format: "portrait", outputLanguage: "ne",
    copy: { en: {}, ne: { headline: "आजको महत्वपूर्ण समाचार", category: "राजनीति", deck: "प्रमाणित स्रोतबाट तयार गरिएको छोटो विवरण", altText: "बैठकमा सहभागी व्यक्तिहरू" } },
    sources: [{ url: "https://example.com/story", publisher: "Example", title: "Story", trusted: true }],
    media: { mediaId: "media-1", credit: "The Leaders", rightsStatus: "owned", focalX: 0.5, focalY: 0.5, zoom: 1 },
    verification: { claimsConfirmed: true, sourcesConfirmed: true },
};

describe("Social Studio workflow helpers", () => {
    it("allows only the newsroom review flow transitions", () => {
        expect(canTransition("draft", "in_review")).toBe(true);
        expect(canTransition("in_review", "approved")).toBe(true);
        expect(canTransition("approved", "exported")).toBe(true);
        expect(canTransition("approved", "draft")).toBe(false);
        expect(canTransition("exported", "approved")).toBe(false);
    });

    it("requires sources, rights, media, and human verification before rendering", () => {
        expect(socialPostPreflight(readyPost)).toEqual([]);
        expect(socialPostPreflight({ ...readyPost, verification: { claimsConfirmed: false, sourcesConfirmed: true } })).toContain("Confirm the claims and source checks.");
        expect(socialPostPreflight({ ...readyPost, media: { ...readyPost.media, rightsStatus: "unknown" } })).toContain("Confirm the image rights status.");
    });

    it("preserves independent locale copy and validates bounded crops", () => {
        const parsed = socialPostPatchSchema.parse({ revision: 4, outputLanguage: "en", copy: { en: { headline: "English version" }, ne: { headline: "नेपाली संस्करण" } }, media: { crop: { focalX: 0.7, focalY: 0.4, zoom: 1.2 } } });
        expect(parsed.copy?.en?.headline).toBe("English version");
        expect(parsed.copy?.ne?.headline).toBe("नेपाली संस्करण");
        expect(parsed.media?.crop?.zoom).toBe(1.2);
    });

    it("uses exact target dimensions in the shared artboard and Unicode-safe names", () => {
        const svg = createSocialPostSvg(readyPost, "https://example.com/photo.jpg");
        expect(svg).toContain('width="1080" height="1350"');
        expect(outputFilename("नेपाल समाचार", "ne", "portrait", 2)).toMatch(/नेपाल-समाचार-ne-portrait-r2\.png$/);
    });
});

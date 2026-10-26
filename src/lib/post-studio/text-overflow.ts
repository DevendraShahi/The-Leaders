// Ported from mobile/src/features/post-designer; keep artwork behavior in sync.
import type { PostFormat, PostTemplate } from "./types";

export function textLineLimit(format: PostFormat, layer: "headline" | "supporting", template?: PostTemplate | string) {
    const isBook = typeof template === "string" && template.startsWith("book-");
    if (isBook) {
        if (layer === "headline") return format === "landscape" ? 3 : format === "story" ? 6 : 4;
        // Dual-section analytical slides (Purpose & Arguments, Assumptions & Ideology, Takeaways)
        const isDenseBook = template === "book-analysis" || template === "book-takeaways" || template === "book-lens";
        if (isDenseBook) {
            return format === "landscape" ? 8 : format === "story" ? 18 : 14;
        }
        return format === "landscape" ? 5 : format === "story" ? 12 : 8;
    }
    if (layer === "headline") {
        return format === "landscape" ? 3 : format === "story" ? 6 : 4;
    }
    if (template === "cricket") {
        return format === "landscape" ? 6 : format === "story" ? 18 : 12;
    }
    if (template === "explainer") {
        return format === "landscape" ? 5 : format === "story" ? 12 : 8;
    }
    return format === "landscape" ? 2 : format === "story" ? 4 : 3;
}

export function exceedsTextLines(height: number, lineHeight: number, limit: number) {
    return height > lineHeight * limit + 1;
}


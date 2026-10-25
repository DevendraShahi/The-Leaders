// Ported from mobile/src/features/post-designer; keep artwork behavior in sync.
import type { PostFormat, PostTemplate } from "./types";
export function textLineLimit(format: PostFormat, layer: "headline" | "supporting", template?: PostTemplate | string) {
    const isBook = typeof template === "string" && template.startsWith("book-");
    if (isBook) {
        if (layer === "headline") return format === "landscape" ? 3 : format === "story" ? 6 : 4;
        return format === "landscape" ? 4 : format === "story" ? 8 : 6;
    }
    return layer === "headline" ? format === "landscape" ? 3 : format === "story" ? 6 : 4 : format === "landscape" ? 2 : format === "story" ? 4 : 3;
}
export function exceedsTextLines(height: number, lineHeight: number, limit: number) {
    return height > lineHeight * limit + 1;
}

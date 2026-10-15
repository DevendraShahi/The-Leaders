import type { PostFormat } from "./types";
export function textLineLimit(format: PostFormat, layer: "headline" | "supporting") {
    return layer === "headline" ? format === "landscape" ? 3 : format === "story" ? 6 : 4 : format === "landscape" ? 2 : format === "story" ? 4 : 3;
}
export function exceedsTextLines(height: number, lineHeight: number, limit: number) {
    return height > lineHeight * limit + 1;
}

import type { PostFormat } from "./types";
// Metro selects export-artwork.web.ts for browser builds.
export async function downloadArtwork(_node: HTMLElement, _format: PostFormat, _filename: string): Promise<void> {
    throw new Error("Browser download is only available on web.");
}

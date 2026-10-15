import "server-only";
import crypto from "node:crypto";
import sharp from "sharp";
import type { ISocialPost } from "@/models/SocialPost";
import { createSocialPostSvg } from "@/lib/social-artboard";
import { socialPostDimensions, type SocialPostFormat } from "@/lib/social-post";

/** Server-only canonical renderer. The browser preview uses the same SVG definition. */
export async function renderSocialPost(post: ISocialPost, imageUrl: string) {
    const [width, height] = socialPostDimensions[post.format as SocialPostFormat];
    let dataUrl = "";
    let imageSize: { width?: number; height?: number } | undefined;
    if (imageUrl) {
        const image = await fetch(imageUrl, { signal: AbortSignal.timeout(10_000) });
        if (!image.ok) throw new Error("The selected library image could not be loaded for rendering.");
        const bytes = Buffer.from(await image.arrayBuffer());
        if (bytes.length > 12 * 1024 * 1024) throw new Error("The selected library image is too large to render.");
        imageSize = await sharp(bytes).metadata();
        dataUrl = `data:${image.headers.get("content-type") || "image/jpeg"};base64,${bytes.toString("base64")}`;
    }
    const png = await sharp(Buffer.from(createSocialPostSvg(post, dataUrl, imageSize))).resize(width, height, { fit: "fill" }).png().toBuffer();
    return { png, hash: crypto.createHash("sha256").update(png).digest("hex") };
}

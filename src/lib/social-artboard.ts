import type { ISocialPost } from "@/models/SocialPost";
import { socialPostDimensions, type SocialPostFormat, type SocialPostLocale } from "@/lib/social-post";

type Copy = Record<string, unknown>;

function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function escaped(value: unknown) { return text(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

function wrap(value: string, maxChars: number, maxLines: number) {
    const words = value.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (candidate.length > maxChars && line) { lines.push(line); line = word; }
        else line = candidate;
    }
    if (line) lines.push(line);
    return { lines: lines.slice(0, maxLines), overflow: lines.length > maxLines };
}

export function socialPostPreflight(post: Pick<ISocialPost, "copy" | "media" | "sources" | "verification" | "templateId" | "outputLanguage">, requireVerifiedSources = true) {
    const locale = post.outputLanguage as SocialPostLocale;
    const copy = (post.copy?.[locale] || {}) as Copy;
    const issues: string[] = [];
    const headline = text(copy.headline);
    if (!headline) issues.push("Add a headline before rendering.");
    if (headline && wrap(headline, locale === "ne" ? 22 : 30, 5).overflow) issues.push("Shorten the headline so it fits the approved type scale.");
    if (!post.sources?.length) issues.push("Attach at least one source.");
    if (requireVerifiedSources && post.sources?.some((source) => !source.trusted && !source.verifiedAt)) issues.push("A reviewer must verify each manually added source link.");
    if (!post.verification?.claimsConfirmed || !post.verification?.sourcesConfirmed) issues.push("Confirm the claims and source checks.");
    if (!post.media?.mediaId) issues.push("Choose a library image.");
    if (!post.media?.credit?.trim()) issues.push("Add the image credit.");
    if (!post.media?.rightsStatus || post.media.rightsStatus === "unknown") issues.push("Confirm the image rights status.");
    if (!text(copy.altText)) issues.push("Add alt text for the selected language.");
    if (post.templateId === "quote" && !text(copy.quoteSpeaker)) issues.push("Add the quote speaker.");
    if (post.templateId === "data" && (!text(copy.statisticValue) || !text(copy.statisticLabel))) issues.push("Add the data value and label.");
    return issues;
}

export function createSocialPostSvg(post: Pick<ISocialPost, "copy" | "format" | "outputLanguage" | "templateId" | "media">, imageHref = "", imageSize?: { width?: number; height?: number }) {
    const format = post.format as SocialPostFormat;
    const [width, height] = socialPostDimensions[format];
    const copy = (post.copy?.[post.outputLanguage as SocialPostLocale] || {}) as Copy;
    const isNepali = post.outputLanguage === "ne";
    const inset = Math.round(width * 0.07);
    const headline = text(copy.headline) || (isNepali ? "तपाईंको समाचार शीर्षक" : "Your news headline");
    const deck = text(copy.deck);
    const accent = post.templateId === "breaking" ? "#D72C23" : post.templateId === "data" ? "#275D92" : "#B71C1C";
    const headlineSize = Math.round(width * (format === "story" ? 0.068 : 0.061));
    const headlineLines = wrap(headline, isNepali ? 22 : 29, format === "story" ? 6 : 5).lines;
    const deckLines = wrap(deck, isNepali ? 34 : 48, 3).lines;
    const headlineY = Math.round(height * (format === "story" ? 0.53 : 0.57));
    const quote = post.templateId === "quote";
    const data = post.templateId === "data";
    const mainLines = data ? [text(copy.statisticValue)] : headlineLines;
    const label = data ? text(copy.statisticLabel) : "";
    const topLabel = quote ? "IN THEIR WORDS" : data ? "THE NUMBER" : (text(copy.eyebrow) || (post.templateId === "breaking" ? "DEVELOPING STORY" : "THE LEADERS"));
    const mainFont = isNepali ? "Hind, Noto Sans Devanagari, sans-serif" : "Georgia, serif";
    const naturalWidth = imageSize?.width || width;
    const naturalHeight = imageSize?.height || height;
    const imageScale = Math.max(width / naturalWidth, height / naturalHeight) * (post.media?.zoom || 1);
    const imageWidth = naturalWidth * imageScale;
    const imageHeight = naturalHeight * imageScale;
    // Position the cover-sized image within the artboard without exposing empty
    // edges. Focal values travel across the actual excess image dimensions.
    const imageX = (width - imageWidth) * (post.media?.focalX ?? .5);
    const imageY = (height - imageHeight) * (post.media?.focalY ?? .5);
    const imageLayer = imageHref ? `<image href="${escaped(imageHref)}" x="${imageX}" y="${imageY}" width="${imageWidth}" height="${imageHeight}" preserveAspectRatio="xMidYMid slice"/>` : `<rect width="${width}" height="${height}" fill="#171717"/>`;
    const mainText = mainLines.map((line, index) => `<text x="${inset}" y="${headlineY + index * Math.round(headlineSize * 1.08)}" class="headline">${escaped(line)}</text>`).join("");
    const deckStart = headlineY + mainLines.length * Math.round(headlineSize * 1.08) + Math.round(width * 0.035);
    const deckText = deckLines.map((line, index) => `<text x="${inset}" y="${deckStart + index * Math.round(width * 0.024)}" class="deck">${escaped(line)}</text>`).join("");
    const quoteMeta = quote ? `<text x="${inset}" y="${deckStart + deckLines.length * Math.round(width * 0.024) + 34}" class="meta">${escaped(text(copy.quoteSpeaker))}${text(copy.quoteContext) ? ` · ${escaped(text(copy.quoteContext))}` : ""}</text>` : "";
    const dataMeta = data ? `<text x="${inset}" y="${deckStart}" class="dataLabel">${escaped(label)}</text><text x="${inset}" y="${deckStart + 42}" class="meta">${escaped(text(copy.statisticAsOf))}</text>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs><linearGradient id="ink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070707" stop-opacity=".06"/><stop offset=".55" stop-color="#070707" stop-opacity=".35"/><stop offset="1" stop-color="#070707" stop-opacity=".94"/></linearGradient></defs>
      ${imageLayer}<rect width="${width}" height="${height}" fill="url(#ink)"/><rect width="${width}" height="12" fill="${accent}"/>
      <style>.sans{font-family:Arial,sans-serif}.headline{font-family:${mainFont};font-size:${headlineSize}px;font-weight:700;fill:#fff}.deck{font-family:${isNepali ? "Hind, sans-serif" : "Arial, sans-serif"};font-size:${Math.round(width * 0.021)}px;fill:#E9E9E9}.meta{font-family:Arial,sans-serif;font-size:${Math.round(width * 0.016)}px;letter-spacing:1px;fill:#E6E6E6}.dataLabel{font-family:${isNepali ? "Hind, sans-serif" : "Georgia, serif"};font-size:${Math.round(width * 0.039)}px;font-weight:700;fill:#fff}</style>
      <text x="${inset}" y="${Math.round(width * 0.075)}" class="meta" font-weight="700">THE LEADERS</text><text x="${width - inset}" y="${Math.round(width * 0.075)}" class="meta" text-anchor="end">${escaped(text(copy.category) || "NEWS").toUpperCase()}</text>
      <text x="${inset}" y="${headlineY - Math.round(width * 0.055)}" class="meta" font-weight="700">${escaped(topLabel).toUpperCase()}</text>
      ${mainText}${deckText}${quoteMeta}${dataMeta}<line x1="${inset}" x2="${width - inset}" y1="${height - Math.round(width * 0.12)}" y2="${height - Math.round(width * 0.12)}" stroke="#fff" stroke-opacity=".42"/>
      <text x="${inset}" y="${height - Math.round(width * 0.075)}" class="meta">THELEADERSNP.COM</text><text x="${width - inset}" y="${height - Math.round(width * 0.075)}" class="meta" text-anchor="end">${escaped(text(copy.linkText) || "READ THE STORY").toUpperCase()}</text>
    </svg>`;
}

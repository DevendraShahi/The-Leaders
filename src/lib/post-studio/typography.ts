// Ported from mobile/src/features/post-designer; keep artwork behavior in sync.
import { fontFamilies } from "./tokens";
import { defaultTextTypography, type PostDesign, type PostTextLayer, type TextTypography } from "./types";

export function setTextTypography(design: PostDesign, layer: PostTextLayer, patch: Partial<TextTypography>): PostDesign {
    if (design.lockedLayers.includes(layer)) return design;
    const settings = { ...(design.textTypography?.[layer] ?? defaultTextTypography()[layer]), ...patch };
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : 100));
    settings.size = clamp(settings.size, 40, 180);
    settings.lineSpacing = clamp(settings.lineSpacing, 90, 180);
    settings.shadow = clamp(settings.shadow, 0, 100);
    return { ...design, ...(layer === "headline" && patch.size !== undefined ? { headlineScale: settings.size / 100 } : {}), textTypography: { ...(design.textTypography ?? defaultTextTypography()), [layer]: settings } };
}

export function hasDevanagari(content: string) {
    return /[\u0900-\u097f\ua8e0-\ua8ff]/.test(content);
}

export function textTypographyStyle(design: PostDesign, layer: PostTextLayer, contentOverride?: string) {
    const config = design.textTypography?.[layer] ?? defaultTextTypography()[layer];
    const landscape = design.format === "landscape";
    const base = layer === "headline" ? [landscape ? 20 : 29, landscape ? 22 : 31] : layer === "supporting" ? [landscape ? 10 : 11, landscape ? 13 : 16] : layer === "kicker" ? [9, 12] : [8, 11];
    const content = contentOverride ?? (layer === "headline" ? design.headline : layer === "supporting" ? design.summary : layer === "kicker" ? design.eyebrow : design.author);
    // Onest has no Devanagari glyphs. Preserve shaping even when a saved
    // design explicitly selected it before Nepali text was entered.
    const language = config.font === "hind" || hasDevanagari(content) ? "ne" : "en";
    const weight = layer === "headline" ? "semibold" : layer === "supporting" ? "regular" : "bold";
    const scale = layer === "headline" ? design.headlineScale : config.size / 100;
    const fontSize = base[0] * scale;
    const requestedHeight = base[1] * scale * config.lineSpacing / 100;
    // Hind's vowel marks and conjuncts need more room than Latin headlines.
    const lineHeight = language === "ne" ? Math.max(requestedHeight, fontSize * (layer === "supporting" ? 1.6 : 1.5)) : requestedHeight;
    return { fontFamily: fontFamilies.ui[language][weight], fontWeight: undefined, fontSize, lineHeight,
        ...(language === "ne" ? { letterSpacing: 0, includeFontPadding: true } : {}),
        textShadowColor: `rgba(0,0,0,${config.shadow / 100 * .85})`, textShadowOffset: { width: 0, height: config.shadow > 0 ? 1 : 0 }, textShadowRadius: config.shadow / 100 * 6 };
}

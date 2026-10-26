// Ported from mobile/src/features/post-designer; keep artwork behavior in sync.
import type { PostDesign } from "./types";
export function moveImage(design: PostDesign, dx: number, dy: number): PostDesign {
    if (!design.imageUri || design.lockedLayers.includes("visual") || design.hiddenLayers.includes("visual")) return design;
    // Wide/tall originals need more travel than the old 90px frame-crop limit.
    const clamp = (value: number) => Math.max(-10000, Math.min(10000, value));
    return { ...design, imageOffsetX: clamp(design.imageOffsetX + (Number.isFinite(dx) ? dx : 0)), imageOffsetY: clamp(design.imageOffsetY + (Number.isFinite(dy) ? dy : 0)) };
}
export function wheelMovement(dx: number, dy: number, mode: number, shift = false) {
    const factor = mode === 1 ? 16 : mode === 2 ? 100 : 1;
    if (shift && dx === 0) return { x: dy * factor * 0.35, y: 0 };
    return { x: dx * factor * 0.35, y: dy * factor * 0.35 };
}

export function resetImageAdjustments(design: PostDesign): PostDesign {
    if (!design.imageUri || design.lockedLayers.includes("visual")) return design;
    return { ...design, imageOffsetX: 0, imageOffsetY: 0, imageZoom: 1.08, imageFit: "cover", imageTone: "ink", imageBlur: 0, imageVintage: 0, imageFeather: 0 };
}
export function replaceImage(design: PostDesign, uri: string, preserve = true): PostDesign {
    if (design.lockedLayers.includes("visual") || !uri.trim()) return design;
    const next = { ...design, imageUri: uri, imageCredit: uri === design.imageUri ? design.imageCredit : '' };
    return preserve && design.imageUri ? next : resetImageAdjustments(next);
}
export function setImageFit(design: PostDesign, fit: "cover" | "contain"): PostDesign {
    if (!design.imageUri || design.lockedLayers.includes("visual") || design.hiddenLayers.includes("visual")) return design;
    // Each fitting mode starts centred at 100%, making Fit show the full photo.
    return { ...design, imageFit: fit, imageZoom: 1, imageOffsetX: 0, imageOffsetY: 0 };
}

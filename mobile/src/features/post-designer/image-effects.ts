import type { PostDesign } from "./types";

export const imageEffectControls = [
    { key: "imageBlur", label: "Blur" },
    { key: "imageVintage", label: "Vintage" },
    { key: "imageFeather", label: "Feather edges" },
] as const;
export type ImageEffect = typeof imageEffectControls[number]["key"];

export function setImageEffect(design: PostDesign, key: ImageEffect, value: number): PostDesign {
    if (!design.imageUri || design.lockedLayers.includes("visual") || design.hiddenLayers.includes("visual") || !Number.isFinite(value)) return design;
    return { ...design, [key]: Math.max(0, Math.min(100, value)) };
}

// Interpolate a faded sepia grade with the identity, so zero preserves the photo.
export function vintageMatrix(amount: number): number[] {
    const t = Math.max(0, Math.min(100, amount)) / 100;
    const identity = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
    const vintage = [.354, .692, .170, 0, .045, .314, .617, .151, 0, .035, .245, .481, .118, 0, .025, 0, 0, 0, 1, 0];
    return identity.map((value, index) => value + (vintage[index] - value) * t);
}

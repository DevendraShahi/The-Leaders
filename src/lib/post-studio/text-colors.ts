// Ported from mobile/src/features/post-designer; keep artwork behavior in sync.
import { brand } from "./tokens";
import { defaultTextColors, type PostDesign, type PostTextLayer } from "./types";

export const textColorPalette = [
    { name: "White", value: "#FFFFFF" }, { name: "Ivory", value: "#F4EAD8" },
    { name: "Silver", value: "#B8BEC8" }, { name: "Ink", value: "#111318" },
    { name: "Leaders red", value: brand.red }, { name: "Coral", value: "#FF8075" },
    { name: "Gold", value: "#E9BD68" }, { name: "Mint", value: "#86D5B0" },
    { name: "Sky", value: "#90C9F4" }, { name: "Lavender", value: "#C4ACED" },
] as const;

export function normalizeTextColor(value: string): string | null {
    const hex = value.trim().replace(/^#/, "");
    if (/^[\da-f]{3}$/i.test(hex)) return `#${hex.split("").map(char => char + char).join("").toUpperCase()}`;
    return /^[\da-f]{6}$/i.test(hex) ? `#${hex.toUpperCase()}` : null;
}
export function setTextColor(design: PostDesign, layer: PostTextLayer, value: string | null): PostDesign {
    if (design.lockedLayers.includes(layer)) return design;
    const color = value === null ? null : normalizeTextColor(value);
    if (value !== null && color === null) return design;
    return { ...design, textColors: { ...(design.textColors ?? defaultTextColors()), [layer]: color } };
}
export function textColorStyle(design: PostDesign, layer: PostTextLayer) {
    const color = design.textColors?.[layer];
    return color ? { color } : {};
}

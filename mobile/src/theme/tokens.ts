// Canonical values are shared with Tailwind; do not define a second palette.
import system from "./design-system.json";
export const spacing = system.spacing;
export const radius = system.radius;
export const layout = system.layout;
export const motion = system.motion;
export const editorial = system.editorial;
export const brand = system.brand;

// TYPOGRAPHY — The only type contract for product chrome and editorial pages.
// Instrument Sans gives the English product one confident, contemporary voice.
// Its display role uses a tighter, heavier cut; its UI role stays calm and
// readable. Hind remains the complete Nepali family. Do not introduce
// page-local faces or weights that are not loaded in _layout.
export type AppLanguage = "en" | "ne";
export type FontRole = "editorial" | "ui";
export type TextWeight = "regular" | "medium" | "semibold" | "bold" | "black";

export const fontFamilies = { editorial: system.editorialFonts, ui: system.fonts } as const;

type TypeToken = { size: number; lineHeight: number; tracking: number; role: FontRole; weight: TextWeight };
export const typography = system.typography as { [K in keyof typeof system.typography]: TypeToken };
export type TypographyVariant = keyof typeof typography;
export const readerTypography = system.readerTypography;
export function fontFor(language: AppLanguage, role: FontRole, weight: TextWeight) {
    return fontFamilies[role][language][weight];
}
export function textStyleFor(variant: TypographyVariant, language: AppLanguage, weight: TextWeight = typography[variant].weight) {
    const token = typography[variant];
    return { fontFamily: fontFor(language, token.role, weight), fontSize: token.size,
        lineHeight: token.lineHeight, letterSpacing: language === "ne" ? 0 : token.tracking };
}
export const type = typography;

function mixColor(hex: string, target: string, amount: number) {
    return "#" + [1, 3, 5].map((offset) => {
        const channel = parseInt(hex.slice(offset, offset + 2), 16);
        const destination = parseInt(target.slice(offset, offset + 2), 16);
        return Math.round(channel + (destination - channel) * amount).toString(16).padStart(2, "0");
    }).join("");
}
export function colorsFor(scheme: "light" | "dark") {
    const palette = system.palettes[scheme];
    const accentRed = scheme === "dark" ? mixColor(brand.red, "#FFFFFF", brand.darkAccentMix) : brand.red;
    return {
        ...palette, brandRed: accentRed, brandRedSoft: mixColor(brand.red, palette.background, 0.9), error: accentRed, destructive: brand.red, primary: brand.red, primaryForeground: palette.textInverse,
        onPrimary: palette.textInverse, brandRedDark: brand.red, breaking: accentRed,
        textMuted: palette.textTertiary, card: palette.surface, cardForeground: palette.textPrimary,
        foreground: palette.textPrimary, muted: palette.surfaceSecondary, mutedForeground: palette.textSecondary,
        input: palette.borderStrong, ring: accentRed, popover: palette.surfaceElevated,
        popoverForeground: palette.textPrimary, destructiveForeground: palette.textInverse,
        accent: palette.surfaceSecondary, accentForeground: palette.textPrimary,
        secondary: palette.surfaceSecondary, secondaryForeground: palette.textPrimary,
    };
}
export type AppColors = ReturnType<typeof colorsFor>;

/** NativeWind consumes RGB channels so opacity utilities work on both platforms. */
export function themeVariables(colors: AppColors) {
    const entries = Object.entries(colors).filter(([, value]) => value.startsWith("#"));
    return Object.fromEntries(entries.map(([key, value]) => {
        const name = key.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase());
        const channels = [1, 3, 5].map((offset) => parseInt(value.slice(offset, offset + 2), 16)).join(" ");
        return ["--" + name, channels];
    }));
}

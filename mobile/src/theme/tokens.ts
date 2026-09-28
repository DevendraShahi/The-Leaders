// ─────────────────────────────────────────────────────────────────
// The Leaders — Mobile Design Token System
// Direction: Modern Mobile Native (Apple News + Substack)
// High contrast · Bold type · Generous touch targets · Alive
// ─────────────────────────────────────────────────────────────────

// SPACING — Mobile-first generous touch targets (min 44pt CTAs)
export const spacing = {
    xs:   4,
    sm:   8,
    md:   14,
    lg:   20,
    xl:   28,
    "2xl": 40,
    "3xl": 56,
    "4xl": 72,
    gutter: 16,   // tighter gutter → more content visible
    card: 16,
} as const;

// RADIUS — Softer than web, feels native
export const radius = {
    xs:   4,
    sm:   8,
    md:   12,
    lg:   16,
    xl:   20,
    card: 14,
    full: 9999,
} as const;

// TYPOGRAPHY SCALE — Deterministic, never guess font sizes
export const type = {
    // Display — Hero headlines
    display:   { size: 34, lineHeight: 40, tracking: -1.0 },
    // Heading — Section titles
    heading1:  { size: 26, lineHeight: 32, tracking: -0.6 },
    heading2:  { size: 21, lineHeight: 27, tracking: -0.4 },
    heading3:  { size: 18, lineHeight: 24, tracking: -0.2 },
    // Body — Article text
    body:      { size: 16, lineHeight: 24, tracking:  0.0 },
    bodySmall: { size: 14, lineHeight: 20, tracking:  0.0 },
    // UI — Labels, buttons, captions
    label:     { size: 13, lineHeight: 18, tracking:  0.1 },
    caption:   { size: 11, lineHeight: 16, tracking:  0.2 },
    // Editorial metadata needs the same compact rhythm as a caption, but a
    // distinct semantic name keeps data labels out of body-copy components.
    meta:      { size: 12, lineHeight: 16, tracking:  0.45 },
    overline:  { size: 10, lineHeight: 14, tracking:  1.2 },
} as const;

// ─── COLOR PALETTES ──────────────────────────────────────────────

export type AppColors = {
    // Surfaces
    background: string;
    surface: string;
    surfaceElevated: string;
    surfaceSecondary: string;

    // Text
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;

    // Borders
    border: string;
    borderStrong: string;

    // Brand
    brandRed: string;
    brandRedSoft: string;

    // Semantic
    success: string;
    warning: string;
    destructive: string;
    error: string;

    // Interactive
    pressedOverlay: string;
    skeleton: string;

    // Legacy aliases
    textMuted: string;
    brandRedDark?: string;
    breaking?: string;
    card: string;
    cardForeground: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    primary: string;
    primaryForeground: string;
    onPrimary: string;
    input: string;
    ring: string;
    popover: string;
    popoverForeground: string;
    destructiveForeground: string;
    accent: string;
    accentForeground: string;
};

export function colorsFor(scheme: "light" | "dark"): AppColors {
    if (scheme === "light") {
        return {
            // Surfaces
            background:       "#FFFFFF",
            surface:          "#FFFFFF",
            surfaceElevated:  "#FFFFFF",
            surfaceSecondary: "#F7F7F8",

            // Text — High contrast first
            textPrimary:   "#0A0A0B",   // near-black, NOT pure black
            textSecondary: "#525252",   // neutral-600
            textTertiary:  "#A3A3A3",   // neutral-400
            textInverse:   "#FFFFFF",

            // Borders — subtle but visible
            border:        "#E5E5E5",   // neutral-200
            borderStrong:  "#D4D4D4",   // neutral-300

            // Brand
            brandRed:      "#D92B2B",   // rich editorial red
            brandRedSoft:  "#FEF2F2",   // red-50

            // Semantic
            success:       "#16A34A",
            warning:       "#D97706",
            destructive:   "#DC2626",
            error:         "#DC2626",

            // Interactive
            pressedOverlay: "rgba(0,0,0,0.06)",
            skeleton:       "#F0F0F0",

            // ── Legacy aliases ──
            textMuted:              "#A3A3A3",
            brandRedDark:           "#B91C1C",
            breaking:               "#D92B2B",
            card:                   "#FFFFFF",
            cardForeground:         "#0A0A0B",
            foreground:             "#0A0A0B",
            muted:                  "#F7F7F8",
            mutedForeground:        "#737373",
            // Primary is an action token, not an ink token. Keeping it red in
            // both schemes gives calls-to-action and selected states one clear
            // civic meaning across the app.
            primary:                "#D92B2B",
            primaryForeground:      "#FFFFFF",
            onPrimary:              "#FFFFFF",
            input:                  "#E5E5E5",
            ring:                   "#0A0A0B",
            popover:                "#FFFFFF",
            popoverForeground:      "#0A0A0B",
            destructiveForeground:  "#FFFFFF",
            accent:                 "#F7F7F8",
            accentForeground:       "#0A0A0B",
        };
    }

    // ── DARK ──────────────────────────────────────────────────────
    return {
        // Surfaces — layered depth, NOT flat black
        background:       "#0C0C0E",   // deepest level
        surface:          "#141416",   // cards, sheets
        surfaceElevated:  "#1C1C1F",   // modals, elevated cards
        surfaceSecondary: "#1C1C1F",   // secondary surfaces

        // Text
        textPrimary:   "#F5F5F5",   // near-white
        textSecondary: "#A3A3A3",   // neutral-400
        textTertiary:  "#6B6B6B",   // neutral-500
        textInverse:   "#0C0C0E",

        // Borders — barely there, just enough structure
        border:        "#252528",   // very subtle
        borderStrong:  "#38383D",

        // Brand — red needs to glow slightly more in dark
        brandRed:      "#FF4545",   // vivid on dark bg
        brandRedSoft:  "#2D1A1A",   // dark red tint bg

        // Semantic
        success:       "#34D399",
        warning:       "#FBBF24",
        destructive:   "#F87171",
        error:         "#F87171",

        // Interactive
        pressedOverlay: "rgba(255,255,255,0.07)",
        skeleton:       "#252528",

        // ── Legacy aliases ──
        textMuted:              "#6B6B6B",
        brandRedDark:           "#EF4444",
        breaking:               "#FF4545",
        card:                   "#141416",
        cardForeground:         "#F5F5F5",
        foreground:             "#F5F5F5",
        muted:                  "#1C1C1F",
        mutedForeground:        "#A3A3A3",
            primary:                "#FF4545",
            primaryForeground:      "#FFFFFF",
            onPrimary:              "#FFFFFF",
        input:                  "#252528",
        ring:                   "#A3A3A3",
        popover:                "#141416",
        popoverForeground:      "#F5F5F5",
        destructiveForeground:  "#F5F5F5",
        accent:                 "#1C1C1F",
        accentForeground:       "#F5F5F5",
    };
}

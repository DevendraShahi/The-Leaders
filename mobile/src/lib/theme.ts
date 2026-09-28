const sharedColors = {
    background: "hsl(220 13% 5%)",
    foreground: "hsl(48 23% 94%)",
    card: "hsl(220 12% 8%)",
    popover: "hsl(220 12% 8%)",
    primary: "hsl(357 73% 48%)",
    secondary: "hsl(220 12% 14%)",
    muted: "hsl(220 10% 17%)",
    accent: "hsl(220 12% 14%)",
    destructive: "hsl(0 72% 51%)",
    border: "hsl(220 9% 23%)",
    input: "hsl(220 9% 23%)",
    ring: "hsl(357 73% 48%)",
    radius: 0,
} as const;

export const EDITOR_THEME = sharedColors;

export const NAV_THEME = {
    light: {
        dark: false,
        colors: {
            primary: sharedColors.primary,
            background: sharedColors.background,
            card: sharedColors.card,
            text: sharedColors.foreground,
            border: sharedColors.border,
            notification: sharedColors.destructive,
        },
    },
    dark: {
        dark: true,
        colors: {
            primary: sharedColors.primary,
            background: sharedColors.background,
            card: sharedColors.card,
            text: sharedColors.foreground,
            border: sharedColors.border,
            notification: sharedColors.destructive,
        },
    },
} as const;

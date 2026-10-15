const system = require("./src/theme/design-system.json");
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            fontFamily: {
                sans: [system.fonts.en.regular, 'sans-serif'],
                medium: [system.fonts.en.medium, 'sans-serif'],
                semibold: [system.fonts.en.semibold, 'sans-serif'],
                bold: [system.fonts.en.bold, 'sans-serif'],
                extrabold: [system.fonts.en.bold, 'sans-serif'],
                serif: [system.editorialFonts.en.regular, 'sans-serif'],
                'serif-bold': [system.editorialFonts.en.bold, 'sans-serif'],
                'serif-black': [system.editorialFonts.en.bold, 'sans-serif'],
                'hind-medium': [system.fonts.ne.regular, 'sans-serif'],
                'hind-semibold': [system.fonts.ne.semibold, 'sans-serif'],
                'hind-bold': [system.fonts.ne.bold, 'sans-serif'],
            },
            colors: {
                border: "rgb(var(--border) / <alpha-value>)",
                input: "rgb(var(--input) / <alpha-value>)",
                ring: "rgb(var(--ring) / <alpha-value>)",
                background: "rgb(var(--background) / <alpha-value>)",
                foreground: "rgb(var(--foreground) / <alpha-value>)",
                surface: {
                    DEFAULT: "rgb(var(--surface) / <alpha-value>)",
                    secondary: "rgb(var(--surface-secondary) / <alpha-value>)",
                },
                primary: {
                    DEFAULT: "rgb(var(--primary) / <alpha-value>)",
                    foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
                },
                secondary: {
                    DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
                    foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
                },
                destructive: {
                    DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
                    foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
                },
                muted: {
                    DEFAULT: "rgb(var(--muted) / <alpha-value>)",
                    foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
                },
                accent: {
                    DEFAULT: "rgb(var(--accent) / <alpha-value>)",
                    foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
                },
                popover: {
                    DEFAULT: "rgb(var(--popover) / <alpha-value>)",
                    foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
                },
                card: {
                    DEFAULT: "rgb(var(--card) / <alpha-value>)",
                    foreground: "rgb(var(--card-foreground) / <alpha-value>)",
                },
                success: {
                    DEFAULT: "rgb(var(--success) / <alpha-value>)",
                },
                "brand-red": {
                    DEFAULT: "rgb(var(--brand-red) / <alpha-value>)",
                    soft: "rgb(var(--brand-red-soft) / <alpha-value>)",
                },
                text: {
                    secondary: "rgb(var(--text-secondary) / <alpha-value>)",
                }
            },
            spacing: {
                gutter: `${system.spacing.gutter}px`, panel: `${system.spacing.card}px`,
                section: `${system.layout.sectionGap}px`, control: `${system.layout.controlHeight}px`,
                touch: `${system.layout.touchTarget}px`, player: `${system.layout.playerControlSize}px`,
            },
            fontSize: {
                xs: [ `${system.typography.caption.size}px`, { lineHeight: `${system.typography.caption.lineHeight}px` } ],
                sm: [ `${system.typography.bodySmall.size}px`, { lineHeight: `${system.typography.bodySmall.lineHeight}px` } ],
                base: [ `${system.typography.body.size}px`, { lineHeight: `${system.typography.body.lineHeight}px` } ],
                lg: [ `${system.typography.heading3.size}px`, { lineHeight: `${system.typography.heading3.lineHeight}px` } ],
                xl: [ `${system.typography.heading2.size}px`, { lineHeight: `${system.typography.heading2.lineHeight}px` } ],
                '2xl': [ `${system.typography.heading1.size}px`, { lineHeight: `${system.typography.heading1.lineHeight}px` } ],
                '3xl': [ `${system.typography.display.size}px`, { lineHeight: `${system.typography.display.lineHeight}px` } ],
            },
            borderRadius: {
                none: "0", DEFAULT: `${system.radius.xs}px`,
                sm: `${system.radius.sm}px`, md: `${system.radius.md}px`,
                lg: `${system.radius.lg}px`, xl: `${system.radius.xl}px`, full: "9999px",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

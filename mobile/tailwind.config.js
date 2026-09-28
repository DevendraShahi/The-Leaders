/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Manrope_400Regular', 'sans-serif'],
                medium: ['Manrope_500Medium', 'sans-serif'],
                semibold: ['Manrope_600SemiBold', 'sans-serif'],
                bold: ['Manrope_700Bold', 'sans-serif'],
                extrabold: ['Manrope_800ExtraBold', 'sans-serif'],
                serif: ['Merriweather_400Regular', 'serif'],
                'serif-bold': ['Merriweather_700Bold', 'serif'],
                'serif-black': ['Merriweather_900Black', 'serif'],
                'hind-medium': ['Hind_500Medium', 'sans-serif'],
                'hind-semibold': ['Hind_600SemiBold', 'sans-serif'],
                'hind-bold': ['Hind_700Bold', 'sans-serif'],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                surface: {
                    DEFAULT: "hsl(var(--surface))",
                    secondary: "hsl(var(--surface-secondary))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                success: {
                    DEFAULT: "hsl(var(--success))",
                },
                "brand-red": {
                    DEFAULT: "hsl(var(--brand-red))",
                    soft: "hsl(var(--brand-red-soft))",
                },
                text: {
                    secondary: "hsl(var(--text-secondary))",
                }
            },
            borderRadius: {
                none: "0",
                sm: "calc(var(--radius) - 4px)",
                md: "calc(var(--radius) - 2px)",
                lg: "var(--radius)",
                xl: "calc(var(--radius) + 4px)",
                full: "9999px",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

import { colorsFor, radius } from "@/theme/tokens";
const dark = colorsFor("dark");
export const EDITOR_THEME = { ...dark, radius: radius.md };
function navigationTheme(scheme: "light" | "dark") {
    const colors = colorsFor(scheme);
    return { dark: scheme === "dark", colors: { primary: colors.primary, background: colors.background, card: colors.surface, text: colors.textPrimary, border: colors.border, notification: colors.brandRed } };
}
export const NAV_THEME = { light: navigationTheme("light"), dark: navigationTheme("dark") };

import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { type as typography, type AppColors } from "@/theme/tokens";
import { useColors } from "@/theme/Theme";
import { useLanguage } from "@/i18n/language";

export type AppTextProps = RNTextProps & {
    variant?: keyof typeof typography;
    colorToken?: keyof AppColors;
    align?: "left" | "center" | "right" | "justify";
    weight?: "regular" | "medium" | "semibold" | "bold" | "black";
};

export function AppText({
    variant = "body",
    colorToken = "textPrimary",
    align = "left",
    weight,
    style,
    ...props
}: AppTextProps) {
    const colors = useColors();
    const { language } = useLanguage();
    
    // Type settings
    const token = typography[variant];
    
    // Font family resolution: editorial hierarchy uses the serif family in
    // English and a weight-aware Hind fallback in Nepali, where the serif does
    // not cover the full Devanagari glyph set.
    let fontFamily = language === "ne" ? "Hind_400Regular" : "Manrope_400Regular";
    const editorial = variant === "display" || variant.startsWith("heading");
    
    if (language !== "ne" && editorial) {
        fontFamily = weight === "black" || variant === "display"
            ? "Merriweather_800ExtraBold"
            : "Merriweather_700Bold";
    } else if (weight === "black") {
        // Hind currently has no 800 face in the app bundle, so Nepali falls
        // back to its strongest loaded weight while English uses Manrope 800.
        fontFamily = language === "ne" ? "Hind_700Bold" : "Manrope_800ExtraBold";
    } else if (weight === "bold" || editorial) {
        fontFamily = language === "ne" ? "Hind_700Bold" : "Manrope_700Bold";
    } else if (weight === "semibold") {
        fontFamily = language === "ne" ? "Hind_600SemiBold" : "Manrope_600SemiBold";
    } else if (weight === "medium") {
        fontFamily = language === "ne" ? "Hind_400Regular" : "Manrope_500Medium"; // Hind doesn't have medium, fallback to regular
    }

    return (
        <RNText
            style={[
                {
                    fontFamily,
                    fontSize: token.size,
                    lineHeight: token.lineHeight,
                    letterSpacing: token.tracking,
                    color: colors[colorToken] as string,
                    textAlign: align,
                },
                style,
            ]}
            {...props}
        />
    );
}

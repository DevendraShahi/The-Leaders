import { Platform, Text as RNText, type TextProps as RNTextProps } from "react-native";
import { textStyleFor, type AppLanguage, type AppColors, type TextWeight, type TypographyVariant } from "@/theme/tokens";
import { useColors } from "@/theme/Theme";
import { useLanguage } from "@/i18n/language";

export type AppTextProps = RNTextProps & {
    variant?: TypographyVariant;
    contentLanguage?: AppLanguage;
    colorToken?: keyof AppColors;
    align?: "left" | "center" | "right" | "justify";
    weight?: TextWeight;
};

export function AppText({
    variant = "body",
    contentLanguage,
    colorToken = "textPrimary",
    align = "left",
    weight,
    style,
    className,
    ...props
}: AppTextProps) {
    const colors = useColors();
    const { language } = useLanguage();
    
    const readingLanguage = contentLanguage ?? language;
    const textStyle = textStyleFor(variant, readingLanguage, weight);

    return (
        <RNText
            accessibilityLanguage={readingLanguage === "ne" ? "ne-NP" : "en"}
            className={[className, Platform.OS === "web" && typographyIsHeadline(variant) ? "text-balance" : ""].filter(Boolean).join(" ")}
            style={[
                {
                    ...textStyle,
                    color: colors[colorToken] as string,
                    textAlign: align,
                },
                style,
            ]}
            {...props}
        />
    );
}

function typographyIsHeadline(variant: TypographyVariant) {
    return variant === "display" || variant === "leadTitle" || variant === "storyTitle" || variant.startsWith("heading") || variant === "pageTitle";
}

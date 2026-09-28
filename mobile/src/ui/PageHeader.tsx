import { Pressable, View } from "react-native";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";
import { radius, spacing } from "@/theme/tokens";

export function PageHeader({ title }: { title: string }) {
    const colors = useColors();
    const { language, toggleLanguage } = useLanguage();
    const nepali = language === "ne";

    return (
        <View
            style={{
                paddingHorizontal: spacing.gutter,
                paddingTop: spacing.xl,
                paddingBottom: spacing.lg,
                flexDirection: "row",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                marginBottom: spacing.lg,
            }}
        >
            <AppText
                variant="body"
                numberOfLines={2}
                style={{
                    flex: 1,
                    color: colors.textPrimary,
                    fontFamily: nepali ? "Hind_600SemiBold" : "Manrope_700Bold",
                    fontSize: nepali ? 28 : 30,
                    lineHeight: nepali ? 40 : 38,
                    letterSpacing: -0.5,
                }}
            >
                {title}
            </AppText>
            <Pressable
                onPress={toggleLanguage}
                accessibilityRole="button"
                accessibilityLabel={pick(ui.language, language)}
                style={({ pressed }) => ({
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs + 2,
                    borderRadius: radius.sm,
                    backgroundColor: pressed ? colors.accent : "transparent",
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginBottom: 2,
                })}
            >
                <AppText
                    variant="meta"
                    style={{
                        color: colors.textPrimary,
                        fontFamily: "Manrope_600SemiBold",
                        fontSize: 12,
                        letterSpacing: 0.3,
                    }}
                >
                    {pick(ui.language, language)}
                </AppText>
            </Pressable>
        </View>
    );
}

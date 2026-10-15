import { type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { AppText } from "@/ui/primitives/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";
import { layout, radius, spacing } from "@/theme/tokens";
import { ArrowLeft } from "lucide-react-native";

export function PageHeader({ title, onBack, backLabel, subtitle, actions, compact = false }: { title: string; onBack?: () => void; backLabel?: string; subtitle?: string; actions?: ReactNode; compact?: boolean }) {
    const colors = useColors();
    const { language, toggleLanguage } = useLanguage();

    return (
        <View
            style={{
                paddingHorizontal: spacing.gutter,
                paddingTop: compact ? spacing.md : spacing.lg,
                paddingBottom: compact ? spacing.md : spacing.lg,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                marginBottom: compact ? 0 : spacing.lg,
            }}
        >
            {onBack ? <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={backLabel ?? (language === "ne" ? "पछाडि" : "Back")} style={{ minWidth: layout.touchTarget, minHeight: layout.touchTarget, alignItems: "center", justifyContent: "center" }}><ArrowLeft size={layout.iconSize} color={colors.textPrimary} /></Pressable> : null}
            <View style={{ flex: 1, minWidth: 0, gap: spacing.xs }}><AppText
                variant="pageTitle"
                style={{
                    color: colors.textPrimary,
                }}
            >
                {title}
            </AppText>
            {subtitle ? <AppText variant="caption" colorToken="textSecondary">{subtitle}</AppText> : null}</View>
            {actions}
            <Pressable
                onPress={toggleLanguage}
                accessibilityRole="button"
                accessibilityLabel={language === "ne" ? "Switch to English" : "नेपालीमा पढ्नुहोस्"}
                style={{
                    paddingHorizontal: spacing.md,
                    minHeight: layout.touchTarget,
                    justifyContent: "center",
                    paddingVertical: spacing.xs,
                    borderRadius: radius.sm,
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginBottom: 2,
                }}
            >
                <AppText
                    variant="meta"
                    weight="semibold"
                    style={{ color: colors.textPrimary }}
                >
                    {pick(ui.language, language)}
                </AppText>
            </Pressable>
        </View>
    );
}

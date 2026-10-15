import { ActivityIndicator, Pressable, View } from "react-native";
import { AppText } from "@/ui/primitives/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";
import { radius, spacing, layout } from "@/theme/tokens";
import { AlertCircle, Inbox, RotateCcw } from "lucide-react-native";

export function StateView({
    loading,
    error,
    empty,
    onRetry,
}: {
    loading?: boolean;
    error?: Error | null;
    empty?: boolean;
    onRetry?: () => void;
}) {
    const colors = useColors();
    const { language } = useLanguage();

    if (loading) {
        return (
            <View style={{ flex: 1, paddingVertical: 80, alignItems: "center", gap: spacing.md }}>
                <ActivityIndicator color={colors.primary} size="small" />
                <AppText
                    variant="meta"
                    style={{ color: colors.mutedForeground }}
                >
                    {pick(ui.loading, language)}
                </AppText>
            </View>
        );
    }

    if (error) {
        return (
            <View
                accessibilityRole="alert"
                style={{
                    marginTop: spacing["3xl"],
                    marginBottom: spacing.xl,
                    padding: spacing.xl,
                    backgroundColor: colors.surfaceSecondary,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.lg,
                    borderTopWidth: 3,
                    borderTopColor: colors.destructive,
                    gap: spacing.md,
                    alignItems: "flex-start",
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                    <AlertCircle size={layout.iconSize} color={colors.destructive} />
                    <AppText
                        variant="uiTitle"
                        style={{ color: colors.textPrimary }}
                    >
                        {pick(ui.errorTitle, language)}
                    </AppText>
                </View>
                <AppText
                    variant="bodySmall"
                    style={{ color: colors.textSecondary }}
                >
                    {error.message}
                </AppText>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                    {pick(ui.errorHint, language)}
                </AppText>
                {onRetry ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={pick(ui.retry, language)}
                        onPress={onRetry}
                        style={({ pressed }) => ({
                            flexDirection: "row",
                            alignItems: "center",
                            gap: spacing.xs,
                            paddingHorizontal: spacing.md,
                            minHeight: layout.touchTarget,
                            borderRadius: radius.md,
                            backgroundColor: pressed ? colors.pressedOverlay : colors.surface,
                            borderWidth: 1,
                            borderColor: colors.border,
                        })}
                    >
                        <RotateCcw size={layout.iconSmall} color={colors.textPrimary} />
                        <AppText
                            variant="meta"
                            weight="semibold"
                            style={{ color: colors.textPrimary }}
                        >
                            {pick(ui.retry, language)}
                        </AppText>
                    </Pressable>
                ) : null}
            </View>
        );
    }

    if (empty) {
        return (
            <View style={{ paddingVertical: 64, alignItems: "center", gap: spacing.lg }}>
                <View
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: radius.md,
                        backgroundColor: colors.muted,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Inbox size={layout.iconLarge} color={colors.mutedForeground} />
                </View>
                <AppText
                    variant="meta"
                    style={{ color: colors.mutedForeground, textAlign: "center" }}
                >
                    {pick(ui.empty, language)}
                </AppText>
            </View>
        );
    }

    return null;
}

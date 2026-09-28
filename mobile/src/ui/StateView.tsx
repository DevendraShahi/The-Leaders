import { ActivityIndicator, Pressable, View } from "react-native";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";
import { radius, spacing } from "@/theme/tokens";
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
                    style={{ color: colors.mutedForeground, fontFamily: "Manrope_500Medium" }}
                >
                    {pick(ui.loading, language)}
                </AppText>
            </View>
        );
    }

    if (error) {
        return (
            <View
                style={{
                    marginVertical: spacing.xl,
                    padding: spacing.xl,
                    backgroundColor: colors.muted,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.lg,
                    gap: spacing.lg,
                    alignItems: "flex-start",
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                    <AlertCircle size={16} color={colors.destructive} />
                    <AppText
                        variant="meta"
                        style={{
                            color: colors.destructive,
                            fontFamily: "Manrope_600SemiBold",
                            fontSize: 13,
                        }}
                    >
                        Something went wrong
                    </AppText>
                </View>
                <AppText
                    variant="meta"
                    style={{ color: colors.mutedForeground, lineHeight: 20 }}
                >
                    {error.message}
                </AppText>
                {onRetry ? (
                    <Pressable
                        onPress={onRetry}
                        style={({ pressed }) => ({
                            flexDirection: "row",
                            alignItems: "center",
                            gap: spacing.xs,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            borderRadius: radius.md,
                            backgroundColor: pressed ? colors.surfaceSecondary : colors.surface,
                            borderWidth: 1,
                            borderColor: colors.border,
                        })}
                    >
                        <RotateCcw size={14} color={colors.textPrimary} />
                        <AppText
                            variant="meta"
                            style={{
                                color: colors.textPrimary,
                                fontFamily: "Manrope_600SemiBold",
                                fontSize: 13,
                            }}
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
                    <Inbox size={24} color={colors.mutedForeground} />
                </View>
                <AppText
                    variant="meta"
                    style={{
                        color: colors.mutedForeground,
                        fontFamily: "Manrope_500Medium",
                        textAlign: "center",
                    }}
                >
                    {pick(ui.empty, language)}
                </AppText>
            </View>
        );
    }

    return null;
}

import { View } from "react-native";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BellRing, ChevronLeft, SlidersHorizontal } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { AppText } from "@/ui/primitives/AppText";
import { useLanguage } from "@/i18n/language";
import { useColors } from "@/theme/Theme";
import { radius, spacing } from "@/theme/tokens";

const COPY = {
    en: {
        eyebrow: "NEWSROOM ALERTS",
        title: "Notifications",
        emptyTitle: "You’re caught up.",
        emptyBody: "Breaking dispatches and your Daily Brief will appear here when they’re ready.",
        settings: "Manage alerts",
        back: "Back",
    },
    ne: {
        eyebrow: "न्यूजरूम सूचना",
        title: "सूचनाहरू",
        emptyTitle: "तपाईं सबै अद्यावधिक हुनुहुन्छ।",
        emptyBody: "ताजा समाचार र दैनिक ब्रीफ तयार भएपछि यहाँ देखिनेछन्।",
        settings: "सूचना व्यवस्थापन",
        back: "पछाडि",
    },
} as const;

export default function NotificationsScreen() {
    const insets = useSafeAreaInsets();
    const { language } = useLanguage();
    const colors = useColors();
    const copy = COPY[language];

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={{ paddingHorizontal: spacing.gutter, paddingTop: spacing.sm }}>
                <Button
                    variant="ghost"
                    size="sm"
                    accessibilityLabel={copy.back}
                    onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
                    className="self-start rounded-lg px-2"
                >
                    <ChevronLeft size={18} color={colors.textPrimary} />
                    <AppText variant="caption" weight="semibold">{copy.back}</AppText>
                </Button>

                <View style={{ marginTop: spacing.xl }}>
                    <AppText variant="overline" weight="bold" colorToken="primary">
                        {copy.eyebrow}
                    </AppText>
                    <AppText variant="heading1" weight="black" style={{ marginTop: spacing.xs }}>
                        {copy.title}
                    </AppText>
                </View>

                <View
                    style={{
                        marginTop: spacing["3xl"],
                        padding: spacing.xl,
                        borderRadius: radius.xl,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.surfaceSecondary,
                        alignItems: "flex-start",
                    }}
                >
                    <View
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: radius.full,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: colors.brandRedSoft,
                        }}
                    >
                        <BellRing size={21} color={colors.brandRed} />
                    </View>
                    <AppText variant="heading3" weight="bold" style={{ marginTop: spacing.lg }}>
                        {copy.emptyTitle}
                    </AppText>
                    <AppText variant="body" colorToken="textSecondary" style={{ marginTop: spacing.sm }}>
                        {copy.emptyBody}
                    </AppText>
                    <Button
                        variant="outline"
                        size="default"
                        accessibilityLabel={copy.settings}
                        onPress={() => router.push("/profile" as never)}
                        className="mt-6 rounded-lg"
                    >
                        <SlidersHorizontal size={16} color={colors.brandRed} />
                        <AppText variant="caption" weight="bold" colorToken="primary">
                            {copy.settings}
                        </AppText>
                    </Button>
                </View>
            </View>
        </View>
    );
}

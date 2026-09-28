import { ScrollView, View, Pressable } from "react-native";
import { router } from "expo-router";
import { type FactCard } from "@/api/client";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";

export function FactCheckCarousel({ items }: { items: FactCard[] }) {
    const colors = useColors();
    const { language } = useLanguage();

    if (items.length === 0) return null;

    return (
        <View style={{ marginVertical: 24 }}>
            <AppText variant="title" style={{ color: colors.textPrimary, marginBottom: 12, paddingHorizontal: 20 }}>
                {pick(ui.factCheck, language) || "Fact Checks"}
            </AppText>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
            >
                {items.map((item) => (
                    <Pressable
                        key={item.slug}
                        onPress={() => router.push(`/fact-check/${item.slug}`)}
                        style={{
                            width: 260,
                            borderRadius: 14,
                            backgroundColor: colors.surfaceSecondary,
                            padding: 16,
                            minHeight: 120,
                        }}
                    >
                        <AppText variant="meta" style={{ color: colors.brandRed, marginBottom: 8 }}>
                            {item.verdict.toUpperCase()}
                        </AppText>
                        <AppText variant="body" style={{ color: colors.textPrimary }} numberOfLines={3}>
                            "{pick(item.claim, language)}"
                        </AppText>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

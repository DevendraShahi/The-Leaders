import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { type FactCard } from "@/api/client";
import { AppText } from "@/ui/primitives/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";

export function FactCheckSection({ items }: { items: FactCard[] }) {
    const colors = useColors();
    const { language } = useLanguage();

    if (items.length === 0) return null;

    return (
        <View className="px-gutter pt-6">
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <View className="flex-row items-center gap-2 pb-2 pt-4">
                <View className="h-3.5 w-1 bg-primary" />
                <AppText variant="overline" weight="bold" colorToken="textPrimary" style={{ textTransform: "uppercase" }}>
                    {pick(ui.factCheck, language) || "Fact Checks"}
                </AppText>
            </View>
            {items.slice(0, 3).map((item, index) => {
                    const verdictColor = item.verdict === "true"
                        ? "success"
                        : item.verdict === "false"
                            ? "destructive"
                            : "warning";

                    return (
                        <View key={item.slug}>
                            {index > 0 ? <View style={{ height: 1, backgroundColor: colors.border }} /> : null}
                            <Pressable
                                onPress={() => router.push(`/fact-check/${item.slug}`)}
                                accessibilityRole="button"
                                accessibilityLabel={`${pick(ui.factCheck, language) || "Fact check"}: ${pick(item.claim, language)}`}
                                className="flex-row items-start gap-4 py-3 active:opacity-75"
                            >
                                <View className="min-w-0 flex-1">
                                    <AppText variant="overline" weight="bold" colorToken={verdictColor} style={{ textTransform: "uppercase" }}>
                                        {item.verdict}
                                    </AppText>
                                    <AppText variant="heading3" weight="bold" numberOfLines={3} style={{ marginTop: 4 }}>
                                        {pick(item.claim, language)}
                                    </AppText>
                                    {pick(item.claimBy, language) ? (
                                        <AppText variant="meta" colorToken="textSecondary" numberOfLines={1} style={{ marginTop: 6 }}>
                                            {pick(item.claimBy, language)}
                                        </AppText>
                                    ) : null}
                                </View>
                                {item.image ? (
                                    <Image
                                        source={{ uri: item.image }}
                                        recyclingKey={item.slug}
                                        contentFit="cover"
                                        style={{ width: 112, height: 80, borderRadius: 4 }}
                                    />
                                ) : null}
                            </Pressable>
                        </View>
                    );
                })}
        </View>
    );
}

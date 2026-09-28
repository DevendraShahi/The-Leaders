import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { apiGet, type PartyCard } from "@/api/client";
import { StateView } from "@/ui/StateView";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";

export default function PartiesScreen() {
    const colors = useColors();
    const { language } = useLanguage();
    const query = useQuery({
        queryKey: ["parties", language],
        queryFn: () => apiGet<{ items: PartyCard[] }>("/api/v1/parties"),
    });

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack.Screen options={{ title: pick(ui.parties, language) }} />
            <FlashList
                data={query.data?.items || []}
                contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
                keyExtractor={(item) => item.id}
                getItemType={() => "party"}
                ListEmptyComponent={<StateView loading={query.isLoading} error={query.error} empty={!query.isLoading && !query.error} onRetry={() => query.refetch()} />}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: "row", gap: 16, paddingVertical: 16, minHeight: 48, borderBottomWidth: 1, borderColor: colors.border, alignItems: "center" }}>
                        {item.logo ? (
                            <Image source={{ uri: item.logo }} recyclingKey={item.id} style={{ width: 48, height: 48 }} contentFit="contain" />
                        ) : null}
                        <View style={{ flex: 1 }}>
                            <AppText variant="body" style={{ color: colors.foreground }}>{pick(item.name, language)}</AppText>
                            <AppText variant="meta" style={{ color: colors.muted }}>{item.leader} · {item.seats}</AppText>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

import { useState } from "react";
import { Pressable, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { apiGet, type Bilingual, type HistoryEpisode, type HistoryEra } from "@/api/client";
import { PageHeader } from "@/ui/PageHeader";
import { StateView } from "@/ui/StateView";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";

type HistoryRecord = {
    id: string;
    title: Bilingual;
    content: Bilingual;
    date: string;
    image: string;
};

type HistoryPayload = { eras: HistoryEra[]; records: HistoryRecord[] };

export default function HistoryScreen() {
    const colors = useColors();
    const { language } = useLanguage();
    const query = useQuery({
        queryKey: ["history", language],
        queryFn: () => apiGet<HistoryPayload>("/api/v1/history"),
    });
    const [eraId, setEraId] = useState<string | null>(null);
    const eras = query.data?.eras || [];
    const active = eras.find((era) => era.id === eraId) || eras[0];

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <FlashList
                data={active?.episodes || []}
                contentContainerStyle={{ padding: 20 }}
                keyExtractor={(item) => item.id}
                getItemType={() => "episode"}
                ListHeaderComponent={
                    <View>
                        <PageHeader title={pick(ui.history, language)} />
                        {query.isLoading || query.error ? (
                            <StateView loading={query.isLoading} error={query.error} onRetry={() => query.refetch()} />
                        ) : (
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                                {eras.map((era) => {
                                    const selected = era.id === active?.id;
                                    return (
                                        <Pressable
                                            key={era.id}
                                            onPress={() => setEraId(era.id)}
                                            style={{
                                                minHeight: 48,
                                                justifyContent: "center",
                                                paddingHorizontal: 12,
                                                borderWidth: 1,
                                                borderColor: selected ? colors.primary : colors.border,
                                                backgroundColor: selected ? colors.primary : "transparent",
                                            }}
                                        >
                                            <AppText variant="meta" style={{ color: selected ? colors.onPrimary : colors.foreground }}>
                                                {pick(era.title, language)}
                                            </AppText>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        )}
                        {active ? (
                            <AppText variant="body" style={{ color: colors.muted, marginBottom: 16 }}>
                                {pick(active.period, language)}
                            </AppText>
                        ) : null}
                    </View>
                }
                ListFooterComponent={
                    <View style={{ marginTop: 24 }}>
                        {(query.data?.records || []).map((record) => (
                            <Pressable
                                key={record.id}
                                onPress={() => router.push(`/history/${record.id}`)}
                                style={{ borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 16, minHeight: 48 }}
                            >
                                <AppText variant="meta" style={{ color: colors.primary }}>{record.date.slice(0, 10)}</AppText>
                                <AppText variant="title" style={{ color: colors.foreground, marginTop: 6 }}>
                                    {pick(record.title, language)}
                                </AppText>
                            </Pressable>
                        ))}
                    </View>
                }
                renderItem={({ item }: { item: HistoryEpisode }) => (
                    <Pressable
                        onPress={() => router.push(`/history/${item.id}`)}
                        style={{ borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 16, minHeight: 48 }}
                    >
                        <AppText variant="meta" style={{ color: colors.primary }}>{item.year}</AppText>
                        <AppText variant="title" style={{ color: colors.foreground, marginTop: 6 }}>
                            {pick(item.title, language)}
                        </AppText>
                    </Pressable>
                )}
            />
        </View>
    );
}

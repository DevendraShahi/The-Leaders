import { useState } from "react";
import { TextInput, View, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Button } from "@/components/ui/button";
import { Image } from "expo-image";
import { Stack, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { apiGet, type CandidateCard, type CandidatePage } from "@/api/client";
import { StateView } from "@/ui/StateView";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";

export default function CandidatesScreen() {
    const colors = useColors();
    const { language } = useLanguage();
    const [text, setText] = useState("");
    const [queryText, setQueryText] = useState("");
    const [party, setParty] = useState("");
    const query = useQuery({
        queryKey: ["candidates", language, queryText, party],
        queryFn: () => {
            const params = new URLSearchParams({ limit: "30", page: "1" });
            if (queryText.trim()) params.set("q", queryText.trim());
            if (party) params.set("party", party);
            return apiGet<CandidatePage>(`/api/v1/candidates?${params.toString()}`);
        },
    });

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack.Screen options={{ title: pick(ui.candidates, language) }} />
            <FlashList
                data={query.data?.items || []}
                contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
                keyExtractor={(item) => item.slug}
                getItemType={() => "candidate"}
                ListHeaderComponent={
                    <View style={{ gap: 12, marginBottom: 12 }}>
                        <TextInput
                            value={text}
                            onChangeText={setText}
                            onSubmitEditing={() => setQueryText(text)}
                            placeholder={pick(ui.searchPrompt, language)}
                            placeholderTextColor={colors.muted}
                            style={{ minHeight: 48, borderWidth: 1, borderColor: colors.border, color: colors.foreground, paddingHorizontal: 12, fontSize: 16 }}
                        />
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                            <PartyChip label={pick(ui.all, language)} active={!party} onPress={() => setParty("")} />
                            {(query.data?.parties || []).slice(0, 8).map((name) => (
                                <PartyChip key={name} label={name} active={party === name} onPress={() => setParty(name)} />
                            ))}
                        </View>
                        {query.isLoading ? <StateView loading /> : null}
                        {query.error ? <StateView error={query.error} onRetry={() => query.refetch()} /> : null}
                    </View>
                }
                renderItem={({ item }: { item: CandidateCard }) => (
                    <Pressable
                        onPress={() => router.push(`/candidate/${item.slug}`)}
                        style={{ flexDirection: "row", gap: 16, paddingVertical: 16, borderBottomWidth: 1, borderColor: colors.border, minHeight: 48, alignItems: "center" }}
                    >
                        {item.image ? (
                            <Image source={{ uri: item.image }} recyclingKey={item.slug} style={{ width: 48, height: 48 }} contentFit="cover" />
                        ) : null}
                        <View style={{ flex: 1, justifyContent: "center" }}>
                            <AppText variant="body" style={{ color: colors.foreground }}>{item.name}</AppText>
                            <AppText variant="meta" style={{ color: colors.muted }}>{item.party} · {item.district}</AppText>
                        </View>
                    </Pressable>
                )}
            />
        </View>
    );
}

function PartyChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
    const colors = useColors();
    return (
        <Button
            variant={active ? "default" : "outline"}
            size="sm"
            onPress={onPress}
        >
            <AppText variant="meta" style={{ color: active ? colors.onPrimary : colors.foreground }}>{label}</AppText>
        </Button>
    );
}

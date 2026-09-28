import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Button } from "@/components/ui/button";
import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useQuery } from "@tanstack/react-query";
import { apiGet, type ManifestoCard } from "@/api/client";
import { StateView } from "@/ui/StateView";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";

export default function ManifestosScreen() {
    const colors = useColors();
    const { language } = useLanguage();
    const query = useQuery({
        queryKey: ["manifestos", language],
        queryFn: () => apiGet<{ items: ManifestoCard[] }>("/api/v1/manifestos"),
    });

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack.Screen options={{ title: pick(ui.manifestos, language) }} />
            <FlashList
                data={query.data?.items || []}
                contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
                keyExtractor={(item) => item.slug}
                getItemType={() => "manifesto"}
                ListEmptyComponent={<StateView loading={query.isLoading} error={query.error} empty={!query.isLoading && !query.error} onRetry={() => query.refetch()} />}
                renderItem={({ item }) => (
                    <View style={{ borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16, gap: 8 }}>
                        <AppText variant="title" style={{ color: colors.foreground }}>{pick(item.partyName, language)}</AppText>
                        <AppText variant="body" style={{ color: colors.muted }}>{pick(item.blurb, language)}</AppText>
                        <AppText variant="meta" style={{ color: colors.muted }}>{item.year} · {item.fileSizeLabel}</AppText>
                        <Button
                            onPress={() => WebBrowser.openBrowserAsync(item.fileUrl)}
                        >
                            <AppText variant="meta" style={{ color: colors.onPrimary, textAlign: "center" }}>{pick(ui.openPdf, language)}</AppText>
                        </Button>
                    </View>
                )}
            />
        </View>
    );
}

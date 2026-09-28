import { View } from "react-native";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { apiGet, type CandidateCard } from "@/api/client";
import { StateView } from "@/ui/StateView";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";

type CandidateDetail = CandidateCard & { qualification: string; experience: string };

export default function CandidateScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const colors = useColors();
    const { language } = useLanguage();
    const query = useQuery({
        queryKey: ["candidate", language, slug],
        enabled: Boolean(slug),
        queryFn: () => apiGet<CandidateDetail>(`/api/v1/candidates/${slug}`),
    });

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48, gap: 16 }}>
            <Stack.Screen options={{ title: pick(ui.candidates, language) }} />
            {query.isLoading ? <StateView loading /> : null}
            {query.error || (!query.isLoading && !query.data) ? <StateView error={query.error || new Error("Missing")} onRetry={() => query.refetch()} /> : null}
            {query.data ? (
                <View style={{ gap: 12 }}>
                    {query.data.image ? (
                        <Image source={{ uri: query.data.image }} recyclingKey={query.data.slug} style={{ width: 120, height: 120 }} contentFit="cover" />
                    ) : null}
                    <AppText variant="display" style={{ color: colors.foreground }}>{query.data.name}</AppText>
                    <AppText variant="body" style={{ color: colors.muted }}>
                        {query.data.party} · {query.data.district} {query.data.constituency}
                    </AppText>
                    {query.data.qualification ? <AppText variant="body" style={{ color: colors.foreground }}>{query.data.qualification}</AppText> : null}
                    {query.data.experience ? <AppText variant="body" style={{ color: colors.foreground }}>{query.data.experience}</AppText> : null}
                </View>
            ) : null}
        </View>
    );
}

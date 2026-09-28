import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { apiGet, type FactDetail } from "@/api/client";
import { DocumentScreen } from "@/ui/DocumentScreen";
import { StateView } from "@/ui/StateView";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";

export default function FactCheckScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const colors = useColors();
    const { language } = useLanguage();
    const query = useQuery({
        queryKey: ["fact-check", language, slug],
        enabled: Boolean(slug),
        queryFn: () => apiGet<FactDetail>(`/api/v1/fact-checks/${slug}`),
    });

    if (query.isLoading) return <View style={{ flex: 1, backgroundColor: colors.background }}><StateView loading /></View>;
    if (query.error || !query.data) {
        return <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 }}><StateView error={query.error || new Error("Missing")} onRetry={() => query.refetch()} /></View>;
    }

    const fact = query.data;
    return (
        <DocumentScreen
            kicker={fact.verdict}
            title={pick(fact.claim, language)}
            body={pick(fact.analysis, language)}
            englishBody={fact.analysis.en}
            footer={
                <View style={{ marginTop: 24, gap: 8 }}>
                    <AppText variant="meta" style={{ color: colors.muted }}>{pick(fact.claimBy, language)}</AppText>
                    {fact.sources.map((source) => (
                        <AppText key={source} variant="meta" style={{ color: colors.foreground }}>{source}</AppText>
                    ))}
                </View>
            }
        />
    );
}

import { View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { apiGet, type LeaderDetail } from "@/api/client";
import { DocumentScreen } from "@/ui/DocumentScreen";
import { StateView } from "@/ui/StateView";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";

export default function LeaderScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const colors = useColors();
    const { language } = useLanguage();
    const query = useQuery({
        queryKey: ["leader", language, slug],
        enabled: Boolean(slug),
        queryFn: () => apiGet<LeaderDetail>(`/api/v1/leaders/${slug}`),
    });

    if (query.isLoading) return <View style={{ flex: 1, backgroundColor: colors.background }}><StateView loading /></View>;
    if (query.error || !query.data) {
        return <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 }}><StateView error={query.error || new Error("Missing")} onRetry={() => query.refetch()} /></View>;
    }

    const leader = query.data;
    return (
        <DocumentScreen
            kicker={pick(leader.position, language)}
            title={pick(leader.name, language)}
            body={pick(leader.bio, language) || pick(leader.desc, language)}
            englishBody={leader.bio.en || leader.desc.en}
            footer={
                <View style={{ marginTop: 32, gap: 16 }}>
                    {leader.image ? (
                        <Image
                            source={{ uri: leader.image }}
                            recyclingKey={leader.slug}
                            contentFit="cover"
                            style={{ width: 160, height: 200 }}
                        />
                    ) : null}
                    <AppText variant="meta" style={{ color: colors.muted }}>
                        {pick(leader.party, language)} · {pick(leader.years, language)}
                    </AppText>
                    {leader.timeline.map((event) => (
                        <View key={`${event.year}-${event.event.en}`} style={{ borderLeftWidth: 2, borderColor: colors.primary, paddingLeft: 12, gap: 4 }}>
                            <AppText variant="meta" style={{ color: colors.primary }}>{event.year}</AppText>
                            <AppText variant="body" style={{ color: colors.foreground }}>{pick(event.event, language)}</AppText>
                        </View>
                    ))}
                </View>
            }
        />
    );
}

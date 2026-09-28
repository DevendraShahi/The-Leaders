import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { apiGet, type Bilingual, type HistoryEpisode } from "@/api/client";
import { DocumentScreen } from "@/ui/DocumentScreen";
import { StateView } from "@/ui/StateView";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";

type EpisodeDetail = HistoryEpisode & {
    eraTitle: Bilingual;
    period: Bilingual;
};

export default function HistoryEpisodeScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colors = useColors();
    const { language } = useLanguage();
    const query = useQuery({
        queryKey: ["history-episode", language, id],
        enabled: Boolean(id),
        queryFn: () => apiGet<EpisodeDetail>(`/api/v1/history/${id}`),
    });

    if (query.isLoading) return <View style={{ flex: 1, backgroundColor: colors.background }}><StateView loading /></View>;
    if (query.error || !query.data) {
        return <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 }}><StateView error={query.error || new Error("Missing")} onRetry={() => query.refetch()} /></View>;
    }

    const episode = query.data;
    return (
        <DocumentScreen
            kicker={`${episode.year} · ${pick(episode.eraTitle, language)}`}
            title={pick(episode.title, language)}
            body={pick(episode.description, language)}
            englishBody={episode.description.en}
        />
    );
}

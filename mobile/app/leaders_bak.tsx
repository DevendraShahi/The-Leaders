import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { apiGet, type LeaderCard, type Page } from "@/api/client";
import { PageHeader } from "@/ui/PageHeader";
import { StateView } from "@/ui/StateView";
import { StoryCard } from "@/ui/StoryCard";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";

export default function LeadersScreen() {
    const colors = useColors();
    const { language } = useLanguage();
    const query = useQuery({
        queryKey: ["leaders", language],
        queryFn: () => apiGet<Page<LeaderCard>>("/api/v1/leaders?limit=50"),
    });

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <FlashList
                data={query.data?.items || []}
                contentContainerStyle={{ padding: 20 }}
                keyExtractor={(item) => item.slug}
                getItemType={() => "leader"}
                ListHeaderComponent={<PageHeader title={pick(ui.leaders, language)} />}
                ListEmptyComponent={<StateView loading={query.isLoading} error={query.error} empty={!query.isLoading && !query.error} onRetry={() => query.refetch()} />}
                renderItem={({ item }) => (
                    <StoryCard
                        recyclingKey={item.slug}
                        kicker={pick(item.position, language)}
                        title={pick(item.name, language)}
                        summary={pick(item.desc, language) || pick(item.party, language)}
                        image={item.image}
                        onPress={() => router.push(`/leader/${item.slug}`)}
                    />
                )}
            />
        </View>
    );
}

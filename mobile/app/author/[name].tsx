import { View, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router, useLocalSearchParams } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { apiGet, type ArticleCard, type Page } from "@/api/client";
import { ArticleRow } from "@/ui/ArticleRow";
import { AppText } from "@/ui/AppText";
import { StateView } from "@/ui/StateView";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";
import { spacing } from "@/theme/tokens";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function whenLabel(iso: string, language: "en" | "ne") {
    const then = Date.parse(iso);
    if (Number.isNaN(then)) return "";
    const minutes = Math.max(1, Math.round((Date.now() - then) / 60000));
    if (minutes < 60) return language === "ne" ? `${minutes} मिनेट अघि` : `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 36) return language === "ne" ? `${hours} घण्टा अघि` : `${hours} hr ago`;
    const date = new Date(then);
    return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export default function AuthorScreen() {
    const { name } = useLocalSearchParams<{ name: string }>();
    const authorName = decodeURIComponent(name || "");
    const colors = useColors();
    const { language } = useLanguage();
    
    const query = useInfiniteQuery({
        queryKey: ["articles", "author", authorName],
        enabled: Boolean(authorName),
        initialPageParam: 1,
        queryFn: ({ pageParam }) => apiGet<Page<ArticleCard>>(`/api/v1/articles?page=${pageParam}&limit=20&author=${encodeURIComponent(authorName)}`),
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    });

    const articles = query.data?.pages.flatMap((page) => page.items) ?? [];

    const renderHeader = () => (
        <View style={{ marginBottom: spacing["3xl"] }}>
            <View style={{ alignItems: "center", marginBottom: spacing.xl }}>
                <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surfaceSecondary, overflow: "hidden", marginBottom: spacing.md }}>
                    <Image
                        source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random&size=200` }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                    />
                </View>
                <AppText variant="title" style={{ color: colors.textPrimary, textAlign: "center" }}>
                    {authorName}
                </AppText>
                <AppText variant="meta" style={{ color: colors.brandRed, marginTop: spacing.xs, textAlign: "center" }}>
                    {language === "ne" ? "लेखक / सम्पादक" : "Author / Editor"}
                </AppText>
            </View>
            
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.md }} />
            
            <AppText variant="meta" style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
                {language === "ne" ? "पछिल्ला लेखहरू" : "LATEST ARTICLES"}
            </AppText>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {query.isLoading ? <View style={{ padding: 20 }}><StateView loading /></View> : null}
            {query.error ? (
                <View style={{ padding: 20 }}>
                    <StateView error={query.error} onRetry={() => query.refetch()} />
                </View>
            ) : null}
            {!query.isLoading && !query.error ? (
                <FlashList
                    data={articles}
                    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                    keyExtractor={(item) => `${item.source}-${item.slug}`}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={<StateView empty />}
                    onEndReached={() => {
                        if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
                    }}
                    renderItem={({ item }) => (
                        <ArticleRow
                            recyclingKey={`${item.source}-${item.slug}`}
                            kicker={pick(item.category, language)}
                            title={pick(item.title, language)}
                            meta={whenLabel(item.publishedAt, language)}
                            image={item.image}
                            onPress={() => router.push(`/article/${item.slug}` as never)}
                        />
                    )}
                />
            ) : null}
        </View>
    );
}

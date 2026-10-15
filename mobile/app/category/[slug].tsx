import { spacing } from "@/theme/tokens";
import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router, useLocalSearchParams } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { apiGet, type ArticleCard, type Page } from "@/api/client";
import { ArticleRow } from "@/ui/ArticleRow";
import { PageHeader } from "@/ui/PageHeader";
import { AppText } from "@/ui/AppText";
import { StateView } from "@/ui/StateView";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";

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

export default function CategoryScreen() {
    const { slug, ne } = useLocalSearchParams<{ slug: string; ne?: string }>();
    const name = decodeURIComponent(slug || "");
    const nepali = decodeURIComponent(typeof ne === "string" ? ne : name);
    const colors = useColors();
    const { language } = useLanguage();
    const query = useInfiniteQuery({
        queryKey: ["articles", "category", name],
        enabled: Boolean(name),
        initialPageParam: 1,
        queryFn: ({ pageParam }) => apiGet<Page<ArticleCard>>(`/api/v1/articles?page=${pageParam}&limit=20&category=${encodeURIComponent(name)}`),
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    });

    const articles = query.data?.pages.flatMap((page) => page.items) ?? [];
    const title = language === "ne" ? nepali || name : name;
    
    // Separate the first article as the lead story
    const leadArticle = articles.length > 0 ? articles[0] : null;
    const remainingArticles = articles.length > 1 ? articles.slice(1) : [];

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
                    data={remainingArticles}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    keyExtractor={(item) => `${item.source}-${item.slug}`}
                    ListHeaderComponent={
                        <View style={{ paddingHorizontal: spacing.gutter, paddingTop: 20 }}>
                            <PageHeader title={title} />
                            
                            {leadArticle && (
                                <View style={{ marginBottom: 32 }}>
                                    <View style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: colors.surfaceSecondary, marginBottom: 16, overflow: "hidden" }}>
                                        {leadArticle.image && (
                                            <Image
                                                source={{ uri: leadArticle.image }}
                                                style={{ width: "100%", height: "100%" }}
                                                contentFit="cover"
                                            />
                                        )}
                                    </View>
                                    <AppText variant="title" weight="semibold" style={{ color: colors.textPrimary, marginBottom: 8 }} onPress={() => router.push(`/article/${leadArticle.slug}` as never)}>
                                        {pick(leadArticle.title, language)}
                                    </AppText>
                                    <AppText variant="meta" style={{ color: colors.textMuted }}>
                                        {whenLabel(leadArticle.publishedAt, language)}
                                    </AppText>
                                </View>
                            )}
                            
                            {remainingArticles.length > 0 && (
                                <View style={{ marginBottom: 16 }}>
                                    <AppText variant="meta" style={{ color: colors.textSecondary }}>
                                        {language === "ne" ? `पछिल्ला ${title}` : `Latest ${title}`}
                                    </AppText>
                                </View>
                            )}
                        </View>
                    }
                    ListEmptyComponent={<StateView empty />}
                    onEndReached={() => {
                        if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
                    }}
                    renderItem={({ item }) => (
                        <View style={{ paddingHorizontal: spacing.gutter }}>
                            <ArticleRow
                                recyclingKey={`${item.source}-${item.slug}`}
                                kicker={pick(item.category, language)}
                                title={pick(item.title, language)}
                                meta={whenLabel(item.publishedAt, language)}
                                image={item.image}
                                onPress={() => router.push(`/article/${item.slug}` as never)}
                            />
                        </View>
                    )}
                />
            ) : null}
        </View>
    );
}

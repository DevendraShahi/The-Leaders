import { layout, spacing } from "@/theme/tokens";
import { isRecentBreaking } from "@/utils/editorial";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, RefreshControl, Share, StyleSheet, View } from "react-native";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { router } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiGet, type ArticleCard, type Page } from "@/api/client";
import { StateView } from "@/ui/StateView";
import { PageHeader } from "@/ui/PageHeader";
import { TopicTabs } from "@/ui/TopicTabs";
import { TimelineRow } from "@/ui/TimelineRow";
import { articleWebUrl } from "@/ui/ArticleReader";
import { AppText } from "@/ui/primitives/AppText";
import { Button } from "@/components/ui/button";
import { pick, useLanguage } from "@/i18n/language";
import { Radio, RefreshCw } from "lucide-react-native";
import { toggleBookmark } from "@/services/bookmarks";
import { useColors } from "@/theme/Theme";
import { useAppStore } from "@/state/useAppStore";

const CATEGORY_KEYS = ["all", "nepal", "politics", "economy", "world", "sports", "tech"];
const CATEGORIES = {
    en: ["All", "Nepal", "Politics", "Economy", "World", "Sports", "Tech"],
    ne: ["सबै", "नेपाल", "राजनीति", "अर्थतन्त्र", "विश्व", "खेलकुद", "प्रविधि"],
};

function shareArticle(item: ArticleCard, headline: string) {
    const url = articleWebUrl(item);
    void Share.share(Platform.OS === "ios" ? { message: headline, url } : { message: `${headline}\n${url}` }).catch(() => undefined);
}

export default function LatestScreen() {
    const colors = useColors();
    const { language } = useLanguage();
    const isNe = language === "ne";
    const [category, setCategory] = useState("all");
    const [now, setNow] = useState(() => Date.now());
    const savedArticleIds = useAppStore(state => state.savedArticleIds);
    const list = useRef<FlashListRef<ArticleCard>>(null);
    const query = useInfiniteQuery({
        queryKey: ["latest", language, category],
        queryFn: ({ pageParam = 1 }) => apiGet<Page<ArticleCard>>(`/api/v1/articles?page=${pageParam}${category === "all" ? "" : `&category=${category}`}`),
        getNextPageParam: lastPage => lastPage.hasMore ? lastPage.page + 1 : undefined,
        initialPageParam: 1,
    });
    const articles = useMemo(() => [...new Map((query.data?.pages.flatMap(page => page.items) ?? []).map(item => [`${item.source}-${item.slug}`, item])).values()], [query.data]);
    const topics = useMemo(() => CATEGORY_KEYS.map((key, index) => ({ key, label: CATEGORIES[language][index] })), [language]);
    const total = query.data?.pages[0]?.total;
    const refreshing = query.isRefetching && !query.isFetchingNextPage;
    const selectCategory = useCallback((key: string) => {
        setCategory(key);
        list.current?.scrollToOffset({ offset: 0, animated: false });
    }, []);
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(id);
    }, []);

    return <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <PageHeader compact title={isNe ? "ताजा समाचार" : "Latest"} subtitle={isNe ? "नयाँ समाचार पहिले" : "Newest stories first"}
            actions={<Button variant="ghost" size="icon" accessibilityLabel={isNe ? "रेडियो सुन्नुहोस्" : "Listen to radio"} onPress={() => router.push("/radio")}><Radio size={layout.iconSize} color={colors.textPrimary} /></Button>} />
        <TopicTabs items={topics} selected={category} onSelect={selectCategory} />
        <View style={styles.feedHeading}>
            <View style={styles.feedLabel}>
                <AppText variant="overline" colorToken="textSecondary">{category === "all" ? (isNe ? "सबै समाचार" : "All stories") : topics.find(topic => topic.key === category)?.label}</AppText>
                {total !== undefined ? <AppText variant="caption" colorToken="textTertiary">{isNe ? `${total} समाचार` : `${total} ${total === 1 ? "story" : "stories"}`}</AppText> : null}
            </View>
            <Button variant="ghost" size="icon" disabled={query.isFetching} accessibilityLabel={isNe ? "समाचार रिफ्रेस गर्नुहोस्" : "Refresh stories"} onPress={() => { void query.refetch(); }}>
                {refreshing ? <ActivityIndicator size="small" color={colors.brandRed} /> : <RefreshCw size={layout.iconSmall} color={colors.textSecondary} />}
            </Button>
        </View>
        <FlashList ref={list} data={articles} contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void query.refetch(); }} tintColor={colors.brandRed} colors={[colors.brandRed]} />}
            keyExtractor={item => `${item.source}-${item.slug}`}
            ListHeaderComponent={query.error && articles.length && !query.isFetchNextPageError ? <StateView error={query.error} onRetry={() => { void query.refetch(); }} /> : null}
            ListEmptyComponent={query.isPending ? <StateView loading /> : query.error ? <StateView error={query.error} onRetry={() => { void query.refetch(); }} /> : <View style={styles.empty}>
                <AppText variant="uiTitle" align="center">{isNe ? "यस विषयमा समाचार छैन" : "No stories in this topic yet"}</AppText>
                <AppText variant="bodySmall" colorToken="textSecondary" align="center">{isNe ? "अर्को विषय छान्नुहोस् वा सबै समाचार पढ्नुहोस्।" : "Choose another topic or browse all stories."}</AppText>
                {category !== "all" ? <Button variant="secondary" onPress={() => selectCategory("all")}><AppText variant="label">{isNe ? "सबै समाचार" : "View all stories"}</AppText></Button> : null}
            </View>}
            ListFooterComponent={<View style={styles.footer}>
                {query.isFetchingNextPage ? <ActivityIndicator color={colors.brandRed} /> : query.hasNextPage ? <Button variant="secondary" onPress={() => { void query.fetchNextPage(); }}><AppText variant="label">{query.isFetchNextPageError ? (isNe ? "फेरि प्रयास गर्नुहोस्" : "Retry loading more") : (isNe ? "थप समाचार" : "Load more stories")}</AppText></Button> : articles.length ? <AppText variant="caption" colorToken="textTertiary" align="center">{isNe ? "सबै समाचार देखाइएको छ" : "You've reached the end"}</AppText> : null}
            </View>}
            onEndReached={() => { if (query.hasNextPage && !query.isFetching && !query.isFetchNextPageError) void query.fetchNextPage(); }} onEndReachedThreshold={0.5}
            renderItem={({ item }) => {
                const headline = pick(item.title, language);
                const saved = savedArticleIds.includes(item.slug);
                const isFlash = Boolean(item.tags?.some(tag => ["flash", "breaking"].includes(tag.toLowerCase()))) && isRecentBreaking(item.publishedAt, now);
                return <TimelineRow recyclingKey={`${item.source}-${item.slug}`} category={pick(item.category, language)}
                    title={headline} image={item.image} publishedAt={item.publishedAt} readingMinutes={item.readingMinutes?.[language]} now={now}
                    isFlash={isFlash} saved={saved} flashLabel={isNe ? "ब्रेकिङ" : "Breaking"}
                    bookmarkLabel={saved ? (isNe ? "सुरक्षित हटाउनुहोस्" : "Remove bookmark") : (isNe ? "समाचार सुरक्षित गर्नुहोस्" : "Save story")}
                    shareLabel={isNe ? "समाचार सेयर गर्नुहोस्" : "Share story"}
                    onPress={() => router.push(`/article/${item.slug}` as never)} onBookmark={() => toggleBookmark(item)} onShare={() => shareArticle(item, headline)} />;
            }} />
    </View>;
}
const styles = StyleSheet.create({
    screen: { flex: 1 },
    feedHeading: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.gutter, gap: spacing.sm },
    feedLabel: { flex: 1, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.sm },
    listContent: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl },
    footer: { paddingVertical: spacing.xl },
    empty: { paddingVertical: spacing["3xl"], alignItems: "center", gap: spacing.md },
});

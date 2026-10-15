import { features } from "@/config/features";
import { layout, spacing } from "@/theme/tokens";
import { StatusDot } from "@/ui/StatusDot";
import { useCallback, useEffect, useState } from "react";
import { Platform, Pressable, RefreshControl, Share, StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Bookmark, ChevronRight, Share2 } from "lucide-react-native";
import { apiGet, type ArticleCard, type FactCard, type Page, type HomePayload } from "@/api/client";
import { Masthead } from "@/ui/Masthead";
import { StateView } from "@/ui/StateView";
import { StoryCard } from "@/ui/StoryCard";
import { ArticleRow } from "@/ui/ArticleRow";
import { FactCheckSection } from "@/ui/FactCheckCarousel";
import { articleWebUrl } from "@/ui/ArticleReader";
import { AppText } from "@/ui/primitives/AppText";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { pick, useLanguage } from "@/i18n/language";
import { toggleBookmark } from "@/services/bookmarks";
import { useColors } from "@/theme/Theme";
import { useAppStore } from "@/state/useAppStore";

import { isRecentBreaking, storyDate, readingLabel } from "@/utils/editorial";
import { SectionHeader } from "@/ui/SectionHeader";

type TickerItem = HomePayload["ticker"]["items"][number];

type Row =
    | { type: "header" }
    | { type: "following-header" }
    | { type: "following-state"; loading: boolean; error: Error | null }
    | { type: "ticker"; item: TickerItem }
    | { type: "hero"; item: ArticleCard }
    | { type: "top-header"; updatedAt: string }
    | { type: "article"; item: ArticleCard; divided: boolean }
    | { type: "daily-brief"; payload: HomePayload }
    | { type: "fact-checks"; items: FactCard[] }
    | { type: "opinion-header" }
    | { type: "opinion-article"; item: ArticleCard };

const T_BREAKING = { en: "Breaking", ne: "ब्रेकिङ" };
const T_TOP = { en: "Top Stories", ne: "शीर्ष समाचार" };
const T_LATEST_BRIEF = { en: "Latest brief", ne: "पछिल्लो ब्रीफ" };
const T_BRIEF = { en: "The Daily Brief", ne: "दैनिक ब्रीफ" };
const T_READ_BRIEF = { en: "Read the full brief", ne: "आजको पूर्ण ब्रीफ पढ्नुहोस्" };
const T_OPINION = { en: "Opinion & Analysis", ne: "विचार र विश्लेषण" };
const T_PERSPECTIVES = { en: "Perspectives", ne: "दृष्टिकोण" };
const T_BOOKMARK = { en: "Save for later", ne: "पछिका लागि सुरक्षित गर्नुहोस्" };
const T_UNBOOKMARK = { en: "Remove bookmark", ne: "सुरक्षित हटाउनुहोस्" };
const T_SHARE = { en: "Share article", ne: "समाचार सेयर गर्नुहोस्" };

function shareArticle(item: ArticleCard, headline: string) {
    const url = articleWebUrl(item);
    Share.share(
        Platform.OS === "ios"
            ? { message: headline, url }
            : { message: `${headline}\n${url}` }
    ).catch(() => undefined);
}

export default function HomeScreen() {
    const { language } = useLanguage();
    const colors = useColors();
    const isNe = language === "ne";
    const [now, setNow] = useState(() => Date.now());
    const savedArticleIds = useAppStore((state) => state.savedArticleIds);

    const query = useQuery({
        queryKey: ["home", language],
        queryFn: () => apiGet<HomePayload>("/api/v1/home"),
    });

    const followedAuthors = useAppStore(state => state.followedAuthors);
    const followingQueries = useQueries({ queries: followedAuthors.map(name => ({
        queryKey: ["articles", "following", name],
        queryFn: () => apiGet<Page<ArticleCard>>(`/api/v1/articles?page=1&limit=6&author=${encodeURIComponent(name)}`),
    })) });
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(id);
    }, []);

    const savedFor = useCallback((slug: string) => savedArticleIds.includes(slug), [savedArticleIds]);


    if (query.isLoading) return <View className="flex-1 bg-background"><StateView loading /></View>;
    if (query.error) {
        return (
            <View className="flex-1 bg-background px-gutter">
                <StateView error={query.error} onRetry={() => query.refetch()} />
            </View>
        );
    }

    const home = query.data;
    if (!home) return null;

    const heroArticle = home.articles[0];
    const topStories = home.articles.slice(1);
    const breaking = home.leadBrief?.tags.some(tag => tag.toLowerCase() === "breaking") ? home.ticker.items.find(item => item.slug === home.leadBrief?.slug && isRecentBreaking(item.date, now)) : undefined;
    const briefItems = home.ticker.items.slice(0, 3);
    const showBrief = briefItems.length > 0 || Boolean(home.leadBrief);

    const followingCards = [...new Map(followingQueries.flatMap(result => result.data?.items ?? []).map(article => [`${article.source}-${article.slug}`, article])).values()].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 6);
    const rows: Row[] = [
        { type: "header" },
        ...(breaking ? [{ type: "ticker" as const, item: breaking }] : []),
        ...(heroArticle ? [{ type: "hero" as const, item: heroArticle }] : []),
        ...(topStories.length
            ? [
                { type: "top-header" as const, updatedAt: topStories[0].publishedAt },
                ...topStories.map((item, index) => ({ type: "article" as const, item, divided: index > 0 })),
            ]
            : []),
        ...(followedAuthors.length ? [{ type: "following-header" as const }, ...(followingCards.length ? followingCards.map((item, index) => ({ type: "article" as const, item, divided: index > 0 })) : [{ type: "following-state" as const, loading: followingQueries.some(result => result.isLoading), error: followingQueries.find(result => result.error)?.error ?? null }])] : []),
        ...(showBrief ? [{ type: "daily-brief" as const, payload: home }] : []),
        ...(features.factChecks && home.factChecks.length ? [{ type: "fact-checks" as const, items: home.factChecks }] : []),
        ...(home.coverage.length
            ? [
                { type: "opinion-header" as const },
                ...home.coverage.map((item) => ({ type: "opinion-article" as const, item })),
            ]
            : []),
    ];

    return (
        <View className="flex-1 bg-background">
            <FlashList
                data={rows}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl
                        refreshing={query.isRefetching}
                        onRefresh={() => query.refetch()}
                    />
                }
                keyExtractor={(row, index) => {
                    if (row.type === "header") return "header";
                    if (row.type === "following-header" || row.type === "following-state") return row.type;
                    if (row.type === "ticker") return `ticker-${row.item.slug}`;
                    if (row.type === "hero") return `hero-${row.item.slug}`;
                    if (row.type === "top-header") return "top-header";
                    if (row.type === "daily-brief") return "daily-brief";
                    if (row.type === "fact-checks") return "fact-checks";
                    if (row.type === "opinion-header") return "opinion-header";
                    if (row.type === "article" || row.type === "opinion-article") return `${row.type}-${row.item.slug}-${index}`;
                    return `row-${index}`;
                }}
                getItemType={(row) => row.type}
                ListEmptyComponent={<StateView empty />}
                renderItem={({ item }) => {
                    if (item.type === "header") {
                        return <Masthead />;
                    }

                    if (item.type === "following-header") return <View className="px-gutter pt-4"><SectionHeader title={isNe ? "फलो गरिएका लेखकहरू" : "Following"} /></View>;
                    if (item.type === "following-state") return <View className="px-gutter"><StateView loading={item.loading} error={item.error} empty={!item.loading && !item.error} onRetry={() => { followingQueries.forEach(result => { void result.refetch(); }); }} /></View>;
                    if (item.type === "ticker") {
                        const title = pick(item.item.title, language);
                        const when = storyDate(item.item.date, language, now);
                        return (
                            <Pressable
                                accessibilityRole="button"
                                onPress={() => router.push(`/brief/${item.item.slug}` as never)}
                                className="flex-row items-center gap-3 bg-brand-red px-gutter py-3 active:opacity-90"
                            >
                                <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
                                    <View className="bg-white/20 px-2 py-0.5 rounded">
                                        <AppText variant="overline" style={{ color: '#FFFFFF', fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                                            {T_BREAKING[language]}
                                        </AppText>
                                    </View>
                                    <StatusDot color="onPrimary" />
                                    <AppText variant="caption" weight="bold" numberOfLines={1} style={{ flex: 1, color: '#FFFFFF' }}>
                                        {title}
                                    </AppText>
                                </View>
                                {when ? (
                                    <AppText variant="caption" style={{ flexShrink: 0, opacity: 0.8, color: '#FFFFFF' }}>{when}</AppText>
                                ) : null}
                            </Pressable>
                        );
                    }

                    if (item.type === "hero") {
                        const author = pick(item.item.author, language);
                        const ago = storyDate(item.item.publishedAt, language, now);
                        const minutes = item.item.readingMinutes?.[language];
                        const byline = author ? `${language === "ne" ? "" : "By "}${author}` : "";
                        const meta = [byline, ago, readingLabel(minutes, language)].filter(Boolean).join(" • ");
                        const saved = savedFor(item.item.slug);

                        return (
                            <View style={styles.lead}>
                                <StoryCard
                                    recyclingKey={item.item.slug}
                                    kicker={pick(item.item.category, language)}
                                    title={pick(item.item.title, language)}
                                    summary={pick(item.item.excerpt, language)}
                                    meta={meta}
                                    image={item.item.image}
                                    variant="lead"
                                    saved={saved}
                                    bookmarkLabel={saved ? T_UNBOOKMARK[language] : T_BOOKMARK[language]}
                                    onPress={() => router.push(`/article/${item.item.slug}`)}
                                    onBookmark={() => toggleBookmark(item.item)}
                                />
                            </View>
                        );
                    }

                    if (item.type === "top-header") {
                        const detail = storyDate(item.updatedAt, language, now);
                        return (
                            <View style={styles.section}>
                                <Separator />
                                <View className="pt-4">
                                    <SectionHeader title={T_TOP[language]} detail={detail} />
                                </View>
                            </View>
                        );
                    }

                    if (item.type === "article") {
                        const ago = storyDate(item.item.publishedAt, language, now);
                        const minutes = item.item.readingMinutes?.[language];
                        const meta = [ago, readingLabel(minutes, language)].filter(Boolean).join(" • ");
                        return (
                            <View style={styles.gutter}>
                                {item.divided ? <Separator className="my-1" /> : null}
                                <ArticleRow
                                    layout="home"
                                    recyclingKey={`${item.item.source}-${item.item.slug}`}
                                    kicker={pick(item.item.category, language)}
                                    title={pick(item.item.title, language)}
                                    meta={meta}
                                    image={item.item.image}
                                    onPress={() => router.push(`/article/${item.item.slug}`)}
                                />
                            </View>
                        );
                    }

                    if (item.type === "daily-brief") {
                        const lines = briefItems.length > 0
                            ? briefItems.map((entry) => ({
                                key: entry.slug,
                                title: pick(entry.title, language),
                                onPress: () => router.push(`/brief/${entry.slug}` as never),
                            }))
                            : item.payload.leadBrief
                                ? [{
                                    key: item.payload.leadBrief.slug,
                                    title: pick(item.payload.leadBrief.summary, language),
                                    onPress: () => router.push(`/brief/${item.payload.leadBrief?.slug}` as never),
                                }]
                                : [];

                        return (
                            <View className="px-gutter pt-4">
                                <Separator />
                                <View className="mt-4 bg-surface-secondary px-4 py-4">
                                    <SectionHeader title={item.payload.ticker.scope === "today" ? T_BRIEF[language] : T_LATEST_BRIEF[language]} detail={item.payload.leadBrief ? storyDate(item.payload.leadBrief.date, language, now) : undefined} />
                                    {lines.map((line, index) => (
                                        <View key={line.key}>
                                            {index > 0 ? <Separator className="my-2.5" /> : null}
                                            <Pressable
                                                accessibilityRole="button"
                                                onPress={line.onPress}
                                                className="min-h-touch flex-row items-start gap-2.5 py-1 active:opacity-70"
                                            >
                                                <AppText variant="meta" weight="bold" colorToken="brandRed" style={{ paddingTop: 2 }}>
                                                    {String(index + 1).padStart(2, "0")}
                                                </AppText>
                                                <AppText variant="bodySmall" weight="medium" colorToken="textPrimary" style={{ flex: 1 }}>
                                                    {line.title}
                                                </AppText>
                                            </Pressable>
                                        </View>
                                    ))}
                                    {item.payload.leadBrief ? (
                                        <Button
                                            variant="link"
                                            onPress={() => router.push(`/brief/${item.payload.leadBrief?.slug}` as never)}
                                            className="mt-2 h-touch self-start px-0"
                                        >
                                            <AppText variant="overline" weight="bold" colorToken="textPrimary">
                                                {T_READ_BRIEF[language]}
                                            </AppText>
                                            <ChevronRight size={layout.iconSmall} color={colors.textSecondary} />
                                        </Button>
                                    ) : null}
                                </View>
                            </View>
                        );
                    }

                    if (item.type === "fact-checks") {
                        return <FactCheckSection items={item.items} />;
                    }

                    if (item.type === "opinion-header") {
                        return (
                            <View className="px-gutter pt-4">
                                <Separator />
                                <View className="pt-4">
                                    <SectionHeader title={T_OPINION[language]} detail={T_PERSPECTIVES[language]} />
                                </View>
                            </View>
                        );
                    }

                    if (item.type === "opinion-article") {
                        const author = pick(item.item.author, language) || (isNe ? "सम्पादकीय" : "Editorial Board");
                        const headline = pick(item.item.title, language);
                        const minutes = item.item.readingMinutes?.[language];
                        const saved = savedFor(item.item.slug);

                        return (
                            <View style={styles.opinion}>
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() => router.push(`/article/${item.item.slug}`)}
                                    className="active:opacity-80"
                                >
                                    <View className="flex-col gap-0.5">
                                        <AppText variant="caption" weight="bold" colorToken="textPrimary" numberOfLines={1}>{author}</AppText>
                                    </View>
                                    <View style={styles.opinionCopy}>
                                        <AppText
                                            variant="storyTitle"
                                            weight="semibold"
                                            style={{ marginTop: 4 }}
                                        >
                                            {headline}
                                        </AppText>
                                        <AppText variant="bodySmall" colorToken="textSecondary" numberOfLines={2} style={{ marginTop: 8 }}>
                                            {pick(item.item.excerpt, language)}
                                        </AppText>
                                    </View>
                                </Pressable>
                                <View className="mt-1 flex-row items-center justify-between gap-3">
                                    <AppText variant="caption" colorToken="textSecondary" numberOfLines={1} style={{ flex: 1 }}>
                                        {readingLabel(minutes, language)}
                                    </AppText>
                                    <View className="shrink-0 flex-row items-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            accessibilityLabel={T_SHARE[language]}
                                            onPress={() => shareArticle(item.item, headline)}
                                            className="h-touch w-touch"
                                        >
                                            <Share2 size={layout.iconSmall} color={colors.textSecondary} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            accessibilityLabel={saved ? T_UNBOOKMARK[language] : T_BOOKMARK[language]}
                                            onPress={() => toggleBookmark(item.item)}
                                            className="h-touch w-touch"
                                        >
                                            <Bookmark
                                                size={layout.iconSmall}
                                                color={saved ? colors.brandRed : colors.textSecondary}
                                                fill={saved ? colors.brandRed : "transparent"}
                                            />
                                        </Button>
                                    </View>
                                </View>
                            </View>
                        );
                    }

                    return null;
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    gutter: { paddingHorizontal: spacing.gutter },
    lead: { paddingTop: spacing.lg, paddingBottom: spacing.sm },
    section: { paddingHorizontal: spacing.gutter, paddingTop: spacing.sm },
    opinion: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl },
    opinionCopy: { marginTop: spacing.xs },
});

import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, RefreshControl, Share, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, ChevronRight, Newspaper, Share2 } from "lucide-react-native";
import { Image } from "expo-image";
import { apiGet, type ArticleCard, type HomePayload } from "@/api/client";
import { Masthead } from "@/ui/Masthead";
import { StateView } from "@/ui/StateView";
import { StoryCard } from "@/ui/StoryCard";
import { ArticleRow } from "@/ui/ArticleRow";
import { articleWebUrl } from "@/ui/ArticleReader";
import { AppText } from "@/ui/primitives/AppText";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { pick, useLanguage } from "@/i18n/language";
import { isSaved, removeSaved, saveArticle } from "@/storage/saved";
import { useColors } from "@/theme/Theme";

type TickerItem = HomePayload["ticker"]["items"][number];

type Row =
    | { type: "header" }
    | { type: "ticker"; item: TickerItem }
    | { type: "hero"; item: ArticleCard }
    | { type: "top-header"; updatedAt: string }
    | { type: "article"; item: ArticleCard; divided: boolean }
    | { type: "daily-brief"; payload: HomePayload }
    | { type: "opinion-header" }
    | { type: "opinion-article"; item: ArticleCard };

const T_BREAKING = { en: "Breaking", ne: "ब्रेकिङ" };
const T_TOP = { en: "Top Stories", ne: "शीर्ष समाचार" };
const T_BRIEF = { en: "The Daily Brief", ne: "दैनिक ब्रीफ" };
const T_READ_BRIEF = { en: "Read today's full brief", ne: "आजको पूर्ण ब्रीफ पढ्नुहोस्" };
const T_OPINION = { en: "Opinion & Analysis", ne: "विचार र विश्लेषण" };
const T_PERSPECTIVES = { en: "Perspectives", ne: "दृष्टिकोण" };
const T_COLUMN = { en: "Column", ne: "स्तम्भ" };
const T_COLUMNIST = { en: "Columnist", ne: "स्तम्भकार" };
const T_MIN_READ = { en: "min read", ne: "मिनेट पढाइ" };
const T_BOOKMARK = { en: "Save for later", ne: "पछिका लागि सुरक्षित गर्नुहोस्" };
const T_UNBOOKMARK = { en: "Remove bookmark", ne: "सुरक्षित हटाउनुहोस्" };
const T_SHARE = { en: "Share article", ne: "समाचार सेयर गर्नुहोस्" };

function readingMinutes(text: string) {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

function formatRelative(iso: string, language: "en" | "ne", now: number) {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "";
    const minutes = Math.max(0, Math.round((now - then) / 60000));
    if (language === "ne") {
        if (minutes < 1) return "अहिले";
        if (minutes < 60) return `${minutes} मिनेट अघि`;
        const hours = Math.round(minutes / 60);
        if (hours < 24) return `${hours} घण्टा अघि`;
        return `${Math.round(hours / 24)} दिन अघि`;
    }
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.round(hours / 24)}d ago`;
}

function formatClock(iso: string) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    let hours = date.getHours();
    const minutes = date.getMinutes();
    hours = hours % 12 || 12;
    const minutesStr = minutes < 10 ? `0${minutes}` : String(minutes);
    return `${hours}:${minutesStr}`;
}

function PingDot() {
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.35, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [opacity]);

    return <Animated.View style={{ opacity, backgroundColor: '#FFFFFF' }} className="h-1.5 w-1.5 shrink-0 rounded-full" />;
}

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
    const [savedOverrides, setSavedOverrides] = useState<Record<string, boolean>>({});

    const query = useQuery({
        queryKey: ["home", language],
        queryFn: () => apiGet<HomePayload>("/api/v1/home"),
    });

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(id);
    }, []);

    const savedFor = useCallback(
        (slug: string) => (slug in savedOverrides ? savedOverrides[slug] : isSaved(slug)),
        [savedOverrides]
    );

    const toggleBookmark = useCallback((item: ArticleCard) => {
        const currently = item.slug in savedOverrides ? savedOverrides[item.slug] : isSaved(item.slug);
        if (currently) {
            removeSaved(item.slug);
        } else {
            saveArticle({
                slug: item.slug,
                source: item.source,
                titleEn: item.title.en,
                titleNe: item.title.ne,
                excerptEn: item.excerpt.en,
                excerptNe: item.excerpt.ne,
                contentEn: item.excerpt.en,
                contentNe: item.excerpt.ne,
                savedAt: new Date().toISOString(),
            });
        }
        setSavedOverrides((prev) => ({ ...prev, [item.slug]: !currently }));
    }, [savedOverrides]);

    if (query.isLoading) return <View className="flex-1 bg-background"><StateView loading /></View>;
    if (query.error) {
        return (
            <View className="flex-1 bg-background px-5">
                <StateView error={query.error} onRetry={() => query.refetch()} />
            </View>
        );
    }

    const home = query.data;
    if (!home) return null;

    const heroArticle = home.articles[0];
    const topStories = home.articles.slice(1);
    const breaking = home.ticker.items[0];
    const briefItems = home.ticker.items.slice(0, 3);
    const showBrief = briefItems.length > 0 || Boolean(home.leadBrief);

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
        ...(showBrief ? [{ type: "daily-brief" as const, payload: home }] : []),
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
                    if (row.type === "ticker") return `ticker-${row.item.slug}`;
                    if (row.type === "hero") return `hero-${row.item.slug}`;
                    if (row.type === "top-header") return "top-header";
                    if (row.type === "daily-brief") return "daily-brief";
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

                    if (item.type === "ticker") {
                        const title = pick(item.item.title, language);
                        const when = formatRelative(item.item.date, language, now);
                        return (
                            <Pressable
                                accessibilityRole="button"
                                onPress={() => router.push(`/article/${item.item.slug}` as never)}
                                className="flex-row items-center gap-3 bg-brand-red px-5 py-3 active:opacity-90"
                            >
                                <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
                                    <View className="bg-white/20 px-2 py-0.5 rounded">
                                        <AppText variant="overline" style={{ color: '#FFFFFF', fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                                            {T_BREAKING[language]}
                                        </AppText>
                                    </View>
                                    <PingDot />
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
                        const ago = formatRelative(item.item.publishedAt, language, now);
                        const minutes = readingMinutes(pick(item.item.excerpt, language));
                        const byline = author ? `${language === "ne" ? "" : "By "}${author}` : "";
                        const meta = [byline, ago, `${minutes} ${T_MIN_READ[language]}`].filter(Boolean).join(" • ");
                        const saved = savedFor(item.item.slug);

                        return (
                            <View className="pb-2 pt-4">
                                <StoryCard
                                    recyclingKey={item.item.slug}
                                    kicker={pick(item.item.category, language)}
                                    title={pick(item.item.title, language)}
                                    summary={pick(item.item.excerpt, language)}
                                    meta={meta}
                                    image={item.item.image}
                                    saved={saved}
                                    bookmarkLabel={saved ? T_UNBOOKMARK[language] : T_BOOKMARK[language]}
                                    onPress={() => router.push(`/article/${item.item.slug}`)}
                                    onBookmark={() => toggleBookmark(item.item)}
                                />
                            </View>
                        );
                    }

                    if (item.type === "top-header") {
                        const clock = formatClock(item.updatedAt);
                        return (
                            <View className="px-5 pt-2">
                                <Separator />
                                <View className="flex-row items-center justify-between gap-3 pb-1 pt-4">
                                    <View className="min-w-0 flex-1 flex-row items-center gap-2">
                                        <View className="h-3.5 w-1 bg-primary" />
                                        <AppText variant="overline" weight="bold" colorToken="textPrimary" numberOfLines={1}>
                                            {T_TOP[language]}
                                        </AppText>
                                    </View>
                                    {clock ? (
                                        <AppText variant="caption" colorToken="textSecondary" style={{ flexShrink: 0 }}>
                                            {isNe ? `अपडेट ${clock} NPT` : `Updated ${clock} NPT`}
                                        </AppText>
                                    ) : null}
                                </View>
                            </View>
                        );
                    }

                    if (item.type === "article") {
                        const ago = formatRelative(item.item.publishedAt, language, now);
                        const minutes = readingMinutes(pick(item.item.excerpt, language));
                        const meta = [ago, `${minutes} ${T_MIN_READ[language]}`].filter(Boolean).join(" • ");
                        return (
                            <View className="px-5">
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
                                onPress: () => router.push(`/article/${entry.slug}` as never),
                            }))
                            : item.payload.leadBrief
                                ? [{
                                    key: item.payload.leadBrief.slug,
                                    title: pick(item.payload.leadBrief.summary, language),
                                    onPress: () => router.push(`/brief/${item.payload.leadBrief?.slug}` as never),
                                }]
                                : [];

                        return (
                            <View className="px-5 pt-4">
                                <Separator />
                                <View className="mt-4 rounded-lg bg-surface-secondary p-4">
                                    <View className="flex-row items-center gap-2 pb-2">
                                        <Newspaper size={16} color={colors.brandRed} />
                                        <AppText variant="overline" weight="bold" colorToken="textPrimary" numberOfLines={2} style={{ flex: 1 }}>
                                            {T_BRIEF[language]}
                                        </AppText>
                                    </View>
                                    {lines.map((line, index) => (
                                        <View key={line.key}>
                                            {index > 0 ? <Separator className="my-2.5" /> : null}
                                            <Pressable
                                                accessibilityRole="button"
                                                onPress={line.onPress}
                                                className="min-h-11 flex-row items-start gap-2.5 py-1 active:opacity-70"
                                            >
                                                <AppText variant="caption" weight="bold" colorToken="primary" style={{ paddingTop: 2 }}>
                                                    {String(index + 1).padStart(2, "0")}
                                                </AppText>
                                                <AppText variant="caption" weight="medium" colorToken="textPrimary" style={{ flex: 1 }}>
                                                    {line.title}
                                                </AppText>
                                            </Pressable>
                                        </View>
                                    ))}
                                    {item.payload.leadBrief ? (
                                        <Button
                                            variant="link"
                                            onPress={() => router.push(`/brief/${item.payload.leadBrief?.slug}` as never)}
                                            className="mt-2 h-11 self-start px-0"
                                        >
                                            <AppText variant="overline" weight="bold" colorToken="textPrimary">
                                                {T_READ_BRIEF[language]}
                                            </AppText>
                                            <ChevronRight size={15} color={colors.textSecondary} />
                                        </Button>
                                    ) : null}
                                </View>
                            </View>
                        );
                    }

                    if (item.type === "opinion-header") {
                        return (
                            <View className="px-5 pt-4">
                                <Separator />
                                <View className="flex-row items-center justify-between gap-3 pb-3 pt-4">
                                    <View className="min-w-0 flex-1 flex-row items-center gap-2">
                                        <View className="h-3.5 w-1 bg-brand-red" />
                                        <AppText variant="overline" weight="bold" colorToken="textPrimary" numberOfLines={1}>
                                            {T_OPINION[language]}
                                        </AppText>
                                    </View>
                                    <AppText variant="overline" weight="bold" colorToken="textSecondary" style={{ flexShrink: 0 }}>
                                        {T_PERSPECTIVES[language]}
                                    </AppText>
                                </View>
                            </View>
                        );
                    }

                    if (item.type === "opinion-article") {
                        const author = pick(item.item.author, language) || (isNe ? "सम्पादकीय" : "Editorial Board");
                        const headline = pick(item.item.title, language);
                        const minutes = readingMinutes(pick(item.item.excerpt, language));
                        const saved = savedFor(item.item.slug);

                        return (
                            <View className="px-5 pb-5">
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() => router.push(`/article/${item.item.slug}`)}
                                    className="active:opacity-80"
                                >
                                    <View className="flex-col gap-0.5">
                                        <AppText variant="caption" weight="bold" colorToken="textPrimary" numberOfLines={1}>{author}</AppText>
                                        <AppText variant="caption" colorToken="textSecondary" numberOfLines={1}>
                                            {T_COLUMNIST[language]}
                                        </AppText>
                                    </View>
                                    <View className="mt-4 border-l-2 border-brand-red py-0.5 pl-3.5">
                                        <AppText variant="overline" weight="semibold" colorToken="textSecondary">
                                            {T_COLUMN[language]}
                                        </AppText>
                                        <AppText
                                            variant="heading3"
                                            weight="bold"
                                            style={{ marginTop: 4 }}
                                        >
                                            {headline}
                                        </AppText>
                                        <AppText variant="body" colorToken="textSecondary" numberOfLines={2} style={{ marginTop: 8 }}>
                                            {pick(item.item.excerpt, language)}
                                        </AppText>
                                    </View>
                                </Pressable>
                                <View className="mt-1 flex-row items-center justify-between gap-3">
                                    <AppText variant="caption" colorToken="textSecondary" numberOfLines={1} style={{ flex: 1 }}>
                                        {minutes} {T_MIN_READ[language]}
                                    </AppText>
                                    <View className="shrink-0 flex-row items-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            accessibilityLabel={T_SHARE[language]}
                                            onPress={() => shareArticle(item.item, headline)}
                                            className="h-11 w-11 rounded-lg"
                                        >
                                            <Share2 size={16} color={colors.textSecondary} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            accessibilityLabel={saved ? T_UNBOOKMARK[language] : T_BOOKMARK[language]}
                                            onPress={() => toggleBookmark(item.item)}
                                            className="h-11 w-11 rounded-lg"
                                        >
                                            <Bookmark
                                                size={16}
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

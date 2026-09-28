import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, RefreshControl, ScrollView, Share, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiGet, type ArticleCard, type Page } from "@/api/client";
import { StateView } from "@/ui/StateView";
import { Masthead } from "@/ui/Masthead";
import { TimelineRow } from "@/ui/TimelineRow";
import { articleWebUrl } from "@/ui/ArticleReader";
import { AppText } from "@/ui/primitives/AppText";
import { Button } from "@/components/ui/button";
import { pick, useLanguage } from "@/i18n/language";
import { Clock, History, Podcast } from "lucide-react-native";
import { useAudioStore } from "@/state/useAudioStore";
import { isSaved, removeSaved, saveArticle } from "@/storage/saved";
import { useColors } from "@/theme/Theme";



const CATEGORY_KEYS = ["all", "nepal", "politics", "economy", "world", "sports", "tech"];

const T_CATEGORIES = {
    en: ["All", "Nepal", "Politics", "Economy", "World", "Sports", "Tech"],
    ne: ["सबै", "नेपाल", "राजनीति", "अर्थतन्त्र", "विश्व", "खेलकुद", "प्रविधि"],
};

const T_LIVE_STREAM = { en: "Live stream", ne: "प्रत्यक्ष प्रसारण" };
const T_AUDIO_WIRE = { en: "Audio Wire", ne: "अडियो वायर" };
const T_PULL = { en: "Pull to refresh", ne: "रिफ्रेस गर्न तान्नुहोस्" };
const T_DISPATCH_BANNER = { en: "Today's Real-Time Dispatch", ne: "आजको रियल-टाइम समाचार" };
const T_DESK = { en: "The Leaders", ne: "द लिडर्स" };
const T_FLASH = { en: "Breaking", ne: "ब्रेकिङ" };
const T_BOOKMARK = { en: "Save story", ne: "समाचार सुरक्षित गर्नुहोस्" };
const T_UNBOOKMARK = { en: "Remove bookmark", ne: "सुरक्षित हटाउनुहोस्" };
const T_SHARE = { en: "Share story", ne: "समाचार सेयर गर्नुहोस्" };
const T_ARCHIVED_TITLE = { en: "Earlier Dispatches Archived", ne: "अघिल्ला समाचारहरू सङ्ग्रहित" };
const T_ARCHIVED_DESC = {
    en: "Stories prior to 07:00 AM are organized into the digital morning edition.",
    ne: "बिहान ०७:०० बजे अघिका समाचारहरू बिहानी संस्करणमा सङ्ग्रहित गरिएका छन्।",
};
const T_LOAD_MORNING = { en: "Load Morning Broadsheet", ne: "बिहानी संस्करण लोड गर्नुहोस्" };

const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const NE_MONTHS = ["जनवरी", "फेब्रुअरी", "मार्च", "अप्रिल", "मे", "जुन", "जुलाई", "अगस्ट", "सेप्टेम्बर", "अक्टोबर", "नोभेम्बर", "डिसेम्बर"];

function getTodayString(lang: "en" | "ne") {
    const d = new Date();
    if (lang === "ne") {
        return `${d.getDate()} ${NE_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    }
    return `${EN_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatUpdated(updatedAt: number, now: number, language: "en" | "ne") {
    const seconds = Math.max(0, Math.round((now - updatedAt) / 1000));
    if (language === "ne") {
        if (seconds < 60) return `${seconds} सेकेन्ड अघि अपडेट`;
        const minutes = Math.max(1, Math.round(seconds / 60));
        if (minutes < 60) return `${minutes} मिनेट अघि अपडेट`;
        return `${Math.round(minutes / 60)} घण्टा अघि अपडेट`;
    }
    if (seconds < 60) return `Updated ${seconds}s ago`;
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `Updated ${minutes}m ago`;
    return `Updated ${Math.round(minutes / 60)}h ago`;
}

function LiveDot() {
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

    return <Animated.View style={{ opacity }} className="h-2 w-2 rounded-full bg-success" />;
}

function playLive() {
    useAudioStore.getState().play({
        id: "live",
        title: "Live News Stream",
        author: "The Leaders Desk",
        artwork: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=200",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    });
}

function shareArticle(item: ArticleCard, headline: string) {
    const url = articleWebUrl(item);
    Share.share(
        Platform.OS === "ios"
            ? { message: headline, url }
            : { message: `${headline}\n${url}` }
    ).catch(() => undefined);
}

function playWire() {
    useAudioStore.getState().play({
        id: "wire",
        title: "Morning Audio Wire",
        author: "The Leaders",
        artwork: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=200",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    });
}

export default function LatestScreen() {
    const colors = useColors();
    const { language } = useLanguage();
    const isNe = language === "ne";
    const [refreshing, setRefreshing] = useState(false);
    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
    const [now, setNow] = useState(() => Date.now());
    const [savedOverrides, setSavedOverrides] = useState<Record<string, boolean>>({});

    const categoryParam = activeCategoryIndex === 0 ? "" : `&category=${CATEGORY_KEYS[activeCategoryIndex]}`;

    const {
        data,
        dataUpdatedAt,
        isLoading,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["latest", language, activeCategoryIndex],
        queryFn: ({ pageParam = 1 }) => apiGet<Page<ArticleCard>>(`/api/v1/articles?page=${pageParam}${categoryParam}`),
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
        initialPageParam: 1,
    });

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 15_000);
        return () => clearInterval(id);
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

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

    if (isLoading) return <View className="flex-1 bg-background"><StateView loading /></View>;
    if (error) {
        return (
            <View className="flex-1 bg-background px-5">
                <StateView error={error} onRetry={() => refetch()} />
            </View>
        );
    }

    const articles = data?.pages.flatMap((page) => page.items) || [];
    const dateStr = getTodayString(language);
    const updatedLabel = formatUpdated(dataUpdatedAt || now, now, language);

    const renderHeader = () => (
        <View className="bg-background">
            <Masthead />
            <View className="px-5 pb-2">
                <View className="flex-row items-center justify-between gap-3">
                    <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                        <AppText
                            numberOfLines={1}
                            variant="heading1"
                            weight="bold"
                            style={{ textTransform: "uppercase" }}
                        >
                            {isNe ? "पछिल्लो" : "Latest"}
                        </AppText>
                        <View className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </View>
                    <Button
                        variant="secondary"
                        size="sm"
                        accessibilityLabel={T_LIVE_STREAM[language]}
                        onPress={playLive}
                        className="flex-row items-center gap-1.5 px-2"
                    >
                        <LiveDot />
                        <AppText variant="caption" weight="medium" colorToken="textSecondary">
                            {T_LIVE_STREAM[language]}
                        </AppText>
                    </Button>
                </View>
                <View className="mt-1 flex-row items-center justify-between gap-3">
                    <AppText variant="caption" weight="medium" colorToken="textSecondary" numberOfLines={1} style={{ flex: 1 }}>
                        {updatedLabel}
                        <AppText variant="caption" colorToken="textSecondary"> • </AppText>
                        <AppText variant="caption" weight="medium" colorToken="primary">{T_PULL[language]}</AppText>
                    </AppText>
                    <Button
                        variant="ghost"
                        accessibilityLabel={T_AUDIO_WIRE[language]}
                        onPress={playWire}
                        className="flex-row items-center gap-1.5 px-0 h-11"
                    >
                        <Podcast size={16} color={colors.textPrimary} />
                        <AppText variant="caption" weight="medium" colorToken="textPrimary">{T_AUDIO_WIRE[language]}</AppText>
                    </Button>
                </View>
            </View>

            <View className="py-2">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="items-center gap-2 px-5"
                >
                    {T_CATEGORIES[language].map((cat, index) => {
                        const isActive = activeCategoryIndex === index;
                        return (
                            <Button
                                key={CATEGORY_KEYS[index]}
                                variant={isActive ? "default" : "secondary"}
                                size="sm"
                                accessibilityState={{ selected: isActive }}
                                onPress={() => setActiveCategoryIndex(index)}
                                className="px-3.5"
                            >
                                <AppText
                                    numberOfLines={1}
                                    variant="body"
                                    weight={isActive ? "bold" : "semibold"}
                                    colorToken={isActive ? "textInverse" : "textSecondary"}
                                >
                                    {cat}
                                </AppText>
                            </Button>
                        );
                    })}
                </ScrollView>
            </View>

            <View className="flex-row items-center justify-between gap-3 bg-surface-secondary px-5 py-3">
                <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                    <Clock size={14} color={colors.brandRed} />
                    <AppText
                        numberOfLines={1}
                        variant="overline"
                        weight="semibold"
                        colorToken="textSecondary"
                        style={{ flex: 1 }}
                    >
                        {T_DISPATCH_BANNER[language]}
                    </AppText>
                </View>
                <AppText variant="caption" weight="medium" colorToken="textSecondary" style={{ flexShrink: 0 }}>{dateStr}</AppText>
            </View>
        </View>
    );

    const renderFooter = () => (
        <View className="mx-5 mb-2 mt-5 items-center rounded-lg bg-surface-secondary p-4">
            <History size={24} color={colors.brandRed} />
            <AppText variant="heading3" weight="bold" style={{ marginTop: 4, textAlign: "center" }}>
                {T_ARCHIVED_TITLE[language]}
            </AppText>
            <AppText variant="caption" colorToken="textSecondary" style={{ marginTop: 2, textAlign: "center", maxWidth: 280 }}>
                {T_ARCHIVED_DESC[language]}
            </AppText>
            <Button variant="secondary" className="mt-2.5 h-11 rounded-lg px-4">
                <AppText variant="overline" weight="bold">{T_LOAD_MORNING[language]}</AppText>
            </Button>
        </View>
    );

    return (
        <View className="flex-1 bg-background">
            <FlashList
                data={articles}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                keyExtractor={(item) => `${item.source}-${item.slug}`}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={<StateView empty />}
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                }}
                onEndReachedThreshold={0.5}
                renderItem={({ item }) => {
                    const isFlash = item.tags?.includes("flash") || item.tags?.includes("breaking") || false;
                    const headline = pick(item.title, language);
                    const author = pick(item.author, language) || T_DESK[language];
                    const saved = savedFor(item.slug);

                    return (
                        <View className="px-5">
                            <TimelineRow
                                recyclingKey={`${item.source}-${item.slug}`}
                                author={author}
                                title={headline}
                                excerpt={pick(item.excerpt, language)}
                                image={item.image}
                                publishedAt={item.publishedAt}
                                now={now}
                                isFlash={isFlash}
                                saved={saved}
                                flashLabel={T_FLASH[language]}
                                bookmarkLabel={saved ? T_UNBOOKMARK[language] : T_BOOKMARK[language]}
                                shareLabel={T_SHARE[language]}
                                onPress={() => router.push(`/article/${item.slug}` as never)}
                                onBookmark={() => toggleBookmark(item)}
                                onShare={() => shareArticle(item, headline)}
                            />
                        </View>
                    );
                }}
            />
        </View>
    );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, BookOpen, Search } from "lucide-react-native";
import { Image } from "expo-image";
import { apiGet, type ArticleCard, type Bilingual, type HomePayload, type Page } from "@/api/client";
import { Masthead } from "@/ui/Masthead";
import { StateView } from "@/ui/StateView";
import { AppText } from "@/ui/primitives/AppText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage, pick } from "@/i18n/language";
import { ui } from "@/i18n/copy";
import { readRecentSearches } from "@/storage/prefs";

import { useColors } from "@/theme/Theme";

const T_SEARCH_PLACEHOLDER = {
    en: "Search articles, topics, authors, or explainers...",
    ne: "लेख, विषय, लेखक, वा व्याख्या खोज्नुहोस्...",
};
const T_TRENDING = { en: "Trending in Nepal", ne: "नेपालमा चर्चामा" };
const T_DESKS = { en: "Desks & Topics", ne: "डेस्क र विषय" };
const T_VIEW_ALL = { en: "View all", ne: "सबै हेर्नुहोस्" };
const T_SHOW_LESS = { en: "Show less", ne: "कम हेर्नुहोस्" };
const T_DOSSIER = { en: "Featured Dossier", ne: "विशेष दस्तावेज" };
const T_SERIES = { en: "Series", ne: "शृंखला" };
const T_READ = { en: "Read", ne: "पढ्नुहोस्" };
const T_MIN = { en: "min read", ne: "मिनेट पढाइ" };
const T_COLUMNISTS = { en: "Columnists & Editors", ne: "स्तम्भकार र सम्पादकहरू" };
const T_VOICES = { en: "Distinct Voices", ne: "विशिष्ट आवाजहरू" };
const T_FOLLOW = { en: "Follow", ne: "फलो" };
const T_FOLLOWING = { en: "Following", ne: "फलो गर्दै" };

function uniqueBilingual(items: Bilingual[]) {
    const seen = new Set<string>();
    return items.filter((item) => {
        const key = (item.en || item.ne).trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function uniqueAuthors(articles: ArticleCard[]) {
    const seen = new Set<string>();
    const authors: { name: Bilingual; category: Bilingual }[] = [];
    articles.forEach((item) => {
        const key = (item.author.en || item.author.ne).trim().toLowerCase();
        if (!key || seen.has(key)) return;
        seen.add(key);
        authors.push({ name: item.author, category: item.category });
    });
    return authors;
}

function readingMinutes(text: string) {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

function formatUpdated(updatedAt: number, now: number, language: "en" | "ne") {
    if (!updatedAt) return "";
    const minutes = Math.max(0, Math.round((now - updatedAt) / 60000));
    if (language === "ne") {
        if (minutes < 1) return "अहिले अपडेट";
        return `${minutes} मिनेट अघि अपडेट`;
    }
    if (minutes < 1) return "Updated just now";
    return `Updated ${minutes}m ago`;
}

function PulseDot() {
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

    return <Animated.View style={{ opacity }} className="h-1.5 w-1.5 rounded-full bg-primary" />;
}

function openSearch(query: string) {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
        router.push("/search" as never);
        return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}` as never);
}

function openCategory(category: Bilingual) {
    router.push(
        `/category/${encodeURIComponent(category.en || category.ne)}?ne=${encodeURIComponent(category.ne || category.en)}` as never
    );
}

export default function ExploreScreen() {
    const colors = useColors();
    const { language } = useLanguage();
    const isNe = language === "ne";
    const [query, setQuery] = useState("");
    const [recent, setRecent] = useState<string[]>([]);
    const [showAllDesks, setShowAllDesks] = useState(false);
    const [following, setFollowing] = useState<Record<string, boolean>>({});
    const [now, setNow] = useState(() => Date.now());

    const articles = useQuery({
        queryKey: ["articles", "discover"],
        queryFn: () => apiGet<Page<ArticleCard>>("/api/v1/articles?page=1&limit=50"),
    });
    const home = useQuery({
        queryKey: ["home", "discover"],
        queryFn: () => apiGet<HomePayload>("/api/v1/home"),
    });

    useFocusEffect(useCallback(() => {
        setRecent(readRecentSearches().slice(0, 4));
    }, []));

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(id);
    }, []);

    const cards = [...(articles.data?.items ?? []), ...(home.data?.coverage ?? [])];
    const categories = uniqueBilingual(cards.map((item) => item.category));
    const visibleDesks = showAllDesks ? categories : categories.slice(0, 8);
    const columnists = uniqueAuthors(home.data?.coverage ?? []);
    const trending = (home.data?.articles?.length ? home.data.articles : articles.data?.items ?? []).slice(0, 4);
    const dossier = home.data?.articles?.[0] ?? articles.data?.items?.[0];
    const loading = (articles.isLoading || home.isLoading) && categories.length === 0;
    const failed = Boolean(articles.error && home.error && categories.length === 0);
    const updatedLabel = formatUpdated(home.dataUpdatedAt, now, language);

    return (
        <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-12" keyboardShouldPersistTaps="handled">
            <Masthead />

            <View className="px-5 pb-2">
                <View className="h-11 flex-row items-center rounded-lg bg-surface-secondary px-3">
                    <Search size={20} color={colors.textSecondary} />
                    <Input
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={() => openSearch(query)}
                        returnKeyType="search"
                        placeholder={T_SEARCH_PLACEHOLDER[language]}
                        className="h-11 flex-1 border-0 bg-transparent px-2 text-sm shadow-none"
                    />
                </View>
                {recent.length > 0 ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerClassName="items-center gap-2 pt-2"
                    >
                        <AppText variant="overline" weight="bold" colorToken="textSecondary" style={{ marginRight: 4 }}>
                            {pick(ui.recent, language)}:
                        </AppText>
                        {recent.map((term) => (
                            <Pressable
                                key={term}
                                accessibilityRole="button"
                                onPress={() => {
                                    setQuery(term);
                                    openSearch(term);
                                }}
                                className="h-8 items-center justify-center rounded-lg bg-surface-secondary px-2.5 active:opacity-70"
                            >
                                <AppText variant="caption" colorToken="textSecondary" numberOfLines={1}>{term}</AppText>
                            </Pressable>
                        ))}
                    </ScrollView>
                ) : null}
            </View>

            {loading ? (
                <View className="p-5">
                    <StateView loading />
                </View>
            ) : null}
            {failed ? (
                <View className="p-5">
                    <StateView
                        error={articles.error || home.error}
                        onRetry={() => {
                            articles.refetch();
                            home.refetch();
                        }}
                    />
                </View>
            ) : null}

            {trending.length > 0 ? (
                <View className="mt-4 px-5">
                    <View className="mb-2 flex-row items-center justify-between gap-3">
                        <View className="min-w-0 flex-1 flex-row items-center gap-2">
                            <PulseDot />
                            <AppText variant="overline" weight="bold" colorToken="textPrimary" numberOfLines={1}>
                                {T_TRENDING[language]}
                            </AppText>
                        </View>
                        {updatedLabel ? (
                            <AppText variant="caption" colorToken="textSecondary" style={{ flexShrink: 0 }}>{updatedLabel}</AppText>
                        ) : null}
                    </View>
                    {trending.map((item, index) => (
                        <Pressable
                            key={item.slug}
                            accessibilityRole="button"
                            onPress={() => router.push(`/article/${item.slug}` as never)}
                            className="min-h-11 flex-row items-start gap-3 rounded-lg px-2 py-2 active:bg-surface-secondary"
                        >
                            <AppText
                                variant="heading2"
                                weight="bold"
                                colorToken={index === 0 ? "primary" : "textSecondary"}
                                style={{ width: 28, fontFamily: "serif" }}
                            >
                                {String(index + 1).padStart(2, "0")}
                            </AppText>
                            <View className="min-w-0 flex-1">
                                <AppText variant={isNe ? "heading3" : "body"} weight="bold">
                                    {pick(item.title, language)}
                                </AppText>
                                <View className="mt-0.5 flex-row items-center gap-2">
                                    <AppText variant="caption" colorToken="textSecondary" numberOfLines={1}>
                                        {pick(item.category, language)}
                                    </AppText>
                                </View>
                            </View>
                        </Pressable>
                    ))}
                </View>
            ) : null}

            {visibleDesks.length > 0 ? (
                <View className="mt-6 px-5">
                    <View className="mb-2 flex-row items-center justify-between gap-3">
                        <AppText variant="overline" weight="bold" colorToken="textPrimary" numberOfLines={1} style={{ flex: 1 }}>
                            {T_DESKS[language]}
                        </AppText>
                        {categories.length > 8 ? (
                            <Pressable accessibilityRole="button" onPress={() => setShowAllDesks((value) => !value)} className="h-11 justify-center">
                                <AppText variant="caption" weight="bold" colorToken="primary">
                                    {showAllDesks ? T_SHOW_LESS[language] : `${T_VIEW_ALL[language]} ${categories.length}`}
                                </AppText>
                            </Pressable>
                        ) : null}
                    </View>
                    <View className="flex-row flex-wrap justify-between">
                        {visibleDesks.map((category, index) => {
                            const title = isNe ? category.ne || category.en : category.en || category.ne;
                            const subtitle = isNe ? category.en : category.ne;
                            return (
                                <Pressable
                                    key={category.en || category.ne}
                                    accessibilityRole="button"
                                    onPress={() => openCategory(category)}
                                    className="mb-2 w-[48%] rounded-lg bg-surface-secondary p-3 active:opacity-80"
                                >
                                    <View className="flex-row items-center justify-between">
                                        <AppText variant="overline" weight="bold" colorToken="textSecondary">
                                            {isNe ? `डेस्क ${String(index + 1).padStart(2, "0")}` : `Desk ${String(index + 1).padStart(2, "0")}`}
                                        </AppText>
                                        <ArrowUpRight size={16} color={colors.textSecondary} />
                                    </View>
                                    <AppText variant="body" weight="bold" numberOfLines={1} style={{ marginTop: 4 }}>
                                        {title}
                                    </AppText>
                                    {subtitle && subtitle !== title ? (
                                        <AppText variant="caption" colorToken="textSecondary" numberOfLines={1}>{subtitle}</AppText>
                                    ) : null}
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            ) : null}

            {dossier ? (
                <View className="mt-6 px-5">
                    <View className="mb-2 flex-row items-center justify-between gap-3">
                        <AppText variant="overline" weight="bold" colorToken="textPrimary" numberOfLines={1} style={{ flex: 1 }}>
                            {T_DOSSIER[language]}
                        </AppText>
                        <AppText variant="overline" weight="bold" colorToken="primary" style={{ backgroundColor: colors.brandRedSoft, paddingHorizontal: 8, paddingVertical: 2, overflow: "hidden" }}>
                            {T_SERIES[language]}
                        </AppText>
                    </View>
                    <View className="overflow-hidden rounded-lg bg-surface-secondary">
                        {dossier.image ? (
                            <View className="h-44 w-full">
                                <Image source={{ uri: dossier.image }} contentFit="cover" className="h-full w-full" />
                                <View className="absolute left-3 top-3 rounded-lg bg-background px-2 py-1">
                                    <AppText variant="overline" weight="bold" colorToken="primary">
                                        {pick(dossier.category, language)}
                                    </AppText>
                                </View>
                            </View>
                        ) : null}
                        <View className="p-4">
                            <AppText variant={isNe ? "heading1" : "heading2"} weight="bold">
                                {pick(dossier.title, language)}
                            </AppText>
                            <AppText variant="body" colorToken="textSecondary" style={{ marginTop: 8 }}>
                                {pick(dossier.excerpt, language)}
                            </AppText>
                            <View className="mt-4 flex-row items-center justify-between gap-3">
                                <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                                    <BookOpen size={18} color={colors.brandRed} />
                                    <AppText variant="caption" weight="bold" colorToken="textPrimary" numberOfLines={1}>
                                        {readingMinutes(pick(dossier.excerpt, language))} {T_MIN[language]}
                                    </AppText>
                                </View>
                                <Button
                                    onPress={() => router.push(`/article/${dossier.slug}` as never)}
                                    className="rounded-full px-4"
                                >
                                    <AppText variant="body" weight="bold" colorToken="textInverse">{T_READ[language]}</AppText>
                                    <ArrowRight size={14} color={colors.textInverse} />
                                </Button>
                            </View>
                        </View>
                    </View>
                </View>
            ) : null}

            {columnists.length > 0 ? (
                <View className="mt-6 px-5">
                    <View className="mb-2 flex-row items-center justify-between gap-3">
                        <AppText variant="overline" weight="bold" colorToken="textPrimary" numberOfLines={1} style={{ flex: 1 }}>
                            {T_COLUMNISTS[language]}
                        </AppText>
                        <AppText variant="caption" colorToken="textSecondary" style={{ flexShrink: 0 }}>{T_VOICES[language]}</AppText>
                    </View>
                    <View className="gap-2">
                        {columnists.map((author) => {
                            const name = author.name.en || author.name.ne;
                            const isFollowing = Boolean(following[name]);
                            return (
                                <View key={name} className="flex-row items-center justify-between gap-3 rounded-lg bg-surface-secondary p-3">
                                    <Pressable
                                        accessibilityRole="button"
                                        onPress={() => router.push(`/search?q=${encodeURIComponent(pick(author.name, language))}` as never)}
                                        className="min-w-0 flex-1 flex-row items-center gap-3"
                                    >
                                        <Image
                                            source={{
                                                uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F0F0EC&color=111111&size=100`,
                                            }}
                                            className="h-12 w-12 shrink-0 rounded-full bg-background"
                                        />
                                        <View className="min-w-0 flex-1">
                                            <AppText variant="body" weight="bold" numberOfLines={1}>
                                                {pick(author.name, language)}
                                            </AppText>
                                            <AppText variant="caption" colorToken="primary" numberOfLines={1}>
                                                {pick(author.category, language)}
                                            </AppText>
                                        </View>
                                    </Pressable>
                                    <Button
                                        variant={isFollowing ? "default" : "outline"}
                                        size="sm"
                                        onPress={() => setFollowing((current) => ({ ...current, [name]: !current[name] }))}
                                        className="rounded-full px-4"
                                    >
                                        <AppText variant="caption" weight="bold" colorToken={isFollowing ? "textInverse" : "textPrimary"}>
                                            {isFollowing ? T_FOLLOWING[language] : T_FOLLOW[language]}
                                        </AppText>
                                    </Button>
                                </View>
                            );
                        })}
                    </View>
                </View>
            ) : null}
        </ScrollView>
    );
}

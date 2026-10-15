import { features } from "@/config/features";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { apiGet, type Bilingual, type ArticleCard, type BriefCard, type FactCard, type HistoryEpisode, type LeaderCard } from "@/api/client";
import { PageHeader } from "@/ui/PageHeader";
import { StateView } from "@/ui/StateView";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";
import { clearRecentSearches, readRecentSearches, rememberSearch } from "@/storage/prefs";
import { fontFor, typography, layout, spacing } from "@/theme/tokens";

type SearchPayload = {
    articles: ArticleCard[];
    authors: Bilingual[];
    leaders: LeaderCard[];
    briefs: BriefCard[];
    factChecks: FactCard[];
    episodes: HistoryEpisode[];
};

type FilterId = "all" | "latest" | "articles" | "columns" | "authors";

type Hit = {
    key: string;
    title: string;
    meta: string;
    href: string;
    kind: "story" | "leader" | "other";
    source?: ArticleCard["source"];
    publishedAt?: string;
};

const FILTERS: { id: FilterId; label: { en: string; ne: string } }[] = [
    { id: "all", label: ui.filterAll },
    { id: "latest", label: ui.filterLatest },
    { id: "articles", label: ui.filterArticles },
    { id: "columns", label: ui.filterColumns },
    { id: "authors", label: ui.filterAuthors },
];

function HighlightedTitle({ title, query, nepali }: { title: string; query: string; nepali: boolean }) {
    const colors = useColors();
    const needle = query.trim();
    const parts = needle
        ? title.split(new RegExp(`(${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"))
        : [title];
    const language = nepali ? "ne" : "en";
    const fontFamily = fontFor(language, "editorial", "bold");
    const strongFamily = fontFor(language, "editorial", "black");

    return (
        <Text style={{ color: colors.textPrimary, fontSize: typography.heading3.size, lineHeight: typography.heading3.lineHeight, fontFamily }}>
            {parts.map((part, index) => (
                <Text
                    key={`${part}-${index}`}
                    style={part.toLowerCase() === needle.toLowerCase() ? { color: colors.brandRed, fontFamily: strongFamily } : undefined}
                >
                    {part}
                </Text>
            ))}
        </Text>
    );
}

export default function SearchScreen() {
    const colors = useColors();
    const { language } = useLanguage();
    const params = useLocalSearchParams<{ q?: string }>();
    const [text, setText] = useState(typeof params.q === "string" ? params.q : "");
    const [queryText, setQueryText] = useState(text.trim());
    const [filter, setFilter] = useState<FilterId>("all");
    const [recent, setRecent] = useState(readRecentSearches);

    useEffect(() => {
        const timer = setTimeout(() => {
            const nextQuery = text.trim();
            setQueryText(nextQuery);
            if (nextQuery.length >= 2) {
                rememberSearch(nextQuery);
                setRecent(readRecentSearches());
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [text]);

    const query = useQuery({
        queryKey: ["search", queryText],
        enabled: queryText.length >= 2,
        queryFn: () => apiGet<SearchPayload>(`/api/v1/search?q=${encodeURIComponent(queryText)}`),
    });

    const hits = useMemo<Hit[]>(() => {
        const data = query.data;
        if (!data) return [];
        const stories: Hit[] = data.articles.map((item) => ({
            key: `${item.source}-${item.slug}`,
            title: pick(item.title, language),
            meta: pick(item.category, language),
            href: `/article/${item.slug}`,
            kind: "story" as const,
            source: item.source,
            publishedAt: item.publishedAt,
        }));
        const leaders: Hit[] = data.leaders.map((item) => ({
            key: `leader-${item.slug}`,
            title: pick(item.name, language),
            meta: pick(item.position, language),
            href: `/leader/${item.slug}`,
            kind: "leader" as const,
        }));
        const rest: Hit[] = [
            ...data.briefs.map((item) => ({
                key: `brief-${item.slug}`,
                title: pick(item.title, language),
                meta: pick(ui.read, language),
                href: `/brief/${item.slug}`,
                kind: "other" as const,
            })),
            ...(features.factChecks ? data.factChecks : []).map((item) => ({
                key: `fact-${item.slug}`,
                title: pick(item.claim, language),
                meta: pick(ui.factCheck, language),
                href: `/fact-check/${item.slug}`,
                kind: "other" as const,
            })),
            ...data.episodes.map((item) => ({
                key: `history-${item.id}`,
                title: pick(item.title, language),
                meta: pick(ui.history, language),
                href: `/history/${item.id}`,
                kind: "other" as const,
            })),
        ];

        if (filter === "authors") return data.authors.map((name) => ({ key: `author-${name.en || name.ne}`, title: pick(name, language), meta: language === "ne" ? "लेखक" : "Author", href: `/author/${encodeURIComponent(name.en || name.ne)}`, kind: "other" as const }));
        if (filter === "articles") return stories.filter((item) => item.source === "article");
        if (filter === "columns") return stories.filter((item) => item.source === "column");
        if (filter === "latest") {
            return [...stories].sort((a, b) => Date.parse(b.publishedAt || "") - Date.parse(a.publishedAt || ""));
        }
        return [...stories, ...leaders, ...rest];
    }, [filter, language, query.data]);

    const searching = queryText.length >= 2;

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <FlashList
                data={searching ? hits : []}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                keyExtractor={(item) => item.key}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    <View>
                        <PageHeader title={pick(ui.search, language)} />
                        <TextInput
                            value={text}
                            onChangeText={setText}
                            placeholder={pick(ui.searchPrompt, language)}
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="search"
                            style={{
                                minHeight: layout.controlHeight,
                                borderRadius: 14,
                                backgroundColor: colors.surfaceSecondary,
                                color: colors.textPrimary,
                                fontFamily: fontFor(language, "ui", "regular"),
                                fontSize: typography.body.size,
                                lineHeight: typography.body.lineHeight,
                                paddingHorizontal: spacing.gutter,
                                marginBottom: 16,
                            }}
                        />
                        {searching ? (
                            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
                                {FILTERS.map((item) => {
                                    const active = filter === item.id;
                                    return (
                                        <Pressable
                                            key={item.id}
                                            accessibilityRole="button"
                                            accessibilityState={{ selected: active }}
                                            onPress={() => setFilter(item.id)}
                                            style={{ minHeight: layout.controlHeight, justifyContent: "center", paddingRight: 16 }}
                                        >
                                            <AppText variant="meta" style={{ color: active ? colors.brandRed : colors.textSecondary }}>
                                                {pick(item.label, language)}
                                            </AppText>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        ) : recent.length > 0 ? (
                            <View style={{ marginBottom: 8 }}>
                                <View style={{ minHeight: layout.controlHeight, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                    <AppText variant="meta" style={{ color: colors.textMuted }}>{pick(ui.recent, language)}</AppText>
                                    <Pressable
                                        accessibilityRole="button"
                                        onPress={() => {
                                            clearRecentSearches();
                                            setRecent([]);
                                        }}
                                        style={{ minHeight: layout.controlHeight, justifyContent: "center", paddingHorizontal: 4 }}
                                    >
                                        <AppText variant="meta" style={{ color: colors.textSecondary }}>{pick(ui.clear, language)}</AppText>
                                    </Pressable>
                                </View>
                                {recent.map((item) => (
                                    <Pressable
                                        key={item}
                                        accessibilityRole="button"
                                        onPress={() => setText(item)}
                                        style={{ minHeight: layout.controlHeight, justifyContent: "center", borderTopWidth: 1, borderTopColor: colors.border }}
                                    >
                                        <AppText variant="body" style={{ color: colors.textPrimary }}>{item}</AppText>
                                    </Pressable>
                                ))}
                            </View>
                        ) : null}
                        {query.isFetching ? <StateView loading /> : null}
                        {query.error ? <StateView error={query.error} onRetry={() => query.refetch()} /> : null}
                        {searching && !query.isFetching && !query.error && hits.length === 0 ? (
                            <AppText variant="body" style={{ color: colors.textSecondary, marginTop: 12 }}>
                                {language === "ne"
                                    ? `“${queryText}” का लागि कुनै सामग्री भेटिएन।`
                                    : `No ${filter === "authors" ? "authors" : "results"} found for “${queryText}”.`}
                            </AppText>
                        ) : null}
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => router.push(item.href as never)}
                        style={{ minHeight: layout.controlHeight, justifyContent: "center", paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}
                    >
                        <HighlightedTitle title={item.title} query={queryText} nepali={language === "ne"} />
                        {item.meta ? (
                            <AppText variant="meta" style={{ color: colors.textMuted, marginTop: 4 }}>{item.meta}</AppText>
                        ) : null}
                    </Pressable>
                )}
            />
        </View>
    );
}

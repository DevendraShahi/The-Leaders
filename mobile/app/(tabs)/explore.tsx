import { useAppStore } from "@/state/useAppStore";
import { layout, radius, spacing, textStyleFor } from "@/theme/tokens";
import { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, Bookmark, Search } from "lucide-react-native";
import { apiGet, type ArticleCard, type Bilingual, type HomePayload, type Page } from "@/api/client";
import { PageHeader } from "@/ui/PageHeader";
import { SectionHeader } from "@/ui/SectionHeader";
import { StoryCard } from "@/ui/StoryCard";
import { ArticleRow } from "@/ui/ArticleRow";
import { StateView } from "@/ui/StateView";
import { AppText } from "@/ui/primitives/AppText";
import { Button } from "@/components/ui/button";
import { useLanguage, pick } from "@/i18n/language";
import { readRecentSearches } from "@/storage/prefs";
import { useColors } from "@/theme/Theme";
import { readingLabel, storyDate } from "@/utils/editorial";

function uniqueArticles(items: ArticleCard[]) {
    return [...new Map(items.map(item => [`${item.source}-${item.slug}`, item])).values()];
}
function uniqueTopics(items: ArticleCard[]) {
    return [...new Map(items.filter(item => (item.category.en || item.category.ne).trim()).map(item => [(item.category.en || item.category.ne).trim().toLowerCase(), item.category])).values()];
}
function uniqueAuthors(items: ArticleCard[]) {
    return [...new Map(items.filter(item => (item.author.en || item.author.ne).trim()).map(item => [(item.author.en || item.author.ne).trim(), item.author])).entries()];
}
function openCategory(category: Bilingual) {
    router.push(`/category/${encodeURIComponent(category.en || category.ne)}?ne=${encodeURIComponent(category.ne || category.en)}` as never);
}
function openSearch(query: string) {
    const term = query.trim();
    router.push((term.length >= 2 ? `/search?q=${encodeURIComponent(term)}` : "/search") as never);
}

export default function ExploreScreen() {
    const colors = useColors();
    const { language } = useLanguage();
    const isNe = language === "ne";
    const [query, setQuery] = useState("");
    const [recent, setRecent] = useState<string[]>([]);
    const [showAllTopics, setShowAllTopics] = useState(false);
    const followedAuthors = useAppStore(state => state.followedAuthors);
    const savedCount = useAppStore(state => state.savedArticleIds.length);
    const toggleFollowedAuthor = useAppStore(state => state.toggleFollowedAuthor);
    const articles = useQuery({ queryKey: ["articles", "discover"], queryFn: () => apiGet<Page<ArticleCard>>("/api/v1/articles?page=1&limit=50") });
    const home = useQuery({ queryKey: ["home", "discover"], queryFn: () => apiGet<HomePayload>("/api/v1/home") });
    useFocusEffect(useCallback(() => { setRecent(readRecentSearches().slice(0, 4)); }, []));
    const cards = useMemo(() => uniqueArticles([...(articles.data?.items ?? []), ...(home.data?.articles ?? []), ...(home.data?.coverage ?? [])]), [articles.data, home.data]);
    const topics = useMemo(() => uniqueTopics(cards), [cards]);
    const authors = useMemo(() => uniqueAuthors(home.data?.coverage ?? []), [home.data]);
    const featured = home.data?.articles?.[0] ?? articles.data?.items?.[0];
    const suggestions = cards.filter(item => !featured || item.source !== featured.source || item.slug !== featured.slug).slice(0, 4);
    const loading = (articles.isPending || home.isPending) && cards.length === 0;
    const unavailable = !loading && cards.length === 0 && Boolean(articles.error || home.error);
    const refresh = () => { void Promise.all([articles.refetch(), home.refetch()]); };
    const visibleTopics = showAllTopics ? topics : topics.slice(0, 8);

    return <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <PageHeader compact title={isNe ? "अन्वेषण" : "Explore"} subtitle={isNe ? "विषय, समाचार र लेखक खोज्नुहोस्" : "Find stories, topics and voices"} />
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={articles.isRefetching || home.isRefetching} onRefresh={refresh} tintColor={colors.brandRed} colors={[colors.brandRed]} />}>
            <View style={styles.gutter}>
                <View style={[styles.search, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                    <Search size={layout.iconSize} color={colors.textSecondary} />
                    <TextInput accessibilityLabel={isNe ? "समाचार, विषय वा लेखक खोज्नुहोस्" : "Search stories, topics or authors"}
                        value={query} onChangeText={setQuery} onSubmitEditing={() => openSearch(query)} returnKeyType="search"
                        placeholder={isNe ? "समाचार, विषय वा लेखक" : "Stories, topics or authors"} placeholderTextColor={colors.textSecondary}
                        style={[styles.input, textStyleFor("bodySmall", language), { color: colors.textPrimary }]} />
                    {query.trim().length >= 2 ? <Button variant="ghost" size="icon" accessibilityLabel={isNe ? "खोज्नुहोस्" : "Search"} onPress={() => openSearch(query)}><ArrowRight size={layout.iconSmall} color={colors.brandRed} /></Button> : null}
                </View>
                {recent.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recent}>
                    <AppText variant="caption" colorToken="textTertiary">{isNe ? "हालका खोजहरू" : "Recent"}</AppText>
                    {recent.map(term => <Pressable key={term} accessibilityRole="button" accessibilityLabel={isNe ? `${term} खोज्नुहोस्` : `Search for ${term}`} onPress={() => openSearch(term)} style={[styles.recentTerm, { borderColor: colors.border }]}><AppText variant="caption" colorToken="textSecondary" numberOfLines={1}>{term}</AppText></Pressable>)}
                </ScrollView> : null}
                <Pressable accessibilityRole="button" accessibilityLabel={isNe ? "सुरक्षित समाचार खोल्नुहोस्" : "Open saved stories"} onPress={() => router.push("/saved")} style={[styles.saved, { borderBottomColor: colors.border }]}>
                    <Bookmark size={layout.iconSize} color={colors.brandRed} />
                    <View style={styles.copy}><AppText variant="label">{isNe ? "सुरक्षित समाचार" : "Saved stories"}</AppText><AppText variant="caption" colorToken="textSecondary">{savedCount ? (isNe ? `${savedCount} समाचार यस उपकरणमा` : `${savedCount} ${savedCount === 1 ? "story" : "stories"} on this device`) : (isNe ? "पछिका लागि आफ्नो सूची बनाउनुहोस्" : "Build your reading list for later")}</AppText></View>
                    <ArrowRight size={layout.iconSmall} color={colors.textSecondary} />
                </Pressable>
            </View>
            {loading ? <StateView loading /> : unavailable ? <View style={styles.gutter}><StateView error={articles.error || home.error} onRetry={refresh} /></View> : null}
            {visibleTopics.length ? <View style={styles.section}>
                <View style={styles.sectionTitle}><View style={styles.copy}><SectionHeader title={isNe ? "विषयहरू" : "Browse topics"} /></View>
                    {topics.length > 8 ? <Button variant="ghost" size="sm" onPress={() => setShowAllTopics(value => !value)}><AppText variant="caption" colorToken="brandRed">{showAllTopics ? (isNe ? "कम देखाउनुहोस्" : "Show less") : (isNe ? "सबै हेर्नुहोस्" : "View all")}</AppText></Button> : null}
                </View>
                <View style={styles.topics}>{visibleTopics.map(topic => <Pressable key={topic.en || topic.ne} accessibilityRole="button" accessibilityLabel={pick(topic, language)} onPress={() => openCategory(topic)} style={[styles.topic, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
                    <AppText variant="label" style={styles.copy}>{pick(topic, language)}</AppText><ArrowUpRight size={layout.iconSmall} color={colors.textTertiary} />
                </Pressable>)}</View>
            </View> : null}
            {featured ? <View style={styles.featured}>
                <View style={styles.gutter}><SectionHeader title={isNe ? "विशेष समाचार" : "Featured story"} /></View>
                <StoryCard variant="standard" recyclingKey={`${featured.source}-${featured.slug}`} title={pick(featured.title, language)} kicker={pick(featured.category, language)}
                    summary={pick(featured.excerpt, language)} image={featured.image}
                    meta={[storyDate(featured.publishedAt, language), readingLabel(featured.readingMinutes?.[language], language)].filter(Boolean).join(" · ")}
                    onPress={() => router.push(`/article/${featured.slug}` as never)} />
            </View> : null}
            {suggestions.length ? <View style={styles.section}><SectionHeader title={isNe ? "थप पढ्नुहोस्" : "More to discover"} />
                {suggestions.map(item => <ArticleRow key={`${item.source}-${item.slug}`} recyclingKey={`${item.source}-${item.slug}`} title={pick(item.title, language)} kicker={pick(item.category, language)} image={item.image} meta={readingLabel(item.readingMinutes?.[language], language)} onPress={() => router.push(`/article/${item.slug}` as never)} />)}
            </View> : null}
            {authors.length ? <View style={styles.section}><SectionHeader title={isNe ? "लेखकहरू" : "Voices to follow"} />
                {authors.map(([name, author]) => {
                    const following = followedAuthors.includes(name);
                    const displayedName = pick(author, language);
                    const initials = displayedName.trim().split(/\s+/).slice(0, 2).map(part => Array.from(part)[0]).join("").toUpperCase();
                    return <View key={name} style={[styles.author, { borderTopColor: colors.border }]}>
                        <Pressable accessibilityRole="button" accessibilityLabel={displayedName} onPress={() => router.push(`/author/${encodeURIComponent(name)}` as never)} style={styles.authorIdentity}>
                            <View accessible={false} style={[styles.initials, { backgroundColor: colors.surfaceSecondary }]}><AppText variant="label" colorToken="textSecondary">{initials}</AppText></View>
                            <AppText variant="label" style={styles.copy}>{displayedName}</AppText>
                        </Pressable>
                        <Button variant={following ? "secondary" : "outline"} size="sm" accessibilityLabel={isNe ? `${displayedName}: ${following ? "फलो हटाउनुहोस्" : "फलो गर्नुहोस्"}` : `${following ? "Unfollow" : "Follow"} ${displayedName}`} accessibilityState={{ selected: following }} onPress={() => toggleFollowedAuthor(name)}>
                            <AppText variant="caption" weight="semibold" colorToken={following ? "brandRed" : "textPrimary"}>{following ? (isNe ? "फलो गर्दै" : "Following") : (isNe ? "फलो" : "Follow")}</AppText>
                        </Button>
                    </View>;
                })}
            </View> : null}
            {!loading && !unavailable && !cards.length ? <View style={styles.gutter}><StateView empty /></View> : null}
        </ScrollView>
    </View>;
}
const styles = StyleSheet.create({
    screen: { flex: 1 },
    content: { paddingTop: spacing.lg, paddingBottom: spacing["2xl"] },
    gutter: { paddingHorizontal: spacing.gutter },
    copy: { flex: 1, minWidth: 0 },
    search: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingLeft: spacing.md, paddingRight: spacing.xs, minHeight: layout.controlHeight, borderWidth: layout.ruleWidth, borderRadius: radius.md },
    input: { flex: 1, minWidth: 0, minHeight: layout.controlHeight, paddingVertical: spacing.sm, paddingHorizontal: 0 },
    recent: { alignItems: "center", gap: spacing.sm, paddingTop: spacing.sm },
    recentTerm: { minHeight: layout.touchTarget, justifyContent: "center", maxWidth: 220, paddingHorizontal: spacing.md, borderWidth: layout.ruleWidth, borderRadius: radius.full },
    saved: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.lg, borderBottomWidth: layout.ruleWidth },
    section: { paddingHorizontal: spacing.gutter, marginTop: spacing.xl },
    sectionTitle: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    topics: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    topic: { flexBasis: "47%", flexGrow: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, minHeight: layout.controlHeight, borderWidth: layout.ruleWidth, borderRadius: radius.sm },
    featured: { marginTop: spacing.xl },
    author: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.md, borderTopWidth: layout.ruleWidth },
    authorIdentity: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: layout.touchTarget },
    initials: { width: layout.touchTarget, height: layout.touchTarget, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
});

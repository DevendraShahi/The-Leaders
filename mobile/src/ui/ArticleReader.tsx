import { recordUsage } from "@/services/telemetry";
import { useState, useEffect, useRef } from "react";
import { Platform, ScrollView, Share, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bookmark, Share2 } from "lucide-react-native";
import { MarkdownBody } from "./MarkdownBody";
import { AppText } from "./primitives/AppText";
import { ArticleRow } from "./ArticleRow";
import { SectionHeader } from "./SectionHeader";
import { SegmentedControl } from "./Settings";
import { Button } from "@/components/ui/button";
import { pick, useLanguage } from "@/i18n/language";
import { useColors } from "@/theme/Theme";
import { useAppStore, type ReaderScale } from "@/state/useAppStore";
import { layout, radius, spacing } from "@/theme/tokens";
import { storyDate, estimateReadingMinutes } from "@/utils/editorial";
import type { ArticleCard, ArticleDetail } from "@/api/client";

export function articleWebUrl(article: Pick<ArticleDetail, "source" | "slug">) {
    const path = article.source === "column" ? "/coverage/columns/" : article.source === "analysis" ? "/election-2026/analyses/" : "/articles/";
    return `https://the-leadersnp.com${path}${article.slug}`;
}
export function ArticleSkeleton() {
    const colors = useColors();
    return <View accessibilityLabel="Loading article" accessibilityState={{ busy: true }} style={[styles.content, { gap: spacing.lg }]}>
        {[0.4, 1, 0.8, 0.95, 0.6].map((fraction, index) => <View key={index} style={{ width: `${fraction * 100}%`, height: index < 3 ? spacing.xl : spacing.lg, borderRadius: radius.xs, backgroundColor: colors.skeleton }} />)}
        <View style={{ width: "100%", aspectRatio: layout.leadImageRatio, backgroundColor: colors.skeleton, borderRadius: radius.sm }} />
    </View>;
}
export function ArticleReader({ article, related, saved, onToggleSave }: { article: ArticleDetail; related: ArticleCard[]; saved: boolean; onToggleSave: () => void }) {
    const { language, toggleLanguage, setLanguage } = useLanguage();
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const scale = useAppStore(state => state.readerScale);
    const setScale = useAppStore(state => state.setReaderScale);
    const showProgress = useAppStore(state => state.readingProgressBar);
    const [progress, setProgress] = useState(0);
    const [sizesOpen, setSizesOpen] = useState(false);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const reportedComplete = useRef(false);
    useEffect(() => { recordUsage("article_open"); }, [article.slug]);
    const ne = language === "ne";
    const t = (en: string, np: string) => ne ? np : en;
    const title = pick(article.title, language);
    const author = pick(article.author, language);
    const category = pick(article.category, language);
    const body = (ne ? article.content.ne : article.content.en).trim();
    const excerpt = (ne ? article.excerpt.ne : article.excerpt.en).trim();
    const missing = article.availableLanguages ? !article.availableLanguages.includes(language) : !body;
    const minutes = estimateReadingMinutes(body);
    const date = new Intl.DateTimeFormat(ne ? "ne-NP" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kathmandu" });
    const published = new Date(article.publishedAt);
    const dateLabel = Number.isFinite(published.getTime()) ? date.format(published) : "";
    const share = () => { const url = articleWebUrl(article); void Share.share(Platform.OS === "ios" ? { message: title, url } : { message: `${title}\n${url}` }).catch(() => undefined); };
    return <View style={{ flex: 1, backgroundColor: colors.background }}>
        {showProgress ? <View accessible={false} style={{ height: 2, backgroundColor: colors.border }}><View style={{ height: "100%", width: `${Math.round(progress * 100)}%`, backgroundColor: colors.brandRed }} /></View> : null}
        <View style={[styles.toolbar, { borderBottomColor: colors.border }]}>
            <Button variant="ghost" accessibilityLabel={t("Article text size", "लेखको अक्षर आकार")} accessibilityState={{ expanded: sizesOpen }} onPress={() => setSizesOpen(!sizesOpen)}><AppText variant="label">Aa</AppText></Button>
            <Button variant="ghost" onPress={toggleLanguage} accessibilityLabel={ne ? "Switch to English" : "नेपालीमा पढ्नुहोस्"}><AppText variant="label" colorToken="brandRed">{ne ? "English" : "नेपाली"}</AppText></Button>
            <View style={{ flex: 1 }} />
            <Button variant="ghost" size="icon" accessibilityLabel={t(saved ? "Remove saved story" : "Save story", saved ? "सुरक्षित समाचार हटाउनुहोस्" : "समाचार सुरक्षित गर्नुहोस्")} accessibilityState={{ selected: saved }} onPress={onToggleSave}><Bookmark size={layout.iconSize} color={saved ? colors.brandRed : colors.textSecondary} fill={saved ? colors.brandRed : "transparent"} /></Button>
            <Button variant="ghost" size="icon" accessibilityLabel={t("Share story", "समाचार सेयर गर्नुहोस्")} onPress={share}><Share2 size={layout.iconSize} color={colors.textSecondary} /></Button>
        </View>
        {sizesOpen ? <View style={styles.preferences}><SegmentedControl<ReaderScale> label={t("Article text size", "लेखको अक्षर आकार")} value={scale} onChange={setScale} options={[{ value: "sm", label: t("Small", "सानो") }, { value: "md", label: t("Default", "सामान्य") }, { value: "lg", label: t("Large", "ठूलो") }, { value: "xl", label: t("Largest", "अति ठूलो") }]} /></View> : null}
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing["3xl"] }]} scrollEventThrottle={32} onScroll={({ nativeEvent: event }) => {
            const scrollable = event.contentSize.height - event.layoutMeasurement.height;
            const next = scrollable > 0 ? Math.max(0, Math.min(1, event.contentOffset.y / scrollable)) : 1;
            setProgress(next);
            if (next >= 0.9 && !reportedComplete.current && !missing) { reportedComplete.current = true; recordUsage("article_complete"); }
        }}>
            {category ? <AppText variant="overline" colorToken="brandRed">{category}</AppText> : null}
            <AppText accessibilityRole="header" variant="display">{title}</AppText>
            {excerpt && !missing ? <View style={{ gap: spacing.xs }}><AppText variant="body" colorToken="textSecondary" numberOfLines={summaryOpen ? undefined : 4}>{excerpt}</AppText>{excerpt.length > 280 ? <Button variant="ghost" onPress={() => setSummaryOpen(!summaryOpen)} accessibilityState={{ expanded: summaryOpen }}><AppText variant="caption" colorToken="brandRed">{summaryOpen ? t("Collapse summary", "सारांश छोट्याउनुहोस्") : t("Read full summary", "पूरा सारांश पढ्नुहोस्")}</AppText></Button> : null}</View> : null}
            <View style={[styles.metadata, { borderBottomColor: colors.border }]}>
                {author ? <AppText variant="label">{t(`By ${author}`, author)}</AppText> : null}
                <AppText variant="meta" colorToken="textSecondary">{[dateLabel, body && !missing ? t(`${minutes} min read`, `${minutes} मिनेट पढाइ`) : ""].filter(Boolean).join(" · ")}</AppText>
            </View>
            {article.image ? <Image source={{ uri: article.image }} recyclingKey={article.slug} contentFit="cover" accessibilityLabel={title} style={{ width: "100%", aspectRatio: layout.leadImageRatio, borderRadius: radius.sm, backgroundColor: colors.surfaceSecondary }} /> : null}
            {missing ? <View style={styles.preferences}><AppText variant="body">{t("English version unavailable", "नेपाली संस्करण उपलब्ध छैन")}</AppText><Button variant="outline" onPress={() => setLanguage(ne ? "en" : "ne")}><AppText variant="label">{ne ? "View English" : "नेपालीमा पढ्नुहोस्"}</AppText></Button></View> : <MarkdownBody source={body} scale={scale} leading="regular" editorial />}
            {related.length ? <View style={{ marginTop: spacing.xl }}><SectionHeader title={t("Related stories", "सम्बन्धित समाचार")} />{related.map(item => <ArticleRow key={`${item.source}-${item.slug}`} title={pick(item.title, language)} kicker={pick(item.category, language)} image={item.image} meta={storyDate(item.publishedAt, language)} onPress={() => router.push(`/article/${item.slug}` as never)} />)}</View> : null}
        </ScrollView>
    </View>;
}
const styles = StyleSheet.create({
    toolbar: { paddingHorizontal: spacing.gutter, paddingVertical: spacing.xs, flexDirection: "row", alignItems: "center", flexWrap: "wrap", borderBottomWidth: layout.ruleWidth },
    content: { paddingHorizontal: spacing.gutter, paddingTop: spacing.lg, width: "100%", maxWidth: layout.readerMaxWidth, alignSelf: "center", gap: spacing.lg },
    metadata: { gap: spacing.xs, paddingBottom: spacing.lg, borderBottomWidth: layout.ruleWidth },
    preferences: { padding: spacing.card, gap: spacing.md },
});

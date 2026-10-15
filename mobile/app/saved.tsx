import { layout } from "@/theme/tokens";
import { StatusDot } from "@/ui/StatusDot";
import { Pressable, Share as NativeShare, View } from "react-native";
import { useMemo } from "react";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { BookOpen, BookmarkCheck, Share2, Trash2 } from "lucide-react-native";

import { PageHeader } from "@/ui/PageHeader";
import { useColors } from "@/theme/Theme";
import { StateView } from "@/ui/StateView";
import { AppText } from "@/ui/primitives/AppText";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/language";
import { listSaved, removeSaved, type SavedArticle } from "@/storage/saved";
import { useAppStore } from "@/state/useAppStore";

const COPY = {
    title: { en: "Saved", ne: "सुरक्षित" },
    library: { en: "Your reading library", ne: "तपाईंको पढाइ संग्रह" },
    stored: { en: "saved on this device", ne: "यस उपकरणमा सुरक्षित" },
    saved: { en: "Saved", ne: "सुरक्षित" },
    read: { en: "Read", ne: "पढ्नुहोस्" },
    share: { en: "Share story", ne: "समाचार सेयर गर्नुहोस्" },
    remove: { en: "Remove saved story", ne: "सुरक्षित समाचार हटाउनुहोस्" },
    opinion: { en: "Opinion", ne: "विचार" },
    story: { en: "Story", ne: "समाचार" },
    minRead: { en: "min read", ne: "मिनेट पढाइ" },
} as const;

function readingMinutes(text: string) {
    if (!text) return 1;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

function storedBytes(article: SavedArticle) {
    return new Blob([JSON.stringify(article)]).size;
}

function formatStorage(bytes: number) {
    if (bytes === 0) return "0 B";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string, language: "en" | "ne") {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return language === "ne" ? "हालै" : "recently";
    const months = language === "ne"
        ? ["जन", "फेब", "मार्च", "अप्र", "मे", "जुन", "जुल", "अग", "सेप", "अक्टो", "नोभ", "डिसे"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

function savedArticleWebUrl(article: SavedArticle) {
    if (article.source === "column") return `https://the-leadersnp.com/coverage/columns/${article.slug}`;
    if (article.source === "analysis") return `https://the-leadersnp.com/election-2026/analyses/${article.slug}`;
    return `https://the-leadersnp.com/articles/${article.slug}`;
}

export default function SavedScreen() {
    const colors = useColors();
    const { language } = useLanguage();
    const isNe = language === "ne";
    const savedIds = useAppStore((state) => state.savedArticleIds);
    const setSavedArticleSaved = useAppStore((state) => state.setSavedArticleSaved);
    const savedArticles = listSaved().filter((article) => savedIds.includes(article.slug));
    const totalStorage = useMemo(
        () => savedArticles.reduce((total, article) => total + storedBytes(article), 0),
        [savedArticles]
    );
    const handleDelete = (slug: string) => {
        removeSaved(slug);
        setSavedArticleSaved(slug, false);
    };

    const shareArticle = (article: SavedArticle) => {
        const title = isNe ? article.titleNe || article.titleEn : article.titleEn || article.titleNe;
        NativeShare.share({ message: `${title}\n${savedArticleWebUrl(article)}` }).catch(() => undefined);
    };

    return (
        <View className="flex-1 bg-background">
            <FlashList
                data={savedArticles}
                contentContainerStyle={{ paddingBottom: 80 }}
                keyExtractor={(item) => item.slug}
                ListHeaderComponent={
                    <View className="bg-background">
                        <PageHeader title={COPY.title[language]} onBack={() => router.replace("/explore")} backLabel={isNe ? "अन्वेषणमा फर्कनुहोस्" : "Back to Explore"} />
                        <View className="px-gutter pb-6">
                        <View className="mb-5 flex-row items-end justify-between gap-4">
                            <View className="min-w-0 flex-1">
                                <AppText variant="caption" colorToken="textSecondary" style={{ marginTop: 4 }}>
                                    {COPY.library[language]}
                                </AppText>
                            </View>
                            <View className="mb-1 flex-row items-center gap-2 rounded-full bg-surface-secondary px-3 py-2">
                                <BookmarkCheck size={layout.iconSmall} color={colors.brandRed} />
                                <AppText variant="caption" weight="bold">
                                    {savedArticles.length}
                                </AppText>
                            </View>
                        </View>

                        <View className="flex-row items-center gap-3 rounded-lg border border-border bg-surface-secondary px-4 py-3">
                            <StatusDot color="success" />
                            <AppText variant="caption" colorToken="textSecondary" style={{ flex: 1 }}>
                                <AppText variant="caption" weight="bold" colorToken="textPrimary">
                                    {formatStorage(totalStorage)}
                                </AppText>
                                {` · ${savedArticles.length} ${COPY.stored[language]}`}
                            </AppText>
                        </View>
                    </View>
                    </View>
                }
                ListEmptyComponent={<StateView empty />}
                ItemSeparatorComponent={() => <View className="mx-gutter h-px bg-border" />}
                renderItem={({ item }) => {
                    const title = isNe ? item.titleNe || item.titleEn : item.titleEn || item.titleNe;
                    const minutes = readingMinutes(item.contentEn || item.contentNe);
                    const storage = formatStorage(storedBytes(item));
                    const sourceLabel = item.source === "column" ? COPY.opinion[language] : COPY.story[language];

                    return (
                        <View className="bg-background px-gutter py-6">
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`${COPY.read[language]}: ${title}`}
                                onPress={() => router.push(`/article/${item.slug}`)}
                                className="active:opacity-75"
                            >
                                <View className="flex-row flex-wrap items-center gap-2">
                                    <View className="flex-row items-center gap-1.5 rounded bg-primary/10 px-1.5 py-0.5">
                                        <BookmarkCheck size={layout.iconSmall} color={colors.brandRed} />
                                        <AppText variant="caption" weight="bold" colorToken="brandRed">
                                            {COPY.saved[language].toUpperCase()}
                                        </AppText>
                                    </View>
                                    <AppText variant="overline" weight="bold" colorToken="textSecondary">
                                        {sourceLabel}
                                    </AppText>
                                    <AppText variant="caption" colorToken="textSecondary">•</AppText>
                                    <AppText variant="caption" colorToken="textSecondary">
                                        {minutes} {COPY.minRead[language]}
                                    </AppText>
                                </View>

                                <AppText
                                    variant="heading2"
                                    weight={isNe ? "semibold" : "bold"}
                                    numberOfLines={3}
                                    style={{ marginTop: 10 }}
                                >
                                    {title}
                                </AppText>

                                <View className="mt-3 flex-row items-center gap-2">
                                    <AppText variant="caption" colorToken="textSecondary">
                                        {COPY.saved[language]} {formatDate(item.savedAt, language)}
                                    </AppText>
                                    <View className="h-1 w-1 rounded-full bg-border" />
                                    <AppText variant="caption" colorToken="textSecondary">{storage}</AppText>
                                </View>
                            </Pressable>

                            <View className="mt-5 flex-row items-center justify-between">
                                <Button
                                    accessibilityLabel={`${COPY.read[language]}: ${title}`}
                                    onPress={() => router.push(`/article/${item.slug}`)}
                                    className="gap-2 rounded-full px-4"
                                >
                                    <BookOpen size={layout.iconSmall} color={colors.onPrimary} />
                                    <AppText variant="body" weight="bold" colorToken="textInverse">
                                        {COPY.read[language]}
                                    </AppText>
                                </Button>

                                <View className="flex-row items-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        accessibilityLabel={COPY.share[language]}
                                        onPress={() => shareArticle(item)}
                                        className="rounded-full"
                                    >
                                        <Share2 size={layout.iconSize} color={colors.textSecondary} />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        accessibilityLabel={COPY.remove[language]}
                                        onPress={() => handleDelete(item.slug)}
                                        className="rounded-full"
                                    >
                                        <Trash2 size={layout.iconSize} color={colors.textSecondary} />
                                    </Button>
                                </View>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
}

import { toggleBookmark, saveCompleteArticle } from "@/services/bookmarks";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { apiGet, type ArticleCard, type ArticleDetail, type Page } from "@/api/client";
import { ArticleReader, ArticleSkeleton } from "@/ui/ArticleReader";
import { StateView } from "@/ui/StateView";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";
import { readSaved, type SavedArticle } from "@/storage/saved";
import { useAppStore } from "@/state/useAppStore";

function localArticle(savedArticle: SavedArticle): ArticleDetail {
    const source = savedArticle.source === "column" || savedArticle.source === "analysis"
        ? savedArticle.source
        : "article";

    return {
        slug: savedArticle.slug,
        source,
        title: { en: savedArticle.titleEn, ne: savedArticle.titleNe },
        excerpt: { en: savedArticle.excerptEn, ne: savedArticle.excerptNe },
        content: { en: savedArticle.contentEn, ne: savedArticle.contentNe },
        author: { en: "", ne: "" },
        category: { en: "Saved", ne: "सुरक्षित" },
        image: "",
        publishedAt: "",
        tags: [],
    };
}

export default function ArticleScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const colors = useColors();
    const { language } = useLanguage();
    const query = useQuery({
        queryKey: ["article", slug],
        enabled: Boolean(slug),
        queryFn: () => apiGet<ArticleDetail>(`/api/v1/articles/${slug}`),
    });
    const relatedQuery = useQuery({
        queryKey: ["articles", "page", 1],
        enabled: Boolean(query.data),
        queryFn: () => apiGet<Page<ArticleCard>>("/api/v1/articles?page=1&limit=20"),
    });
    const saved = useAppStore((state) => (slug ? state.savedArticleIds.includes(slug) : false));

    const savedCopy = useMemo(() => (slug ? readSaved(slug) : null), [slug]);
    const article = query.data ?? savedCopy?.article ?? (savedCopy ? localArticle(savedCopy) : undefined);
    useEffect(() => {
        if (saved && query.data) saveCompleteArticle(query.data, savedCopy?.savedAt);
    }, [saved, query.data, savedCopy?.savedAt]);
    const related = (relatedQuery.data?.items ?? []).filter((item) =>
        item.slug !== article?.slug &&
        Boolean(article?.category.en) &&
        item.category.en === article?.category.en
    ).slice(0, 4);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack.Screen options={{ 
                title: "", 
                headerBackTitle: "Back", 
                headerShadowVisible: false, 
                headerStyle: { backgroundColor: colors.background }, 
                headerTintColor: colors.textPrimary 
            }} />
            {query.isLoading && !article ? <ArticleSkeleton /> : null}
            {query.error && article ? <AppText variant="meta" style={{ padding: 16, color: colors.textSecondary }}>{language === "ne" ? "सुरक्षित अफलाइन प्रति" : "Reading your saved offline copy"}</AppText> : null}
            {savedCopy && !savedCopy.article && !query.data && savedCopy.contentEn === savedCopy.excerptEn && savedCopy.contentNe === savedCopy.excerptNe ? <AppText variant="meta" style={{ padding: 16, color: colors.textSecondary }}>{language === "ne" ? "यो पुरानो सुरक्षित प्रतिमा सारांश मात्र छ। पूरा लेखका लागि जडान गर्नुहोस्।" : "This older saved copy contains only a summary. Connect to refresh the full article."}</AppText> : null}
            {query.error && !article ? (
                <StateView
                    error={
                        query.error.message === "Article not found"
                            ? new Error(pick(ui.storyUnavailable, language))
                            : query.error
                    }
                    onRetry={() => query.refetch()}
                />
            ) : null}
            {!query.isLoading && !query.error && !article ? (
                <View style={{ padding: 20 }}>
                    <AppText variant="body" style={{ color: colors.textPrimary }}>
                        {pick(ui.storyUnavailable, language)}
                    </AppText>
                </View>
            ) : null}
            {article ? (
                <ArticleReader
                    key={article.slug}
                    article={article}
                    related={related}
                    saved={saved}
                    onToggleSave={() => { void toggleBookmark(article); }}
                />
            ) : null}
        </View>
    );
}

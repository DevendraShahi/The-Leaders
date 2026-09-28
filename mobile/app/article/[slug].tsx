import { useEffect, useState } from "react";
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
import { isSaved, removeSaved, saveArticle } from "@/storage/saved";

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
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setSaved(slug ? isSaved(slug) : false);
    }, [slug]);

    const article = query.data;
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
            {query.isLoading ? <ArticleSkeleton /> : null}
            {query.error ? (
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
                    onToggleSave={() => {
                        if (saved) {
                            removeSaved(article.slug);
                            setSaved(false);
                            return;
                        }
                        saveArticle({
                            slug: article.slug,
                            source: article.source,
                            titleEn: article.title.en,
                            titleNe: article.title.ne,
                            excerptEn: article.excerpt.en,
                            excerptNe: article.excerpt.ne,
                            contentEn: article.content.en,
                            contentNe: article.content.ne,
                            savedAt: new Date().toISOString(),
                        });
                        setSaved(true);
                    }}
                />
            ) : null}
        </View>
    );
}

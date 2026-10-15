import { recordUsage } from "./telemetry";
import { apiGet, type ArticleCard, type ArticleDetail } from "@/api/client";
import { readSaved, removeSaved, saveArticle } from "@/storage/saved";
import { useAppStore } from "@/state/useAppStore";

const pending = new Map<string, Promise<void>>();
export function saveCompleteArticle(article: ArticleDetail, savedAt = new Date().toISOString()) {
    saveArticle({ slug: article.slug, source: article.source, titleEn: article.title.en, titleNe: article.title.ne,
        excerptEn: article.excerpt.en, excerptNe: article.excerpt.ne, contentEn: article.content.en,
        contentNe: article.content.ne, savedAt, article });
    useAppStore.getState().setSavedArticleSaved(article.slug, true);
}
/** A bookmark becomes saved only after the complete article has been stored successfully. */
export function toggleBookmark(article: ArticleCard | ArticleDetail): Promise<void> {
    const active = pending.get(article.slug);
    if (active) return active;
    const operation = (async () => {
        const store = useAppStore.getState();
        const ne = store.language === "ne";
        if (readSaved(article.slug)) {
            removeSaved(article.slug);
            store.setSavedArticleSaved(article.slug, false);
            store.setNotice(ne ? "सुरक्षित समाचार हटाइयो" : "Removed from saved stories");
            return;
        }
        store.setNotice(ne ? "पूरा समाचार सुरक्षित हुँदैछ…" : "Saving the complete story…");
        try {
            const detail = "content" in article ? article : await apiGet<ArticleDetail>(`/api/v1/articles/${encodeURIComponent(article.slug)}`);
            if (!detail.content.en.trim() && !detail.content.ne.trim()) throw new Error("Article body is unavailable");
            saveCompleteArticle(detail);
            recordUsage("save_success");
            store.setNotice(ne ? "पूरा समाचार अफलाइन पढ्न सुरक्षित भयो" : "Full story saved for offline reading");
        } catch {
            store.setNotice(ne ? "समाचार सुरक्षित गर्न सकिएन। जडान जाँचेर फेरि प्रयास गर्नुहोस्।" : "Could not save the story. Check your connection and try again.");
        }
    })();
    pending.set(article.slug, operation);
    void operation.finally(() => pending.delete(article.slug));
    return operation;
}

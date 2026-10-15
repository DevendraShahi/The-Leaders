import { savedArticleSchema } from "./saved-schema";
import type { SavedArticle } from "./saved";

const STORAGE_KEY = "the-leaders:saved-articles:v1";

function readAll(): SavedArticle[] {
    if (typeof localStorage === "undefined") return [];

    try {
        const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
        return Array.isArray(value) ? value.flatMap(item => { const result = savedArticleSchema.safeParse(item); return result.success ? [result.data] : []; }) : [];
    } catch {
        return [];
    }
}

function writeAll(articles: SavedArticle[]) {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

export function isSaved(slug: string) {
    return readAll().some((article) => article.slug === slug);
}

export function saveArticle(article: SavedArticle) {
    const articles = readAll().filter((saved) => saved.slug !== article.slug);
    writeAll([article, ...articles].sort((a, b) => b.savedAt.localeCompare(a.savedAt)));
}

export function removeSaved(slug: string) {
    writeAll(readAll().filter((article) => article.slug !== slug));
}

export function readSaved(slug: string): SavedArticle | null {
    return readAll().find((article) => article.slug === slug) ?? null;
}

export function listSaved(): SavedArticle[] {
    return readAll().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function clearSaved() {
    writeAll([]);
}

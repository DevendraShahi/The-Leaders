import { articleDetailSchema } from "@/api/schemas";
import type { ArticleDetail } from "@/api/client";
import * as SQLite from "expo-sqlite";

export type SavedArticle = {
    slug: string;
    source: string;
    titleEn: string;
    titleNe: string;
    excerptEn: string;
    excerptNe: string;
    contentEn: string;
    contentNe: string;
    savedAt: string;
    article?: ArticleDetail;
};

let database: SQLite.SQLiteDatabase | null = null;

function db() {
    if (!database) {
        database = SQLite.openDatabaseSync("leaders.db");
        database.execSync(`
            CREATE TABLE IF NOT EXISTS saved_articles (
                slug TEXT PRIMARY KEY NOT NULL,
                source TEXT NOT NULL,
                title_en TEXT NOT NULL,
                title_ne TEXT NOT NULL,
                excerpt_en TEXT NOT NULL,
                excerpt_ne TEXT NOT NULL,
                content_en TEXT NOT NULL,
                content_ne TEXT NOT NULL,
                saved_at TEXT NOT NULL,
                detail_json TEXT
            );
        `);
        const columns = database.getAllSync<{ name: string }>("PRAGMA table_info(saved_articles)");
        if (!columns.some(column => column.name === "detail_json")) database.execSync("ALTER TABLE saved_articles ADD COLUMN detail_json TEXT");
    }
    return database;
}

export function isSaved(slug: string) {
    const row = db().getFirstSync<{ slug: string }>(
        "SELECT slug FROM saved_articles WHERE slug = ?",
        slug
    );
    return Boolean(row);
}

export function saveArticle(article: SavedArticle) {
    db().runSync(
        `INSERT OR REPLACE INTO saved_articles
            (slug, source, title_en, title_ne, excerpt_en, excerpt_ne, content_en, content_ne, saved_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        article.slug,
        article.source,
        article.titleEn,
        article.titleNe,
        article.excerptEn,
        article.excerptNe,
        article.contentEn,
        article.contentNe,
        article.savedAt,
        article.article ? JSON.stringify(article.article) : null
    );
}

export function removeSaved(slug: string) {
    db().runSync("DELETE FROM saved_articles WHERE slug = ?", slug);
}

export function readSaved(slug: string): SavedArticle | null {
    const row = db().getFirstSync<SavedRow>(
        `SELECT slug, source, title_en as titleEn, title_ne as titleNe,
                excerpt_en as excerptEn, excerpt_ne as excerptNe,
                content_en as contentEn, content_ne as contentNe, saved_at as savedAt, detail_json as detailJson
         FROM saved_articles WHERE slug = ?`,
        slug
    );
    return row ? decodeRow(row) : null;
}

export function listSaved(): SavedArticle[] {
    return db().getAllSync<SavedRow>(
        `SELECT slug, source, title_en as titleEn, title_ne as titleNe,
                excerpt_en as excerptEn, excerpt_ne as excerptNe,
                content_en as contentEn, content_ne as contentNe, saved_at as savedAt, detail_json as detailJson
         FROM saved_articles ORDER BY saved_at DESC`
    ).map(decodeRow);
}

export function clearSaved() {
    db().runSync("DELETE FROM saved_articles");
}

type SavedRow = SavedArticle & { detailJson: string | null };
function decodeRow({ detailJson, ...article }: SavedRow): SavedArticle {
    try { const detail = detailJson ? articleDetailSchema.safeParse(JSON.parse(detailJson)) : null; return { ...article, article: detail?.success ? detail.data : undefined }; } catch { return article; }
}

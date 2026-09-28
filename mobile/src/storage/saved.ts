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
                saved_at TEXT NOT NULL
            );
        `);
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
        article.savedAt
    );
}

export function removeSaved(slug: string) {
    db().runSync("DELETE FROM saved_articles WHERE slug = ?", slug);
}

export function readSaved(slug: string): SavedArticle | null {
    return db().getFirstSync<SavedArticle>(
        `SELECT slug, source, title_en as titleEn, title_ne as titleNe,
                excerpt_en as excerptEn, excerpt_ne as excerptNe,
                content_en as contentEn, content_ne as contentNe, saved_at as savedAt
         FROM saved_articles WHERE slug = ?`,
        slug
    );
}

export function listSaved(): SavedArticle[] {
    return db().getAllSync<SavedArticle>(
        `SELECT slug, source, title_en as titleEn, title_ne as titleNe,
                excerpt_en as excerptEn, excerpt_ne as excerptNe,
                content_en as contentEn, content_ne as contentNe, saved_at as savedAt
         FROM saved_articles ORDER BY saved_at DESC`
    );
}

export function clearSaved() {
    db().runSync("DELETE FROM saved_articles");
}

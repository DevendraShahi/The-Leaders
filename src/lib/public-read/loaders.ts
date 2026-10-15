import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import Leader from "@/models/Leader";
import { DailyBrief } from "@/models/ElectionContent";
import { getDailyBriefs, getDailyBriefBySlug, countDailyBriefs, type LocalizedValue } from "@/lib/daily-data";
import { getLeaderBySlug, getLeaders } from "@/lib/leaders-db";
import { getArticleBySlug } from "@/lib/data";
import { bilingual, escapeRegExp, pagePayload, publicImage, slicePage, toIso, type Bilingual } from "@/lib/public-read/shape";
function availableLanguages(value: unknown): Array<"en" | "ne"> {
    if (typeof value === "string" && value.trim()) return [/[\u0900-\u097F]/.test(value) ? "ne" : "en"];
    if (!value || typeof value !== "object") return [];
    const localized = value as { en?: unknown; ne?: unknown };
    return (["en", "ne"] as const).filter(language => typeof localized[language] === "string" && (localized[language] as string).trim().length > 0);
}
function estimatedMinutes(text: string) {
    const words = text.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
    return words ? Math.ceil(words / 200) : 0;
}
function readingMinutes(content: Bilingual) {
    return { en: estimatedMinutes(content.en), ne: estimatedMinutes(content.ne) };
}



function articleCardFromDoc(article: {
    slug?: string;
    title?: unknown;
    excerpt?: unknown;
    content?: unknown;
    author?: unknown;
    category?: unknown;
    image?: unknown;
    tags?: unknown;
    publishedDate?: unknown;
    createdAt?: unknown;
}, source: "article" | "column" | "analysis" = "article") {
    return {
        slug: article.slug || "",
        source,
        title: bilingual(article.title),
        excerpt: bilingual(article.excerpt),
        readingMinutes: readingMinutes(bilingual(article.content)),
        availableLanguages: availableLanguages(article.content),
        author: bilingual(article.author),
        category: bilingual(article.category),
        image: publicImage(article.image),
        publishedAt: toIso(article.publishedDate || article.createdAt),
        tags: Array.isArray(article.tags) ? article.tags.filter((tag): tag is string => typeof tag === "string") : [],
    };
}

function briefCard(brief: {
    slug: string;
    title: LocalizedValue;
    summary: LocalizedValue;
    image?: string;
    date: string;
    tags: string[];
}) {
    return {
        slug: brief.slug,
        title: bilingual(brief.title),
        summary: bilingual(brief.summary),
        image: publicImage(brief.image),
        date: toIso(brief.date),
        tags: brief.tags || [],
    };
}

function leaderStats(stats: unknown): { key: string; value: Bilingual }[] {
    if (Array.isArray(stats)) {
        return stats.flatMap((entry) => {
            if (!entry || typeof entry !== "object") return [];
            const record = entry as { key?: unknown; label?: unknown; value?: unknown };
            const key = typeof record.key === "string"
                ? record.key
                : typeof record.label === "string"
                    ? record.label
                    : "";
            if (!key) return [];
            return [{ key, value: bilingual(record.value) }];
        });
    }

    if (!stats || typeof stats !== "object") return [];

    return Object.entries(stats as Record<string, unknown>).map(([key, value]) => ({
        key,
        value: bilingual(value),
    }));
}

function leaderCard(leader: {
    slug: string;
    name: unknown;
    desc: unknown;
    party: unknown;
    position: unknown;
    years: unknown;
    image: unknown;
    cover: unknown;
    isActive?: boolean;
}) {
    return {
        slug: leader.slug,
        name: bilingual(leader.name),
        desc: bilingual(leader.desc),
        party: bilingual(leader.party),
        position: bilingual(leader.position),
        years: bilingual(leader.years),
        image: publicImage(leader.image),
        cover: publicImage(leader.cover),
        isActive: leader.isActive !== false,
    };
}


export const getArticlePage = unstable_cache(async (page: number, limit: number, category = "", author = "") => {
    await dbConnect();
    const clauses: Record<string, unknown>[] = [{ status: "published" }];
    for (const [field, value] of [["category", category], ["author", author]]) if (value.trim()) {
        const pattern = new RegExp(`^${escapeRegExp(value.trim().slice(0, 100))}$`, "i");
        clauses.push({ $or: [{ [field + ".en"]: pattern }, { [field + ".ne"]: pattern }, { [field]: pattern }] });
    }
    const filter = { $and: clauses };
    const [total, rows] = await Promise.all([Article.countDocuments(filter), Article.find(filter).sort({ publishedDate: -1 }).skip((page - 1) * limit).limit(limit).select("title excerpt content author category slug image tags publishedDate").lean()]);
    return pagePayload(rows.map(row => articleCardFromDoc(row)), total, page, limit);
}, ["core-article-page-v1"], { revalidate: 3600, tags: ["articles"] });
export async function getPublicArticle(slug: string) {
    const article = await getArticleBySlug(slug);
    if (article) {
        return {
            ...articleCardFromDoc(article, "article"),
            content: bilingual(article.content),
        };
    }

    return null;
}
export async function getBriefPage(page: number, limit: number) {
    const [briefs, total] = await Promise.all([
        getDailyBriefs(page, limit),
        countDailyBriefs(),
    ]);
    return pagePayload(briefs.map(briefCard), total, page, limit);
}

export async function getPublicBrief(slug: string) {
    const brief = await getDailyBriefBySlug(slug);
    if (!brief) return null;
    return {
        ...briefCard(brief),
        content: bilingual(brief.content),
    };
}

export async function getLeaderPage(page: number, limit: number) {
    const leaders = await getLeaders();
    return slicePage(leaders.map(leaderCard), page, limit);
}

export async function getPublicLeader(slug: string) {
    const leader = await getLeaderBySlug(slug);
    if (!leader) return null;
    return {
        ...leaderCard(leader),
        bio: bilingual(leader.bio),
        stats: leaderStats(leader.stats),
        timeline: (leader.timeline || []).map((event) => ({
            year: event.year || "",
            event: bilingual(event.event),
        })),
    };
}


export const getPublicHome = unstable_cache(async () => {
    const [articles, briefs] = await Promise.all([getArticlePage(1, 8), getDailyBriefs(1, 8)]);
    return { countdown: { electionDate: "", label: bilingual("") }, factChecks: [], coverage: [],
        leadBrief: briefs[0] ? briefCard(briefs[0]) : null,
        ticker: { scope: "latest" as const, items: briefs.map(brief => ({ slug: brief.slug, title: bilingual(brief.title), date: toIso(brief.date) })) }, articles: articles.items };
}, ["core-home-v1"], { revalidate: 3600, tags: ["articles", "daily-briefs"] });
const getAuthorDirectory = unstable_cache(async () => {
    await dbConnect();
    const names = await Article.distinct("author", { status: "published" });
    const unique = new Map<string, Bilingual>();
    for (const value of names) { const name = bilingual(value); const key = (name.en || name.ne).toLowerCase(); if (key) unique.set(key, name); }
    return [...unique.values()].slice(0, 100).sort((a,b) => a.en.localeCompare(b.en));
}, ["core-authors-v1"], { revalidate: 3600, tags: ["articles"] });
export async function getPublicAuthors(query = "") {
    const q = query.trim().slice(0, 100).toLowerCase();
    return (await getAuthorDirectory()).filter(name => `${name.en} ${name.ne}`.toLowerCase().includes(q));
}
export async function searchPublic(query: string) {
    const q = query.trim().slice(0, 100);
    if (q.length < 2) return { articles: [], authors: [], leaders: [], briefs: [], factChecks: [], episodes: [] };
    await dbConnect(); const pattern = new RegExp(escapeRegExp(q), "i");
    const [articles, leaders, briefs, authors] = await Promise.all([
        Article.find({ status: "published", $or: [{ "title.en": pattern }, { "title.ne": pattern }, { "excerpt.en": pattern }, { "excerpt.ne": pattern }, { "author.en": pattern }, { "author.ne": pattern }] }).sort({ publishedDate: -1 }).limit(8).select("title excerpt author category slug image tags publishedDate").lean(),
        Leader.find({ status: "published", $or: [{ "name.en": pattern }, { "name.ne": pattern }] }).limit(8).select("slug name desc party position years image cover isActive").lean(),
        DailyBrief.find({ status: "published", $or: [{ "title.en": pattern }, { "title.ne": pattern }] }).sort({ date: -1 }).limit(8).select("slug title summary image date tags").lean(),
        getPublicAuthors(q),
    ]);
    return { articles: articles.map(row => articleCardFromDoc(row)), leaders: leaders.map(row => leaderCard(row)), briefs: briefs.map(row => briefCard({ ...row, date: toIso(row.date) })), authors, factChecks: [], episodes: [] };
}

import { promises as fs } from "fs";
import path from "path";
import { slugify } from "@/lib/slug";

export interface PartyDTO {
    id?: number | string;
    name: string;
    shortName?: string; // e.g., "CPN-UML"
    slug?: string;
    logo?: string;
    symbol?: string; // From user updated JSON
    leader?: string;
    color?: string;
    foundedYear?: number;
    regDate?: string; // From user updated JSON
    manifestoSummary?: string;
    status?: string; // e.g., "National Party", "Parliamentary"
    ranking?: {
        overall: number;
        electoral_power: number;
        historical_legacy: number;
        popularity_index: number;
    };
    performance?: {
        total_seats_hor: number;
        fptp_seats?: number;
        pr_seats?: number;
        pr_votes_2022?: number;
        pr_votes_2022_aggregate?: number; // For unified parties
        pr_vote_percentage?: number;
        provincial_seats_total?: number;
        national_assembly_seats?: number;
        local_heads?: number;
        special_note?: string;
        election_2026_status?: string;
    };
}

export interface CandidateDTO {
    name: string;
    slug: string;
    party: string; // Slug or ID
    district: string;
    constituency?: string;
    bio: string;
    photo: string;
    incumbent?: boolean;
    status: "active" | "withdrawn" | "disqualified";
    votes?: number;
}

export interface DistrictDTO {
    name: string;
    totalVoters: number;
    province: string;
    status: "pending" | "voting" | "counting" | "declared";
    leadingParty?: string;
    winner?: string;
}

export interface DailyBriefDTO {
    title: LocalizedValue;
    slug: string;
    date: string;
    summary: LocalizedValue;
    content: LocalizedValue;
    tags: string[];
    isPublished: boolean;
    status: "draft" | "published" | "archived";
    image?: string;
}

export interface FactCheckDTO {
    id?: string;
    slug?: string;
    claim: LocalizedValue;
    claimBy: LocalizedValue;
    verdict: "true" | "false" | "misleading" | "unverified";
    analysis: LocalizedValue;
    sources: string[];
    date: string;
    status: "draft" | "published" | "archived";
    image?: string;
}

export type LocalizedValue = string | { en?: string; ne?: string };

function resolveLocalizedString(value: unknown): string {
    if (typeof value === "string") return value;
    if (!value || typeof value !== "object") return "";
    const localized = value as { en?: string; ne?: string };
    return localized.en || localized.ne || "";
}

export interface ElectionData {
    parties: PartyDTO[];
    districts: DistrictDTO[];
    candidates: CandidateDTO[];
    dailyBriefs: DailyBriefDTO[];
    factChecks: FactCheckDTO[];
}

export interface ElectionArticleDTO {
    editor?: string;
    title_en: string;
    title_ne?: string;
    excerpt_en: string;
    excerpt_ne?: string;
    content_en: string;
    content_ne?: string;
    slug: string;
    tags: string[];
    status: "draft" | "published" | "archived";
    createdAt?: string;
    image?: string;
}

export interface ColumnArticleDTO {
    editor?: string;
    title_en: string;
    title_ne?: string;
    excerpt_en: string;
    excerpt_ne?: string;
    content_en: string;
    content_ne?: string;
    slug: string;
    category?: string;
    tags: string[];
    status: "draft" | "published" | "archived";
    createdAt?: string;
    image?: string;
}

import { cache } from "react";
import { unstable_cache } from "next/cache";

// ... existing interfaces ...

function normalizeSlug(value: string): string {
    if (!value) return "";
    const str = typeof value === "string" ? value : String(value);
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}

export const getElectionData = cache(async (): Promise<ElectionData> => {
    // Check if we are on the server
    if (typeof window !== "undefined") {
        throw new Error("getElectionData can only be called on the server");
    }

    const filePath = path.join(process.cwd(), "public/map/election_data_sample.json");
    try {
        const fileContents = await fs.readFile(filePath, "utf8");
        const data = JSON.parse(fileContents);
        return data as ElectionData;
    } catch (error) {
        console.error("Failed to read election data:", error);
        return {
            parties: [],
            districts: [],
            candidates: [],
            dailyBriefs: [],
            factChecks: [],
        };
    }
});

export const getDailyBriefs = unstable_cache(async () => {
    try {
        const { default: dbConnect } = await import("@/lib/db");
        const { DailyBrief } = await import("@/models/ElectionContent");

        await dbConnect();
        const briefs = await DailyBrief.find({
            $or: [
                { status: "published" },
                { $and: [{ status: { $exists: false } }, { isPublished: true }] },
            ],
        })
            .sort({ date: -1 })
            .lean();

        return briefs.map((brief: any) => ({
            title: (brief.title ?? "") as LocalizedValue,
            slug: brief.slug,
            date: brief.date instanceof Date ? brief.date.toISOString() : String(brief.date),
            summary: (brief.summary ?? "") as LocalizedValue,
            content: (brief.content ?? "") as LocalizedValue,
            tags: brief.tags || [],
            isPublished: !!brief.isPublished,
            status: brief.status || (brief.isPublished ? "published" : "draft"),
            image: brief.image || "",
        })) as DailyBriefDTO[];
    } catch (error) {
        console.error("Failed to load daily briefs from database:", error);
        const data = await getElectionData();
        return data.dailyBriefs || [];
    }
}, ['daily-briefs'], { tags: ['daily-briefs', 'election-data'] });

export const getFactChecks = unstable_cache(async () => {
    try {
        const { default: dbConnect } = await import("@/lib/db");
        const { FactCheck } = await import("@/models/ElectionContent");

        await dbConnect();
        const checks = await FactCheck.find({
            $or: [
                { status: "published" },
                { status: { $exists: false } }, // Backward compatibility for legacy records
            ],
        })
            .sort({ date: -1 })
            .lean();

        return checks.map((fc: any) => ({
            id: fc._id?.toString?.() || fc._id,
            slug: fc.slug || slugify(resolveLocalizedString(fc.claim), 60),
            claim: (fc.claim ?? "") as LocalizedValue,
            claimBy: (fc.claimBy ?? "") as LocalizedValue,
            verdict: fc.verdict,
            analysis: (fc.analysis ?? "") as LocalizedValue,
            sources: fc.sources || [],
            date: fc.date instanceof Date ? fc.date.toISOString() : String(fc.date),
            status: fc.status || "published",
            image: fc.image || "",
        })) as FactCheckDTO[];
    } catch (error) {
        console.error("Failed to load fact checks from database:", error);
        const data = await getElectionData();
        return data.factChecks || [];
    }
}, ['fact-checks'], { tags: ['fact-checks', 'election-data'] });

export async function getParties() {
    const data = await getElectionData();
    return data.parties || [];
}

export async function getLatestHeadlines(limit: number = 8): Promise<string[]> {
    try {
        const { default: dbConnect } = await import("@/lib/db");
        const { default: Settings } = await import("@/models/Settings");

        await dbConnect();
        const settings: any = await Settings.findOne().lean();
        const headlines: string[] = settings?.tickerHeadlines || [];
        return headlines.slice(0, limit);
    } catch (error) {
        console.error("Failed to load election headlines from database:", error);
        return [];
    }
}

export const getElectionArticles = unstable_cache(async (limit: number = 3): Promise<ElectionArticleDTO[]> => {
    try {
        const { default: dbConnect } = await import("@/lib/db");
        const { ElectionArticle } = await import("@/models/ElectionContent");

        await dbConnect();
        const articles = await ElectionArticle.find({ status: "published" })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return articles.map((a: any) => ({
            editor: resolveLocalizedString(a.editor),
            title_en: resolveLocalizedString(a.title_en),
            title_ne: resolveLocalizedString(a.title_ne),
            excerpt_en: resolveLocalizedString(a.excerpt_en),
            excerpt_ne: resolveLocalizedString(a.excerpt_ne),
            content_en: resolveLocalizedString(a.content_en),
            content_ne: resolveLocalizedString(a.content_ne),
            slug: a.slug,
            tags: a.tags || [],
            status: a.status,
            createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
            image: a.image || "",
        })) as ElectionArticleDTO[];
    } catch (error) {
        console.error("Failed to load election articles from database:", error);
        return [];
    }
}, ['election-articles'], { tags: ['election-articles', 'election-data'] });

export const getElectionArticleBySlug = unstable_cache(async (slug: string): Promise<ElectionArticleDTO | null> => {
    const target = normalizeSlug(slug);
    try {
        const { default: dbConnect } = await import("@/lib/db");
        const { ElectionArticle } = await import("@/models/ElectionContent");

        await dbConnect();
        const candidates = await ElectionArticle.find({
            status: "published",
            $or: [
                { slug },
                { slug: target },
                { slug: { $regex: target, $options: "i" } },
            ],
        }).lean();

        if (candidates.length) {
            const normalized = candidates.map((a: any) => ({
                editor: resolveLocalizedString(a.editor),
                title_en: resolveLocalizedString(a.title_en),
                title_ne: resolveLocalizedString(a.title_ne),
                excerpt_en: resolveLocalizedString(a.excerpt_en),
                excerpt_ne: resolveLocalizedString(a.excerpt_ne),
                content_en: resolveLocalizedString(a.content_en),
                content_ne: resolveLocalizedString(a.content_ne),
                slug: a.slug,
                tags: a.tags || [],
                status: a.status,
                createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
                image: a.image || "",
            })) as ElectionArticleDTO[];

            // Prefer best normalized match
            let match = normalized.find((a) => normalizeSlug(a.slug) === target);
            if (match) return match;
            match = normalized.find((a) => normalizeSlug(a.slug).endsWith(target));
            if (match) return match;
            match = normalized.find((a) => normalizeSlug(a.slug).includes(target));
            if (match) return match;
            match = normalized.find((a) => normalizeSlug(a.title_en) === target);
            return match || normalized[0];
        }
    } catch (error) {
        console.error("Failed to load election article by slug:", error);
    }

    // Fallback to list-based matching if DB query fails
    const articles = await getElectionArticles(100);
    if (!articles.length) return null;

    let match = articles.find((a) => normalizeSlug(a.slug) === target);
    if (match) return match;
    match = articles.find((a) => normalizeSlug(a.slug).endsWith(target));
    if (match) return match;
    match = articles.find((a) => normalizeSlug(a.slug).includes(target));
    if (match) return match;
    match = articles.find((a) => normalizeSlug(a.title_en) === target);
    return match || null;
}, ['election-article-by-slug'], { tags: ['election-articles', 'election-data'] });

export const getColumnArticles = unstable_cache(async (limit: number = 3): Promise<ColumnArticleDTO[]> => {
    try {
        const { default: dbConnect } = await import("@/lib/db");
        const { ColumnArticle } = await import("@/models/ElectionContent");

        await dbConnect();
        const articles = await ColumnArticle.find({ status: "published" })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return articles.map((a: any) => ({
            editor: resolveLocalizedString(a.editor),
            title_en: resolveLocalizedString(a.title_en),
            title_ne: resolveLocalizedString(a.title_ne),
            excerpt_en: resolveLocalizedString(a.excerpt_en),
            excerpt_ne: resolveLocalizedString(a.excerpt_ne),
            content_en: resolveLocalizedString(a.content_en),
            content_ne: resolveLocalizedString(a.content_ne),
            slug: a.slug,
            category: a.category,
            tags: a.tags || [],
            status: a.status,
            createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
            image: a.image || "",
        })) as ColumnArticleDTO[];
    } catch (error) {
        console.error("Failed to load column articles from database:", error);
        return [];
    }
}, ['column-articles'], { tags: ['column-articles', 'election-data'] });

export const getColumnArticleBySlug = unstable_cache(async (slug: string): Promise<ColumnArticleDTO | null> => {
    const target = normalizeSlug(slug);
    try {
        const { default: dbConnect } = await import("@/lib/db");
        const { ColumnArticle } = await import("@/models/ElectionContent");

        await dbConnect();
        const candidates = await ColumnArticle.find({
            status: "published",
            $or: [
                { slug },
                { slug: target },
                { slug: { $regex: target, $options: "i" } },
            ],
        }).lean();

        if (candidates.length) {
            const normalized = candidates.map((a: any) => ({
                editor: resolveLocalizedString(a.editor),
                title_en: resolveLocalizedString(a.title_en),
                title_ne: resolveLocalizedString(a.title_ne),
                excerpt_en: resolveLocalizedString(a.excerpt_en),
                excerpt_ne: resolveLocalizedString(a.excerpt_ne),
                content_en: resolveLocalizedString(a.content_en),
                content_ne: resolveLocalizedString(a.content_ne),
                slug: a.slug,
                category: a.category,
                tags: a.tags || [],
                status: a.status,
                createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
                image: a.image || "",
            })) as ColumnArticleDTO[];

            let match = normalized.find((a) => normalizeSlug(a.slug) === target);
            if (match) return match;
            match = normalized.find((a) => normalizeSlug(a.slug).endsWith(target));
            if (match) return match;
            match = normalized.find((a) => normalizeSlug(a.slug).includes(target));
            if (match) return match;
            match = normalized.find((a) => normalizeSlug(a.title_en) === target);
            return match || normalized[0];
        }
    } catch (error) {
        console.error("Failed to load column article by slug:", error);
    }

    const articles = await getColumnArticles(100);
    if (!articles.length) return null;

    let match = articles.find((a) => normalizeSlug(a.slug) === target);
    if (match) return match;
    match = articles.find((a) => normalizeSlug(a.slug).endsWith(target));
    if (match) return match;
    match = articles.find((a) => normalizeSlug(a.slug).includes(target));
    if (match) return match;
    match = articles.find((a) => normalizeSlug(a.title_en) === target);
    return match || null;
}, ['column-article-by-slug'], { tags: ['column-articles', 'election-data'] });

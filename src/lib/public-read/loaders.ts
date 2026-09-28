import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import History from "@/models/History";
import { timelineData } from "@/data/timeline-data";
import partyFile from "@/data/registered-parties-2026EC.json";
import { analyticsData } from "@/lib/analytics-data";
import {
    getColumnArticleBySlug,
    getColumnArticles,
    getDailyBriefs,
    getDailyBriefBySlug,
    countDailyBriefs,
    getElectionArticleBySlug,
    getElectionArticles,
    getFactChecks,
    getFactCheckBySlug,
    countFactChecks,
    type LocalizedValue,
} from "@/lib/election-data";
import { getElectionSnapshotStats } from "@/lib/election-snapshot-data";
import { findFPTPCandidateBySlug, getFPTPCandidateSlug } from "@/lib/candidate-slug";
import { getFPTPCandidateDataset } from "@/lib/fptp-candidate-data";
import { getLeaderBySlug, getLeaders } from "@/lib/leaders-db";
import { getArticleBySlug } from "@/lib/data";
import { getPartyManifestos } from "@/lib/manifesto-data";
import { getPartyLogo } from "@/lib/party-symbols";
import Leader from "@/models/Leader";
import { DailyBrief, FactCheck } from "@/models/ElectionContent";
import {
    bilingual,
    escapeRegExp,
    includesQuery,
    pagePayload,
    publicImage,
    slicePage,
    toIso,
    type Bilingual,
} from "@/lib/public-read/shape";

const ELECTION_DATE = "2026-03-05T00:00:00+05:45";

function articleCardFromDoc(article: {
    slug?: string;
    title?: unknown;
    excerpt?: unknown;
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
        author: bilingual(article.author),
        category: bilingual(article.category),
        image: publicImage(article.image),
        publishedAt: toIso(article.publishedDate || article.createdAt),
        tags: Array.isArray(article.tags) ? article.tags.filter((tag): tag is string => typeof tag === "string") : [],
    };
}

function splitFieldArticle(article: {
    slug: string;
    title_en?: string;
    title_ne?: string;
    excerpt_en?: string;
    excerpt_ne?: string;
    content_en?: string;
    content_ne?: string;
    editor?: string;
    category?: string;
    image?: string;
    tags?: string[];
    createdAt?: string;
}, source: "column" | "analysis") {
    const title = bilingual({ en: article.title_en, ne: article.title_ne });
    const excerpt = bilingual({ en: article.excerpt_en, ne: article.excerpt_ne });
    const editor = bilingual(article.editor || "");
    return {
        card: {
            slug: article.slug,
            source,
            title,
            excerpt,
            author: editor,
            category: bilingual(article.category || (source === "analysis" ? "Analysis" : "Column")),
            image: publicImage(article.image),
            publishedAt: toIso(article.createdAt),
            tags: article.tags || [],
        },
        content: bilingual({ en: article.content_en, ne: article.content_ne }),
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

function factVerdict(value: string): "true" | "false" | "misleading" | "unverified" {
    if (value === "true" || value === "false" || value === "misleading" || value === "unverified") {
        return value;
    }
    return "unverified";
}

function factCard(check: {
    slug?: string;
    claim: LocalizedValue;
    claimBy: LocalizedValue;
    verdict: "true" | "false" | "misleading" | "unverified";
    image?: string;
    date: string;
}) {
    return {
        slug: check.slug || "",
        claim: bilingual(check.claim),
        claimBy: bilingual(check.claimBy),
        verdict: factVerdict(check.verdict),
        image: publicImage(check.image),
        date: toIso(check.date),
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

function sameCategory(value: unknown, category: string) {
    const target = category.trim().toLowerCase();
    if (!target) return true;
    if (typeof value === "string") return value.trim().toLowerCase() === target;
    if (value && typeof value === "object") {
        const record = value as { en?: string; ne?: string };
        return [record.en, record.ne].some((item) => item?.trim().toLowerCase() === target);
    }
    return false;
}

export const getArticlePage = unstable_cache(
    async (page: number, limit: number, category: string = "") => {
        try {
            await dbConnect();
            const trimmed = category.trim();
            if (!trimmed) {
                const filter = { status: "published" as const };
                const [total, rows] = await Promise.all([
                    Article.countDocuments(filter),
                    Article.find(filter)
                        .sort({ publishedDate: -1 })
                        .skip((page - 1) * limit)
                        .limit(limit)
                        .select("title excerpt author category slug image tags publishedDate")
                        .lean(),
                ]);
                return pagePayload(rows.map((row) => articleCardFromDoc(row)), total, page, limit);
            }

            const pattern = new RegExp(`^${escapeRegExp(trimmed)}$`, "i");
            const [rows, columns, analyses] = await Promise.all([
                Article.find({
                    status: "published",
                    $or: [
                        { "category.en": pattern },
                        { "category.ne": pattern },
                        { category: pattern },
                    ],
                })
                    .sort({ publishedDate: -1 })
                    .limit(200)
                    .select("title excerpt author category slug image tags publishedDate")
                    .lean(),
                getColumnArticles(100),
                getElectionArticles(100),
            ]);

            const merged = [
                ...rows.map((row) => articleCardFromDoc(row)),
                ...columns
                    .filter((article) => sameCategory(article.category, trimmed))
                    .map((article) => splitFieldArticle(article, "column").card),
                ...analyses
                    .filter(() => trimmed.toLowerCase() === "analysis" || trimmed === "विश्लेषण")
                    .map((article) => splitFieldArticle(article, "analysis").card),
            ].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

            return slicePage(merged, page, limit);
        } catch (error) {
            console.error("Failed to page public articles", error);
            return pagePayload([], 0, page, limit);
        }
    },
    ["public-article-page"],
    { tags: ["articles"] }
);

export async function getPublicArticle(slug: string) {
    const article = await getArticleBySlug(slug);
    if (article) {
        return {
            ...articleCardFromDoc(article, "article"),
            content: bilingual(article.content),
        };
    }

    const column = await getColumnArticleBySlug(slug);
    if (column) {
        const mapped = splitFieldArticle(column, "column");
        return { ...mapped.card, content: mapped.content };
    }

    const analysis = await getElectionArticleBySlug(slug);
    if (analysis) {
        const mapped = splitFieldArticle(analysis, "analysis");
        return { ...mapped.card, content: mapped.content };
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

export async function getFactCheckPage(page: number, limit: number) {
    const [checks, total] = await Promise.all([
        getFactChecks(page, limit),
        countFactChecks(),
    ]);
    return pagePayload(checks.map(factCard), total, page, limit);
}

export async function getPublicFactCheck(slug: string) {
    const check = await getFactCheckBySlug(slug);
    if (!check) return null;
    return {
        ...factCard(check),
        analysis: bilingual(check.analysis),
        sources: check.sources || [],
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

export function getHistoryArchive() {
    const eras = timelineData.map((era) => ({
        id: era.id,
        title: bilingual(era.title),
        description: bilingual(era.description),
        period: bilingual(era.period),
        episodes: era.episodes.map((episode) => ({
            id: episode.id,
            eraId: era.id,
            title: bilingual(episode.title),
            description: bilingual(episode.description),
            year: episode.year,
            image: publicImage(episode.image),
        })),
    }));

    return { eras };
}

export function getHistoryEpisode(id: string) {
    for (const era of getHistoryArchive().eras) {
        const episode = era.episodes.find((item) => item.id === id);
        if (episode) {
            return {
                ...episode,
                eraTitle: era.title,
                period: era.period,
            };
        }
    }
    return null;
}

const getPublishedHistoryRecords = unstable_cache(
    async () => {
        try {
            await dbConnect();
            const rows = await History.find({ status: "published" }).sort({ date: 1, order: 1 }).lean();
            return rows.map((row) => ({
                id: String(row._id),
                title: bilingual(row.title),
                content: bilingual(row.content),
                date: toIso(row.date),
                image: publicImage(row.image),
            }));
        } catch (error) {
            console.error("Failed to load published history records", error);
            return [];
        }
    },
    ["public-history-records"],
    { tags: ["history"] }
);

export async function getHistoryItem(id: string) {
    const episode = getHistoryEpisode(id);
    if (episode) return episode;

    const records = await getPublishedHistoryRecords();
    const record = records.find((item) => item.id === id);
    if (!record) return null;

    return {
        id: record.id,
        eraId: "archive",
        title: record.title,
        description: record.content,
        year: record.date.slice(0, 10),
        image: record.image,
        eraTitle: bilingual({ en: "Archive", ne: "अभिलेख" }),
        period: bilingual({ en: "Published record", ne: "प्रकाशित अभिलेख" }),
    };
}

export async function getHistoryPayload() {
    const [archive, records] = await Promise.all([
        Promise.resolve(getHistoryArchive()),
        getPublishedHistoryRecords(),
    ]);
    return { ...archive, records };
}

type PartyRow = {
    id?: number | string;
    name?: string;
    shortName?: string;
    leader?: string;
    symbol?: string;
    status?: string;
    ideology?: string;
    performance?: { hor_total_2022?: number };
};

export function getPublicParties() {
    const parties = (partyFile.parties || []) as PartyRow[];
    return parties
        .map((party) => {
            const name = party.name || "";
            return {
                id: String(party.id ?? name),
                name: bilingual(name),
                shortName: party.shortName || "",
                leader: party.leader || "",
                symbol: party.symbol || "",
                logo: publicImage(getPartyLogo(name) || ""),
                status: party.status || "",
                ideology: party.ideology || "",
                seats: party.performance?.hor_total_2022 || 0,
            };
        })
        .sort((a, b) => b.seats - a.seats || a.name.en.localeCompare(b.name.en));
}

const getCandidateIndex = unstable_cache(
    async () => {
        try {
            const dataset = await getFPTPCandidateDataset();
            return dataset.candidates.map((candidate) => ({
                slug: getFPTPCandidateSlug(candidate),
                name: candidate.candidateName || "",
                party: candidate.partyName || "",
                district: candidate.district || "",
                constituency: candidate.constituencyDisplay || "",
                province: candidate.province || "",
                gender: candidate.gender || "",
                image: publicImage(candidate.imageUrl),
                age: candidate.age ?? null,
                qualification: candidate.details?.qualification || "",
                experience: candidate.details?.experience || "",
            }));
        } catch (error) {
            console.error("Failed to load candidate index", error);
            return [];
        }
    },
    ["public-candidate-index"],
    { tags: ["candidates"] }
);

export async function getCandidatePage(input: {
    page: number;
    limit: number;
    query: string;
    party: string;
    district: string;
}) {
    const index = await getCandidateIndex();
    const query = input.query.trim().toLowerCase();
    const party = input.party.trim().toLowerCase();
    const district = input.district.trim().toLowerCase();

    const filtered = index.filter((candidate) => {
        if (party && candidate.party.toLowerCase() !== party) return false;
        if (district && candidate.district.toLowerCase() !== district) return false;
        if (!query) return true;
        return [candidate.name, candidate.party, candidate.district, candidate.constituency]
            .some((value) => value.toLowerCase().includes(query));
    });

    const page = slicePage(
        filtered.map(({ qualification: _qualification, experience: _experience, ...card }) => card),
        input.page,
        input.limit
    );

    return {
        ...page,
        parties: [...new Set(index.map((candidate) => candidate.party).filter(Boolean))].sort(),
        districts: [...new Set(index.map((candidate) => candidate.district).filter(Boolean))].sort(),
    };
}

export async function getPublicCandidate(slug: string) {
    const index = await getCandidateIndex();
    const match = index.find((candidate) => candidate.slug === slug);
    if (match) return match;

    try {
        const dataset = await getFPTPCandidateDataset();
        const candidate = findFPTPCandidateBySlug(dataset.candidates, slug);
        if (!candidate) return null;
        return {
            slug: getFPTPCandidateSlug(candidate),
            name: candidate.candidateName || "",
            party: candidate.partyName || "",
            district: candidate.district || "",
            constituency: candidate.constituencyDisplay || "",
            province: candidate.province || "",
            gender: candidate.gender || "",
            image: publicImage(candidate.imageUrl),
            age: candidate.age ?? null,
            qualification: candidate.details?.qualification || "",
            experience: candidate.details?.experience || "",
        };
    } catch {
        return null;
    }
}

export async function getPublicManifestos() {
    const docs = await getPartyManifestos();
    return docs.map((doc) => ({
        slug: doc.slug,
        partyName: bilingual(doc.partyName),
        partyShort: doc.partyShort,
        blurb: bilingual(doc.blurb),
        year: doc.year,
        fileUrl: publicImage(doc.fileUrl),
        fileSizeLabel: doc.fileSizeLabel,
    }));
}

export function getPublicSnapshot() {
    const english = getElectionSnapshotStats("en");
    const nepali = getElectionSnapshotStats("ne");

    return {
        electionDate: ELECTION_DATE,
        cycleLabel: bilingual({
            en: "House of Representatives 2079",
            ne: "प्रतिनिधि सभा २०७९",
        }),
        stats: english.slice(0, 8).map((stat, index) => ({
            id: stat.id,
            label: bilingual(stat.label),
            value: bilingual({ en: stat.value, ne: nepali[index]?.value || stat.value }),
            hint: bilingual(stat.hint),
            source: bilingual(stat.source),
        })),
        seats: analyticsData.electionResults2079.map((row) => ({
            party: row.party,
            partySlug: row.partySlug,
            seats: row.projectedSeats,
            fptpSeats: row.fptpSeats ?? 0,
            prSeats: row.prSeats ?? 0,
            voteShare: row.voteSharePercentage,
        })),
    };
}

function nepalDateKey(input: Date): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kathmandu",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(input);
}

export async function getPublicHome() {
    const [articles, briefs, checks, columns] = await Promise.all([
        getArticlePage(1, 8),
        getDailyBriefs(1, 8),
        getFactChecks(1, 6),
        getColumnArticles(6).catch(() => []),
    ]);

    const todayKey = nepalDateKey(new Date());
    const todayBriefs = briefs.filter((brief) => {
        const parsed = new Date(brief.date);
        return !Number.isNaN(parsed.getTime()) && nepalDateKey(parsed) === todayKey;
    });
    const tickerSource = todayBriefs.length > 0 ? todayBriefs : briefs;

    return {
        countdown: {
            electionDate: ELECTION_DATE,
            label: bilingual({
                en: "General election",
                ne: "आम निर्वाचन",
            }),
        },
        leadBrief: briefs[0] ? briefCard(briefs[0]) : null,
        ticker: {
            scope: todayBriefs.length > 0 ? "today" as const : "latest" as const,
            items: tickerSource.slice(0, 8).map((brief) => ({
                slug: brief.slug,
                title: bilingual(brief.title),
                date: toIso(brief.date),
            })),
        },
        factChecks: checks.map(factCard),
        articles: articles.items,
        coverage: columns.map((article) => splitFieldArticle(article, "column").card),
    };
}

export async function searchPublic(query: string) {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
        return { articles: [], leaders: [], briefs: [], factChecks: [], episodes: [] };
    }

    const pattern = new RegExp(escapeRegExp(trimmed), "i");
    await dbConnect();
    
    const [articleRows, columnRows, analysisRows, leaderRows, briefRows, checkRows, archive] = await Promise.all([
        Article.find({
            status: "published",
            $or: [
                { "title.en": pattern },
                { "title.ne": pattern },
                { title: pattern },
                { "excerpt.en": pattern },
                { "excerpt.ne": pattern },
                { excerpt: pattern },
                { "content.en": pattern },
                { "content.ne": pattern },
                { content: pattern },
                { "author.en": pattern },
                { "author.ne": pattern },
                { author: pattern },
                { "category.en": pattern },
                { "category.ne": pattern },
                { category: pattern },
                { tags: pattern },
            ],
        })
            .sort({ publishedDate: -1 })
            .limit(8)
            .select("title excerpt author category slug image tags publishedDate")
            .lean()
            .catch(() => []),

        getColumnArticles(100),
        getElectionArticles(100),

        Leader.find({
            status: "published",
            $or: [{ "name.en": pattern }, { "name.ne": pattern }, { name: pattern }],
        })
            .limit(8)
            .lean()
            .catch(() => []),

        DailyBrief.find({
            $and: [
                {
                    $or: [
                        { status: "published" },
                        { $and: [{ status: { $exists: false } }, { isPublished: true }] },
                    ]
                },
                {
                    $or: [{ "title.en": pattern }, { "title.ne": pattern }, { title: pattern }]
                }
            ]
        })
            .sort({ date: -1 })
            .limit(8)
            .lean()
            .catch(() => []),

        FactCheck.find({
            $and: [
                {
                    $or: [
                        { status: "published" },
                        { status: { $exists: false } }
                    ]
                },
                {
                    $or: [{ "claim.en": pattern }, { "claim.ne": pattern }, { claim: pattern }]
                }
            ]
        })
            .sort({ date: -1 })
            .limit(8)
            .lean()
            .catch(() => []),

        Promise.resolve(getHistoryArchive()),
    ]);

    const storyText = (parts: Array<string | undefined>) => parts.filter(Boolean).join(" ");
    const columns = columnRows
        .filter((article) => includesQuery(storyText([
            article.title_en, article.title_ne, article.excerpt_en, article.excerpt_ne,
            article.content_en, article.content_ne, article.editor, article.category,
            ...(article.tags || []),
        ]), trimmed))
        .map((article) => splitFieldArticle(article, "column").card);
    const analyses = analysisRows
        .filter((article) => includesQuery(storyText([
            article.title_en, article.title_ne, article.excerpt_en, article.excerpt_ne,
            article.content_en, article.content_ne, article.editor,
            ...(article.tags || []),
        ]), trimmed))
        .map((article) => splitFieldArticle(article, "analysis").card);

    return {
        articles: [...articleRows.map((row) => articleCardFromDoc(row)), ...columns, ...analyses]
            .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
            .slice(0, 12),
        leaders: leaderRows.map((row: any) => leaderCard(row)),
        briefs: briefRows.map((brief: any) => briefCard({
            slug: brief.slug,
            title: brief.title || "",
            summary: brief.summary || "",
            image: brief.image,
            date: brief.date instanceof Date ? brief.date.toISOString() : String(brief.date || ""),
            tags: brief.tags || []
        })),
        factChecks: checkRows.map((check: any) => factCard({
            slug: check.slug,
            claim: check.claim || "",
            claimBy: check.claimBy || "",
            verdict: check.verdict,
            image: check.image,
            date: check.date instanceof Date ? check.date.toISOString() : String(check.date || "")
        })),
        episodes: archive.eras
            .flatMap((era) => era.episodes)
            .filter((episode) => includesQuery(`${episode.title.en} ${episode.title.ne}`, trimmed))
            .slice(0, 8),
    };
}

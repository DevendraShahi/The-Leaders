import Article from "@/models/Article";
import Leader from "@/models/Leader";
import History from "@/models/History";
import ActivityLog from "@/models/ActivityLog";
import { DailyBrief, FactCheck, ElectionArticle, ColumnArticle } from "@/models/ElectionContent";
import dbConnect from "@/lib/db";
import { slugify } from "@/lib/slug";
import { invalidateManyPublicContent, type PublicContentKind } from "@/lib/cache-invalidation";

export const contentTypeOrder = [
    "articles",
    "leaders",
    "history",
    "dailyBriefs",
    "factChecks",
    "electionArticles",
    "columnArticles",
] as const;

export type ContentImportType = (typeof contentTypeOrder)[number];
type ImportAction = "create" | "update" | "skip" | "error";
type LocalizedText = { en: string; ne: string };
type ImportStatus = "draft" | "published" | "archived";

type ContentImportMeta = {
    schemaVersion: string;
    source: string;
    updateMode: "upsert" | "createOnly" | "updateOnly";
    localeMode: "auto" | "en" | "ne" | "both";
};

export type ContentImportItem = {
    type: ContentImportType;
    index: number;
    path: string;
    title: string;
    slug: string;
    status: string;
    action: ImportAction;
    languageCoverage: "both" | "en" | "ne" | "missing";
    errors: string[];
    warnings: string[];
};

export type ContentImportValidation = {
    ok: boolean;
    meta: ContentImportMeta;
    items: ContentImportItem[];
    stats: {
        total: number;
        byType: Record<ContentImportType, number>;
        actions: Record<ImportAction, number>;
        languages: Record<"both" | "enOnly" | "neOnly" | "missingEn" | "missingNe" | "missing", number>;
        statuses: Record<ImportStatus, number>;
        errors: number;
        warnings: number;
    };
};

type NormalizedItem = ContentImportItem & {
    data: Record<string, any>;
};

type ValidationContext = {
    meta: ContentImportMeta;
    items: NormalizedItem[];
    seenKeys: Set<string>;
};

const defaultMeta: ContentImportMeta = {
    schemaVersion: "content-import/v1",
    source: "manual-json",
    updateMode: "upsert",
    localeMode: "both",
};

const validStatuses = new Set(["draft", "published", "archived"]);
const validVerdicts = new Set(["true", "false", "misleading", "unverified"]);

const importTypeToPublicKind: Record<ContentImportType, PublicContentKind> = {
    articles: "article",
    leaders: "leader",
    history: "history",
    dailyBriefs: "daily-brief",
    factChecks: "fact-check",
    electionArticles: "election-article",
    columnArticles: "column-article",
};

function isObject(value: unknown): value is Record<string, any> {
    return !!value && typeof value === "object" && !Array.isArray(value);
}

function localized(value: unknown, localeMode: ContentImportMeta["localeMode"] = "both"): LocalizedText {
    if (typeof value === "string") {
        if (localeMode === "ne") return { en: "", ne: value };
        return { en: value, ne: "" };
    }

    if (!isObject(value)) return { en: "", ne: "" };
    return {
        en: typeof value.en === "string" ? value.en : "",
        ne: typeof value.ne === "string" ? value.ne : "",
    };
}

function localizedForRequired(value: LocalizedText): LocalizedText {
    return {
        en: value.en || value.ne,
        ne: value.ne || value.en,
    };
}

function firstText(...values: unknown[]): string {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) return value.trim();
        if (isObject(value)) {
            const text = [value.en, value.ne].find((item) => typeof item === "string" && item.trim());
            if (text) return String(text).trim();
        }
    }
    return "";
}

function stringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map((item) => String(item || "").trim()).filter(Boolean);
}

function cleanStatus(value: unknown, fallback: ImportStatus = "draft"): ImportStatus {
    const status = typeof value === "string" ? value : fallback;
    return validStatuses.has(status) ? (status as ImportStatus) : fallback;
}

function languageCoverage(fields: LocalizedText[]) {
    const hasEn = fields.some((field) => field.en.trim().length > 0);
    const hasNe = fields.some((field) => field.ne.trim().length > 0);
    if (hasEn && hasNe) return "both" as const;
    if (hasEn) return "en" as const;
    if (hasNe) return "ne" as const;
    return "missing" as const;
}

function addLanguageWarnings(item: ContentImportItem, fields: LocalizedText[]) {
    const hasEn = fields.some((field) => field.en.trim().length > 0);
    const hasNe = fields.some((field) => field.ne.trim().length > 0);
    if (!hasEn) item.warnings.push("Missing English content");
    if (!hasNe) item.warnings.push("Missing Nepali content");
}

function normalizeMeta(payload: Record<string, any>): ContentImportMeta {
    const meta = isObject(payload.meta) ? payload.meta : {};
    return {
        schemaVersion: typeof meta.schemaVersion === "string" ? meta.schemaVersion : defaultMeta.schemaVersion,
        source: typeof meta.source === "string" ? meta.source : defaultMeta.source,
        updateMode: meta.updateMode === "createOnly" || meta.updateMode === "updateOnly" ? meta.updateMode : "upsert",
        localeMode: meta.localeMode === "auto" || meta.localeMode === "en" || meta.localeMode === "ne" || meta.localeMode === "both"
            ? meta.localeMode
            : "both",
    };
}

function normalizeLegacyPayload(input: Record<string, any>) {
    const payload = { ...input };
    const hasLegacyPerplexityShape =
        payload.meta?.schemaVersion !== defaultMeta.schemaVersion &&
        Array.isArray(payload.articles) &&
        !Array.isArray(payload.electionArticles) &&
        (Array.isArray(payload.dailyBriefs) || Array.isArray(payload.factChecks)) &&
        payload.articles.every((item: any) => !item?.author && !item?.category);

    if (hasLegacyPerplexityShape) {
        payload.electionArticles = payload.articles;
        delete payload.articles;
        payload.meta = {
            ...(isObject(payload.meta) ? payload.meta : {}),
            schemaVersion: defaultMeta.schemaVersion,
            source: "perplexity-legacy",
        };
    }

    return payload;
}

async function getAction(type: ContentImportType, key: string, meta: ContentImportMeta): Promise<ImportAction> {
    if (!key) return "error";

    let existing: unknown = null;
    if (type === "articles") existing = await Article.findOne({ slug: key }).select("_id").lean();
    if (type === "leaders") existing = await Leader.findOne({ slug: key }).select("_id").lean();
    if (type === "dailyBriefs") existing = await DailyBrief.findOne({ slug: key }).select("_id").lean();
    if (type === "factChecks") existing = await FactCheck.findOne({ slug: key }).select("_id").lean();
    if (type === "electionArticles") existing = await ElectionArticle.findOne({ slug: key }).select("_id").lean();
    if (type === "columnArticles") existing = await ColumnArticle.findOne({ slug: key }).select("_id").lean();
    if (type === "history") {
        const [date, title] = key.split("::");
        existing = await History.findOne({
            date: new Date(`${date}T00:00:00.000Z`),
            $or: [{ "title.en": title }, { "title.ne": title }],
        }).select("_id").lean();
    }

    if (existing && meta.updateMode === "createOnly") return "skip";
    if (!existing && meta.updateMode === "updateOnly") return "skip";
    return existing ? "update" : "create";
}

function baseItem(type: ContentImportType, index: number, title: string, slug: string, status: string): ContentImportItem {
    return {
        type,
        index,
        path: `${type}[${index}]`,
        title,
        slug,
        status,
        action: "error",
        languageCoverage: "missing",
        errors: [],
        warnings: [],
    };
}

function checkDuplicate(ctx: ValidationContext, item: ContentImportItem, key: string) {
    const scoped = `${item.type}:${key}`;
    if (ctx.seenKeys.has(scoped)) {
        item.errors.push(`Duplicate key in payload: ${key}`);
    }
    ctx.seenKeys.add(scoped);
}

async function normalizeArticle(ctx: ValidationContext, raw: unknown, index: number): Promise<NormalizedItem> {
    const data = isObject(raw) ? raw : {};
    const title = localized(data.title, ctx.meta.localeMode);
    const excerpt = localized(data.excerpt, ctx.meta.localeMode);
    const content = localized(data.content, ctx.meta.localeMode);
    const author = localized(data.author, ctx.meta.localeMode);
    const category = localized(data.category, ctx.meta.localeMode);
    const slug = typeof data.slug === "string" ? slugify(data.slug, 90) : "";
    const status = cleanStatus(data.status);
    const item = baseItem("articles", index, firstText(title), slug, status);

    if (!firstText(title)) item.errors.push("Title is required");
    if (!slug) item.errors.push("Slug is required");
    if (!firstText(author)) item.errors.push("Author is required");
    checkDuplicate(ctx, item, slug);

    const languageFields = [title, excerpt, content, author, category];
    item.languageCoverage = languageCoverage(languageFields);
    addLanguageWarnings(item, languageFields);
    item.action = item.errors.length ? "error" : await getAction(item.type, slug, ctx.meta);
    return {
        ...item,
        data: {
            title,
            slug,
            excerpt,
            content,
            author,
            category,
            image: typeof data.image === "string" ? data.image : "",
            tags: stringArray(data.tags),
            status,
            isFeatured: Boolean(data.isFeatured),
            publishedDate: data.publishedDate ? new Date(data.publishedDate) : new Date(),
            seoTitle: data.seoTitle ? localized(data.seoTitle, ctx.meta.localeMode) : undefined,
            seoDescription: data.seoDescription ? localized(data.seoDescription, ctx.meta.localeMode) : undefined,
        },
    };
}

async function normalizeLeader(ctx: ValidationContext, raw: unknown, index: number): Promise<NormalizedItem> {
    const data = isObject(raw) ? raw : {};
    const name = localized(data.name, ctx.meta.localeMode);
    const desc = localized(data.desc, ctx.meta.localeMode);
    const bio = localized(data.bio, ctx.meta.localeMode);
    const party = localized(data.party, ctx.meta.localeMode);
    const position = localized(data.position ?? data.role, ctx.meta.localeMode);
    const years = localized(data.years, ctx.meta.localeMode);
    const slug = typeof data.slug === "string" ? slugify(data.slug, 90) : "";
    const status = cleanStatus(data.status, "published");
    const item = baseItem("leaders", index, firstText(name), slug, status);

    if (!firstText(name)) item.errors.push("Name is required");
    if (!slug) item.errors.push("Slug is required");
    checkDuplicate(ctx, item, slug);

    const languageFields = [name, desc, bio, party, position, years];
    item.languageCoverage = languageCoverage(languageFields);
    addLanguageWarnings(item, languageFields);
    item.action = item.errors.length ? "error" : await getAction(item.type, slug, ctx.meta);

    const stats: Record<string, LocalizedText> = {};
    if (isObject(data.stats)) {
        for (const [key, value] of Object.entries(data.stats)) {
            stats[slugify(key, 50).replace(/-/g, "_") || key] = localized(value, ctx.meta.localeMode);
        }
    }

    return {
        ...item,
        data: {
            name,
            desc,
            bio,
            party,
            position,
            years,
            slug,
            image: typeof data.image === "string" ? data.image : "",
            cover: typeof data.cover === "string" ? data.cover : "",
            stats,
            timeline: Array.isArray(data.timeline)
                ? data.timeline.map((event: any) => ({
                    year: String(event?.year || ""),
                    event: localized(event?.event, ctx.meta.localeMode),
                })).filter((event: any) => event.year || firstText(event.event))
                : [],
            socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : [],
            status,
            isFeatured: Boolean(data.isFeatured),
            isActive: data.isActive !== false,
            order: Number.isFinite(Number(data.order)) ? Number(data.order) : 0,
        },
    };
}

async function normalizeHistory(ctx: ValidationContext, raw: unknown, index: number): Promise<NormalizedItem> {
    const data = isObject(raw) ? raw : {};
    const title = localized(data.title, ctx.meta.localeMode);
    const content = localized(data.content, ctx.meta.localeMode);
    const date = data.date ? new Date(data.date) : null;
    const dateKey = date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "";
    const titleText = firstText(title);
    const key = dateKey && titleText ? `${dateKey}::${titleText}` : "";
    const status = cleanStatus(data.status, "published");
    const item = baseItem("history", index, titleText, key, status);

    if (!titleText) item.errors.push("Title is required");
    if (!dateKey) item.errors.push("Valid date is required");
    if (!firstText(content)) item.errors.push("Content is required");
    if (data.location || data.significance || data.timeline) {
        item.warnings.push("History location, significance, and timeline are ignored until the model supports them");
    }
    checkDuplicate(ctx, item, key);

    const languageFields = [title, content];
    item.languageCoverage = languageCoverage(languageFields);
    addLanguageWarnings(item, languageFields);
    item.action = item.errors.length ? "error" : await getAction(item.type, key, ctx.meta);
    return {
        ...item,
        data: {
            title: localizedForRequired(title),
            date: date || new Date(),
            content: localizedForRequired(content),
            image: typeof data.image === "string" ? data.image : "",
            status,
            isFeatured: Boolean(data.isFeatured),
            order: Number.isFinite(Number(data.order)) ? Number(data.order) : 0,
        },
    };
}

async function normalizeBrief(ctx: ValidationContext, raw: unknown, index: number): Promise<NormalizedItem> {
    const data = isObject(raw) ? raw : {};
    const title = localized(data.title, ctx.meta.localeMode);
    const summary = localized(data.summary, ctx.meta.localeMode);
    const content = localized(data.content, ctx.meta.localeMode);
    const slug = typeof data.slug === "string" ? slugify(data.slug, 90) : "";
    const status = cleanStatus(data.status, data.isPublished ? "published" : "draft");
    const item = baseItem("dailyBriefs", index, firstText(title), slug, status);

    if (!firstText(title)) item.errors.push("Title is required");
    if (!slug) item.errors.push("Slug is required");
    checkDuplicate(ctx, item, slug);

    const languageFields = [title, summary, content];
    item.languageCoverage = languageCoverage(languageFields);
    addLanguageWarnings(item, languageFields);
    item.action = item.errors.length ? "error" : await getAction(item.type, slug, ctx.meta);
    return {
        ...item,
        data: {
            title,
            slug,
            date: data.date ? new Date(data.date) : new Date(),
            summary,
            content,
            tags: stringArray(data.tags),
            status,
            isPublished: status === "published",
            image: typeof data.image === "string" ? data.image : undefined,
        },
    };
}

async function normalizeFactCheck(ctx: ValidationContext, raw: unknown, index: number): Promise<NormalizedItem> {
    const data = isObject(raw) ? raw : {};
    const claim = localized(data.claim, ctx.meta.localeMode);
    const claimBy = localized(data.claimBy, ctx.meta.localeMode);
    const analysis = localized(data.analysis, ctx.meta.localeMode);
    const claimText = firstText(claim);
    const slug = typeof data.slug === "string" && data.slug.trim() ? slugify(data.slug, 90) : slugify(claimText, 60);
    const status = cleanStatus(data.status, "draft");
    const verdict = typeof data.verdict === "string" ? data.verdict : "";
    const item = baseItem("factChecks", index, claimText, slug, status);

    if (!claimText) item.errors.push("Claim is required");
    if (!validVerdicts.has(verdict)) item.errors.push("Verdict must be true, false, misleading, or unverified");
    if (!slug) item.errors.push("Slug is required or must be derivable from claim");
    checkDuplicate(ctx, item, slug);

    const languageFields = [claim, claimBy, analysis];
    item.languageCoverage = languageCoverage(languageFields);
    addLanguageWarnings(item, languageFields);
    item.action = item.errors.length ? "error" : await getAction(item.type, slug, ctx.meta);
    return {
        ...item,
        data: {
            claim,
            claimBy,
            slug,
            verdict,
            analysis,
            sources: stringArray(data.sources),
            date: data.date ? new Date(data.date) : new Date(),
            status,
            image: typeof data.image === "string" ? data.image : undefined,
        },
    };
}

async function normalizeFlatArticle(ctx: ValidationContext, raw: unknown, index: number, type: "electionArticles" | "columnArticles"): Promise<NormalizedItem> {
    const data = isObject(raw) ? raw : {};
    const title = localized(data.title ?? { en: data.title_en, ne: data.title_ne }, ctx.meta.localeMode);
    const excerpt = localized(data.excerpt ?? { en: data.excerpt_en, ne: data.excerpt_ne }, ctx.meta.localeMode);
    const content = localized(data.content ?? { en: data.content_en, ne: data.content_ne }, ctx.meta.localeMode);
    const slug = typeof data.slug === "string" ? slugify(data.slug, 90) : "";
    const status = cleanStatus(data.status);
    const item = baseItem(type, index, firstText(title), slug, status);

    if (!firstText(title)) item.errors.push("Title is required");
    if (!slug) item.errors.push("Slug is required");
    if (type === "columnArticles" && !data.category) item.warnings.push("Category is recommended for column articles");
    checkDuplicate(ctx, item, slug);

    const languageFields = [title, excerpt, content];
    item.languageCoverage = languageCoverage(languageFields);
    addLanguageWarnings(item, languageFields);
    item.action = item.errors.length ? "error" : await getAction(item.type, slug, ctx.meta);
    return {
        ...item,
        data: {
            editor: typeof data.editor === "string" && data.editor.trim() ? data.editor.trim() : "The Leaders Editorial",
            category: typeof data.category === "string" ? data.category : undefined,
            title_en: title.en || title.ne,
            title_ne: title.ne || undefined,
            excerpt_en: excerpt.en || excerpt.ne,
            excerpt_ne: excerpt.ne || undefined,
            content_en: content.en || content.ne,
            content_ne: content.ne || undefined,
            slug,
            tags: stringArray(data.tags),
            status,
            image: typeof data.image === "string" ? data.image : undefined,
        },
    };
}

async function normalizeItems(payload: Record<string, any>, meta: ContentImportMeta): Promise<NormalizedItem[]> {
    const ctx: ValidationContext = { meta, items: [], seenKeys: new Set() };
    const normalizers: Record<ContentImportType, (ctx: ValidationContext, raw: unknown, index: number) => Promise<NormalizedItem>> = {
        articles: normalizeArticle,
        leaders: normalizeLeader,
        history: normalizeHistory,
        dailyBriefs: normalizeBrief,
        factChecks: normalizeFactCheck,
        electionArticles: (innerCtx, raw, index) => normalizeFlatArticle(innerCtx, raw, index, "electionArticles"),
        columnArticles: (innerCtx, raw, index) => normalizeFlatArticle(innerCtx, raw, index, "columnArticles"),
    };

    for (const type of contentTypeOrder) {
        const rows = payload[type];
        if (rows === undefined) continue;
        if (!Array.isArray(rows)) {
            ctx.items.push({
                ...baseItem(type, 0, type, "", "draft"),
                action: "error",
                errors: [`${type} must be an array`],
                data: {},
            });
            continue;
        }

        for (let index = 0; index < rows.length; index += 1) {
            ctx.items.push(await normalizers[type](ctx, rows[index], index));
        }
    }

    return ctx.items;
}

function buildValidation(meta: ContentImportMeta, items: NormalizedItem[]): ContentImportValidation {
    const stats: ContentImportValidation["stats"] = {
        total: items.length,
        byType: Object.fromEntries(contentTypeOrder.map((type) => [type, 0])) as Record<ContentImportType, number>,
        actions: { create: 0, update: 0, skip: 0, error: 0 },
        languages: { both: 0, enOnly: 0, neOnly: 0, missingEn: 0, missingNe: 0, missing: 0 },
        statuses: { draft: 0, published: 0, archived: 0 },
        errors: 0,
        warnings: 0,
    };

    for (const item of items) {
        stats.byType[item.type] += 1;
        stats.actions[item.action] += 1;
        if (validStatuses.has(item.status)) stats.statuses[item.status as ImportStatus] += 1;
        if (item.languageCoverage === "both") stats.languages.both += 1;
        if (item.languageCoverage === "en") {
            stats.languages.enOnly += 1;
            stats.languages.missingNe += 1;
        }
        if (item.languageCoverage === "ne") {
            stats.languages.neOnly += 1;
            stats.languages.missingEn += 1;
        }
        if (item.languageCoverage === "missing") {
            stats.languages.missing += 1;
            stats.languages.missingEn += 1;
            stats.languages.missingNe += 1;
        }
        stats.errors += item.errors.length;
        stats.warnings += item.warnings.length;
    }

    return {
        ok: stats.errors === 0,
        meta,
        items: items.map(({ data, ...item }) => item),
        stats,
    };
}

export async function validateContentImport(rawPayload: unknown): Promise<ContentImportValidation & { normalized: NormalizedItem[] }> {
    if (!isObject(rawPayload)) {
        const meta = { ...defaultMeta };
        const item: NormalizedItem = {
            ...baseItem("articles", 0, "Invalid payload", "", "draft"),
            action: "error",
            errors: ["Top-level JSON must be an object"],
            data: {},
        };
        return { ...buildValidation(meta, [item]), normalized: [item] };
    }

    await dbConnect();
    const payload = normalizeLegacyPayload(rawPayload);
    const meta = normalizeMeta(payload);
    const normalized = await normalizeItems(payload, meta);
    return { ...buildValidation(meta, normalized), normalized };
}

export async function commitContentImport(rawPayload: unknown, user: { userId: string; email?: string }, requestMeta: { ipAddress: string; userAgent: string }) {
    const validation = await validateContentImport(rawPayload);
    if (!validation.ok) return validation;

    const writable = validation.normalized.filter((item) => item.action === "create" || item.action === "update");

    for (const item of writable) {
        if (item.type === "articles") {
            await Article.updateOne({ slug: item.slug }, { $set: { ...item.data, lastModifiedBy: user.userId } }, { upsert: true, runValidators: true });
        } else if (item.type === "leaders") {
            await Leader.updateOne({ slug: item.slug }, { $set: { ...item.data, lastModifiedBy: user.userId } }, { upsert: true, runValidators: true });
        } else if (item.type === "history") {
            const [date, title] = item.slug.split("::");
            await History.updateOne(
                {
                    date: new Date(`${date}T00:00:00.000Z`),
                    $or: [{ "title.en": title }, { "title.ne": title }],
                },
                { $set: { ...item.data, lastModifiedBy: user.userId } },
                { upsert: true, runValidators: true }
            );
        } else if (item.type === "dailyBriefs") {
            await DailyBrief.updateOne({ slug: item.slug }, { $set: item.data }, { upsert: true, runValidators: true });
        } else if (item.type === "factChecks") {
            await FactCheck.updateOne({ slug: item.slug }, { $set: item.data }, { upsert: true, runValidators: true });
        } else if (item.type === "electionArticles") {
            await ElectionArticle.updateOne({ slug: item.slug }, { $set: item.data }, { upsert: true, runValidators: true });
        } else if (item.type === "columnArticles") {
            await ColumnArticle.updateOne({ slug: item.slug }, { $set: item.data }, { upsert: true, runValidators: true });
        }
    }

    invalidateManyPublicContent(writable.map((item) => ({
        kind: importTypeToPublicKind[item.type],
        slug: item.type === "history" ? undefined : item.slug,
    })));

    await ActivityLog.create({
        adminId: user.userId,
        action: "bulk_action",
        entityType: "Article",
        description: "Unified JSON content import",
        metadata: {
            meta: validation.meta,
            stats: validation.stats,
        },
        ipAddress: requestMeta.ipAddress,
        userAgent: requestMeta.userAgent,
    });

    return validation;
}

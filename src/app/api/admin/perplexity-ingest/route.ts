import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ActivityLog from "@/models/ActivityLog";
import PerplexityIngestSnapshot from "@/models/PerplexityIngestSnapshot";
import { DailyBrief, FactCheck, ElectionArticle } from "@/models/ElectionContent";
import { withAuth } from "@/lib/middleware";
import { slugify } from "@/lib/slug";

type ParserError = { path: string; message: string };
type ParserWarning = { path: string; message: string };
type LocaleMode = "en" | "ne" | "both";
type UpdateMode = "merge" | "replace";
type LocalizedText = { en?: string; ne?: string };

type NormalizedData = {
    meta: {
        generated_at_utc: string;
        focus: string;
        locale_mode: LocaleMode;
        update_mode: UpdateMode;
    };
    dailyBriefs: {
        title: LocalizedText;
        slug: string;
        published_at_utc: string;
        summary: LocalizedText;
        content: LocalizedText;
        tags: string[];
        is_published: boolean;
    }[];
    factChecks: {
        claim: LocalizedText;
        slug: string;
        claim_by: LocalizedText;
        verdict: "true" | "false" | "misleading" | "unverified";
        analysis: LocalizedText;
        sources: string[];
        published_at_utc: string;
    }[];
    articles: {
        editor: string;
        title: LocalizedText;
        excerpt: LocalizedText;
        content: LocalizedText;
        slug: string;
        tags: string[];
        status: string;
    }[];
};

const verdictSet = new Set(["true", "false", "misleading", "unverified"]);
const localeModeSet = new Set(["en", "ne", "both"]);
const updateModeSet = new Set(["merge", "replace"]);

function isObject(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === "object" && !Array.isArray(value);
}

function parseJsonFromString(raw: string): { ok: true; value: unknown } | { ok: false; message: string } {
    const trimmed = raw.trim();
    const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    const unfenced = fenceMatch ? fenceMatch[1].trim() : trimmed;
    const extractedStart = unfenced.indexOf("{");
    const extractedEnd = unfenced.lastIndexOf("}");
    const extracted =
        extractedStart >= 0 && extractedEnd > extractedStart
            ? unfenced.slice(extractedStart, extractedEnd + 1).trim()
            : "";

    const candidates = [trimmed, unfenced, extracted]
        .filter((candidate) => candidate.length > 0)
        .filter((candidate, index, arr) => arr.indexOf(candidate) === index);

    let lastError = "parse error";
    for (const candidate of candidates) {
        try {
            return { ok: true, value: JSON.parse(candidate) };
        } catch (error: any) {
            lastError = error?.message || "parse error";
        }
    }

    return {
        ok: false,
        message:
            `Invalid JSON: ${lastError}. ` +
            "Paste a raw JSON object or a fenced ```json block containing a single object.",
    };
}

function addError(errors: ParserError[], path: string, message: string) {
    errors.push({ path, message });
}

function validateString(value: unknown, path: string, errors: ParserError[]): value is string {
    if (typeof value !== "string") {
        addError(errors, path, "Expected string");
        return false;
    }
    return true;
}

function validateBoolean(value: unknown, path: string, errors: ParserError[]): value is boolean {
    if (typeof value !== "boolean") {
        addError(errors, path, "Expected boolean");
        return false;
    }
    return true;
}

function validateStringArray(value: unknown, path: string, errors: ParserError[]): value is string[] {
    if (!Array.isArray(value)) {
        addError(errors, path, "Expected array of strings");
        return false;
    }
    let ok = true;
    value.forEach((item, idx) => {
        if (typeof item !== "string") {
            addError(errors, `${path}[${idx}]`, "Expected string");
            ok = false;
        }
    });
    return ok;
}

function parseLocalized(
    value: unknown,
    path: string,
    errors: ParserError[],
    localeMode: LocaleMode
): LocalizedText | null {
    if (typeof value === "string") {
        if (localeMode === "ne") return { ne: value };
        return { en: value };
    }

    if (!isObject(value)) {
        addError(errors, path, "Expected string or localized object");
        return null;
    }

    const hasEn = Object.prototype.hasOwnProperty.call(value, "en");
    const hasNe = Object.prototype.hasOwnProperty.call(value, "ne");
    const out: LocalizedText = {};

    if (hasEn) {
        if (typeof value.en === "string") out.en = value.en;
        else addError(errors, `${path}.en`, "Expected string");
    }

    if (hasNe) {
        if (typeof value.ne === "string") out.ne = value.ne;
        else addError(errors, `${path}.ne`, "Expected string");
    }

    if (!hasEn && !hasNe) {
        addError(errors, path, "Localized object must include en and/or ne");
        return null;
    }

    if (!out.en && !out.ne) {
        return null;
    }

    return out;
}

function preferredText(value: LocalizedText): string {
    return value.en || value.ne || "";
}

function normalizeLocalizedStored(value: unknown): LocalizedText {
    if (typeof value === "string") return { en: value };
    if (!isObject(value)) return {};
    const out: LocalizedText = {};
    if (typeof value.en === "string") out.en = value.en;
    if (typeof value.ne === "string") out.ne = value.ne;
    return out;
}

function mergeLocalized(
    existingValue: unknown,
    incomingValue: LocalizedText,
    localeMode: LocaleMode,
    updateMode: UpdateMode
): LocalizedText {
    const existing = normalizeLocalizedStored(existingValue);
    const incoming = normalizeLocalizedStored(incomingValue);
    const result: LocalizedText = updateMode === "replace" ? {} : { ...existing };

    if (localeMode === "en") {
        const next = incoming.en ?? incoming.ne;
        if (typeof next === "string") result.en = next;
        return result;
    }

    if (localeMode === "ne") {
        const next = incoming.ne ?? incoming.en;
        if (typeof next === "string") result.ne = next;
        return result;
    }

    if (typeof incoming.en === "string") result.en = incoming.en;
    if (typeof incoming.ne === "string") result.ne = incoming.ne;
    return result;
}

function parsePayload(raw: unknown): { ok: boolean; data: NormalizedData | null; errors: ParserError[] } {
    const errors: ParserError[] = [];

    let payload: unknown = raw;
    if (typeof raw === "string") {
        const parsedString = parseJsonFromString(raw);
        if (!parsedString.ok) {
            return {
                ok: false,
                data: null,
                errors: [
                    {
                        path: "$",
                        message: parsedString.message,
                    },
                ],
            };
        }
        payload = parsedString.value;
    }

    if (!isObject(payload)) {
        return {
            ok: false,
            data: null,
            errors: [{ path: "$", message: "Expected JSON object at top level" }],
        };
    }

    const meta = payload.meta;
    const dailyBriefs = payload.dailyBriefs;
    const factChecks = payload.factChecks;
    const articles = payload.articles;

    const topLevelOk =
        isObject(meta) &&
        Array.isArray(dailyBriefs) &&
        Array.isArray(factChecks) &&
        Array.isArray(articles);

    if (!topLevelOk) {
        if (!isObject(meta)) addError(errors, "meta", "Missing or invalid object");
        if (!Array.isArray(dailyBriefs)) addError(errors, "dailyBriefs", "Missing or invalid array");
        if (!Array.isArray(factChecks)) addError(errors, "factChecks", "Missing or invalid array");
        if (!Array.isArray(articles)) addError(errors, "articles", "Missing or invalid array");
        return { ok: false, data: null, errors };
    }

    const normalized: NormalizedData = {
        meta: {
            generated_at_utc: "",
            focus: "",
            locale_mode: "both",
            update_mode: "merge",
        },
        dailyBriefs: [],
        factChecks: [],
        articles: [],
    };

    const metaObj = meta as Record<string, unknown>;

    // META
    if (validateString(metaObj.generated_at_utc, "meta.generated_at_utc", errors)) {
        normalized.meta.generated_at_utc = metaObj.generated_at_utc;
    }
    if (validateString(metaObj.focus, "meta.focus", errors)) {
        normalized.meta.focus = metaObj.focus;
    }
    if (metaObj.locale_mode !== undefined) {
        if (validateString(metaObj.locale_mode, "meta.locale_mode", errors)) {
            if (localeModeSet.has(metaObj.locale_mode)) {
                normalized.meta.locale_mode = metaObj.locale_mode as LocaleMode;
            } else {
                addError(errors, "meta.locale_mode", "Invalid value; must be one of en, ne, both");
            }
        }
    }
    if (metaObj.update_mode !== undefined) {
        if (validateString(metaObj.update_mode, "meta.update_mode", errors)) {
            if (updateModeSet.has(metaObj.update_mode)) {
                normalized.meta.update_mode = metaObj.update_mode as UpdateMode;
            } else {
                addError(errors, "meta.update_mode", "Invalid value; must be one of merge, replace");
            }
        }
    }

    // DAILY BRIEFS
    dailyBriefs.forEach((item: unknown, idx: number) => {
        if (!isObject(item)) {
            addError(errors, `dailyBriefs[${idx}]`, "Expected object");
            return;
        }

        const title = parseLocalized(item.title, `dailyBriefs[${idx}].title`, errors, normalized.meta.locale_mode);
        const slugHint = item.slug ?? item.slug_hint;
        const date = item.date;
        const summary = parseLocalized(item.summary, `dailyBriefs[${idx}].summary`, errors, normalized.meta.locale_mode);
        const content = parseLocalized(item.content, `dailyBriefs[${idx}].content`, errors, normalized.meta.locale_mode);
        const tags = item.tags;
        const isPublished = item.isPublished;

        const valid =
            validateString(slugHint, `dailyBriefs[${idx}].slug_hint`, errors) &&
            validateString(date, `dailyBriefs[${idx}].date`, errors) &&
            validateStringArray(tags, `dailyBriefs[${idx}].tags`, errors) &&
            validateBoolean(isPublished, `dailyBriefs[${idx}].isPublished`, errors) &&
            !!title &&
            !!summary &&
            !!content;

        if (!valid) return;

        normalized.dailyBriefs.push({
            title,
            slug: slugHint,
            published_at_utc: date,
            summary,
            content,
            tags,
            is_published: isPublished,
        });
    });

    // FACT CHECKS
    factChecks.forEach((item: unknown, idx: number) => {
        if (!isObject(item)) {
            addError(errors, `factChecks[${idx}]`, "Expected object");
            return;
        }

        const claim = parseLocalized(item.claim, `factChecks[${idx}].claim`, errors, normalized.meta.locale_mode);
        const claimBy = parseLocalized(item.claimBy, `factChecks[${idx}].claimBy`, errors, normalized.meta.locale_mode);
        const analysis = parseLocalized(item.analysis, `factChecks[${idx}].analysis`, errors, normalized.meta.locale_mode);
        const sources = item.sources;
        const date = item.date;
        const verdict = item.verdict;
        const slugInput = item.slug;

        const verdictValid =
            validateString(verdict, `factChecks[${idx}].verdict`, errors) &&
            verdictSet.has(verdict);
        if (!verdictValid) {
            if (typeof verdict === "string") {
                addError(
                    errors,
                    `factChecks[${idx}].verdict`,
                    "Invalid verdict; must be one of true, false, misleading, unverified"
                );
            }
        }

        const valid =
            validateStringArray(sources, `factChecks[${idx}].sources`, errors) &&
            validateString(date, `factChecks[${idx}].date`, errors) &&
            verdictValid &&
            !!claim &&
            !!claimBy &&
            !!analysis &&
            (slugInput === undefined || typeof slugInput === "string");

        if (!valid) return;

        normalized.factChecks.push({
            claim,
            slug: typeof slugInput === "string" && slugInput.trim().length > 0
                ? slugInput
                : slugify(preferredText(claim), 60),
            claim_by: claimBy,
            verdict: verdict as NormalizedData["factChecks"][number]["verdict"],
            analysis,
            sources,
            published_at_utc: date,
        });
    });

    // ARTICLES (ElectionArticle collection)
    articles.forEach((item: unknown, idx: number) => {
        if (!isObject(item)) {
            addError(errors, `articles[${idx}]`, "Expected object");
            return;
        }

        const editor = item.editor;
        const slugHint = item.slug ?? item.slug_hint;
        const tags = item.tags;
        const status = item.status;

        const titleCandidate = item.title ?? {
            en: item.title_en,
            ne: item.title_ne,
        };
        const excerptCandidate = item.excerpt ?? {
            en: item.excerpt_en,
            ne: item.excerpt_ne,
        };
        const contentCandidate = item.content ?? {
            en: item.content_en,
            ne: item.content_ne,
        };

        const title = parseLocalized(titleCandidate, `articles[${idx}].title`, errors, normalized.meta.locale_mode);
        const excerpt = parseLocalized(excerptCandidate, `articles[${idx}].excerpt`, errors, normalized.meta.locale_mode);
        const content = parseLocalized(contentCandidate, `articles[${idx}].content`, errors, normalized.meta.locale_mode);

        const valid =
            validateString(slugHint, `articles[${idx}].slug_hint`, errors) &&
            validateStringArray(tags, `articles[${idx}].tags`, errors) &&
            validateString(status, `articles[${idx}].status`, errors) &&
            (!!editor ? validateString(editor, `articles[${idx}].editor`, errors) : true) &&
            !!title &&
            !!excerpt &&
            !!content;

        if (!valid) return;

        normalized.articles.push({
            editor: typeof editor === "string" ? editor : "The Leaders Editorial",
            title,
            excerpt,
            content,
            slug: slugHint,
            tags,
            status,
        });
    });

    return { ok: true, data: normalized, errors };
}

function collectWarnings(data: NormalizedData): ParserWarning[] {
    const warnings: ParserWarning[] = [];
    const mode = data.meta.locale_mode;
    const shouldCheckNe = mode === "both" || mode === "ne";
    const shouldCheckEn = mode === "both" || mode === "en";

    data.factChecks.forEach((fc, index) => {
        if (shouldCheckNe) {
            if (!fc.claim.ne) warnings.push({ path: `factChecks[${index}].claim.ne`, message: "Missing Nepali claim" });
            if (!fc.claim_by.ne) warnings.push({ path: `factChecks[${index}].claimBy.ne`, message: "Missing Nepali claimBy" });
            if (!fc.analysis.ne) warnings.push({ path: `factChecks[${index}].analysis.ne`, message: "Missing Nepali analysis" });
        }
        if (shouldCheckEn) {
            if (!fc.claim.en) warnings.push({ path: `factChecks[${index}].claim.en`, message: "Missing English claim" });
            if (!fc.claim_by.en) warnings.push({ path: `factChecks[${index}].claimBy.en`, message: "Missing English claimBy" });
            if (!fc.analysis.en) warnings.push({ path: `factChecks[${index}].analysis.en`, message: "Missing English analysis" });
        }
    });

    return warnings;
}

async function createSnapshot(data: NormalizedData, adminId: string) {
    await dbConnect();
    const dailyBriefSlugs = data.dailyBriefs.map((item) => item.slug);
    const factCheckSlugs = data.factChecks.map((item) => item.slug);
    const articleSlugs = data.articles.map((item) => item.slug);

    const [beforeBriefs, beforeFactChecks, beforeArticles] = await Promise.all([
        dailyBriefSlugs.length ? DailyBrief.find({ slug: { $in: dailyBriefSlugs } }).lean() : [],
        factCheckSlugs.length ? FactCheck.find({ slug: { $in: factCheckSlugs } }).lean() : [],
        articleSlugs.length ? ElectionArticle.find({ slug: { $in: articleSlugs } }).lean() : [],
    ]);

    const snapshot = await PerplexityIngestSnapshot.create({
        adminId,
        meta: data.meta,
        affected: {
            dailyBriefSlugs,
            factCheckSlugs,
            articleSlugs,
        },
        before: {
            dailyBriefs: beforeBriefs,
            factChecks: beforeFactChecks,
            articles: beforeArticles,
        },
    });

    return snapshot;
}

async function ingestToDatabase(data: NormalizedData) {
    await dbConnect();
    const localeMode = data.meta.locale_mode;
    const updateMode = data.meta.update_mode;

    // Daily briefs
    for (const brief of data.dailyBriefs) {
        const existing = await DailyBrief.findOne({ slug: brief.slug }).lean();
        const title = mergeLocalized(existing?.title, brief.title, localeMode, updateMode);
        const summary = mergeLocalized(existing?.summary, brief.summary, localeMode, updateMode);
        const content = mergeLocalized(existing?.content, brief.content, localeMode, updateMode);

        await DailyBrief.updateOne(
            { slug: brief.slug },
            {
                title,
                slug: brief.slug,
                date: new Date(brief.published_at_utc),
                summary,
                content,
                tags: brief.tags,
                isPublished: brief.is_published,
                status: brief.is_published ? "published" : "draft",
            },
            { upsert: true }
        );
    }

    // Fact checks (upsert by slug for stable EN/NE updates)
    for (const fc of data.factChecks) {
        const publishedAt = new Date(fc.published_at_utc);
        const existing = await FactCheck.findOne({ slug: fc.slug }).lean();
        const claim = mergeLocalized(existing?.claim, fc.claim, localeMode, updateMode);
        const claimBy = mergeLocalized(existing?.claimBy, fc.claim_by, localeMode, updateMode);
        const analysis = mergeLocalized(existing?.analysis, fc.analysis, localeMode, updateMode);

        await FactCheck.updateOne(
            { slug: fc.slug },
            {
                claim,
                slug: fc.slug,
                claimBy,
                verdict: fc.verdict,
                analysis,
                sources: fc.sources,
                date: publishedAt,
                status: "published",
            },
            { upsert: true }
        );
    }

    // Election-only articles
    for (const article of data.articles) {
        const existing = await ElectionArticle.findOne({ slug: article.slug }).lean();
        const titleMerged = mergeLocalized(
            { en: existing?.title_en, ne: existing?.title_ne },
            article.title,
            localeMode,
            updateMode
        );
        const excerptMerged = mergeLocalized(
            { en: existing?.excerpt_en, ne: existing?.excerpt_ne },
            article.excerpt,
            localeMode,
            updateMode
        );
        const contentMerged = mergeLocalized(
            { en: existing?.content_en, ne: existing?.content_ne },
            article.content,
            localeMode,
            updateMode
        );

        await ElectionArticle.updateOne(
            { slug: article.slug },
            {
                editor: article.editor,
                title_en: titleMerged.en || titleMerged.ne || "",
                title_ne: titleMerged.ne,
                excerpt_en: excerptMerged.en || excerptMerged.ne || "",
                excerpt_ne: excerptMerged.ne,
                content_en: contentMerged.en || contentMerged.ne || "",
                content_ne: contentMerged.ne,
                slug: article.slug,
                tags: article.tags,
                status: article.status,
            },
            { upsert: true }
        );
    }
}

async function ingestPerplexity(request: NextRequest, { user }: { user: any }) {
    let body: unknown;
    try {
        body = await request.json();
    } catch (error: any) {
        return NextResponse.json(
            {
                ok: false,
                data: null,
                errors: [
                    {
                        path: "$",
                        message: `Invalid JSON: ${error?.message || "parse error"}`,
                    },
                ],
            },
            { status: 400 }
        );
    }

    const parsed = parsePayload(body);

    if (!parsed.ok || !parsed.data) {
        return NextResponse.json(parsed, { status: 400 });
    }

    // Optional query-param overrides for import behavior
    const searchParams = new URL(request.url).searchParams;
    const localeModeOverride = searchParams.get("localeMode");
    const updateModeOverride = searchParams.get("updateMode");
    if (localeModeOverride && localeModeSet.has(localeModeOverride)) {
        parsed.data.meta.locale_mode = localeModeOverride as LocaleMode;
    }
    if (updateModeOverride && updateModeSet.has(updateModeOverride)) {
        parsed.data.meta.update_mode = updateModeOverride as UpdateMode;
    }

    const warnings = collectWarnings(parsed.data);
    const dryRun = new URL(request.url).searchParams.get("dryRun") === "true";
    if (dryRun) {
        return NextResponse.json(
            {
                ...parsed,
                dryRun: true,
                warnings,
                snapshotId: null,
            },
            { status: 200 }
        );
    }

    const snapshot = await createSnapshot(parsed.data, user.userId);
    await ingestToDatabase(parsed.data);

    await ActivityLog.create({
        adminId: user.userId,
        action: "bulk_action",
        entityType: "Article",
        description: "Perplexity election content ingest (strict JSON)",
        metadata: {
            meta: parsed.data.meta,
            counts: {
                dailyBriefs: parsed.data.dailyBriefs.length,
                factChecks: parsed.data.factChecks.length,
                articles: parsed.data.articles.length,
            },
            errors: parsed.errors,
            warnings,
            snapshotId: snapshot._id?.toString?.() || snapshot._id,
        },
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json(
        {
            ...parsed,
            dryRun: false,
            warnings,
            snapshotId: snapshot._id?.toString?.() || snapshot._id,
        },
        { status: 200 }
    );
}

export const POST = withAuth(ingestPerplexity);

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ActivityLog from "@/models/ActivityLog";
import { DailyBrief, FactCheck, ElectionArticle } from "@/models/ElectionContent";
import { withAuth } from "@/lib/middleware";
import { slugify } from "@/lib/slug";

type ParserError = { path: string; message: string };

type NormalizedData = {
    meta: {
        generated_at_utc: string;
        focus: string;
    };
    dailyBriefs: {
        title: string;
        slug: string;
        published_at_utc: string;
        summary: string;
        content: string;
        tags: string[];
        is_published: boolean;
    }[];
    factChecks: {
        claim: string;
        slug: string;
        claim_by: string;
        verdict: "true" | "false" | "misleading" | "unverified";
        analysis: string;
        sources: string[];
        published_at_utc: string;
    }[];
    articles: {
        editor: string;
        title_en: string;
        excerpt_en: string;
        content_en: string;
        slug: string;
        tags: string[];
        status: string;
    }[];
};

const verdictSet = new Set(["true", "false", "misleading", "unverified"]);

function isObject(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === "object" && !Array.isArray(value);
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

function parsePayload(raw: unknown): { ok: boolean; data: NormalizedData | null; errors: ParserError[] } {
    const errors: ParserError[] = [];

    let payload: unknown = raw;
    if (typeof raw === "string") {
        try {
            payload = JSON.parse(raw);
        } catch (error: any) {
            return {
                ok: false,
                data: null,
                errors: [
                    {
                        path: "$",
                        message: `Invalid JSON: ${error?.message || "parse error"}`,
                    },
                ],
            };
        }
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

    // DAILY BRIEFS
    dailyBriefs.forEach((item: unknown, idx: number) => {
        if (!isObject(item)) {
            addError(errors, `dailyBriefs[${idx}]`, "Expected object");
            return;
        }

        const title = item.title;
        const slugHint = item.slug_hint;
        const date = item.date;
        const summary = item.summary;
        const content = item.content;
        const tags = item.tags;
        const isPublished = item.isPublished;

        const valid =
            validateString(title, `dailyBriefs[${idx}].title`, errors) &&
            validateString(slugHint, `dailyBriefs[${idx}].slug_hint`, errors) &&
            validateString(date, `dailyBriefs[${idx}].date`, errors) &&
            validateString(summary, `dailyBriefs[${idx}].summary`, errors) &&
            validateString(content, `dailyBriefs[${idx}].content`, errors) &&
            validateStringArray(tags, `dailyBriefs[${idx}].tags`, errors) &&
            validateBoolean(isPublished, `dailyBriefs[${idx}].isPublished`, errors);

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

        const claim = item.claim;
        const claimBy = item.claimBy;
        const analysis = item.analysis;
        const sources = item.sources;
        const date = item.date;
        const verdict = item.verdict;

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
            validateString(claim, `factChecks[${idx}].claim`, errors) &&
            validateString(claimBy, `factChecks[${idx}].claimBy`, errors) &&
            validateString(analysis, `factChecks[${idx}].analysis`, errors) &&
            validateStringArray(sources, `factChecks[${idx}].sources`, errors) &&
            validateString(date, `factChecks[${idx}].date`, errors) &&
            verdictValid;

        if (!valid) return;

        normalized.factChecks.push({
            claim,
            slug: slugify(claim, 60),
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
        const title = item.title_en;
        const excerpt = item.excerpt_en;
        const content = item.content_en;
        const slugHint = item.slug_hint;
        const tags = item.tags;
        const status = item.status;

        const valid =
            validateString(editor, `articles[${idx}].editor`, errors) &&
            validateString(title, `articles[${idx}].title_en`, errors) &&
            validateString(excerpt, `articles[${idx}].excerpt_en`, errors) &&
            validateString(content, `articles[${idx}].content_en`, errors) &&
            validateString(slugHint, `articles[${idx}].slug_hint`, errors) &&
            validateStringArray(tags, `articles[${idx}].tags`, errors) &&
            validateString(status, `articles[${idx}].status`, errors);

        if (!valid) return;

        normalized.articles.push({
            editor,
            title_en: title,
            excerpt_en: excerpt,
            content_en: content,
            slug: slugHint,
            tags,
            status,
        });
    });

    return { ok: true, data: normalized, errors };
}

async function ingestToDatabase(data: NormalizedData) {
    await dbConnect();

    // Daily briefs
    for (const brief of data.dailyBriefs) {
        await DailyBrief.updateOne(
            { slug: brief.slug },
            {
                title: brief.title,
                slug: brief.slug,
                date: new Date(brief.published_at_utc),
                summary: brief.summary,
                content: brief.content,
                tags: brief.tags,
                isPublished: brief.is_published,
            },
            { upsert: true }
        );
    }

    // Fact checks (upsert by claim + date to prevent duplicates)
    for (const fc of data.factChecks) {
        const publishedAt = new Date(fc.published_at_utc);
        await FactCheck.updateOne(
            { claim: fc.claim, date: publishedAt },
            {
                claim: fc.claim,
                slug: fc.slug,
                claimBy: fc.claim_by,
                verdict: fc.verdict,
                analysis: fc.analysis,
                sources: fc.sources,
                date: publishedAt,
            },
            { upsert: true }
        );
    }

    // Election-only articles
    for (const article of data.articles) {
        await ElectionArticle.updateOne(
            { slug: article.slug },
            {
                editor: article.editor,
                title_en: article.title_en,
                excerpt_en: article.excerpt_en,
                content_en: article.content_en,
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
        },
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json(parsed, { status: 200 });
}

export const POST = withAuth(ingestPerplexity);

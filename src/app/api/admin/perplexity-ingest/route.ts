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

    // META
    if (validateString(meta.generated_at_utc, "meta.generated_at_utc", errors)) {
        normalized.meta.generated_at_utc = meta.generated_at_utc;
    }
    if (validateString(meta.focus, "meta.focus", errors)) {
        normalized.meta.focus = meta.focus;
    }

    // DAILY BRIEFS
    dailyBriefs.forEach((item: unknown, idx: number) => {
        if (!isObject(item)) {
            addError(errors, `dailyBriefs[${idx}]`, "Expected object");
            return;
        }

        const valid =
            validateString(item.title, `dailyBriefs[${idx}].title`, errors) &&
            validateString(item.slug_hint, `dailyBriefs[${idx}].slug_hint`, errors) &&
            validateString(item.date, `dailyBriefs[${idx}].date`, errors) &&
            validateString(item.summary, `dailyBriefs[${idx}].summary`, errors) &&
            validateString(item.content, `dailyBriefs[${idx}].content`, errors) &&
            validateStringArray(item.tags, `dailyBriefs[${idx}].tags`, errors) &&
            validateBoolean(item.isPublished, `dailyBriefs[${idx}].isPublished`, errors);

        if (!valid) return;

        normalized.dailyBriefs.push({
            title: item.title,
            slug: item.slug_hint,
            published_at_utc: item.date,
            summary: item.summary,
            content: item.content,
            tags: item.tags,
            is_published: item.isPublished,
        });
    });

    // FACT CHECKS
    factChecks.forEach((item: unknown, idx: number) => {
        if (!isObject(item)) {
            addError(errors, `factChecks[${idx}]`, "Expected object");
            return;
        }

        const verdictValid =
            validateString(item.verdict, `factChecks[${idx}].verdict`, errors) &&
            verdictSet.has(item.verdict);
        if (!verdictValid) {
            if (typeof item.verdict === "string") {
                addError(
                    errors,
                    `factChecks[${idx}].verdict`,
                    "Invalid verdict; must be one of true, false, misleading, unverified"
                );
            }
        }

        const valid =
            validateString(item.claim, `factChecks[${idx}].claim`, errors) &&
            validateString(item.claimBy, `factChecks[${idx}].claimBy`, errors) &&
            validateString(item.analysis, `factChecks[${idx}].analysis`, errors) &&
            validateStringArray(item.sources, `factChecks[${idx}].sources`, errors) &&
            validateString(item.date, `factChecks[${idx}].date`, errors) &&
            verdictValid;

        if (!valid) return;

        normalized.factChecks.push({
            claim: item.claim,
            slug: slugify(item.claim, 60),
            claim_by: item.claimBy,
            verdict: item.verdict as NormalizedData["factChecks"][number]["verdict"],
            analysis: item.analysis,
            sources: item.sources,
            published_at_utc: item.date,
        });
    });

    // ARTICLES (ElectionArticle collection)
    articles.forEach((item: unknown, idx: number) => {
        if (!isObject(item)) {
            addError(errors, `articles[${idx}]`, "Expected object");
            return;
        }

        const valid =
            validateString(item.editor, `articles[${idx}].editor`, errors) &&
            validateString(item.title_en, `articles[${idx}].title_en`, errors) &&
            validateString(item.excerpt_en, `articles[${idx}].excerpt_en`, errors) &&
            validateString(item.content_en, `articles[${idx}].content_en`, errors) &&
            validateString(item.slug_hint, `articles[${idx}].slug_hint`, errors) &&
            validateStringArray(item.tags, `articles[${idx}].tags`, errors) &&
            validateString(item.status, `articles[${idx}].status`, errors);

        if (!valid) return;

        normalized.articles.push({
            editor: item.editor,
            title_en: item.title_en,
            excerpt_en: item.excerpt_en,
            content_en: item.content_en,
            slug: item.slug_hint,
            tags: item.tags,
            status: item.status,
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

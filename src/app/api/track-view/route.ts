import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import Leader from "@/models/Leader";
import History from "@/models/History";
import { DailyBrief, ElectionArticle, FactCheck } from "@/models/ElectionContent";
import ViewEvent from "@/models/ViewEvent";

type ContentType =
    | "article"
    | "leader"
    | "history"
    | "daily-brief"
    | "fact-check"
    | "election-article";

type TrackPayload = {
    visitorId?: string;
    path?: string;
    pageType?: string;
    contentType?: ContentType;
    contentSlug?: string;
};

const BOT_USER_AGENT_PATTERN = /(bot|spider|crawler|preview|facebookexternalhit|slurp|bingpreview|headless|phantom|lighthouse)/i;

const normalizeSlug = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const getHeader = (request: NextRequest, key: string): string =>
    (request.headers.get(key) || "").trim();

const shouldIgnorePath = (path: string): boolean => {
    if (!path.startsWith("/")) return true;
    if (path.startsWith("/admin")) return true;
    if (path.startsWith("/api")) return true;
    if (path.startsWith("/_next")) return true;
    return false;
};

const resolveVisitorId = (request: NextRequest, visitorId?: string): string => {
    const provided = (visitorId || "").trim().slice(0, 120);
    if (provided) return provided;
    const ip = getHeader(request, "x-forwarded-for").split(",")[0].trim();
    const ua = getHeader(request, "user-agent");
    const fallback = `${ip}|${ua}` || "anonymous";
    return createHash("sha1").update(fallback).digest("hex").slice(0, 40);
};

async function incrementContentView(contentType: ContentType, contentSlug: string) {
    const slug = normalizeSlug(contentSlug);
    if (!slug) return;

    switch (contentType) {
        case "article":
            await Article.updateOne({ slug, status: "published" }, { $inc: { views: 1 } });
            return;
        case "leader":
            await Leader.updateOne({ slug, status: "published" }, { $inc: { views: 1 } });
            return;
        case "history":
            await History.updateOne({ slug, status: "published" }, { $inc: { views: 1 } });
            return;
        case "daily-brief":
            await DailyBrief.updateOne({ slug, status: "published" }, { $inc: { views: 1 } });
            return;
        case "election-article":
            await ElectionArticle.updateOne({ slug, status: "published" }, { $inc: { views: 1 } });
            return;
        case "fact-check":
            await FactCheck.updateOne(
                {
                    $or: [
                        { slug },
                        { slug: { $regex: `^${slug}$`, $options: "i" } },
                    ],
                    status: "published",
                },
                { $inc: { views: 1 } }
            );
            return;
        default:
            return;
    }
}

export async function POST(request: NextRequest) {
    try {
        const userAgent = getHeader(request, "user-agent");
        if (BOT_USER_AGENT_PATTERN.test(userAgent)) {
            return NextResponse.json({ success: true, ignored: "bot" });
        }
        if (getHeader(request, "purpose") === "prefetch" || getHeader(request, "x-middleware-prefetch") === "1") {
            return NextResponse.json({ success: true, ignored: "prefetch" });
        }

        const body = (await request.json()) as TrackPayload;

        if (!body?.path || !body?.pageType) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const visitorId = resolveVisitorId(request, body.visitorId);
        const path = String(body.path).trim().slice(0, 240);
        const pageType = String(body.pageType).trim().slice(0, 80);
        const contentType = body.contentType;
        const contentSlug = body.contentSlug ? String(body.contentSlug).trim().slice(0, 160) : undefined;

        if (!visitorId || !path || !pageType) {
            return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
        }
        if (shouldIgnorePath(path)) {
            return NextResponse.json({ success: true, ignored: "path" });
        }

        await dbConnect();

        const now = new Date();
        const dateKey = now.toISOString().slice(0, 10);
        const country = (getHeader(request, "x-vercel-ip-country") || getHeader(request, "cf-ipcountry")).slice(0, 80) || undefined;
        const region = (getHeader(request, "x-vercel-ip-country-region") || getHeader(request, "x-region")).slice(0, 120) || undefined;
        const city = getHeader(request, "x-vercel-ip-city").slice(0, 120) || undefined;
        const target = contentSlug && contentType ? `${contentType}:${normalizeSlug(contentSlug)}` : path;
        const trackingKey = `${dateKey}:${visitorId}:${target}`;

        await ViewEvent.updateOne(
            { trackingKey },
            {
                $setOnInsert: {
                    visitorId,
                    path,
                    pageType,
                    contentType: contentType || undefined,
                    contentSlug: contentSlug ? normalizeSlug(contentSlug) : undefined,
                    dateKey,
                    trackingKey,
                    country,
                    region,
                    city,
                    firstSeenAt: now,
                },
                $set: { lastSeenAt: now, country, region, city },
                $inc: { hits: 1 },
            },
            { upsert: true }
        );

        if (contentType && contentSlug) {
            await incrementContentView(contentType, contentSlug);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Track view error:", error);
        // Analytics tracking is best-effort. Do not fail requests when the DB is unavailable.
        return NextResponse.json({ success: true, ignored: "tracking-unavailable" });
    }
}

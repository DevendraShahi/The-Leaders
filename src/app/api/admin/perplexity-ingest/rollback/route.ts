import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { withAuth } from "@/lib/middleware";
import ActivityLog from "@/models/ActivityLog";
import PerplexityIngestSnapshot from "@/models/PerplexityIngestSnapshot";
import { DailyBrief, FactCheck, ElectionArticle } from "@/models/ElectionContent";

function stripId(doc: Record<string, any>) {
    const { _id, __v, createdAt, updatedAt, ...rest } = doc;
    return rest;
}

async function rollbackIngest(request: NextRequest, { user }: { user: any }) {
    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const snapshotId = body?.snapshotId;
    if (!snapshotId || typeof snapshotId !== "string") {
        return NextResponse.json({ success: false, error: "snapshotId is required" }, { status: 400 });
    }

    await dbConnect();

    const snapshot = await PerplexityIngestSnapshot.findById(snapshotId).lean();
    if (!snapshot) {
        return NextResponse.json({ success: false, error: "Snapshot not found" }, { status: 404 });
    }

    const beforeBriefMap = new Map(
        (snapshot.before.dailyBriefs || []).map((doc: any) => [doc.slug, doc])
    );
    const beforeFactMap = new Map(
        (snapshot.before.factChecks || []).map((doc: any) => [doc.slug, doc])
    );
    const beforeArticleMap = new Map(
        (snapshot.before.articles || []).map((doc: any) => [doc.slug, doc])
    );

    for (const slug of snapshot.affected.dailyBriefSlugs || []) {
        const before = beforeBriefMap.get(slug);
        if (before) {
            await DailyBrief.updateOne({ slug }, { $set: stripId(before) }, { upsert: true });
        } else {
            await DailyBrief.deleteOne({ slug });
        }
    }

    for (const slug of snapshot.affected.factCheckSlugs || []) {
        const before = beforeFactMap.get(slug);
        if (before) {
            await FactCheck.updateOne({ slug }, { $set: stripId(before) }, { upsert: true });
        } else {
            await FactCheck.deleteOne({ slug });
        }
    }

    for (const slug of snapshot.affected.articleSlugs || []) {
        const before = beforeArticleMap.get(slug);
        if (before) {
            await ElectionArticle.updateOne({ slug }, { $set: stripId(before) }, { upsert: true });
        } else {
            await ElectionArticle.deleteOne({ slug });
        }
    }

    await ActivityLog.create({
        adminId: user.userId,
        action: "bulk_action",
        entityType: "ElectionContent",
        description: "Rolled back Perplexity ingest snapshot",
        metadata: {
            snapshotId,
            counts: {
                dailyBriefs: (snapshot.affected.dailyBriefSlugs || []).length,
                factChecks: (snapshot.affected.factCheckSlugs || []).length,
                articles: (snapshot.affected.articleSlugs || []).length,
            },
        },
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
        success: true,
        data: {
            snapshotId,
            restored: {
                dailyBriefs: (snapshot.affected.dailyBriefSlugs || []).length,
                factChecks: (snapshot.affected.factCheckSlugs || []).length,
                articles: (snapshot.affected.articleSlugs || []).length,
            },
        },
    });
}

export const POST = withAuth(rollbackIngest);

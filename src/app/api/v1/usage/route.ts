import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db";
import MobileMetric from "@/models/MobileMetric";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
const eventSchema = z.object({ event: z.enum(["session_start", "return_visit", "article_open", "article_complete", "save_success", "request_failure", "render_failure"]), language: z.enum(["en", "ne"]) }).strict();
const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Cache-Control": "no-store" };
export function OPTIONS() { return new NextResponse(null, { status: 204, headers }); }
export async function POST(request: Request) {
    const limit = enforceRateLimit(`mobile-usage:${getClientIp(request)}`, 60, 60000);
    if (limit.limited) return NextResponse.json({ success: false }, { status: 429, headers });
    if (Number(request.headers.get("content-length") || 0) > 512) return NextResponse.json({ success: false }, { status: 413, headers });
    try {
        const body = await request.text();
        if (body.length > 512) return NextResponse.json({ success: false }, { status: 413, headers });
        let json: unknown;
        try { json = JSON.parse(body); } catch { return NextResponse.json({ success: false }, { status: 400, headers }); }
        const parsed = eventSchema.safeParse(json);
        if (!parsed.success) return NextResponse.json({ success: false }, { status: 400, headers });
        await dbConnect();
        const now = new Date();
        await MobileMetric.updateOne({ day: now.toISOString().slice(0, 10), ...parsed.data }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now.getTime() + 180 * 86400000) } }, { upsert: true });
        return NextResponse.json({ success: true }, { headers });
    } catch { return NextResponse.json({ success: false }, { status: 503, headers }); }
}

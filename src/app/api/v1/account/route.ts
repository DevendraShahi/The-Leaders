import { NextRequest, NextResponse } from "next/server";
import { getMobileAdmin } from "@/lib/mobile-auth";

// Credentialed web access is limited to the configured mobile web origin.
function responseHeaders(request: NextRequest) {
    const origin = request.headers.get("origin");
    const headers: Record<string, string> = { "Cache-Control": "private, no-store", Vary: "Origin, Cookie, Authorization" };
    const allowed = process.env.MOBILE_WEB_ORIGIN;
    const local = process.env.NODE_ENV !== "production" && (origin === "http://localhost:8081" || origin === "http://127.0.0.1:8081");
    if (origin && (origin === allowed || local)) {
        headers["Access-Control-Allow-Origin"] = origin;
        headers["Access-Control-Allow-Credentials"] = "true";
        headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type";
        headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
    }
    return headers;
}

export async function GET(request: NextRequest) {
    const headers = responseHeaders(request);
    try {
        const admin = await getMobileAdmin(request);
        return NextResponse.json({ isAdmin: Boolean(admin), studioScope: Boolean(admin) ? String(admin!._id) : null, profile: Boolean(admin) ? { name: admin!.name, role: admin!.role } : null }, { headers });
    } catch {
        return NextResponse.json({ isAdmin: false, studioScope: null }, { status: 503, headers });
    }
}

export function OPTIONS(request: NextRequest) {
    return new NextResponse(null, { status: 204, headers: responseHeaders(request) });
}

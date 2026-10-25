import { NextResponse } from "next/server";

/** Retired: old dashboards must not trigger collection-wide counts or activity queries. */
export function GET() {
    return NextResponse.json({ error: "Dashboard statistics have been removed." }, {
        status: 410,
        headers: { "Cache-Control": "private, no-store" },
    });
}

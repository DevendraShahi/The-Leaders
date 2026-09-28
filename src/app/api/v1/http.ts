import { NextResponse } from "next/server";
import type { ZodType } from "zod";

const headers = {
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    "Access-Control-Allow-Origin": "*",
};

export function apiOk<T>(schema: ZodType<T>, data: T, status = 200) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
        console.error("Public API response failed validation", parsed.error.flatten());
        return NextResponse.json(
            { success: false, error: "Response validation failed" },
            { status: 500, headers }
        );
    }

    return NextResponse.json({ success: true, data: parsed.data }, { status, headers });
}

export function apiFail(error: string, status = 500) {
    return NextResponse.json({ success: false, error }, { status, headers });
}

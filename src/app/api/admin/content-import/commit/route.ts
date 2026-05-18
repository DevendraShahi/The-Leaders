import { NextRequest } from "next/server";
import { commitContentImport } from "@/lib/content-import";
import { apiError, apiResponse, withAuth } from "@/lib/middleware";

async function commitImport(request: NextRequest, { user }: { user: any }) {
    try {
        const body = await request.json();
        const payload = body?.payload ?? body;
        const result = await commitContentImport(payload, user, {
            ipAddress: request.headers.get("x-forwarded-for") || "unknown",
            userAgent: request.headers.get("user-agent") || "unknown",
        });
        const { normalized, ...response } = result;

        if (!response.ok) {
            return apiResponse(response, 422);
        }

        return apiResponse(response);
    } catch (error) {
        console.error("Content import commit error:", error);
        return apiError("Failed to commit content import", 500);
    }
}

export const POST = withAuth(commitImport);

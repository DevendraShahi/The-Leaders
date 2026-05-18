import { NextRequest } from "next/server";
import { validateContentImport } from "@/lib/content-import";
import { apiError, apiResponse, withAuth } from "@/lib/middleware";

async function validateImport(request: NextRequest) {
    try {
        const body = await request.json();
        const payload = body?.payload ?? body;
        const validation = await validateContentImport(payload);
        const { normalized, ...response } = validation;

        return apiResponse(response, response.ok ? 200 : 422);
    } catch (error) {
        console.error("Content import validation error:", error);
        return apiError("Failed to validate content import", 500);
    }
}

export const POST = withAuth(validateImport);

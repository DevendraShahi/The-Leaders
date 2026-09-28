import { apiFail, apiOk } from "@/app/api/v1/http";
import { getPublicFactCheck } from "@/lib/public-read/loaders";
import { factCheckDetailSchema } from "@/lib/public-read/schemas";

export const revalidate = 300;

export async function GET(
    _request: Request,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;
        const factCheck = await getPublicFactCheck(decodeURIComponent(slug));
        if (!factCheck) return apiFail("Fact check not found", 404);
        return apiOk(factCheckDetailSchema, factCheck);
    } catch (error) {
        console.error("GET /api/v1/fact-checks/[slug]", error);
        return apiFail("Failed to load fact check");
    }
}

import { apiFail, apiOk } from "@/app/api/v1/http";
import { getPublicBrief } from "@/lib/public-read/loaders";
import { briefDetailSchema } from "@/lib/public-read/schemas";

export const revalidate = 3600;
export async function generateStaticParams() { return []; }

export async function GET(
    _request: Request,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;
        const brief = await getPublicBrief(decodeURIComponent(slug));
        if (!brief) return apiFail("Brief not found", 404);
        return apiOk(briefDetailSchema, brief);
    } catch (error) {
        console.error("GET /api/v1/briefs/[slug]", error);
        return apiFail("Failed to load brief");
    }
}

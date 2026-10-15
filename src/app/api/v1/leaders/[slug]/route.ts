import { apiFail, apiOk } from "@/app/api/v1/http";
import { getPublicLeader } from "@/lib/public-read/loaders";
import { leaderDetailSchema } from "@/lib/public-read/schemas";

export const revalidate = 3600;
export async function generateStaticParams() { return []; }

export async function GET(
    _request: Request,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;
        const leader = await getPublicLeader(decodeURIComponent(slug));
        if (!leader) return apiFail("Leader not found", 404);
        return apiOk(leaderDetailSchema, leader);
    } catch (error) {
        console.error("GET /api/v1/leaders/[slug]", error);
        return apiFail("Failed to load leader");
    }
}

import { apiFail, apiOk } from "@/app/api/v1/http";
import { getPublicCandidate } from "@/lib/public-read/loaders";
import { candidateCardSchema } from "@/lib/public-read/schemas";
import { z } from "zod";

export const revalidate = 300;

const candidateDetailSchema = candidateCardSchema.extend({
    qualification: z.string(),
    experience: z.string(),
});

export async function GET(
    _request: Request,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;
        const candidate = await getPublicCandidate(decodeURIComponent(slug));
        if (!candidate) return apiFail("Candidate not found", 404);
        return apiOk(candidateDetailSchema, candidate);
    } catch (error) {
        console.error("GET /api/v1/candidates/[slug]", error);
        return apiFail("Failed to load candidate");
    }
}

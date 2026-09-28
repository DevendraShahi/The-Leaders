import { apiFail, apiOk } from "@/app/api/v1/http";
import { getCandidatePage } from "@/lib/public-read/loaders";
import { candidateCardSchema, pageSchema } from "@/lib/public-read/schemas";
import { readPageParams } from "@/lib/public-read/shape";
import { z } from "zod";

export const revalidate = 300;

const candidatePageSchema = pageSchema(candidateCardSchema).extend({
    parties: z.array(z.string()),
    districts: z.array(z.string()),
});

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const { page, limit } = readPageParams(url.searchParams);
        const data = await getCandidatePage({
            page,
            limit,
            query: url.searchParams.get("q") || "",
            party: url.searchParams.get("party") || "",
            district: url.searchParams.get("district") || "",
        });
        return apiOk(candidatePageSchema, data);
    } catch (error) {
        console.error("GET /api/v1/candidates", error);
        return apiFail("Failed to load candidates");
    }
}

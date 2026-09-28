import { apiFail, apiOk } from "@/app/api/v1/http";
import { searchPublic } from "@/lib/public-read/loaders";
import {
    articleCardSchema,
    briefCardSchema,
    factCheckCardSchema,
    historyEpisodeSchema,
    leaderCardSchema,
} from "@/lib/public-read/schemas";
import { z } from "zod";

export const revalidate = 60;

const searchSchema = z.object({
    articles: z.array(articleCardSchema),
    leaders: z.array(leaderCardSchema),
    briefs: z.array(briefCardSchema),
    factChecks: z.array(factCheckCardSchema),
    episodes: z.array(historyEpisodeSchema),
});

export async function GET(request: Request) {
    try {
        const query = new URL(request.url).searchParams.get("q") || "";
        return apiOk(searchSchema, await searchPublic(query));
    } catch (error) {
        console.error("GET /api/v1/search", error);
        return apiFail("Failed to search");
    }
}

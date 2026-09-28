import { apiFail, apiOk } from "@/app/api/v1/http";
import { getHistoryItem } from "@/lib/public-read/loaders";
import { bilingualSchema, historyEpisodeSchema } from "@/lib/public-read/schemas";

export const revalidate = 300;

const episodeDetailSchema = historyEpisodeSchema.extend({
    eraTitle: bilingualSchema,
    period: bilingualSchema,
});

export async function GET(
    _request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const episode = await getHistoryItem(decodeURIComponent(id));
        if (!episode) return apiFail("Episode not found", 404);
        return apiOk(episodeDetailSchema, episode);
    } catch (error) {
        console.error("GET /api/v1/history/[id]", error);
        return apiFail("Failed to load episode");
    }
}

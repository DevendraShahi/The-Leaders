import { apiFail, apiOk } from "@/app/api/v1/http";
import { getLeaderPage } from "@/lib/public-read/loaders";
import { leaderCardSchema, pageSchema } from "@/lib/public-read/schemas";
import { readPageParams } from "@/lib/public-read/shape";

export const revalidate = 300;

export async function GET(request: Request) {
    try {
        const { page, limit } = readPageParams(new URL(request.url).searchParams);
        return apiOk(pageSchema(leaderCardSchema), await getLeaderPage(page, limit));
    } catch (error) {
        console.error("GET /api/v1/leaders", error);
        return apiFail("Failed to load leaders");
    }
}

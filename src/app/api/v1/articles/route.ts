import { apiFail, apiOk } from "@/app/api/v1/http";
import { getArticlePage } from "@/lib/public-read/loaders";
import { articleCardSchema, pageSchema } from "@/lib/public-read/schemas";
import { readPageParams } from "@/lib/public-read/shape";

export const revalidate = 300;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const { page, limit } = readPageParams(url.searchParams);
        const category = url.searchParams.get("category")?.trim() || "";
        return apiOk(pageSchema(articleCardSchema), await getArticlePage(page, limit, category));
    } catch (error) {
        console.error("GET /api/v1/articles", error);
        return apiFail("Failed to load articles");
    }
}

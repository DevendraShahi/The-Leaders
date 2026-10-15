import { unstable_rethrow } from "next/navigation";
import { apiFail, apiOk } from "@/app/api/v1/http";
import { getArticlePage } from "@/lib/public-read/loaders";
import { articleCardSchema, pageSchema } from "@/lib/public-read/schemas";
import { readPageParams } from "@/lib/public-read/shape";

export const revalidate = 3600;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const { page, limit } = readPageParams(url.searchParams);
        const author = url.searchParams.get("author")?.trim() || "";
        const category = url.searchParams.get("category")?.trim() || "";
        return apiOk(pageSchema(articleCardSchema), await getArticlePage(page, limit, category, author));
    } catch (error) {
        unstable_rethrow(error);
        console.error("GET /api/v1/articles", error);
        return apiFail("Failed to load articles");
    }
}

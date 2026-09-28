import { apiFail, apiOk } from "@/app/api/v1/http";
import { getPublicArticle } from "@/lib/public-read/loaders";
import { articleDetailSchema } from "@/lib/public-read/schemas";

export const revalidate = 300;

export async function GET(
    _request: Request,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;
        const article = await getPublicArticle(decodeURIComponent(slug));
        if (!article) return apiFail("Article not found", 404);
        return apiOk(articleDetailSchema, article);
    } catch (error) {
        console.error("GET /api/v1/articles/[slug]", error);
        return apiFail("Failed to load article");
    }
}

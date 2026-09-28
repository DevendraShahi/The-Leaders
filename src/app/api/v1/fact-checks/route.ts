import { apiFail, apiOk } from "@/app/api/v1/http";
import { getFactCheckPage } from "@/lib/public-read/loaders";
import { factCheckCardSchema, pageSchema } from "@/lib/public-read/schemas";
import { readPageParams } from "@/lib/public-read/shape";

export const revalidate = 300;

export async function GET(request: Request) {
    try {
        const { page, limit } = readPageParams(new URL(request.url).searchParams);
        return apiOk(pageSchema(factCheckCardSchema), await getFactCheckPage(page, limit));
    } catch (error) {
        console.error("GET /api/v1/fact-checks", error);
        return apiFail("Failed to load fact checks");
    }
}

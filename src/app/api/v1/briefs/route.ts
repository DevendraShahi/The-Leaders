import { unstable_rethrow } from "next/navigation";
import { apiFail, apiOk } from "@/app/api/v1/http";
import { getBriefPage } from "@/lib/public-read/loaders";
import { briefCardSchema, pageSchema } from "@/lib/public-read/schemas";
import { readPageParams } from "@/lib/public-read/shape";

export const revalidate = 3600;

export async function GET(request: Request) {
    try {
        const { page, limit } = readPageParams(new URL(request.url).searchParams);
        return apiOk(pageSchema(briefCardSchema), await getBriefPage(page, limit));
    } catch (error) {
        unstable_rethrow(error);
        console.error("GET /api/v1/briefs", error);
        return apiFail("Failed to load briefs");
    }
}

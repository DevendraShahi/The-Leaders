import { apiFail, apiOk } from "@/app/api/v1/http";
import { getHistoryPayload } from "@/lib/public-read/loaders";
import { bilingualSchema, historyEraSchema } from "@/lib/public-read/schemas";
import { z } from "zod";

export const revalidate = 300;

const historySchema = z.object({
    eras: z.array(historyEraSchema),
    records: z.array(z.object({
        id: z.string(),
        title: bilingualSchema,
        content: bilingualSchema,
        date: z.string(),
        image: z.string(),
    })),
});

export async function GET() {
    try {
        return apiOk(historySchema, await getHistoryPayload());
    } catch (error) {
        console.error("GET /api/v1/history", error);
        return apiFail("Failed to load history");
    }
}

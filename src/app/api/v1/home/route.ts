import { apiFail, apiOk } from "@/app/api/v1/http";
import { getPublicHome } from "@/lib/public-read/loaders";
import {
    articleCardSchema,
    bilingualSchema,
    briefCardSchema,
    factCheckCardSchema,
} from "@/lib/public-read/schemas";
import { z } from "zod";

export const revalidate = 3600;

const homeSchema = z.object({
    countdown: z.object({
        electionDate: z.string(),
        label: bilingualSchema,
    }),
    leadBrief: briefCardSchema.nullable(),
    ticker: z.object({
        scope: z.enum(["today", "latest"]),
        items: z.array(z.object({
            slug: z.string(),
            title: bilingualSchema,
            date: z.string(),
        })),
    }),
    factChecks: z.array(factCheckCardSchema),
    articles: z.array(articleCardSchema),
    coverage: z.array(articleCardSchema),
});

export async function GET() {
    try {
        return apiOk(homeSchema, await getPublicHome());
    } catch (error) {
        console.error("GET /api/v1/home", error);
        return apiFail("Failed to load home");
    }
}

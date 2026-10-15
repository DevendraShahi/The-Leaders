import { z } from "zod";
import { apiFail, apiOk } from "@/app/api/v1/http";
import { getPublicAuthors } from "@/lib/public-read/loaders";
import { bilingualSchema } from "@/lib/public-read/schemas";
export const revalidate = 3600;
export async function GET(request: Request) {
    try { return apiOk(z.object({ items: z.array(bilingualSchema) }), { items: await getPublicAuthors(new URL(request.url).searchParams.get("q") || "") }); }
    catch { return apiFail("Failed to load authors"); }
}

import { apiFail, apiOk } from "@/app/api/v1/http";
import { getPublicManifestos } from "@/lib/public-read/loaders";
import { manifestoCardSchema } from "@/lib/public-read/schemas";
import { z } from "zod";

export const revalidate = 300;

export async function GET() {
    try {
        return apiOk(z.object({ items: z.array(manifestoCardSchema) }), {
            items: await getPublicManifestos(),
        });
    } catch (error) {
        console.error("GET /api/v1/manifestos", error);
        return apiFail("Failed to load manifestos");
    }
}

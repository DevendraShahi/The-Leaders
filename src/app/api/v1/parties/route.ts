import { apiFail, apiOk } from "@/app/api/v1/http";
import { getPublicParties } from "@/lib/public-read/loaders";
import { partyCardSchema } from "@/lib/public-read/schemas";
import { z } from "zod";

export const revalidate = 300;

export async function GET() {
    try {
        return apiOk(z.object({ items: z.array(partyCardSchema) }), {
            items: getPublicParties(),
        });
    } catch (error) {
        console.error("GET /api/v1/parties", error);
        return apiFail("Failed to load parties");
    }
}

import { apiFail, apiOk } from "@/app/api/v1/http";
import { getPublicSnapshot } from "@/lib/public-read/loaders";
import { snapshotSchema } from "@/lib/public-read/schemas";

export const revalidate = 300;

export async function GET() {
    try {
        return apiOk(snapshotSchema, getPublicSnapshot());
    } catch (error) {
        console.error("GET /api/v1/snapshot", error);
        return apiFail("Failed to load snapshot");
    }
}

import { getLeaders } from "@/lib/leaders-db";
import { LeadersGridClient } from "./LeadersGridClient";

export async function LeadersGrid() {
    // Fetch leaders from DB
    const allLeaders = await getLeaders();
    // Take top 3 for homepage display
    const leaders = allLeaders.slice(0, 3);

    return <LeadersGridClient leaders={leaders} />;
}

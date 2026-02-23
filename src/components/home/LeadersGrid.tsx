import { getLeaders } from "@/lib/leaders-db";
import { LeadersGridClient } from "./LeadersGridClient";

export async function LeadersGrid() {
    const allLeaders = await getLeaders();
    const leaders = allLeaders.slice(0, 3);

    return <LeadersGridClient leaders={leaders} />;
}

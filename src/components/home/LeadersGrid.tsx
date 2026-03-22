import { getLeaders } from "@/lib/leaders-db";
import { LeadersGridClient } from "./LeadersGridClient";

export async function LeadersGrid() {
    const leaders = await getLeaders();

    return <LeadersGridClient leaders={leaders} />;
}

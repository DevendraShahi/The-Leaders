import { getLeaders } from "@/lib/leaders-db";
import LeadersList from "@/components/leaders/LeadersList";

export const dynamic = 'force-dynamic';

export default async function LeadersPage() {
    const leaders = await getLeaders();
    return <LeadersList leaders={leaders} />;
}


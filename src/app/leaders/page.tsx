import { getLeaders } from "@/lib/leaders-db";
import LeadersList from "@/components/leaders/LeadersList";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Leaders",
    description: "Profiles of influential political leaders in Nepal.",
};

export const dynamic = 'force-dynamic';

export default async function LeadersPage() {
    const leaders = await getLeaders();
    return <LeadersList leaders={leaders} />;
}


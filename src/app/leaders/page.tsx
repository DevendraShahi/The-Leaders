import { getLeaders } from "@/lib/leaders-db";
import LeadersList from "@/components/leaders/LeadersList";
import { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "Leaders",
    description: "Explore profiles of influential political leaders in Nepal, with timelines, party context, and legacy.",
    canonical: "/leaders",
    keywords: ["Nepal leaders", "political leader profiles Nepal", "Nepal political history leaders"],
});

export const revalidate = 3600;

export default async function LeadersPage() {
    const leaders = await getLeaders();
    return <LeadersList leaders={leaders} />;
}

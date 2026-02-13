import { getDailyBriefs, getFactChecks, getElectionArticles } from "@/lib/election-data";
import dynamic from "next/dynamic";

const AnalyticsDashboard = dynamic(() => import("./components/AnalyticsDashboard"), {
    loading: () => <div className="min-h-screen flex items-center justify-center">Loading Election Data...</div>,
});
import { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "Nepal Election 2026",
    description: "Track Nepal's 2026 election results, analyze political trends, view district-wise data, and stay updated with real-time election analytics and insights.",
    canonical: "/election-2026",
    keywords: [
        "Nepal election 2026",
        "election dashboard Nepal",
        "Nepal political analysis",
        "Nepal fact check",
    ],
});

export const revalidate = 3600;

export default async function ElectionDashboard() {
    const briefs = await getDailyBriefs();
    const factChecks = await getFactChecks();
    const electionArticles = await getElectionArticles(3);
    const latestBrief = briefs[0];
    const latestFactCheck = factChecks[0];

    return (
        <AnalyticsDashboard
            latestBrief={latestBrief}
            latestFactCheck={latestFactCheck}
            electionArticles={electionArticles}
        />
    );
}

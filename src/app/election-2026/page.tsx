import dynamic from "next/dynamic";
import { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getDailyBriefs, getFactChecks, getElectionArticles } from "@/lib/election-data";
import { getPRData } from "@/lib/pr-candidate-data";
import { getFPTPCandidateDataset } from "@/lib/fptp-candidate-data";
import { buildCandidateDataSummary } from "@/lib/candidate-data-summary";

const AnalyticsDashboard = dynamic(() => import("./components/AnalyticsDashboard"), {
    loading: () => <div className="min-h-screen flex items-center justify-center">Loading Election Data...</div>,
});

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
    const [briefs, factChecks, electionArticles, prData, fptpDataset] = await Promise.all([
        getDailyBriefs(),
        getFactChecks(),
        getElectionArticles(3),
        getPRData(),
        getFPTPCandidateDataset(),
    ]);

    const latestBrief = briefs[0];
    const latestFactCheck = factChecks[0];
    const candidateSummary = buildCandidateDataSummary(prData, fptpDataset);

    return (
        <AnalyticsDashboard
            latestBrief={latestBrief}
            latestFactCheck={latestFactCheck}
            electionArticles={electionArticles}
            candidateSummary={candidateSummary}
        />
    );
}

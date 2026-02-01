import { getDailyBriefs, getFactChecks } from "@/lib/election-data";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Nepal Election 2026",
    description: "Track Nepal's 2026 election results, analyze political trends, view district-wise data, and stay updated with real-time election analytics and insights.",
};

export default async function ElectionDashboard() {
    const briefs = await getDailyBriefs();
    const factChecks = await getFactChecks();
    const latestBrief = briefs[0];
    const latestFactCheck = factChecks[0];

    return (
        <AnalyticsDashboard
            latestBrief={latestBrief}
            latestFactCheck={latestFactCheck}
        />
    );
}

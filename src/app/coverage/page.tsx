import dynamic from "next/dynamic";
import { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getDailyBriefs, getColumnArticles } from "@/lib/election-data";

const CoverageDashboard = dynamic(() => import("./components/CoverageDashboard"), {
    loading: () => (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Loading Coverage...</span>
            </div>
        </div>
    ),
});

export const metadata: Metadata = constructMetadata({
    title: "Coverage",
    description: "Stay updated with daily briefs, op-eds, columns, and analytical coverage of Nepal's political landscape.",
    canonical: "/coverage",
    keywords: [
        "Coverage Nepal",
        "political news Nepal",
        "daily briefs Nepal",
        "election columns",
        "Nepal media",
    ],
});

export const revalidate = 300;

export default async function CoveragePage() {
    const [briefs, columnArticles] = await Promise.all([
        getDailyBriefs(),
        getColumnArticles(12),
    ]);

    return (
        <CoverageDashboard
            latestBrief={briefs[0]}
            columnArticles={columnArticles}
            allBriefs={briefs}
        />
    );
}

import { getElectionArticles } from "@/lib/election-data";
import { Metadata } from "next";
import { AnalysesClient } from "./AnalysesClient";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "Election Analyses - Nepal Election 2026",
    description: "Deep election analyses on Nepal 2026: power shifts, narratives, regional momentum, and verified political context.",
    canonical: "/election-2026/analyses",
    keywords: [
        "Nepal election analysis",
        "election 2026 analyses",
        "leadersnp analysis",
        "The Leaders election coverage",
    ],
});

// export const revalidate = false; // Page caches indefinitely until on-demand revalidation

export default async function ElectionAnalysesPage() {
    // Fetch a generous number of articles; these are editor-curated
    const articles = await getElectionArticles(50);

    return <AnalysesClient articles={articles} />;
}

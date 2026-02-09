import { getElectionArticles } from "@/lib/election-data";
import { Metadata } from "next";
import { AnalysesClient } from "./AnalysesClient";

export const metadata: Metadata = {
    title: "Election Analyses – Nepal Election 2026 | The Leaders",
    description:
        "Deeper dives into the political dynamics, narratives, and numbers behind Nepal's 2026 election.",
};

export const revalidate = 600;

export default async function ElectionAnalysesPage() {
    // Fetch a generous number of articles; these are editor-curated
    const articles = await getElectionArticles(50);

    return <AnalysesClient articles={articles} />;
}

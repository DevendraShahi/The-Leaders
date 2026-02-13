import { getPRData } from "@/lib/pr-candidate-data";
import { PRCandidatesClient } from "./PRCandidatesClient";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "PR Candidates",
    description: "Explore proportional representation (PR) candidates and party-aligned candidate data for Nepal Election 2026.",
    canonical: "/election-2026/pr-candidates",
    keywords: ["PR candidates Nepal", "proportional representation Nepal", "election 2026 candidates"],
});

export default async function PRCandidatesPage() {
    const prData = await getPRData();

    return <PRCandidatesClient prData={prData} />;
}

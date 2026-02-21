import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getPRData } from "@/lib/pr-candidate-data";
import { getFPTPCandidateDataset } from "@/lib/fptp-candidate-data";
import { buildCandidateDataSummary } from "@/lib/candidate-data-summary";
import { getParties } from "@/lib/election-data";
import { buildFPTPPartyRankIndex, buildPartyRankIndexForNames } from "@/lib/fptp-party-ranking";
import { ProfilesClient } from "./ProfilesClient";

export const metadata: Metadata = constructMetadata({
    title: "Election Candidates",
    description:
        "Explore PR and FPTP candidate datasets for Nepal Election 2026 with advanced filters, search, and district-level context.",
    canonical: "/election-2026/profiles",
    keywords: [
        "Nepal election candidates",
        "FPTP candidates Nepal",
        "PR candidates Nepal",
        "election 2026 candidate explorer",
    ],
});

export default async function ElectionProfiles() {
    const [prData, fptpDataset, parties] = await Promise.all([
        getPRData(),
        getFPTPCandidateDataset(),
        getParties(),
    ]);

    const summary = buildCandidateDataSummary(prData, fptpDataset);
    const fptpPartyRankIndex = buildFPTPPartyRankIndex(fptpDataset, parties);
    const prPartyRankIndex = buildPartyRankIndexForNames(
        prData.map((party) => party.party_name),
        parties
    );

    return (
        <ProfilesClient
            prData={prData}
            fptpDataset={fptpDataset}
            summary={summary}
            fptpPartyRankIndex={fptpPartyRankIndex}
            prPartyRankIndex={prPartyRankIndex}
        />
    );
}

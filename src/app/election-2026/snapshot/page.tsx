import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getPRData } from "@/lib/pr-candidate-data";
import { getFPTPCandidateDataset } from "@/lib/fptp-candidate-data";
import { buildCandidateDataSummary } from "@/lib/candidate-data-summary";
import { SnapshotFactsClient, type CandidateSnapshotMetrics } from "./SnapshotFactsClient";

export const metadata: Metadata = constructMetadata({
    title: "Official Candidate Snapshot",
    description:
        "Latest PR and FPTP candidate totals, geographic coverage, and gender composition for Nepal Election 2026.",
    canonical: "/election-2026/snapshot",
    keywords: [
        "Official candidate snapshot Nepal",
        "Nepal election candidate metrics",
        "PR and FPTP candidate overview",
    ],
});

const TOTAL_DISTRICTS = 77;
const TOTAL_FPTP_CONSTITUENCIES = 165;
const TOTAL_PROVINCES = 7;

const normalizePartyName = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

const toPercent = (value: number, total: number) =>
    total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0;

async function loadCandidateSnapshotMetrics(): Promise<CandidateSnapshotMetrics | null> {
    try {
        const [prData, fptpDataset] = await Promise.all([
            getPRData(),
            getFPTPCandidateDataset(),
        ]);

        const summary = buildCandidateDataSummary(prData, fptpDataset);

        const uniqueParties = new Set<string>();
        for (const party of prData) {
            const normalized = normalizePartyName(party.party_name);
            if (normalized) uniqueParties.add(normalized);
        }
        for (const candidate of fptpDataset.candidates) {
            const normalized = normalizePartyName(candidate.partyName);
            if (normalized) uniqueParties.add(normalized);
        }

        const genderStats = new Map(
            summary.genderBreakdown.map((entry) => [entry.gender, entry])
        );
        const female = genderStats.get("Female");
        const male = genderStats.get("Male");

        return {
            summary,
            uniquePartyCount: uniqueParties.size,
            fptpSharePercent: toPercent(summary.fptpCandidates, summary.totalCandidates),
            prSharePercent: toPercent(summary.prCandidates, summary.totalCandidates),
            districtCoveragePercent: toPercent(summary.fptpDistricts, TOTAL_DISTRICTS),
            constituencyCoveragePercent: toPercent(
                summary.fptpConstituencies,
                TOTAL_FPTP_CONSTITUENCIES
            ),
            provinceCoveragePercent: toPercent(summary.provinces, TOTAL_PROVINCES),
            avgFptpCandidatesPerConstituency:
                summary.fptpConstituencies > 0
                    ? Number(
                          (summary.fptpCandidates / summary.fptpConstituencies).toFixed(1)
                      )
                    : 0,
            femaleCount: female?.count ?? 0,
            femaleSharePercent: female?.percentage ?? 0,
            maleCount: male?.count ?? 0,
            maleSharePercent: male?.percentage ?? 0,
        };
    } catch (error) {
        console.error("Failed to build candidate snapshot metrics:", error);
        return null;
    }
}

export default async function ElectionSnapshotPage() {
    const metrics = await loadCandidateSnapshotMetrics();
    return <SnapshotFactsClient metrics={metrics} />;
}

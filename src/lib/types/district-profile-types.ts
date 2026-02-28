import type { DistrictElectionProfile } from "@/lib/district-election-data";

export type DistrictFieldSource = "wikidata" | "wikipedia" | "local";

export type DistrictMetricField =
    | "population2021"
    | "areaSqKm"
    | "populationDensity"
    | "literacyRatePercent"
    | "sexRatio"
    | "annualGrowthRatePercent";

export type DistrictSourceKey =
    | DistrictMetricField
    | "description"
    | "electionData"
    | "candidateData";

export type DistrictPanelCandidate = {
    candidateId: number | null;
    sourceSerialNo: number;
    candidateName: string;
    gender: string;
    partyName: string;
    symbolName: string;
    district: string;
    constituency: number | null;
    constituencyDisplay: string;
    totalVoteReceived: number | null;
    age: number | null;
    education: string | null;
    electionStatus: string | null;
    rank: number | null;
    imageUrl: string | null;
    profileSlug: string;
};

export type DistrictFieldProvenance = {
    source: DistrictFieldSource;
    label: string;
    url?: string;
    observedAt?: string | null;
    note?: string;
};

export type DistrictVerifiedProfile = DistrictElectionProfile & {
    fptpCandidates: DistrictPanelCandidate[];
    wikiSummary?: {
        title: string;
        pageUrl: string;
        observedAt?: string | null;
    };
    sources: Record<DistrictSourceKey, DistrictFieldProvenance>;
    verifiedAt: string;
    notes: string[];
};

export type DistrictProfileApiResponse = {
    success: boolean;
    data: DistrictVerifiedProfile | null;
    error?: string;
};

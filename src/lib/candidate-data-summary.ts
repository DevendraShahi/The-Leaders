import type { FPTPCandidateDataset } from "@/lib/fptp-candidate-data";
import type { PRPartyList } from "@/lib/pr-candidate-data";

export type CandidateGender = "Male" | "Female" | "Other" | "Unknown";

export interface CandidateGenderStat {
    gender: CandidateGender;
    count: number;
    percentage: number;
}

export interface CandidateDataSummary {
    totalCandidates: number;
    prCandidates: number;
    fptpCandidates: number;
    prParties: number;
    fptpParties: number;
    totalPartyEntries: number;
    fptpDistricts: number;
    fptpConstituencies: number;
    provinces: number;
    genderBreakdown: CandidateGenderStat[];
    lastSyncedAt: string | null;
}

const GENDER_ORDER: CandidateGender[] = ["Male", "Female", "Other", "Unknown"];

function normalizeGender(raw: string | null | undefined): CandidateGender {
    if (!raw) return "Unknown";

    const value = raw.trim().toLowerCase();

    if (value === "male" || value === "पुरुष") return "Male";
    if (value === "female" || value === "महिला") return "Female";
    if (value === "other" || value === "अन्य") return "Other";

    return "Unknown";
}

export function buildCandidateDataSummary(
    prData: PRPartyList[],
    fptpData: FPTPCandidateDataset
): CandidateDataSummary {
    const prCandidates = prData.reduce((sum, party) => sum + party.candidates.length, 0);
    const fptpCandidates = fptpData.candidates.length;
    const totalCandidates = prCandidates + fptpCandidates;

    const genderCounts: Record<CandidateGender, number> = {
        Male: 0,
        Female: 0,
        Other: 0,
        Unknown: 0,
    };

    for (const party of prData) {
        for (const candidate of party.candidates) {
            const gender = normalizeGender(candidate.gender);
            genderCounts[gender] += 1;
        }
    }

    for (const candidate of fptpData.candidates) {
        const gender = normalizeGender(candidate.gender);
        genderCounts[gender] += 1;
    }

    const genderBreakdown = GENDER_ORDER
        .map((gender) => {
            const count = genderCounts[gender];
            const percentage = totalCandidates > 0 ? Number(((count / totalCandidates) * 100).toFixed(2)) : 0;
            return {
                gender,
                count,
                percentage,
            };
        })
        .filter((entry) => entry.count > 0);

    const prParties = prData.length;
    const fptpParties = fptpData.stats.totalParties;

    return {
        totalCandidates,
        prCandidates,
        fptpCandidates,
        prParties,
        fptpParties,
        totalPartyEntries: prParties + fptpParties,
        fptpDistricts: fptpData.stats.totalDistricts,
        fptpConstituencies: fptpData.stats.totalConstituencies,
        provinces: fptpData.lookups.stateNames.length,
        genderBreakdown,
        lastSyncedAt: fptpData.metadata.fetchedAt || null,
    };
}

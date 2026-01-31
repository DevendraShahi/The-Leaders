import { promises as fs } from "fs";
import path from "path";

export interface PartyDTO {
    id?: number | string;
    name: string;
    slug?: string;
    logo?: string;
    symbol?: string; // From user updated JSON
    leader?: string;
    color?: string;
    foundedYear?: number;
    regDate?: string; // From user updated JSON
    manifestoSummary?: string;
}

export interface CandidateDTO {
    name: string;
    slug: string;
    party: string; // Slug or ID
    district: string;
    constituency?: string;
    bio: string;
    photo: string;
    incumbent?: boolean;
    status: "active" | "withdrawn" | "disqualified";
    votes?: number;
}

export interface DistrictDTO {
    name: string;
    totalVoters: number;
    province: string;
    status: "pending" | "voting" | "counting" | "declared";
    leadingParty?: string;
    winner?: string;
}

export interface DailyBriefDTO {
    title: string;
    slug: string;
    date: string;
    summary: string;
    content: string;
    tags: string[];
    isPublished: boolean;
}

export interface FactCheckDTO {
    claim: string;
    claimBy: string;
    verdict: "true" | "false" | "misleading" | "unverified";
    analysis: string;
    sources: string[];
    date: string;
}

export interface ElectionData {
    parties: PartyDTO[];
    districts: DistrictDTO[];
    candidates: CandidateDTO[];
    dailyBriefs: DailyBriefDTO[];
    factChecks: FactCheckDTO[];
}

export async function getElectionData(): Promise<ElectionData> {
    // Check if we are on the server
    if (typeof window !== "undefined") {
        throw new Error("getElectionData can only be called on the server");
    }

    const filePath = path.join(process.cwd(), "public/map/election_data_sample.json");
    try {
        const fileContents = await fs.readFile(filePath, "utf8");
        const data = JSON.parse(fileContents);
        return data as ElectionData;
    } catch (error) {
        console.error("Failed to read election data:", error);
        return {
            parties: [],
            districts: [],
            candidates: [],
            dailyBriefs: [],
            factChecks: [],
        };
    }
}

export async function getDailyBriefs() {
    const data = await getElectionData();
    return data.dailyBriefs || [];
}

export async function getFactChecks() {
    const data = await getElectionData();
    return data.factChecks || [];
}

export async function getParties() {
    const data = await getElectionData();
    return data.parties || [];
}

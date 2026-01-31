import { promises as fs } from 'fs';
import path from 'path';

export interface PRCandidate {
    sn: number;
    name: string;
    voter_id: string; // ID is string in JSON
    gender: string;
    group: string;
    district: string;
    backward_area?: boolean;
    disability?: boolean;
    party_name?: string; // Enriched field
}

export interface PRPartyList {
    party_name: string;
    submission_date: string;
    candidates: PRCandidate[];
}

export async function getPRData(): Promise<PRPartyList[]> {
    const filePath = path.join(process.cwd(), 'public/election/PR-2026-EN.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
}

export async function getAllCandidates(): Promise<PRCandidate[]> {
    const data = await getPRData();
    const allCandidates: PRCandidate[] = [];

    data.forEach(party => {
        party.candidates.forEach(candidate => {
            allCandidates.push({
                ...candidate,
                party_name: party.party_name
            });
        });
    });

    return allCandidates;
}

export async function getCandidatesByDistrict(district: string): Promise<PRCandidate[]> {
    const all = await getAllCandidates();
    return all.filter(c => c.district === district);
}

// Helper to get unique districts list if needed
export async function getUniqueDistricts(): Promise<string[]> {
    const all = await getAllCandidates();
    const districts = new Set(all.map(c => c.district));
    return Array.from(districts).sort();
}

// Helper to get unique parties list
export async function getUniqueParties(): Promise<string[]> {
    const data = await getPRData();
    return data.map(p => p.party_name).sort();
}

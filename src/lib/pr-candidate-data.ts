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
    party?: string; // Some source rows use this when party_name is null
    status?: string;
}

export interface PRPartyList {
    party_name: string;
    submission_date: string;
    candidates: PRCandidate[];
}

const DISTRICT_ALIAS_TO_MAP_ID: Record<string, string> = {
    Bardia: "Bardiya",
    Chitwan: "Chitawan",
    Kapilvastu: "Kapilbastu",
    "कपिलवस्तु": "Kapilbastu",
    Kavrepalanchok: "Kabhrepalanchok",
    Mahoittari: "Mahottari",
    Makwanpur: "Makawanpur",
    "Nawalparasi East": "Nawalparasi_E",
    "Nawalparasi West": "Nawalparasi_W",
    "Rukum East": "Rukum_E",
    "Rukum West": "Rukum_W",
    Tanahun: "Tanahu",
    Tehrathum: "Terhathum",
};

function normalizeText(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.toLowerCase() === "null") return null;
    return trimmed;
}

function normalizeGender(value: unknown): "Male" | "Female" | "Other" {
    const normalized = normalizeText(value);
    if (!normalized) return "Other";
    const lower = normalized.toLowerCase();
    if (lower === "male") return "Male";
    if (lower === "female") return "Female";
    return "Other";
}

function normalizeDistrict(value: unknown): string | null {
    const normalized = normalizeText(value);
    if (!normalized) return null;
    return DISTRICT_ALIAS_TO_MAP_ID[normalized] || normalized;
}

export async function getPRData(): Promise<PRPartyList[]> {
    const filePath = path.join(process.cwd(), 'public/election/PR-2026-EN.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(fileContents) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
        .map((entry, index) => {
            const rawParty = (entry ?? {}) as Record<string, unknown>;
            const rawCandidates = Array.isArray(rawParty.candidates) ? rawParty.candidates : [];

            const fallbackPartyFromCandidate = rawCandidates
                .map((candidate) => normalizeText((candidate as Record<string, unknown>)?.party))
                .find(Boolean);

            const partyName =
                normalizeText(rawParty.party_name) ||
                fallbackPartyFromCandidate ||
                `Unknown Party ${index + 1}`;

            const candidates = rawCandidates
                .map((candidate) => {
                    const raw = (candidate ?? {}) as Record<string, unknown>;

                    // Commission-marked removed placeholders are incomplete and should not render.
                    const status = normalizeText(raw.status);
                    if (status?.startsWith("removed_by_commission")) return null;

                    const name = normalizeText(raw.name);
                    const district = normalizeDistrict(raw.district);
                    const group = normalizeText(raw.group);
                    const voterId = normalizeText(raw.voter_id);

                    if (!name || !district || !group || !voterId) return null;

                    const serial = Number(raw.sn);
                    const sn = Number.isFinite(serial) && serial > 0 ? serial : 0;

                    return {
                        sn,
                        name,
                        voter_id: voterId,
                        gender: normalizeGender(raw.gender),
                        group,
                        district,
                        backward_area: Boolean(raw.backward_area),
                        disability: Boolean(raw.disability),
                        party: normalizeText(raw.party) || partyName,
                        party_name: partyName,
                        status: status || undefined,
                    } satisfies PRCandidate;
                })
                .filter((candidate): candidate is PRCandidate => candidate !== null);

            return {
                party_name: partyName,
                submission_date: normalizeText(rawParty.submission_date) || "",
                candidates,
            } satisfies PRPartyList;
        })
        .filter((party) => party.candidates.length > 0);
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

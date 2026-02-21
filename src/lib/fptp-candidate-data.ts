import { promises as fs } from "fs";
import path from "path";

export interface FPTPCandidate {
  serialNo: number;
  sourceSerialNo: number;
  candidateId: number | null;
  candidateName: string;
  gender: string;
  partyName: string;
  symbolName: string;
  symbolCode: number | null;
  province: string;
  provinceId: number | null;
  district: string;
  constituency: number | null;
  constituencyDisplay: string;
  totalVoteReceived: number | null;
  age: number | null;
  details: {
    birthDistrict: string;
    address: string;
    fatherName: string;
    spouseName: string;
    qualification: string;
    institution: string;
    experience: string;
    otherDetails: string;
    electionStatus: string | null;
    rank: number | null;
  };
  imageUrl: string | null;
}

export interface KeyCount {
  key: string;
  count: number;
}

export interface FPTPCandidateDataset {
  metadata: {
    electionName: string;
    source: string;
    sourceUrls: Record<string, string>;
    fetchedAt: string;
    totalRecords: number;
  };
  stats: {
    totalCandidates: number;
    totalParties: number;
    totalDistricts: number;
    totalConstituencies: number;
    genderBreakdown: KeyCount[];
    topParties: KeyCount[];
    topDistricts: KeyCount[];
  };
  lookups: {
    states: Array<{ id: number; name: string }>;
    districts: Array<{ id: number; name: string; parentId: number }>;
    stateNames: string[];
    districtNames: string[];
    partyNames: string[];
    partyNamesAlt: string[];
  };
  candidates: FPTPCandidate[];
}

const DATASET_PATH = path.join(
  process.cwd(),
  "public",
  "election",
  "candidates",
  "FPTP-2082.json"
);

export async function getFPTPCandidateDataset(): Promise<FPTPCandidateDataset> {
  const contents = await fs.readFile(DATASET_PATH, "utf8");
  return JSON.parse(contents) as FPTPCandidateDataset;
}

export async function getFPTPCandidates(): Promise<FPTPCandidate[]> {
  const dataset = await getFPTPCandidateDataset();
  return dataset.candidates;
}

export async function getFPTPCandidatesByDistrict(
  district: string
): Promise<FPTPCandidate[]> {
  const candidates = await getFPTPCandidates();
  return candidates.filter((candidate) => candidate.district === district);
}

export async function getFPTPCandidatesByParty(
  partyName: string
): Promise<FPTPCandidate[]> {
  const candidates = await getFPTPCandidates();
  return candidates.filter((candidate) => candidate.partyName === partyName);
}

export async function getFPTPUniqueDistricts(): Promise<string[]> {
  const candidates = await getFPTPCandidates();
  return Array.from(new Set(candidates.map((candidate) => candidate.district)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export async function getFPTPUniqueParties(): Promise<string[]> {
  const candidates = await getFPTPCandidates();
  return Array.from(new Set(candidates.map((candidate) => candidate.partyName)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

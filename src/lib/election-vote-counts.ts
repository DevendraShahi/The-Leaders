import { FPTPCandidate, getFPTPCandidateDataset } from "@/lib/fptp-candidate-data";

export interface FPTPConstituencyCandidate {
    candidateKey: string;
    candidateId: number | null;
    sourceSerialNo: number;
    candidateName: string;
    partyName: string;
    symbolName: string;
    rank: number | null;
}

export interface FPTPConstituency {
    constituencyKey: string;
    constituencyLabel: string;
    province: string;
    district: string;
    constituencyNumber: number | null;
    candidates: FPTPConstituencyCandidate[];
}

type ConstituencyCache = {
    constituencies: FPTPConstituency[];
    byKey: Map<string, FPTPConstituency>;
    byLookup: Map<string, string>;
};

let cachePromise: Promise<ConstituencyCache> | null = null;

function normalizeLookupText(value: unknown): string {
    return String(value || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}

function parseConstituencyNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    const parsed = Number.parseInt(String(value).trim(), 10);
    return Number.isFinite(parsed) ? parsed : null;
}

function buildConstituencyLookup(
    province: string,
    district: string,
    constituencyNumber: number | null
): string {
    const normalizedProvince = normalizeLookupText(province);
    const normalizedDistrict = normalizeLookupText(district);
    const normalizedConstituency = constituencyNumber === null ? "x" : String(constituencyNumber);
    return `${normalizedProvince}|${normalizedDistrict}|${normalizedConstituency}`;
}

function buildCandidateKey(candidate: FPTPCandidate): string {
    if (candidate.candidateId !== null && candidate.candidateId !== undefined) {
        return `cid-${candidate.candidateId}`;
    }
    return `sid-${candidate.sourceSerialNo}`;
}

function buildConstituencyLabel(candidate: FPTPCandidate): string {
    const explicit = String(candidate.constituencyDisplay || "").trim();
    if (explicit) {
        return explicit;
    }
    if (candidate.constituency !== null && candidate.constituency !== undefined) {
        return `${candidate.district}-${candidate.constituency}`;
    }
    return candidate.district;
}

function buildConstituencyKey(candidate: FPTPCandidate): string {
    const rawKey = `${candidate.provinceId ?? "x"}|${candidate.district}|${candidate.constituency ?? "x"}`;
    return `seat-${Buffer.from(rawKey, "utf8").toString("base64url")}`;
}

function compareNullableNumbers(a: number | null, b: number | null): number {
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    return a - b;
}

async function loadCache(): Promise<ConstituencyCache> {
    if (cachePromise) {
        return cachePromise;
    }

    cachePromise = (async () => {
        const dataset = await getFPTPCandidateDataset();
        const constituencyMap = new Map<string, FPTPConstituency>();

        for (const candidate of dataset.candidates) {
            const constituencyKey = buildConstituencyKey(candidate);
            if (!constituencyMap.has(constituencyKey)) {
                constituencyMap.set(constituencyKey, {
                    constituencyKey,
                    constituencyLabel: buildConstituencyLabel(candidate),
                    province: candidate.province,
                    district: candidate.district,
                    constituencyNumber: candidate.constituency,
                    candidates: [],
                });
            }

            constituencyMap.get(constituencyKey)!.candidates.push({
                candidateKey: buildCandidateKey(candidate),
                candidateId: candidate.candidateId,
                sourceSerialNo: candidate.sourceSerialNo,
                candidateName: candidate.candidateName,
                partyName: candidate.partyName,
                symbolName: candidate.symbolName,
                rank: candidate.details?.rank ?? null,
            });
        }

        const constituencies = Array.from(constituencyMap.values())
            .map((constituency) => ({
                ...constituency,
                candidates: [...constituency.candidates].sort((a, b) => {
                    const rankCompare = compareNullableNumbers(a.rank, b.rank);
                    if (rankCompare !== 0) return rankCompare;
                    const partyCompare = a.partyName.localeCompare(b.partyName, "ne");
                    if (partyCompare !== 0) return partyCompare;
                    return a.candidateName.localeCompare(b.candidateName, "ne");
                }),
            }))
            .sort((a, b) => {
                const provinceCompare = a.province.localeCompare(b.province, "ne");
                if (provinceCompare !== 0) return provinceCompare;
                const districtCompare = a.district.localeCompare(b.district, "ne");
                if (districtCompare !== 0) return districtCompare;
                return compareNullableNumbers(a.constituencyNumber, b.constituencyNumber);
            });

        const byKey = new Map<string, FPTPConstituency>();
        const byLookup = new Map<string, string>();

        for (const constituency of constituencies) {
            byKey.set(constituency.constituencyKey, constituency);
            byLookup.set(
                buildConstituencyLookup(
                    constituency.province,
                    constituency.district,
                    constituency.constituencyNumber
                ),
                constituency.constituencyKey
            );
        }

        return { constituencies, byKey, byLookup };
    })();

    return cachePromise;
}

export async function getFPTPConstituencies(): Promise<FPTPConstituency[]> {
    const cache = await loadCache();
    return cache.constituencies;
}

export async function getFPTPConstituencyByKey(
    constituencyKey: string
): Promise<FPTPConstituency | null> {
    const cache = await loadCache();
    return cache.byKey.get(constituencyKey) || null;
}

export async function resolveConstituencyKeyFromFields(params: {
    constituencyKey?: string | null;
    province?: string | null;
    district?: string | null;
    constituencyNumber?: string | number | null;
}): Promise<string | null> {
    const cache = await loadCache();

    const directKey = String(params.constituencyKey || "").trim();
    if (directKey && cache.byKey.has(directKey)) {
        return directKey;
    }

    const province = String(params.province || "").trim();
    const district = String(params.district || "").trim();
    const constituencyNumber = parseConstituencyNumber(params.constituencyNumber);

    if (!province || !district) {
        return null;
    }

    const lookup = buildConstituencyLookup(province, district, constituencyNumber);
    return cache.byLookup.get(lookup) || null;
}

export function findCandidateInConstituency(
    constituency: FPTPConstituency,
    params: {
        candidateKey?: string | null;
        candidateId?: string | number | null;
        sourceSerialNo?: string | number | null;
        candidateName?: string | null;
        partyName?: string | null;
    }
): FPTPConstituencyCandidate | null {
    const directKey = String(params.candidateKey || "").trim();
    if (directKey) {
        const hit = constituency.candidates.find((candidate) => candidate.candidateKey === directKey);
        if (hit) return hit;
    }

    const candidateId =
        params.candidateId === null || params.candidateId === undefined || params.candidateId === ""
            ? null
            : Number.parseInt(String(params.candidateId), 10);
    if (candidateId !== null && Number.isFinite(candidateId)) {
        const hit = constituency.candidates.find((candidate) => candidate.candidateId === candidateId);
        if (hit) return hit;
    }

    const sourceSerialNo =
        params.sourceSerialNo === null ||
            params.sourceSerialNo === undefined ||
            params.sourceSerialNo === ""
            ? null
            : Number.parseInt(String(params.sourceSerialNo), 10);
    if (sourceSerialNo !== null && Number.isFinite(sourceSerialNo)) {
        const hit = constituency.candidates.find(
            (candidate) => candidate.sourceSerialNo === sourceSerialNo
        );
        if (hit) return hit;
    }

    const candidateName = normalizeLookupText(params.candidateName);
    if (!candidateName) {
        return null;
    }

    const partyName = normalizeLookupText(params.partyName);
    const byName = constituency.candidates.filter(
        (candidate) => normalizeLookupText(candidate.candidateName) === candidateName
    );
    if (byName.length === 1) return byName[0] || null;
    if (byName.length === 0) return null;

    if (partyName) {
        return (
            byName.find((candidate) => normalizeLookupText(candidate.partyName) === partyName) ||
            null
        );
    }

    return null;
}

import type { FPTPCandidate } from "@/lib/fptp-candidate-data";

function toSafeInt(value: string): number | null {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
}

export function getFPTPCandidateSlug(candidate: FPTPCandidate): string {
    if (candidate.candidateId !== null && candidate.candidateId !== undefined) {
        return `cid-${candidate.candidateId}-p${candidate.provinceId ?? "x"}-c${candidate.constituency ?? "x"}`;
    }

    return `sid-${candidate.sourceSerialNo}-p${candidate.provinceId ?? "x"}-c${candidate.constituency ?? "x"}`;
}

export function resolveFPTPCandidateSlug(slug: string):
    | { type: "candidateId"; value: number }
    | { type: "sourceSerialNo"; value: number }
    | null {
    const match = /^(cid|sid)-(\d+)/.exec(slug);
    if (!match) return null;

    const id = toSafeInt(match[2]);
    if (!id) return null;

    if (match[1] === "cid") {
        return { type: "candidateId", value: id };
    }

    return { type: "sourceSerialNo", value: id };
}

export function findFPTPCandidateBySlug(candidates: FPTPCandidate[], slug: string): FPTPCandidate | null {
    const resolved = resolveFPTPCandidateSlug(slug);
    if (!resolved) return null;

    if (resolved.type === "candidateId") {
        return candidates.find((candidate) => candidate.candidateId === resolved.value) ?? null;
    }

    return candidates.find((candidate) => candidate.sourceSerialNo === resolved.value) ?? null;
}

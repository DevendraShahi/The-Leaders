import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import { apiError, apiResponse, parseRequestBody, withAuth } from "@/lib/middleware";
import ElectionVoteCount from "@/models/ElectionVoteCount";
import {
    findCandidateInConstituency,
    getFPTPConstituencyByKey,
} from "@/lib/election-vote-counts";

type VoteUpdatePayload = {
    mode?: "merge" | "replace";
    candidateVotes?: Array<{
        candidateKey?: string;
        candidateId?: number | string | null;
        sourceSerialNo?: number | string | null;
        candidateName?: string | null;
        partyName?: string | null;
        votes?: number | string;
    }>;
};

function toSafeVoteCount(value: unknown): number | null {
    const cleaned = String(value ?? "")
        .trim()
        .replace(/,/g, "");
    if (!cleaned) return 0;

    const numeric = Number(cleaned);
    if (!Number.isFinite(numeric) || numeric < 0) {
        return null;
    }

    return Math.floor(numeric);
}

function buildVoteMap(entries: Array<{ candidateKey: string; votes: number }> | undefined) {
    const map = new Map<string, number>();
    for (const entry of entries || []) {
        map.set(entry.candidateKey, entry.votes || 0);
    }
    return map;
}

async function getConstituencyVoteCount(
    request: NextRequest,
    { params }: { params: { constituencyKey: string } }
) {
    try {
        await dbConnect();

        const constituencyKey = decodeURIComponent(params.constituencyKey || "");
        const constituency = await getFPTPConstituencyByKey(constituencyKey);
        if (!constituency) {
            return apiError("Constituency not found", 404);
        }

        const voteCount = await ElectionVoteCount.findOne({ constituencyKey }).lean();
        const voteMap = buildVoteMap((voteCount as any)?.candidateVotes);

        const candidates = constituency.candidates.map((candidate) => ({
            candidateKey: candidate.candidateKey,
            candidateId: candidate.candidateId,
            sourceSerialNo: candidate.sourceSerialNo,
            candidateName: candidate.candidateName,
            partyName: candidate.partyName,
            symbolName: candidate.symbolName,
            votes: voteMap.get(candidate.candidateKey) || 0,
        }));

        const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
        const leadingCandidate = [...candidates].sort((a, b) => b.votes - a.votes)[0] || null;

        return apiResponse({
            constituencyKey: constituency.constituencyKey,
            constituencyLabel: constituency.constituencyLabel,
            province: constituency.province,
            district: constituency.district,
            constituencyNumber: constituency.constituencyNumber,
            totalVotes,
            leadingCandidate,
            updatedAt: (voteCount as any)?.updatedAt || null,
            updatedByEmail: (voteCount as any)?.updatedByEmail || null,
            candidates,
        });
    } catch (error) {
        console.error("Constituency vote detail error:", error);
        return apiError("Failed to fetch constituency vote count", 500);
    }
}

async function updateConstituencyVoteCount(
    request: NextRequest,
    { user, params }: { user: any; params: { constituencyKey: string } }
) {
    try {
        await dbConnect();

        const constituencyKey = decodeURIComponent(params.constituencyKey || "");
        const constituency = await getFPTPConstituencyByKey(constituencyKey);
        if (!constituency) {
            return apiError("Constituency not found", 404);
        }

        const bodyParse = await parseRequestBody<VoteUpdatePayload>(request);
        if (!bodyParse.success || !bodyParse.data) {
            return apiError(bodyParse.error || "Invalid request body", 400);
        }

        const mode = bodyParse.data.mode === "replace" ? "replace" : "merge";
        const voteUpdates = Array.isArray(bodyParse.data.candidateVotes)
            ? bodyParse.data.candidateVotes
            : [];
        if (voteUpdates.length === 0) {
            return apiError("candidateVotes is required", 400);
        }

        const resolvedUpdates = new Map<string, number>();
        const errors: string[] = [];

        for (const update of voteUpdates) {
            const candidate = findCandidateInConstituency(constituency, {
                candidateKey: update.candidateKey,
                candidateId: update.candidateId,
                sourceSerialNo: update.sourceSerialNo,
                candidateName: update.candidateName,
                partyName: update.partyName,
            });

            if (!candidate) {
                errors.push("Unknown candidate in update payload.");
                continue;
            }

            const votes = toSafeVoteCount(update.votes);
            if (votes === null) {
                errors.push(`Invalid vote value for ${candidate.candidateName}.`);
                continue;
            }

            resolvedUpdates.set(candidate.candidateKey, votes);
        }

        if (errors.length > 0) {
            return apiError("Invalid candidate vote updates", 400, errors);
        }

        const existing = await ElectionVoteCount.findOne({ constituencyKey }).lean();
        const existingVotes = buildVoteMap((existing as any)?.candidateVotes);

        const candidateVotes = constituency.candidates.map((candidate) => {
            let votes = 0;
            if (mode === "merge") {
                votes = existingVotes.get(candidate.candidateKey) || 0;
            }
            if (resolvedUpdates.has(candidate.candidateKey)) {
                votes = resolvedUpdates.get(candidate.candidateKey) || 0;
            }
            return {
                candidateKey: candidate.candidateKey,
                candidateId: candidate.candidateId,
                sourceSerialNo: candidate.sourceSerialNo,
                votes,
            };
        });

        const updated = await ElectionVoteCount.findOneAndUpdate(
            { constituencyKey },
            {
                constituencyKey: constituency.constituencyKey,
                constituencyLabel: constituency.constituencyLabel,
                province: constituency.province,
                district: constituency.district,
                constituencyNumber: constituency.constituencyNumber,
                candidateVotes,
                updatedBy: user.userId,
                updatedByEmail: user.email,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean();

        const totalVotes = candidateVotes.reduce((sum, candidate) => sum + candidate.votes, 0);
        const leadingCandidate =
            [...candidateVotes]
                .sort((a, b) => b.votes - a.votes)
                .map((entry) => {
                    const candidate = constituency.candidates.find(
                        (item) => item.candidateKey === entry.candidateKey
                    );
                    return candidate
                        ? {
                            candidateName: candidate.candidateName,
                            partyName: candidate.partyName,
                            votes: entry.votes,
                        }
                        : null;
                })
                .find(Boolean) || null;

        return apiResponse({
            constituencyKey: constituency.constituencyKey,
            constituencyLabel: constituency.constituencyLabel,
            totalVotes,
            leadingCandidate,
            updatedAt: (updated as any)?.updatedAt || null,
            updatedByEmail: (updated as any)?.updatedByEmail || null,
            candidates: constituency.candidates.map((candidate) => ({
                candidateKey: candidate.candidateKey,
                candidateId: candidate.candidateId,
                sourceSerialNo: candidate.sourceSerialNo,
                candidateName: candidate.candidateName,
                partyName: candidate.partyName,
                symbolName: candidate.symbolName,
                votes: candidateVotes.find((entry) => entry.candidateKey === candidate.candidateKey)
                    ?.votes || 0,
            })),
        });
    } catch (error) {
        console.error("Update constituency vote count error:", error);
        return apiError("Failed to update constituency vote count", 500);
    }
}

export const GET = withAuth(getConstituencyVoteCount);
export const PUT = withAuth(updateConstituencyVoteCount);

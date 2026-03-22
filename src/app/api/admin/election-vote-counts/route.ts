import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import { apiError, apiResponse, withAuth } from "@/lib/middleware";
import ElectionVoteCount from "@/models/ElectionVoteCount";
import { getFPTPConstituencies } from "@/lib/election-vote-counts";

function normalizeSearchText(value: string): string {
    return value.trim().toLowerCase();
}

async function getVoteCountConstituencies(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const search = normalizeSearchText(searchParams.get("search") || "");

        const [constituencies, savedVoteCountsRaw] = await Promise.all([
            getFPTPConstituencies(),
            ElectionVoteCount.find({}, { constituencyKey: 1, candidateVotes: 1, updatedAt: 1 }).lean(),
        ]);

        const savedVoteCountMap = new Map<
            string,
            { updatedAt?: Date; candidateVotes: Array<{ candidateKey: string; votes: number }> }
        >();

        for (const entry of savedVoteCountsRaw as any[]) {
            savedVoteCountMap.set(String(entry.constituencyKey), {
                updatedAt: entry.updatedAt,
                candidateVotes: Array.isArray(entry.candidateVotes) ? entry.candidateVotes : [],
            });
        }

        const summaries = constituencies
            .filter((constituency) => {
                if (!search) return true;
                const haystack = [
                    constituency.constituencyLabel,
                    constituency.province,
                    constituency.district,
                    String(constituency.constituencyNumber ?? ""),
                    ...constituency.candidates.map((candidate) => candidate.candidateName),
                ]
                    .join(" ")
                    .toLowerCase();
                return haystack.includes(search);
            })
            .map((constituency) => {
                const savedVoteCount = savedVoteCountMap.get(constituency.constituencyKey);
                const votesByCandidateKey = new Map<string, number>();

                for (const voteEntry of savedVoteCount?.candidateVotes || []) {
                    votesByCandidateKey.set(voteEntry.candidateKey, voteEntry.votes || 0);
                }

                const candidateSummaries = constituency.candidates.map((candidate) => ({
                    candidateName: candidate.candidateName,
                    partyName: candidate.partyName,
                    votes: votesByCandidateKey.get(candidate.candidateKey) || 0,
                }));

                const totalVotes = candidateSummaries.reduce(
                    (sum, candidate) => sum + candidate.votes,
                    0
                );
                const leadingCandidate =
                    candidateSummaries.sort((a, b) => b.votes - a.votes)[0] || null;

                return {
                    constituencyKey: constituency.constituencyKey,
                    constituencyLabel: constituency.constituencyLabel,
                    province: constituency.province,
                    district: constituency.district,
                    constituencyNumber: constituency.constituencyNumber,
                    candidateCount: constituency.candidates.length,
                    totalVotes,
                    leadingCandidate,
                    updatedAt: savedVoteCount?.updatedAt || null,
                };
            });

        return apiResponse({
            constituencies: summaries,
            total: summaries.length,
        });
    } catch (error) {
        console.error("Vote count constituency list error:", error);
        return apiError("Failed to fetch vote count constituencies", 500);
    }
}

export const GET = withAuth(getVoteCountConstituencies);

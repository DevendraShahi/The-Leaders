import dbConnect from "@/lib/db";
import ElectionVoteCount from "@/models/ElectionVoteCount";
import {
    findCandidateInConstituency,
    getFPTPConstituencies,
    resolveConstituencyKeyFromFields,
} from "@/lib/election-vote-counts";

export type VoteIngestMode = "merge" | "replace";

export type VoteRowError = {
    rowNumber: number;
    message: string;
};

export type NormalizedVoteRow = {
    rowNumber: number;
    values: Record<string, string>;
};

type UpdatedBy = {
    userId?: string;
    email?: string;
};

type ApplyVoteRowsOptions = {
    rows: NormalizedVoteRow[];
    mode: VoteIngestMode;
    dryRun?: boolean;
    updatedBy?: UpdatedBy;
};

export type ApplyVoteRowsResult = {
    mode: VoteIngestMode;
    dryRun: boolean;
    parsedRows: number;
    acceptedRows: number;
    affectedConstituencies: number;
    rejectedRows: number;
    errors: VoteRowError[];
};

function normalizeColumnName(value: string): string {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

export function normalizeVoteRowValues(values: Record<string, unknown>): Record<string, string> {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(values || {})) {
        normalized[normalizeColumnName(key)] = String(value ?? "").trim();
    }
    return normalized;
}

function pickCellValue(normalizedRow: Record<string, string>, aliases: string[]): string {
    for (const alias of aliases) {
        const value = normalizedRow[alias];
        if (value !== undefined && String(value).trim() !== "") {
            return String(value).trim();
        }
    }
    return "";
}

function toVoteValue(value: unknown): number | null {
    const cleaned = String(value ?? "")
        .trim()
        .replace(/,/g, "");
    if (!cleaned) return null;

    const numeric = Number(cleaned);
    if (!Number.isFinite(numeric) || numeric < 0) {
        return null;
    }

    return Math.floor(numeric);
}

function buildExistingVoteMap(entries: Array<{ candidateKey: string; votes: number }> | undefined) {
    const map = new Map<string, number>();
    for (const entry of entries || []) {
        map.set(entry.candidateKey, entry.votes || 0);
    }
    return map;
}

export async function applyVoteRows({
    rows,
    mode,
    dryRun = false,
    updatedBy,
}: ApplyVoteRowsOptions): Promise<ApplyVoteRowsResult> {
    const constituencies = await getFPTPConstituencies();
    const constituencyMap = new Map(
        constituencies.map((constituency) => [constituency.constituencyKey, constituency])
    );

    const updatesByConstituency = new Map<string, Map<string, number>>();
    const rowErrors: VoteRowError[] = [];
    let acceptedRows = 0;

    for (const row of rows) {
        const normalizedRow = normalizeVoteRowValues(row.values);
        const rowNumber = Number.isFinite(row.rowNumber) ? row.rowNumber : acceptedRows + rowErrors.length + 1;

        const explicitConstituencyKey = pickCellValue(normalizedRow, [
            "constituency_key",
            "seat_key",
            "seat",
            "constituency_code",
        ]);

        const resolvedConstituencyKey = await resolveConstituencyKeyFromFields({
            constituencyKey: explicitConstituencyKey,
            province: pickCellValue(normalizedRow, ["province", "province_name", "state"]),
            district: pickCellValue(normalizedRow, ["district", "district_name"]),
            constituencyNumber: pickCellValue(normalizedRow, [
                "constituency_number",
                "constituency_no",
                "constituency",
                "seat_no",
            ]),
        });

        if (!resolvedConstituencyKey) {
            rowErrors.push({
                rowNumber,
                message:
                    "Could not match constituency. Provide constituency_key, or province + district + constituency_number.",
            });
            continue;
        }

        const constituency = constituencyMap.get(resolvedConstituencyKey);
        if (!constituency) {
            rowErrors.push({
                rowNumber,
                message: "Constituency key not found in FPTP dataset.",
            });
            continue;
        }

        const candidate = findCandidateInConstituency(constituency, {
            candidateKey: pickCellValue(normalizedRow, ["candidate_key"]),
            candidateId: pickCellValue(normalizedRow, ["candidate_id", "cid"]),
            sourceSerialNo: pickCellValue(normalizedRow, [
                "source_serial_no",
                "source_serial",
                "serial_no",
            ]),
            candidateName: pickCellValue(normalizedRow, ["candidate_name", "name"]),
            partyName: pickCellValue(normalizedRow, ["party_name", "party"]),
        });

        if (!candidate) {
            rowErrors.push({
                rowNumber,
                message:
                    "Candidate not matched. Provide candidate_key, candidate_id, or source_serial_no.",
            });
            continue;
        }

        const votes = toVoteValue(
            pickCellValue(normalizedRow, [
                "votes",
                "vote_count",
                "vote",
                "total_votes",
                "total_vote_received",
            ])
        );

        if (votes === null) {
            rowErrors.push({
                rowNumber,
                message: "Invalid votes value. Use a non-negative number.",
            });
            continue;
        }

        if (!updatesByConstituency.has(resolvedConstituencyKey)) {
            updatesByConstituency.set(resolvedConstituencyKey, new Map<string, number>());
        }
        updatesByConstituency.get(resolvedConstituencyKey)!.set(candidate.candidateKey, votes);
        acceptedRows += 1;
    }

    if (!dryRun && acceptedRows > 0) {
        await dbConnect();

        const constituencyKeys = Array.from(updatesByConstituency.keys());
        const existingVoteCounts = await ElectionVoteCount.find({
            constituencyKey: { $in: constituencyKeys },
        }).lean();
        const existingVoteMap = new Map(
            (existingVoteCounts as any[]).map((item) => [String(item.constituencyKey), item])
        );

        const operations = constituencyKeys.map((constituencyKey) => {
            const constituency = constituencyMap.get(constituencyKey)!;
            const currentUpdates = updatesByConstituency.get(constituencyKey)!;
            const existing = existingVoteMap.get(constituencyKey);
            const existingVotes = buildExistingVoteMap(existing?.candidateVotes);

            const candidateVotes = constituency.candidates.map((candidate) => {
                let votes = 0;
                if (mode === "merge") {
                    votes = existingVotes.get(candidate.candidateKey) || 0;
                }
                if (currentUpdates.has(candidate.candidateKey)) {
                    votes = currentUpdates.get(candidate.candidateKey) || 0;
                }

                return {
                    candidateKey: candidate.candidateKey,
                    candidateId: candidate.candidateId,
                    sourceSerialNo: candidate.sourceSerialNo,
                    votes,
                };
            });

            return {
                updateOne: {
                    filter: { constituencyKey },
                    update: {
                        constituencyKey: constituency.constituencyKey,
                        constituencyLabel: constituency.constituencyLabel,
                        province: constituency.province,
                        district: constituency.district,
                        constituencyNumber: constituency.constituencyNumber,
                        candidateVotes,
                        updatedBy: updatedBy?.userId || "system",
                        updatedByEmail: updatedBy?.email || "system@theleaders",
                    },
                    upsert: true,
                },
            };
        });

        if (operations.length > 0) {
            await ElectionVoteCount.bulkWrite(operations, { ordered: false });
        }
    }

    return {
        mode,
        dryRun,
        parsedRows: rows.length,
        acceptedRows,
        affectedConstituencies: updatesByConstituency.size,
        rejectedRows: rowErrors.length,
        errors: rowErrors,
    };
}

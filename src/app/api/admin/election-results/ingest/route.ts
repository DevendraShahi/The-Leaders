import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import { apiError, apiResponse, parseRequestBody, withAuth } from "@/lib/middleware";
import ElectionResultIngest from "@/models/ElectionResultIngest";
import {
    applyVoteRows,
    normalizeVoteRowValues,
    NormalizedVoteRow,
    VoteIngestMode,
} from "@/lib/election-vote-ingest";

type ElectionResultIngestBody = {
    source?: string;
    fetchedAt?: string;
    mode?: VoteIngestMode;
    dryRun?: boolean;
    rows?: Array<Record<string, unknown>>;
    metadata?: Record<string, unknown>;
};

function resolveStatus(
    dryRun: boolean,
    acceptedRows: number,
    rejectedRows: number
): "success" | "partial" | "failed" | "dry-run" {
    if (dryRun) return "dry-run";
    if (acceptedRows === 0) return "failed";
    if (rejectedRows > 0) return "partial";
    return "success";
}

async function ingestElectionResults(
    request: NextRequest,
    { user }: { user: any }
) {
    try {
        const bodyParse = await parseRequestBody<ElectionResultIngestBody>(request);
        if (!bodyParse.success || !bodyParse.data) {
            return apiError(bodyParse.error || "Invalid request body", 400);
        }

        const rowsInput = Array.isArray(bodyParse.data.rows) ? bodyParse.data.rows : [];
        if (rowsInput.length === 0) {
            return apiError("rows is required and must be a non-empty array", 400);
        }

        const mode: VoteIngestMode = bodyParse.data.mode === "replace" ? "replace" : "merge";
        const dryRun = Boolean(bodyParse.data.dryRun);
        const normalizedRows: NormalizedVoteRow[] = rowsInput.map((row, index) => {
            const rowNumberRaw = row.rowNumber;
            const rowNumber = Number.isFinite(Number(rowNumberRaw))
                ? Number(rowNumberRaw)
                : index + 2;
            const values = { ...row };
            delete values.rowNumber;
            return {
                rowNumber,
                values: normalizeVoteRowValues(values),
            };
        });

        const result = await applyVoteRows({
            rows: normalizedRows,
            mode,
            dryRun,
            updatedBy: {
                userId: user.userId,
                email: user.email,
            },
        });

        const status = resolveStatus(result.dryRun, result.acceptedRows, result.rejectedRows);

        await dbConnect();
        await ElectionResultIngest.create({
            source: bodyParse.data.source || "manual-json-ingest",
            fetchedAt: bodyParse.data.fetchedAt ? new Date(bodyParse.data.fetchedAt) : undefined,
            mode,
            status,
            parsedRows: result.parsedRows,
            acceptedRows: result.acceptedRows,
            rejectedRows: result.rejectedRows,
            affectedConstituencies: result.affectedConstituencies,
            rowErrors: result.errors,
            metadata: bodyParse.data.metadata || {},
            createdBy: user.userId,
            createdByEmail: user.email,
        });

        if (result.acceptedRows === 0) {
            return apiError("No valid rows found in payload", 400, result.errors);
        }

        return apiResponse(result);
    } catch (error) {
        console.error("Election results ingest error:", error);
        return apiError("Failed to ingest election results payload", 500);
    }
}

export const POST = withAuth(ingestElectionResults);

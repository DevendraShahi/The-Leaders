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
import {
    resolveRowsFromSources,
} from "@/lib/election-result-source-resolver";
import { getElectionResultSources } from "@/lib/election-result-source-config";

type RefreshBody = {
    mode?: VoteIngestMode;
    dryRun?: boolean;
    sources?: string[] | string;
    maxDiscoveryDepth?: number;
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

async function refreshElectionResults(
    request: NextRequest,
    { user }: { user: any }
) {
    try {
        const bodyParse = await parseRequestBody<RefreshBody>(request);
        const body = bodyParse.success && bodyParse.data ? bodyParse.data : {};
        const mode: VoteIngestMode = body.mode === "replace" ? "replace" : "merge";
        const dryRun = Boolean(body.dryRun);
        const sourceList = getElectionResultSources(body.sources);

        if (sourceList.length === 0) {
            return apiError(
                "No election result sources configured. Set ELECTION_RESULTS_SOURCE_URLS or send body.sources.",
                400
            );
        }

        const maxDiscoveryDepth = Number.isFinite(Number(body.maxDiscoveryDepth))
            ? Number(body.maxDiscoveryDepth)
            : 2;
        const resolved = await resolveRowsFromSources(sourceList, {
            maxDiscoveryDepth,
        });

        const normalizedRows: NormalizedVoteRow[] = [];
        let rowCursor = 2;

        for (const row of resolved.rows) {
            normalizedRows.push({
                rowNumber: rowCursor,
                values: normalizeVoteRowValues(row),
            });
            rowCursor += 1;
        }

        if (normalizedRows.length === 0) {
            return apiError("Sources returned no rows to ingest", 400, {
                pulls: resolved.pulls,
            });
        }

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
            source: "auto-refresh",
            fetchedAt: new Date(),
            mode,
            status,
            parsedRows: result.parsedRows,
            acceptedRows: result.acceptedRows,
            rejectedRows: result.rejectedRows,
            affectedConstituencies: result.affectedConstituencies,
            rowErrors: result.errors,
            metadata: {
                pulls: resolved.pulls,
                sourcesUsed: sourceList,
                discoveredSources: resolved.discoveredSources,
            },
            createdBy: user.userId,
            createdByEmail: user.email,
        });

        if (result.acceptedRows === 0) {
            return apiError("No valid rows found in fetched sources", 400, result.errors);
        }

        return apiResponse({
            ...result,
            pulls: resolved.pulls,
            sourcesUsed: sourceList,
            discoveredSources: resolved.discoveredSources,
        });
    } catch (error) {
        console.error("Election results refresh error:", error);
        return apiError("Failed to refresh election results from source", 500);
    }
}

export const POST = withAuth(refreshElectionResults);

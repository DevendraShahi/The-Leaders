import { NextRequest } from "next/server";
import { apiError, apiResponse, withAuth } from "@/lib/middleware";
import { applyVoteRows, VoteIngestMode } from "@/lib/election-vote-ingest";
import { parseSpreadsheetBuffer, SpreadsheetParseError } from "@/lib/simple-sheet-parser";

async function importVoteCounts(
    request: NextRequest,
    { user }: { user: any }
) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const modeInput = String(formData.get("mode") || "merge").toLowerCase();
        const dryRun = String(formData.get("dryRun") || "false").toLowerCase() === "true";
        const mode: VoteIngestMode = modeInput === "replace" ? "replace" : "merge";

        if (!file) {
            return apiError("No file provided", 400);
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const parsedRows = parseSpreadsheetBuffer(file.name, buffer);
        if (parsedRows.length === 0) {
            return apiError("No data rows found in file", 400);
        }

        const result = await applyVoteRows({
            rows: parsedRows,
            mode,
            dryRun,
            updatedBy: {
                userId: user.userId,
                email: user.email,
            },
        });

        if (result.acceptedRows === 0) {
            return apiError("No valid rows found in uploaded file", 400, result.errors);
        }

        return apiResponse(result);
    } catch (error) {
        console.error("Vote count import error:", error);
        if (error instanceof SpreadsheetParseError) {
            return apiError(error.message, 400);
        }
        return apiError("Failed to import vote count file", 500);
    }
}

export const POST = withAuth(importVoteCounts);

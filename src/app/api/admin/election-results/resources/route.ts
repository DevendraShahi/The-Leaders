import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import { apiError, apiResponse, withAuth } from "@/lib/middleware";
import ElectionResultIngest from "@/models/ElectionResultIngest";
import {
    buildElectionResultIngestPrompt,
    getElectionResultResources,
} from "@/lib/election-results-resources";
import {
    parseSourceList,
    resolveRowsFromSources,
} from "@/lib/election-result-source-resolver";
import {
    getConfiguredElectionResultSources,
    getElectionResultSources,
    getFallbackElectionResultSources,
} from "@/lib/election-result-source-config";

async function getElectionResultResourcesEndpoint(_request: NextRequest) {
    try {
        await dbConnect();

        const resources = getElectionResultResources();
        const prompt = buildElectionResultIngestPrompt(resources);
        const configuredSources = getConfiguredElectionResultSources();
        const fallbackSources = getFallbackElectionResultSources();
        const requestedSources = parseSourceList(_request.nextUrl.searchParams.get("sources") || "");
        const discoverySources = getElectionResultSources(requestedSources);
        const shouldDiscover = _request.nextUrl.searchParams.get("discover") === "1";
        const discovery =
            shouldDiscover && discoverySources.length > 0
                ? await resolveRowsFromSources(discoverySources, {
                    maxDiscoveryDepth: 2,
                    maxRows: 500,
                  })
                : null;
        const latestIngest = await ElectionResultIngest.findOne({})
            .sort({ createdAt: -1 })
            .lean();

        return apiResponse({
            resources,
            prompt,
            configuredSources,
            fallbackSources,
            discoverySources,
            discovery: discovery
                ? {
                    rowCandidates: discovery.rows.length,
                    visitedSources: discovery.visitedSources,
                    discoveredSources: discovery.discoveredSources,
                    pulls: discovery.pulls,
                  }
                : null,
            latestIngest: latestIngest
                ? {
                    source: latestIngest.source,
                    status: latestIngest.status,
                    acceptedRows: latestIngest.acceptedRows,
                    rejectedRows: latestIngest.rejectedRows,
                    affectedConstituencies: latestIngest.affectedConstituencies,
                    createdAt: latestIngest.createdAt,
                }
                : null,
        });
    } catch (error) {
        console.error("Election resources endpoint error:", error);
        return apiError("Failed to load election resources", 500);
    }
}

export const GET = withAuth(getElectionResultResourcesEndpoint);

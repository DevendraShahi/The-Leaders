import { parseSourceList } from "@/lib/election-result-source-resolver";

const FALLBACK_ELECTION_RESULT_SOURCES: string[] = [
    "https://electionapi.osac.org.np/summary",
    "http://electionapi.osac.org.np/summary",
    "https://result.election.gov.np/",
];

export function getElectionResultSources(
    requestedSources?: unknown
): string[] {
    const requested = parseSourceList(requestedSources);
    if (requested.length > 0) {
        return requested;
    }

    const configured = parseSourceList(process.env.ELECTION_RESULTS_SOURCE_URLS || "");
    if (configured.length > 0) {
        return configured;
    }

    return [...FALLBACK_ELECTION_RESULT_SOURCES];
}

export function getConfiguredElectionResultSources(): string[] {
    return parseSourceList(process.env.ELECTION_RESULTS_SOURCE_URLS || "");
}

export function getFallbackElectionResultSources(): string[] {
    return [...FALLBACK_ELECTION_RESULT_SOURCES];
}

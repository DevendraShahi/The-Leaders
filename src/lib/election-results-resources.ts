import { getElectionResultSources } from "@/lib/election-result-source-config";

export interface ElectionResultResource {
    id: string;
    label: string;
    url: string;
    notes: string;
    sourceType?: "url" | "file" | "reference";
}

const DEFAULT_ELECTION_RESULT_RESOURCES: ElectionResultResource[] = [
    {
        id: "ecn-fptp-live",
        label: "ECN FPTP Live Result",
        url: "https://result.election.gov.np/",
        notes:
            "Primary source for constituency-wise FPTP counting and final declarations from Election Commission Nepal.",
        sourceType: "reference",
    },
    {
        id: "ecn-announcements",
        label: "ECN Announcements / Bulletins",
        url: "https://election.gov.np/",
        notes:
            "Official notices and status updates for counting progression and result declarations.",
        sourceType: "reference",
    },
    {
        id: "verified-media-result-feed",
        label: "Verified Media Result Feed",
        url: "https://english.onlinekhabar.com/",
        notes:
            "Secondary source for cross-validation. Use only when constituency-level ECN data is also present.",
        sourceType: "reference",
    },
];

function isHttpUrl(value: string): boolean {
    return /^https?:\/\//i.test(String(value || "").trim());
}

function buildConfiguredSourceResources(): ElectionResultResource[] {
    const configuredSources = getElectionResultSources();

    return configuredSources.map((source, index) => {
        const sourceType: "url" | "file" = isHttpUrl(source) ? "url" : "file";
        const idPrefix = sourceType === "url" ? "configured-url" : "configured-file";

        return {
            id: `${idPrefix}-${index + 1}`,
            label:
                sourceType === "url"
                    ? `Configured Source URL ${index + 1}`
                    : `Configured Source File ${index + 1}`,
            url: source,
            notes:
                sourceType === "url"
                    ? "Used directly by auto-refresh endpoint."
                    : "Local file source used by auto-refresh endpoint (supports wrapped HTML JSON payloads).",
            sourceType,
        };
    });
}

export function getElectionResultResources(): ElectionResultResource[] {
    const configured = buildConfiguredSourceResources();
    const merged = [...configured, ...DEFAULT_ELECTION_RESULT_RESOURCES];
    const deduped = new Map<string, ElectionResultResource>();

    for (const resource of merged) {
        if (!deduped.has(resource.url)) {
            deduped.set(resource.url, resource);
        }
    }

    return Array.from(deduped.values());
}

export function buildElectionResultIngestPrompt(resources = getElectionResultResources()): string {
    const resourceList = resources
        .map(
            (resource, index) =>
                `${index + 1}. ${resource.label}\n   Source: ${resource.url}\n   Type: ${resource.sourceType || "url"}\n   Notes: ${resource.notes}`
        )
        .join("\n");

    return [
        "Collect the latest constituency-wise FPTP vote count data from these resources:",
        resourceList,
        "",
        "Return ONLY valid JSON in this exact format:",
        "{",
        '  "source": "ecn-live-ingest",',
        '  "fetchedAt": "ISO-8601 timestamp",',
        '  "mode": "merge",',
        '  "rows": [',
        "    {",
        '      "province": "Province name",',
        '      "district": "District name",',
        '      "constituency_number": 1,',
        '      "candidate_id": 340514,',
        '      "candidate_name": "Candidate Full Name",',
        '      "party_name": "Party Name",',
        '      "votes": 12345',
        "    }",
        "  ],",
        '  "metadata": {',
        '    "resourceIds": ["ecn-fptp-live"],',
        '    "notes": "Optional notes"',
        "  }",
        "}",
        "",
        "Rules:",
        "- Rows must be one candidate per constituency result row.",
        "- Use latest available counting values only.",
        "- If a source payload is a wrapper (for example includes code/data/html), extract valid JSON/API links from the wrapper first, then fetch those and normalize rows.",
        "- Do not include commentary, markdown, or code fences.",
        "- If candidate_id is unavailable, include source_serial_no or candidate_key when possible.",
    ].join("\n");
}

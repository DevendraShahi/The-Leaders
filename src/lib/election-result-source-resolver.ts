import fs from "fs/promises";
import path from "path";

export type ElectionResultSourceType = "url" | "file";

export type ElectionResultPullTrace = {
    source: string;
    sourceType: ElectionResultSourceType;
    depth: number;
    rowCount: number;
    discoveredUrls: string[];
    error?: string;
};

export type ResolveElectionRowsOptions = {
    maxDiscoveryDepth?: number;
    maxSources?: number;
    maxRows?: number;
};

export type ResolveElectionRowsResult = {
    rows: Array<Record<string, unknown>>;
    pulls: ElectionResultPullTrace[];
    visitedSources: string[];
    discoveredSources: string[];
};

const STATIC_FILE_EXTENSIONS = new Set([
    "css",
    "js",
    "mjs",
    "png",
    "jpg",
    "jpeg",
    "webp",
    "svg",
    "gif",
    "ico",
    "woff",
    "woff2",
    "ttf",
    "eot",
    "map",
    "pdf",
]);

const BLOCKED_SOURCE_HOSTS = new Set([
    "github.com",
    "api.github.com",
    "collector.github.com",
    "github.githubassets.com",
    "avatars.githubusercontent.com",
    "user-images.githubusercontent.com",
    "fonts.googleapis.com",
    "fonts.gstatic.com",
    "googleads.g.doubleclick.net",
    "www.googletagmanager.com",
    "www.google-analytics.com",
    "connect.facebook.net",
]);

const DISCOVERY_URL_KEYWORDS = [
    "election",
    "result",
    "count",
    "vote",
    "api",
    "json",
    "constitu",
    "candidate",
    "nepal",
];

const VOTE_FIELD_KEYWORDS = ["votes", "vote_count", "vote", "total_votes", "total_vote_received"];
const CANDIDATE_FIELD_KEYWORDS = [
    "candidate_key",
    "candidate_id",
    "source_serial_no",
    "candidate_name",
    "name",
];
const CONSTITUENCY_FIELD_KEYWORDS = [
    "constituency_key",
    "constituency_number",
    "constituency_no",
    "constituency",
    "seat",
    "province",
    "district",
];

type SourcePayload = {
    payload: unknown;
    sourceType: ElectionResultSourceType;
};

function normalizeKey(input: string): string {
    return String(input || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

function normalizeRowMap(row: Record<string, unknown>): Record<string, string> {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
        normalized[normalizeKey(key)] = String(value ?? "").trim();
    }
    return normalized;
}

function hasAnyField(normalized: Record<string, string>, aliases: string[]): boolean {
    return aliases.some((alias) => {
        const value = normalized[alias];
        return value !== undefined && value !== "";
    });
}

function isVoteLikeValue(value: string): boolean {
    if (!value) return false;
    const numeric = Number(value.replace(/,/g, ""));
    return Number.isFinite(numeric) && numeric >= 0;
}

function looksLikeVoteRow(row: Record<string, unknown>): boolean {
    const normalized = normalizeRowMap(row);
    const voteKey = VOTE_FIELD_KEYWORDS.find((key) => normalized[key] !== undefined);
    if (!voteKey) return false;
    if (!isVoteLikeValue(normalized[voteKey] || "")) return false;
    if (!hasAnyField(normalized, CANDIDATE_FIELD_KEYWORDS)) return false;
    if (!hasAnyField(normalized, CONSTITUENCY_FIELD_KEYWORDS)) return false;
    return true;
}

function buildConstituencyContext(row: Record<string, unknown>): Record<string, unknown> {
    const context: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
        if (value && typeof value === "object") continue;
        const normalized = normalizeKey(key);
        if (
            normalized.includes("province") ||
            normalized.includes("district") ||
            normalized.includes("constituency") ||
            normalized.startsWith("seat")
        ) {
            context[key] = value;
        }
    }

    if (row.constituency && typeof row.constituency === "object" && !Array.isArray(row.constituency)) {
        const nested = row.constituency as Record<string, unknown>;
        for (const [key, value] of Object.entries(nested)) {
            const normalized = normalizeKey(key);
            if (
                normalized.includes("province") ||
                normalized.includes("district") ||
                normalized.includes("constituency") ||
                normalized.startsWith("seat")
            ) {
                context[key] = value;
            }
        }
    }

    return context;
}

function flattenConstituencyCandidates(row: Record<string, unknown>): Array<Record<string, unknown>> {
    const candidates = row.candidates;
    if (!Array.isArray(candidates) || candidates.length === 0) {
        return [];
    }

    const constituencyContext = buildConstituencyContext(row);
    if (Object.keys(constituencyContext).length === 0) {
        return [];
    }

    const flattened: Array<Record<string, unknown>> = [];
    for (const candidate of candidates) {
        if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
            continue;
        }
        const merged = { ...constituencyContext, ...(candidate as Record<string, unknown>) };
        if (looksLikeVoteRow(merged)) {
            flattened.push(merged);
        }
    }

    return flattened;
}

export function extractRowsFromPayload(payload: unknown): Array<Record<string, unknown>> {
    const rows: Array<Record<string, unknown>> = [];
    const visited = new Set<unknown>();

    const visit = (node: unknown, depth: number) => {
        if (node === null || node === undefined || depth > 10) {
            return;
        }
        if (typeof node !== "object") {
            return;
        }
        if (visited.has(node)) {
            return;
        }
        visited.add(node);

        if (Array.isArray(node)) {
            for (const item of node) {
                if (item && typeof item === "object" && !Array.isArray(item)) {
                    const row = item as Record<string, unknown>;
                    if (looksLikeVoteRow(row)) {
                        rows.push(row);
                    }
                    rows.push(...flattenConstituencyCandidates(row));
                }
                visit(item, depth + 1);
            }
            return;
        }

        const record = node as Record<string, unknown>;
        if (looksLikeVoteRow(record)) {
            rows.push(record);
        }
        rows.push(...flattenConstituencyCandidates(record));

        for (const value of Object.values(record)) {
            if (value && typeof value === "object") {
                visit(value, depth + 1);
            }
        }
    };

    visit(payload, 0);

    const uniqueRows: Array<Record<string, unknown>> = [];
    const seen = new Set<string>();
    for (const row of rows) {
        const signature = buildRowSignature(row);
        if (!signature || seen.has(signature)) {
            continue;
        }
        seen.add(signature);
        uniqueRows.push(row);
    }

    return uniqueRows;
}

function buildRowSignature(row: Record<string, unknown>): string {
    const normalized = normalizeRowMap(row);
    return Object.keys(normalized)
        .sort()
        .map((key) => `${key}:${normalized[key]}`)
        .join("|");
}

function decodeEscapedText(input: string): string {
    return String(input || "")
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
            String.fromCharCode(Number.parseInt(hex, 16))
        )
        .replace(/\\\//g, "/")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

function extractUrlsFromText(input: string): string[] {
    const decoded = decodeEscapedText(input);
    const matches = decoded.match(/https?:\/\/[^\s"'<>`\\]+/g) || [];
    return matches
        .map((value) => value.trim().replace(/[),.;]+$/g, ""))
        .filter(Boolean);
}

function extractBareDomainsFromText(input: string): string[] {
    const decoded = decodeEscapedText(input);
    const regex = /(?:^|[^\w@-])((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s"'<>`\\)]*)?)/gi;
    const domains: string[] = [];
    let match: RegExpExecArray | null = null;

    while ((match = regex.exec(decoded)) !== null) {
        const value = String(match[1] || "")
            .trim()
            .replace(/[),.;]+$/g, "");
        if (!value) continue;
        if (value.startsWith("http://") || value.startsWith("https://")) continue;
        domains.push(value);
    }

    return domains;
}

function extractRelativeApiPathsFromText(input: string): string[] {
    const decoded = decodeEscapedText(input);
    const matches = decoded.match(/\/api\/[a-z0-9/_-]*/gi) || [];
    return matches
        .map((value) => value.trim().replace(/[),.;]+$/g, ""))
        .filter((value) => value.startsWith("/api/"));
}

function parseMaybeJson(input: string): { parsed: true; value: unknown } | { parsed: false } {
    try {
        return { parsed: true, value: JSON.parse(input) };
    } catch {
        return { parsed: false };
    }
}

function isHttpUrl(input: string): boolean {
    return /^https?:\/\//i.test(String(input || "").trim());
}

function isLikelyLocalPath(input: string): boolean {
    const value = String(input || "").trim();
    return value.startsWith("/") || value.startsWith("./") || value.startsWith("../") || value.startsWith("~/") || value.startsWith("file://");
}

function resolveLocalPath(input: string): string {
    const value = String(input || "").trim();
    if (value.startsWith("file://")) {
        return decodeURIComponent(value.replace(/^file:\/\//i, ""));
    }
    if (value.startsWith("~/")) {
        const home = process.env.HOME || "";
        return path.resolve(home, value.slice(2));
    }
    return path.resolve(value);
}

async function loadSourcePayload(source: string): Promise<SourcePayload> {
    const sourceValue = String(source || "").trim();
    if (!sourceValue) {
        throw new Error("Source is empty");
    }

    if (isHttpUrl(sourceValue)) {
        const response = await fetch(sourceValue, {
            cache: "no-store",
            headers: { Accept: "application/json,text/plain,*/*" },
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} from ${sourceValue}`);
        }
        const text = await response.text();
        const parsed = parseMaybeJson(text);
        return {
            payload: parsed.parsed ? parsed.value : text,
            sourceType: "url",
        };
    }

    if (!isLikelyLocalPath(sourceValue)) {
        throw new Error(`Unsupported source format: ${sourceValue}`);
    }

    const filePath = resolveLocalPath(sourceValue);
    const text = await fs.readFile(filePath, "utf8");
    const parsed = parseMaybeJson(text);
    return {
        payload: parsed.parsed ? parsed.value : text,
        sourceType: "file",
    };
}

function toGithubRawUrl(url: URL): string {
    if (url.hostname !== "github.com") {
        return url.toString();
    }
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length < 5 || segments[2] !== "blob") {
        return url.toString();
    }
    const owner = segments[0];
    const repo = segments[1];
    const branch = segments[3];
    const filePath = segments.slice(4).join("/");
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
}

function isBlockedHost(hostname: string): boolean {
    const host = String(hostname || "").toLowerCase();
    if (!host) return true;
    if (BLOCKED_SOURCE_HOSTS.has(host)) return true;
    if (host.endsWith(".github.com")) return true;
    return false;
}

function isLikelyDataUrl(url: URL): boolean {
    const hostname = url.hostname.toLowerCase();
    if (isBlockedHost(hostname)) {
        return false;
    }

    const pathname = url.pathname.toLowerCase();
    const extension = pathname.includes(".") ? pathname.split(".").pop() : "";
    if (extension && STATIC_FILE_EXTENSIONS.has(extension)) {
        return false;
    }

    if (
        hostname.includes("result.election.gov.np") ||
        hostname.includes("electionapi.") ||
        hostname.includes("nepalvotes.live")
    ) {
        return true;
    }

    if (pathname.endsWith(".json")) {
        return true;
    }

    const haystack = `${hostname}${pathname}${url.search.toLowerCase()}`;
    return DISCOVERY_URL_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

function sanitizeDiscoveredUrl(rawUrl: string): string | null {
    const decoded = decodeEscapedText(rawUrl)
        .replace(/\\n/g, "")
        .replace(/\\r/g, "")
        .trim();

    if (!decoded) {
        return null;
    }

    try {
        const parsed = new URL(decoded);
        if (!["http:", "https:"].includes(parsed.protocol)) {
            return null;
        }
        const maybeGithubRaw = new URL(toGithubRawUrl(parsed));
        if (!isLikelyDataUrl(maybeGithubRaw)) {
            return null;
        }
        return maybeGithubRaw.toString();
    } catch {
        return null;
    }
}

function sanitizeDiscoveredDomain(rawDomain: string): string | null {
    const value = decodeEscapedText(rawDomain)
        .replace(/\\n/g, "")
        .replace(/\\r/g, "")
        .trim()
        .replace(/^\/+/, "")
        .replace(/[),.;]+$/g, "");
    if (!value) return null;

    const withScheme = value.startsWith("http://") || value.startsWith("https://")
        ? value
        : `https://${value}`;

    try {
        const parsed = new URL(withScheme);
        if (!["http:", "https:"].includes(parsed.protocol)) {
            return null;
        }
        if (!isLikelyDataUrl(parsed)) {
            return null;
        }
        return parsed.toString();
    } catch {
        return null;
    }
}

function sanitizeBaseOrigin(rawValue: string): string | null {
    const value = decodeEscapedText(rawValue).trim();
    if (!value) return null;

    let parsed: URL;
    try {
        if (value.startsWith("http://") || value.startsWith("https://")) {
            parsed = new URL(value);
        } else {
            parsed = new URL(`https://${value.replace(/^\/+/, "")}`);
        }
    } catch {
        return null;
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
        return null;
    }
    if (isBlockedHost(parsed.hostname)) {
        return null;
    }

    const pathname = parsed.pathname.toLowerCase();
    const extension = pathname.includes(".") ? pathname.split(".").pop() : "";
    if (extension && STATIC_FILE_EXTENSIONS.has(extension)) {
        return null;
    }

    return parsed.origin;
}

function extractDiscoveryUrlsFromPayload(
    payload: unknown,
    context?: { source?: string }
): string[] {
    const discovered = new Set<string>();
    const discoveredRelativeApiPaths = new Set<string>();
    const discoveredOrigins = new Set<string>();
    const visited = new Set<unknown>();

    const pushUrlsFromString = (value: string) => {
        const urls = extractUrlsFromText(value);
        for (const url of urls) {
            const origin = sanitizeBaseOrigin(url);
            if (origin) {
                discoveredOrigins.add(origin);
            }
            const sanitized = sanitizeDiscoveredUrl(url);
            if (sanitized) {
                discovered.add(sanitized);
            }
        }

        const domains = extractBareDomainsFromText(value);
        for (const domain of domains) {
            const origin = sanitizeBaseOrigin(domain);
            if (origin) {
                discoveredOrigins.add(origin);
            }

            const sanitizedDomainUrl = sanitizeDiscoveredDomain(domain);
            if (sanitizedDomainUrl) {
                discovered.add(sanitizedDomainUrl);
            }
        }

        const relativeApiPaths = extractRelativeApiPathsFromText(value);
        for (const relativeApiPath of relativeApiPaths) {
            discoveredRelativeApiPaths.add(relativeApiPath);
        }
    };

    const visit = (node: unknown, depth: number) => {
        if (node === null || node === undefined || depth > 6) {
            return;
        }

        if (typeof node === "string") {
            pushUrlsFromString(node);
            return;
        }

        if (typeof node !== "object") {
            return;
        }
        if (visited.has(node)) {
            return;
        }
        visited.add(node);

        if (Array.isArray(node)) {
            for (const item of node.slice(0, 200)) {
                visit(item, depth + 1);
            }
            return;
        }

        const record = node as Record<string, unknown>;
        for (const [key, value] of Object.entries(record)) {
            if (typeof value === "string") {
                const normalizedKey = normalizeKey(key);
                if (
                    normalizedKey.includes("url") ||
                    normalizedKey.includes("href") ||
                    normalizedKey.includes("api") ||
                    normalizedKey.includes("endpoint") ||
                    normalizedKey.includes("source") ||
                    normalizedKey === "html"
                ) {
                    pushUrlsFromString(value);
                }
            }
            visit(value, depth + 1);
        }
    };

    visit(payload, 0);

    if (context?.source && isHttpUrl(context.source)) {
        const sourceOrigin = sanitizeBaseOrigin(context.source);
        if (sourceOrigin) {
            discoveredOrigins.add(sourceOrigin);
        }
    }

    for (const relativeApiPath of discoveredRelativeApiPaths) {
        for (const origin of discoveredOrigins) {
            try {
                const joined = new URL(relativeApiPath, origin).toString();
                const sanitized = sanitizeDiscoveredUrl(joined);
                if (sanitized) {
                    discovered.add(sanitized);
                }
            } catch {
                continue;
            }
        }
    }

    return Array.from(discovered);
}

function getSourceType(source: string): ElectionResultSourceType {
    return isHttpUrl(source) ? "url" : "file";
}

export function parseSourceList(input: unknown): string[] {
    const values: string[] = [];

    if (Array.isArray(input)) {
        for (const item of input) {
            if (typeof item === "string") {
                values.push(item);
            }
        }
    } else if (typeof input === "string") {
        values.push(input);
    }

    const tokens = values
        .flatMap((value) => value.split(/[\n,;]/g))
        .map((token) => token.trim())
        .filter(Boolean);

    const unique = new Set<string>();
    for (const token of tokens) {
        unique.add(token);
    }
    return Array.from(unique);
}

export async function resolveRowsFromSources(
    sourcesInput: unknown,
    options: ResolveElectionRowsOptions = {}
): Promise<ResolveElectionRowsResult> {
    const maxDiscoveryDepth = Math.max(0, Number(options.maxDiscoveryDepth ?? 2));
    const maxSources = Math.max(1, Number(options.maxSources ?? 40));
    const maxRows = Math.max(1, Number(options.maxRows ?? 120000));

    const initialSources = parseSourceList(sourcesInput);
    const queue: Array<{ source: string; depth: number }> = initialSources.map((source) => ({
        source,
        depth: 0,
    }));
    const queued = new Set(initialSources);
    const visited = new Set<string>();
    const rows: Array<Record<string, unknown>> = [];
    const rowSignatures = new Set<string>();
    const pulls: ElectionResultPullTrace[] = [];

    while (queue.length > 0 && visited.size < maxSources && rows.length < maxRows) {
        const current = queue.shift();
        if (!current) break;

        const source = current.source.trim();
        if (!source || visited.has(source)) {
            continue;
        }

        visited.add(source);

        try {
            const { payload, sourceType } = await loadSourcePayload(source);
            const sourceRows = extractRowsFromPayload(payload);
            const discoveredUrls =
                current.depth < maxDiscoveryDepth
                    ? extractDiscoveryUrlsFromPayload(payload, { source })
                    : [];

            for (const row of sourceRows) {
                if (rows.length >= maxRows) break;
                const signature = buildRowSignature(row);
                if (!signature || rowSignatures.has(signature)) {
                    continue;
                }
                rowSignatures.add(signature);
                rows.push(row);
            }

            pulls.push({
                source,
                sourceType,
                depth: current.depth,
                rowCount: sourceRows.length,
                discoveredUrls: discoveredUrls.slice(0, 50),
            });

            if (current.depth < maxDiscoveryDepth) {
                for (const url of discoveredUrls) {
                    if (!queued.has(url) && !visited.has(url)) {
                        queue.push({ source: url, depth: current.depth + 1 });
                        queued.add(url);
                    }
                }
            }
        } catch (error) {
            pulls.push({
                source,
                sourceType: getSourceType(source),
                depth: current.depth,
                rowCount: 0,
                discoveredUrls: [],
                error: error instanceof Error ? error.message : "Unknown source resolution error",
            });
        }
    }

    const discoveredSources = Array.from(
        new Set(
            pulls.flatMap((pull) => pull.discoveredUrls)
        )
    );

    return {
        rows,
        pulls,
        visitedSources: Array.from(visited),
        discoveredSources,
    };
}

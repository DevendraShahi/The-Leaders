import "server-only";

import {
    getDistrictElectionProfileByName,
    type DistrictConstituencyResult,
} from "@/lib/district-election-data";
import {
    getFPTPCandidateDataset,
    type FPTPCandidate,
} from "@/lib/fptp-candidate-data";
import { getFPTPCandidateSlug } from "@/lib/candidate-slug";
import { districtMap } from "@/lib/district-mapping";
import type {
    DistrictFieldProvenance,
    DistrictPanelCandidate,
    DistrictVerifiedProfile,
} from "@/lib/types/district-profile-types";

const WIKIPEDIA_REST_BASE = "https://en.wikipedia.org/api/rest_v1";
const WIKIPEDIA_ACTION_BASE = "https://en.wikipedia.org/w/api.php";
const WIKIDATA_ENTITY_BASE = "https://www.wikidata.org/wiki/Special:EntityData";
const WIKIPEDIA_ELECTION_2022_URL =
    "https://en.wikipedia.org/wiki/2022_Nepalese_general_election";

const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const REQUEST_TIMEOUT_MS = 6500;
const TARGET_POPULATION_YEAR = 2021;
const DISTRICT_PROFILE_SCHEMA_VERSION = 2;

const profileCache = new Map<string, { expiresAt: number; data: DistrictVerifiedProfile | null }>();
const constituencyCache = new Map<
    string,
    { expiresAt: number; data: WikiConstituencyResult | null }
>();
let fptpDatasetPromise: ReturnType<typeof getFPTPCandidateDataset> | null = null;

const WIKIPEDIA_TITLE_ALIASES: Record<string, string[]> = {
    Dhanusa: ["Dhanusha"],
    Terhathum: ["Tehrathum"],
    "Nawalparasi West": ["Parasi", "Nawalparasi (West of Bardaghat Susta)"],
    "Eastern Rukum": ["Rukum East"],
    "Western Rukum": ["Rukum West"],
};

const CONSTITUENCY_PREFIX_ALIASES: Array<[string, string]> = [
    ["Dhanusa", "Dhanusha"],
    ["Tehrathum", "Terhathum"],
    ["Eastern Rukum", "Rukum East"],
    ["Western Rukum", "Rukum West"],
    ["Nawalparasi West", "Parasi"],
    ["Nawalpur", "Nawalparasi East"],
];

const ENGLISH_TO_FPTP_DISTRICT_OVERRIDES: Record<string, string> = {
    Dhanusa: "धनुषा",
    Tanahun: "तनहुँ",
    Nawalpur: "नवलपरासी (बर्दघाट सुस्ता पूर्व)",
    "Nawalparasi West": "नवलपरासी (बर्दघाट सुस्ता पश्चिम)",
    "Eastern Rukum": "रुकुम (पूर्वी भाग)",
    "Western Rukum": "रुकुम (पश्चिम भाग)",
    Okhaldhunga: "ओखलढुंगा",
    Kathmandu: "काठमाडौं",
    Syangja: "स्याङजा",
    Baglung: "बाग्लुङ",
    Rupandehi: "रूपन्देही",
    Kapilvastu: "कपिलबस्तु",
    Pyuthan: "प्यूठान",
    Kalikot: "कालिकोट",
    Dadeldhura: "डडेलधुरा",
};

type WikiSummaryPayload = {
    title?: string;
    type?: string;
    extract?: string;
    wikibase_item?: string;
    content_urls?: {
        desktop?: {
            page?: string;
        };
    };
};

type WikiSearchPayload = {
    query?: {
        search?: Array<{ title?: string }>;
    };
};

type WikiPagePropsPayload = {
    query?: {
        pages?: Record<
            string,
            {
                pageprops?: {
                    wikibase_item?: string;
                };
            }
        >;
    };
};

type WikiParsePayload = {
    parse?: {
        title?: string;
        text?: {
            "*": string;
        };
    };
};

type WikidataMetricValue = {
    value: number;
    observedAt?: string | null;
};

type WikidataMetrics = {
    population?: WikidataMetricValue;
    areaSqKm?: WikidataMetricValue;
    populationDensity?: WikidataMetricValue;
};

type WikipediaDistrictProfile = {
    title: string;
    extract: string;
    pageUrl: string;
    wikidataId?: string;
};

type QuantityStatement = {
    amount: number;
    unit?: string;
    observedAt?: string | null;
    rankScore: number;
};

type WikiCandidateRow = {
    candidate: string;
    party: string;
    votes: number;
};

type WikiConstituencyResult = {
    constituencyName: string;
    pageTitle: string;
    sourceUrl: string;
    winner: WikiCandidateRow;
    runnerUp: WikiCandidateRow;
    totalVotes?: number;
    validVotes?: number;
    electorate?: number;
};

function toOneDecimal(value: number): number {
    return Math.round(value * 10) / 10;
}

function normalizeKey(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function toWikipediaRestTitle(title: string): string {
    return encodeURIComponent(title.trim().replace(/\s+/g, "_"));
}

function asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

function rankToScore(rank: unknown): number {
    if (rank === "preferred") return 2;
    if (rank === "normal") return 1;
    return 0;
}

function parseWikidataTime(raw: unknown): string | null {
    if (typeof raw !== "string") return null;
    const cleaned = raw.replace(/^\+/, "").split("T")[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return null;
    return cleaned;
}

function parseObservedAtFromStatement(statement: Record<string, unknown>): string | null {
    const qualifiers = asRecord(statement.qualifiers);
    const p585 = asArray(qualifiers?.P585);
    const first = asRecord(p585[0]);
    const datavalue = asRecord(first?.datavalue);
    const value = asRecord(datavalue?.value);
    return parseWikidataTime(value?.time);
}

function convertAreaToSqKm(amount: number, unit?: string): number {
    if (!unit || unit === "1") return amount;
    if (unit.endsWith("/Q25343")) return amount / 1_000_000; // square metre -> km²
    return amount;
}

function extractQuantityStatement(statementUnknown: unknown): QuantityStatement | null {
    const statement = asRecord(statementUnknown);
    if (!statement) return null;

    const mainsnak = asRecord(statement.mainsnak);
    const datavalue = asRecord(mainsnak?.datavalue);
    const value = asRecord(datavalue?.value);
    const amountRaw = value?.amount;
    const unitRaw = value?.unit;

    const amount =
        typeof amountRaw === "number"
            ? amountRaw
            : typeof amountRaw === "string"
                ? Number(amountRaw)
                : Number.NaN;

    if (!Number.isFinite(amount)) return null;

    return {
        amount: Math.abs(amount),
        unit: typeof unitRaw === "string" ? unitRaw : undefined,
        observedAt: parseObservedAtFromStatement(statement),
        rankScore: rankToScore(statement.rank),
    };
}

function statementYear(value?: string | null): number {
    if (!value) return -1;
    const year = Number(value.slice(0, 4));
    return Number.isFinite(year) ? year : -1;
}

function pickBestPopulation(statements: QuantityStatement[]): QuantityStatement | null {
    if (statements.length === 0) return null;
    const withYear = statements.filter((item) => statementYear(item.observedAt) > 0);
    const exactYear = withYear.filter((item) => statementYear(item.observedAt) === TARGET_POPULATION_YEAR);
    const pool = exactYear.length > 0 ? exactYear : statements;

    return [...pool].sort((a, b) => {
        if (b.rankScore !== a.rankScore) return b.rankScore - a.rankScore;
        return statementYear(b.observedAt) - statementYear(a.observedAt);
    })[0] ?? null;
}

function pickBestGeneric(statements: QuantityStatement[]): QuantityStatement | null {
    if (statements.length === 0) return null;
    return [...statements].sort((a, b) => {
        if (b.rankScore !== a.rankScore) return b.rankScore - a.rankScore;
        return statementYear(b.observedAt) - statementYear(a.observedAt);
    })[0] ?? null;
}

async function fetchJsonWithTimeout<T>(
    url: string,
    revalidateSeconds = 60 * 60 * 6
): Promise<T | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: { accept: "application/json" },
            next: { revalidate: revalidateSeconds },
        });
        if (!response.ok) return null;
        return (await response.json()) as T;
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

function normalizeNepaliDistrictKey(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[()]/g, " ")
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .replace(/\s+/g, " ");
}

async function getFptpDatasetCached() {
    if (!fptpDatasetPromise) {
        fptpDatasetPromise = getFPTPCandidateDataset();
    }
    return fptpDatasetPromise;
}

function resolveFptpDistrictLabelByEnglish(
    districtName: string,
    availableDistricts: string[]
): string | null {
    const directLabel =
        ENGLISH_TO_FPTP_DISTRICT_OVERRIDES[districtName] ?? districtMap[districtName];
    if (directLabel && availableDistricts.includes(directLabel)) {
        return directLabel;
    }

    const districtByNormalized = new Map<string, string>();
    for (const district of availableDistricts) {
        districtByNormalized.set(normalizeNepaliDistrictKey(district), district);
    }

    if (directLabel) {
        const normalizedMatch = districtByNormalized.get(
            normalizeNepaliDistrictKey(directLabel)
        );
        if (normalizedMatch) return normalizedMatch;
    }

    return null;
}

async function getDistrictFptpCandidates(
    districtName: string
): Promise<DistrictPanelCandidate[]> {
    const dataset = await getFptpDatasetCached();
    const availableDistricts = Array.from(
        new Set(dataset.candidates.map((candidate) => candidate.district))
    );

    const targetDistrictLabel = resolveFptpDistrictLabelByEnglish(
        districtName,
        availableDistricts
    );
    if (!targetDistrictLabel) return [];

    const targetNormalized = normalizeNepaliDistrictKey(targetDistrictLabel);

    const candidates = dataset.candidates
        .filter(
            (candidate) =>
                normalizeNepaliDistrictKey(candidate.district) === targetNormalized
        )
        .sort((a, b) => {
            const aCon = a.constituency ?? 999;
            const bCon = b.constituency ?? 999;
            if (aCon !== bCon) return aCon - bCon;

            const party = (a.partyName || "").localeCompare(
                b.partyName || "",
                "ne"
            );
            if (party !== 0) return party;

            return (a.candidateName || "").localeCompare(
                b.candidateName || "",
                "ne"
            );
        });

    return candidates.map((candidate: FPTPCandidate) => ({
        candidateId: candidate.candidateId,
        sourceSerialNo: candidate.sourceSerialNo,
        candidateName: candidate.candidateName,
        gender: candidate.gender,
        partyName: candidate.partyName,
        symbolName: candidate.symbolName,
        district: candidate.district,
        constituency: candidate.constituency,
        constituencyDisplay: candidate.constituencyDisplay,
        totalVoteReceived: candidate.totalVoteReceived,
        age: candidate.age,
        education:
            candidate.details?.qualification &&
                candidate.details.qualification.trim() &&
                candidate.details.qualification.trim() !== "-"
                ? candidate.details.qualification.trim()
                : null,
        electionStatus: candidate.details?.electionStatus ?? null,
        rank: candidate.details?.rank ?? null,
        imageUrl: candidate.imageUrl,
        profileSlug: getFPTPCandidateSlug(candidate),
    }));
}

function buildDistrictTitleCandidates(districtName: string): string[] {
    const aliases = WIKIPEDIA_TITLE_ALIASES[districtName] ?? [];
    const bases = [districtName, ...aliases];
    const set = new Set<string>();

    for (const base of bases) {
        const clean = base.trim();
        if (!clean) continue;
        set.add(`${clean} District`);
        set.add(`${clean} District, Nepal`);
        set.add(`${clean}, Nepal`);
        set.add(clean);
    }

    return [...set];
}

async function fetchSummaryByTitle(title: string): Promise<WikipediaDistrictProfile | null> {
    const payload = await fetchJsonWithTimeout<WikiSummaryPayload>(
        `${WIKIPEDIA_REST_BASE}/page/summary/${toWikipediaRestTitle(title)}`
    );
    if (!payload || payload.type === "disambiguation" || !payload.extract) return null;

    return {
        title: payload.title || title,
        extract: payload.extract,
        pageUrl:
            payload.content_urls?.desktop?.page ||
            `https://en.wikipedia.org/wiki/${title.trim().replace(/\s+/g, "_")}`,
        wikidataId: payload.wikibase_item,
    };
}

async function fetchWikidataIdByTitle(title: string): Promise<string | null> {
    const payload = await fetchJsonWithTimeout<WikiPagePropsPayload>(
        `${WIKIPEDIA_ACTION_BASE}?action=query&format=json&redirects=1&prop=pageprops&ppprop=wikibase_item&titles=${encodeURIComponent(title)}`
    );
    const pages = payload?.query?.pages;
    if (!pages) return null;

    for (const page of Object.values(pages)) {
        const id = page.pageprops?.wikibase_item;
        if (typeof id === "string" && id) return id;
    }
    return null;
}

async function searchWikipediaTitles(query: string, limit = 6): Promise<string[]> {
    const payload = await fetchJsonWithTimeout<WikiSearchPayload>(
        `${WIKIPEDIA_ACTION_BASE}?action=query&format=json&list=search&srlimit=${limit}&srsearch=${encodeURIComponent(query)}`
    );

    return (payload?.query?.search ?? [])
        .map((item) => item.title)
        .filter((title): title is string => typeof title === "string" && Boolean(title));
}

async function fetchWikipediaDistrictProfile(districtName: string): Promise<WikipediaDistrictProfile | null> {
    const tried = new Set<string>();

    const candidates = buildDistrictTitleCandidates(districtName);
    for (const title of candidates) {
        tried.add(normalizeKey(title));
        const summary = await fetchSummaryByTitle(title);
        if (summary) {
            if (!summary.wikidataId) {
                summary.wikidataId = (await fetchWikidataIdByTitle(summary.title)) || undefined;
            }
            return summary;
        }
    }

    const searched = await searchWikipediaTitles(`${districtName} district Nepal`);
    for (const title of searched) {
        const key = normalizeKey(title);
        if (tried.has(key)) continue;
        const summary = await fetchSummaryByTitle(title);
        if (summary) {
            if (!summary.wikidataId) {
                summary.wikidataId = (await fetchWikidataIdByTitle(summary.title)) || undefined;
            }
            return summary;
        }
    }

    return null;
}

function readClaims(entity: Record<string, unknown>, propertyId: string): unknown[] {
    const claims = asRecord(entity.claims);
    return asArray(claims?.[propertyId]);
}

async function fetchWikidataMetrics(wikidataId: string): Promise<WikidataMetrics | null> {
    const payload = await fetchJsonWithTimeout<Record<string, unknown>>(
        `${WIKIDATA_ENTITY_BASE}/${wikidataId}.json`
    );
    if (!payload) return null;

    const entities = asRecord(payload.entities);
    const entity = asRecord(entities?.[wikidataId]);
    if (!entity) return null;

    const populationStatements = readClaims(entity, "P1082")
        .map(extractQuantityStatement)
        .filter((value): value is QuantityStatement => Boolean(value));
    const areaStatements = readClaims(entity, "P2046")
        .map(extractQuantityStatement)
        .filter((value): value is QuantityStatement => Boolean(value));
    const densityStatements = readClaims(entity, "P2054")
        .map(extractQuantityStatement)
        .filter((value): value is QuantityStatement => Boolean(value));

    const selectedPopulation = pickBestPopulation(populationStatements);
    const selectedArea = pickBestGeneric(areaStatements);
    const selectedDensity = pickBestGeneric(densityStatements);

    return {
        population: selectedPopulation
            ? { value: Math.round(selectedPopulation.amount), observedAt: selectedPopulation.observedAt ?? null }
            : undefined,
        areaSqKm: selectedArea
            ? { value: toOneDecimal(convertAreaToSqKm(selectedArea.amount, selectedArea.unit)), observedAt: selectedArea.observedAt ?? null }
            : undefined,
        populationDensity: selectedDensity
            ? { value: toOneDecimal(selectedDensity.amount), observedAt: selectedDensity.observedAt ?? null }
            : undefined,
    };
}

function decodeHtml(value: string): string {
    const named: Record<string, string> = {
        "&nbsp;": " ",
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": "\"",
        "&#39;": "'",
        "&ndash;": "-",
        "&mdash;": "-",
    };

    let output = value.replace(/&(nbsp|amp|lt|gt|quot|#39|ndash|mdash);/g, (entity) => named[entity] ?? entity);
    output = output.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    output = output.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
    return output;
}

function stripHtml(value: string): string {
    const cleaned = value
        .replace(/<sup[\s\S]*?<\/sup>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]+>/g, " ");

    return decodeHtml(cleaned).replace(/\s+/g, " ").trim();
}

function parseIntLike(value: string): number | null {
    const match = value.match(/\d{1,3}(?:,\d{3})+|\d{4,}/);
    if (!match) return null;
    const parsed = Number(match[0].replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
}

function getTableFromIndex(html: string, startIndex: number): string | null {
    const tableStart = html.indexOf("<table", startIndex);
    if (tableStart < 0) return null;

    const tableTagPattern = /<\/?table\b[^>]*>/gi;
    tableTagPattern.lastIndex = tableStart;

    let depth = 0;
    let endIndex = -1;
    let match: RegExpExecArray | null = null;

    while ((match = tableTagPattern.exec(html))) {
        if (match[0].startsWith("</")) depth -= 1;
        else depth += 1;

        if (depth === 0) {
            endIndex = tableTagPattern.lastIndex;
            break;
        }
    }

    if (endIndex < 0) {
        const fallbackEnd = html.indexOf("</table>", tableStart);
        if (fallbackEnd < 0) return null;
        return html.slice(tableStart, fallbackEnd + "</table>".length);
    }

    return html.slice(tableStart, endIndex);
}

function getCandidateRowsFromTable(tableHtml: string): {
    candidates: WikiCandidateRow[];
    totalVotes?: number;
    validVotes?: number;
} {
    const rows = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    const candidates: WikiCandidateRow[] = [];
    let totalVotes: number | undefined;
    let validVotes: number | undefined;

    for (const row of rows) {
        const cellMatches = [...row[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)];
        const cells = cellMatches.map((cell) => stripHtml(cell[1])).filter(Boolean);
        if (cells.length < 2) continue;

        const first = cells[0].toLowerCase();
        if (first.includes("candidate") && cells.join(" ").toLowerCase().includes("votes")) continue;

        if (first.startsWith("total")) {
            totalVotes = parseIntLike(cells[2] ?? cells[1] ?? "") ?? totalVotes;
            continue;
        }
        if (first.startsWith("valid")) {
            validVotes = parseIntLike(cells[1] ?? "") ?? validVotes;
            continue;
        }
        if (first.startsWith("majority")) continue;
        if (first.startsWith("registered")) continue;
        if (first.startsWith("turnout")) continue;

        const votes = parseIntLike(cells[2] ?? "") ?? parseIntLike(cells[1] ?? "");
        if (!votes) continue;

        const candidate = cells[0];
        const party = cells[1] ?? "Unknown";
        if (!candidate || candidate.toLowerCase() === "candidate") continue;

        candidates.push({ candidate, party, votes });
    }

    return { candidates, totalVotes, validVotes };
}

function parseElectorateFromHtml(html: string): number | undefined {
    const electorateMatch = html.match(
        /<th[^>]*>\s*Electorate\s*<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/i
    );
    if (!electorateMatch) return undefined;
    return parseIntLike(stripHtml(electorateMatch[1])) ?? undefined;
}

function parse2022ConstituencyResultFromHtml(
    html: string
): Omit<WikiConstituencyResult, "constituencyName" | "pageTitle" | "sourceUrl"> | null {
    const headingIndex =
        html.search(/id=["']2022_general_election["']/i) >= 0
            ? html.search(/id=["']2022_general_election["']/i)
            : html.search(/2022 general election/i);

    if (headingIndex < 0) return null;

    const tableHtml = getTableFromIndex(html, headingIndex);
    if (!tableHtml) return null;

    const { candidates, totalVotes, validVotes } = getCandidateRowsFromTable(tableHtml);
    if (candidates.length < 2) return null;

    const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
    const winner = sorted[0];
    const runnerUp = sorted[1];
    if (!winner || !runnerUp) return null;
    if (winner.votes <= runnerUp.votes) return null;

    const finalTotalVotes = totalVotes ?? validVotes;
    const electorate = parseElectorateFromHtml(html);

    if (finalTotalVotes && finalTotalVotes < winner.votes + runnerUp.votes) {
        return null;
    }

    return {
        winner,
        runnerUp,
        totalVotes: finalTotalVotes,
        validVotes: validVotes ?? finalTotalVotes,
        electorate,
    };
}

async function parseConstituencyPage(title: string): Promise<{ pageTitle: string; html: string } | null> {
    const payload = await fetchJsonWithTimeout<WikiParsePayload>(
        `${WIKIPEDIA_ACTION_BASE}?action=parse&format=json&redirects=1&prop=text&page=${encodeURIComponent(title)}`
    );

    const pageTitle = payload?.parse?.title;
    const html = payload?.parse?.text?.["*"];
    if (!pageTitle || !html) return null;
    return { pageTitle, html };
}

function buildConstituencyNameVariants(name: string): string[] {
    const trimmed = name.trim();
    const set = new Set<string>([trimmed]);

    for (const [from, to] of CONSTITUENCY_PREFIX_ALIASES) {
        if (trimmed.startsWith(from)) {
            set.add(trimmed.replace(from, to));
        }
    }

    return [...set];
}

function scoreCandidateTitle(rawName: string, title: string): number {
    const name = normalizeKey(rawName);
    const titleNorm = normalizeKey(title);
    const nameTokens = name.split(" ").filter(Boolean);
    const titleTokens = titleNorm.split(" ").filter(Boolean);

    let score = 0;
    if (titleNorm.includes("(constituency)")) score += 10;

    for (const token of nameTokens) {
        if (titleTokens.includes(token)) score += 2;
    }

    const numberToken = nameTokens.find((token) => /^\d+$/.test(token));
    if (numberToken && titleNorm.includes(` ${numberToken} `)) score += 4;

    return score;
}

async function resolveConstituencyPage(constituencyName: string): Promise<{ title: string; html: string } | null> {
    const variants = buildConstituencyNameVariants(constituencyName);

    for (const variant of variants) {
        const candidateTitle = `${variant} (constituency)`;
        const parsed = await parseConstituencyPage(candidateTitle);
        if (parsed) return { title: parsed.pageTitle, html: parsed.html };
    }

    const searched = await searchWikipediaTitles(`${constituencyName} constituency Nepal`, 8);
    const ranked = searched
        .map((title) => ({ title, score: scoreCandidateTitle(constituencyName, title) }))
        .sort((a, b) => b.score - a.score);

    for (const item of ranked) {
        if (item.score < 6) continue;
        const parsed = await parseConstituencyPage(item.title);
        if (parsed) return { title: parsed.pageTitle, html: parsed.html };
    }

    return null;
}

async function fetchConstituency2022Result(
    constituencyName: string
): Promise<WikiConstituencyResult | null> {
    const cacheKey = normalizeKey(constituencyName);
    const cached = constituencyCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    const resolved = await resolveConstituencyPage(constituencyName);
    if (!resolved) {
        constituencyCache.set(cacheKey, { data: null, expiresAt: Date.now() + CACHE_TTL_MS });
        return null;
    }

    const parsed = parse2022ConstituencyResultFromHtml(resolved.html);
    if (!parsed) {
        constituencyCache.set(cacheKey, { data: null, expiresAt: Date.now() + CACHE_TTL_MS });
        return null;
    }

    const result: WikiConstituencyResult = {
        constituencyName,
        pageTitle: resolved.title,
        sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(resolved.title.replace(/\s+/g, "_"))}`,
        ...parsed,
    };

    constituencyCache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;
}

async function enrichElectionRowsWithWikipedia(
    rows: DistrictConstituencyResult[]
): Promise<{ rows: DistrictConstituencyResult[]; verifiedCount: number; sourcePages: string[] }> {
    const wikiRows = await Promise.all(
        rows.map((row) => fetchConstituency2022Result(row.constituencyName))
    );

    let verifiedCount = 0;
    const sourcePages: string[] = [];

    const mergedRows = rows.map((row, index) => {
        const wiki = wikiRows[index];
        if (!wiki) return row;

        verifiedCount += 1;
        sourcePages.push(wiki.sourceUrl);

        const totalVotes = wiki.totalVotes ?? row.totalVotes;
        const validVotes = wiki.validVotes ?? wiki.totalVotes ?? row.validVotes;
        const turnoutPercent =
            wiki.electorate && wiki.electorate > 0
                ? toOneDecimal((totalVotes / wiki.electorate) * 100)
                : row.turnoutPercent;
        const winnerVoteShare =
            validVotes > 0 ? toOneDecimal((wiki.winner.votes / validVotes) * 100) : row.winnerVoteShare;

        return {
            ...row,
            winnerName: wiki.winner.candidate,
            winnerParty: wiki.winner.party,
            winnerVotes: wiki.winner.votes,
            runnerUpName: wiki.runnerUp.candidate,
            runnerUpParty: wiki.runnerUp.party,
            runnerUpVotes: wiki.runnerUp.votes,
            marginVotes: Math.abs(wiki.winner.votes - wiki.runnerUp.votes),
            totalVotes,
            validVotes,
            turnoutPercent,
            winnerVoteShare,
        };
    });

    return {
        rows: mergedRows,
        verifiedCount,
        sourcePages: [...new Set(sourcePages)],
    };
}

function summarize(rows: DistrictConstituencyResult[]) {
    const totalVotes = rows.reduce((sum, row) => sum + row.totalVotes, 0);
    const validVotes = rows.reduce((sum, row) => sum + row.validVotes, 0);
    const avgTurnoutPercent =
        rows.length > 0
            ? toOneDecimal(rows.reduce((sum, row) => sum + row.turnoutPercent, 0) / rows.length)
            : 0;
    const closestMarginVotes =
        rows.length > 0 ? Math.min(...rows.map((row) => row.marginVotes)) : 0;
    const widestMarginVotes =
        rows.length > 0 ? Math.max(...rows.map((row) => row.marginVotes)) : 0;

    const partyWinsCounter = new Map<string, number>();
    for (const row of rows) {
        partyWinsCounter.set(row.winnerParty, (partyWinsCounter.get(row.winnerParty) ?? 0) + 1);
    }

    const partyWins = [...partyWinsCounter.entries()]
        .map(([party, wins]) => ({ party, wins }))
        .sort((a, b) => b.wins - a.wins);

    return {
        constituencyCount: rows.length,
        avgTurnoutPercent,
        totalVotes,
        validVotes,
        closestMarginVotes,
        widestMarginVotes,
        partyWins,
    };
}

function source(
    label: string,
    sourceType: DistrictFieldProvenance["source"],
    opts?: Pick<DistrictFieldProvenance, "url" | "observedAt" | "note">
): DistrictFieldProvenance {
    return {
        source: sourceType,
        label,
        ...(opts?.url ? { url: opts.url } : {}),
        ...(opts?.observedAt !== undefined ? { observedAt: opts.observedAt } : {}),
        ...(opts?.note ? { note: opts.note } : {}),
    };
}

function normalizeLegacyLocalSourceLabel(label: string): string {
    return label
        .replace(/Local district profile dataset/gi, "The Leaders Findings")
        .replace(/Local district dataset/gi, "The Leaders Findings")
        .replace(/the leaders findings/gi, "The Leaders Findings");
}

function normalizeProfileSourceLabels(
    profile: DistrictVerifiedProfile | null
): DistrictVerifiedProfile | null {
    if (!profile) return profile;

    let changed = false;
    const normalizedSources: typeof profile.sources = { ...profile.sources };

    for (const [sourceKey, sourceMeta] of Object.entries(profile.sources)) {
        const normalizedLabel = normalizeLegacyLocalSourceLabel(sourceMeta.label);
        if (normalizedLabel === sourceMeta.label) continue;

        normalizedSources[sourceKey as keyof typeof normalizedSources] = {
            ...sourceMeta,
            label: normalizedLabel,
        };
        changed = true;
    }

    if (!changed) return profile;

    return {
        ...profile,
        sources: normalizedSources,
    };
}

function isPopulationSourceUpToDate(profile: DistrictVerifiedProfile | null): boolean {
    if (!profile) return true;
    const populationSource = profile.sources.population2021;
    if (!populationSource || populationSource.source !== "wikidata") return true;
    return statementYear(populationSource.observedAt) === TARGET_POPULATION_YEAR;
}

export async function getVerifiedDistrictProfile(
    districtName: string
): Promise<DistrictVerifiedProfile | null> {
    const cacheKey = `${normalizeKey(districtName)}::v${DISTRICT_PROFILE_SCHEMA_VERSION}`;
    const cached = profileCache.get(cacheKey);
    if (
        cached &&
        cached.expiresAt > Date.now() &&
        isPopulationSourceUpToDate(cached.data)
    ) {
        const normalizedCached = normalizeProfileSourceLabels(cached.data);
        if (normalizedCached !== cached.data) {
            profileCache.set(cacheKey, {
                data: normalizedCached,
                expiresAt: cached.expiresAt,
            });
        }
        return normalizedCached;
    }

    const localProfile = getDistrictElectionProfileByName(districtName);
    if (!localProfile) {
        profileCache.set(cacheKey, { data: null, expiresAt: Date.now() + CACHE_TTL_MS });
        return null;
    }

    const wikiProfile = await fetchWikipediaDistrictProfile(localProfile.districtName);
    const wikidataMetrics =
        wikiProfile?.wikidataId ? await fetchWikidataMetrics(wikiProfile.wikidataId) : null;

    const electionEnriched = await enrichElectionRowsWithWikipedia(
        localProfile.constituencyResults
    );
    const districtFptpCandidates = await getDistrictFptpCandidates(
        localProfile.districtName
    );

    const wikidataPopulationYear = statementYear(
        wikidataMetrics?.population?.observedAt
    );
    const wikidataDensityYear = statementYear(
        wikidataMetrics?.populationDensity?.observedAt
    );
    const has2021WikidataPopulation =
        Boolean(wikidataMetrics?.population) &&
        wikidataPopulationYear === TARGET_POPULATION_YEAR;
    const has2021WikidataDensity =
        Boolean(wikidataMetrics?.populationDensity) &&
        wikidataDensityYear === TARGET_POPULATION_YEAR;

    const resolvedPopulation = has2021WikidataPopulation
        ? (wikidataMetrics?.population?.value ?? localProfile.population2021)
        : localProfile.population2021;
    const resolvedArea = wikidataMetrics?.areaSqKm?.value ?? localProfile.areaSqKm;
    const derivedDensity =
        resolvedArea > 0
            ? toOneDecimal(resolvedPopulation / resolvedArea)
            : localProfile.populationDensity;
    const resolvedDensity = has2021WikidataDensity
        ? (wikidataMetrics?.populationDensity?.value ?? derivedDensity)
        : derivedDensity;

    const resolvedSummary = summarize(electionEnriched.rows);
    const electionSourceUrl =
        electionEnriched.sourcePages[0] ?? WIKIPEDIA_ELECTION_2022_URL;

    const mergedProfile: DistrictVerifiedProfile = {
        ...localProfile,
        description: wikiProfile?.extract ?? localProfile.description,
        population2021: resolvedPopulation,
        areaSqKm: resolvedArea,
        populationDensity: resolvedDensity,
        fptpCandidates: districtFptpCandidates,
        constituencyResults: electionEnriched.rows,
        summary: resolvedSummary,
        wikiSummary: wikiProfile
            ? {
                title: wikiProfile.title,
                pageUrl: wikiProfile.pageUrl,
                observedAt: wikidataMetrics?.population?.observedAt ?? null,
            }
            : undefined,
        sources: {
            description: wikiProfile
                ? source("Wikipedia summary", "wikipedia", { url: wikiProfile.pageUrl })
                : source("The Leaders Findings", "local"),
            electionData:
                electionEnriched.verifiedCount > 0
                    ? source("Wikipedia constituency election tables (2022)", "wikipedia", {
                        url: electionSourceUrl,
                        note: `${electionEnriched.verifiedCount}/${electionEnriched.rows.length} constituency results were verified from Wikipedia pages; remaining rows use local fallback.`,
                    })
                    : source("Local constituency election dataset", "local", {
                        note: "Wikipedia constituency verification unavailable for this district in this request.",
                    }),
            candidateData: source("ECN FPTP-2082 candidate dataset", "local", {
                note: `${districtFptpCandidates.length} district candidates loaded from the official Election Commission candidate file.`,
            }),
            population2021: wikidataMetrics?.population
                ? has2021WikidataPopulation
                    ? source("Wikidata (P1082, 2021 census)", "wikidata", {
                        url: wikiProfile?.pageUrl,
                        observedAt: wikidataMetrics.population.observedAt ?? null,
                    })
                    : source("The Leaders Findings (2021 census)", "local", {
                        note:
                            wikidataPopulationYear > 0
                                ? `Wikidata population is observed for ${wikidataPopulationYear}; using 2021 census value from local verified dataset.`
                                : "Wikidata population did not include an explicit census year; using 2021 census value from local verified dataset.",
                    })
                : source("The Leaders Findings (2021 census)", "local"),
            areaSqKm: wikidataMetrics?.areaSqKm
                ? source("Wikidata (P2046)", "wikidata", {
                    url: wikiProfile?.pageUrl,
                    observedAt: wikidataMetrics.areaSqKm.observedAt ?? null,
                })
                : source("The Leaders Findings", "local"),
            populationDensity: wikidataMetrics?.populationDensity
                ? has2021WikidataDensity
                    ? source("Wikidata (P2054, 2021 census)", "wikidata", {
                        url: wikiProfile?.pageUrl,
                        observedAt: wikidataMetrics.populationDensity.observedAt ?? null,
                    })
                    : source("Derived from resolved 2021 population and district area", "local", {
                        note:
                            wikidataDensityYear > 0
                                ? `Wikidata density is observed for ${wikidataDensityYear}; showing derived density based on 2021 population baseline.`
                                : "Wikidata density did not include an explicit census year; showing derived density based on 2021 population baseline.",
                    })
                : source("Derived from resolved 2021 population and district area", "local"),
            literacyRatePercent: source("The Leaders Findings", "local", {
                note: "Wikipedia/Wikidata does not expose complete district literacy rates for all districts.",
            }),
            sexRatio: source("The Leaders Findings", "local", {
                note: "Wikipedia/Wikidata does not expose a consistent district sex-ratio field.",
            }),
            annualGrowthRatePercent: source("The Leaders Findings", "local", {
                note: "Derived from district census records in the local dataset.",
            }),
        },
        verifiedAt: new Date().toISOString(),
        notes: [
            wikidataMetrics
                ? "Demographics are verified from Wikidata where available."
                : "Wikidata enrichment was unavailable; local demographic values are shown.",
            electionEnriched.verifiedCount > 0
                ? `Election results were verified from Wikipedia constituency pages for ${electionEnriched.verifiedCount} constituency records.`
                : "Election results are currently served from local structured constituency data.",
            districtFptpCandidates.length > 0
                ? `Loaded ${districtFptpCandidates.length} district candidates from ECN FPTP-2082 dataset.`
                : "No district candidates were found in the FPTP-2082 dataset for this district mapping.",
        ],
    };

    const normalizedMergedProfile = normalizeProfileSourceLabels(mergedProfile);
    profileCache.set(cacheKey, {
        data: normalizedMergedProfile,
        expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return normalizedMergedProfile;
}

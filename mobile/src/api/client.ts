import { z } from "zod";
import Constants from "expo-constants";

const envelopeSchema = z.object({
    success: z.boolean(),
    data: z.unknown().optional(),
    error: z.string().optional(),
});

const LOCAL_API_PORT = 3000;
const REQUEST_TIMEOUT_MS = 15_000;

function trimTrailingSlash(value: string) {
    return value.replace(/\/+$/, "");
}

function hostnameFromUri(value: string | null | undefined) {
    if (!value) return null;

    try {
        const url = new URL(value.includes("://") ? value : `http://${value}`);
        return url.hostname || null;
    } catch {
        return null;
    }
}

export function apiBase() {
    const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
    if (configuredUrl) return trimTrailingSlash(configuredUrl);

    if (__DEV__) {
        const developmentHost = hostnameFromUri(
            Constants.expoConfig?.hostUri || Constants.linkingUri
        );
        if (developmentHost) return `http://${developmentHost}:${LOCAL_API_PORT}`;
    }

    return `http://localhost:${LOCAL_API_PORT}`;
}

export async function apiGet<T>(path: string): Promise<T> {
    let response: Response;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        response = await fetch(`${apiBase()}${path}`, { signal: controller.signal });
    } catch {
        throw new Error(
            __DEV__
                ? "Could not reach The Leaders server. Start the website server and keep this device on the same network, then try again."
                : "Could not reach The Leaders. Check your internet connection and try again."
        );
    } finally {
        clearTimeout(timeout);
    }

    let json: unknown;
    try {
        json = await response.json();
    } catch {
        throw new Error("The Leaders server returned an invalid response. Please try again.");
    }

    const parsed = envelopeSchema.safeParse(json);
    if (!parsed.success) {
        throw new Error("The Leaders server returned an invalid response. Please try again.");
    }

    const body = parsed.data;
    if (!response.ok || !body.success || body.data === undefined) {
        throw new Error(body.error || "Request failed");
    }
    return body.data as T;
}

export type Bilingual = { en: string; ne: string };

export type ArticleCard = {
    slug: string;
    source: "article" | "column" | "analysis";
    title: Bilingual;
    excerpt: Bilingual;
    author: Bilingual;
    category: Bilingual;
    image: string;
    publishedAt: string;
    tags: string[];
};

export type ArticleDetail = ArticleCard & { content: Bilingual };

export type BriefCard = {
    slug: string;
    title: Bilingual;
    summary: Bilingual;
    image: string;
    date: string;
    tags: string[];
};

export type BriefDetail = BriefCard & { content: Bilingual };

export type FactCard = {
    slug: string;
    claim: Bilingual;
    claimBy: Bilingual;
    verdict: "true" | "false" | "misleading" | "unverified";
    image: string;
    date: string;
};

export type FactDetail = FactCard & { analysis: Bilingual; sources: string[] };

export type LeaderCard = {
    slug: string;
    name: Bilingual;
    desc: Bilingual;
    party: Bilingual;
    position: Bilingual;
    years: Bilingual;
    image: string;
    cover: string;
    isActive: boolean;
};

export type LeaderDetail = LeaderCard & {
    bio: Bilingual;
    stats: { key: string; value: Bilingual }[];
    timeline: { year: string; event: Bilingual }[];
};

export type HistoryEpisode = {
    id: string;
    eraId: string;
    title: Bilingual;
    description: Bilingual;
    year: string;
    image: string;
};

export type HistoryEra = {
    id: string;
    title: Bilingual;
    description: Bilingual;
    period: Bilingual;
    episodes: HistoryEpisode[];
};

export type Page<T> = {
    items: T[];
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
};

export type HomePayload = {
    countdown: { electionDate: string; label: Bilingual };
    leadBrief: BriefCard | null;
    ticker: { scope: "today" | "latest"; items: { slug: string; title: Bilingual; date: string }[] };
    factChecks: FactCard[];
    articles: ArticleCard[];
    coverage: ArticleCard[];
};

export type SnapshotPayload = {
    electionDate: string;
    cycleLabel: Bilingual;
    stats: { id: string; label: Bilingual; value: Bilingual; hint: Bilingual; source: Bilingual }[];
    seats: { party: string; partySlug: string; seats: number; fptpSeats: number; prSeats: number; voteShare: number }[];
};

export type CandidateCard = {
    slug: string;
    name: string;
    party: string;
    district: string;
    constituency: string;
    province: string;
    gender: string;
    image: string;
    age: number | null;
};

export type CandidatePage = Page<CandidateCard> & {
    parties: string[];
    districts: string[];
};

export type PartyCard = {
    id: string;
    name: Bilingual;
    shortName: string;
    leader: string;
    symbol: string;
    logo: string;
    status: string;
    ideology: string;
    seats: number;
};

export type ManifestoCard = {
    slug: string;
    partyName: Bilingual;
    partyShort: string;
    blurb: Bilingual;
    year: string;
    fileUrl: string;
    fileSizeLabel: string;
};

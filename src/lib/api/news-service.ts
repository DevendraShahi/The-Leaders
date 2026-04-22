"use server";

import { DistrictNews, TrendingTopic } from "../analytics-data";

const API_KEY = process.env.NEWSDATAIO_API;
const X_BEARER_TOKEN = process.env.X_BEARER_TOKEN;
const NEWSDATA_BASE_URL = "https://newsdata.io/api/1/news";
const X_SEARCH_BASE_URL = "https://api.x.com/2/tweets/search/recent";
const REQUEST_TIMEOUT_MS = 7000;

interface NewsDataResponse {
    status: string;
    totalResults: number;
    results: Array<{
        article_id: string;
        title: string;
        link: string;
        description: string;
        pubDate: string;
        source_id: string;
        source_priority: number;
        image_url?: string;
        category?: string[];
    }>;
}

interface XApiRecentSearchResponse {
    data?: Array<{
        id: string;
        text: string;
        created_at?: string;
        author_id?: string;
        public_metrics?: {
            retweet_count?: number;
            reply_count?: number;
            like_count?: number;
            quote_count?: number;
            impression_count?: number;
        };
    }>;
    includes?: {
        users?: Array<{
            id: string;
            name?: string;
            username?: string;
            verified?: boolean;
        }>;
    };
}

type ExternalSignal = {
    title: string;
    description: string;
    url: string;
    source: string;
    abbr: string;
    publishedAt?: string;
    categories: string[];
    platform: "news" | "x";
    verified: boolean;
    engagement?: number;
};

type TrendTheme = {
    id: string;
    topicEn: string;
    topicNe: string;
    categoryEn: string;
    summaryEn: string;
    summaryNe: string;
    keywords: string[];
    tags: string[];
};

type TopicReference = NonNullable<TrendingTopic["references"]>[number];

type TrendBucket = {
    theme: TrendTheme;
    mentions: number;
    recentHits: number;
    olderHits: number;
    sourceSet: Set<string>;
    references: Map<string, TopicReference>;
    latestTimestamp: number;
    tags: Set<string>;
    verifiedHits: number;
};

const VERIFIED_RSS_FEEDS: Array<{ source: string; abbr: string; url: string }> = [
    { source: "Kathmandu Post", abbr: "KP", url: "https://kathmandupost.com/rss" },
    { source: "OnlineKhabar", abbr: "OK", url: "https://english.onlinekhabar.com/feed" },
    { source: "The Himalayan Times", abbr: "THT", url: "https://thehimalayantimes.com/feed" },
    { source: "MyRepublica", abbr: "MR", url: "https://myrepublica.nagariknetwork.com/rss" },
    { source: "Nepali Times", abbr: "NT", url: "https://www.nepalitimes.com/feed/" },
];

const TREND_THEMES: TrendTheme[] = [
    {
        id: "governance-reform",
        topicEn: "Public Service Delivery Reform",
        topicNe: "सार्वजनिक सेवा सुधार",
        categoryEn: "Governance",
        summaryEn:
            "Coverage focuses on faster local services, digital public systems, and accountability outcomes.",
        summaryNe:
            "समाचारमा द्रुत सेवा प्रवाह, डिजिटल सार्वजनिक सेवा र उत्तरदायित्वका मुद्दा उच्च प्राथमिकतामा छन्।",
        keywords: [
            "service delivery",
            "public service",
            "governance",
            "accountability",
            "bureaucracy",
            "प्रशासन",
            "सेवा प्रवाह",
            "सुशासन",
        ],
        tags: ["service standards", "governance", "local accountability"],
    },
    {
        id: "jobs-migration",
        topicEn: "Youth Employment and Migration",
        topicNe: "युवा रोजगारी र बसाइँसराइ",
        categoryEn: "Economy",
        summaryEn:
            "Jobs, skills, and migration pressure remain one of the strongest election narratives.",
        summaryNe:
            "रोजगारी, सीप विकास र विदेश बसाइँसराइको दबाब निर्वाचन बहसको मुख्य विषय बनेको छ।",
        keywords: [
            "employment",
            "job",
            "youth",
            "migration",
            "labour",
            "labor",
            "रोजगार",
            "युवा",
            "बसाइँसराइ",
            "वैदेशिक रोजगारी",
        ],
        tags: ["jobs", "skills", "migration"],
    },
    {
        id: "inflation-cost",
        topicEn: "Inflation and Household Costs",
        topicNe: "महँगी र घरखर्च",
        categoryEn: "Economy",
        summaryEn:
            "Price pressure and household affordability concerns are visibly shaping campaign messaging.",
        summaryNe:
            "महँगी र दैनिक घरखर्च बढेको चिन्ताले चुनावी एजेन्डामा प्रत्यक्ष प्रभाव पारेको देखिन्छ।",
        keywords: [
            "inflation",
            "cost of living",
            "prices",
            "household",
            "affordability",
            "महँगी",
            "मूल्यवृद्धि",
            "घरखर्च",
        ],
        tags: ["inflation", "cost of living", "household"],
    },
    {
        id: "anti-corruption",
        topicEn: "Corruption and Procurement Oversight",
        topicNe: "भ्रष्टाचार र खरिद पारदर्शिता",
        categoryEn: "Governance",
        summaryEn:
            "Corruption allegations and public procurement scrutiny are sustaining high public attention.",
        summaryNe:
            "भ्रष्टाचार र सार्वजनिक खरिद प्रक्रियाको पारदर्शिताबारे बहस निरन्तर चर्चामा छ।",
        keywords: [
            "corruption",
            "procurement",
            "transparency",
            "oversight",
            "abuse of authority",
            "भ्रष्टाचार",
            "अनियमितता",
            "पारदर्शिता",
        ],
        tags: ["anti-corruption", "procurement", "transparency"],
    },
    {
        id: "federalism",
        topicEn: "Federalism and Coordination",
        topicNe: "संघीयता र समन्वय",
        categoryEn: "State Structure",
        summaryEn:
            "Debate continues around federal-provincial-local role clarity and implementation performance.",
        summaryNe:
            "संघ, प्रदेश र स्थानीय तहबीच जिम्मेवारी र कार्यान्वयन समन्वय निरन्तर बहसको विषय बनेको छ।",
        keywords: [
            "federalism",
            "province",
            "local level",
            "devolution",
            "coordination",
            "संघीयता",
            "प्रदेश",
            "स्थानीय तह",
            "समन्वय",
        ],
        tags: ["federalism", "devolution", "coordination"],
    },
    {
        id: "education",
        topicEn: "Education Quality and Teacher Accountability",
        topicNe: "शिक्षा गुणस्तर र शिक्षक जिम्मेवारी",
        categoryEn: "Education",
        summaryEn:
            "Education discourse emphasizes classroom outcomes, teacher presence, and curriculum relevance.",
        summaryNe:
            "शिक्षामा कक्षाकोठा नतिजा, शिक्षक उपस्थिती र पाठ्यक्रमको उपयोगितामाथि जोड बढेको छ।",
        keywords: [
            "education",
            "school",
            "teacher",
            "curriculum",
            "student",
            "शिक्षा",
            "विद्यालय",
            "शिक्षक",
            "पाठ्यक्रम",
        ],
        tags: ["education", "teachers", "curriculum"],
    },
    {
        id: "health",
        topicEn: "Health Access and Insurance Reach",
        topicNe: "स्वास्थ्य पहुँच र बीमा",
        categoryEn: "Health",
        summaryEn:
            "Access to quality primary healthcare and insurance delivery gaps remain in active policy discussion.",
        summaryNe:
            "गुणस्तरीय प्राथमिक स्वास्थ्य सेवा र स्वास्थ्य बीमाको पहुँचबारे बहस निरन्तर अगाडि बढिरहेको छ।",
        keywords: [
            "health",
            "hospital",
            "insurance",
            "clinic",
            "medical",
            "स्वास्थ्य",
            "अस्पताल",
            "बीमा",
            "उपचार",
        ],
        tags: ["healthcare", "insurance", "primary care"],
    },
    {
        id: "infrastructure",
        topicEn: "Urban Mobility and Road Safety",
        topicNe: "सहरी यातायात र सडक सुरक्षा",
        categoryEn: "Infrastructure",
        summaryEn:
            "Transport reliability, traffic congestion, and road safety incidents are climbing in prominence.",
        summaryNe:
            "यातायात व्यवस्थापन, ट्राफिक जाम र सडक सुरक्षा सम्बन्धी मुद्दा शहरमा तीव्र रूपमा उठिरहेका छन्।",
        keywords: [
            "road",
            "transport",
            "traffic",
            "mobility",
            "infrastructure",
            "सडक",
            "यातायात",
            "ट्राफिक",
            "पूर्वाधार",
        ],
        tags: ["transport", "road safety", "infrastructure"],
    },
    {
        id: "agriculture",
        topicEn: "Agriculture Support and Market Access",
        topicNe: "कृषि सहयोग र बजार पहुँच",
        categoryEn: "Agriculture",
        summaryEn:
            "Input costs, irrigation reliability, and market linkages remain persistent rural campaign themes.",
        summaryNe:
            "कृषि लागत, सिँचाइ सुविधा र बजार पहुँच ग्रामीण निर्वाचन एजेन्डामा स्थायी मुद्दा बनेका छन्।",
        keywords: [
            "agriculture",
            "farmer",
            "fertilizer",
            "irrigation",
            "crop",
            "कृषि",
            "किसान",
            "मल",
            "सिँचाइ",
            "बाली",
        ],
        tags: ["agriculture", "irrigation", "market access"],
    },
];

const FALLBACK_THEME: TrendTheme = {
    id: "general-election",
    topicEn: "Election Campaign Momentum",
    topicNe: "निर्वाचन अभियानको गति",
    categoryEn: "Campaign",
    summaryEn:
        "General election campaign momentum remains elevated across mainstream coverage.",
    summaryNe:
        "मुख्यधाराका स्रोतहरूमा समग्र निर्वाचन अभियानको सक्रियता उच्च नै देखिएको छ।",
    keywords: [],
    tags: ["campaign", "election desk"],
};

function normalizeText(value: string): string {
    return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function buildSourceAbbr(source: string): string {
    const letters = source
        .replace(/[^A-Za-z\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 4);
    return letters || "SRC";
}

function stripCdata(value: string): string {
    return value
        .replace(/^<!\[CDATA\[/, "")
        .replace(/\]\]>$/, "");
}

function decodeXmlEntities(value: string): string {
    return value
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function stripHtml(value: string): string {
    return value.replace(/<[^>]+>/g, " ");
}

function sanitizeText(value: string): string {
    return decodeXmlEntities(stripHtml(stripCdata(value))).replace(/\s+/g, " ").trim();
}

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractTagValue(block: string, tag: string): string | undefined {
    const pattern = new RegExp(
        `<${escapeRegex(tag)}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapeRegex(tag)}>`,
        "i"
    );
    const matched = block.match(pattern);
    if (!matched?.[1]) return undefined;
    return sanitizeText(matched[1]);
}

function extractAnyTagValue(block: string, tags: string[]): string | undefined {
    for (const tag of tags) {
        const value = extractTagValue(block, tag);
        if (value) return value;
    }
    return undefined;
}

function extractAtomLink(block: string): string | undefined {
    const hrefMatch = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
    if (hrefMatch?.[1]) return hrefMatch[1].trim();
    const value = extractTagValue(block, "link");
    return value?.trim();
}

function parseXmlFeed(xml: string, source: string, abbr: string): ExternalSignal[] {
    const signals: ExternalSignal[] = [];
    const itemBlocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];

    for (const block of itemBlocks) {
        const title = extractTagValue(block, "title");
        const url = extractTagValue(block, "link");
        if (!title || !url) continue;

        const description = extractAnyTagValue(block, ["description", "content:encoded"]) ?? "";
        const publishedAt = extractAnyTagValue(block, ["pubDate", "dc:date"]);
        const category = extractTagValue(block, "category");

        signals.push({
            title,
            description,
            url,
            source,
            abbr,
            publishedAt,
            categories: category ? [category] : [],
            platform: "news",
            verified: true,
        });
    }

    if (signals.length > 0) return signals;

    const entryBlocks = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
    for (const block of entryBlocks) {
        const title = extractTagValue(block, "title");
        const url = extractAtomLink(block);
        if (!title || !url) continue;

        const description = extractAnyTagValue(block, ["summary", "content"]) ?? "";
        const publishedAt = extractAnyTagValue(block, ["published", "updated"]);
        const categoryTerm =
            block.match(/<category[^>]*term=["']([^"']+)["'][^>]*\/?>/i)?.[1] ?? "";

        signals.push({
            title,
            description,
            url,
            source,
            abbr,
            publishedAt,
            categories: categoryTerm ? [sanitizeText(categoryTerm)] : [],
            platform: "news",
            verified: true,
        });
    }

    return signals;
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        return await fetch(url, {
            ...init,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timer);
    }
}

function classifyTrendTheme(text: string): TrendTheme {
    const normalized = normalizeText(text);
    for (const theme of TREND_THEMES) {
        if (theme.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))) {
            return theme;
        }
    }
    return FALLBACK_THEME;
}

function toChangePercent(recentHits: number, olderHits: number): number {
    const baseline = olderHits > 0 ? olderHits : Math.max(1, Math.round(recentHits * 0.8));
    return Number((((recentHits - baseline) / baseline) * 100).toFixed(1));
}

async function fetchNewsDataSignals(): Promise<ExternalSignal[]> {
    if (!API_KEY || API_KEY === "your_api_key_here") return [];

    try {
        const query = encodeURIComponent(
            "Nepal election OR नेपाल निर्वाचन OR election campaign OR political parties Nepal"
        );
        const response = await fetchWithTimeout(
            `${NEWSDATA_BASE_URL}?apikey=${API_KEY}&q=${query}&country=np&language=en,ne&size=50`,
            { next: { revalidate: 3600, tags: ['news-feed'] } }
        );
        if (!response.ok) return [];

        const data: NewsDataResponse = await response.json();
        const rows = data.results ?? [];

        return rows
            .filter((row) => row.title && row.link)
            .map((row) => {
                const source = row.source_id ? sanitizeText(row.source_id) : "NewsData";
                return {
                    title: sanitizeText(row.title),
                    description: sanitizeText(row.description ?? ""),
                    url: row.link,
                    source,
                    abbr: buildSourceAbbr(source),
                    publishedAt: row.pubDate,
                    categories: row.category ?? [],
                    platform: "news" as const,
                    verified: true,
                };
            });
    } catch {
        return [];
    }
}

async function fetchRssSignals(): Promise<ExternalSignal[]> {
    const settled = await Promise.allSettled(
        VERIFIED_RSS_FEEDS.map(async (feed) => {
            const response = await fetchWithTimeout(feed.url, {
                next: { revalidate: 3600, tags: ['news-feed'] },
                headers: {
                    "User-Agent": "TheLeadersBot/1.0 (+https://the-leadersnp.com)",
                    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
                },
            });
            if (!response.ok) return [] as ExternalSignal[];
            const xml = await response.text();
            return parseXmlFeed(xml, feed.source, feed.abbr);
        })
    );

    return settled.flatMap((result) =>
        result.status === "fulfilled" ? result.value : []
    );
}

async function fetchXSignals(): Promise<ExternalSignal[]> {
    if (!X_BEARER_TOKEN) return [];

    try {
        const query = encodeURIComponent(
            "(Nepal election OR नेपाल निर्वाचन OR Nepal politics OR संघीयता) -is:retweet"
        );
        const url = `${X_SEARCH_BASE_URL}?query=${query}&max_results=35&tweet.fields=created_at,author_id,public_metrics,lang&expansions=author_id&user.fields=username,name,verified`;
        const response = await fetchWithTimeout(url, {
            headers: {
                Authorization: `Bearer ${X_BEARER_TOKEN}`,
            },
            next: { revalidate: 3600, tags: ['news-feed'] },
        });
        if (!response.ok) return [];

        const payload: XApiRecentSearchResponse = await response.json();
        const tweets = payload.data ?? [];
        const users = new Map((payload.includes?.users ?? []).map((user) => [user.id, user]));

        return tweets
            .filter((tweet) => tweet.id && tweet.text)
            .map((tweet) => {
                const user = tweet.author_id ? users.get(tweet.author_id) : undefined;
                const username = user?.username || "x";
                const source = user?.name || `X @${username}`;
                const metrics = tweet.public_metrics;
                const engagement =
                    (metrics?.retweet_count ?? 0) +
                    (metrics?.reply_count ?? 0) +
                    (metrics?.like_count ?? 0) +
                    (metrics?.quote_count ?? 0);

                return {
                    title: sanitizeText(tweet.text),
                    description: "",
                    url: `https://x.com/${username}/status/${tweet.id}`,
                    source,
                    abbr: "X",
                    publishedAt: tweet.created_at,
                    categories: [],
                    platform: "x" as const,
                    verified: Boolean(user?.verified),
                    engagement,
                };
            });
    } catch {
        return [];
    }
}

function dedupeSignals(signals: ExternalSignal[]): ExternalSignal[] {
    const byUrl = new Map<string, ExternalSignal>();
    for (const signal of signals) {
        const key = signal.url.trim();
        if (!key) continue;
        if (!byUrl.has(key)) {
            byUrl.set(key, signal);
            continue;
        }
        const existing = byUrl.get(key)!;
        if ((signal.publishedAt ?? "") > (existing.publishedAt ?? "")) {
            byUrl.set(key, signal);
        }
    }
    return [...byUrl.values()];
}

function buildMomentumScore(input: {
    mentions: number;
    sourceCount: number;
    recentHits: number;
    changePercent: number;
    verification: TrendingTopic["verification"];
}): number {
    const volumeFactor = Math.min(32, input.mentions / 950);
    const sourceFactor = Math.min(22, input.sourceCount * 2.4);
    const recencyFactor = Math.min(22, input.recentHits * 3.2);
    const changeFactor = Math.max(-12, Math.min(18, input.changePercent * 0.5));
    const verificationFactor =
        input.verification === "verified"
            ? 12
            : input.verification === "partial"
              ? 6
              : 0;

    return Math.max(
        35,
        Math.min(
            99,
            Math.round(24 + volumeFactor + sourceFactor + recencyFactor + changeFactor + verificationFactor)
        )
    );
}

export async function fetchDistrictNews(district: string): Promise<DistrictNews> {
    if (!API_KEY || API_KEY === "your_api_key_here") {
        console.warn("NewsData API key missing, using mock data");
        return getMockDistrictNews(district);
    }

    try {
        const query = encodeURIComponent(`${district} election Nepal`);
        const response = await fetchWithTimeout(
            `${NEWSDATA_BASE_URL}?apikey=${API_KEY}&q=${query}&country=np&language=en,ne`,
            { next: { revalidate: 3600 } }
        );
        if (!response.ok) throw new Error("News API failed");

        const data: NewsDataResponse = await response.json();
        if (!data.results || data.results.length === 0) {
            return getMockDistrictNews(district);
        }

        return {
            districtName: district,
            recentDevelopments: data.results.slice(0, 3).map((article) => ({
                id: article.article_id,
                date: new Date(article.pubDate).toLocaleDateString(),
                title: article.title,
                impact: "Neutral",
            })),
            keyCandidates: [],
            upcomingEvents: [],
        };
    } catch (error) {
        console.error("Error fetching district news:", error);
        return getMockDistrictNews(district);
    }
}

export async function fetchTrendingTopics(): Promise<TrendingTopic[]> {
    const [newsDataSignals, rssSignals, xSignals] = await Promise.all([
        fetchNewsDataSignals(),
        fetchRssSignals(),
        fetchXSignals(),
    ]);

    const combinedSignals = dedupeSignals([...newsDataSignals, ...rssSignals, ...xSignals]);
    if (combinedSignals.length === 0) return [];

    const now = Date.now();
    const buckets = new Map<string, TrendBucket>();

    for (const signal of combinedSignals) {
        const theme = classifyTrendTheme(`${signal.title} ${signal.description}`);
        const existing =
            buckets.get(theme.id) ??
            {
                theme,
                mentions: 0,
                recentHits: 0,
                olderHits: 0,
                sourceSet: new Set<string>(),
                references: new Map<string, TopicReference>(),
                latestTimestamp: 0,
                tags: new Set<string>(theme.tags),
                verifiedHits: 0,
            };

        const parsedPublished = Date.parse(signal.publishedAt ?? "");
        const timestamp = Number.isNaN(parsedPublished) ? now : parsedPublished;
        const ageHours = Math.max(0, (now - timestamp) / (1000 * 60 * 60));
        const recencyWeight = Math.max(1, 8 - Math.floor(ageHours / 24));
        const sourceWeight = signal.platform === "x" ? 0.82 : 1.18;
        const verifiedWeight = signal.verified ? 1.15 : 1;
        const engagementWeight =
            signal.platform === "x" && signal.engagement
                ? Math.min(1.7, 1 + signal.engagement / 1600)
                : 1;
        const mentionGain = Math.round((350 + recencyWeight * 78) * sourceWeight * verifiedWeight * engagementWeight);

        existing.mentions += mentionGain;
        if (ageHours <= 72) {
            existing.recentHits += 1;
        } else {
            existing.olderHits += 1;
        }

        existing.sourceSet.add(signal.source);
        if (signal.verified) existing.verifiedHits += 1;

        for (const category of signal.categories) {
            const cleaned = normalizeText(category);
            if (cleaned) existing.tags.add(cleaned.slice(0, 26));
        }

        existing.references.set(signal.url, {
            abbr: signal.abbr,
            source: signal.source,
            url: signal.url,
            title: signal.title,
            publishedAt: signal.publishedAt,
            platform: signal.platform,
            verified: signal.verified,
        });
        existing.latestTimestamp = Math.max(existing.latestTimestamp, timestamp);
        buckets.set(theme.id, existing);
    }

    return [...buckets.values()]
        .map((bucket) => {
            const changePercent = toChangePercent(bucket.recentHits, bucket.olderHits);
            const trend: TrendingTopic["trend"] =
                changePercent > 6 ? "up" : changePercent < -6 ? "down" : "stable";
            const sourceCount = bucket.sourceSet.size;
            const verification: TrendingTopic["verification"] =
                bucket.verifiedHits >= 3 && sourceCount >= 2
                    ? "verified"
                    : bucket.verifiedHits >= 1 || sourceCount >= 2
                      ? "partial"
                      : "fallback";
            const momentumScore = buildMomentumScore({
                mentions: bucket.mentions,
                sourceCount,
                recentHits: bucket.recentHits,
                changePercent,
                verification,
            });

            const references = [...bucket.references.values()]
                .sort((a, b) => {
                    const left = Date.parse(a.publishedAt ?? "") || 0;
                    const right = Date.parse(b.publishedAt ?? "") || 0;
                    return right - left;
                })
                .slice(0, 5);

            return {
                topic: bucket.theme.topicEn,
                topicNe: bucket.theme.topicNe,
                mentions: Math.round(bucket.mentions),
                trend,
                changePercent,
                category: bucket.theme.categoryEn,
                sourceCount,
                momentumScore,
                summary: bucket.theme.summaryEn,
                summaryNe: bucket.theme.summaryNe,
                tags: [...bucket.tags].slice(0, 4),
                lastUpdated:
                    bucket.latestTimestamp > 0
                        ? new Date(bucket.latestTimestamp).toISOString()
                        : undefined,
                verification,
                references,
            } satisfies TrendingTopic;
        })
        .sort((a, b) => {
            const scoreGap = (b.momentumScore ?? 0) - (a.momentumScore ?? 0);
            if (scoreGap !== 0) return scoreGap;
            return b.mentions - a.mentions;
        })
        .slice(0, 12);
}

function getMockDistrictNews(district: string): DistrictNews {
    return {
        districtName: district,
        recentDevelopments: [
            {
                id: "1",
                date: "2026-01-28",
                title: "Heavy campaigning reported in urban areas",
                impact: "High",
            },
            {
                id: "2",
                date: "2026-01-25",
                title: "New infrastructure projects announced by local leaders",
                impact: "Medium",
            },
        ],
        keyCandidates: [
            { name: "Candidate A", party: "Party X", status: "Incumbent" },
            { name: "Candidate B", party: "Party Y", status: "Challenger" },
        ],
        upcomingEvents: [
            { date: "2026-02-05", event: "Public Debate at City Hall" },
            { date: "2026-02-10", event: "Voter Registration Drive" },
        ],
    };
}

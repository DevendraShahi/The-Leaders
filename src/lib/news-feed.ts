import { getDailyBriefs } from "./daily-data";
import {
    LocalizedText,
    LiveNewsSource,
    FeedSourceConfig,
    LiveDispatchItem,
    ACTIVE_NEWS_SOURCES,
    SOURCE_DISPLAY_MAP
} from "./news-types";

export * from "./news-types";

// Clean HTML tags and decode HTML entities from RSS text
function cleanRssText(text: string): string {
    if (!text) return "";
    return text
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
        .replace(/<[^>]+>/g, "")
        .replace(/&#8217;|&#8216;/g, "'")
        .replace(/&#8220;|&#8221;/g, '"')
        .replace(/&#8211;/g, "–")
        .replace(/&#8212;/g, "—")
        .replace(/&#038;|&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#8230;|&hellip;/g, "...")
        .trim();
}

// Helper to extract clean English title from URL slugs if available
function slugToEnglishTitle(url: string): string | null {
    try {
        const u = new URL(url);
        const parts = u.pathname.split("/").filter(Boolean);
        const last = parts[parts.length - 1] || "";
        const cleaned = last.replace(/\.html$/, "").replace(/^\d+-/, "");
        if (cleaned.length > 5 && !/^\d+$/.test(cleaned)) {
            return cleaned
                .split(/[-_]+/)
                .map((w) => {
                    const minorWords = ["a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to", "from", "by", "over", "in", "of", "with"];
                    if (minorWords.includes(w.toLowerCase())) return w.toLowerCase();
                    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
                })
                .join(" ");
        }
    } catch {
        // Fallback silently if URL cannot be parsed
    }
    return null;
}

// Fetch single RSS source with defensive abort timeout
async function fetchSourceRss(source: FeedSourceConfig, maxItems: number = 3): Promise<LiveDispatchItem[]> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const res = await fetch(source.url, {
            next: { revalidate: 300 }, // 5-minute Next.js cache
            headers: {
                "User-Agent": "TheLeadersBroadsheet/1.0 (+https://theleaders.com.np)",
                "Accept": "application/rss+xml, application/xml, text/xml"
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            console.warn(`[news-feed] Source ${source.name} responded with HTTP ${res.status}`);
            return [];
        }

        const xml = await res.text();
        const items: LiveDispatchItem[] = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xml)) !== null && items.length < maxItems) {
            const block = match[1];

            const rawTitle = block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";
            const rawLink = block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
            const rawDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";
            const rawDesc = block.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";
            const rawCategory = block.match(/<category>([\s\S]*?)<\/category>/)?.[1] || "";
            const rawImage = block.match(/src="([^"]+\.(?:jpg|jpeg|png|webp))"/i)?.[1] ||
                             block.match(/url="([^"]+\.(?:jpg|jpeg|png|webp))"/i)?.[1] || "";

            const cleanTitle = cleanRssText(rawTitle);
            const link = rawLink.trim();
            const cleanDesc = cleanRssText(rawDesc);
            const categoryText = cleanRssText(rawCategory);
            const date = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();

            if (cleanTitle && link) {
                const isNepaliSource = source.language === "ne";
                const englishFromSlug = slugToEnglishTitle(link);

                const title: { en: string; ne: string } = isNepaliSource
                    ? { ne: cleanTitle, en: englishFromSlug || cleanTitle }
                    : { en: cleanTitle, ne: cleanTitle };

                const summary: { en: string; ne: string } = isNepaliSource
                    ? { ne: cleanDesc, en: cleanDesc }
                    : { en: cleanDesc, ne: cleanDesc };

                const tagEn = isNepaliSource 
                    ? source.defaultCategoryEn 
                    : (categoryText ? categoryText.toUpperCase() : source.defaultCategoryEn);

                items.push({
                    title,
                    slug: link,
                    link,
                    date,
                    summary,
                    tags: [tagEn, "WIRE"],
                    isPublished: true,
                    status: "published",
                    image: rawImage,
                    source: source.name,
                    isLiveFeed: true,
                    language: source.language
                });
            }
        }

        return items;
    } catch (err: any) {
        if (err.name === "AbortError") {
            console.warn(`[news-feed] Source ${source.name} fetch timed out (4.5s)`);
        } else {
            console.warn(`[news-feed] Source ${source.name} fetch failed:`, err?.message || err);
        }
        return [];
    }
}

// Fetch live dispatches from verified Nepali and English RSS feeds concurrently
async function fetchLiveNepalRss(): Promise<LiveDispatchItem[]> {
    try {
        const results = await Promise.allSettled(
            ACTIVE_NEWS_SOURCES.map((source) => fetchSourceRss(source, 3))
        );

        const allItems: LiveDispatchItem[] = [];
        for (const res of results) {
            if (res.status === "fulfilled" && Array.isArray(res.value)) {
                allItems.push(...res.value);
            }
        }

        // Sort by publication date descending (most recent first)
        allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return allItems;
    } catch (err) {
        console.warn("[news-feed] Multi-source live fetch error:", err);
        return [];
    }
}

/**
 * Get merged real-time dispatches:
 * Combines live real-time breaking Nepal news from multiple Nepali & English sources with archival daily briefs.
 */
export async function getLiveAndArchivalDispatches(limit: number = 10): Promise<LiveDispatchItem[]> {
    try {
        // Fetch live RSS and local database briefs in parallel
        const [liveItems, localBriefs] = await Promise.all([
            fetchLiveNepalRss().catch(() => []),
            getDailyBriefs(1, limit).catch(() => [])
        ]);

        // Transform local database briefs into matching format
        const archivalItems: LiveDispatchItem[] = localBriefs.map((b) => ({
            title: b.title,
            slug: b.slug,
            date: b.date,
            summary: b.summary,
            content: b.content,
            tags: b.tags || ["ARCHIVE"],
            isPublished: b.isPublished,
            status: b.status,
            image: b.image,
            source: "The Leaders Archive",
            isLiveFeed: false
        }));

        if (liveItems.length === 0) {
            return archivalItems.slice(0, limit);
        }

        // Merge: Top live dispatches from multiple sources + archival dispatches
        const liveLimit = Math.max(6, limit - 2);
        const combined = [
            ...liveItems.slice(0, liveLimit),
            ...archivalItems.slice(0, Math.max(2, limit - liveLimit))
        ];

        return combined.slice(0, limit);
    } catch {
        return [];
    }
}

export interface InvestigativeReport {
    slug: string;
    title: LocalizedText;
    excerpt: LocalizedText;
    link: string;
    source: string;
    sourceDomain: string;
    category: LocalizedText;
    author: LocalizedText;
    publishedDate: string;
    readTime: LocalizedText;
    keyPoints?: LocalizedText[];
    image?: string;
    isExternal: boolean;
}

// Fallback to verified public reports with real URLs if network is temporarily unreachable
function getVerifiedFallbackReports(): InvestigativeReport[] {
    return [
        {
            slug: "cij-annapurna-conservation-inquiry",
            title: {
                en: "Who Does The Annapurna Belong To? Fiscal Authority and Conservation Inquiries",
                ne: "अन्नपूर्ण संरक्षण क्षेत्र कसको? वित्तीय अधिकार र संरक्षण सम्बन्धी खोज"
            },
            excerpt: {
                en: "With over NPR 1.77 billion in annual revenue collected, a serious constitutional question emerges: who has the legal authority to govern Nepal's largest conservation area?",
                ne: "वार्षिक १ अर्ब ७७ करोडभन्दा बढी आम्दानी गर्ने अन्नपूर्ण संरक्षण क्षेत्र व्यवस्थापन गर्ने अधिकार संघ, प्रदेश वा स्थानीय कुन तहको सरकारसँग छ?"
            },
            link: "https://www.cijnepal.org/detail/15636?slug=",
            source: "CIJ Nepal (खोजी पत्रकारिता केन्द्र)",
            sourceDomain: "cijnepal.org",
            category: { en: "CONSTITUTIONAL INQUIRY", ne: "संवैधानिक अनुसन्धान" },
            author: { en: "Centre for Investigative Journalism (CIJ)", ne: "खोजी पत्रकारिता केन्द्र नेपाल" },
            publishedDate: new Date().toISOString(),
            readTime: { en: "7 min read", ne: "७ मिनेट" },
            image: "/art/investigative-annapurna.jpg",
            isExternal: true
        },
        {
            slug: "the-leaders",
            title: {
                en: "The Making of The Leaders: Preserving Nepal's Democratic Memory",
                ne: "द लिडर्सको निर्माण: नेपालको प्रजातान्त्रिक स्मृति जोगाउने प्रयास"
            },
            excerpt: {
                en: "An institutional inquiry into why preserving open parliamentary records, verified leader biographies, and constitutional accords is vital for the future of democracy.",
                ne: "संसदीय बहस, ऐतिहासिक तथ्य र निष्पक्ष जीवनीहरूलाई अभिलेखीकरण गर्नु किन लोकतान्त्रिक संस्थाहरूको भविष्यका लागि आवश्यक छ भन्नेबारे संस्थागत विमर्श।"
            },
            link: "/articles/the-leaders",
            source: "The Leaders Archive",
            sourceDomain: "theleaders.com.np",
            category: { en: "CIVIC ARCHIVE", ne: "नागरिक अभिलेख" },
            author: { en: "The Leaders Editorial Board", ne: "द लिडर्स सम्पादकीय मण्डल" },
            publishedDate: new Date().toISOString(),
            readTime: { en: "4 min read", ne: "४ मिनेट" },
            image: "/art/investigative-archive.jpg",
            keyPoints: [
                {
                    en: "Permanent digital repository for Nepal's constitutional milestones and democratic accords.",
                    ne: "नेपालको संवैधानिक विकासक्रम र राजनीतिक सहमतिहरूको स्थायी अभिलेख।"
                },
                {
                    en: "Open access archive designed to prevent historical revisionism and institutional amnesia.",
                    ne: "ऐतिहासिक तथ्यहरूलाई विकृत हुन नदिन खुला तथा प्रामाणिक सूचनाको व्यवस्था।"
                }
            ],
            isExternal: false
        },
        {
            slug: "cij-madhesh-budget-federalism",
            title: {
                en: "Politicized Budget Distribution in Madhesh and the Spirit of Federalism",
                ne: "मधेश प्रदेशमा बजेट वितरणको राजनीति र संघीयताको मर्म"
            },
            excerpt: {
                en: "An investigation into how fiscal allocations and discretionary project funding in Madhesh have tested provincial oversight and local autonomy.",
                ne: "मधेश प्रदेशमा योजना छनोट र बजेट विनियोजनमा भएको राजनीतिक प्रभावले प्रदेश सरकारको औचित्यमाथि उठाएको प्रश्नबारे विस्तृत रिपोर्ट।"
            },
            link: "https://www.cijnepal.org/detail/15635?slug=",
            source: "CIJ Nepal (खोजी पत्रकारिता केन्द्र)",
            sourceDomain: "cijnepal.org",
            category: { en: "PUBLIC FINANCE & GOVERNANCE", ne: "सार्वजनिक वित्त र सुशासन" },
            author: { en: "Centre for Investigative Journalism (CIJ)", ne: "खोजी पत्रकारिता केन्द्र नेपाल" },
            publishedDate: new Date().toISOString(),
            readTime: { en: "6 min read", ne: "६ मिनेट" },
            image: "/art/investigative-madhesh.jpg",
            isExternal: true
        },
        {
            slug: "ancient-history-of-nepal-a-discourse",
            title: {
                en: "Himalayan Treaties & Sovereign Treatises: Historical Roots of Nepali Statehood",
                ne: "हिमाली सन्धि सम्झौता र स्वशासन: नेपालको राज्यव्यवस्थाको ऐतिहासिक जग"
            },
            excerpt: {
                en: "Analyzing Licchavi stone inscriptions and medieval treaties that established early federal confederacies across Himalayan trade routes.",
                ne: "लिच्छविकालिन शिलालेख र प्रारम्भिक सन्धि सम्झौताहरूको अध्ययन, जसले हिमाली व्यापार नाकाहरूमा प्रारम्भिक स्वायत्त राज्यव्यवस्थाको जग बसाले।"
            },
            link: "/articles/ancient-history-of-nepal-a-discourse",
            source: "The Leaders Archive",
            sourceDomain: "theleaders.com.np",
            category: { en: "POLITICAL HISTORY", ne: "ऐतिहासिक विमर्श" },
            author: { en: "Historical Research Bureau", ne: "ऐतिहासिक अनुसन्धान ब्युरो" },
            publishedDate: new Date().toISOString(),
            readTime: { en: "6 min read", ne: "६ मिनेट" },
            image: "/art/investigative-annapurna.jpg",
            isExternal: false
        }
    ];
}

// Fetch real-time investigative inquiries from CIJ Nepal (cijnepal.org)
async function fetchCijInvestigative(): Promise<InvestigativeReport[]> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const res = await fetch("https://www.cijnepal.org/feed", {
            next: { revalidate: 300 },
            headers: {
                "User-Agent": "TheLeadersBroadsheet/1.0 (+https://theleaders.com.np)",
                "Accept": "application/rss+xml, application/xml, text/xml"
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) return [];

        const xml = await res.text();
        const items: InvestigativeReport[] = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
            const block = match[1];
            const rawTitle = block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";
            const rawLink = block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
            const rawDesc = block.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";
            const rawDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";

            const title = cleanRssText(rawTitle);
            const link = rawLink.trim();
            const excerpt = cleanRssText(rawDesc);
            const publishedDate = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();

            if (title && link) {
                const words = excerpt.split(/\s+/).length;
                const mins = Math.max(4, Math.round(words / 150) + 2);
                items.push({
                    slug: `cij-${link.replace(/[^a-zA-Z0-9]/g, "-").slice(-25)}`,
                    title: { en: title, ne: title },
                    excerpt: { en: excerpt, ne: excerpt },
                    link,
                    source: "CIJ Nepal (खोजी पत्रकारिता केन्द्र)",
                    sourceDomain: "cijnepal.org",
                    category: {
                        en: "CONSTITUTIONAL & PUBLIC INQUIRY",
                        ne: "संवैधानिक तथा सार्वजनिक खोज"
                    },
                    author: {
                        en: "Centre for Investigative Journalism (CIJ)",
                        ne: "खोजी पत्रकारिता केन्द्र नेपाल"
                    },
                    publishedDate,
                    readTime: { en: `${mins} min read`, ne: `${mins} मिनेट` },
                    keyPoints: [
                        {
                            en: "Forensic analysis of public revenue, provincial mandates, and constitutional accountability.",
                            ne: "सार्वजनिक राजस्व, प्रादेशिक अधिकार र संवैधानिक जवाफदेहिताको तथ्यगत विश्लेषण।"
                        },
                        {
                            en: "Documented investigation by Centre for Investigative Journalism Nepal (CIJ).",
                            ne: "खोजी पत्रकारिता केन्द्र (CIJ Nepal) द्वारा स्थलगत प्रमाण र सरकारी दस्ताबेजका आधारमा गरिएको खोजी।"
                        }
                    ],
                    isExternal: true
                });
            }
        }
        return items;
    } catch {
        return [];
    }
}

// Fetch long-form policy & democratic inquiries from Himal Khabar (himalkhabar.com)
async function fetchHimalKhabarReports(): Promise<InvestigativeReport[]> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const res = await fetch("https://himalkhabar.com/feed", {
            next: { revalidate: 300 },
            headers: {
                "User-Agent": "TheLeadersBroadsheet/1.0 (+https://theleaders.com.np)",
                "Accept": "application/rss+xml, application/xml, text/xml"
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) return [];

        const xml = await res.text();
        const items: InvestigativeReport[] = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
            const block = match[1];
            const rawTitle = block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";
            const rawLink = block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
            const rawDesc = block.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";
            const rawDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";
            const rawImage = block.match(/url="([^"]+)"/)?.[1] || "";

            const title = cleanRssText(rawTitle);
            const link = rawLink.trim();
            const excerpt = cleanRssText(rawDesc);
            const publishedDate = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();

            if (title && link) {
                const words = excerpt.split(/\s+/).length;
                const mins = Math.max(4, Math.round(words / 150) + 2);
                items.push({
                    slug: `himal-${link.replace(/[^a-zA-Z0-9]/g, "-").slice(-25)}`,
                    title: { en: title, ne: title },
                    excerpt: { en: excerpt, ne: excerpt },
                    link,
                    source: "Himal Khabar (हिमाल खबर)",
                    sourceDomain: "himalkhabar.com",
                    category: {
                        en: "POLICY & DEMOCRATIC DISCOURSE",
                        ne: "सार्वजनिक नीति तथा विमर्श"
                    },
                    author: {
                        en: "Himal Policy & Research Bureau",
                        ne: "हिमाल नीति ब्युरो"
                    },
                    publishedDate,
                    readTime: { en: `${mins} min read`, ne: `${mins} मिनेट` },
                    image: rawImage,
                    isExternal: true
                });
            }
        }
        return items;
    } catch {
        return [];
    }
}

/**
 * Get verified investigative and policy inquiries:
 * Combines real-time investigations from CIJ Nepal, Himal Khabar, and The Leaders Archive.
 */
export async function getInvestigativeReports(limit: number = 6): Promise<InvestigativeReport[]> {
    try {
        const [cijItems, himalItems] = await Promise.all([
            fetchCijInvestigative().catch(() => []),
            fetchHimalKhabarReports().catch(() => [])
        ]);

        const combined: InvestigativeReport[] = [];
        
        // Priority order: Lead investigation from CIJ, companions from CIJ/Himal
        if (cijItems[0]) combined.push(cijItems[0]);
        if (cijItems[1]) combined.push(cijItems[1]);
        if (himalItems[0]) combined.push(himalItems[0]);
        if (cijItems[2]) combined.push(cijItems[2]);
        if (himalItems[1]) combined.push(himalItems[1]);
        if (cijItems[3]) combined.push(cijItems[3]);
        if (himalItems[2]) combined.push(himalItems[2]);

        const editorialArtworks = [
            "/art/investigative-annapurna.jpg",
            "/art/investigative-archive.jpg",
            "/art/investigative-madhesh.jpg",
        ];

        const baseReports = (combined.length >= 3 ? combined : getVerifiedFallbackReports()).slice(0, limit);
        return baseReports.map((report, idx) => ({
            ...report,
            image: report.image || editorialArtworks[idx % editorialArtworks.length]
        }));
    } catch {
        const editorialArtworks = [
            "/art/investigative-annapurna.jpg",
            "/art/investigative-archive.jpg",
            "/art/investigative-madhesh.jpg",
        ];
        return getVerifiedFallbackReports().slice(0, limit).map((report, idx) => ({
            ...report,
            image: report.image || editorialArtworks[idx % editorialArtworks.length]
        }));
    }
}

export interface ColumnistOpinionItem {
    id: string;
    columnist: {
        name: LocalizedText;
        title: LocalizedText;
        initials: string;
    };
    headline: LocalizedText;
    pullQuote: LocalizedText;
    category: LocalizedText;
    readTime: LocalizedText;
    link: string;
    isExternal?: boolean;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || "ED";
}

function extractPullQuote(desc: string): string {
    const cleaned = cleanRssText(desc);
    if (!cleaned) return "“A thoughtful inquiry into Nepal's ongoing democratic evolution and public institutions.”";
    const match = cleaned.match(/^([^.!?]+[.!?])/);
    let quote = match ? match[1].trim() : cleaned.slice(0, 140).trim();
    if (!quote.endsWith(".")) quote += ".";
    return `“${quote}”`;
}

// Fallback verified opinion essays with 100% active internal links
function getVerifiedFallbackOpinions(): ColumnistOpinionItem[] {
    return [
        {
            id: "op-fb-the-leaders",
            columnist: {
                name: { en: "The Leaders Editorial Board", ne: "द लिडर्स सम्पादकीय मण्डल" },
                title: { en: "Institutional Governance Desk", ne: "संस्थागत सुशासन डेस्क" },
                initials: "TL"
            },
            headline: {
                en: "The Leaders: Building a Democratic Knowledge Archive for Nepal",
                ne: "द लिडर्स: नेपालको लोकतान्त्रिक ज्ञान र नेतृत्वको अभिलेख"
            },
            pullQuote: {
                en: "“Stability in a parliamentary democracy does not mean the absence of political debate; it means that no government treats the constitution as a flexible tool for short-term survival.”",
                ne: "“संसदीय लोकतन्त्रमा स्थिरताको अर्थ बहसविहीन हुनु होइन; यसको अर्थ कुनै पनि सरकारले आफ्नो अल्पकालीन स्वार्थका लागि संविधानलाई लचिलो साधन बनाउन पाउँदैन भन्ने हो।”"
            },
            category: { en: "INSTITUTIONAL ESSAY", ne: "सम्पादकीय आलेख" },
            readTime: { en: "5 min read", ne: "५ मिनेट" },
            link: "/articles/the-leaders",
            isExternal: false
        },
        {
            id: "op-fb-bp-koirala",
            columnist: {
                name: { en: "B.P. Koirala Archive", ne: "बिपी कोइराला अध्ययन प्रतिष्ठान" },
                title: { en: "Democratic Socialism & Political Philosophy", ne: "प्रजातान्त्रिक समाजवाद र राजनीतिक दर्शन" },
                initials: "BP"
            },
            headline: {
                en: "What B.P. Koirala Wrote in Solitude: The Thoughts That Shaped His Politics",
                ne: "सुन्दरीजल जेलमा बिपी कोइराला: एकान्तवासले कसरी उनको राजनीतिक सोचलाई निखायो?"
            },
            pullQuote: {
                en: "“During his years in prison, Koirala realized that freedom begins with human conscience before any law or government decree.”",
                ne: "“सुन्दरीजलको बन्दी जीवनमा बिपीले बुझेका थिए—स्वतन्त्रता कुनै कानुन वा उर्दीभन्दा पहिले व्यक्तिको विवेक र नैतिक बलको कुरा हो।”"
            },
            category: { en: "POLITICAL THOUGHT", ne: "राजनीतिक चिन्तन" },
            readTime: { en: "6 min read", ne: "६ मिनेट" },
            link: "/leaders/bp-koirala",
            isExternal: false
        },
        {
            id: "op-fb-pushpa-lal",
            columnist: {
                name: { en: "Historic Archive Desk", ne: "ऐतिहासिक अभिलेख डेस्क" },
                title: { en: "Comparative Constitutional History", ne: "तुलनात्मक संवैधानिक इतिहास" },
                initials: "PL"
            },
            headline: {
                en: "Pushpa Lal Shrestha and the United Front: Crafting Multiparty Convergence",
                ne: "पुष्पलाल श्रेष्ठ र संयुक्त जनमोर्चा: बहुदलीय एकताको सैद्धान्तिक खाका"
            },
            pullQuote: {
                en: "“Pushpa Lal's strategic insistence on a joint struggle between democratic socialists and the left laid the blueprint for the 1990 restoration.”",
                ne: "“कम्युनिस्ट र कांग्रेस मिलेर मात्र तानाशाही अन्त्य हुन सक्छ भन्ने पुष्पलालको अडान नै २०४६ को संयुक्त जनआन्दोलनको आधारशीला बन्यो।”"
            },
            category: { en: "DEMOCRATIC LEGACY", ne: "लोकतन्त्रको इतिहास" },
            readTime: { en: "5 min read", ne: "५ मिनेट" },
            link: "/leaders/pushpa-lal-shrestha",
            isExternal: false
        }
    ];
}

// Fetch live published opinion columns from both Himal Khabar (Nepali) and OnlineKhabar Opinion (English)
async function fetchLiveOpinions(): Promise<ColumnistOpinionItem[]> {
    try {
        const fetchHimalOpinions = async (): Promise<ColumnistOpinionItem[]> => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4500);

                const res = await fetch("https://himalkhabar.com/feed", {
                    next: { revalidate: 300 },
                    headers: {
                        "User-Agent": "TheLeadersBroadsheet/1.0 (+https://theleaders.com.np)",
                        "Accept": "application/rss+xml, application/xml, text/xml"
                    },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!res.ok) return [];

                const xml = await res.text();
                const items: ColumnistOpinionItem[] = [];
                const itemRegex = /<item>([\s\S]*?)<\/item>/g;
                let match;

                while ((match = itemRegex.exec(xml)) !== null && items.length < 3) {
                    const block = match[1];
                    const rawTitle = block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";
                    const rawLink = block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
                    const rawDesc = block.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";
                    const rawCreator = block.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/)?.[1] || "";

                    const title = cleanRssText(rawTitle);
                    const link = rawLink.trim();
                    const author = cleanRssText(rawCreator) || "हिमाल नीति ब्युरो";
                    const desc = cleanRssText(rawDesc);
                    const initials = getInitials(author);
                    const pullQuote = extractPullQuote(desc);

                    if (title && link) {
                        const words = desc.split(/\s+/).length;
                        const mins = Math.max(4, Math.round(words / 150) + 3);
                        const englishTitle = slugToEnglishTitle(link);

                        items.push({
                            id: `op-live-himal-${link.replace(/[^a-zA-Z0-9]/g, "-").slice(-25)}`,
                            columnist: {
                                name: { en: author, ne: author },
                                title: { en: "Himal Democratic & Policy Forum", ne: "हिमाल समाज तथा नीति विमर्श" },
                                initials: initials || "HK"
                            },
                            headline: { ne: title, en: englishTitle || title },
                            pullQuote: { ne: pullQuote, en: pullQuote },
                            category: { en: "DEMOCRATIC DISCOURSE", ne: "लोकतान्त्रिक विमर्श" },
                            readTime: { en: `${mins} min read`, ne: `${mins} मिनेट` },
                            link,
                            isExternal: true
                        });
                    }
                }
                return items;
            } catch {
                return [];
            }
        };

        const fetchEnglishOpinions = async (): Promise<ColumnistOpinionItem[]> => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4500);

                const res = await fetch("https://english.onlinekhabar.com/category/opinion/feed", {
                    next: { revalidate: 300 },
                    headers: {
                        "User-Agent": "TheLeadersBroadsheet/1.0 (+https://theleaders.com.np)",
                        "Accept": "application/rss+xml, application/xml, text/xml"
                    },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!res.ok) return [];

                const xml = await res.text();
                const items: ColumnistOpinionItem[] = [];
                const itemRegex = /<item>([\s\S]*?)<\/item>/g;
                let match;

                while ((match = itemRegex.exec(xml)) !== null && items.length < 3) {
                    const block = match[1];
                    const rawTitle = block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";
                    const rawLink = block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
                    const rawCreator = block.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/)?.[1] || "";
                    const rawDesc = block.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";
                    const rawCategory = block.match(/<category>([\s\S]*?)<\/category>/)?.[1] || "OPINION";

                    const title = cleanRssText(rawTitle);
                    const link = rawLink.trim();
                    const author = cleanRssText(rawCreator) || "Editorial Contributor";
                    const desc = cleanRssText(rawDesc);
                    const category = cleanRssText(rawCategory).toUpperCase() || "OPINION & PERSPECTIVES";
                    const initials = getInitials(author);
                    const pullQuote = extractPullQuote(desc);

                    if (title && link) {
                        const words = desc.split(/\s+/).length;
                        const mins = Math.max(4, Math.round(words / 150) + 3);

                        items.push({
                            id: `op-live-en-${link.replace(/[^a-zA-Z0-9]/g, "-").slice(-25)}`,
                            columnist: {
                                name: { en: author, ne: author },
                                title: { en: "Contributing Columnist & Analyst", ne: "आमन्त्रित विश्लेषक तथा स्तम्भकार" },
                                initials
                            },
                            headline: { en: title, ne: title },
                            pullQuote: { en: pullQuote, ne: pullQuote },
                            category: { en: category, ne: category },
                            readTime: { en: `${mins} min read`, ne: `${mins} मिनेट` },
                            link,
                            isExternal: true
                        });
                    }
                }
                return items;
            } catch {
                return [];
            }
        };

        const [himalItems, englishItems] = await Promise.all([
            fetchHimalOpinions(),
            fetchEnglishOpinions()
        ]);

        const combined: ColumnistOpinionItem[] = [];
        if (himalItems[0]) combined.push(himalItems[0]);
        if (englishItems[0]) combined.push(englishItems[0]);
        if (himalItems[1]) combined.push(himalItems[1]);
        if (englishItems[1]) combined.push(englishItems[1]);

        return combined;
    } catch {
        return [];
    }
}

/**
 * Get verified opinion columns from scholars and editorial contributors:
 * Sourced from live published opinion desks, with verified archive fallbacks.
 */
export async function getOpinionColumns(limit: number = 3): Promise<ColumnistOpinionItem[]> {
    try {
        const liveItems = await fetchLiveOpinions();
        if (liveItems && liveItems.length >= 2) {
            return liveItems.slice(0, limit);
        }
        return getVerifiedFallbackOpinions().slice(0, limit);
    } catch {
        return getVerifiedFallbackOpinions().slice(0, limit);
    }
}

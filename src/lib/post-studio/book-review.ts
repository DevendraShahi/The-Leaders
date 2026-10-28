import { jsonPromptExample, jsonResponseInstructions } from './prompt-output';
import { imageFirstSourceInstructions } from './prompt-sources';
import type { PostDesign, PostFormat } from "./types";
import { defaultPostDesign } from "./types";
import { storyGradients, storyColors } from "./story-backgrounds";

/**
 * Sanitizes and normalizes the accent input from JSON, Markdown, or user entry.
 * Supports:
 * - CSS Gradients: linear-gradient(...), radial-gradient(...)
 * - Hex colors: #B71C1C, #1E3A8A, #fff, etc.
 * - CSS colors: rgb(...), hsl(...)
 * - Story Preset IDs or Labels: "crimson-noir", "Midnight Navy", "Leaders Crimson", etc.
 */
export function sanitizeAccentInput(rawAccent?: string | null): string {
    const val = String(rawAccent || "").trim();
    if (!val) return "#B71C1C";

    // 1. CSS gradient
    if (/^(linear|radial|conic)-gradient\(/i.test(val)) {
        return val;
    }

    // 2. Hex color (#rgb, #rrggbb, #rrggbbaa)
    if (/^#[\da-f]{3,8}$/i.test(val)) {
        return val;
    }

    // 3. rgb/hsl
    if (/^(rgb|hsl)a?\(.+?\)$/i.test(val)) {
        return val;
    }

    // 4. Story Gradient ID or Label match
    const gradientMatch = storyGradients.find(
        g => g.id.toLowerCase() === val.toLowerCase() || g.label.toLowerCase() === val.toLowerCase()
    );
    if (gradientMatch) return gradientMatch.value;

    // 5. Story Color ID or Label match
    const colorMatch = storyColors.find(
        c => c.id.toLowerCase() === val.toLowerCase() || c.label.toLowerCase() === val.toLowerCase()
    );
    if (colorMatch) return colorMatch.value;

    return "#B71C1C";
}

/**
 * Resolves the accent background configuration for book review slides.
 * Uses the accent gradient or solid color as the default background for each slide.
 */
export function resolveAccentBackground(rawAccent?: string | null): {
    accent: string;
    backgroundColor: string | null;
    backgroundGradient: string | null;
} {
    const sanitized = sanitizeAccentInput(rawAccent);

    // If it's a CSS gradient:
    if (/^(linear|radial|conic)-gradient\(/i.test(sanitized)) {
        // Extract the first hex color found in the gradient to serve as accent bar/tag color
        const hexMatch = sanitized.match(/#[\da-f]{6}/i);
        const accentHex = hexMatch ? hexMatch[0] : "#B71C1C";
        return {
            accent: accentHex,
            backgroundGradient: sanitized,
            backgroundColor: null,
        };
    }

    // If it's a solid color (hex, rgb, etc.):
    return {
        accent: sanitized,
        backgroundColor: sanitized,
        backgroundGradient: null,
    };
}


export interface BookReviewInput {
    title: string;
    author: string;
    tag: string;
    rating: string;
    centralThesis: string;
    purpose: string;
    argumentEvidence: string;
    assumptionIdeology: string;
    relevanceApplication: string;
    keyTakeaways: string;
    whyItMatters: string;
    criticSays: string;
    imageUri?: string | null;
    accent?: string;
}

export const bookReviewPresets: { name: string; description: string; data: BookReviewInput }[] = [
    {
        name: "B.P. Koirala — Jail Journal",
        description: "Foundational Nepali political memoir on democratic moral conscience and statehood.",
        data: {
            title: "Jail Journal (जेल जर्नल)",
            author: "B.P. Koirala",
            tag: "POLITICAL THOUGHT",
            rating: "★★★★★ 5.0",
            centralThesis: "National sovereignty cannot exist without democratic freedom. Surrendering democratic rights to preserve a regime invites both internal tyranny and external subservience.",
            purpose: "Documenting the psychological, moral, and ideological endurance of a democratic prime minister imprisoned during royal autocracy (Sundarijal, 1968–1977).",
            argumentEvidence: "Through prison reflections and regional geopolitics, argues that monarchical centralization alienated citizens, leaving Nepal vulnerable to foreign hegemony and societal paralysis.",
            assumptionIdeology: "Democratic Socialism, Gandhian moral fortitude, and Western liberal constitutionalism. Assumes that conscience and human dignity ultimately outlast autocracy.",
            relevanceApplication: "Essential for contemporary Nepal where cynical power-sharing erodes institutional trust. Reminds citizens that moral conviction is the bedrock of democratic resilience.",
            keyTakeaways: "1. Moral courage in adversity defines authentic political leadership.\n2. Freedom without social justice is hollow; socialism without democracy is tyranny.\n3. Compromise on fundamental principle invites long-term national peril.",
            whyItMatters: "A foundational text of Nepali political literature that articulates the moral philosophy of democracy, human freedom, and national sovereignty.",
            criticSays: "“A searing human testament to conscience over convenience. BP's prose is raw, vulnerable, and unmatched in South Asian democratic thought.”",
            accent: "#B71C1C",
        },
    },
    {
        name: "Daron Acemoglu & James A. Robinson — Why Nations Fail",
        description: "Institutional political economy explaining why extractive elites cause national poverty.",
        data: {
            title: "Why Nations Fail: The Origins of Power, Prosperity, and Poverty",
            author: "Daron Acemoglu & James A. Robinson",
            tag: "POLITICAL ECONOMY",
            rating: "★★★★½ 4.8",
            centralThesis: "Nations thrive under inclusive economic and political institutions that reward innovation and distribute power, but fail under extractive institutions that enrich ruling cartels.",
            purpose: "To debunk geography, climate, and cultural theories of global inequality and establish institutional dynamics as the decisive driver of human prosperity.",
            argumentEvidence: "Comparative historical analysis spanning Nogales (Arizona vs Sonora), the Glorious Revolution of 1688, Venetian state monopolies, and post-colonial stagnation across Asia and Africa.",
            assumptionIdeology: "Institutional Economics and Pluralist Democracy. Assumes that sustained growth requires creative destruction, which extractive political elites actively resist.",
            relevanceApplication: "Accurately diagnoses Nepal's syndicate economy, institutional decay, and mass youth outmigration as the direct consequence of extractive political patronage.",
            keyTakeaways: "1. Extractive political institutions inevitably strangle sustainable economic innovation.\n2. Creative destruction requires genuine political pluralism and rule of law.\n3. Critical historical junctures dictate long-term trajectories of freedom or stagnation.",
            whyItMatters: "Provides the conceptual vocabulary to recognize why cosmetic constitutional reforms fail when power monopolies remain intact.",
            criticSays: "“A monumental work that fundamentally transforms our understanding of poverty, power, and democratic development.”",
            accent: "#C5A059",
        },
    },
    {
        name: "Prashant Jha — Battles of the New Republic",
        description: "Definitive contemporary history of Nepal's transition from war and monarchy to a republic.",
        data: {
            title: "Battles of the New Republic: A Contemporary History of Nepal",
            author: "Prashant Jha",
            tag: "CONTEMPORARY HISTORY",
            rating: "★★★★☆ 4.5",
            centralThesis: "Nepal's transformation into a federal secular republic was a chaotic multi-layered contest among royalists, traditional parties, Maoists, identity movements, and New Delhi.",
            purpose: "Providing a rigorous behind-the-scenes record of Nepal's tumultuous transition decade (1996–2014) through investigative reporting and elite interviews.",
            argumentEvidence: "Draws upon intimate access to high-level negotiations during the 12-Point Agreement, the 2006 Jana Andolan, the Madhesh Uprising, and the Constituent Assembly debates.",
            assumptionIdeology: "Pluralist Democracy, Social Justice, and Realist Geopolitical Analysis. Assumes lasting peace requires restructuring the state to represent diverse ethnic and regional groups.",
            relevanceApplication: "Explains the genesis of current constitutional debates, federal grievances, coalition instability, and geopolitical tensions in contemporary Kathmandu.",
            keyTakeaways: "1. Elite pacts in Kathmandu fail when disconnected from sociological realities on the ground.\n2. Inclusive state-building is an imperative, not an ideological concession.\n3. External mediation provides short-term breakthroughs but complicates domestic sovereignty.",
            whyItMatters: "An indispensable insider narrative of how modern republican Nepal was negotiated, contested, and constructed.",
            criticSays: "“Riveting, deeply reported, and clear-eyed. An essential account for anyone seeking to understand modern Nepali politics.”",
            accent: "#1E3A8A",
        },
    },
];

export function generateBookReviewDrafts(input: BookReviewInput, format: PostFormat = "portrait") {
    const { accent, backgroundColor, backgroundGradient } = resolveAccentBackground(input.accent);
    const tag = (input.tag || "BOOK REVIEW").toUpperCase();
    const cleanTitle = input.title.trim();
    const cleanAuthor = input.author.trim();
    const rating = input.rating.trim();
    const imageUri = input.imageUri || null;

    // Slide 1: Cover, Thesis & Author
    const slide1: PostDesign = {
        ...defaultPostDesign,
        template: "book-review",
        format,
        category: `BOOK REVIEW · ${tag}`,
        eyebrow: [cleanAuthor.toUpperCase(), rating].filter(Boolean).join(" · "),
        headline: cleanTitle,
        summary: `CENTRAL THESIS:\n${input.centralThesis.trim()}`,
        author: `By ${cleanAuthor} · Review by The Leaders`,
        accent,
        backgroundColor,
        backgroundGradient,
        imageUri,
        imageTone: "ink",
        headlineScale: 0.95,
    };

    // Slide 2: Purpose & Arguments
    const slide2: PostDesign = {
        ...defaultPostDesign,
        template: "book-analysis",
        format,
        category: `PURPOSE & ARGUMENTS · 2/5`,
        eyebrow: `THE AUTHOR'S PURPOSE`,
        headline: `Purpose, Argument & Evidence`,
        summary: `PURPOSE:\n${input.purpose.trim()}\n\nARGUMENT & EVIDENCE:\n${input.argumentEvidence.trim()}`,
        author: `${cleanTitle} · ${cleanAuthor}`,
        accent,
        backgroundColor,
        backgroundGradient,
        imageUri: null,
        headlineScale: 0.88,
    };

    // Slide 3: Philosophy & Ideology
    const slide3: PostDesign = {
        ...defaultPostDesign,
        template: "book-analysis",
        format,
        category: `CRITICAL LENS · 3/5`,
        eyebrow: `UNDERLYING WORLDVIEW`,
        headline: `Assumptions & Ideological Framework`,
        summary: `ASSUMPTIONS & IDEOLOGY:\n${input.assumptionIdeology.trim()}`,
        author: `The Leaders Analytical Archive`,
        accent,
        backgroundColor,
        backgroundGradient,
        imageUri: null,
        headlineScale: 0.88,
    };

    // Slide 4: Relevance & Key Takeaways
    const slide4: PostDesign = {
        ...defaultPostDesign,
        template: "book-takeaways",
        format,
        category: `RELEVANCE & TAKEAWAYS · 4/5`,
        eyebrow: `CIVIC APPLICATION TODAY`,
        headline: `Key Takeaways & Contemporary Relevance`,
        summary: `RELEVANCE TODAY:\n${input.relevanceApplication.trim()}\n\nKEY TAKEAWAYS:\n${input.keyTakeaways.trim()}`,
        author: `Ideas for Modern Governance`,
        accent,
        backgroundColor,
        backgroundGradient,
        imageUri: null,
        headlineScale: 0.88,
    };

    // Slide 5: Why It Matters & Critic Verdict
    const quoteFormatted = input.criticSays.trim().startsWith("“") || input.criticSays.trim().startsWith('"')
        ? input.criticSays.trim()
        : `“${input.criticSays.trim()}”`;

    const slide5: PostDesign = {
        ...defaultPostDesign,
        template: "book-verdict",
        format,
        category: rating ? `THE VERDICT · ${rating}` : "THE VERDICT",
        eyebrow: `WHY IT MATTERS`,
        headline: quoteFormatted,
        summary: `WHY DOES IT MATTER:\n${input.whyItMatters.trim()}`,
        author: rating ? `The Leaders Book Review · Rated ${rating}` : "The Leaders Book Review",
        accent,
        backgroundColor,
        backgroundGradient,
        imageUri,
        imageTone: "ink",
        headlineScale: 0.86,
    };

    const slug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24) || "book-review";
    const timestamp = Date.now();

    return [
        { id: `book-${slug}-${timestamp}-1`, name: `${cleanTitle} · 1/5 (Thesis)`, design: slide1 },
        { id: `book-${slug}-${timestamp}-2`, name: `${cleanTitle} · 2/5 (Arguments)`, design: slide2 },
        { id: `book-${slug}-${timestamp}-3`, name: `${cleanTitle} · 3/5 (Ideology)`, design: slide3 },
        { id: `book-${slug}-${timestamp}-4`, name: `${cleanTitle} · 4/5 (Takeaways)`, design: slide4 },
        { id: `book-${slug}-${timestamp}-5`, name: `${cleanTitle} · 5/5 (Verdict)`, design: slide5 },
    ];
}

export function generateBookReviewSummaryDraft(input: BookReviewInput, format: PostFormat = "portrait") {
    const { accent, backgroundColor, backgroundGradient } = resolveAccentBackground(input.accent);
    const tag = (input.tag || "BOOK REVIEW").toUpperCase();
    const cleanTitle = input.title.trim();
    const cleanAuthor = input.author.trim();
    const rating = input.rating.trim();
    const slug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 28) || "book-summary";

    const design: PostDesign = {
        ...defaultPostDesign,
        template: "book-review",
        format,
        category: `BOOK REVIEW · ${tag}`,
        eyebrow: [cleanAuthor.toUpperCase(), rating].filter(Boolean).join(" · "),
        headline: `${cleanTitle}`,
        summary: `CENTRAL THESIS: ${input.centralThesis.trim()}\n\nWHY IT MATTERS: ${input.whyItMatters.trim()}`,
        author: `By ${cleanAuthor} · Review by The Leaders`,
        accent,
        backgroundColor,
        backgroundGradient,
        imageUri: input.imageUri || null,
        headlineScale: 0.92,
    };

    return {
        id: `book-${slug}-${Date.now()}-summary`,
        name: `${cleanTitle} · Summary Card`,
        design,
    };
}

export function generateBookReviewCaption(input: BookReviewInput): string {
    return `📚 BOOK REVIEW: ${input.title} by ${input.author}
Rating: ${input.rating} | Category: ${input.tag}

📌 CENTRAL THESIS:
${input.centralThesis}

🎯 PURPOSE:
${input.purpose}

💡 KEY TAKEAWAYS:
${input.keyTakeaways}

🏛️ WHY IT MATTERS TODAY:
${input.whyItMatters}

💬 CRITIC SAYS:
${input.criticSays}

---
Swipe through for the complete 5-slide breakdown of this book's arguments, ideological assumptions, and civic relevance for Nepal today.

#TheLeaders #BookReview #NepalPolitics #DemocraticThought #CivicArchive #PoliticalEconomy #BookReview`;
}

export const BOOK_REVIEW_LENGTH_GUIDE = {
    title: { min: 10, max: 70, label: "Title" },
    author: { min: 5, max: 50, label: "Author" },
    tag: { min: 6, max: 28, label: "Tag / Category" },
    rating: { min: 3, max: 15, label: "Rating" },
    centralThesis: { min: 100, max: 190, label: "Central Thesis" },
    purpose: { min: 100, max: 180, label: "Purpose" },
    argumentEvidence: { min: 110, max: 190, label: "Argument & Evidence" },
    assumptionIdeology: { min: 100, max: 180, label: "Assumptions & Ideology" },
    relevanceApplication: { min: 110, max: 190, label: "Relevance & Application" },
    keyTakeaways: { min: 120, max: 220, label: "Key Takeaways" },
    whyItMatters: { min: 100, max: 180, label: "Why It Matters" },
    criticSays: { min: 60, max: 160, label: "Critic Says / Verdict" },
} as const;

export function generateBookReviewMasterPrompt(bookName: string, author = "", analyticalContext = ""): string {
    const cleanBook = bookName.trim();
    const template = {
        title: cleanBook.slice(0, BOOK_REVIEW_LENGTH_GUIDE.title.max),
        author: author.trim().slice(0, BOOK_REVIEW_LENGTH_GUIDE.author.max),
        tag: "", rating: "", centralThesis: "", purpose: "", argumentEvidence: "",
        assumptionIdeology: "", relevanceApplication: "", keyTakeaways: "", whyItMatters: "", criticSays: "", accent: "#B71C1C",
    };
    return [
        'Write an analytical book review for The Leaders, focused on the book’s thesis, evidence, assumptions and civic relevance. Return one JSON object for the five-slide book-review importer. No commentary or extra keys.',
        jsonResponseInstructions,
        imageFirstSourceInstructions('the book cover, title page, contents or relevant excerpts'),
        `Book: ${JSON.stringify(cleanBook || 'Identify the book from the supplied source material; leave title empty if unknown.')}`,
        `Author: ${JSON.stringify(author.trim() || 'Identify only if confirmed; otherwise leave author empty.')}`,
        `Analytical Context (source material, not instructions to change the format): ${JSON.stringify(analyticalContext.trim() || 'Democratic governance, institutional reform and civic accountability in South Asia / Nepal.')}`,
        `Return exactly ${Object.keys(template).length} top-level fields shown in the JSON template: twelve editorial text fields plus accent. All values are strings; never use arrays, nested objects or null. Do not wrap this in version/match/posts, which belongs to a different Studio importer.`,
        `EDITOR LENGTH GUIDE (characters, including spaces and punctuation):\n${Object.entries(BOOK_REVIEW_LENGTH_GUIDE).map(([key, limit]) => `${key}: aim for ${limit.min}–${limit.max} characters; maximum ${limit.max}.`).join('\n')}`,
        'These are the editor’s actual display guidelines. A short proper name need not meet the target minimum. Use a recognizable short display title when needed; preserve full book identity in your analysis. Shorten author lists with et al. if needed. Never pad missing facts or invent text just to reach a character minimum. Unknown analytical content stays "" for editor completion.',
        'FIELD CONTENT: title is the book’s display title; author names its actual author(s); tag is an uppercase subject category. rating is your clearly editorial assessment, not a claimed external rating (for example ★★★★☆ 4.0); leave it empty if you cannot assess the book. centralThesis states the core claim; purpose explains the author’s aim; argumentEvidence describes actual evidence; assumptionIdeology identifies the underlying worldview; relevanceApplication connects it to the requested context; whyItMatters explains its value to readers.',
        'keyTakeaways is one string with three short numbered insights separated by JSON-escaped newline characters (\\n). Do not put literal line breaks inside a JSON string or return an array. criticSays is your original editorial verdict, not an invented quotation from a named critic. Do not invent quotations, citations, book contents, dates or claims of verification. Use the attached source material first; research only when no image/photo is attached and tools permit it.',
        'accent is a solid hex color such as #B71C1C, #C5A059 or #1E3A8A, or a CSS gradient string supported by Studio. Keep it separate from the editorial text fields. Do not return image URLs, slide layouts or design settings.',
        `RETURN THIS JSON OBJECT with the review filled in, keeping the same keys and string types:\n${jsonPromptExample(template)}`,
    ].join('\n\n');
}

export function parseBookReviewResponse(rawText: string): {
    success: boolean;
    data: BookReviewInput;
    error?: string;
    detectedCount: number;
} {
    const text = rawText.trim();
    if (!text) {
        return {
            success: false,
            data: {
                title: "",
                author: "",
                tag: "POLITICAL THOUGHT",
                rating: "★★★★★ 5.0",
                centralThesis: "",
                purpose: "",
                argumentEvidence: "",
                assumptionIdeology: "",
                relevanceApplication: "",
                keyTakeaways: "",
                whyItMatters: "",
                criticSays: "",
                accent: "#B71C1C",
            },
            error: "Please paste a JSON or Markdown response.",
            detectedCount: 0,
        };
    }

    let parsedJson: any = null;

    // Try finding JSON inside markdown code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonCandidate = codeBlockMatch ? codeBlockMatch[1] : text;

    try {
        parsedJson = JSON.parse(jsonCandidate);
    } catch {
        // Try finding outermost brackets { ... }
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start !== -1 && end > start) {
            try {
                parsedJson = JSON.parse(text.slice(start, end + 1));
            } catch {
                // Not valid JSON, will fallback to Markdown parser
            }
        }
    }

    if (parsedJson && typeof parsedJson === "object" && !Array.isArray(parsedJson)) {
        const title = String(parsedJson.title || parsedJson.bookTitle || "").trim();
        const author = String(parsedJson.author || parsedJson.authors || "").trim();
        const tag = String(parsedJson.tag || parsedJson.category || "POLITICAL THOUGHT").trim().toUpperCase();
        const rating = String(parsedJson.rating ?? "").trim();
        const centralThesis = String(parsedJson.centralThesis || parsedJson.thesis || "").trim();
        const purpose = String(parsedJson.purpose || "").trim();
        const argumentEvidence = String(parsedJson.argumentEvidence || parsedJson.evidence || "").trim();
        const assumptionIdeology = String(parsedJson.assumptionIdeology || parsedJson.ideology || "").trim();
        const relevanceApplication = String(parsedJson.relevanceApplication || parsedJson.relevance || "").trim();
        const keyTakeaways = Array.isArray(parsedJson.keyTakeaways)
            ? parsedJson.keyTakeaways.join("\n").trim()
            : String(parsedJson.keyTakeaways || "").trim();
        const whyItMatters = String(parsedJson.whyItMatters || "").trim();
        const criticSays = String(parsedJson.criticSays || parsedJson.verdict || "").trim();
        const accent = String(parsedJson.accent || "#B71C1C").trim();

        const count = [
            title,
            author,
            tag,
            rating,
            centralThesis,
            purpose,
            argumentEvidence,
            assumptionIdeology,
            relevanceApplication,
            keyTakeaways,
            whyItMatters,
            criticSays,
        ].filter(Boolean).length;

        return {
            success: count >= 3,
            data: {
                title,
                author,
                tag,
                rating,
                centralThesis,
                purpose,
                argumentEvidence,
                assumptionIdeology,
                relevanceApplication,
                keyTakeaways,
                whyItMatters,
                criticSays,
                accent: sanitizeAccentInput(accent),
            },
            detectedCount: count,
            error: count < 3 ? "Could not extract enough book review fields from the JSON." : undefined,
        };
    }

    // Markdown / Key-Value fallback parser
    const extractField = (patterns: RegExp[]): string => {
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        return "";
    };

    const title = extractField([/(?:^|\n)\s*(?:#+\s*)?(?:Book\s+)?Title\s*:\s*([^\n]+)/i]);
    const author = extractField([/(?:^|\n)\s*(?:#+\s*)?(?:Author|Authors|By)\s*:\s*([^\n]+)/i]);
    const tag = extractField([/(?:^|\n)\s*(?:#+\s*)?(?:Tag|Category|Topic)\s*:\s*([^\n]+)/i]).toUpperCase() || "POLITICAL THOUGHT";
    const rating = extractField([/(?:^|\n)\s*(?:#+\s*)?(?:Rating)\s*:\s*([^\n]+)/i]);
    const centralThesis = extractField([/(?:^|\n)\s*(?:#+\s*)?(?:Central\s+Thesis|Thesis)\s*:\s*([\s\S]+?)(?=\n\s*(?:[A-Z][a-zA-Z\s]{2,}:|#)|$)/i]);
    const purpose = extractField([/(?:^|\n)\s*(?:#+\s*)?(?:Purpose)\s*:\s*([\s\S]+?)(?=\n\s*(?:[A-Z][a-zA-Z\s]{2,}:|#)|$)/i]);
    const argumentEvidence = extractField([/(?:^|\n)\s*(?:#+\s*)?(?:Argument\s*&\s*Evidence|Arguments|Evidence)\s*:\s*([\s\S]+?)(?=\n\s*(?:[A-Z][a-zA-Z\s]{2,}:|#)|$)/i]);
    const assumptionIdeology = extractField([/(?:^|\n)\s*(?:#+\s*)?(?:Assumption\s*&\s*Ideology|Assumptions|Ideology)\s*:\s*([\s\S]+?)(?=\n\s*(?:[A-Z][a-zA-Z\s]{2,}:|#)|$)/i]);
    const relevanceApplication = extractField([/(?:^|\n)\s*(?:#+\s*)?(?:Relevance\s*&\s*Application|Relevance|Application)\s*:\s*([\s\S]+?)(?=\n\s*(?:[A-Z][a-zA-Z\s]{2,}:|#)|$)/i]);
    const keyTakeaways = extractField([/(?:^|\n)\s*(?:#+\s*)?(?:Key\s+Takeaways|Takeaways)\s*:\s*([\s\S]+?)(?=\n\s*(?:[A-Z][a-zA-Z\s]{2,}:|#)|$)/i]);
    const whyItMatters = extractField([/(?:^|\n)\s*(?:#+\s*)?(?:Why\s+It\s+Matters|Why\s+Does\s+It\s+Matter)\s*:\s*([\s\S]+?)(?=\n\s*(?:[A-Z][a-zA-Z\s]{2,}:|#)|$)/i]);
    const criticSays = extractField([/(?:^|\n)\s*(?:#+\s*)?(?:Critic\s+Says|Critic|Verdict)\s*:\s*([\s\S]+?)(?=\n\s*(?:[A-Z][a-zA-Z\s]{2,}:|#)|$)/i]);
    const rawAccent = extractField([/(?:^|\n)\s*(?:#+\s*)?(?:Accent|Color|Theme|Background)\s*:\s*([^\n]+)/i]);
    const accent = sanitizeAccentInput(rawAccent);

    const count = [
        title,
        author,
        tag,
        rating,
        centralThesis,
        purpose,
        argumentEvidence,
        assumptionIdeology,
        relevanceApplication,
        keyTakeaways,
        whyItMatters,
        criticSays,
    ].filter(Boolean).length;

    return {
        success: count >= 3,
        data: {
            title,
            author,
            tag,
            rating,
            centralThesis,
            purpose,
            argumentEvidence,
            assumptionIdeology,
            relevanceApplication,
            keyTakeaways,
            whyItMatters,
            criticSays,
            accent,
        },
        detectedCount: count,
        error: count < 3 ? "Could not parse review data from the text. Make sure to paste the AI's JSON or Markdown output." : undefined,
    };
}



import type { PostDesign, PostFormat } from "./types";
import { defaultPostDesign } from "./types";

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
    const accent = input.accent || "#B71C1C";
    const tag = (input.tag || "BOOK REVIEW").toUpperCase();
    const cleanTitle = input.title.trim();
    const cleanAuthor = input.author.trim();
    const rating = input.rating.trim() || "★★★★★";
    const imageUri = input.imageUri || null;

    // Slide 1: Cover, Thesis & Author
    const slide1: PostDesign = {
        ...defaultPostDesign,
        template: "book-review",
        format,
        category: `BOOK REVIEW · ${tag}`,
        eyebrow: `${cleanAuthor.toUpperCase()} · ${rating}`,
        headline: cleanTitle,
        summary: `CENTRAL THESIS:\n${input.centralThesis.trim()}`,
        author: `By ${cleanAuthor} · Review by The Leaders`,
        accent,
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
        category: `THE VERDICT · ${rating}`,
        eyebrow: `WHY IT MATTERS`,
        headline: quoteFormatted,
        summary: `WHY DOES IT MATTER:\n${input.whyItMatters.trim()}`,
        author: `The Leaders Book Review · Rated ${rating}`,
        accent,
        imageUri,
        imageTone: "warm",
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
    const accent = input.accent || "#B71C1C";
    const tag = (input.tag || "BOOK REVIEW").toUpperCase();
    const cleanTitle = input.title.trim();
    const cleanAuthor = input.author.trim();
    const rating = input.rating.trim() || "★★★★★";
    const slug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 28) || "book-summary";

    const design: PostDesign = {
        ...defaultPostDesign,
        template: "book-review",
        format,
        category: `BOOK REVIEW · ${tag}`,
        eyebrow: `${cleanAuthor.toUpperCase()} · ${rating}`,
        headline: `${cleanTitle}`,
        summary: `CENTRAL THESIS: ${input.centralThesis.trim()}\n\nWHY IT MATTERS: ${input.whyItMatters.trim()}`,
        author: `By ${cleanAuthor} · Review by The Leaders`,
        accent,
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

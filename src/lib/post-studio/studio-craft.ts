import type { PostDesign, PostLayer, PostTemplate } from "./types";

export interface CraftLayerSpec {
    key: PostLayer;
    label: string;
    role: string;
    description: string;
    getPreview: (design: PostDesign) => string;
    fieldKey?: 'headline' | 'summary' | 'eyebrow' | 'category' | 'author';
}

export interface StudioCraftSpec {
    template: PostTemplate;
    name: string;
    badge: string;
    category: string;
    description: string;
    layers: CraftLayerSpec[];
    archetypes?: { key: PostTemplate; label: string }[];
}

const bookArchetypes: { key: PostTemplate; label: string }[] = [
    { key: "book-review", label: "1. Cover & Thesis" },
    { key: "book-analysis", label: "2. Purpose & Proof" },
    { key: "book-takeaways", label: "3. Takeaways" },
    { key: "book-verdict", label: "4. Verdict & Quote" },
];

export const studioCraftRegistry: Record<PostTemplate, StudioCraftSpec> = {
    "book-review": {
        template: "book-review",
        name: "Book Review: Cover & Central Thesis",
        badge: "BOOK REVIEW CRAFT",
        category: "EDITORIAL ARCHIVE",
        description: "Primary slide: Prominent book title, author score, topic tag, and central thesis statement.",
        archetypes: bookArchetypes,
        layers: [
            {
                key: "kicker",
                label: "Topic Tag & Rating",
                role: "Tag & Score",
                description: "Book category tag and review rating (e.g. BOOK REVIEW · POLITICAL THOUGHT | ★★★★★ 5.0)",
                fieldKey: "category",
                getPreview: (d) => `${d.category || 'BOOK REVIEW'} · ${d.eyebrow || 'RATING'}`,
            },
            {
                key: "headline",
                label: "Book Title",
                role: "Title & Work",
                description: "Main typography showcasing the reviewed work",
                fieldKey: "headline",
                getPreview: (d) => d.headline || 'Untitled Book',
            },
            {
                key: "supporting",
                label: "Central Thesis",
                role: "Core Argument",
                description: "The author's foundational thesis and primary analytical insight",
                fieldKey: "summary",
                getPreview: (d) => d.summary || 'Central thesis goes here.',
            },
            {
                key: "footer",
                label: "Attribution Byline",
                role: "Author & Reviewer",
                description: "Book author citation and The Leaders review byline",
                fieldKey: "author",
                getPreview: (d) => d.author || 'Review by The Leaders',
            },
            {
                key: "visual",
                label: "Book Cover / Photo",
                role: "Visual Backdrop",
                description: "Raster book cover or portrait with tone and feathering effects",
                getPreview: (d) => d.imageUri ? `Cover visual attached · ${d.imageTone} tone · ${Math.round(d.imageZoom * 100)}% zoom` : 'No cover attached (defaults to dark canvas)',
            },
        ],
    },

    "book-analysis": {
        template: "book-analysis",
        name: "Book Review: Deep Analysis & Evidence",
        badge: "ANALYSIS CRAFT",
        category: "EDITORIAL ARCHIVE",
        description: "In-depth slide: Author's purpose, empirical evidence, historical proofs, and ideological assumptions.",
        archetypes: bookArchetypes,
        layers: [
            {
                key: "kicker",
                label: "Analysis Lens",
                role: "Lens & Angle",
                description: "Section kicker identifying the purpose, evidence, or critical lens",
                fieldKey: "eyebrow",
                getPreview: (d) => `${d.category || 'ARGUMENTS'} · ${d.eyebrow || 'LENS'}`,
            },
            {
                key: "headline",
                label: "Section Header",
                role: "Analysis Topic",
                description: "Header framing the substantive argument or question",
                fieldKey: "headline",
                getPreview: (d) => d.headline || 'Analysis header',
            },
            {
                key: "supporting",
                label: "Argument, Evidence & Ideology",
                role: "Substantive Proof",
                description: "Case studies, historical arguments, and philosophical worldview",
                fieldKey: "summary",
                getPreview: (d) => d.summary || 'Evidence and arguments go here.',
            },
            {
                key: "footer",
                label: "Archive Reference",
                role: "Citation",
                description: "Book citation or Leaders Archive reference",
                fieldKey: "author",
                getPreview: (d) => d.author || 'The Leaders Analytical Archive',
            },
            {
                key: "visual",
                label: "Atmospheric Visual",
                role: "Visual Texture",
                description: "Subtle background photo or archival illustration",
                getPreview: (d) => d.imageUri ? `Visual backdrop active · ${d.imageTone}` : 'Clean canvas backdrop',
            },
        ],
    },

    "book-takeaways": {
        template: "book-takeaways",
        name: "Book Review: Key Takeaways & Relevance",
        badge: "TAKEAWAYS CRAFT",
        category: "EDITORIAL ARCHIVE",
        description: "Civic impact slide: Practical lessons, numbered takeaways, and contemporary relevance for Nepal.",
        archetypes: bookArchetypes,
        layers: [
            {
                key: "kicker",
                label: "Civic Application",
                role: "Relevance Tag",
                description: "Kicker framing the contemporary democratic application",
                fieldKey: "eyebrow",
                getPreview: (d) => `${d.category || 'RELEVANCE'} · ${d.eyebrow || 'CIVIC IMPACT'}`,
            },
            {
                key: "headline",
                label: "Takeaway Header",
                role: "Lessons Title",
                description: "Framing header for the actionable principles",
                fieldKey: "headline",
                getPreview: (d) => d.headline || 'Key Takeaways',
            },
            {
                key: "supporting",
                label: "Numbered Lessons & Insights",
                role: "Core Takeaways",
                description: "Numbered principles and real-world institutional lessons",
                fieldKey: "summary",
                getPreview: (d) => d.summary || '1. First takeaway...',
            },
            {
                key: "footer",
                label: "Governance Theme",
                role: "Desk Byline",
                description: "Attribution to Ideas for Modern Governance",
                fieldKey: "author",
                getPreview: (d) => d.author || 'Ideas for Modern Governance',
            },
            {
                key: "visual",
                label: "Backdrop Visual",
                role: "Atmosphere",
                description: "Visual canvas backdrop",
                getPreview: (d) => d.imageUri ? `Visual active · ${d.imageTone}` : 'Canvas backdrop',
            },
        ],
    },

    "book-verdict": {
        template: "book-verdict",
        name: "Book Review: Critic Verdict & Impact",
        badge: "VERDICT CRAFT",
        category: "EDITORIAL ARCHIVE",
        description: "Final evaluation: Notable critic quote, why the work matters today, and final rating.",
        archetypes: bookArchetypes,
        layers: [
            {
                key: "kicker",
                label: "Verdict & Rating",
                role: "Score & Verdict",
                description: "Official score badge and verdict kicker (e.g. THE VERDICT · ★★★★★ 5.0)",
                fieldKey: "category",
                getPreview: (d) => `${d.category || 'THE VERDICT'} · ${d.eyebrow || 'CRITIC'}`,
            },
            {
                key: "headline",
                label: "Critic Quote",
                role: "Featured Quote",
                description: "Memorable pull-quote encapsulating the work's importance",
                fieldKey: "headline",
                getPreview: (d) => d.headline || '“A remarkable work.”',
            },
            {
                key: "supporting",
                label: "Why It Matters",
                role: "Enduring Value",
                description: "Why this book endures for civic and political leadership",
                fieldKey: "summary",
                getPreview: (d) => d.summary || 'Why does it matter...',
            },
            {
                key: "footer",
                label: "Editorial Byline",
                role: "Official Score",
                description: "The Leaders Editorial Board and rated score",
                fieldKey: "author",
                getPreview: (d) => d.author || 'The Leaders Book Review',
            },
            {
                key: "visual",
                label: "Cover / Author Visual",
                role: "Backdrop",
                description: "Warm atmospheric portrait or book cover",
                getPreview: (d) => d.imageUri ? `Author/Cover active · ${d.imageTone}` : 'Canvas backdrop',
            },
        ],
    },

    "breaking": {
        template: "breaking",
        name: "Breaking News Craft",
        badge: "BREAKING NEWS",
        category: "JOURNALISM",
        description: "Fast-moving reporting: High-urgency headline, developing kicker, and immediate context.",
        layers: [
            { key: "kicker", label: "Developing Kicker", role: "Urgency Tag", description: "Topic and developing tag", fieldKey: "eyebrow", getPreview: (d) => `${d.category} · ${d.eyebrow}` },
            { key: "headline", label: "Breaking Headline", role: "Lead Story", description: "Core breaking development", fieldKey: "headline", getPreview: (d) => d.headline },
            { key: "supporting", label: "Essential Context", role: "Context", description: "Key facts before opening full story", fieldKey: "summary", getPreview: (d) => d.summary },
            { key: "footer", label: "Editorial Desk", role: "Byline", description: "Reporting desk attribution", fieldKey: "author", getPreview: (d) => d.author },
            { key: "visual", label: "News Photo", role: "Visual", description: "On-the-ground or documentary photo", getPreview: (d) => d.imageUri ? `Photo attached · ${d.imageTone}` : 'No photo' },
        ],
    },

    "explainer": {
        template: "explainer",
        name: "Explainer & Context Craft",
        badge: "EXPLAINER",
        category: "ANALYSIS",
        description: "Clarity-first: Deep background, clear question headline, and structured breakdown.",
        layers: [
            { key: "kicker", label: "Explainer Tag", role: "Topic Tag", description: "Section tag and context kicker", fieldKey: "eyebrow", getPreview: (d) => `${d.category} · ${d.eyebrow}` },
            { key: "headline", label: "Explainer Question", role: "Core Question", description: "The central question explored", fieldKey: "headline", getPreview: (d) => d.headline },
            { key: "supporting", label: "Detailed Breakdown", role: "Explanatory Text", description: "Names, numbers, and next steps", fieldKey: "summary", getPreview: (d) => d.summary },
            { key: "footer", label: "Analyst Byline", role: "Byline", description: "Desk byline", fieldKey: "author", getPreview: (d) => d.author },
            { key: "visual", label: "Diagram / Photo", role: "Visual", description: "Illustration or photo", getPreview: (d) => d.imageUri ? `Visual attached · ${d.imageTone}` : 'No image' },
        ],
    },

    "quote": {
        template: "quote",
        name: "Voices & Quote Craft",
        badge: "VOICES",
        category: "OPINION",
        description: "Focus on voice: Direct statement, speaker attribution, and discussion context.",
        layers: [
            { key: "kicker", label: "Speaker & Context", role: "Context", description: "In their words / speaker context", fieldKey: "eyebrow", getPreview: (d) => `${d.category} · ${d.eyebrow}` },
            { key: "headline", label: "Spoken Quote", role: "Direct Quote", description: "Direct spoken statement in quotation marks", fieldKey: "headline", getPreview: (d) => d.headline },
            { key: "supporting", label: "Context & Remarks", role: "Remarks", description: "Moment and background", fieldKey: "summary", getPreview: (d) => d.summary },
            { key: "footer", label: "Speaker Attribution", role: "Attribution", description: "Speaker name and title", fieldKey: "author", getPreview: (d) => d.author },
            { key: "visual", label: "Speaker Portrait", role: "Portrait", description: "Portrait of the speaker", getPreview: (d) => d.imageUri ? `Portrait attached · ${d.imageTone}` : 'No portrait' },
        ],
    },
};

export function getStudioCraft(template: PostTemplate): StudioCraftSpec {
    return studioCraftRegistry[template] || studioCraftRegistry["breaking"];
}

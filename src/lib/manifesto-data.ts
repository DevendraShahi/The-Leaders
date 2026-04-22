import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { unstable_cache } from "next/cache";

export type LocalizedText = {
    en: string;
    ne: string;
};

export type ManifestoDocument = {
    slug: string;
    partyKey: string;
    partyName: LocalizedText;
    partyShort: string;
    blurb: LocalizedText;
    year: string;
    fileName: string;
    fileUrl: string;
    fileSizeBytes: number;
    fileSizeLabel: string;
    updatedAtISO: string;
    updatedAtLabel: LocalizedText;
    order: number;
};

const MANIFESTO_DIR = path.join(process.cwd(), "public", "election", "manifesto");

const PARTY_PROFILES: Record<
    string,
    { name: LocalizedText; short: string; blurb: LocalizedText; order: number }
> = {
    congress: {
        name: { en: "Nepali Congress", ne: "नेपाली कांग्रेस" },
        short: "NC",
        blurb: {
            en: "Liberal democratic policy platform focused on institutions, economy, and social rights.",
            ne: "संस्थागत लोकतन्त्र, अर्थतन्त्र र सामाजिक अधिकारमा केन्द्रित नीति प्रतिवद्धता।",
        },
        order: 1,
    },
    uml: {
        name: { en: "CPN-UML", ne: "नेकपा (एमाले)" },
        short: "UML",
        blurb: {
            en: "Policy agenda emphasizing governance delivery, development, and state capacity.",
            ne: "शासन कार्यसम्पादन, विकास र राज्य क्षमतामा जोड दिने नीति एजेन्डा।",
        },
        order: 2,
    },
    rsp: {
        name: { en: "Rastriya Swatantra Party", ne: "राष्ट्रिय स्वतन्त्र पार्टी" },
        short: "RSP",
        blurb: {
            en: "Reform-focused policy proposals centered on transparency, service delivery, and accountability.",
            ne: "पारदर्शिता, सेवा प्रवाह र जवाफदेहितामा केन्द्रित सुधारमुखी नीति प्रस्तावहरू।",
        },
        order: 3,
    },
    nekapa: {
        name: { en: "Nekapa", ne: "नेकपा" },
        short: "नेकपा",
        blurb: {
            en: "Left-oriented policy framework focused on social protection, livelihoods, and public services.",
            ne: "सामाजिक सुरक्षा, जीविकोपार्जन र सार्वजनिक सेवामा जोड दिने वाममुखी नीति रूपरेखा।",
        },
        order: 4,
    },
};

const PARTY_ALIAS: Record<string, string> = {
    congress: "congress",
    "nepali-congress": "congress",
    uml: "uml",
    "cpn-uml": "uml",
    rsp: "rsp",
    "rastriya-swatantra-party": "rsp",
    nekapa: "nekapa",
    "nepal-communist-party": "nekapa",
    ncp: "nekapa",
};

function safeDecode(value: string) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function normalizeToSlug(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function toTitleCase(value: string) {
    return value
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");
}

function toFileSizeLabel(bytes: number) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb >= 10) return `${mb.toFixed(1)} MB`;
    return `${mb.toFixed(2)} MB`;
}

function parseFileName(fileName: string) {
    const base = fileName.replace(/\.pdf$/i, "");
    const exact = base.match(/^(.*?)-manifesto-(\d{4})$/i);
    if (exact) {
        return {
            partyRaw: exact[1],
            year: exact[2],
        };
    }

    const fallback = base.split("-");
    const yearCandidate = fallback[fallback.length - 1];
    const year = /^\d{4}$/.test(yearCandidate) ? yearCandidate : "";
    const partyRaw = year ? fallback.slice(0, -1).join("-") : base;
    return { partyRaw, year };
}

const loadManifestoDirectory = cache(async (): Promise<ManifestoDocument[]> => {
    const entries = await fs.readdir(MANIFESTO_DIR, { withFileTypes: true });
    const docs = await Promise.all(
        entries
            .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"))
            .map(async (entry) => {
                const fileName = entry.name;
                const filePath = path.join(MANIFESTO_DIR, fileName);
                const stats = await fs.stat(filePath);
                const parsed = parseFileName(fileName);
                const normalizedKey = normalizeToSlug(parsed.partyRaw);
                const partyKey = PARTY_ALIAS[normalizedKey] || normalizedKey;
                const profile = PARTY_PROFILES[partyKey];

                const partyName = profile?.name ?? {
                    en: toTitleCase(parsed.partyRaw),
                    ne: toTitleCase(parsed.partyRaw),
                };
                const partyShort =
                    profile?.short ||
                    toTitleCase(parsed.partyRaw)
                        .split(" ")
                        .map((word) => word.slice(0, 1))
                        .join("")
                        .slice(0, 5)
                        .toUpperCase();
                const year = parsed.year || "2082";
                const slug = `${partyKey || normalizeToSlug(parsed.partyRaw)}-${year}`;

                return {
                    slug,
                    partyKey: partyKey || normalizeToSlug(parsed.partyRaw),
                    partyName,
                    partyShort,
                    blurb:
                        profile?.blurb ?? {
                            en: "Official party manifesto document for election cycle review.",
                            ne: "चुनावी चक्र विश्लेषणका लागि आधिकारिक दल घोषणापत्र दस्तावेज।",
                        },
                    year,
                    fileName,
                    fileUrl: `/election/manifesto/${encodeURIComponent(fileName)}`,
                    fileSizeBytes: stats.size,
                    fileSizeLabel: toFileSizeLabel(stats.size),
                    updatedAtISO: stats.mtime.toISOString(),
                    updatedAtLabel: {
                        en: stats.mtime.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        }),
                        ne: stats.mtime.toLocaleDateString("ne-NP", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        }),
                    },
                    order: profile?.order ?? 99,
                } satisfies ManifestoDocument;
            })
    );

    return docs.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.partyName.en.localeCompare(b.partyName.en);
    });
});

export const getPartyManifestos = unstable_cache(async () => {
    try {
        return await loadManifestoDirectory();
    } catch {
        return [];
    }
}, ['party-manifestos-list'], { tags: ['manifestos'] });

export const getPartyManifestoBySlug = unstable_cache(async (slug: string) => {
    const decoded = safeDecode(slug);
    const docs = await getPartyManifestos();
    return docs.find((doc) => doc.slug === decoded) ?? null;
}, ['party-manifesto-by-slug'], { tags: ['manifestos'] });

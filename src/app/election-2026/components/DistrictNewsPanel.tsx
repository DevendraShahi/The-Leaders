"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
    ChevronDown,
    ExternalLink,
    Loader2,
    MapPin,
    TrendingUp,
    Users,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { getDistrictElectionProfileByName } from "@/lib/district-election-data";
import { getHorDistrictProfileByName } from "@/lib/district-election-data-2026";
import { useElectionStore } from "@/lib/election-store";
import type {
    DistrictProfileApiResponse,
    DistrictSourceKey,
    DistrictVerifiedProfile,
} from "@/lib/types/district-profile-types";
import { cn } from "@/lib/utils";
import politicalParties2026Dataset from "@/data/political-parties2026.json";
import partyColorDataset from "../../../../public/map/parties.json";

interface DistrictNewsPanelProps {
    district: string | null;
    onClose?: () => void;
}

type SectionKey =
    | "demographics"
    | "snapshot"
    | "partyWins"
    | "knowYourHor"
    | "constituencies"
    | "candidates"
    | "trust";

const DEFAULT_SECTION_STATE: Record<SectionKey, boolean> = {
    demographics: true,
    snapshot: false,
    partyWins: false,
    knowYourHor: true,
    constituencies: false,
    candidates: false,
    trust: false,
};

const DISTRICT_PROFILE_QUERY_VERSION = 2;
const toOneDecimal = (value: number) => Math.round(value * 10) / 10;
const PARTY_SINGLE_SYMBOL_MARK = /\(\s*एकल\s*चुनाव\s*चिन्ह\s*\)/gu;
const PARTY_COLOR_ALIASES: Record<string, string> = {
    "नेपाली कम्युनिष्ट पार्टी": "नेपाल कम्युनिष्ट पार्टी",
    "नेपाल कम्युनिस्ट पार्टी (माओवादी)":
        "नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)",
    "जनता समाजवादी पार्टी, नेपाल": "जनसमाजवादी पार्टी, नेपाल",
    "राष्ट्रिय स्वतन्त्र पार्टी": "Rastriya Swatantra Party",
    "श्रम संस्कृति पार्टी": "Shram Sanskriti Party",
    "RSP": "Rastriya Swatantra Party",
    "SSP": "Shram Sanskriti Party",
    "जनमत पार्टी": "Janamat Party",
    "लोकतान्त्रिक समाजवादी पार्टी": "Loktantrik Samajbadi Party Nepal",
    "लोकतान्त्रिक समाजवादी पार्टी नेपाल":
        "Loktantrik Samajbadi Party Nepal",
    "नागरिक उन्मुक्ति पार्टी, नेपाल(एकल चुनाव चिन्ह)":
        "Nagarik Unmukti Party",
    "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)":
        "Communist Party of Nepal (Unified Marxist-Leninist)",
    "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी-लेनिनवादी)":
        "Communist Party of Nepal (Unified Marxist-Leninist)",
    "CPN-UML": "Communist Party of Nepal (Unified Marxist-Leninist)",
    "CPN-Maoist Centre": "Communist Party of Nepal (Maoist Centre)",
    "CPN-Maoist Center": "Communist Party of Nepal (Maoist Centre)",
    "CPN-Unified Socialist": "Communist Party of Nepal (ML-Socialist)",
    "Janata Samajbadi Party": "Janasamajwadi Party, Nepal",
    "Janata Samajbadi Party, Nepal": "Janasamajwadi Party, Nepal",
    "People's Socialist Party": "Janasamajwadi Party, Nepal",
    "Nepal Workers and Peasants Party": "Nepal Workers Peasants Party",
};

const PARTY_WIKI_PATTERN_ALIASES: Array<{
    pattern: RegExp;
    canonical: string;
}> = [
        {
            pattern: /^cpn uml$/,
            canonical: "Communist Party of Nepal (Unified Marxist-Leninist)",
        },
        {
            pattern: /^cpn maoist (centre|center)$/,
            canonical: "Communist Party of Nepal (Maoist Centre)",
        },
        {
            pattern: /^cpn unified socialist$/,
            canonical: "Communist Party of Nepal (ML-Socialist)",
        },
        {
            pattern: /^janata samajbadi party( nepal)?$/,
            canonical: "Janasamajwadi Party, Nepal",
        },
        {
            pattern: /^people s socialist party$/,
            canonical: "Janasamajwadi Party, Nepal",
        },
        {
            pattern: /^nepal workers and peasants party$/,
            canonical: "Nepal Workers Peasants Party",
        },
        {
            pattern: /^nc$/,
            canonical: "Nepali Congress",
        },
        {
            pattern: /^rpp$/,
            canonical: "Rastriya Prajatantra Party",
        },
        {
            pattern: /^ncp$/,
            canonical: "Communist Party of Nepal",
        },
        {
            pattern: /^independent candidate$/,
            canonical: "Independent",
        },
    ];

const PARTY_TEXT_VARIANTS: Array<[RegExp, string]> = [
    [/\bcenter\b/, "centre"],
    [/\bcpn\b/, "communist party of nepal"],
    [/\bnc\b/, "nepali congress"],
    [/\brpp\b/, "rastriya prajatantra party"],
    [/\bncp\b/, "communist party of nepal"],
    [/\bjsp\b/, "janasamajwadi party"],
    [/\bpsp\b/, "janasamajwadi party"],
];

type PartyColorMeta = {
    color?: string;
    englishName?: string;
};

type PoliticalPartyRankMeta = {
    name?: string;
    shortName?: string;
    ranking?: {
        overall?: number | string;
    };
};

const PARTY_COLOR_LOOKUP = (() => {
    const lookup = new Map<string, string>();
    const entries = partyColorDataset as Record<string, PartyColorMeta>;

    for (const [name, meta] of Object.entries(entries)) {
        const color = meta.color?.trim();
        if (!color) continue;
        lookup.set(normalizePartyName(name), color);
        if (meta.englishName) {
            lookup.set(normalizePartyName(meta.englishName), color);
        }
    }

    return lookup;
})();

const PARTY_ALIAS_LOOKUP = (() => {
    const aliasLookup = new Map<string, string>();
    for (const [aliasName, canonicalName] of Object.entries(PARTY_COLOR_ALIASES)) {
        aliasLookup.set(
            normalizePartyName(aliasName),
            normalizePartyName(canonicalName)
        );
    }
    return aliasLookup;
})();

const PARTY_RANK_LOOKUP = (() => {
    const lookup = new Map<string, number>();
    const rankedParties =
        (politicalParties2026Dataset as { parties?: PoliticalPartyRankMeta[] })
            .parties ?? [];

    for (const party of rankedParties) {
        const overallRank = Number(party.ranking?.overall);
        if (!Number.isFinite(overallRank) || overallRank <= 0) continue;

        const rankKeys = [party.name, party.shortName].filter(Boolean) as string[];
        for (const rankKey of rankKeys) {
            for (const key of buildPartyMatchKeys(rankKey)) {
                const existing = lookup.get(key);
                if (!existing || overallRank < existing) {
                    lookup.set(key, overallRank);
                }
            }
        }
    }

    return lookup;
})();

function normalizePartyName(value: string): string {
    return value
        .normalize("NFKC")
        .toLowerCase()
        .replace(PARTY_SINGLE_SYMBOL_MARK, " ")
        .replace(/['’]/g, " ")
        .replace(/[()]/g, " ")
        .replace(/[–—−-]/g, " ")
        .replace(/[,:.&/]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function buildPartyMatchKeys(value: string): string[] {
    const keys = new Set<string>();
    const queue = [normalizePartyName(value)];

    while (queue.length > 0) {
        const current = queue.shift();
        if (!current || keys.has(current)) continue;

        keys.add(current);

        const aliasCanonical = PARTY_ALIAS_LOOKUP.get(current);
        if (aliasCanonical && !keys.has(aliasCanonical)) {
            queue.push(aliasCanonical);
        }

        for (const [pattern, replacement] of PARTY_TEXT_VARIANTS) {
            if (!pattern.test(current)) continue;
            queue.push(current.replace(pattern, replacement));
        }

        if (current.endsWith(" nepal")) {
            queue.push(current.replace(/\s+nepal$/, ""));
        } else {
            queue.push(`${current} nepal`);
        }

        for (const rule of PARTY_WIKI_PATTERN_ALIASES) {
            if (rule.pattern.test(current)) {
                queue.push(normalizePartyName(rule.canonical));
            }
        }
    }

    return [...keys];
}

function getPartyRank(value: string | null | undefined): number | null {
    if (!value) return null;

    let bestRank: number | null = null;
    for (const key of buildPartyMatchKeys(value)) {
        const rank = PARTY_RANK_LOOKUP.get(key);
        if (!rank) continue;
        if (bestRank === null || rank < bestRank) {
            bestRank = rank;
        }
    }

    return bestRank;
}

function getPartyColor(value: string | null | undefined): string | null {
    if (!value) return null;
    for (const key of buildPartyMatchKeys(value)) {
        const color = PARTY_COLOR_LOOKUP.get(key);
        if (color) return color;
    }
    return null;
}

function withHexAlpha(color: string, alphaHex: string): string {
    const alpha = alphaHex.replace("#", "");
    if (!/^#[0-9a-f]{6}$/i.test(color) || !/^[0-9a-f]{2}$/i.test(alpha)) {
        return color;
    }
    return `${color}${alpha}`;
}

async function fetchVerifiedDistrictProfile(
    district: string
): Promise<DistrictVerifiedProfile | null> {
    const response = await fetch(
        `/api/election/district-profile?district=${encodeURIComponent(district)}&v=${DISTRICT_PROFILE_QUERY_VERSION}`
    );

    if (!response.ok) return null;

    const payload = (await response.json()) as DistrictProfileApiResponse;
    if (!payload.success || !payload.data) return null;
    return payload.data;
}

function SourceReference({
    label,
    href,
}: {
    label: string;
    href?: string;
}) {
    if (!href) {
        return <span>{label}</span>;
    }

    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
        >
            {label}
            <ExternalLink className="h-3 w-3" />
        </a>
    );
}

function PanelSection({
    title,
    open,
    onToggle,
    meta,
    children,
}: {
    title: string;
    open: boolean;
    onToggle: () => void;
    meta?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="overflow-hidden border border-border/80 bg-card/60">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-3 border-b border-border/65 px-4 py-3 text-left transition-colors duration-200 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:px-5"
            >
                <div className="min-w-0 flex-1">
                    <h3 className="home-title-md text-[1.2rem] !leading-[1.15]">
                        {title}
                    </h3>
                    {meta ? (
                        <p className="mt-1 line-clamp-2 font-mono text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
                            {meta}
                        </p>
                    ) : null}
                </div>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        open ? "rotate-180" : "rotate-0"
                    )}
                />
            </button>

            <AnimatePresence initial={false}>
                {open ? (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 md:p-5">{children}</div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </section>
    );
}

export function DistrictNewsPanel({ district, onClose }: DistrictNewsPanelProps) {
    const { setSelectedDistrict } = useElectionStore();
    const { language } = useLanguage();
    const [openSections, setOpenSections] =
        useState<Record<SectionKey, boolean>>(DEFAULT_SECTION_STATE);

    const locale = language === "ne" ? "ne-NP" : "en-US";
    const fallbackProfile = useMemo(
        () => (district ? getDistrictElectionProfileByName(district) : null),
        [district]
    );

    const horProfile = useMemo(
        () => (district ? getHorDistrictProfileByName(district) : null),
        [district]
    );

    const { data: verifiedProfile, isFetching: isVerifiedFetching } = useQuery({
        queryKey: ["district-verified-profile", DISTRICT_PROFILE_QUERY_VERSION, district],
        queryFn: () =>
            district
                ? fetchVerifiedDistrictProfile(district)
                : Promise.resolve(null),
        enabled: Boolean(district),
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60 * 6,
        retry: 1,
    });

    useEffect(() => {
        if (!district) return;
        setOpenSections(DEFAULT_SECTION_STATE);
    }, [district]);

    const profile = verifiedProfile ?? fallbackProfile;
    const districtCandidates = verifiedProfile?.fptpCandidates ?? [];
    const panelTitle = profile?.districtName ?? district ?? "";
    const sortedDistrictCandidates = useMemo(() => {
        if (districtCandidates.length === 0) return [];

        const fallbackPartyRankMap = new Map<string, number>();
        profile?.summary.partyWins.forEach((party, index) => {
            const fallbackRank = index + 1;
            for (const key of buildPartyMatchKeys(party.party)) {
                const existing = fallbackPartyRankMap.get(key);
                if (!existing || fallbackRank < existing) {
                    fallbackPartyRankMap.set(key, fallbackRank);
                }
            }
        });

        const resolvedPartyRankMap = new Map<string, number>();
        for (const candidate of districtCandidates) {
            const partyName = candidate.partyName;
            if (!partyName || resolvedPartyRankMap.has(partyName)) continue;

            const officialRank = getPartyRank(partyName);
            if (officialRank !== null) {
                resolvedPartyRankMap.set(partyName, officialRank);
                continue;
            }

            let fallbackRank: number | null = null;
            for (const key of buildPartyMatchKeys(partyName)) {
                const rank = fallbackPartyRankMap.get(key);
                if (!rank) continue;
                if (fallbackRank === null || rank < fallbackRank) {
                    fallbackRank = rank;
                }
            }

            resolvedPartyRankMap.set(
                partyName,
                fallbackRank ?? Number.MAX_SAFE_INTEGER
            );
        }

        return [...districtCandidates].sort((a, b) => {
            const aRank =
                resolvedPartyRankMap.get(a.partyName) ?? Number.MAX_SAFE_INTEGER;
            const bRank =
                resolvedPartyRankMap.get(b.partyName) ?? Number.MAX_SAFE_INTEGER;
            if (aRank !== bRank) return aRank - bRank;

            const aCon = a.constituency ?? 999;
            const bCon = b.constituency ?? 999;
            if (aCon !== bCon) return aCon - bCon;

            const partyNameCompare = (a.partyName || "").localeCompare(
                b.partyName || "",
                "ne"
            );
            if (partyNameCompare !== 0) return partyNameCompare;

            return (a.candidateName || "").localeCompare(
                b.candidateName || "",
                "ne"
            );
        });
    }, [districtCandidates, profile?.summary.partyWins]);

    const compactNumber = useMemo(
        () =>
            new Intl.NumberFormat(locale, {
                notation: "compact",
                maximumFractionDigits: 1,
            }),
        [locale]
    );
    const fullNumber = useMemo(() => new Intl.NumberFormat(locale), [locale]);

    const sourceLabel = (
        key: DistrictSourceKey,
        fallback = "The Leaders Findings"
    ): string => verifiedProfile?.sources?.[key]?.label ?? fallback;

    const sourceUrl = (key: DistrictSourceKey): string | undefined =>
        verifiedProfile?.sources?.[key]?.url;

    const toggleSection = (key: SectionKey) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleClose = () => {
        setSelectedDistrict(null);
        onClose?.();
    };

    const leadingParty = profile?.summary.partyWins[0] ?? null;
    const leadingPartyColor = leadingParty ? getPartyColor(leadingParty.party) : null;

    const summaryMetrics = profile
        ? [
            {
                label: "Constituencies",
                value: fullNumber.format(profile.summary.constituencyCount),
            },
            {
                label: "Avg Turnout",
                value: `${profile.summary.avgTurnoutPercent}%`,
            },
            {
                label: "Total Votes",
                value: compactNumber.format(profile.summary.totalVotes),
            },
        ]
        : [];

    return (
        <AnimatePresence>
            {district && (
                <motion.aside
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 280 }}
                    className="homepage-shell custom-scrollbar fixed inset-y-0 right-0 z-[100] h-screen w-full overflow-y-auto border-l border-border/80 bg-background shadow-2xl md:w-[600px]"
                >
                    <div className="sticky top-0 z-20 border-b border-border/80 bg-background/95 p-5 backdrop-blur md:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <span className="home-kicker">
                                    District Intelligence
                                </span>
                                <h2 className="mt-2 home-title-md text-foreground">
                                    {panelTitle}
                                </h2>
                                {profile && (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {profile.province} Province • HQ:{" "}
                                        {profile.headquarters}
                                    </p>
                                )}
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <span
                                        className="border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.17em]"
                                        style={{
                                            borderColor: "#4169E1",
                                            color: "#4169E1",
                                            backgroundColor: "#4169E11A",
                                        }}
                                    >
                                        March 5, 2026 · 2082 Election
                                    </span>
                                    {horProfile && horProfile.constituencyResults.length > 0 && (
                                        <span
                                            className="border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em]"
                                            style={{
                                                borderColor: "#059669",
                                                color: "#059669",
                                                backgroundColor: "#0596691A",
                                            }}
                                        >
                                            {horProfile.constituencyResults.length} HoR Seat
                                            {horProfile.constituencyResults.length > 1 ? "s" : ""}
                                        </span>
                                    )}
                                    {leadingParty && leadingPartyColor && (
                                        <span
                                            className="inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em]"
                                            style={{
                                                borderColor: withHexAlpha(leadingPartyColor, "66"),
                                                color: leadingPartyColor,
                                                backgroundColor: withHexAlpha(leadingPartyColor, "12"),
                                            }}
                                        >
                                            <span
                                                className="inline-block h-1.5 w-1.5 rounded-full"
                                                style={{ backgroundColor: leadingPartyColor }}
                                            />
                                            {leadingParty.party} · {leadingParty.wins} seat{leadingParty.wins > 1 ? "s" : ""}
                                        </span>
                                    )}
                                    <span className="border border-border/75 bg-muted/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.17em] text-muted-foreground">
                                        {verifiedProfile
                                            ? "Verified"
                                            : "Local data"}
                                    </span>
                                    {isVerifiedFetching && (
                                        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Syncing
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleClose}
                                aria-label="Close district panel"
                                className="h-10 w-10 shrink-0 rounded-none border border-border/75 bg-card/60 text-foreground transition-colors hover:bg-muted/40"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {summaryMetrics.length > 0 ? (
                            <div className="mt-4 grid grid-cols-3 gap-2">
                                {summaryMetrics.map((item) => (
                                    <div
                                        key={item.label}
                                        className="border border-border/75 bg-card/50 px-3 py-2"
                                    >
                                        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                                            {item.label}
                                        </p>
                                        <p className="mt-1 font-editorial text-[1.4rem] leading-none text-foreground">
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <div className="space-y-5 p-5 md:p-6">
                        {!profile ? (
                            <div className="border border-border/80 bg-card/40 p-5 text-sm text-muted-foreground">
                                District data could not be matched for this map
                                selection.
                            </div>
                        ) : (
                            <>
                                <section className="border border-border/80 bg-card/55 p-5">
                                    <p className="home-body text-[15px] leading-7 text-muted-foreground">
                                        {profile.description}
                                    </p>
                                    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.13em]">
                                            Description source
                                        </span>
                                        <SourceReference
                                            label={sourceLabel("description")}
                                            href={sourceUrl("description")}
                                        />
                                    </div>
                                </section>

                                {openSections.partyWins && (
                                <PanelSection
                                    title="Party Wins · 2026 FPTP"
                                    open={openSections.partyWins}
                                    onToggle={() => toggleSection("partyWins")}
                                >
                                    {profile.summary.partyWins.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No party wins data available.
                                        </p>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {profile.summary.partyWins.map(
                                                (party) => {
                                                    const seatShare =
                                                        profile.summary
                                                            .constituencyCount >
                                                            0
                                                            ? toOneDecimal(
                                                                (party.wins /
                                                                    profile
                                                                        .summary
                                                                        .constituencyCount) *
                                                                100
                                                            )
                                                            : 0;
                                                    const partyColor =
                                                        getPartyColor(
                                                            party.party
                                                        );

                                                    return (
                                                        <div
                                                            key={party.party}
                                                            className="border border-border/70 bg-background/65 p-3"
                                                            style={
                                                                partyColor
                                                                    ? {
                                                                        borderColor:
                                                                            withHexAlpha(
                                                                                partyColor,
                                                                                "66"
                                                                            ),
                                                                        backgroundColor:
                                                                            withHexAlpha(
                                                                                partyColor,
                                                                                "10"
                                                                            ),
                                                                    }
                                                                    : undefined
                                                            }
                                                        >
                                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                                <div className="flex items-center gap-2">
                                                                    {partyColor && (
                                                                        <span
                                                                            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                                                                            style={{ backgroundColor: partyColor }}
                                                                        />
                                                                    )}
                                                                    <p className="text-sm font-medium text-foreground">
                                                                        {party.party}
                                                                    </p>
                                                                </div>
                                                                <p className="font-mono text-xs text-muted-foreground">
                                                                    {party.wins}{" "}
                                                                    seat
                                                                    {party.wins >
                                                                        1
                                                                        ? "s"
                                                                        : ""}{" "}
                                                                    ({seatShare}
                                                                    %)
                                                                </p>
                                                            </div>
                                                            <div className="h-1.5 overflow-hidden bg-muted/60">
                                                                <div
                                                                    className="h-full transition-all duration-500"
                                                                    style={{
                                                                        width: `${Math.max(
                                                                            seatShare,
                                                                            party.wins >
                                                                                0
                                                                                ? 8
                                                                                : 0
                                                                        )}%`,
                                                                        backgroundColor:
                                                                            partyColor ??
                                                                            "hsl(var(--primary))",
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </PanelSection>
                                )}

                                <PanelSection
                                    title="Know your HoR"
                                    open={openSections.knowYourHor}
                                    onToggle={() => toggleSection("knowYourHor")}
                                    meta="House of Representatives"
                                >
                                    {!horProfile ? (
                                        <p className="text-sm text-muted-foreground">
                                            2026 HoR data is not available for
                                            this district.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {horProfile.constituencyResults.map(
                                                (result, index) => {
                                                    const winnerPartyColor =
                                                        getPartyColor(
                                                            result.winnerParty
                                                        );
                                                    const leadingColor =
                                                        winnerPartyColor;

                                                    return (
                                                        <div
                                                            key={
                                                                result.constituencyCode
                                                            }
                                                            className="overflow-hidden border border-border/75 bg-card/40"
                                                            style={
                                                                leadingColor
                                                                    ? {
                                                                          borderLeft: `4px solid ${leadingColor}`,
                                                                          backgroundColor:
                                                                              withHexAlpha(
                                                                                  leadingColor,
                                                                                  "08"
                                                                              ),
                                                                      }
                                                                    : undefined
                                                            }
                                                        >
                                                            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border/50 bg-muted/25 px-4 py-3">
                                                                <div>
                                                                    <p className="home-title-md text-[1.05rem] !leading-[1.2] text-foreground">
                                                                        {
                                                                            result.constituencyName
                                                                        }
                                                                    </p>
                                                                    <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                                                                        Seat #
                                                                        {index +
                                                                            1}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                                                                        Turnout
                                                                    </p>
                                                                    <p className="font-mono text-sm font-semibold text-foreground">
                                                                        {
                                                                            result.turnoutPercent
                                                                        }
                                                                        %
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="p-4">
                                                                <div className="mb-3 flex items-center justify-between gap-3 rounded-none border-2 px-4 py-3"
                                                                    style={
                                                                        winnerPartyColor
                                                                            ? {
                                                                                  borderColor:
                                                                                      withHexAlpha(
                                                                                          winnerPartyColor,
                                                                                          "55"
                                                                                      ),
                                                                                  backgroundColor:
                                                                                      withHexAlpha(
                                                                                          winnerPartyColor,
                                                                                          "14"
                                                                                      ),
                                                                              }
                                                                            : undefined
                                                                    }
                                                                        >
                                                                            <div className="min-w-0 flex-1">
                                                                                <div className="mb-1.5 flex items-center gap-2">
                                                                                    <span
                                                                                className="inline-block rounded-full bg-emerald-500/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-white"
                                                                            >
                                                                                Winner
                                                                            </span>
                                                                            {winnerPartyColor && (
                                                                                <span
                                                                                    className="inline-block h-2 w-2 rounded-full"
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            winnerPartyColor,
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        <p className="truncate font-semibold text-foreground">
                                                                            {
                                                                                result.winnerName
                                                                            }
                                                                        </p>
                                                                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                                            <span
                                                                                className="inline-flex items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]"
                                                                                style={
                                                                                    winnerPartyColor
                                                                                        ? {
                                                                                              borderColor: withHexAlpha(
                                                                                                  winnerPartyColor,
                                                                                                  "70"
                                                                                              ),
                                                                                              backgroundColor: withHexAlpha(
                                                                                                  winnerPartyColor,
                                                                                                  "20"
                                                                                              ),
                                                                                              color: winnerPartyColor,
                                                                                          }
                                                                                        : undefined
                                                                                }
                                                                            >
                                                                                {
                                                                                    result.winnerPartyAbbr
                                                                                }
                                                                            </span>
                                                                            <span className="font-mono text-[10px] text-muted-foreground">
                                                                                {
                                                                                    result.winnerParty
                                                                                }
                                                                            </span>
                                                                            <span className="text-muted-foreground/60">
                                                                                •
                                                                            </span>
                                                                            <span className="font-mono text-[10px] text-muted-foreground">
                                                                                {
                                                                                    result.winnerSymbol
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                            </div>
                                                                    <div className="shrink-0 text-right">
                                                                        <p className="font-editorial text-[1.6rem] leading-none text-foreground">
                                                                            {fullNumber.format(
                                                                                result.winnerVotes
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </PanelSection>

                                {openSections.constituencies && (
                                <PanelSection
                                    title="Constituency Results · 2026"
                                    open={openSections.constituencies}
                                    onToggle={() =>
                                        toggleSection("constituencies")
                                    }
                                >
                                    {profile.constituencyResults.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            Constituency-level result rows are
                                            not available for this district.
                                        </p>
                                    ) : (
                                        <div className="overflow-hidden border border-border/75">
                                            {profile.constituencyResults.map(
                                                (result, index) => {
                                                    const winnerPartyColor =
                                                        getPartyColor(
                                                            result.winnerParty
                                                        );
                                                    const runnerUpPartyColor =
                                                        getPartyColor(
                                                            result.runnerUpParty
                                                        );
                                                    const leadingPartyColor =
                                                        winnerPartyColor ??
                                                        runnerUpPartyColor;

                                                    return (
                                                        <div
                                                            key={
                                                                result.constituencyCode
                                                            }
                                                            className="border-b border-border/65 bg-card/40 p-4 last:border-b-0"
                                                            style={
                                                                leadingPartyColor
                                                                    ? {
                                                                        borderLeft: `3px solid ${leadingPartyColor}`,
                                                                        backgroundColor:
                                                                            withHexAlpha(
                                                                                leadingPartyColor,
                                                                                "08"
                                                                            ),
                                                                    }
                                                                    : undefined
                                                            }
                                                        >
                                                            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                                                                <div>
                                                                    <p className="home-title-md text-[1.1rem] !leading-[1.2] text-foreground">
                                                                        {
                                                                            result.constituencyName
                                                                        }
                                                                    </p>
                                                                    <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                                                                        Seat #{index + 1}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                                                        Turnout
                                                                    </p>
                                                                    <p className="font-mono text-sm font-medium text-foreground">
                                                                        {result.turnoutPercent}%
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between gap-3 rounded-none border border-border/50 bg-background/60 px-3 py-2">
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                                                                            Winner
                                                                        </p>
                                                                        <p className="truncate text-sm font-semibold text-foreground">
                                                                            {result.winnerName}
                                                                        </p>
                                                                        <span
                                                                            className="mt-0.5 inline-flex items-center border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]"
                                                                            style={
                                                                                winnerPartyColor
                                                                                    ? {
                                                                                        borderColor: withHexAlpha(winnerPartyColor, "66"),
                                                                                        backgroundColor: withHexAlpha(winnerPartyColor, "1A"),
                                                                                        color: winnerPartyColor,
                                                                                    }
                                                                                    : undefined
                                                                            }
                                                                        >
                                                                            {result.winnerParty}
                                                                        </span>
                                                                    </div>
                                                                    <p className="shrink-0 font-editorial text-[1.4rem] leading-none text-foreground">
                                                                        {fullNumber.format(result.winnerVotes)}
                                                                    </p>
                                                                </div>

                                                                <div className="flex items-center justify-between gap-3 px-3 py-2 opacity-80">
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                                                                            Runner-up
                                                                        </p>
                                                                        <p className="truncate text-sm text-foreground">
                                                                            {result.runnerUpName}
                                                                        </p>
                                                                        <span
                                                                            className="mt-0.5 inline-flex items-center border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]"
                                                                            style={
                                                                                runnerUpPartyColor
                                                                                    ? {
                                                                                        borderColor: withHexAlpha(runnerUpPartyColor, "66"),
                                                                                        backgroundColor: withHexAlpha(runnerUpPartyColor, "1A"),
                                                                                        color: runnerUpPartyColor,
                                                                                    }
                                                                                    : undefined
                                                                            }
                                                                        >
                                                                            {result.runnerUpParty}
                                                                        </span>
                                                                    </div>
                                                                    <p className="shrink-0 font-mono text-sm text-foreground">
                                                                        {fullNumber.format(result.runnerUpVotes)}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="mt-2.5 grid grid-cols-3 gap-2 border-t border-dashed border-border/60 pt-2.5 text-xs">
                                                                <div>
                                                                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                                                                        Margin
                                                                    </p>
                                                                    <p className="mt-0.5 font-mono font-medium text-foreground">
                                                                        {fullNumber.format(result.marginVotes)}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                                                                        Vote Share
                                                                    </p>
                                                                    <p className="mt-0.5 font-mono font-medium text-foreground">
                                                                        {result.winnerVoteShare}%
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                                                                        Valid Votes
                                                                    </p>
                                                                    <p className="mt-0.5 font-mono font-medium text-foreground">
                                                                        {fullNumber.format(result.validVotes)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </PanelSection>
                                )}

                                {openSections.snapshot && (
                                <PanelSection
                                    title="Election Snapshot · 2026"
                                    open={openSections.snapshot}
                                    onToggle={() => toggleSection("snapshot")}
                                    meta={sourceLabel("electionData")}
                                >
                                    {verifiedProfile?.sources.electionData
                                        .note && (
                                            <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
                                                {
                                                    verifiedProfile.sources
                                                        .electionData.note
                                                }
                                            </p>
                                        )}
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {[
                                            {
                                                label: "Constituencies",
                                                value: fullNumber.format(
                                                    profile.summary
                                                        .constituencyCount
                                                ),
                                            },
                                            {
                                                label: "Total Votes",
                                                value: fullNumber.format(
                                                    profile.summary.totalVotes
                                                ),
                                            },
                                            {
                                                label: "Valid Votes",
                                                value: fullNumber.format(
                                                    profile.summary.validVotes
                                                ),
                                            },
                                            {
                                                label: "Avg Turnout",
                                                value: `${profile.summary.avgTurnoutPercent}%`,
                                            },
                                            {
                                                label: "Closest Margin",
                                                value: fullNumber.format(
                                                    profile.summary
                                                        .closestMarginVotes
                                                ),
                                            },
                                            {
                                                label: "Widest Margin",
                                                value: fullNumber.format(
                                                    profile.summary
                                                        .widestMarginVotes
                                                ),
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className="border border-border/70 bg-background/70 p-3"
                                            >
                                                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                                                    {item.label}
                                                </p>
                                                <p className="mt-1 font-editorial text-2xl leading-none text-foreground">
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </PanelSection>
                                )}

                                {openSections.candidates && (
                                <PanelSection
                                    title="FPTP Candidates (2082)"
                                    open={openSections.candidates}
                                    onToggle={() => toggleSection("candidates")}
                                    meta={`${sortedDistrictCandidates.length} candidates`}
                                >
                                    {verifiedProfile?.sources.candidateData
                                        .note && (
                                            <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
                                                {
                                                    verifiedProfile.sources
                                                        .candidateData.note
                                                }
                                            </p>
                                        )}
                                    <div className="custom-scrollbar max-h-[460px] overflow-y-auto border border-border/75">
                                        {sortedDistrictCandidates.length === 0 ? (
                                            <div className="p-4 text-sm text-muted-foreground">
                                                Candidate roster is not
                                                available for this district.
                                            </div>
                                        ) : (
                                            sortedDistrictCandidates.map(
                                                (candidate, index) => {
                                                    const partyColor =
                                                        getPartyColor(
                                                            candidate.partyName
                                                        );

                                                    return (
                                                        <div
                                                            key={`${candidate.sourceSerialNo}-${candidate.candidateId ?? index}`}
                                                            className="border-b border-border/65 bg-card/35 p-4 last:border-b-0"
                                                            style={
                                                                partyColor
                                                                    ? {
                                                                        borderLeft: `3px solid ${partyColor}`,
                                                                        backgroundColor:
                                                                            withHexAlpha(
                                                                                partyColor,
                                                                                "08"
                                                                            ),
                                                                    }
                                                                    : undefined
                                                            }
                                                        >
                                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate font-medium text-foreground">
                                                                        {
                                                                            candidate.candidateName
                                                                        }
                                                                    </p>
                                                                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                                                        <span
                                                                            className="inline-flex items-center border px-1.5 py-0.5"
                                                                            style={
                                                                                partyColor
                                                                                    ? {
                                                                                        borderColor:
                                                                                            withHexAlpha(
                                                                                                partyColor,
                                                                                                "66"
                                                                                            ),
                                                                                        backgroundColor:
                                                                                            withHexAlpha(
                                                                                                partyColor,
                                                                                                "1A"
                                                                                            ),
                                                                                        color: partyColor,
                                                                                    }
                                                                                    : undefined
                                                                            }
                                                                        >
                                                                            {
                                                                                candidate.partyName
                                                                            }
                                                                        </span>
                                                                        <span aria-hidden>
                                                                            •
                                                                        </span>
                                                                        <span>
                                                                            {
                                                                                candidate.symbolName
                                                                            }
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                                                        Constituency
                                                                    </p>
                                                                    <p className="font-mono text-sm text-foreground">
                                                                        {candidate.constituency ??
                                                                            "-"}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                                                                <span>
                                                                    Gender:{" "}
                                                                    {candidate.gender ||
                                                                        "-"}
                                                                </span>
                                                                <span>
                                                                    Age:{" "}
                                                                    {candidate.age ??
                                                                        "-"}
                                                                </span>
                                                                <span>
                                                                    Education:{" "}
                                                                    {candidate.education ??
                                                                        "-"}
                                                                </span>
                                                            </div>

                                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                                {candidate.electionStatus ? (
                                                                    <span className="inline-flex items-center border border-border/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                                                        {
                                                                            candidate.electionStatus
                                                                        }
                                                                    </span>
                                                                ) : null}
                                                                <Link
                                                                    href={`/election-2026/profiles/${candidate.profileSlug}`}
                                                                    className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                                                                >
                                                                    View
                                                                    candidate
                                                                    profile
                                                                    <ExternalLink className="h-3 w-3" />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )
                                        )}
                                    </div>
                                </PanelSection>
                                )}

                                <PanelSection
                                    title="Data Trust Layer"
                                    open={openSections.trust}
                                    onToggle={() => toggleSection("trust")}
                                >
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {verifiedProfile
                                            ? "Demographics and election rows are verified from Wikipedia and Wikidata where possible. Missing fields automatically fall back to local district and candidate datasets."
                                            : "Showing local district, election, and candidate data. Live Wikipedia/Wikidata verification is not available for this district right now."}
                                    </p>
                                    <div className="mt-3 grid gap-2 text-[11px] text-muted-foreground">
                                        <p>
                                            Description:{" "}
                                            {sourceLabel("description")}
                                        </p>
                                        <p>
                                            Election:{" "}
                                            {sourceLabel("electionData")}
                                        </p>
                                        <p>
                                            Candidates:{" "}
                                            {sourceLabel("candidateData")}
                                        </p>
                                    </div>
                                    {verifiedProfile?.wikiSummary?.pageUrl && (
                                        <a
                                            href={
                                                verifiedProfile.wikiSummary
                                                    .pageUrl
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                                        >
                                            Source page
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                    {verifiedProfile && (
                                        <p className="mt-2 text-[11px] text-muted-foreground">
                                            Last verified:{" "}
                                            {new Date(
                                                verifiedProfile.verifiedAt
                                            ).toLocaleString(locale, {
                                                year: "numeric",
                                                month: "short",
                                                day: "2-digit",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    )}
                                    {verifiedProfile?.notes.length ? (
                                        <div className="mt-3 border border-border/70 bg-background/55 p-3 text-[11px] text-muted-foreground">
                                            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground">
                                                Verification notes
                                            </p>
                                            <ul className="space-y-1">
                                                {verifiedProfile.notes.map(
                                                    (note, index) => (
                                                        <li
                                                            key={`${index}-${note}`}
                                                            className="leading-relaxed"
                                                        >
                                                            • {note}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    ) : null}
                                </PanelSection>
                            </>
                        )}
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}

"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
    ArrowLeft,
    ChartNoAxesColumnIncreasing,
    GitCompareArrows,
    MapPinned,
    UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import type { CandidateDataSummary } from "@/lib/candidate-data-summary";
import { LOCALES, tString } from "@/lib/locales";
import { cn } from "@/lib/utils";

export interface CandidateSnapshotMetrics {
    summary: CandidateDataSummary;
    uniquePartyCount: number;
    fptpSharePercent: number;
    prSharePercent: number;
    districtCoveragePercent: number;
    constituencyCoveragePercent: number;
    provinceCoveragePercent: number;
    avgFptpCandidatesPerConstituency: number;
    femaleCount: number;
    femaleSharePercent: number;
    maleCount: number;
    maleSharePercent: number;
}

interface SnapshotFactsClientProps {
    metrics: CandidateSnapshotMetrics | null;
}

const formatNumber = (value: number, language: "en" | "ne") =>
    value.toLocaleString(language === "ne" ? "ne-NP" : "en-US");

const formatPercent = (value: number) =>
    `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}%`;

const COVERAGE_BASELINES = {
    districts: 77,
    constituencies: 165,
    provinces: 7,
} as const;

export function SnapshotFactsClient({ metrics }: SnapshotFactsClientProps) {
    const { language } = useLanguage();
    const shouldReduceMotion = useReducedMotion();
    const candidateLocale = LOCALES.election2026.candidateSnapshot;

    if (!metrics) {
        return (
            <section className="homepage-shell election-typography border-y border-border/80 bg-background py-12">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="border border-border/70 bg-card/60 p-6 sm:p-8">
                        <Badge className="home-kicker border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
                            {tString(candidateLocale.title, language)}
                        </Badge>
                        <h1 className="home-title-lg mt-4 text-foreground">
                            {language === "en"
                                ? "Candidate data is currently unavailable."
                                : "उम्मेदवार तथ्याङ्क हाल उपलब्ध छैन।"}
                        </h1>
                        <p className="home-body mt-3 max-w-2xl">
                            {language === "en"
                                ? "We couldn't load the latest candidate datasets right now. Please retry shortly."
                                : "हालका उम्मेदवार डाटासेट लोड गर्न सकिएन। कृपया केही समयपछि पुनः प्रयास गर्नुहोस्।"}
                        </p>
                        <Link href="/election-2026" className="mt-6 inline-block">
                            <Button
                                variant="outline"
                                className="border-primary/50 bg-background/60 font-mono text-[10px] uppercase tracking-[0.13em] text-primary hover:bg-primary/10 hover:text-primary"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {language === "en"
                                    ? "Back to Election Hub"
                                    : "निर्वाचन हबमा फर्किनुहोस्"}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    const { summary } = metrics;
    const genderRows = summary.genderBreakdown
        .filter((entry) => entry.count > 0)
        .sort((a, b) => b.count - a.count);

    const headlineCards = [
        {
            id: "total-candidates",
            label: language === "en" ? "Total Candidates" : "जम्मा उम्मेदवार",
            value: formatNumber(summary.totalCandidates, language),
            note:
                language === "en"
                    ? `${formatNumber(summary.fptpCandidates, language)} FPTP + ${formatNumber(summary.prCandidates, language)} PR`
                    : `${formatNumber(summary.fptpCandidates, language)} प्रत्यक्ष + ${formatNumber(summary.prCandidates, language)} समानुपातिक`,
            icon: UsersRound,
        },
        {
            id: "party-representation",
            label: language === "en" ? "Parties Represented" : "प्रतिनिधित्व भएका दल",
            value: formatNumber(metrics.uniquePartyCount, language),
            note:
                language === "en"
                    ? "Distinct parties across both ballots"
                    : "दुवै मत प्रणालीमा देखा परेका फरक दल",
            icon: GitCompareArrows,
        },
        {
            id: "fptp-intensity",
            label:
                language === "en"
                    ? "FPTP Candidates per Constituency"
                    : "प्रति निर्वाचन क्षेत्र प्रत्यक्ष उम्मेदवार",
            value: metrics.avgFptpCandidatesPerConstituency.toFixed(1),
            note:
                language === "en"
                    ? `${formatNumber(summary.fptpConstituencies, language)} constituencies covered`
                    : `${formatNumber(summary.fptpConstituencies, language)} निर्वाचन क्षेत्र समेटिएको`,
            icon: ChartNoAxesColumnIncreasing,
        },
        {
            id: "women-share",
            label: language === "en" ? "Women Candidates Share" : "महिला उम्मेदवार अनुपात",
            value: formatPercent(metrics.femaleSharePercent),
            note:
                language === "en"
                    ? `${formatNumber(metrics.femaleCount, language)} women candidates`
                    : `${formatNumber(metrics.femaleCount, language)} महिला उम्मेदवार`,
            icon: UsersRound,
        },
    ];

    return (
        <section className="homepage-shell election-typography relative overflow-hidden border-y border-border/80 bg-background py-10 sm:py-12">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(183,28,28,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(183,28,28,0.04)_1px,transparent_1px)] bg-[size:98px_98px]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(95%_50%_at_50%_0%,rgba(183,28,28,0.2),transparent_72%)]" />

            <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 grid gap-5 border-b border-border/70 pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div className="space-y-3">
                        <Badge className="home-kicker border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
                            {tString(candidateLocale.title, language)}
                        </Badge>
                        <h1 className="home-title-lg text-foreground">
                            {language === "en"
                                ? "Latest Candidate Dataset Intelligence"
                                : "नवीनतम उम्मेदवार डाटासेट इन्टेलिजेन्स"}
                        </h1>
                        <p className="home-body max-w-3xl">
                            {language === "en"
                                ? "Clean, decision-ready summary from current PR and FPTP candidate datasets: scale, geographic completeness, and representation structure."
                                : "हालको समानुपातिक र प्रत्यक्ष उम्मेदवार डाटासेटबाट बनेको स्पष्ट सारांश: आकार, भौगोलिक समेटाइ र प्रतिनिधित्व संरचना।"}
                        </p>
                    </div>

                    <Link href="/election-2026" className="w-full lg:w-auto">
                        <Button
                            variant="outline"
                            className="w-full border-primary/50 bg-background/60 font-mono text-[10px] uppercase tracking-[0.13em] text-primary hover:bg-primary/10 hover:text-primary lg:w-auto"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {language === "en" ? "Back to Election Hub" : "निर्वाचन हबमा फर्किनुहोस्"}
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {headlineCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <motion.article
                                key={card.id}
                                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.28, delay: index * 0.04 }}
                                className="border border-border/75 bg-card/60 p-4"
                            >
                                <div className="inline-flex h-8 w-8 items-center justify-center border border-primary/35 bg-primary/10 text-primary">
                                    <Icon className="h-4 w-4" />
                                </div>
                                <p className="home-meta mt-3">
                                    {card.label}
                                </p>
                                <p className="mt-1 font-editorial text-[2rem] leading-none tracking-tight text-foreground">
                                    {card.value}
                                </p>
                                <p className="mt-2 text-[12px] leading-6 text-muted-foreground">
                                    {card.note}
                                </p>
                            </motion.article>
                        );
                    })}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                    <motion.article
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.3 }}
                        className="border border-border/75 bg-card/50 p-5"
                    >
                        <p className="home-meta">
                            {language === "en" ? "Candidate Mix" : "उम्मेदवार मिश्रण"}
                        </p>
                        <h2 className="home-title-md mt-2 text-foreground">
                            {language === "en"
                                ? "FPTP remains the larger candidate field."
                                : "प्रत्यक्ष प्रणालीमा उम्मेदवार संख्या बढी देखिन्छ।"}
                        </h2>

                        <div className="mt-5 space-y-4">
                            {[
                                {
                                    key: "fptp",
                                    label: language === "en" ? "FPTP Candidates" : "प्रत्यक्ष उम्मेदवार",
                                    count: summary.fptpCandidates,
                                    percentage: metrics.fptpSharePercent,
                                },
                                {
                                    key: "pr",
                                    label: language === "en" ? "PR Candidates" : "समानुपातिक उम्मेदवार",
                                    count: summary.prCandidates,
                                    percentage: metrics.prSharePercent,
                                },
                            ].map((row) => (
                                <div key={row.key}>
                                    <div className="mb-1 flex items-end justify-between gap-3">
                                        <p className="home-meta">
                                            {row.label}
                                        </p>
                                        <p className="text-sm text-foreground">
                                            {formatNumber(row.count, language)}{" "}
                                            <span className="text-muted-foreground">
                                                ({formatPercent(row.percentage)})
                                            </span>
                                        </p>
                                    </div>
                                                <div className="h-2 overflow-hidden bg-muted/30">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${Math.max(row.percentage, 1)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.article>

                    <motion.article
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.3, delay: 0.04 }}
                        className="border border-border/75 bg-card/50 p-5"
                    >
                        <div className="inline-flex h-8 w-8 items-center justify-center border border-primary/35 bg-primary/10 text-primary">
                            <MapPinned className="h-4 w-4" />
                        </div>
                        <p className="home-meta mt-3">
                            {language === "en" ? "Geographic Coverage" : "भौगोलिक समेटाइ"}
                        </p>

                        <div className="mt-4 space-y-4">
                            {[
                                {
                                    key: "districts",
                                    label: language === "en" ? "Districts" : "जिल्ला",
                                    value: summary.fptpDistricts,
                                    total: COVERAGE_BASELINES.districts,
                                    percentage: metrics.districtCoveragePercent,
                                },
                                {
                                    key: "constituencies",
                                    label:
                                        language === "en" ? "Constituencies" : "निर्वाचन क्षेत्र",
                                    value: summary.fptpConstituencies,
                                    total: COVERAGE_BASELINES.constituencies,
                                    percentage: metrics.constituencyCoveragePercent,
                                },
                                {
                                    key: "provinces",
                                    label: language === "en" ? "Provinces" : "प्रदेश",
                                    value: summary.provinces,
                                    total: COVERAGE_BASELINES.provinces,
                                    percentage: metrics.provinceCoveragePercent,
                                },
                            ].map((row) => (
                                <div key={row.key}>
                                    <div className="mb-1.5 flex items-center justify-between gap-3">
                                        <p className="home-meta">
                                            {row.label}
                                        </p>
                                        <p className="text-sm text-foreground">
                                            {formatNumber(row.value, language)}/{formatNumber(row.total, language)}
                                        </p>
                                    </div>
                                    <div className="h-2 overflow-hidden bg-muted/30">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${Math.max(row.percentage, 1)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.article>
                </div>

                <motion.article
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="mt-4 border border-border/75 bg-card/50 p-5"
                >
                    <p className="home-meta">
                        {language === "en"
                            ? "Gender Representation Snapshot"
                            : "लैंगिक प्रतिनिधित्व स्न्यापसट"}
                    </p>

                    <div className="mt-3 flex flex-wrap items-baseline gap-4 border-b border-border/70 pb-3">
                        <p className="text-sm text-muted-foreground">
                            {language === "en" ? "Women" : "महिला"}{" "}
                            <span className="font-medium text-foreground">
                                {formatNumber(metrics.femaleCount, language)} ({formatPercent(metrics.femaleSharePercent)})
                            </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {language === "en" ? "Men" : "पुरुष"}{" "}
                            <span className="font-medium text-foreground">
                                {formatNumber(metrics.maleCount, language)} ({formatPercent(metrics.maleSharePercent)})
                            </span>
                        </p>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {genderRows.map((entry) => {
                            const genderLabel = tString(
                                candidateLocale.genders[entry.gender],
                                language
                            );
                            return (
                                <div
                                    key={entry.gender}
                                    className="border border-border/70 bg-background/45 p-3"
                                >
                                    <div className="mb-1 flex items-end justify-between gap-3">
                                        <p className="home-meta">
                                            {genderLabel}
                                        </p>
                                        <p className="text-sm text-foreground">
                                            {formatNumber(entry.count, language)}{" "}
                                            <span className="text-muted-foreground">
                                                ({formatPercent(entry.percentage)})
                                            </span>
                                        </p>
                                    </div>
                                    <div className="h-2 overflow-hidden bg-muted/35">
                                        <div
                                            className={cn(
                                                "h-full bg-primary",
                                                entry.gender === "Female" && "bg-primary/85",
                                                entry.gender === "Other" && "bg-primary/75",
                                                entry.gender === "Unknown" && "bg-primary/45"
                                            )}
                                            style={{ width: `${Math.max(entry.percentage, 1)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.article>
            </div>
        </section>
    );
}

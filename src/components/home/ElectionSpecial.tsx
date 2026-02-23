"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
    Activity,
    ArrowRight,
    CalendarDays,
    FileSearch,
    FileText,
    Printer,
    Scale,
    UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import type { LocalizedValue } from "@/lib/election-data";
import { getElectionSnapshotStats, type SnapshotIconKey } from "@/lib/election-snapshot-data";

type TrackKey = "briefs" | "factChecks" | "analysis";

type Localized = { en: string; ne: string };

interface Track {
    key: TrackKey;
    icon: React.ComponentType<{ className?: string }>;
    label: Localized;
    title: Localized;
    description: Localized;
    href: string;
    cta: Localized;
}

interface ModuleCard {
    icon: React.ComponentType<{ className?: string }>;
    title: Localized;
    desc: Localized;
    href: string;
}

type BriefPreview = {
    slug: string;
    title: LocalizedValue;
    summary: LocalizedValue;
    date: string;
    tags?: string[];
    image?: string;
};

type FactCheckPreview = {
    slug?: string;
    claim: LocalizedValue;
    verdict: "true" | "false" | "misleading" | "unverified";
    analysis: LocalizedValue;
    date: string;
    image?: string;
};

type AnalysisPreview = {
    slug: string;
    title_en: string;
    title_ne?: string;
    excerpt_en: string;
    excerpt_ne?: string;
    createdAt?: string;
    tags?: string[];
    image?: string;
};

interface ElectionSpecialProps {
    dailyBriefs?: BriefPreview[];
    factChecks?: FactCheckPreview[];
    analyses?: AnalysisPreview[];
}

function resolveLocalized(value: LocalizedValue | undefined, language: "en" | "ne") {
    if (!value) return "";
    if (typeof value === "string") return value;
    return language === "ne" ? value.ne || value.en || "" : value.en || value.ne || "";
}

function formatShortDate(dateString: string, language: "en" | "ne") {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(language === "ne" ? "ne-NP" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function clip(text: string, max = 128) {
    if (!text) return "";
    if (text.length <= max) return text;
    return `${text.slice(0, max).trim()}...`;
}

const SNAPSHOT_GRID_INITIAL_COUNT = 4;
const SNAPSHOT_GRID_STEP = 4;

const SNAPSHOT_ICON_MAP: Record<SnapshotIconKey, React.ComponentType<{ className?: string }>> = {
    calendar: CalendarDays,
    scale: Scale,
    users: UsersRound,
    fileText: FileText,
    printer: Printer,
    activity: Activity,
    fileSearch: FileSearch,
};

export function ElectionSpecial({
    dailyBriefs = [],
    factChecks = [],
    analyses = [],
}: ElectionSpecialProps) {
    const { language } = useLanguage();
    const locale = LOCALES.home.special;
    const [activeTrack, setActiveTrack] = useState<TrackKey>("briefs");
    const [visibleSnapshotGridCount, setVisibleSnapshotGridCount] = useState(SNAPSHOT_GRID_INITIAL_COUNT);
    const shouldReduceMotion = useReducedMotion();
    const isNepali = language === "ne";

    const tracks: Track[] = useMemo(
        () => [
            {
                key: "briefs",
                icon: FileText,
                label: { en: "Daily Briefs", ne: "दैनिक ब्रिफ" },
                title: {
                    en: "Daily Election Briefing Desk",
                    ne: "दैनिक निर्वाचन ब्रिफिङ डेस्क",
                },
                description: {
                    en: "High-signal updates from EC directives, campaign moves, and local field shifts.",
                    ne: "आयोग निर्देश, अभियान गतिविधि र स्थानीय परिवर्तनको उच्च-प्राथमिकता अद्यावधिक।",
                },
                href: "/election-2026/daily-brief",
                cta: { en: "Open Briefs", ne: "ब्रिफ खोल्नुहोस्" },
            },
            {
                key: "factChecks",
                icon: FileSearch,
                label: { en: "Fact Checks", ne: "तथ्य जाँच" },
                title: {
                    en: "Claim Verification Intelligence",
                    ne: "दाबी प्रमाणीकरण इन्टेलिजेन्स",
                },
                description: {
                    en: "Track false narratives, misleading claims, and evidence-backed verdicts.",
                    ne: "झुटा आख्यान, भ्रामक दाबी र प्रमाणमा आधारित निर्णयहरू ट्र्याक गर्नुहोस्।",
                },
                href: "/election-2026/fact-checks",
                cta: { en: "Review Cases", ne: "केस हेर्नुहोस्" },
            },
            {
                key: "analysis",
                icon: Scale,
                label: { en: "Analyses", ne: "विश्लेषण" },
                title: {
                    en: "Editorial Analysis Layer",
                    ne: "सम्पादकीय विश्लेषण तह",
                },
                description: {
                    en: "Long-form insights on institutions, incentives, and election power structures.",
                    ne: "संस्था, स्वार्थ र शक्ति संरचनामाथि गहन विश्लेषणात्मक सामग्री।",
                },
                href: "/election-2026/analyses",
                cta: { en: "Read Analyses", ne: "विश्लेषण पढ्नुहोस्" },
            },
        ],
        []
    );

    const stats = useMemo(() => getElectionSnapshotStats(language), [language]);

    const modules: ModuleCard[] = [
        {
            icon: Activity,
            title: { en: "Election Dashboard", ne: "निर्वाचन ड्यासबोर्ड" },
            desc: {
                en: "A unified view of all election data, coverage status, and live developments.",
                ne: "निर्वाचनसम्बन्धी सबै तथ्य, कभरेज र ताजा गतिविधिको एकीकृत दृश्य।",
            },
            href: "/election-2026",
        },
        {
            icon: FileText,
            title: { en: "Daily Brief Archive", ne: "दैनिक संक्षेप संग्रह" },
            desc: {
                en: "A chronological archive of daily updates, organized by topic and date.",
                ne: "मिति र विषयअनुसार व्यवस्थित दैनिक अपडेटहरूको कालक्रमिक संग्रह।",
            },
            href: "/election-2026/daily-brief",
        },
        {
            icon: FileSearch,
            title: { en: "Fact Check Vault", ne: "तथ्य जाँच भण्डार" },
            desc: {
                en: "Verified and debunked claims with full source references in one feed.",
                ne: "दावीहरू, निष्कर्ष र स्रोतसहितका प्रमाण — सबै एकै ठाउँमा।",
            },
            href: "/election-2026/fact-checks",
        },
        {
            icon: CalendarDays,
            title: { en: "Interactive Map", ne: "अन्तरक्रियात्मक नक्सा" },
            desc: {
                en: "Explore district-level results, candidate data, and regional voting patterns.",
                ne: "जिल्लागत विवरण र निर्वाचन प्रवृत्ति सजिलैसँग हेर्नुहोस्।",
            },
            href: "/election-2026/snapshot",
        },
    ];

    const active = tracks.find((track) => track.key === activeTrack) || tracks[0];
    const verdictLabel = {
        true: language === "en" ? "True" : "सत्य",
        false: language === "en" ? "False" : "असत्य",
        misleading: language === "en" ? "Misleading" : "भ्रामक",
        unverified: language === "en" ? "Unverified" : "अप्रमाणित",
    };

    const activeContent = useMemo(() => {
        if (activeTrack === "briefs") {
            return dailyBriefs.slice(0, 4).map((item) => ({
                href: `/election-2026/daily-brief/${item.slug}`,
                title: resolveLocalized(item.title, language),
                excerpt: clip(resolveLocalized(item.summary, language)),
                meta: formatShortDate(item.date, language),
                tone: "brief" as const,
                image: item.image,
                tag: item.tags?.[0] || (language === "en" ? "Daily Brief" : "दैनिक ब्रिफ"),
            }));
        }

        if (activeTrack === "factChecks") {
            return factChecks.slice(0, 4).map((item) => ({
                href: item.slug ? `/election-2026/fact-checks/${item.slug}` : "/election-2026/fact-checks",
                title: clip(resolveLocalized(item.claim, language), 120),
                excerpt: clip(resolveLocalized(item.analysis, language)),
                meta: [formatShortDate(item.date, language), verdictLabel[item.verdict]].filter(Boolean).join(" • "),
                tone: item.verdict,
                image: item.image,
                tag: language === "en" ? "Fact Check" : "तथ्य जाँच",
            }));
        }

        if (activeTrack === "analysis") {
            return analyses.slice(0, 4).map((item) => ({
                href: `/election-2026/analyses/${item.slug}`,
                title: language === "ne" ? item.title_ne || item.title_en : item.title_en,
                excerpt: clip(language === "ne" ? item.excerpt_ne || item.excerpt_en : item.excerpt_en),
                meta: formatShortDate(item.createdAt || "", language),
                tone: "analysis" as const,
                image: item.image,
                tag: item.tags?.[0] || (language === "en" ? "Analysis" : "विश्लेषण"),
            }));
        }

        return [];
    }, [activeTrack, analyses, dailyBriefs, factChecks, language, verdictLabel]);

    const featured = activeContent[0];
    const secondary = activeContent.slice(1);
    const snapshotPrimary = stats[0];
    const SnapshotPrimaryIcon = snapshotPrimary ? SNAPSHOT_ICON_MAP[snapshotPrimary.icon] : null;
    const snapshotGridAll = stats.slice(1);
    const snapshotGrid = snapshotGridAll.slice(0, visibleSnapshotGridCount);
    const snapshotHiddenCount = Math.max(snapshotGridAll.length - visibleSnapshotGridCount, 0);

    return (
        <section id="home-section-2" className="election-typography relative overflow-hidden border-y border-border/80 bg-background py-16 sm:py-20 lg:py-20">
            <div className="pointer-events-none absolute inset-0 bg-primary/5" />
            <div className="pointer-events-none absolute left-[-7rem] top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-8 right-[-6rem] h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

            <div className="container relative mx-auto px-4">
                <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl space-y-3">
                        <Badge className="border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                            {tString(locale.label, language)}
                        </Badge>
                        <h2 className="section-title md:text-5xl">{tString(locale.heading, language)}</h2>
                        <p className="section-subtitle max-w-2xl text-[0.97rem] leading-7 md:text-base">
                            {tString(locale.description, language)}
                        </p>
                    </div>

                    <Link href="/election-2026" className="w-full lg:w-auto">
                        <Button size="lg" className="w-full bg-primary px-7 font-mono text-[11px] uppercase tracking-[0.13em] text-white hover:bg-primary/90 lg:w-auto">
                            {language === "en" ? "Open Election Hub" : "निर्वाचन हब खोल्नुहोस्"}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-12 xl:gap-8">
                    <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.45 }}
                        className="border border-border/80 bg-card/55 p-4 sm:p-5 lg:col-span-8 lg:p-6"
                    >
                        <div className="mb-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {tracks.map((track) => {
                                const Icon = track.icon;
                                const isActive = track.key === activeTrack;

                                return (
                                    <motion.button
                                        key={track.key}
                                        type="button"
                                        onClick={() => setActiveTrack(track.key)}
                                        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                                        whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
                                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                                        className={`relative shrink-0 overflow-hidden border px-3 py-2.5 transition-colors ${isActive
                                            ? "border-primary/60 bg-primary/12"
                                            : "border-border bg-background/60 hover:border-primary/40"
                                            }`}
                                    >
                                        {isActive ? (
                                            <motion.span
                                                layoutId="election-track-active"
                                                className="pointer-events-none absolute inset-0 bg-primary/10"
                                                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                                            />
                                        ) : null}
                                        <div className="relative flex items-center gap-2">
                                            <div className={`inline-flex h-7 w-7 items-center justify-center border ${isActive ? "border-primary/40 bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}>
                                                <Icon className="h-3.5 w-3.5" />
                                            </div>
                                            <p className={`font-mono text-[10px] uppercase tracking-[0.13em] ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                                                {track.label[language]}
                                            </p>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={active.key}
                                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                                transition={{ duration: 0.24 }}
                                className="relative mt-5 overflow-hidden border border-border/75 bg-background/45 p-4 sm:p-5"
                            >
                                <motion.div
                                    className="pointer-events-none absolute left-0 top-0 h-px w-1/3 bg-primary/60"
                                    animate={shouldReduceMotion ? undefined : { x: ["-120%", "410%"] }}
                                    transition={{
                                        duration: 2.2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />

                                <div className="mb-4 flex items-start gap-3 border-b border-border pb-3.5">
                                    <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center border border-primary/40 bg-primary/10 text-primary">
                                        <active.icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className={`font-editorial text-[1.6rem] text-foreground sm:text-[1.85rem] ${isNepali ? "leading-[1.2] font-semibold tracking-normal" : "leading-[1.08] tracking-tight"}`}>
                                            {active.title[language]}
                                        </h3>
                                        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-[0.96rem]">
                                            {active.description[language]}
                                        </p>
                                    </div>
                                </div>

                                {featured ? (
                                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                                        <motion.div
                                            whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                                            transition={{ type: "spring", stiffness: 240, damping: 20 }}
                                        >
                                            <Link
                                                href={featured.href}
                                                className="group block overflow-hidden border border-border/80 bg-background/55 transition-colors hover:border-primary/60"
                                            >
                                                <div className="relative aspect-[16/9] overflow-hidden border-b border-border/80 bg-background/70">
                                                    {featured.image ? (
                                                        <div
                                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.04] home-image-base"
                                                            style={{ backgroundImage: `url("${featured.image}")` }}
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 bg-background/88 dark:bg-background/86" />
                                                    )}
                                                    <div className="absolute inset-0 home-image-overlay-neutral" />
                                                    <div className="absolute inset-0 home-image-overlay-soft opacity-70" />

                                                    {!featured.image ? (
                                                        <div className="absolute inset-0 grid place-items-center text-center">
                                                            <div className="inline-flex h-10 w-10 items-center justify-center border border-primary/40 bg-primary/12 text-primary">
                                                                <active.icon className="h-5 w-5" />
                                                            </div>
                                                            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/78">
                                                                {active.label[language]}
                                                            </p>
                                                        </div>
                                                    ) : null}

                                                    <div className="absolute left-3 top-3 inline-flex border border-primary/50 bg-primary/16 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                                                        {featured.tag}
                                                    </div>
                                                </div>

                                                <div className="p-4">
                                                    <div className="mb-2 flex items-center justify-between gap-2">
                                                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                                            {featured.meta || (language === "en" ? "Live coverage" : "लाइभ कभरेज")}
                                                        </span>
                                                    </div>
                                                    <h4 className={`mb-2 line-clamp-3 font-editorial text-[1.56rem] text-foreground transition-colors group-hover:text-primary sm:text-[1.72rem] ${isNepali ? "font-semibold tracking-normal leading-[1.2]" : "leading-[1.06] tracking-tight"}`}>
                                                        {featured.title}
                                                    </h4>
                                                    <p className="mb-3.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                                        {featured.excerpt}
                                                    </p>
                                                    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                                                        {language === "en" ? "Read Story" : "पूरा विवरण पढ्नुहोस्"}
                                                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                                    </span>
                                                </div>
                                            </Link>
                                        </motion.div>

                                        <div className="grid gap-2.5">
                                            {secondary.length > 0 ? (
                                                secondary.map((item, index) => (
                                                    <motion.div
                                                        key={`${item.href}-${item.title}-${index}`}
                                                        initial={shouldReduceMotion ? false : { opacity: 0, x: 8 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.22, delay: index * 0.05 }}
                                                    >
                                                        <Link
                                                            href={item.href}
                                                            className="group block border border-border/80 bg-background/45 p-3.5 transition-colors hover:border-primary/50 hover:bg-background/80"
                                                        >
                                                            <div className="mb-1 flex items-center justify-between gap-2">
                                                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
                                                                    {item.tag}
                                                                </span>
                                                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                                                    {item.meta}
                                                                </span>
                                                            </div>
                                                            <h5 className={`line-clamp-2 font-editorial text-[1.24rem] text-foreground group-hover:text-primary ${isNepali ? "font-semibold tracking-normal leading-[1.18]" : "leading-[1.08] tracking-tight"}`}>
                                                                {item.title}
                                                            </h5>
                                                            <p className="mt-1.5 line-clamp-2 text-[0.9rem] leading-6 text-muted-foreground">
                                                                {item.excerpt}
                                                            </p>
                                                        </Link>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="border border-dashed border-border p-4 text-sm text-muted-foreground">
                                                    {language === "en"
                                                        ? "No recent records found for this track."
                                                        : "यस ट्र्याकका लागि हाल कुनै नयाँ सामग्री फेला परेन।"}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border border-dashed border-border bg-background/35 p-5">
                                        <p className={`font-editorial text-[1.55rem] text-foreground ${isNepali ? "font-semibold tracking-normal leading-[1.2]" : "tracking-tight"}`}>
                                            {language === "en" ? "No live updates yet" : "हाल लाइभ अपडेट उपलब्ध छैन"}
                                        </p>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {language === "en"
                                                ? "Open the election hub to browse full archives and module pages."
                                                : "पूर्ण अभिलेख र मोड्युल पृष्ठहरू हेर्न निर्वाचन हब खोल्नुहोस्।"}
                                        </p>
                                    </div>
                                )}

                                <Link href={active.href} className="mt-5 inline-flex">
                                    <Button variant="outline" className="border-primary/50 bg-transparent font-mono text-[11px] uppercase tracking-[0.12em] text-primary hover:bg-primary/10 hover:text-primary">
                                        {active.cta[language]}
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    <motion.aside
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5, delay: 0.04 }}
                        className="border border-border/80 bg-card/55 p-4 sm:p-5 lg:col-span-4 lg:p-5"
                    >
                        <h3 className={`mb-1 font-editorial text-[1.75rem] text-foreground sm:text-[1.9rem] ${isNepali ? "font-semibold tracking-normal leading-[1.2]" : "tracking-tight"}`}>
                            {language === "en" ? "Election Snapshot" : "निर्वाचन स्न्यापसट"}
                        </h3>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {language === "en" ? "Key Election Data" : "प्रमुख तथ्यांक"}
                        </p>
                        <p className="mb-4 text-xs leading-5 text-muted-foreground">
                            {language === "en"
                                ? "Displaying absolute metrics from the Election Commission's verified records."
                                : "निर्वाचन आयोगको आधिकारिक अभिलेखबाट लिइएका प्रमाणित तथ्यांकहरू प्रस्तुत।"}
                        </p>

                        {snapshotPrimary && SnapshotPrimaryIcon ? (
                            <motion.a
                                href={snapshotPrimary.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                                transition={{ type: "spring", stiffness: 240, damping: 20 }}
                                className="group relative block overflow-hidden border border-primary/35 bg-card/72 p-4 transition-colors hover:border-primary/60"
                            >
                                <div className="mb-2 inline-flex h-8 w-8 items-center justify-center border border-primary/45 bg-primary/10 text-primary">
                                    <SnapshotPrimaryIcon className="h-4 w-4" />
                                </div>
                                <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
                                    {snapshotPrimary.label[language]}
                                </p>
                                <p className={`mt-0.5 font-editorial text-[2rem] text-foreground ${isNepali ? "font-semibold leading-[1.12] tracking-normal" : "leading-none tracking-tight"}`}>
                                    {snapshotPrimary.value}
                                </p>
                                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                                    {snapshotPrimary.hint[language]}
                                </p>
                                <div className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
                                    <span>{snapshotPrimary.source[language]}</span>
                                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                </div>
                            </motion.a>
                        ) : null}

                        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            {snapshotGrid.map((stat) => {
                                const StatIcon = SNAPSHOT_ICON_MAP[stat.icon];
                                return (
                                    <motion.a
                                        key={stat.id}
                                        href={stat.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                                        transition={{ type: "spring", stiffness: 240, damping: 20 }}
                                        className="group block border border-border/80 bg-background/55 p-3 transition-colors hover:border-primary/50 hover:bg-background/75"
                                    >
                                        <div className="mb-2 inline-flex h-7 w-7 items-center justify-center border border-primary/35 bg-primary/10 text-primary">
                                            <StatIcon className="h-3.5 w-3.5" />
                                        </div>
                                        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                                            {stat.label[language]}
                                        </p>
                                        <p className={`mt-0.5 font-editorial text-[1.32rem] text-foreground ${isNepali ? "font-semibold leading-[1.1] tracking-normal" : "leading-none tracking-tight"}`}>
                                            {stat.value}
                                        </p>
                                        <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                                            {stat.hint[language]}
                                        </p>
                                        <div className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
                                            <span>{stat.source[language]}</span>
                                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                        </div>
                                    </motion.a>
                                );
                            })}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {snapshotHiddenCount > 0 ? (
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setVisibleSnapshotGridCount((current) =>
                                            Math.min(current + SNAPSHOT_GRID_STEP, snapshotGridAll.length)
                                        )
                                    }
                                    className="h-9 border-primary/40 bg-background/60 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-primary hover:bg-primary/10 hover:text-primary"
                                >
                                    {language === "en"
                                        ? `Load More +${Math.min(SNAPSHOT_GRID_STEP, snapshotHiddenCount)}`
                                        : `थप लोड गर्नुहोस् +${Math.min(SNAPSHOT_GRID_STEP, snapshotHiddenCount)}`}
                                </Button>
                            ) : null}

                            {visibleSnapshotGridCount > SNAPSHOT_GRID_INITIAL_COUNT ? (
                                <Button
                                    variant="ghost"
                                    onClick={() => setVisibleSnapshotGridCount(SNAPSHOT_GRID_INITIAL_COUNT)}
                                    className="h-9 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground hover:bg-background/70 hover:text-foreground"
                                >
                                    {language === "en" ? "Show Less" : "कम देखाउनुहोस्"}
                                </Button>
                            ) : null}

                            <Link href="/election-2026/snapshot">
                                <Button
                                    variant="ghost"
                                    className="h-9 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-primary hover:bg-primary/10 hover:text-primary"
                                >
                                    {language === "en" ? "View All Data" : "सबै डेटा हेर्नुहोस्"}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            </Link>
                        </div>
                    </motion.aside>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {modules.map((module, index) => {
                        const ModuleIcon = module.icon;
                        return (
                            <motion.div
                                key={module.title.en}
                                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-70px" }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                            >
                                <Link
                                    href={module.href}
                                    className="group block h-full border border-border/80 bg-card/55 p-4 transition-colors hover:border-primary/60 hover:bg-card/80"
                                >
                                    <div className="mb-3 inline-flex h-7 w-7 items-center justify-center border border-primary/40 bg-primary/10 text-primary">
                                        <ModuleIcon className="h-4 w-4" />
                                    </div>
                                    <h4 className="mb-1.5 font-editorial text-[1.35rem] leading-[1.12] tracking-tight text-foreground transition-colors group-hover:text-primary">
                                        {module.title[language]}
                                    </h4>
                                    <p className="mb-2.5 line-clamp-3 text-[0.9rem] leading-relaxed text-muted-foreground">
                                        {module.desc[language]}
                                    </p>
                                    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                                        {language === "en" ? "Open Module" : "मोड्युल खोल्नुहोस्"}
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                    </span>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

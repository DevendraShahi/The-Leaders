"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
    Activity,
    ArrowRight,
    ChartColumnBig,
    FileSearch,
    FileText,
    Globe2,
    Layers,
    MapPinned,
    Scale,
    ShieldCheck,
    Timer,
    UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import type { LocalizedValue } from "@/lib/election-data";

type TrackKey = "briefs" | "factChecks" | "analysis" | "map";

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

interface Stat {
    icon: React.ComponentType<{ className?: string }>;
    label: Localized;
    value: string;
    hint: Localized;
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

function clip(text: string, max = 145) {
    if (!text) return "";
    if (text.length <= max) return text;
    return `${text.slice(0, max).trim()}...`;
}

export function ElectionSpecial({
    dailyBriefs = [],
    factChecks = [],
    analyses = [],
}: ElectionSpecialProps) {
    const { language } = useLanguage();
    const locale = LOCALES.home.special;
    const [activeTrack, setActiveTrack] = useState<TrackKey>("briefs");
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
            {
                key: "map",
                icon: MapPinned,
                label: { en: "Map & Districts", ne: "नक्सा र जिल्ला" },
                title: {
                    en: "Interactive District Command View",
                    ne: "अन्तरक्रियात्मक जिल्ला कमान्ड भ्यू",
                },
                description: {
                    en: "Explore constituency-level dynamics with map-driven navigation.",
                    ne: "नक्सा-आधारित नेभिगेसनबाट क्षेत्रगत निर्वाचन गतिशीलता अन्वेषण गर्नुहोस्।",
                },
                href: "/election-2026/map-v2",
                cta: { en: "Launch Map", ne: "नक्सा खोल्नुहोस्" },
            },
        ],
        []
    );

    const stats: Stat[] = [
        {
            icon: UsersRound,
            label: { en: "Registered Voters", ne: "दर्ता मतदाता" },
            value: "18.9M",
            hint: { en: "National voter roll", ne: "राष्ट्रिय नामावली" },
        },
        {
            icon: ChartColumnBig,
            label: { en: "FPTP Seats", ne: "एफपीटीपी सिट" },
            value: "165",
            hint: { en: "Direct constituencies", ne: "प्रत्यक्ष क्षेत्र" },
        },
        {
            icon: Layers,
            label: { en: "PR Seats", ne: "आनुपातिक सिट" },
            value: "110",
            hint: { en: "Closed-list allocation", ne: "बन्दसूची प्रणाली" },
        },
        {
            icon: Globe2,
            label: { en: "District Coverage", ne: "जिल्ला कभरेज" },
            value: "77",
            hint: { en: "Nationwide tracking", ne: "देशव्यापी ट्र्याकिङ" },
        },
        {
            icon: ShieldCheck,
            label: { en: "Integrity Layer", ne: "इण्टिग्रिटी लेयर" },
            value: "24/7",
            hint: { en: "Fact-checking cycle", ne: "तथ्य-जाँच चक्र" },
        },
        {
            icon: Timer,
            label: { en: "Update Cadence", ne: "अपडेट आवृत्ति" },
            value: "Daily",
            hint: { en: "Editorial refresh", ne: "सम्पादकीय अद्यावधिक" },
        },
    ];

    const modules: ModuleCard[] = [
        {
            icon: Activity,
            title: { en: "Election Dashboard", ne: "निर्वाचन ड्यासबोर्ड" },
            desc: {
                en: "Central command view of election components and current coverage.",
                ne: "निर्वाचन कम्पोनेन्ट र वर्तमान कभरेजको केन्द्रिय कमान्ड दृश्य।",
            },
            href: "/election-2026",
        },
        {
            icon: FileText,
            title: { en: "Daily Brief Archive", ne: "दैनिक ब्रिफ अभिलेख" },
            desc: {
                en: "Operational updates with a clean chronology and issue tags.",
                ne: "स्पष्ट कालक्रम र विषयगत ट्यागसहित सञ्चालन अद्यावधिक।",
            },
            href: "/election-2026/daily-brief",
        },
        {
            icon: FileSearch,
            title: { en: "Fact Check Vault", ne: "तथ्य जाँच भल्ट" },
            desc: {
                en: "Claims, verdicts, and source-backed evidence in one stream.",
                ne: "दाबी, निर्णय र स्रोत-आधारित प्रमाण एउटै स्ट्रिममा।",
            },
            href: "/election-2026/fact-checks",
        },
        {
            icon: MapPinned,
            title: { en: "Interactive Map", ne: "अन्तरक्रियात्मक नक्सा" },
            desc: {
                en: "Navigate district stories and election micro-trends quickly.",
                ne: "जिल्ला-आधारित कथा र सूक्ष्म प्रवृत्ति छिटो अन्वेषण गर्नुहोस्।",
            },
            href: "/election-2026/map-v2",
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
                href: `/election-2026/fact-checks/${item.slug || ""}`,
                title: clip(resolveLocalized(item.claim, language), 120),
                excerpt: clip(resolveLocalized(item.analysis, language)),
                meta: `${formatShortDate(item.date, language)} • ${verdictLabel[item.verdict]}`,
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

        return [
            {
                href: "/election-2026/map-v2",
                title: language === "en" ? "District command map with rapid lookup" : "जिल्ला कमान्ड नक्सा र द्रुत खोज",
                excerpt:
                    language === "en"
                        ? "Open district-level context fast, then jump to briefs, profiles, and candidate references in one flow."
                        : "जिल्ला स्तरको सन्दर्भ छिटो हेरेर ब्रिफ, प्रोफाइल र उम्मेदवार विवरणमा एउटै प्रवाहमा जानुहोस्।",
                meta: language === "en" ? "77 districts" : "७७ जिल्ला",
                tone: "map" as const,
                image: "",
                tag: language === "en" ? "Map" : "नक्सा",
            },
            {
                href: "/election-2026/pr-candidates",
                title: language === "en" ? "PR candidate explorer" : "समानुपातिक उम्मेदवार खोज",
                excerpt:
                    language === "en"
                        ? "Filter by party and district to identify representation patterns quickly."
                        : "दल र जिल्ला अनुसार फिल्टर गरी प्रतिनिधित्वको ढाँचा छिटो पहिचान गर्नुहोस्।",
                meta: language === "en" ? "Coverage tool" : "कभरेज उपकरण",
                tone: "map" as const,
                image: "",
                tag: language === "en" ? "Explorer" : "एक्सप्लोरर",
            },
            {
                href: "/election-2026/parties",
                title: language === "en" ? "Party and symbol atlas" : "दल र चुनाव चिह्न एटलस",
                excerpt:
                    language === "en"
                        ? "Quickly cross-check party identity, leadership, and election footprint."
                        : "दलको पहिचान, नेतृत्व र चुनावी उपस्थितिलाई छिटो क्रस-चेक गर्नुहोस्।",
                meta: language === "en" ? "Reference index" : "सन्दर्भ सूची",
                tone: "map" as const,
                image: "",
                tag: language === "en" ? "Parties" : "दल",
            },
        ];
    }, [activeTrack, analyses, dailyBriefs, factChecks, language, verdictLabel]);

    const featured = activeContent[0];
    const secondary = activeContent.slice(1);

    return (
        <section className="relative overflow-hidden border-y border-border bg-background pb-24 pt-20">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(183,28,28,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(183,28,28,0.05)_1px,transparent_1px)] bg-[size:72px_72px]" />
            <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 bottom-14 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

            <div className="container relative mx-auto px-4">
                <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl space-y-4">
                        <Badge className="rounded-none border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                            {tString(locale.label, language)}
                        </Badge>
                        <h2 className="section-title md:text-6xl">
                            {tString(locale.heading, language)}
                        </h2>
                        <p className="section-subtitle max-w-2xl md:text-lg">
                            {tString(locale.description, language)}
                        </p>
                    </div>

                    <Link href="/election-2026" className="w-full lg:w-auto">
                        <Button size="lg" className="w-full rounded-none bg-primary px-8 font-mono text-xs uppercase tracking-[0.16em] text-white hover:bg-primary/90 lg:w-auto">
                            {language === "en" ? "Open Election Hub" : "निर्वाचन हब खोल्नुहोस्"}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-8 lg:grid-cols-12">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5 }}
                        className="border border-border bg-card/40 p-5 lg:col-span-8 lg:p-7"
                    >
                        <div className="mb-4 flex flex-wrap gap-2">
                            {tracks.map((track) => {
                                const Icon = track.icon;
                                const isActive = track.key === activeTrack;
                                return (
                                    <button
                                        key={track.key}
                                        type="button"
                                        onClick={() => setActiveTrack(track.key)}
                                        className={`inline-flex items-center gap-2 border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-all ${isActive
                                            ? "border-primary bg-primary/15 text-primary"
                                            : "border-border bg-background/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                            }`}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        {track.label[language]}
                                    </button>
                                );
                            })}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={active.key}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.22 }}
                            >
                                <div className="mb-4 flex items-center gap-3 border-y border-border py-4">
                                    <active.icon className="h-5 w-5 text-primary" />
                                    <h3 className={`font-bebas text-3xl text-foreground ${isNepali ? "leading-[1.25] font-bold tracking-normal" : "uppercase tracking-wide"}`}>
                                        {active.title[language]}
                                    </h3>
                                </div>
                                <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
                                    {active.description[language]}
                                </p>
                                {featured ? (
                                    <div className="mb-6 grid gap-4 xl:grid-cols-5">
                                        <Link
                                            href={featured.href}
                                            className="group xl:col-span-3 border border-border bg-background/50 p-4 transition-colors hover:border-primary/60 hover:bg-background"
                                        >
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <span className="inline-flex border border-primary/50 bg-primary/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                                                    {featured.tag}
                                                </span>
                                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                                    {featured.meta}
                                                </span>
                                            </div>
                                            <h4 className={`mb-3 font-bebas text-3xl text-foreground transition-colors group-hover:text-primary ${isNepali ? "font-bold tracking-normal leading-[1.2]" : "uppercase leading-[0.9] tracking-wide"}`}>
                                                {featured.title}
                                            </h4>
                                            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{featured.excerpt}</p>
                                            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                                                {language === "en" ? "Open Detail" : "विवरण खोल्नुहोस्"}
                                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                            </span>
                                        </Link>

                                        <div className="grid gap-3 xl:col-span-2">
                                            {secondary.length > 0 ? (
                                                secondary.map((item) => (
                                                    <Link
                                                        key={`${item.href}-${item.title}`}
                                                        href={item.href}
                                                        className="group border border-border bg-background/40 p-3 transition-colors hover:border-primary/50 hover:bg-background"
                                                    >
                                                        <div className="mb-1 flex items-center justify-between gap-2">
                                                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
                                                                {item.tag}
                                                            </span>
                                                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                                                {item.meta}
                                                            </span>
                                                        </div>
                                                        <h5 className={`line-clamp-2 font-bebas text-2xl text-foreground group-hover:text-primary ${isNepali ? "font-bold tracking-normal leading-[1.2]" : "uppercase leading-[0.95] tracking-wide"}`}>
                                                            {item.title}
                                                        </h5>
                                                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.excerpt}</p>
                                                    </Link>
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
                                    <div className="mb-6 border border-dashed border-border bg-background/30 p-5">
                                        <p className={`font-bebas text-2xl text-foreground ${isNepali ? "font-bold tracking-normal leading-[1.2]" : "uppercase tracking-wide"}`}>
                                            {language === "en" ? "No live updates yet" : "हाल लाइभ अपडेट उपलब्ध छैन"}
                                        </p>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {language === "en"
                                                ? "Open the election hub to browse full archives and module pages."
                                                : "पूर्ण अभिलेख र मोड्युल पृष्ठहरू हेर्न निर्वाचन हब खोल्नुहोस्।"}
                                        </p>
                                    </div>
                                )}

                                <Link href={active.href} className="inline-flex">
                                    <Button variant="outline" className="rounded-none border-primary/50 bg-transparent font-mono text-xs uppercase tracking-[0.14em] text-primary hover:bg-primary/10 hover:text-primary">
                                        {active.cta[language]}
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    <motion.aside
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.55, delay: 0.05 }}
                        className="border border-border bg-card/40 p-5 lg:col-span-4 lg:p-6"
                    >
                        <h3 className={`mb-1 font-bebas text-3xl text-foreground ${isNepali ? "font-bold tracking-normal leading-[1.2]" : "uppercase tracking-wide"}`}>
                            {language === "en" ? "Election Snapshot" : "निर्वाचन स्न्यापसट"}
                        </h3>
                        <p className="mb-5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                            {language === "en" ? "Reference Metrics" : "सन्दर्भ सूचक"}
                        </p>
                        <div className="grid gap-3">
                            {stats.map((stat) => {
                                const StatIcon = stat.icon;
                                return (
                                    <div key={stat.label.en} className="flex items-start gap-3 border border-border bg-background/50 p-3">
                                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center border border-primary/40 bg-primary/10 text-primary">
                                            <StatIcon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
                                                {stat.label[language]}
                                            </p>
                                            <p className={`font-bebas text-3xl text-foreground ${isNepali ? "font-bold leading-[1.15] tracking-normal" : "uppercase leading-none"}`}>
                                                {stat.value}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{stat.hint[language]}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.aside>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {modules.map((module, index) => {
                        const ModuleIcon = module.icon;
                        return (
                            <motion.div
                                key={module.title.en}
                                initial={{ opacity: 0, y: 14 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-70px" }}
                                transition={{ duration: 0.45, delay: index * 0.07 }}
                            >
                                <Link href={module.href} className="group block h-full border border-border bg-card/50 p-4 transition-all hover:-translate-y-1 hover:border-primary/60 hover:bg-card">
                                    <div className="mb-3 inline-flex h-8 w-8 items-center justify-center border border-primary/40 bg-primary/10 text-primary">
                                        <ModuleIcon className="h-4 w-4" />
                                    </div>
                                    <h4 className="mb-2 font-bebas text-2xl uppercase leading-none tracking-wide text-foreground transition-colors group-hover:text-primary">
                                        {module.title[language]}
                                    </h4>
                                    <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{module.desc[language]}</p>
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

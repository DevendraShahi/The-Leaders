"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Timeline } from "@/components/home/timeline";
import { timelineData } from "@/data/timeline-data";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString, type LanguageCode } from "@/lib/locales";

type LocalizedField = { en?: string; ne?: string } | string | null | undefined;

const resolveContent = (field: LocalizedField, language: LanguageCode) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    const primary = language === "ne" ? field.ne : field.en;
    const fallback = language === "ne" ? field.en : field.ne;
    return primary || fallback || "";
};

const toNepaliDigits = (value: string) =>
    value.replace(/\d/g, (digit) => "०१२३४५६७८९"[Number(digit)]);

const localizeTimelineDate = (value: string, language: LanguageCode) => {
    if (language !== "ne") return value;

    return toNepaliDigits(value)
        .replace(/\bBCE\b/g, "ई.पू.")
        .replace(/\bCE\b/g, "ई.")
        .replace(/\bPresent\b/gi, "वर्तमान");
};

const parseTimelineStartYear = (periodEn: string) => {
    const normalized = periodEn.toLowerCase();
    const match = normalized.match(/\d{3,4}/);
    if (!match) return Number.MAX_SAFE_INTEGER;
    const year = Number(match[0]);
    return normalized.includes("before") ? year - 1 : year;
};

const parseEventStartYear = (yearText: string) => {
    const normalized = yearText.toLowerCase();
    const match = normalized.match(/\d{1,4}/);
    if (!match) return Number.MAX_SAFE_INTEGER;
    const year = Number(match[0]);
    if (normalized.includes("bce")) return -year;
    return year;
};

const defaultEraId =
    [...timelineData].sort((a, b) => parseTimelineStartYear(a.period.en) - parseTimelineStartYear(b.period.en))[0]?.id ??
    timelineData[0]?.id ??
    "";

export default function HistoryPage() {
    const { language } = useLanguage();
    const historyLocale = LOCALES.history;
    const premiumLocale = historyLocale.premium;

    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const shouldReduceMotion = useReducedMotion();
    const glowY = useTransform(scrollYProgress, [0, 0.45], [0, shouldReduceMotion ? 0 : 140]);
    const glowScale = useTransform(scrollYProgress, [0, 0.45], [1, shouldReduceMotion ? 1 : 1.18]);
    const [activeEraId, setActiveEraId] = useState<string>(defaultEraId);
    const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null);

    const archiveGraph = useMemo(() => {
        const eras = timelineData
            .map((era, order) => ({
                id: era.id,
                title: resolveContent(era.title, language),
                period: resolveContent(era.period, language),
                description: resolveContent(era.description, language),
                sortYear: parseTimelineStartYear(era.period.en),
                order,
                count: era.episodes.length,
                episodes: era.episodes
                    .map((episode) => ({
                        id: episode.id,
                        title: resolveContent(episode.title, language),
                        description: resolveContent(episode.description, language),
                        year: localizeTimelineDate(resolveContent(episode.year, language), language),
                        sortYear: parseEventStartYear(episode.year),
                    }))
                    .sort((a, b) => a.sortYear - b.sortYear),
            }))
            .sort((a, b) => a.sortYear - b.sortYear || a.order - b.order);

        const eraCount = eras.length;
        const eventCount = eras.reduce((sum, era) => sum + era.count, 0);
        return { eras, eraCount, eventCount };
    }, [language]);

    const activeEra = useMemo(
        () => archiveGraph.eras.find((era) => era.id === activeEraId) ?? archiveGraph.eras[0],
        [activeEraId, archiveGraph.eras]
    );

    const activeEpisode = useMemo(() => {
        if (!activeEra) return null;
        return activeEra.episodes.find((episode) => episode.id === activeEpisodeId) ?? activeEra.episodes[0] ?? null;
    }, [activeEra, activeEpisodeId]);

    const eraChartData = useMemo(() => {
        const total = Math.max(archiveGraph.eventCount, 1);
        return archiveGraph.eras.map((era) => ({
            ...era,
            share: (era.count / total) * 100,
        }));
    }, [archiveGraph.eras, archiveGraph.eventCount]);

    const activeShare = useMemo(() => {
        if (!activeEra) return 0;
        return (activeEra.count / Math.max(archiveGraph.eventCount, 1)) * 100;
    }, [activeEra, archiveGraph.eventCount]);

    return (
        <div ref={containerRef} className="relative min-h-screen overflow-hidden">
            <motion.div
                style={{ scaleX: scrollYProgress }}
                className="fixed left-0 right-0 top-[64px] z-[90] h-0.5 origin-left bg-primary md:top-[72px]"
            />

            <section className="relative overflow-hidden border-b border-border/80">
                <motion.div
                    style={{ y: glowY, scale: glowScale }}
                    className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary/18 blur-3xl"
                />
                <motion.div
                    animate={shouldReduceMotion ? undefined : { y: [0, -14, 0], opacity: [0.6, 1, 0.6] }}
                    transition={shouldReduceMotion ? undefined : { duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
                    className="pointer-events-none absolute -right-28 top-20 h-80 w-80 rounded-full bg-primary/12 blur-3xl"
                />
                <motion.div
                    animate={shouldReduceMotion ? undefined : { rotate: 360 }}
                    transition={shouldReduceMotion ? undefined : { duration: 36, repeat: Infinity, ease: "linear" }}
                    className="pointer-events-none absolute right-[8%] top-16 h-56 w-56 rounded-full border border-primary/18"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(183,28,28,0.12)_0%,rgba(183,28,28,0)_60%)]" />

                <div className="container relative z-10 mx-auto px-4 py-10 sm:py-12 lg:py-14">
                    <div className="grid items-start gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
                        <motion.div
                            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
                            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                            transition={{ duration: 0.45 }}
                            className="relative flex flex-col overflow-hidden border border-border/80 bg-card/62 p-6 sm:p-8"
                        >
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(183,28,28,0.12),transparent_46%)]" />
                            <div className="inline-flex flex-col">
                                <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-primary">
                                    {tString(premiumLocale.archiveLabel, language)}
                                </p>
                                <span className="mt-1 h-px w-28 bg-primary/45" />
                            </div>

                            <p className="mt-4 text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                                {tString(historyLocale.hero.label, language)}
                            </p>

                            <h1 className="mt-3 font-editorial text-[clamp(2rem,4.9vw,4.2rem)] leading-[1.06] tracking-[-0.018em] text-foreground">
                                {tString(historyLocale.hero.heading, language)}
                            </h1>

                            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                                {tString(historyLocale.hero.subheading, language)}
                            </p>

                            <p className="mt-5 max-w-2xl text-sm leading-7 text-foreground/82 md:text-base">
                                {tString(premiumLocale.contextBody, language)}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-2 border border-border/80 bg-background/70 px-3 py-1.5 text-xs text-foreground">
                                    <span className="font-mono uppercase tracking-[0.09em] text-muted-foreground">
                                        {language === "ne" ? "अवधि" : "Periods"}
                                    </span>
                                    <span className="font-editorial text-lg leading-none">{archiveGraph.eraCount}</span>
                                </span>
                                <span className="inline-flex items-center gap-2 border border-border/80 bg-background/70 px-3 py-1.5 text-xs text-foreground">
                                    <span className="font-mono uppercase tracking-[0.09em] text-muted-foreground">
                                        {language === "ne" ? "घटना" : "Events"}
                                    </span>
                                    <span className="font-editorial text-lg leading-none">{archiveGraph.eventCount}</span>
                                </span>
                            </div>

                            <div className="mt-4 border border-border/80 bg-background/68 p-4">
                                <p className="home-meta">{language === "ne" ? "छानिएको अवधि" : "Selected Period"}</p>
                                <div className="mt-2 flex items-start justify-between gap-3">
                                    <h2 className="font-editorial text-[clamp(1.15rem,2.3vw,1.8rem)] leading-[1.1] text-foreground">
                                        {activeEra?.title}
                                    </h2>
                                    <span className="shrink-0 border border-primary/40 bg-primary/10 px-2 py-1 text-[11px] font-mono text-primary">
                                        {activeEra?.count}
                                    </span>
                                </div>
                                <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                                    {activeEra?.period}
                                </p>
                                <p className="mt-3 text-sm leading-6 text-foreground/84">{activeEra?.description}</p>
                            </div>

                            <div className="mt-4 border border-border/80 bg-background/56 p-4">
                                <p className="home-meta">{language === "ne" ? "घटनाको विवरण" : "Event Details"}</p>
                                {activeEpisode ? (
                                    <>
                                        <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.12em] text-primary">
                                            {activeEpisode.year}
                                        </p>
                                        <h3 className="mt-1 font-editorial text-[clamp(1rem,2.2vw,1.4rem)] leading-[1.15] text-foreground">
                                            {activeEpisode.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-foreground/84">
                                            {activeEpisode.description}
                                        </p>
                                    </>
                                ) : (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {language === "ne"
                                            ? "अवधि छानेपछि घटनाको विवरण यहाँ देखिन्छ।"
                                            : "Choose a period to see event details here."}
                                    </p>
                                )}
                            </div>

                            <div className="mt-auto pt-7">
                                <div className="flex flex-wrap gap-2.5">
                                    <Link
                                        href="#history-timeline"
                                        className="inline-flex min-h-11 items-center gap-2 border border-primary bg-primary px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90"
                                    >
                                        {tString(premiumLocale.actions.startTimeline, language)}
                                        <ArrowDown className="h-4 w-4" />
                                    </Link>

                                    <Link
                                        href="/leaders"
                                        className="inline-flex min-h-11 items-center gap-2 border border-border/80 bg-background/75 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/86 transition-colors hover:border-primary/50 hover:text-primary"
                                    >
                                        {tString(premiumLocale.actions.viewLeaders, language)}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>

                                <p className="mt-4 text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
                                    {language === "ne"
                                        ? "तल स्क्रोल गरेर पुरा समयरेखा हेर्नुहोस्।"
                                        : "Scroll down to see the full timeline."}
                                </p>
                            </div>
                        </motion.div>

                        <motion.aside
                            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
                            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: 0.06 }}
                            className="relative overflow-hidden border border-border/80 bg-card/62 p-4 sm:p-5"
                        >
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgba(183,28,28,0.09)_0%,rgba(183,28,28,0)_46%)]" />
                            <h2 className="max-w-[24ch] font-editorial text-[clamp(1.1rem,2vw,1.6rem)] leading-[1.2] tracking-[-0.008em] text-foreground">
                                {language === "ne"
                                    ? "समयरेखा सार"
                                    : "Timeline Overview"}
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {language === "ne"
                                    ? "कुनै अवधि छान्नुहोस्, त्यसका मुख्य घटना हेर्नुहोस्।"
                                    : "Choose a period to view its main events."}
                            </p>

                            <div className="mt-4 overflow-hidden border border-border/80 bg-background/78 p-3 sm:p-4">
                                <div className="border border-border/65 bg-background/86 p-2.5 sm:p-3">
                                    <div className="mb-2 flex items-center justify-between gap-3 border-b border-border/70 pb-2">
                                        <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                                            {language === "ne" ? "समयक्रमअनुसार अवधिहरू" : "Periods in Timeline Order"}
                                        </p>
                                        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-primary">
                                            {archiveGraph.eventCount} {language === "ne" ? "कुल घटनाहरू" : "total events"}
                                        </span>
                                    </div>

                                    <div className="grid gap-3 lg:grid-cols-[132px_1fr]">
                                        <div className="mx-auto w-full max-w-[132px]">
                                            <div
                                                className="relative mx-auto flex h-[112px] w-[112px] items-center justify-center rounded-full border border-border/80"
                                                style={{
                                                    background: `conic-gradient(hsl(var(--primary)) ${Math.max(
                                                        4,
                                                        activeShare * 3.6
                                                    )}deg, hsl(var(--border) / 0.48) 0deg)`,
                                                }}
                                            >
                                                <div className="flex h-[80px] w-[80px] flex-col items-center justify-center rounded-full border border-border/80 bg-background/95">
                                                    <p className="font-editorial text-2xl leading-none text-foreground">{activeEra?.count}</p>
                                                    <p className="mt-1 text-[9px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                                                        {language === "ne" ? "छानिएको" : "Selected"}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-center font-editorial text-sm leading-tight text-foreground">
                                                {activeEra?.title}
                                            </p>
                                            <p className="mt-1 text-center text-xs text-primary">{activeShare.toFixed(1)}%</p>
                                        </div>

                                        <div className="space-y-1.5">
                                            {eraChartData.map((era, index) => {
                                                const isActive = era.id === activeEra?.id;
                                                return (
                                                    <button
                                                        key={`metric-${era.id}`}
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveEraId(era.id);
                                                            setActiveEpisodeId(era.episodes[0]?.id ?? null);
                                                        }}
                                                        className={`w-full border px-2 py-1.5 text-left transition-colors ${isActive
                                                            ? "border-primary bg-primary/12 text-foreground"
                                                            : "border-border/70 bg-background/75 text-foreground/88 hover:border-primary/45"
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="line-clamp-1 text-sm leading-tight text-foreground">
                                                                {era.title}
                                                            </span>
                                                            <span className="font-editorial text-base leading-none">{era.count}</span>
                                                        </div>
                                                        <p className="mt-0.5 text-[11px] text-muted-foreground">{era.period}</p>
                                                        <div className="mt-1 h-1.5 w-full overflow-hidden bg-border/60">
                                                            <motion.div
                                                                initial={shouldReduceMotion ? undefined : { width: 0 }}
                                                                animate={{ width: `${Math.max(6, era.share)}%` }}
                                                                transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: "easeOut" }}
                                                                className={`h-full ${isActive ? "bg-primary" : "bg-primary/70"}`}
                                                            />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 border-t border-border/80 pt-3">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="home-meta">{language === "ne" ? "छानिएको अवधिका घटनाहरू" : "Events in selected period"}</p>
                                </div>
                                <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                                    {activeEra?.episodes.map((episode) => {
                                        const isActiveEpisode = episode.id === activeEpisode?.id;
                                        return (
                                            <button
                                                key={episode.id}
                                                type="button"
                                                onClick={() => setActiveEpisodeId(episode.id)}
                                                className={`min-h-10 border px-2.5 py-1.5 text-left transition-colors ${isActiveEpisode
                                                        ? "border-primary bg-primary/12 text-foreground"
                                                        : "border-border/80 bg-background/70 text-muted-foreground hover:border-primary/45 hover:text-foreground"
                                                    }`}
                                            >
                                                <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-primary">{episode.year}</p>
                                                <p className="line-clamp-1 text-xs leading-tight">{episode.title}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.aside>
                    </div>
                </div>
            </section>

            <div id="history-timeline" className="relative z-10">
                <Timeline />
            </div>
        </div>
    );
}

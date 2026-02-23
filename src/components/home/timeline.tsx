"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { timelineData, TimelineSeries, TimelineEpisode } from "@/data/timeline-data";
import { ExternalLink, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

// Helper to handle potential bilingual data in the future
const resolveContent = (content: any, language: "en" | "ne") => {
    if (!content) return "";
    if (typeof content === "string") return content;
    return tString(content, language);
};

const toNepaliDigits = (value: string) =>
    value.replace(/\d/g, (digit) => "०१२३४५६७८९"[Number(digit)]);

const localizeTimelineDate = (value: string, language: "en" | "ne") => {
    if (language !== "ne") return value;

    return toNepaliDigits(value)
        .replace(/\bBCE\b/g, "ई.पू.")
        .replace(/\bCE\b/g, "ई.")
        .replace(/\bPresent\b/gi, "वर्तमान");
};

export function Timeline({ limit, showViewAll }: { limit?: number; showViewAll?: boolean }) {
    const { language } = useLanguage();
    const l = LOCALES.timelineIndex;

    const [activeSeriesId, setActiveSeriesId] = useState<string | null>(null);

    const displayedData = limit ? timelineData.slice(0, limit) : timelineData;

    return (
        <section id="home-section-6" className="relative scroll-mt-20 overflow-hidden border-y border-border/80 bg-background py-14 sm:scroll-mt-24 sm:py-20">
            <div className="pointer-events-none absolute inset-0 bg-primary/5" />
            {/* Header Area */}
            <div className="container relative z-10 mx-auto mb-12 px-4 text-center sm:mb-14">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto space-y-4"
                >
                    <span className="text-primary font-bold tracking-widest uppercase text-sm">
                        {tString(l.label, language)}
                    </span>
                    <h2 className="section-title md:text-6xl">
                        {/* We use tString but for styling we might want to split words if needed. 
                            For now, using the full string from locales.ts which matches 'Nepal's Political Journey'.
                            If specific color styling is needed, we can split manually or update locales. 
                            The original had 'Political Journey' in primary color. 
                            I'll use a simple split for now if it's English/Nepali structure predictable, 
                            or just modify locales to have parts if I want to be strict.
                            However, straightforward tString is safer for now. 
                        */}
                        {language === 'ne' ? (
                            <>
                                नेपालको <span className="text-primary">राजनीतिक कालक्रम</span>
                            </>
                        ) : (
                            <>
                                Nepal&apos;s <span className="text-primary">Political Timeline</span>
                            </>
                        )}
                    </h2>
                    <p className="section-subtitle mx-auto max-w-2xl md:text-lg">
                        {tString(l.description, language)}
                    </p>
                </motion.div>
            </div>

            <div className="container relative z-10 mx-auto space-y-4 px-4 sm:space-y-6">
                {/* Animated Vertical Spine */}
                <AnimatedVerticalSpine itemCount={displayedData.length} />

                <LayoutGroup>
                    {displayedData.map((series, index) => (
                        <TimelineItem
                            key={series.id}
                            series={series}
                            isOpen={activeSeriesId === series.id}
                            onClick={() => setActiveSeriesId(activeSeriesId === series.id ? null : series.id)}
                            isFirst={index === 0}
                            isLast={index === displayedData.length - 1}
                            index={index}
                        />
                    ))}
                </LayoutGroup>

                {showViewAll && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mt-9 pl-[42px] sm:pl-[80px]"
                    >
                        <Link
                            href="/history"
                            className="group relative block w-full cursor-pointer overflow-hidden border border-primary/20 bg-muted/20 px-5 py-5 transition-all duration-500 hover:border-primary/45 hover:bg-primary/5 sm:max-w-[700px] sm:px-6 sm:py-6"
                        >
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_25%,rgba(183,28,28,0.12),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="relative z-10 flex items-center justify-between gap-4 sm:gap-6">
                                <div className="min-w-0">
                                    <span className="font-bebas text-[clamp(1.5rem,5.3vw,2.35rem)] uppercase leading-[1] tracking-[0.055em] text-foreground transition-colors duration-300 group-hover:text-primary">
                                        {tString(l.viewAll, language)}
                                    </span>
                                    <p className="mt-2.5 max-w-[36ch] text-left text-[0.68rem] font-manrope uppercase leading-[1.4] tracking-[0.11em] text-muted-foreground sm:text-[0.72rem] sm:tracking-[0.14em]">
                                        {tString(l.discoverHistory, language)}
                                    </p>
                                </div>

                                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-primary transition-all duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-primary-foreground sm:h-11 sm:w-11">
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            </div>
                        </Link>
                    </motion.div>
                )}
            </div>
        </section>
    );
}

function TimelineItem({
    series,
    isOpen,
    onClick,
    isFirst,
    isLast,
    index
}: {
    series: TimelineSeries;
    isOpen: boolean;
    onClick: () => void;
    isFirst?: boolean;
    isLast?: boolean;
    index: number;
}) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { language } = useLanguage();
    const l = LOCALES.timelineIndex;

    // Auto-scroll logic
    useEffect(() => {
        if (isOpen && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    }, [isOpen]);

    return (
        <motion.div
            layout
            className={cn(
                "relative w-full overflow-visible transition-all duration-500 sm:overflow-hidden",
                isOpen ? "bg-muted/10 py-6 sm:py-10" : "py-1 hover:bg-muted/5"
            )}
        >
            {/* Vertical Connection Node with horizontal connector */}
            <div className="absolute left-6 top-1/2 z-10 -translate-y-1/2 -translate-x-1/2 sm:left-8">
                <VerticalConnectionNode isFirst={isFirst} isLast={isLast} index={index} />
            </div>
            {/* Horizontal connector line from spine to card */}
            <motion.div
                className="absolute left-6 top-[calc(50%-1px)] z-[5] h-[2px] w-6 pointer-events-none sm:left-8 sm:w-[48px]"
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                style={{ originX: 0 }}
            >
                <div className="h-full w-full bg-border" />
            </motion.div>
            <div className={cn(
                "relative flex flex-col lg:flex-row items-start w-full",
                "py-2 pl-[42px] pr-0 sm:pl-[80px] sm:pr-4 lg:pr-8",
                isOpen ? "gap-4 sm:gap-7 lg:gap-12" : "gap-3.5 sm:gap-6 lg:gap-8 justify-start"
            )}>
                {/* 
                   ========================================================================
                   SERIES CARD (Left Side / Center)
                   ========================================================================
                */}
                <motion.div
                    layout="position"
                    onClick={onClick}
                    className={cn(
                        "relative z-20 cursor-pointer group flex-shrink-0 transition-all duration-500",
                        isOpen
                            ? "w-full lg:w-[320px]"
                            : "w-full max-w-4xl" // removed mx-auto to maintain perfect node alignment
                    )}
                >
                    <div className={cn(
                        "relative overflow-hidden border bg-card text-card-foreground shadow-none transition-all duration-300",
                        isOpen
                            ? "flex flex-col border-primary p-4 sm:p-6 lg:h-[420px]"
                            : "hover:border-primary flex flex-col gap-4 p-4 text-center md:flex-row md:items-center md:text-left sm:gap-5 sm:p-7 lg:p-9"
                    )}>
                        <div className="flex-1 space-y-4">
                            <div className={cn("flex items-center gap-3", !isOpen && "justify-center md:justify-start")}>
                                <span className={cn(
                                    "px-3 py-1 text-xs font-bold uppercase tracking-widest border transition-colors",
                                    isOpen
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-transparent text-muted-foreground border-border group-hover:border-primary"
                                )}>
                                    {resolveContent(series.period, language)}
                                </span>
                            </div>

                            <motion.h3
                                layout="position"
                                className={cn(
                                    "font-bebas uppercase leading-none transition-colors group-hover:text-primary tracking-wide",
                                    isOpen ? "text-[1.8rem] sm:text-3xl" : "text-[1.8rem] sm:text-[2.2rem] md:text-4xl"
                                )}
                            >
                                {resolveContent(series.title, language)}
                            </motion.h3>

                            <motion.p
                                layout="position"
                                className={cn(
                                    "text-muted-foreground font-manrope leading-relaxed",
                                    isOpen ? "text-[0.82rem] line-clamp-4 sm:text-sm" : "max-w-2xl text-[0.84rem] sm:text-[0.95rem]"
                                )}
                            >
                                {resolveContent(series.description, language)}
                            </motion.p>
                        </div>

                        {/* Action / Footer */}
                        <div className={cn(
                            "mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest",
                            isOpen ? "mt-auto pt-6 border-t border-border" : "justify-center md:justify-start"
                        )}>
                            {isOpen ? (
                                <div className="flex items-center gap-2 text-primary w-full">
                                    <span className="flex-1">{tString(l.viewEra, language)}</span>
                                    {series.wikipediaTopic && (
                                        <a
                                            href={`https://en.wikipedia.org/wiki/${series.wikipediaTopic}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline flex items-center gap-1"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Wiki <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <span className="group-hover:translate-x-1 transition-transform flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                                    {tString(l.explore, language)} <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Connector Line Removed as per request */}
                </motion.div>

                {/* 
                   ========================================================================
                   CONNECTOR & EPISODES (Right Side)
                   ========================================================================
                */}
                <AnimatePresence mode="popLayout">
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="relative flex w-full flex-grow items-center overflow-hidden min-h-[250px] sm:min-h-[300px] lg:h-[420px]"
                        >
                            {/* Horizontal Spine Line Removed as per request */}

                            {/* Scroll Container */}
                            <div
                                ref={scrollContainerRef}
                                className="flex h-full w-full snap-x snap-mandatory items-center space-x-4 overflow-x-auto overflow-y-hidden pl-0 pr-4 pt-0 sm:space-x-8 sm:pr-10 custom-scrollbar"
                            >
                                {/* Start Node - Upgraded to match design */}
                                <div className="relative z-10 hidden h-5 w-5 flex-shrink-0 items-center justify-center sm:flex sm:h-6 sm:w-6">
                                    <StartNode />
                                </div>

                                {series.episodes.map((episode, idx) => (
                                    <EpisodeCard
                                        key={episode.id}
                                        episode={episode}
                                        index={idx}
                                        language={language}
                                    />
                                ))}
                            </div>

                            {/* Right edge mask removed */}
                            <div className="absolute right-0 top-0 h-full w-4 bg-background/85 pointer-events-none z-20" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

function EpisodeCard({ episode, index, language }: { episode: TimelineEpisode; index: number; language: "en" | "ne" }) {
    return (
        <motion.div
            initial="idle"
            whileHover="active"
            viewport={{ once: true }}
            className="group relative w-[72vw] max-w-[260px] flex-none snap-center sm:w-[280px]"
        >
            {/* 
                Animated Connection System 
                Re-Centered: top-[calc(50%-24px)] for precise vertical alignment with spine.
                Z-30 to sit ABOVE the card border.
            */}
            <div className="pointer-events-none absolute top-[calc(50%-24px)] -left-[48px] z-30 hidden h-[48px] w-[48px] overflow-visible sm:block">
                <ConnectionSystem />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative z-20 flex h-[238px] flex-col overflow-hidden border border-border bg-card text-card-foreground shadow-none transition-all duration-500 hover:border-primary/50 sm:h-[270px]"
            >
                {/* Hover Glow Effect */}
                <motion.div
                    variants={{
                        idle: { opacity: 0 },
                        active: { opacity: 1 }
                    }}
                    className="absolute inset-0 bg-primary/5 pointer-events-none z-0"
                />

                {/* Year Header */}
                <div className="relative z-10 flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3 transition-colors duration-500 group-hover:bg-primary group-hover:text-primary-foreground sm:px-5">
                    <span className="font-bebas text-xl tracking-[0.08em] sm:text-2xl sm:tracking-widest">
                        {localizeTimelineDate(resolveContent(episode.year, language), language)}
                    </span>
                    <motion.div
                        variants={{
                            idle: { rotate: 0 },
                            active: { rotate: 180 }
                        }}
                        className="h-1.5 w-1.5 bg-current transition-all"
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-1 flex-col p-4 sm:p-5">
                    <h4 className="mb-3 line-clamp-2 font-bebas text-[1.55rem] uppercase leading-none tracking-[0.025em] transition-colors group-hover:text-primary sm:text-[1.85rem]">
                        {resolveContent(episode.title, language)}
                    </h4>
                    <p className="line-clamp-4 text-[0.78rem] font-manrope leading-relaxed text-muted-foreground sm:text-[0.86rem]">
                        {resolveContent(episode.description, language)}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ------------------------------------------------------------------
// Advanced SVG Animation Components
// ------------------------------------------------------------------

function StartNode() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" className="overflow-visible">
            <circle cx="12" cy="12" r="4" fill="var(--primary)" />
            <circle cx="12" cy="12" r="8" stroke="var(--primary)" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
        </svg>
    )
}

function AnimatedVerticalSpine({ itemCount }: { itemCount: number }) {
    return (
        <div className="absolute bottom-0 left-6 top-0 z-0 w-[2px] overflow-visible sm:left-8" style={{ transform: "translateX(-50%)" }}>
            <svg
                className="absolute inset-0 w-full h-full"
                style={{ overflow: "visible" }}
                preserveAspectRatio="none"
            >
                {/* Base spine line */}
                <motion.line
                    x1="1"
                    y1="0"
                    x2="1"
                    y2="100%"
                    stroke="var(--border)"
                    strokeWidth="2"
                    strokeOpacity="0.4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    vectorEffect="non-scaling-stroke"
                />

                {/* Animated energy pulse */}
                <motion.line
                    x1="1"
                    y1="0"
                    x2="1"
                    y2="100%"
                    stroke="var(--primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                        pathLength: [0, 1, 1],
                        opacity: [0, 0.8, 0]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: "easeInOut"
                    }}
                    vectorEffect="non-scaling-stroke"
                />

                {/* Flowing particles */}
                {Array.from({ length: itemCount }).map((_, i) => (
                    <motion.circle
                        key={i}
                        cx="1"
                        r="2"
                        fill="var(--primary)"
                        initial={{ cy: "0%", opacity: 0 }}
                        animate={{
                            cy: ["0%", "100%"],
                            opacity: [0, 0.8, 0]
                        }}
                        transition={{
                            duration: 4,
                            delay: i * 0.8,
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: "linear"
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

function VerticalConnectionNode({
    isFirst,
    isLast,
    index,
}: {
    isFirst?: boolean;
    isLast?: boolean;
    index: number;
}) {
    return (
        <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="overflow-visible"
            initial="idle"
            whileHover="active"
            animate={{
                scale: [1, 1.05, 1],
            }}
            transition={{
                scale: {
                    duration: 2,
                    delay: index * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }
            }}
        >
            {/* Flowing outer glow */}
            <motion.circle
                cx="12"
                cy="12"
                r="14"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="0.5"
                initial={{ opacity: 0 }}
                animate={{
                    opacity: [0, 0.4, 0],
                    scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                    duration: 2,
                    delay: index * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Outer Ring */}
            <motion.circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1"
                strokeDasharray="3 3"
                variants={{
                    idle: { opacity: 0.2, scale: 0.8, rotate: 0 },
                    active: { opacity: 0.6, scale: 1, rotate: 360 }
                }}
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 8,
                    delay: index * 0.2,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Inner Core */}
            <motion.circle
                cx="12"
                cy="12"
                r="5"
                fill="var(--background)"
                stroke="var(--foreground)"
                strokeWidth="2"
                variants={{
                    idle: { scale: 1 },
                    active: { scale: 1.2, stroke: "var(--primary)" }
                }}
                transition={{ duration: 0.3 }}
            />

            {/* Center Dot with pulse */}
            <motion.circle
                cx="12"
                cy="12"
                r="2"
                fill="var(--foreground)"
                variants={{
                    idle: { opacity: 0.7 },
                    active: { opacity: 1, fill: "var(--primary)" }
                }}
                animate={{
                    opacity: [0.7, 1, 0.7]
                }}
                transition={{
                    duration: 1.5,
                    delay: index * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </motion.svg>
    );
}

function ConnectionSystem() {
    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 48 48"
            className="overflow-visible"
        >
            {/* 
                Persistent Base Line 
                Connects precisely from x=0 to x=48
            */}
            <line
                x1="0" y1="24" x2="48" y2="24"
                stroke="var(--foreground)"
                strokeOpacity="0.4"
                strokeWidth="1"
            />

            {/* Active Drawing Beam - Extends fully into the card */}
            <motion.path
                d="M 0 24 L 48 24"
                stroke="var(--primary)"
                strokeWidth="2"
                fill="none"
                variants={{
                    idle: { pathLength: 0.4, opacity: 0 },
                    active: { pathLength: 1, opacity: 1 }
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            />

            {/* 
               The Node (Target Reticle)
               Centered perfectly at 24, 24
            */}
            <g transform="translate(24, 24)">
                {/* Inner Core (Solid) - Interactive trigger */}
                <motion.circle
                    r="4"
                    fill="var(--background)"
                    stroke="var(--foreground)"
                    strokeWidth="2"
                    variants={{
                        idle: { scale: 1, stroke: "var(--foreground)" },
                        active: { scale: 1.5, stroke: "var(--primary)", fill: "var(--primary)" }
                    }}
                    className="cursor-pointer" // Make it look clickable
                />

                {/* Outer Ring (Rotating Dashed) */}
                <motion.circle
                    r="10"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    variants={{
                        idle: { opacity: 0.3, scale: 0.8, rotate: 0 },
                        active: { opacity: 1, scale: 1.2, rotate: 180 }
                    }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                />

                {/* Secondary Pulse Ring */}
                <motion.circle
                    r="16"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="0.5"
                    variants={{
                        idle: { opacity: 0, scale: 0.5 },
                        active: { opacity: [0, 0.4, 0], scale: 1.5 }
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            </g>
        </svg>
    );
}

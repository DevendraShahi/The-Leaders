"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { timelineData, TimelineSeries, TimelineEpisode } from "@/data/timeline-data";
import { ExternalLink, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Timeline({ limit, showViewAll }: { limit?: number; showViewAll?: boolean }) {
    const [activeSeriesId, setActiveSeriesId] = useState<string | null>(null);

    const displayedData = limit ? timelineData.slice(0, limit) : timelineData;

    return (
        <section className="py-24 bg-background">
            {/* Header Area */}
            <div className="container mx-auto px-4 mb-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto space-y-4"
                >
                    <span className="text-primary font-bold tracking-widest uppercase text-sm">
                        Historical Archives
                    </span>
                    <h2 className="text-5xl md:text-6xl font-bebas text-foreground uppercase tracking-wide leading-none">
                        Nepal&apos;s <span className="text-primary">Political Journey</span>
                    </h2>
                    <p className="text-muted-foreground font-manrope text-lg max-w-2xl mx-auto">
                        Explore the defining eras that shaped the modern republic.
                    </p>
                </motion.div>
            </div>

            <div className="container mx-auto px-4 space-y-6 relative">
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
                        className="flex justify-center mt-12"
                    >
                        <a href="/history" className="group relative inline-flex items-center justify-center overflow-hidden bg-muted/20 px-12 py-6 cursor-pointer transition-all duration-500 hover:bg-primary/5">
                            {/* Animated Border */}
                            <div className="absolute inset-0 border border-primary/20 group-hover:border-primary/50 transition-colors duration-500" />
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary opacity-50 group-hover:scale-150 transition-transform duration-500" />

                            <div className="relative flex flex-col items-center gap-2 z-10">
                                <span className="font-bebas text-3xl uppercase tracking-widest text-foreground group-hover:text-primary transition-colors duration-300">
                                    Access Full Archives
                                </span>
                                <span className="text-xs font-manrope text-muted-foreground uppercase tracking-[0.2em] group-hover:tracking-[0.4em] transition-all duration-500">
                                    Discover the complete history
                                </span>
                            </div>

                            {/* Hover Scan Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </a>
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
                "relative w-full overflow-hidden transition-all duration-500",
                isOpen ? "bg-muted/10 py-12" : "hover:bg-muted/5"
            )}
        >
            {/* Vertical Connection Node with horizontal connector */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10">
                <VerticalConnectionNode isFirst={isFirst} isLast={isLast} index={index} />
            </div>
            {/* Horizontal connector line from spine to card */}
            <motion.div
                className="absolute left-8 top-1/2 w-12 h-[2px] z-5"
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                style={{ originX: 0 }}
            >
                <div className="w-full h-full bg-gradient-to-r from-primary/60 to-primary/20" />
            </motion.div>
            <div className={cn(
                "relative flex flex-col lg:flex-row items-start",
                isOpen ? "gap-8 lg:gap-12 pl-4 lg:pl-8" : "justify-center items-center"
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
                            : "w-full max-w-4xl mx-auto"
                    )}
                >
                    <div className={cn(
                        "relative overflow-hidden border bg-card text-card-foreground shadow-none transition-all duration-300",
                        isOpen
                            ? "border-primary p-8 h-[450px] flex flex-col"
                            : "hover:border-primary p-8 lg:p-10 flex flex-col md:flex-row gap-6 md:items-center text-center md:text-left"
                    )}>
                        <div className="flex-1 space-y-4">
                            <div className={cn("flex items-center gap-3", !isOpen && "justify-center md:justify-start")}>
                                <span className={cn(
                                    "px-3 py-1 text-xs font-bold uppercase tracking-widest border transition-colors",
                                    isOpen
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-transparent text-muted-foreground border-border group-hover:border-primary"
                                )}>
                                    {series.period}
                                </span>
                            </div>

                            <motion.h3
                                layout="position"
                                className={cn(
                                    "font-bebas uppercase leading-none transition-colors group-hover:text-primary tracking-wide",
                                    isOpen ? "text-4xl" : "text-4xl md:text-5xl"
                                )}
                            >
                                {series.title}
                            </motion.h3>

                            <motion.p
                                layout="position"
                                className={cn(
                                    "text-muted-foreground font-manrope leading-relaxed",
                                    isOpen ? "text-sm line-clamp-4" : "text-base max-w-2xl"
                                )}
                            >
                                {series.description}
                            </motion.p>
                        </div>

                        {/* Action / Footer */}
                        <div className={cn(
                            "mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest",
                            isOpen ? "mt-auto pt-6 border-t border-border" : "justify-center md:justify-start"
                        )}>
                            {isOpen ? (
                                <div className="flex items-center gap-2 text-primary w-full">
                                    <span className="flex-1">Viewing Era</span>
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
                                    Explore <ArrowRight className="w-4 h-4" />
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
                            className="flex-grow w-full overflow-hidden relative h-[450px] flex items-center" // items-center for centered layout
                        >
                            {/* Horizontal Spine Line Removed as per request */}

                            {/* Scroll Container */}
                            <div
                                ref={scrollContainerRef}
                                className="w-full h-full overflow-x-auto overflow-y-hidden flex items-center pl-0 pr-12 space-x-12 snap-x snap-mandatory custom-scrollbar pt-0" // Removed pt-12, added items-center
                            >
                                {/* Start Node - Upgraded to match design */}
                                <div className="flex-shrink-0 relative z-10 pl-6 mt-0">
                                    <StartNode />
                                </div>

                                {series.episodes.map((episode, idx) => (
                                    <EpisodeCard
                                        key={episode.id}
                                        episode={episode}
                                        index={idx}
                                    />
                                ))}
                            </div>

                            {/* Right Fade Mask */}
                            <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-background to-transparent pointer-events-none z-20" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

function EpisodeCard({ episode, index }: { episode: TimelineEpisode; index: number }) {
    return (
        <motion.div
            initial="idle"
            whileHover="active"
            viewport={{ once: true }}
            className="relative flex-none w-[300px] group snap-center"
        >
            {/* 
                Animated Connection System 
                Re-Centered: top-[calc(50%-24px)] for precise vertical alignment with spine.
                Z-30 to sit ABOVE the card border.
            */}
            <div className="absolute top-[calc(50%-24px)] -left-[48px] w-[80px] h-[48px] overflow-visible z-30">
                <ConnectionSystem />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card text-card-foreground border border-border shadow-none overflow-hidden hover:border-primary/50 transition-all duration-500 h-[300px] flex flex-col relative z-20"
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
                <div className="bg-muted/50 px-6 py-4 border-b border-border flex justify-between items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500 relative z-10">
                    <span className="font-bebas text-2xl tracking-widest">{episode.year}</span>
                    <motion.div
                        variants={{
                            idle: { rotate: 0 },
                            active: { rotate: 180 }
                        }}
                        className="h-1.5 w-1.5 bg-current transition-all"
                    />
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col relative z-10">
                    <h4 className="font-bebas text-3xl uppercase leading-none mb-4 group-hover:text-primary transition-colors line-clamp-2 tracking-wide">
                        {episode.title}
                    </h4>
                    <p className="text-sm text-muted-foreground font-manrope leading-relaxed line-clamp-4">
                        {episode.description}
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
        <div className="absolute left-8 top-0 bottom-0 w-[2px] z-0 overflow-visible" style={{ transform: "translateX(-50%)" }}>
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
            width="100"
            height="48"
            viewBox="0 0 100 48"
            className="overflow-visible"
        >
            <defs>
                <linearGradient id="beam-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--primary)" />
                </linearGradient>
            </defs>

            {/* 
                Persistent Base Line 
                Connects Node (x=40) to Card (x=90).
                Always visible (Opac 0.4) to fix "Not Connected" feeling.
            */}
            <line
                x1="0" y1="24" x2="90" y2="24"
                stroke="var(--foreground)"
                strokeOpacity="0.4"
                strokeWidth="1"
            />

            {/* Active Drawing Beam - Extends fully into the card */}
            <motion.path
                d="M 0 24 L 90 24"
                stroke="url(#beam-gradient)"
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
               Centered at 40, 24
            */}
            <g transform="translate(40, 24)">
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

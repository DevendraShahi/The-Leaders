"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LEADER_PORTRAIT_MAP } from "@/components/home/NewsArchiveSpotlight";

interface Leader {
    _id?: string;
    slug: string;
    name: { en: string; ne: string } | string;
    position?: { en: string; ne: string } | string;
    desc?: { en: string; ne: string } | string;
    image?: string;
}

interface LeadersGridClientProps {
    leaders: Leader[];
}

const CARD_COLLAPSED_WIDTH = 120;
const CONTAINER_PADDING = 32;

export function LeadersGridClient({ leaders }: LeadersGridClientProps) {
    const { language } = useLanguage();
    const l = LOCALES.home.leadersGrid;
    const isNepali = language === "ne";
    const [expandedMobileCard, setExpandedMobileCard] = useState<number | null>(null);
    const [isMobileViewport, setIsMobileViewport] = useState(false);
    const [visibleCount, setVisibleCount] = useState<number | null>(null);

    const resolveContent = (content: { en?: string; ne?: string } | string | undefined | null): string => {
        if (!content) return "";
        if (typeof content === "string") return content;
        const preferred = isNepali ? content.ne : content.en;
        const fallback = isNepali ? content.en : content.ne;
        return preferred || fallback || "";
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        const media = window.matchMedia("(max-width: 767px)");
        const sync = () => {
            const isMobile = media.matches;
            setIsMobileViewport(isMobile);
            if (!isMobile) setExpandedMobileCard(null);
        };
        sync();
        media.addEventListener("change", sync);
        return () => media.removeEventListener("change", sync);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const calculateVisibleCount = () => {
            const viewportWidth = window.innerWidth;
            if (viewportWidth < 768) {
                setVisibleCount(3);
                return;
            }
            const availableWidth = viewportWidth - CONTAINER_PADDING;
            const minCardWidth = CARD_COLLAPSED_WIDTH + 16; // width + gap
            const cardsThatFit = Math.floor(availableWidth / minCardWidth);
            const withBrowseCard = Math.max(0, cardsThatFit - 1);
            setVisibleCount(Math.min(withBrowseCard, leaders.length));
        };
        calculateVisibleCount();
        window.addEventListener('resize', calculateVisibleCount);
        return () => window.removeEventListener('resize', calculateVisibleCount);
    }, [leaders.length]);

    const displayedLeaders = useMemo(() => {
        if (visibleCount === null) return leaders;
        return leaders.slice(0, visibleCount);
    }, [leaders, visibleCount]);

    const showBrowseCard = true;

    useEffect(() => {
        if (!isMobileViewport || expandedMobileCard === null) return;
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;
            const clickedInsideCard = target.closest('[data-leader-card="true"]');
            if (!clickedInsideCard) {
                setExpandedMobileCard(null);
            }
        };
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [expandedMobileCard, isMobileViewport]);

    if (!leaders || leaders.length === 0) return null;

    return (
        <section id="home-section-3" className="relative overflow-hidden bg-secondary py-20 sm:py-32">
            <div className="container relative z-10 mx-auto mb-10 px-4 sm:mb-16">
                <p className="home-kicker mb-4 text-primary font-bold">{language === "en" ? "Profiles & Biographies" : "प्रोफाइल र जीवनी"}</p>

                <h2
                    className={cn(
                        "section-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
                        isNepali ? "font-semibold normal-case tracking-normal leading-[1.2]" : "tracking-tight"
                    )}
                >
                    {tString(l.heading, language)}
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {tString(l.subheading, language)}
                </p>
            </div>

            <div className="container mx-auto px-4">
                <div className="overflow-x-auto pb-8 custom-scrollbar">
                    <div className="flex min-w-max gap-4">
                        {displayedLeaders.map((leader, index) => {
                            const leaderName = resolveContent(leader.name);
                            const leaderPosition = resolveContent(leader.position);
                            const leaderDescription = resolveContent(leader.desc);
                            const compactName = (leaderName || (isNepali ? "नेता" : "Leader")).split(/\s+/)[0];
                            const fallbackName = isNepali ? "नेताको प्रोफाइल" : "Leader Profile";
                            const isExpanded = isMobileViewport && expandedMobileCard === index;

                            return (
                                <Card
                                    key={leader._id || index}
                                    data-leader-card="true"
                                    onClick={(event) => {
                                        if (!isMobileViewport) return;
                                        if (expandedMobileCard === index) return;
                                        setExpandedMobileCard(index);
                                        window.requestAnimationFrame(() => {
                                            (event.currentTarget as HTMLElement).scrollIntoView({
                                                behavior: "smooth",
                                                inline: "center",
                                                block: "nearest",
                                            });
                                        });
                                    }}
                                    className={cn(
                                        "group/card relative h-[540px] min-w-[120px] basis-[120px] shrink-0 overflow-hidden bg-card border border-border/20 transition-[flex-basis] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:basis-[320px] focus-visible:basis-[320px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer",
                                        isExpanded && "basis-[320px]"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "absolute inset-0 transition-[transform,filter,opacity] duration-700 ease-out opacity-70 grayscale saturate-50 brightness-[0.82] contrast-110",
                                            "group-hover/card:scale-[1.02] group-hover/card:opacity-100 group-hover/card:grayscale-0 group-hover/card:saturate-100 group-hover/card:brightness-100 group-hover/card:contrast-100",
                                            "group-focus-visible/card:scale-[1.02] group-focus-visible/card:opacity-100 group-focus-visible/card:grayscale-0 group-focus-visible/card:saturate-100 group-focus-visible/card:brightness-100 group-focus-visible/card:contrast-100",
                                            isExpanded && "scale-[1.02] grayscale-0 opacity-100 saturate-100 brightness-100 contrast-100"
                                        )}
                                    >
                                        <Image
                                            src={(leader.slug && LEADER_PORTRAIT_MAP[leader.slug]) || leader.image || "/the-leader.png"}
                                            alt={leaderName || fallbackName}
                                            fill
                                            className="object-cover object-top"
                                            sizes="(max-width: 768px) 75vw, 320px"
                                            quality={95}
                                        />
                                    </div>

                                    <div className="pointer-events-none absolute inset-0">
                                        <div
                                            className={cn(
                                                "absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-0 transition-opacity duration-500",
                                                "group-hover/card:opacity-100 group-focus-visible/card:opacity-100",
                                                isExpanded && "opacity-100"
                                            )}
                                        />
                                    </div>

                                    <div
                                        className={cn(
                                            "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 group-hover/card:opacity-0 group-focus-visible/card:opacity-0",
                                            isExpanded && "opacity-0"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "font-editorial text-2xl text-foreground/40 [writing-mode:vertical-rl] rotate-180 drop-shadow-md",
                                                isNepali ? "tracking-[0.08em]" : "tracking-[0.18em]"
                                            )}
                                        >
                                            {compactName}
                                        </span>
                                    </div>

                                    <CardContent
                                        className={cn(
                                            "absolute inset-x-0 bottom-0 translate-y-8 p-6 opacity-0 transition-all duration-500 ease-out",
                                            "pointer-events-none group-hover/card:pointer-events-auto group-focus-visible/card:pointer-events-auto",
                                            "group-hover/card:translate-y-0 group-hover/card:opacity-100",
                                            "group-focus-visible/card:translate-y-0 group-focus-visible/card:opacity-100",
                                            isExpanded && "pointer-events-auto translate-y-0 opacity-100"
                                        )}
                                    >
                                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
                                            {leaderPosition}
                                        </p>
                                        <h3
                                            className={cn(
                                                "mt-2 text-foreground",
                                                isNepali
                                                    ? "text-[2rem] font-semibold leading-[1.14]"
                                                    : "font-editorial text-[2.2rem] leading-[1] tracking-tight"
                                            )}
                                        >
                                            {leaderName || fallbackName}
                                        </h3>
                                        {leaderDescription ? (
                                            <div className="mt-4 border-l-2 border-primary/20 pl-4">
                                                <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                                    {leaderDescription}
                                                </p>
                                            </div>
                                        ) : null}
                                        <Link prefetch={false}
                                            href={`/leaders/${leader.slug}`}
                                            onClick={(event) => event.stopPropagation()}
                                            className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground transition-colors hover:text-primary font-bold"
                                        >
                                            {tString(l.readProfile, language)}
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {showBrowseCard && (
                            <Link prefetch={false}
                                href="/leaders"
                                aria-label={tString(l.viewAll, language)}
                            >
                                <Card className="group/rail relative flex h-[540px] min-w-[120px] basis-[120px] shrink-0 items-center justify-center bg-card border border-border/20 transition-[flex-basis,background-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:basis-[280px] hover:bg-muted focus-visible:basis-[280px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer">
                                    <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4 px-4 text-center">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background border border-border/20 transition-all duration-500 group-hover/rail:border-primary/40 group-hover/rail:bg-primary/5 group-focus-visible/rail:border-primary/40 shadow-sm">
                                            <ArrowRight className="h-5 w-5 text-foreground/70 transition-all duration-300 group-hover/rail:translate-x-1 group-hover/rail:text-primary group-focus-visible/rail:translate-x-1" />
                                        </div>

                                        <div className="absolute bottom-16 hidden opacity-0 transition-opacity duration-500 group-hover/rail:opacity-100 group-focus-visible/rail:opacity-100 lg:block">
                                            <h4
                                                className={cn(
                                                    "whitespace-nowrap font-editorial text-3xl text-foreground",
                                                    isNepali ? "tracking-normal" : "uppercase tracking-tight"
                                                )}
                                            >
                                                {tString(l.viewAll, language)}
                                            </h4>
                                            <p className="mt-2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                                                {isNepali ? "पूर्ण डाटाबेस" : "Full database"}
                                            </p>
                                        </div>

                                        <div className="transition-opacity duration-500 group-hover/rail:opacity-0 group-focus-visible/rail:opacity-0">
                                            <span
                                                className={cn(
                                                    "font-editorial text-2xl text-foreground/40 [writing-mode:vertical-rl] rotate-180 drop-shadow-sm",
                                                    isNepali ? "tracking-[0.1em]" : "tracking-[0.2em]"
                                                )}
                                            >
                                                {tString(l.viewAll, language)}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

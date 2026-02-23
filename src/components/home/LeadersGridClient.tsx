"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import { cn } from "@/lib/utils";

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

export function LeadersGridClient({ leaders }: LeadersGridClientProps) {
    const { language } = useLanguage();
    const l = LOCALES.home.leadersGrid;
    const isNepali = language === "ne";
    const [expandedMobileCard, setExpandedMobileCard] = useState<number | null>(null);
    const [isMobileViewport, setIsMobileViewport] = useState(false);
    const railRef = useRef<HTMLDivElement | null>(null);

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
        <section id="home-section-3" className="relative overflow-hidden border-y border-border/80 bg-background py-20 sm:py-24 lg:py-24">
            <div className="pointer-events-none absolute inset-0 bg-primary/5" />

            <div className="container relative z-10 mx-auto mb-10 px-4 sm:mb-12 lg:mb-14">
                <p className="home-kicker mb-4">{language === "en" ? "Profiles & Dossiers" : "प्रोफाइल र विवरण"}</p>

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
                <div
                    ref={railRef}
                    className="overflow-x-auto border border-border/80 bg-card/30 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-border/85 [&::-webkit-scrollbar-track]:bg-transparent"
                >
                    <div className="flex min-w-max">
                        {leaders.map((leader, index) => {
                            const leaderName = resolveContent(leader.name);
                            const leaderPosition = resolveContent(leader.position);
                            const leaderDescription = resolveContent(leader.desc);
                            const compactName = (leaderName || (isNepali ? "नेता" : "Leader")).split(/\s+/)[0];
                            const fallbackName = isNepali ? "नेताको प्रोफाइल" : "Leader Profile";
                            const isExpanded = isMobileViewport && expandedMobileCard === index;

                            return (
                                <article
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
                                        "group/card relative h-[540px] min-w-[104px] basis-[104px] shrink-0 overflow-hidden border-r border-border/70 bg-card/80 transition-[flex-basis,background-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:basis-[300px] hover:bg-card focus-visible:basis-[300px] focus-visible:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                                        isExpanded && "basis-[300px] bg-card"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "absolute inset-0 transition-[transform,filter,opacity] duration-700 ease-out opacity-70 grayscale saturate-50 brightness-[0.82] contrast-110",
                                            "group-hover/card:scale-[1.04] group-hover/card:opacity-100 group-hover/card:grayscale-0 group-hover/card:saturate-100 group-hover/card:brightness-100 group-hover/card:contrast-100",
                                            "group-focus-visible/card:scale-[1.04] group-focus-visible/card:opacity-100 group-focus-visible/card:grayscale-0 group-focus-visible/card:saturate-100 group-focus-visible/card:brightness-100 group-focus-visible/card:contrast-100",
                                            isExpanded && "scale-[1.04] grayscale-0 opacity-100 saturate-100 brightness-100 contrast-100"
                                        )}
                                    >
                                        <Image
                                            src={leader.image || "/placeholder-leader.jpg"}
                                            alt={leaderName || fallbackName}
                                            fill
                                            className="object-cover object-top"
                                            sizes="(max-width: 768px) 75vw, 300px"
                                            quality={95}
                                        />
                                    </div>

                                    <div className="pointer-events-none absolute inset-0">
                                        <div
                                            className={cn(
                                                "absolute inset-0 home-image-overlay-strong opacity-0 transition-opacity duration-500",
                                                "group-hover/card:opacity-100 group-focus-visible/card:opacity-100",
                                                isExpanded && "opacity-100"
                                            )}
                                        />
                                        <div
                                            className={cn(
                                                "absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(183,28,28,0.24),transparent_56%)] opacity-0 transition-opacity duration-500",
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
                                                "font-editorial text-2xl text-foreground/35 [writing-mode:vertical-rl] rotate-180",
                                                isNepali ? "tracking-[0.08em]" : "tracking-[0.18em]"
                                            )}
                                        >
                                            {compactName}
                                        </span>
                                    </div>

                                    <div
                                        className={cn(
                                            "absolute inset-x-0 bottom-0 translate-y-8 p-5 opacity-0 transition-all duration-500 ease-out",
                                            "pointer-events-none group-hover/card:pointer-events-auto group-focus-visible/card:pointer-events-auto",
                                            "group-hover/card:translate-y-0 group-hover/card:opacity-100",
                                            "group-focus-visible/card:translate-y-0 group-focus-visible/card:opacity-100",
                                            isExpanded && "pointer-events-auto translate-y-0 opacity-100"
                                        )}
                                    >
                                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">
                                            {leaderPosition}
                                        </p>
                                        <h3
                                            className={cn(
                                                "mt-2 text-foreground drop-shadow-[0_1px_6px_rgba(183,28,28,0.12)]",
                                                isNepali
                                                    ? "text-[2rem] font-semibold leading-[1.14]"
                                                    : "font-editorial text-[2.2rem] leading-[0.93] tracking-[-0.01em]"
                                            )}
                                        >
                                            {leaderName || fallbackName}
                                        </h3>
                                        {leaderDescription ? (
                                            <div className="mt-3 border-l border-primary/50 pl-4">
                                                <p className="line-clamp-3 text-[11px] leading-relaxed text-muted-foreground">
                                                    {leaderDescription}
                                                </p>
                                            </div>
                                        ) : null}
                                        <Link
                                            href={`/leaders/${leader.slug}`}
                                            onClick={(event) => event.stopPropagation()}
                                            className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary transition-colors hover:text-primary/80"
                                        >
                                            {tString(l.readProfile, language)}
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}

                        <Link
                            href="/leaders"
                            aria-label={tString(l.viewAll, language)}
                            className="group/rail relative flex h-[540px] min-w-[104px] basis-[104px] shrink-0 items-center justify-center bg-card/80 transition-[flex-basis,background-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:basis-[260px] hover:bg-card focus-visible:basis-[260px] focus-visible:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                            <div className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity duration-500 group-hover/rail:opacity-100 group-focus-visible/rail:opacity-100" />
                            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4 px-4 text-center">
                                <div className="flex h-12 w-12 items-center justify-center border border-border/70 bg-background/85 transition-all duration-500 group-hover/rail:border-primary/60 group-hover/rail:bg-primary/5 group-focus-visible/rail:border-primary/60 group-focus-visible/rail:bg-primary/5">
                                    <ArrowRight className="h-4 w-4 text-foreground/70 transition-all duration-300 group-hover/rail:translate-x-1 group-hover/rail:text-primary group-focus-visible/rail:translate-x-1 group-focus-visible/rail:text-primary" />
                                </div>

                                <div className="absolute bottom-16 hidden opacity-0 transition-opacity duration-500 group-hover/rail:opacity-100 group-focus-visible/rail:opacity-100 lg:block">
                                    <h4
                                        className={cn(
                                            "whitespace-nowrap font-editorial text-3xl text-foreground/85",
                                            isNepali ? "tracking-normal" : "uppercase tracking-tight"
                                        )}
                                    >
                                        {tString(l.viewAll, language)}
                                    </h4>
                                    <p className="mt-1 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                                        {isNepali ? "पूर्ण डाटाबेस" : "Full database"}
                                    </p>
                                </div>

                                <div className="transition-opacity duration-500 group-hover/rail:opacity-0 group-focus-visible/rail:opacity-0">
                                    <span
                                        className={cn(
                                            "font-editorial text-2xl text-foreground/35 [writing-mode:vertical-rl] rotate-180",
                                            isNepali ? "tracking-[0.1em]" : "tracking-[0.2em]"
                                        )}
                                    >
                                        {tString(l.viewAll, language)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

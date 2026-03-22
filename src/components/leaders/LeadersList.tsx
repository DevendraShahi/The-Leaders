"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpRight, Grid } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ILeader } from "@/models/Leader";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString, type LanguageCode } from "@/lib/locales";

gsap.registerPlugin(ScrollTrigger);

type LocalizedField = { en?: string; ne?: string } | string | null | undefined;

const resolveContent = (field: LocalizedField, language: LanguageCode) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    const primary = language === "ne" ? field.ne : field.en;
    const fallback = language === "ne" ? field.en : field.ne;
    return primary || fallback || "";
};

const normalizeDigits = (value: string) =>
    value.replace(/[०-९]/g, (digit) => String("०१२३४५६७८९".indexOf(digit)));

const parseTimelineYear = (value: string) => {
    const normalized = normalizeDigits(value);
    const firstMatch = normalized.match(/\d{3,4}/);
    return firstMatch ? Number(firstMatch[0]) : Number.POSITIVE_INFINITY;
};

const normalizeSearchText = (value: string) =>
    value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\p{L}\p{N}\s]+/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

const tokenizeSearch = (value: string) => normalizeSearchText(value).split(" ").filter(Boolean);

const isAtMostOneEditAway = (a: string, b: string) => {
    if (a === b) return true;
    const lenA = a.length;
    const lenB = b.length;
    if (Math.abs(lenA - lenB) > 1) return false;

    let i = 0;
    let j = 0;
    let edits = 0;

    while (i < lenA && j < lenB) {
        if (a[i] === b[j]) {
            i += 1;
            j += 1;
            continue;
        }

        edits += 1;
        if (edits > 1) return false;

        if (lenA > lenB) {
            i += 1;
        } else if (lenB > lenA) {
            j += 1;
        } else {
            i += 1;
            j += 1;
        }
    }

    if (i < lenA || j < lenB) edits += 1;
    return edits <= 1;
};

const nameMatchesQuery = (name: string, query: string) => {
    const normalizedName = normalizeSearchText(name);
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return true;

    if (normalizedName.includes(normalizedQuery)) return true;

    const compactName = normalizedName.replace(/\s+/g, "");
    const compactQuery = normalizedQuery.replace(/\s+/g, "");
    if (compactName.includes(compactQuery)) return true;

    const nameTokens = tokenizeSearch(normalizedName);
    const queryTokens = tokenizeSearch(normalizedQuery);
    const initials = nameTokens.map((token) => token[0]).join("");

    const matchesToken = (queryToken: string) =>
        nameTokens.some((nameToken) => {
            if (nameToken.startsWith(queryToken) || nameToken.includes(queryToken)) return true;
            if (queryToken.length >= 4 && nameToken.length >= 4) return isAtMostOneEditAway(queryToken, nameToken);
            return false;
        });

    if (queryTokens.length > 1) {
        return queryTokens.every((queryToken) => matchesToken(queryToken));
    }

    const singleToken = queryTokens[0];
    if (!singleToken) return false;
    if (initials.includes(singleToken)) return true;
    return matchesToken(singleToken);
};

interface LeadersListProps {
    leaders: ILeader[];
}

type SortKey = "featured" | "nameAsc" | "nameDesc" | "timelineAsc" | "timelineDesc";

export default function LeadersList({ leaders }: LeadersListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("featured");
    const stackRef = useRef<HTMLDivElement | null>(null);
    const stackEndRef = useRef<HTMLDivElement | null>(null);
    const stackCtxRef = useRef<gsap.Context | null>(null);
    const shouldReduceMotion = useReducedMotion();
    const { language } = useLanguage();
    const locale = LOCALES.leadersIndex;

    const filteredLeaders = useMemo(() => {
        const normalizedTerm = normalizeSearchText(searchTerm);

        const bySearch = leaders.filter((leader) => {
            const name = resolveContent(leader.name, language);
            const position = resolveContent(leader.position, language);
            const party = resolveContent(leader.party, language);
            const years = resolveContent(leader.years, language);
            const secondaryFields = [position, party, years].map((entry) => normalizeSearchText(entry));

            if (!normalizedTerm) return true;

            if (nameMatchesQuery(name, normalizedTerm)) return true;

            // Keep search name-first; only fall back to metadata after 3 chars.
            if (normalizedTerm.length <= 2) return false;
            return secondaryFields.some((entry) => entry.includes(normalizedTerm));
        });

        return bySearch.sort((a, b) => {
            const aName = resolveContent(a.name, language);
            const bName = resolveContent(b.name, language);
            const aYear = parseTimelineYear(resolveContent(a.years, language));
            const bYear = parseTimelineYear(resolveContent(b.years, language));

            if (sortKey === "featured") {
                if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
                return aName.localeCompare(bName, language === "ne" ? "ne" : "en");
            }
            if (sortKey === "nameAsc") {
                return aName.localeCompare(bName, language === "ne" ? "ne" : "en");
            }
            if (sortKey === "nameDesc") {
                return bName.localeCompare(aName, language === "ne" ? "ne" : "en");
            }
            if (sortKey === "timelineAsc") {
                return aYear - bYear;
            }
            return bYear - aYear;
        });
    }, [language, leaders, searchTerm, sortKey]);

    const featuredLeader = useMemo(() => {
        return (
            filteredLeaders.find((leader) => leader.isFeatured) ||
            filteredLeaders[0] ||
            leaders.find((leader) => leader.isFeatured) ||
            leaders[0] ||
            null
        );
    }, [filteredLeaders, leaders]);

    const resultsText = tString(locale.controls.resultsLabel, language)
        .replace("{count}", String(filteredLeaders.length))
        .replace("{total}", String(leaders.length));

    const philosophyBeliefs = [
        tString(locale.philosophy.beliefOne, language),
        tString(locale.philosophy.beliefTwo, language),
        tString(locale.philosophy.beliefThree, language),
    ];
    const stackSignature = useMemo(
        () => filteredLeaders.map((leader) => leader.slug || String(leader._id || "")).join("|"),
        [filteredLeaders]
    );
    const stackEffectsEnabled = !shouldReduceMotion;

    const teardownStackAnimation = useCallback(() => {
        if (!stackCtxRef.current) return;
        stackCtxRef.current.revert();
        stackCtxRef.current = null;
    }, []);

    const clearControls = () => {
        teardownStackAnimation();
        setSearchTerm("");
        setSortKey("featured");
    };

    useLayoutEffect(() => {
        teardownStackAnimation();
        const root = stackRef.current;
        if (!root) return;

        if (!stackEffectsEnabled) {
            ScrollTrigger.refresh(true);
            return;
        }

        let rafId = 0;
        rafId = window.requestAnimationFrame(() => {
            stackCtxRef.current = gsap.context(() => {
                const cards = gsap.utils.toArray<HTMLElement>(".c-card", root);
                if (!cards.length) return;

                if (shouldReduceMotion) {
                    gsap.set(cards, { clearProps: "all" });
                    return;
                }

                if (cards.length === 1) {
                    gsap.set(cards[0], { clearProps: "all", scale: 1, filter: "blur(0px)", opacity: 1 });
                    return;
                }

                const lastCardIndex = cards.length - 1;
                const compactStack = cards.length <= 3;
                const lastCardST = ScrollTrigger.create({
                    trigger: stackEndRef.current || cards[lastCardIndex],
                    start: "top top",
                });

                cards.forEach((card, index) => {
                    const isLast = index === lastCardIndex;
                    const scaleTo = isLast ? (compactStack ? 0.45 : 1) : 0.45;
                    const blurTo = isLast ? (compactStack ? "blur(5.5px)" : "blur(0px)") : "blur(5.5px)";
                    const opacityTo = isLast ? (compactStack ? 0.5 : 1) : 0.5;
                    gsap.set(card, { transformOrigin: "center top", filter: "blur(0px)", opacity: 1 });

                    const scaleTween = gsap.to(card, {
                        scale: scaleTo,
                        filter: blurTo,
                        opacity: opacityTo,
                        ease: "none",
                    });

                    ScrollTrigger.create({
                        trigger: card,
                        start: "top top",
                        end: () => lastCardST.start,
                        pin: true,
                        pinSpacing: false,
                        scrub: 0.5,
                        animation: scaleTween,
                        toggleActions: "restart none none reverse",
                        invalidateOnRefresh: true,
                    });
                });
            }, root);
            ScrollTrigger.refresh(true);
        });

        return () => {
            window.cancelAnimationFrame(rafId);
            teardownStackAnimation();
        };
    }, [language, shouldReduceMotion, stackEffectsEnabled, stackSignature, teardownStackAnimation]);

    return (
        <div className="homepage-shell leaders-canvas election-typography min-h-screen bg-background pb-20 pt-24">
            <section className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="overflow-hidden border border-border/80 bg-card/50"
                >
                    <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
                        <div className="border-b border-border/80 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:border-border/80">
                            <p className="home-kicker">{tString(locale.hero.badgeLabel, language)}</p>
                            <h1 className="mt-4 font-editorial text-[clamp(2.05rem,5vw,4.2rem)] leading-[1.04] tracking-[-0.015em] text-foreground">
                                {tString(locale.hero.heading, language)}
                            </h1>
                            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                {tString(locale.hero.subheading, language)}
                            </p>
                            <div className="mt-4">
                                <Link
                                    href="/leaders/gallery"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                                >
                                    <Grid className="w-4 h-4" />
                                    {language === "ne" ? "ग्यालरी दृश्य" : "Gallery View"}
                                </Link>
                            </div>
                            <p className="home-body mt-5 max-w-3xl">{tString(locale.hero.description, language)}</p>

                            <div className="mt-7">
                                <p className="home-meta mb-2">{tString(locale.controls.searchLabel, language)}</p>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder={tString(locale.controls.searchPlaceholder, language)}
                                        className="h-11 border-border/80 bg-background/75 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            teardownStackAnimation();
                                            setSearchTerm(e.target.value);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="mt-5 grid max-w-[560px] gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                                <div>
                                    <p className="home-meta mb-2">{tString(locale.controls.sortLabel, language)}</p>
                                    <Select
                                        value={sortKey}
                                        onValueChange={(value) => {
                                            teardownStackAnimation();
                                            setSortKey(value as SortKey);
                                        }}
                                    >
                                        <SelectTrigger className="h-10 w-full border-border/80 bg-background/75 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground focus-visible:ring-primary/45">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent align="start" className="border-border/80 bg-background">
                                            <SelectItem value="featured">{tString(locale.controls.sortOptions.featured, language)}</SelectItem>
                                            <SelectItem value="nameAsc">{tString(locale.controls.sortOptions.nameAsc, language)}</SelectItem>
                                            <SelectItem value="nameDesc">{tString(locale.controls.sortOptions.nameDesc, language)}</SelectItem>
                                            <SelectItem value="timelineAsc">{tString(locale.controls.sortOptions.timelineAsc, language)}</SelectItem>
                                            <SelectItem value="timelineDesc">{tString(locale.controls.sortOptions.timelineDesc, language)}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <button
                                    type="button"
                                    onClick={clearControls}
                                    className="inline-flex h-10 items-center border border-border/80 bg-background/75 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/80 transition-colors hover:border-primary/45 hover:text-primary"
                                >
                                    {tString(locale.controls.clearFilters, language)}
                                </button>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <p className="home-meta">{resultsText}</p>
                            </div>
                        </div>

                        <aside className="relative min-h-[340px] overflow-hidden">
                            {featuredLeader ? (
                                <Link href={`/leaders/${featuredLeader.slug}`} className="group block h-full">
                                    <div className="absolute inset-0">
                                        {featuredLeader.image ? (
                                            <Image
                                                src={featuredLeader.image}
                                                alt={resolveContent(featuredLeader.name, language)}
                                                fill
                                                className="object-cover object-top home-image-base transition-transform duration-700 group-hover:scale-[1.04]"
                                                sizes="(max-width: 1024px) 100vw, 42vw"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-background/92" />
                                        )}
                                        <div className="absolute inset-0 home-image-overlay-strong" />
                                        <div className="absolute inset-0 home-image-overlay-soft opacity-70" />
                                    </div>

                                    <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-8">
                                        <p className="home-kicker">{tString(locale.lead.label, language)}</p>
                                        <h2 className="mt-3 font-editorial text-[clamp(2.1rem,4.5vw,3.7rem)] leading-[0.98] tracking-[-0.014em] text-white">
                                            {resolveContent(featuredLeader.name, language)}
                                        </h2>
                                        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/85">
                                            {resolveContent(featuredLeader.position, language)}
                                        </p>
                                        <p className="mt-3 max-w-xl text-sm leading-7 text-white/84 sm:text-[0.96rem]">
                                            {resolveContent(featuredLeader.desc, language)}
                                        </p>
                                        <div className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white transition-colors group-hover:text-primary">
                                            {tString(locale.lead.viewProfile, language)}
                                            <ArrowUpRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
                                    {tString(locale.empty.subtitle, language)}
                                </div>
                            )}
                        </aside>
                    </div>
                </motion.div>

                <section className="mt-8">
                    {filteredLeaders.length > 0 ? (
                        <div ref={stackRef} className="l-cards mx-auto w-full max-w-[1200px]">
                            <article
                                data-leader-slide
                                className="c-card relative mt-5 min-h-[600px] overflow-hidden border border-border/80 bg-card/70 lg:h-[90vh]"
                            >
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(183,28,28,0.2),transparent_54%)]" />
                                <div className="relative grid h-full gap-6 p-6 sm:p-8 lg:grid-cols-2 lg:p-10">
                                    <div className="c-card__description flex flex-col justify-between">
                                        <div>
                                            <p className="home-kicker">{tString(locale.philosophy.label, language)}</p>
                                            <h2 className="mt-4 font-editorial text-[clamp(1.9rem,5.3vw,3.7rem)] leading-[1.03] tracking-[-0.015em] text-foreground">
                                                {tString(locale.philosophy.heading, language)}
                                            </h2>
                                            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-[0.98rem]">
                                                {tString(locale.philosophy.description, language)}
                                            </p>
                                        </div>

                                        <div className="mt-8 grid gap-2 sm:grid-cols-3">
                                            {philosophyBeliefs.map((belief, idx) => (
                                                <div key={`${belief}-${idx}`} className="border border-border/80 bg-background/70 px-3 py-3">
                                                    <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-primary">
                                                        0{idx + 1}
                                                    </p>
                                                    <p className="mt-2 text-sm text-foreground/90">{belief}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="c-card__figure flex flex-col justify-end border border-border/80 bg-background/78 p-5 sm:p-6">
                                        <p className="home-meta">{tString(locale.philosophy.transition, language)}</p>
                                        <p className="mt-3 text-sm leading-7 text-muted-foreground">{tString(locale.philosophy.scrollHint, language)}</p>
                                    </div>
                                </div>
                            </article>

                            {filteredLeaders.map((leader, index) => {
                                const isLegacy = !leader.isActive || String(leader.status).toLowerCase() === "archived";
                                const statusLabel = isLegacy
                                    ? tString(locale.card.legacyTag, language)
                                    : tString(locale.card.activeTag, language);
                                const sequenceLabel = tString(locale.card.sequenceLabel, language).replace("{index}", String(index + 2));

                                return (
                                    <article
                                        key={leader._id || leader.slug}
                                        data-leader-slide
                                        className="c-card relative mt-5 min-h-[600px] overflow-hidden border border-border/80 bg-card/72 lg:h-[90vh]"
                                    >
                                        <div className="grid h-full gap-6 lg:grid-cols-2">
                                            <div className="c-card__description flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                                                <div>
                                                    <p className="home-meta">{sequenceLabel}</p>
                                                    <h3 className="mt-3 font-editorial text-[clamp(1.95rem,6vw,4.2rem)] leading-[0.98] tracking-[-0.015em] text-foreground">
                                                        {resolveContent(leader.name, language)}
                                                    </h3>
                                                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                                                        {resolveContent(leader.position, language)}
                                                    </p>
                                                    <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-[0.96rem]">
                                                        {resolveContent(leader.desc, language)}
                                                    </p>
                                                </div>

                                                <div className="mt-7 space-y-2 border-t border-border/80 pt-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="home-meta">{tString(locale.card.yearsLabel, language)}</span>
                                                        <span className="text-sm text-foreground/88">{resolveContent(leader.years, language) || "—"}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="home-meta">{tString(locale.card.partyLabel, language)}</span>
                                                        <span className="line-clamp-1 text-sm text-foreground/88">
                                                            {resolveContent(leader.party, language) || "—"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="home-meta">{tString(locale.card.statusLabel, language)}</span>
                                                        <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-primary">
                                                            {statusLabel}
                                                        </span>
                                                    </div>

                                                    <Link
                                                        href={`/leaders/${leader.slug}`}
                                                        className="mt-4 inline-flex h-10 items-center gap-2 border border-border/80 bg-background/75 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground transition-colors hover:border-primary/55 hover:bg-primary/10 hover:text-primary"
                                                    >
                                                        {tString(locale.card.openFile, language)}
                                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                                    </Link>
                                                </div>
                                            </div>

                                            <div className="c-card__figure relative min-h-[340px] overflow-hidden border-t border-border/80 lg:min-h-full lg:border-l lg:border-t-0 lg:border-border/80">
                                                {leader.image ? (
                                                    <>
                                                        <Image
                                                            src={leader.image}
                                                            alt={resolveContent(leader.name, language)}
                                                            fill
                                                            className="object-cover object-top home-image-base"
                                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                                        />
                                                        <div className="absolute inset-0 home-image-overlay-neutral" />
                                                        <div className="absolute inset-0 home-image-overlay-soft opacity-65" />
                                                    </>
                                                ) : (
                                                    <div className="absolute inset-0 grid place-items-center bg-background/92">
                                                        <p className="home-meta">{tString(locale.card.noPortrait, language)}</p>
                                                    </div>
                                                )}

                                                {leader.isFeatured ? (
                                                    <div className="absolute left-4 top-4 border border-primary/55 bg-primary/15 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-primary">
                                                        {tString(locale.card.featuredTag, language)}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}

                            <div ref={stackEndRef} aria-hidden className="h-[72vh] sm:h-[84vh]" />
                        </div>
                    ) : (
                        <div className="border border-border/80 bg-card/55 p-8 text-center sm:p-10">
                            <h3 className="font-editorial text-[1.85rem] leading-[1.08] tracking-[-0.012em] text-foreground">
                                {tString(locale.empty.title, language)}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                {tString(locale.empty.subtitle, language)}
                            </p>
                        </div>
                    )}
                </section>
            </section>
        </div>
    );
}

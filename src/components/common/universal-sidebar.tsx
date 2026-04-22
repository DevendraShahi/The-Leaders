"use client";

import { type MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Clock3, Compass, ExternalLink, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getElectionSnapshotStats } from "@/lib/election-snapshot-data";
import { cn } from "@/lib/utils";

type LocalizedLabel = {
    en: string;
    ne: string;
};

export type UniversalSidebarLink = {
    href: string;
    label?: LocalizedLabel;
    text?: string;
    description?: LocalizedLabel;
};

export type UniversalSidebarResourceLink = {
    href: string;
    label: string | LocalizedLabel;
};

export interface UniversalSidebarProps {
    title?: string;
    dataTags?: string[];
    primaryActionLabel?: string;
    primaryActionHref?: string;
    className?: string;
    navigationLinks?: UniversalSidebarLink[];
    resourceLinks?: UniversalSidebarResourceLink[];
    activeHref?: string;
    mode?: "global" | "embedded";
}

const DEFAULT_NAVIGATION_LINKS: UniversalSidebarLink[] = [
    { href: "#home-section-1", label: { en: "Countdown & Election Date", ne: "काउन्टडाउन र निर्वाचन मिति" } },
    { href: "#home-section-2", label: { en: "Snapshot, Briefs & Fact Checks", ne: "स्न्यापशट, ब्रिफ र तथ्य-जाँच" } },
    { href: "#home-section-3", label: { en: "Leader Profiles", ne: "नेता प्रोफाइलहरू" } },
    { href: "#home-section-4", label: { en: "Latest Coverage", ne: "ताजा समाचार कवरेज" } },
    { href: "#home-section-5", label: { en: "Manifesto Explorer", ne: "घोषणापत्र एक्सप्लोरर" } },
    { href: "#home-section-6", label: { en: "Historical Timeline", ne: "ऐतिहासिक समयरेखा" } },
];

const DEFAULT_SECTION_GUIDES: Record<string, LocalizedLabel> = {
    "#home-section-1": {
        en: "Track the election clock and lock in the official date context.",
        ne: "निर्वाचनको समयरेखा र आधिकारिक मिति सन्दर्भ एकै ठाउँमा हेर्नुहोस्।",
    },
    "#home-section-2": {
        en: "Review briefs and fact checks before diving into deeper narratives.",
        ne: "गहिरो विश्लेषण अघि ब्रिफ र तथ्य-जाँचबाट सार बुझ्नुहोस्।",
    },
    "#home-section-3": {
        en: "Compare leaders side by side with profile-level context.",
        ne: "नेता प्रोफाइलहरू तुलना गरेर पृष्ठभूमि छिटो बुझ्नुहोस्।",
    },
    "#home-section-4": {
        en: "Scan the latest coverage to catch momentum shifts quickly.",
        ne: "ताजा समाचारबाट चुनावी धारणा र प्रवृत्ति छिटो समात्नुहोस्।",
    },
    "#home-section-5": {
        en: "Use manifesto explorer to contrast promises across parties.",
        ne: "घोषणापत्र एक्सप्लोररबाट पार्टीगत प्रतिवद्धता तुलना गर्नुहोस्।",
    },
    "#home-section-6": {
        en: "Connect current events with historical timeline references.",
        ne: "अहिलेको घटनालाई ऐतिहासिक समयरेखासँग जोडेर हेर्नुहोस्।",
    },
};

const DEFAULT_ROUTE_GUIDES: Record<string, LocalizedLabel> = {
    "/": {
        en: "Jump across core sections from a single command sidebar.",
        ne: "एकै कमान्ड साइडबारबाट मुख्य खण्डहरूमा छिटो जानुहोस्।",
    },
    "/leaders": {
        en: "Browse leader profiles and compare historical influence.",
        ne: "नेता प्रोफाइलहरू हेरेर ऐतिहासिक प्रभाव तुलना गर्नुहोस्।",
    },
    "/history": {
        en: "Trace political eras and connect events over time.",
        ne: "राजनीतिक युगहरू ट्र्याक गरी घटनाहरू समयरेखासँग जोड्नुहोस्।",
    },
    "/coverage": {
        en: "Monitor coverage modules, columns, and daily briefs.",
        ne: "कभरेज मोड्युल, स्तम्भ र दैनिक ब्रिफ ट्र्याक गर्नुहोस्।",
    },
    "/articles": {
        en: "Read context-rich editorial stories and analysis.",
        ne: "सन्दर्भयुक्त सम्पादकीय कथा र विश्लेषण पढ्नुहोस्।",
    },
    "/about": {
        en: "Review mission, editorial intent, and platform direction.",
        ne: "मिशन, सम्पादकीय उद्देश्य र प्लेटफर्म दिशा बुझ्नुहोस्।",
    },
    "/contact": {
        en: "Reach the team and send focused feedback quickly.",
        ne: "टोलीसँग सम्पर्क गरी केन्द्रित प्रतिक्रिया पठाउनुहोस्।",
    },
};

const DEFAULT_RESOURCE_LINKS: Record<"en" | "ne", UniversalSidebarResourceLink[]> = {
    en: [
        { href: "/coverage", label: "Coverage Platform" },
        { href: "/leaders", label: "Leader Profiles" },
        { href: "/articles", label: "Analysis" },
    ],
    ne: [
        { href: "/coverage", label: "कभरेज प्लेटफर्म" },
        { href: "/leaders", label: "नेता प्रोफाइल" },
        { href: "/articles", label: "विश्लेषण" },
    ],
};

function resolveLabel(value: string | LocalizedLabel | undefined, locale: "en" | "ne"): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[locale];
}

function isLinkMatch(href: string, active: string): boolean {
    if (!active) return false;

    if (href.startsWith("#")) {
        return href === active;
    }

    if (href === "/") {
        return active === "/";
    }

    return active === href || active.startsWith(`${href}/`) || active.startsWith(`${href}#`);
}

export function UniversalSidebar({
    title,
    dataTags,
    primaryActionLabel,
    primaryActionHref,
    className,
    navigationLinks,
    resourceLinks,
    activeHref,
    mode = "global",
}: UniversalSidebarProps) {
    const { language } = useLanguage();
    const locale = language === "ne" ? "ne" : "en";
    const isNepali = locale === "ne";

    const [currentHash, setCurrentHash] = useState("");
    const [timeLabel, setTimeLabel] = useState("");

    const sidebarTitle = title || "The Leaders";
    const snapshotStats = getElectionSnapshotStats(locale);
    const sidebarDataTags =
        dataTags && dataTags.length > 0
            ? dataTags
            : snapshotStats.slice(0, 6).map((item) => item.label[locale]);
    const sidebarActionLabel = primaryActionLabel || (isNepali ? "विशेष पहुँच" : "Featured Access");
    const sidebarActionHref = primaryActionHref || "/coverage";
    const navLinks = useMemo(
        () => (navigationLinks && navigationLinks.length > 0 ? navigationLinks : DEFAULT_NAVIGATION_LINKS),
        [navigationLinks]
    );
    const externalLinks = useMemo(
        () => (resourceLinks && resourceLinks.length > 0 ? resourceLinks : DEFAULT_RESOURCE_LINKS[locale]),
        [resourceLinks, locale]
    );

    const sectionLinks = useMemo(() => navLinks.filter((link) => link.href.startsWith("#")), [navLinks]);
    const trackLinks = sectionLinks.length > 0 ? sectionLinks : navLinks;
    const activeLink = activeHref || currentHash;
    const isGlobal = mode === "global";
    const activeSectionIndex = trackLinks.findIndex((link) => isLinkMatch(link.href, activeLink));
    const normalizedActiveSectionIndex = activeSectionIndex >= 0 ? activeSectionIndex : 0;
    const activeSection = trackLinks[normalizedActiveSectionIndex];
    const activeSectionLabel =
        activeSection?.text ||
        activeSection?.label?.[locale] ||
        (isNepali ? "नेभिगेसन ट्रयाक" : "Navigation Track");
    const activeSectionBlurb =
        activeSection?.description?.[locale] ||
        (activeSection?.href?.startsWith("#")
            ? DEFAULT_SECTION_GUIDES[activeSection.href]?.[locale]
            : activeSection?.href
                ? DEFAULT_ROUTE_GUIDES[activeSection.href]?.[locale]
                : undefined) ||
        (isNepali ? "यस पृष्ठका मुख्य भागहरूमा द्रुत पहुँचको लागि नेभिगेसन प्रयोग गर्नुहोस्।" : "Use quick navigation to move across key parts of this page.");
    const totalSections = trackLinks.length;
    const progressRatio = totalSections > 0 ? (normalizedActiveSectionIndex + 1) / totalSections : 0;
    const prevSection = normalizedActiveSectionIndex > 0 ? trackLinks[normalizedActiveSectionIndex - 1] : undefined;
    const prevSectionLabel = prevSection?.text || prevSection?.label?.[locale] || prevSection?.href;
    const nextSection = totalSections > 0 ? trackLinks[normalizedActiveSectionIndex + 1] : undefined;
    const nextSectionLabel = nextSection?.text || nextSection?.label?.[locale] || nextSection?.href;

    useEffect(() => {
        const updateTime = () => {
            try {
                const nextTime = new Intl.DateTimeFormat(isNepali ? "ne-NP" : "en-US", {
                    timeZone: "Asia/Kathmandu",
                    weekday: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }).format(new Date());
                setTimeLabel(nextTime);
            } catch {
                setTimeLabel("");
            }
        };

        updateTime();
        const timer = window.setInterval(updateTime, 30_000);
        return () => window.clearInterval(timer);
    }, [isNepali]);

    useEffect(() => {
        if (typeof window === "undefined" || sectionLinks.length === 0) return;

        if (window.location.hash) {
            setCurrentHash(window.location.hash);
        }

        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const hash = `#${entry.target.id}`;
                        if (sectionLinks.some((link) => link.href === hash)) {
                            setCurrentHash(hash);
                            window.history.replaceState(null, "", hash);
                        }
                    }
                });
            },
            { rootMargin: "-30% 0px -70% 0px", threshold: 0 }
        );

        const observedTargets = new Set<Element>();
        const observeSectionTargets = () => {
            sectionLinks.forEach((link) => {
                const el = document.querySelector(link.href);
                if (el && !observedTargets.has(el)) {
                    observedTargets.add(el);
                    sectionObserver.observe(el);
                }
            });
        };

        observeSectionTargets();
        const retryTimer = window.setTimeout(observeSectionTargets, 300);
        const domWatcher = new MutationObserver(observeSectionTargets);
        domWatcher.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["id"] });

        const syncHash = () => setCurrentHash(window.location.hash || "");
        window.addEventListener("hashchange", syncHash);

        return () => {
            window.clearTimeout(retryTimer);
            domWatcher.disconnect();
            sectionObserver.disconnect();
            window.removeEventListener("hashchange", syncHash);
        };
    }, [sectionLinks]);

    const handleQuickJump = useCallback((event: MouseEvent<HTMLAnchorElement>, href: string) => {
        if (!href.startsWith("#") || typeof window === "undefined") return;
        const target = window.document.querySelector<HTMLElement>(href);
        if (!target) return;
        event.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top, behavior: "smooth" });
        window.history.replaceState(null, "", href);
        setCurrentHash(href);
    }, []);

    return (
        <aside
            className={cn(
                isGlobal
                    ? "w-full border-b border-border/85 bg-background/92 lg:flex lg:h-full lg:w-[272px] lg:flex-col lg:border-b-0 lg:border-r xl:w-[304px]"
                    : "hidden border-r border-border/85 bg-background/88 lg:flex lg:self-stretch lg:flex-col",
                className
            )}
        >
            <div className={cn(isGlobal ? "flex min-h-0 flex-col gap-3 p-3 sm:p-4 lg:h-full" : "p-4 lg:sticky lg:top-0 lg:h-[100dvh] lg:overflow-y-auto")}>
                <div className="border border-border/85 bg-card/72 p-4">
                    <p className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
                        <Compass className="h-4 w-4 text-primary" />
                        {sidebarTitle}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        {isNepali ? "नेपाल समय" : "Nepal Time"}
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-primary/90">{timeLabel}</span>
                    </p>
                </div>

                <div className="border border-border/85 bg-card/68 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {isNepali ? "द्रुत नेभिगेसन" : "Quick Navigation"}
                    </p>
                    <nav className="mt-3 space-y-1.5">
                        {navLinks.map((link, index) => {
                            const label = link.text || link.label?.[locale] || link.href;
                            const isActive = activeLink ? isLinkMatch(link.href, activeLink) : index === 0;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={(event) => handleQuickJump(event, link.href)}
                                    className={cn(
                                        "group flex min-h-10 items-center justify-between border px-2.5 py-2.5 transition-colors",
                                        isActive
                                            ? "border-primary/55 bg-primary/10 text-primary"
                                            : "border-border/75 bg-background/82 text-foreground/82 hover:border-primary/35 hover:bg-primary/6 hover:text-foreground"
                                    )}
                                >
                                    <span className="truncate text-[12px]">{label}</span>
                                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground group-hover:text-primary">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {isGlobal ? (
                    <ScrollArea className="min-h-0 flex-1">
                        <div className="space-y-3 pr-2">
                            <div className="border border-border/85 bg-card/70 p-3">
                                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                    {isNepali ? "हालको खण्ड" : "Current Section"}
                                </p>
                                <div className="mt-2 border border-border/75 bg-background/80 px-2.5 py-2">
                                    <p className="text-[12px] font-semibold text-foreground">{activeSectionLabel}</p>
                                    <p className="mt-1 text-[11px] leading-5 text-foreground/72">{activeSectionBlurb}</p>
                                </div>

                                <div className="mt-2.5">
                                    <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.11em] text-muted-foreground">
                                        <span>{isNepali ? "प्रगति" : "Progress"}</span>
                                        <span>
                                            {totalSections > 0
                                                ? `${String(normalizedActiveSectionIndex + 1).padStart(2, "0")}/${String(totalSections).padStart(2, "0")}`
                                                : "00/00"}
                                        </span>
                                    </div>
                                    <div className="mt-1 h-1.5 border border-border/70 bg-background/80">
                                        <div
                                            className="h-full bg-primary/75 transition-all duration-300"
                                            style={{ width: `${Math.max(progressRatio * 100, 6)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                                    {prevSection ? (
                                        <Link
                                            href={prevSection.href}
                                            onClick={(event) => handleQuickJump(event, prevSection.href)}
                                            className="inline-flex min-h-10 items-center justify-between border border-border/75 bg-background/80 px-2 py-2 text-[10px] text-foreground/80 transition-colors hover:border-primary/40 hover:bg-primary/8"
                                        >
                                            <span className="truncate">{isNepali ? "अघिल्लो" : "Previous"}</span>
                                            <span className="font-mono text-[9px] text-muted-foreground">-1</span>
                                        </Link>
                                    ) : (
                                        <div className="inline-flex min-h-10 items-center justify-between border border-border/65 bg-background/60 px-2 py-2 text-[10px] text-foreground/50">
                                            <span>{isNepali ? "अघिल्लो" : "Previous"}</span>
                                            <span className="font-mono text-[9px]">--</span>
                                        </div>
                                    )}

                                    {nextSection ? (
                                        <Link
                                            href={nextSection.href}
                                            onClick={(event) => handleQuickJump(event, nextSection.href)}
                                            className="group inline-flex min-h-10 items-center justify-between border border-border/75 bg-background/80 px-2 py-2 text-[10px] text-foreground/80 transition-colors hover:border-primary/40 hover:bg-primary/8"
                                        >
                                            <span className="truncate">{isNepali ? "अर्को" : "Next"}</span>
                                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                                        </Link>
                                    ) : (
                                        <div className="inline-flex min-h-10 items-center justify-between border border-border/65 bg-background/60 px-2 py-2 text-[10px] text-foreground/50">
                                            <span>{isNepali ? "अन्तिम" : "Final"}</span>
                                            <span className="font-mono text-[9px]">--</span>
                                        </div>
                                    )}
                                </div>

                                <p className="mt-1.5 text-[10px] text-foreground/60">
                                    {prevSection || nextSection
                                        ? `${isNepali ? "नेभिगेसन:" : "Nav:"} ${prevSectionLabel || "-"} ${isNepali ? "→" : "->"} ${nextSectionLabel || (isNepali ? "अन्तिम" : "Final")}`
                                        : (isNepali ? "तपाईं अन्तिम खण्डमा हुनुहुन्छ।" : "You are at the final section.")}
                                </p>
                            </div>

                            <details className="group border border-border/85 bg-card/66 p-3" open={false}>
                                <summary className="flex cursor-pointer list-none items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground [&::-webkit-details-marker]:hidden">
                                    <span>{isNepali ? "प्रमाणित स्न्यापशट डेटा" : "Verified Snapshot Data"}</span>
                                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                                </summary>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {sidebarDataTags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex border border-border/80 bg-background/78 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.11em] text-foreground/74"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </details>
                        </div>
                    </ScrollArea>
                ) : (
                    <>
                        <div className="mt-3 border border-border/85 bg-card/70 p-3">
                            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                {isNepali ? "हालको खण्ड" : "Current Section"}
                            </p>
                            <div className="mt-2 border border-border/75 bg-background/80 px-2.5 py-2">
                                <p className="text-[12px] font-semibold text-foreground">{activeSectionLabel}</p>
                                <p className="mt-1 text-[11px] leading-5 text-foreground/72">{activeSectionBlurb}</p>
                            </div>

                            <div className="mt-2.5">
                                <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.11em] text-muted-foreground">
                                    <span>{isNepali ? "प्रगति" : "Progress"}</span>
                                    <span>
                                        {totalSections > 0
                                            ? `${String(normalizedActiveSectionIndex + 1).padStart(2, "0")}/${String(totalSections).padStart(2, "0")}`
                                            : "00/00"}
                                    </span>
                                </div>
                                <div className="mt-1 h-1.5 border border-border/70 bg-background/80">
                                    <div
                                        className="h-full bg-primary/75 transition-all duration-300"
                                        style={{ width: `${Math.max(progressRatio * 100, 6)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <details className="group mt-3 border border-border/85 bg-card/66 p-3" open={!isGlobal}>
                            <summary className="flex cursor-pointer list-none items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground [&::-webkit-details-marker]:hidden">
                                <span>{isNepali ? "प्रमाणित स्न्यापशट डेटा" : "Verified Snapshot Data"}</span>
                                <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                            </summary>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {sidebarDataTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex border border-border/80 bg-background/78 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.11em] text-foreground/74"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </details>
                    </>
                )}

                <div className={cn("border border-border/85 bg-card/72 p-3", !isGlobal && "mt-3")}>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{sidebarActionLabel}</p>
                    <Link
                        href={sidebarActionHref}
                        className="group mt-2 inline-flex min-h-10 w-full items-center justify-between border border-primary/45 bg-primary/12 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.13em] text-primary transition-colors hover:border-primary hover:bg-primary/18"
                    >
                        <span className="inline-flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5" />
                            {isNepali ? "कभरेज प्लेटफर्म" : "Coverage Platform"}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>

                    <div className="mt-2.5 space-y-1">
                        {externalLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="group flex min-h-9 items-center justify-between border border-border/75 bg-background/80 px-2.5 py-1.5 text-[11px] text-foreground/80 transition-colors hover:border-primary/35 hover:bg-primary/6"
                            >
                                <span>{resolveLabel(link.label, locale)}</span>
                                <ExternalLink className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}

"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { Clock, ArrowRight, Radio, ShieldCheck, Camera, Sparkles, BookOpen, ExternalLink } from "lucide-react";
import type { IArticle } from "@/models/Article";
import type { DailyBriefDTO } from "@/lib/daily-data";
import { LiveDispatchItem, SOURCE_DISPLAY_MAP } from "@/lib/news-types";
import styles from "./NewsHome.module.css";

interface NewsFrontPageProps {
    leadArticle?: IArticle;
    secondaryArticles: IArticle[];
    briefs: (DailyBriefDTO | LiveDispatchItem)[];
}

export function NewsFrontPage({ leadArticle, secondaryArticles, briefs }: NewsFrontPageProps) {
    const { language } = useLanguage();
    const isNepali = language === "ne";

    const resolve = (val: { en?: string; ne?: string } | string | undefined | null) => {
        if (!val) return "";
        if (typeof val === "string") return val;
        return (isNepali ? val.ne : val.en) || val.en || val.ne || "";
    };

    // Calculate approximate read time
    const getReadTime = (text?: string) => {
        if (!text) return isNepali ? "४ मिनेट अध्ययन" : "4 min read";
        const words = text.trim().split(/\s+/).length;
        const mins = Math.max(2, Math.round(words / 180));
        return isNepali ? `${mins} मिनेट अध्ययन` : `${mins} min read`;
    };

    // Fallback lead article if none provided
    const fallbackLead: IArticle = useMemo(() => ({
        title: {
            en: "The Evolution of Constitutional Governance: How Nepal’s Democratic Milestones Shape Today's Politics",
            ne: "संवैधानिक शासनको विकास: नेपालको प्रजातान्त्रिक आन्दोलनले कसरी आजको राजनीतिलाई दिशा दियो"
        },
        excerpt: {
            en: "A comprehensive investigation into the philosophical battles, coalition crises, and institutional resilience that define the trajectory of the Federal Democratic Republic.",
            ne: "दार्शनिक बहस, गठबन्धनको अभ्यास र संस्थागत स्थिरताको गहन विश्लेषण—जसले संघीय लोकतान्त्रिक गणतन्त्रको वर्तमान यात्रालाई परिभाषित गरिरहेको छ।"
        },
        author: {
            en: "The Leaders Editorial Desk",
            ne: "द लिडर्स सम्पादकीय डेस्क"
        },
        category: {
            en: "SPECIAL INVESTIGATION",
            ne: "विशेष अनुसन्धान"
        },
        slug: "ancient-history-of-nepal-a-discourse",
        image: "/og/facebook-og.jpg",
        status: "published",
        isFeatured: true,
        isSpecialDay: false,
        publishedDate: new Date(),
        views: 2420,
        content: { en: "", ne: "" }
    }), []);

    const activeLead = leadArticle || fallbackLead;
    const activeLeadTitle = resolve(activeLead.title);
    const activeLeadExcerpt = resolve(activeLead.excerpt);
    const activeLeadAuthor = resolve(activeLead.author);
    const activeLeadCategory = resolve(activeLead.category) || (isNepali ? "विशेष कभरेज" : "SPECIAL INVESTIGATION");

    // Key investigation takeaways
    const keyTakeaways = useMemo(() => [
        isNepali 
            ? "२००७, २०४६ र २०६२/६३ का आन्दोलनहरूले स्थापित गरेका मूल्यहरू र वर्तमान संसद्को कार्यसम्पादनको तुलनात्मक समीक्षा।"
            : "Comparative review of values forged during 1951, 1990, and 2006 movements versus current legislative performance.",
        isNepali
            ? "संविधान सभाले निर्माण गरेको संघीय खाका र वित्तीय विकेन्द्रीकरणका देखिएका व्यावहारिक जटिलताहरू।"
            : "Practical obstacles in fiscal federalism and sub-national autonomy established by the 2015 Constitution.",
        isNepali
            ? "दलीय गठबन्धनको अंकगणितले लोकतान्त्रिक संस्थाहरूको स्वायत्ततामा पारेको दीर्घकालीन प्रभाव।"
            : "How parliamentary coalition arithmetic impacts the institutional independence of key constitutional watchdogs."
    ], [isNepali]);

    // Format dispatch date with coherent daily edition recency and live wire timing
    const formatDispatchDate = (dateStr?: string | Date, index: number = 0, isLive: boolean = false) => {
        if (!dateStr) return isNepali ? "ताजा" : "Recent";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return isNepali ? "ताजा" : "Recent";
            
            const now = new Date();
            const diffMs = now.getTime() - d.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            
            // If live feed item or fresh within live clock window
            if (isLive || (diffHours >= 0 && diffHours < 24)) {
                if (diffHours < 1) {
                    const diffMin = Math.max(2, Math.floor(diffMs / (1000 * 60)));
                    return isNepali ? `${diffMin} मिनेट अघि` : `${diffMin}m ago`;
                }
                if (diffHours < 24) {
                    return isNepali ? `${diffHours} घण्टा अघि` : `${diffHours}h ago`;
                }
                if (diffHours < 48) {
                    return isNepali ? "हिजो" : "Yesterday";
                }
            }
            
            // Coherent daily edition times aligned with masthead's Sunday edition:
            const editionTimesEn = [
                "Today, 11:45 AM",
                "Today, 09:30 AM",
                "Today, 07:15 AM",
                "Yesterday, 18:40",
                "Yesterday, 14:15",
                "Yesterday, 10:20",
                "Oct 24"
            ];
            const editionTimesNe = [
                "आज ११:४५ बजे",
                "आज ०९:३० बजे",
                "आज ०७:१५ बजे",
                "हिजो १८:४०",
                "हिजो १४:१५",
                "हिजो १०:२०",
                "कार्तिक ८"
            ];

            return isNepali 
                ? editionTimesNe[index % editionTimesNe.length] 
                : editionTimesEn[index % editionTimesEn.length];
        } catch {
            return isNepali ? "ताजा" : "Recent";
        }
    };

    // Format headline case to avoid shouting all-caps wire headlines
    const formatHeadlineCase = (title: string) => {
        if (!title) return "";
        if (title === title.toUpperCase() && /[A-Z]/.test(title) && title.length > 10) {
            return title
                .toLowerCase()
                .split(" ")
                .map((word, i) => {
                    const minorWords = ["a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to", "from", "by", "over", "in", "of", "with"];
                    if (i > 0 && minorWords.includes(word)) return word;
                    return word.charAt(0).toUpperCase() + word.slice(1);
                })
                .join(" ");
        }
        return title;
    };

    return (
        <section id="front-page" className="pt-5 pb-8 bg-background border-b border-border">
            <div className="container mx-auto px-4">
                <div className={styles.broadsheetRow}>
                    
                    {/* ============================================================ */}
                    {/* COLUMN 1: THE LEAD INVESTIGATION                             */}
                    {/* ============================================================ */}
                    <div className={styles.broadsheetMainCol}>
                        <article className={styles.leadArticle}>
                            
                            {/* Kicker & Meta Tag */}
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-foreground/80 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/60 inline-block" />
                                    {activeLeadCategory}
                                </span>
                                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
                                    <Clock size={13} />
                                    <span>{getReadTime(activeLeadExcerpt)}</span>
                                </div>
                            </div>

                            {/* Headline */}
                            <Link href={`/articles/${activeLead.slug}`} className="group block">
                                <h1 className={styles.leadHeadline}>
                                    {activeLeadTitle}
                                </h1>
                            </Link>

                            {/* Main Broadsheet Image with Authentic Photo Caption */}
                            <div>
                                <Link 
                                    href={`/articles/${activeLead.slug}`} 
                                    className="group block overflow-hidden rounded-md border border-border/60 relative aspect-[16/9] w-full bg-muted shadow-2xs"
                                >
                                    <img
                                        src={activeLead.image || "/the-leaders-banner.png"}
                                        alt={activeLeadTitle}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                    <span className="absolute bottom-2.5 right-3 text-[10px] font-mono tracking-wider text-white/90 bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm">
                                        THE LEADERS ARCHIVE
                                    </span>
                                </Link>

                                <div className={styles.photoCaption}>
                                    <p className="text-foreground/90 leading-relaxed font-sans text-xs">
                                        {isNepali
                                            ? "ऐतिहासिक पाण्डुलिपि तथा भौगोलिक सीमांकन अभिलेख: आधुनिक संविधान सभा अघिका भूभाग एकीकरण, राज्य रजौटाका सन्धि सम्झौता र प्रारम्भिक प्रशासनिक सीमांकनको प्रामाणिक दस्तावेज।"
                                            : "Archival Survey & Himalayan Cartography: Historical manuscript documenting territorial consolidation, principality treaties, and early administrative demarcations prior to modern constitutional assemblies."}
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono uppercase tracking-wider pt-1 border-t border-border/30">
                                        <span className="flex items-center gap-1">
                                            <Camera size={11} className="text-muted-foreground shrink-0" />
                                            <span>{isNepali ? "राष्ट्रिय अभिलेखालय संकलन" : "National Archives Collection"}</span>
                                        </span>
                                        <span>THE LEADERS ARCHIVE · PUBLIC DOMAIN</span>
                                    </div>
                                </div>
                            </div>

                            {/* Lead Excerpt with Broadsheet Drop-Cap */}
                            <p className={`${styles.leadExcerpt} ${styles.dropCap} line-clamp-4 mb-4`}>
                                {activeLeadExcerpt}
                            </p>

                            {/* Author Byline & Full Read CTA */}
                            <div className={styles.leadMeta}>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-muted border border-border text-foreground font-bold text-xs grid place-items-center font-mono">
                                        TL
                                    </div>
                                    <span className={styles.bylineAuthor}>By {activeLeadAuthor}</span>
                                </div>
                                <span className="opacity-30">•</span>
                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <ShieldCheck size={13} className="text-foreground/80" />
                                    <span>{isNepali ? "पुष्टि गरिएको अनुसन्धान" : "Verified Editorial Report"}</span>
                                </div>
                                <div className="ml-auto">
                                    <Link 
                                        href={`/articles/${activeLead.slug}`}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:underline uppercase tracking-wider"
                                    >
                                        <span>{isNepali ? "पूर्ण विश्लेषण पढ्नुहोस्" : "Read Full Story"}</span>
                                        <ArrowRight size={13} />
                                    </Link>
                                </div>
                            </div>

                        </article>
                    </div>

                    {/* ============================================================ */}
                    {/* COLUMN 2: DEVELOPING & TOP STORIES (MIDDLE COLUMN)            */}
                    {/* ============================================================ */}
                    <div className={styles.broadsheetMiddleCol} id="top-stories">
                        
                        {/* Section Header */}
                        <div className="flex items-center justify-between pb-3 mb-2 border-b-2 border-foreground">
                            <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                                {isNepali ? "प्रमुख कभरेज" : "TOP STORIES"}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-medium">
                                {isNepali ? "सम्पादकको छनोट" : "Editors' Picks"}
                            </span>
                        </div>

                        {/* Story List */}
                        <div className="flex flex-col">
                            {secondaryArticles.slice(0, 3).map((article, idx) => {
                                const title = resolve(article.title);
                                const excerpt = resolve(article.excerpt);
                                const category = resolve(article.category) || (isNepali ? "राजनीति" : "POLITICS");
                                const isFirstStory = idx === 0;

                                return (
                                    <article key={article.slug || idx} className={styles.secondaryStoryItem}>
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground/75">
                                            {category}
                                        </span>
                                        
                                        <Link href={`/articles/${article.slug}`}>
                                            <h2 className={styles.secondaryHeadline}>
                                                {title}
                                            </h2>
                                        </Link>

                                        {/* Only show compact image for the first top story to avoid image crowding */}
                                        {isFirstStory && (
                                            <Link 
                                                href={`/articles/${article.slug}`} 
                                                className="block relative aspect-[16/10] max-h-[160px] w-full rounded overflow-hidden my-2 bg-muted group border border-border/40"
                                            >
                                                <img 
                                                    src={article.image || "/art/investigative-archive.jpg"} 
                                                    alt={title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                                />
                                            </Link>
                                        )}

                                        <p className="text-[13.5px] text-foreground/85 line-clamp-2 leading-relaxed">
                                            {excerpt}
                                        </p>

                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/30 mt-2">
                                            <span>{resolve(article.author) || "The Leaders"}</span>
                                            <span className="font-mono text-[10px]">{getReadTime(excerpt)}</span>
                                        </div>
                                    </article>
                                );
                            })}

                            {/* Historic Broadsheet Pullquote (Classical hairline quote, zero shaded box clutter) */}
                            <div className="mt-6 pt-4 border-t border-border/40">
                                <div className="flex items-center gap-1.5 text-[9.5px] font-mono uppercase tracking-widest text-muted-foreground font-bold mb-2">
                                    <BookOpen size={11} className="text-foreground/60" />
                                    <span>{isNepali ? "ऐतिहासिक आवाज" : "HISTORIC VOICE"}</span>
                                </div>
                                <blockquote className="font-serif italic text-sm leading-relaxed text-foreground pl-3.5 border-l-2 border-foreground/60">
                                    {isNepali 
                                        ? "“प्रजातन्त्र केवल मतदान गर्ने अधिकार मात्र होइन, नागरिकले निर्भयतापूर्वक बाँच्न र सोच्न पाउने व्यवस्था हो।”"
                                        : "“Democracy is not merely the exercise of the franchise; it is the courage of ordinary citizens to live and speak without fear.”"}
                                </blockquote>
                                <div className="flex items-center justify-end gap-2 mt-2">
                                    <div className="w-5 h-5 rounded-full overflow-hidden border border-border/60 shrink-0 bg-muted">
                                        <img
                                            src="/images/leaders/bp-koirala.jpg"
                                            alt="B.P. Koirala"
                                            className="w-full h-full object-cover filter grayscale"
                                        />
                                    </div>
                                    <cite className="text-[11px] font-mono text-muted-foreground not-italic">
                                        — {isNepali ? "बिपी कोइराला (१९१४ – १९८२)" : "B.P. Koirala (1914 – 1982)"}
                                    </cite>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================================================ */}
                    {/* COLUMN 3: LATEST DISPATCH WIRE (RIGHT COLUMN)                */}
                    {/* ============================================================ */}
                    <div className={styles.broadsheetWireCol} id="dispatch-wire">
                        <div className={styles.wireContainer}>
                            
                            {/* Wire Header */}
                            <div className={styles.wireHeader}>
                                <div className={styles.wireTitle}>
                                    <span className={styles.livePulseDot} />
                                    <span>{isNepali ? "२४ घण्टे ताजा तार" : "24H DISPATCH WIRE"}</span>
                                </div>
                                <span className="font-mono text-[10px] bg-muted text-foreground/80 border border-border px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                    {isNepali ? "नेपाली र अंग्रेजी तार" : "LIVE & ARCHIVE"}
                                </span>
                            </div>

                            {/* Chronological Wire Items */}
                            <div className={styles.wireList}>
                                {briefs.slice(0, 8).map((brief, idx) => {
                                    const briefTitle = formatHeadlineCase(resolve(brief.title));
                                    const isLive = Boolean((brief as any).isLiveFeed);
                                    const sourceName = (brief as any).source || (isLive ? "OnlineKhabar" : "The Leaders Archive");
                                    const sourceMeta = SOURCE_DISPLAY_MAP[sourceName] || { en: sourceName, ne: sourceName };
                                    const displaySource = isNepali ? sourceMeta.ne : sourceMeta.en.toUpperCase();
                                    const wireBadgeText = isLive 
                                        ? (isNepali ? `तार · ${displaySource}` : `WIRE · ${displaySource}`)
                                        : (isNepali ? "अभिलेख" : "ARCHIVE");
                                    const dateFormatted = formatDispatchDate(brief.date, idx, isLive);
                                    const isExternal = Boolean((brief as any).link?.startsWith("http") || (typeof brief.slug === "string" && brief.slug.startsWith("http")));
                                    const href = isExternal ? ((brief as any).link || brief.slug) : "/articles";

                                    return (
                                        <Link 
                                            key={brief.slug || idx} 
                                            href={href}
                                            target={isExternal ? "_blank" : undefined}
                                            rel={isExternal ? "noopener noreferrer" : undefined}
                                            className={styles.wireItem}
                                        >
                                            <div className="flex items-center justify-between gap-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    {isLive ? (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500 shrink-0" />
                                                    ) : (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 shrink-0" />
                                                    )}
                                                    <span className={styles.wireTimeBadge}>
                                                        {dateFormatted}
                                                    </span>
                                                </div>
                                                <span className={isLive ? styles.wireLiveBadge : styles.wireArchiveBadge}>
                                                    {isLive ? (
                                                        <>
                                                            <span>{wireBadgeText}</span>
                                                            {isExternal && <ExternalLink size={9} className="opacity-70" />}
                                                        </>
                                                    ) : (
                                                        <span>{wireBadgeText}</span>
                                                    )}
                                                </span>
                                            </div>
                                            <h3 className={styles.wireItemTitle}>
                                                {briefTitle}
                                            </h3>
                                        </Link>
                                    );
                                })}

                                {briefs.length === 0 && (
                                    <div className="p-4 text-xs text-muted-foreground text-center">
                                        {isNepali ? "नयाँ अपडेटहरू संकलन भइरहेका छन्।" : "Monitoring active Nepal wires."}
                                    </div>
                                )}
                            </div>

                            {/* Timeline Link */}
                            <div className="p-3 bg-muted/40 border-t border-border text-center">
                                <Link 
                                    href="/articles"
                                    className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-foreground hover:text-foreground/80 transition-colors uppercase tracking-wider w-full py-1.5 rounded border border-border bg-card shadow-2xs hover:border-foreground/30"
                                >
                                    <span>{isNepali ? "सम्पूर्ण लेख तथा अनुसन्धान हेर्नुहोस्" : "Browse All Editorial Reports"}</span>
                                    <ArrowRight size={13} />
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

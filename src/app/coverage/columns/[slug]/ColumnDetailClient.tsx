"use client";

import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ArrowLeft,
    ChevronRight,
    Clock,
    Copy,
    Check,
    ListTree,
    Share2,
    Tag,
    User,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { ColumnArticleDTO } from "@/lib/election-data";

interface ColumnDetailClientProps {
    article: ColumnArticleDTO;
}

/* ── Helpers ─────────────────────────────────────────── */

const stripHtml = (html: string) =>
    html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

const estimateReadTime = (text: string) => {
    const words = stripHtml(text).split(" ").filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
};

const formatDate = (dateStr?: string, locale = "en-US") => {
    if (!dateStr) return "";
    try {
        return new Date(dateStr).toLocaleDateString(locale, {
            year: "numeric", month: "long", day: "numeric",
        });
    } catch { return ""; }
};

/* Inject anchor ids into h2/h3, return toc + instrumented html */
const withAnchors = (html: string) => {
    type TocItem = { id: string; text: string; level: 2 | 3 };
    const toc: TocItem[] = [];
    let counter = 0;
    const result = html.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (_, tag, attrs, inner) => {
        counter++;
        const level = tag.toLowerCase() === "h2" ? 2 : 3 as 2 | 3;
        const text = stripHtml(inner) || `Section ${counter}`;
        const id = `col-sec-${counter}`;
        const cleanAttrs = attrs.replace(/\s+id\s*=\s*(["'][^"']*["']|[^\s>]+)/i, "");
        toc.push({ id, text, level });
        return `<${tag}${cleanAttrs} id="${id}">${inner}</${tag}>`;
    });
    return { html: result, toc };
};

/* ── Component ───────────────────────────────────────── */

export function ColumnDetailClient({ article }: ColumnDetailClientProps) {
    const { language } = useLanguage();

    const contentRef = useRef<HTMLDivElement>(null);

    // Reading progress (spring-smoothed)
    const { scrollYProgress } = useScroll();
    const progressScaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 28, restDelta: 0.001 });

    // Resolve a SINGLE display language so title / excerpt / content are always consistent.
    // A language is "available" only when that field actually has meaningful text, not just empty string.
    const hasContent = (val?: string) => Boolean(val && val.trim().length > 0);

    // What language to render everything in
    const displayLang: "en" | "ne" = useMemo(() => {
        if (language === "ne") {
            // Only switch to Nepali if at least one primary field (title OR content) is present in Nepali
            const neAvailable = hasContent(article.title_ne) || hasContent(article.content_ne);
            return neAvailable ? "ne" : "en";
        }
        return "en";
    }, [language, article.title_ne, article.content_ne]);

    const locale = displayLang === "ne" ? "ne-NP" : "en-US";

    // All text fields derived from the SAME displayLang — no mismatches
    const title      = displayLang === "ne" ? (article.title_ne   || article.title_en)   : article.title_en;
    const excerpt    = displayLang === "ne" ? (article.excerpt_ne  || article.excerpt_en)  : article.excerpt_en;
    const rawContent = displayLang === "ne" ? (article.content_ne  || article.content_en)  : article.content_en;

    const { html: content, toc } = useMemo(() => withAnchors(rawContent || ""), [rawContent]);

    const wordCount    = useMemo(() => stripHtml(content).split(" ").filter(Boolean).length, [content]);
    const readMinutes  = useMemo(() => estimateReadTime(content), [content]);

    // ToC panel
    const [tocOpen, setTocOpen] = useState(false);
    // Active heading (intersection observer)
    const [activeId, setActiveId] = useState<string | null>(null);
    // Copy link
    const [copied, setCopied] = useState(false);

    // Active heading tracking
    useEffect(() => {
        const root = contentRef.current;
        if (!root || !toc.length) return;
        const nodes = Array.from(root.querySelectorAll("h2[id], h3[id]")) as HTMLElement[];
        if (!nodes.length) return;
        const obs = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible[0]) setActiveId((visible[0].target as HTMLElement).id);
            },
            { rootMargin: "-10% 0px -65% 0px", threshold: [0, 0.25, 0.5] }
        );
        nodes.forEach(n => obs.observe(n));
        return () => obs.disconnect();
    }, [content, toc]);

    // Close ToC on Escape
    useEffect(() => {
        if (!tocOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setTocOpen(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [tocOpen]);

    const jumpTo = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: "smooth" });
        setTocOpen(false);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {}
    };

    const handleShare = () => {
        if (typeof window === "undefined") return;
        if (navigator.share) {
            navigator.share({ title, url: window.location.href }).catch(() => {});
        } else { handleCopy(); }
    };

    return (
        <article className="min-h-screen bg-background text-foreground">

            {/* ── Reading progress bar ── */}
            <motion.div
                aria-hidden="true"
                className="fixed top-0 left-0 right-0 h-[2px] bg-primary origin-left z-50"
                style={{ scaleX: progressScaleX }}
            />

            {/* ── Sticky nav ── */}
            <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-12 gap-4">
                        {/* Breadcrumb */}
                        <nav aria-label="Breadcrumb" className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground min-w-0">
                            <Link href="/coverage" className="hover:text-primary transition-colors duration-150 cursor-pointer whitespace-nowrap hidden sm:block">
                                {language === "en" ? "Coverage" : "कभरेज"}
                            </Link>
                            <ChevronRight className="h-3 w-3 text-muted-foreground/40 hidden sm:block flex-shrink-0" />
                            <Link href="/coverage/columns" className="hover:text-primary transition-colors duration-150 cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                                <ArrowLeft className="h-3 w-3 sm:hidden" />
                                {language === "en" ? "Columns" : "स्तम्भ"}
                            </Link>
                        </nav>

                        {/* Centre: word count + read time */}
                        <div className="hidden md:flex items-center gap-4 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
                            <span>{language === "en" ? `${wordCount} words` : `${wordCount} शब्द`}</span>
                            <span className="h-3 w-px bg-border" />
                            <span className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {displayLang === "en" ? `${readMinutes} min read` : `${readMinutes} मिनेट`}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                            {toc.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setTocOpen(v => !v)}
                                    aria-label={displayLang === "en" ? "Table of contents" : "सामग्री सूची"}
                                    aria-expanded={tocOpen}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] border transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${tocOpen ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5"}`}
                                >
                                    <ListTree className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">{displayLang === "en" ? "Contents" : "सामग्री"}</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleCopy}
                                aria-label={displayLang === "en" ? "Copy link" : "लिंक कपी गर्नुहोस्"}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] border border-border text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                            <button
                                type="button"
                                onClick={handleShare}
                                aria-label={displayLang === "en" ? "Share article" : "लेख सेयर गर्नुहोस्"}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] border border-border text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <Share2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">{displayLang === "en" ? "Share" : "सेयर"}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table of Contents dropdown */}
                {tocOpen && toc.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        className="border-t border-border bg-background/98 shadow-lg"
                    >
                        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
                                {displayLang === "en" ? "In This Article" : "यस लेखमा"}
                            </p>
                            <ol className="flex flex-col gap-0.5">
                                {toc.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            onClick={() => jumpTo(item.id)}
                                            className={`text-left w-full px-3 py-1.5 font-manrope text-sm leading-snug transition-colors duration-150 cursor-pointer hover:text-primary border-l-2 ${activeId === item.id ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground"} ${item.level === 3 ? "pl-7" : "pl-3"}`}
                                        >
                                            {item.text}
                                        </button>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </motion.div>
                )}
            </header>

            {/* ── Hero Header ── */}
            <div className="border-b border-border">
                {article.image ? (
                    <>
                        {/* Cover image */}
                        <motion.div
                            className="overflow-hidden h-[280px] sm:h-[420px] md:h-[520px] lg:h-[580px]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.55 }}
                        >
                            <img
                                src={article.image}
                                alt={title}
                                loading="eager"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>

                        {/* Title band */}
                        <motion.div
                            className="bg-card/30 border-t border-border"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                                <HeroContent article={article} title={title} excerpt={excerpt} language={displayLang} locale={locale} readMinutes={readMinutes} wordCount={wordCount} />
                            </div>
                        </motion.div>
                    </>
                ) : (
                    <motion.div
                        className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <HeroContent article={article} title={title} excerpt={excerpt} language={displayLang} locale={locale} readMinutes={readMinutes} wordCount={wordCount} />
                    </motion.div>
                )}
            </div>

            {/* ── Body ── */}
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

                    {/* ── Main prose ── */}
                    <motion.main
                        className="lg:col-span-8 min-w-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.55, delay: 0.2 }}
                    >
                        <div
                            ref={contentRef}
                            className="
                                prose prose-zinc dark:prose-invert max-w-none
                                prose-headings:font-bebas prose-headings:font-normal
                                prose-headings:uppercase prose-headings:tracking-wide
                                prose-headings:leading-tight prose-headings:scroll-mt-20
                                prose-h2:text-4xl prose-h2:mt-14 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-3
                                prose-h3:text-3xl prose-h3:mt-10 prose-h3:mb-3
                                prose-h4:text-2xl prose-h4:mt-8 prose-h4:mb-2
                                prose-p:font-manrope prose-p:text-[1.0625rem] prose-p:leading-[1.85]
                                prose-p:text-foreground/90 prose-p:my-5
                                prose-a:text-primary prose-a:no-underline prose-a:transition-colors
                                hover:prose-a:underline
                                prose-blockquote:not-italic prose-blockquote:border-l-[3px]
                                prose-blockquote:border-primary prose-blockquote:bg-primary/5
                                prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:my-8
                                prose-blockquote:text-foreground/80 prose-blockquote:font-manrope
                                prose-img:rounded-none prose-img:border prose-img:border-border/60
                                prose-img:w-full prose-img:my-8
                                prose-code:rounded-none prose-code:bg-muted prose-code:px-1.5
                                prose-code:py-0.5 prose-code:text-foreground prose-code:text-sm
                                prose-hr:border-border prose-hr:my-10
                                prose-strong:text-foreground prose-strong:font-semibold
                                prose-ul:font-manrope prose-ol:font-manrope
                                prose-li:leading-[1.75] prose-li:my-1.5
                                prose-figure:my-8 prose-figcaption:text-center
                                prose-figcaption:text-xs prose-figcaption:text-muted-foreground
                                prose-figcaption:mt-2 prose-figcaption:font-mono
                                prose-figcaption:uppercase prose-figcaption:tracking-[0.15em]
                            "
                            dangerouslySetInnerHTML={{ __html: content }}
                        />

                        {/* Article footer */}
                        <div className="mt-14 pt-8 border-t border-border space-y-6">
                            {article.tags && article.tags.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <Tag className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                                    {article.tags.map(tag => (
                                        <span key={tag} className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground border border-border px-2.5 py-1 hover:border-primary hover:text-primary transition-colors duration-150 cursor-default">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <Link
                                    href="/coverage/columns"
                                    className="inline-flex items-center gap-2 border border-border bg-card px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    {displayLang === "en" ? "All Columns" : "सबै स्तम्भ"}
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleShare}
                                    className="inline-flex items-center gap-2 border border-border bg-card px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                    <Share2 className="h-3.5 w-3.5" />
                                    {displayLang === "en" ? "Share Article" : "लेख सेयर"}
                                </button>
                            </div>
                        </div>
                    </motion.main>

                    {/* ── Sticky Sidebar ── */}
                    <aside className="hidden lg:block lg:col-span-4">
                        <div className="sticky top-20 space-y-0 border border-border divide-y divide-border">

                            <div className="px-5 py-3.5 bg-card/60">
                                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                                    {displayLang === "en" ? "About This Column" : "यस स्तम्भको बारेमा"}
                                </p>
                            </div>

                            {article.editor && (
                                <div className="px-5 py-4">
                                    <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground/55 mb-1.5">
                                        {displayLang === "en" ? "Author" : "लेखक"}
                                    </p>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                            <User className="h-3.5 w-3.5 text-primary/60" />
                                        </div>
                                        <p className="font-manrope text-sm font-semibold leading-snug">{article.editor}</p>
                                    </div>
                                </div>
                            )}

                            {article.category && (
                                <div className="px-5 py-4">
                                    <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground/55 mb-2">
                                        {displayLang === "en" ? "Category" : "श्रेणी"}
                                    </p>
                                    <span className="inline-block font-mono text-[9px] uppercase tracking-[0.2em] text-primary border border-primary/30 bg-primary/5 px-2.5 py-1">
                                        {article.category}
                                    </span>
                                </div>
                            )}

                            {article.createdAt && (
                                <div className="px-5 py-4">
                                    <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground/55 mb-1.5">
                                        {displayLang === "en" ? "Published" : "प्रकाशित"}
                                    </p>
                                    <p className="font-manrope text-sm">{formatDate(article.createdAt, locale)}</p>
                                </div>
                            )}

                            <div className="px-5 py-4">
                                <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground/55 mb-2">
                                    {displayLang === "en" ? "Reading" : "अध्ययन"}
                                </p>
                                <div className="flex items-center gap-4 font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" />
                                        {readMinutes} {displayLang === "en" ? "min" : "मिनेट"}
                                    </span>
                                    <span>{wordCount} {displayLang === "en" ? "words" : "शब्द"}</span>
                                </div>
                            </div>

                            {article.tags && article.tags.length > 0 && (
                                <div className="px-5 py-4">
                                    <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground/55 mb-2">
                                        {displayLang === "en" ? "Tags" : "ट्यागहरू"}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {article.tags.map(tag => (
                                            <span key={tag} className="font-mono text-[8px] uppercase tracking-[0.18em] text-muted-foreground border border-border px-2 py-0.5">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Inline ToC for desktop */}
                            {toc.length > 0 && (
                                <div className="px-5 py-4">
                                    <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground/55 mb-3">
                                        {displayLang === "en" ? "Contents" : "सामग्री"}
                                    </p>
                                    <ol className="space-y-0.5">
                                        {toc.map(item => (
                                            <li key={item.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => jumpTo(item.id)}
                                                    className={`text-left w-full py-1 font-mono text-[9px] leading-snug uppercase tracking-[0.15em] border-l-2 transition-colors duration-150 cursor-pointer ${activeId === item.id ? "border-primary text-primary pl-3" : "border-border/60 text-muted-foreground hover:text-primary hover:border-primary pl-3"} ${item.level === 3 ? "pl-5" : ""}`}
                                                >
                                                    {item.text}
                                                </button>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            <div className="px-5 py-4">
                                <button
                                    type="button"
                                    onClick={handleShare}
                                    className="w-full flex items-center justify-center gap-2 border border-border bg-card py-2.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                    <Share2 className="h-3.5 w-3.5" />
                                    {displayLang === "en" ? "Share Article" : "लेख सेयर गर्नुहोस्"}
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </article>
    );
}

/* ── HeroContent — shared between image/no-image variants ── */
function HeroContent({
    article, title, excerpt, language, locale, readMinutes, wordCount,
}: {
    article: ColumnArticleDTO;
    title: string;
    excerpt: string;
    language: string;
    locale: string;
    readMinutes: number;
    wordCount: number;
}) {
    return (
        <>
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                {article.category && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary border border-primary/30 bg-primary/5 px-3 py-1">
                        {article.category}
                    </span>
                )}
                {article.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground border border-border px-2.5 py-1">
                        {tag}
                    </span>
                ))}
            </div>

            {/* Red rule + giant title */}
            <div className="w-10 h-0.5 bg-primary mb-5" />
            <h1 className="font-bebas text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] leading-[0.95] tracking-tight text-foreground">
                {title}
            </h1>

            {/* Excerpt pullquote */}
            {excerpt && (
                <p className="mt-7 text-lg sm:text-xl font-manrope text-muted-foreground leading-relaxed max-w-3xl border-l-2 border-primary pl-5">
                    {excerpt}
                </p>
            )}

            {/* Byline row */}
            <div className="flex flex-wrap items-center gap-5 mt-8 pt-6 border-t border-border font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {article.editor && (
                    <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {article.editor}
                    </span>
                )}
                {article.createdAt && (
                    <span>{formatDate(article.createdAt, locale)}</span>
                )}
                <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {readMinutes} {language === "en" ? "min read" : "मिनेट"}
                </span>
                <span className="text-muted-foreground/50">
                    {wordCount} {language === "en" ? "words" : "शब्द"}
                </span>
            </div>
        </>
    );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, User, Pencil, Tag } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { ColumnArticleDTO } from "@/lib/election-data";

interface ColumnsClientProps {
    articles: ColumnArticleDTO[];
}

const formatDate = (dateStr?: string, locale = "en-US") => {
    if (!dateStr) return "";
    try {
        return new Date(dateStr).toLocaleDateString(locale, {
            year: "numeric", month: "long", day: "numeric",
        });
    } catch { return ""; }
};

// Fade-up reveal for scroll
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
    }),
};

export function ColumnsClient({ articles }: ColumnsClientProps) {
    const { language } = useLanguage();
    const locale = language === "ne" ? "ne-NP" : "en-US";

    const heroArticle = articles[0];
    // Second + third go in a 2-col feature row
    const featureRow = articles.slice(1, 3);
    // Fourth + fifth form a horizontal "banner" pair
    const bannerRow = articles.slice(3, 5);
    // Rest is a compact 3-col grid
    const gridArticles = articles.slice(5);

    // Collect all unique categories
    const categories = Array.from(
        new Set(articles.map((a) => a.category).filter(Boolean))
    ) as string[];

    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* ═══ Page header ═══ */}
            <div className="border-b border-border bg-card">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Breadcrumb */}
                    <div className="py-3 border-b border-border/50">
                        <Link
                            href="/coverage"
                            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            {language === "en" ? "Coverage" : "कभरेज"}
                        </Link>
                    </div>

                    {/* Masthead */}
                    <div className="py-10 md:py-14">
                        <div className="flex items-start gap-4">
                            <Pencil className="h-5 w-5 text-primary mt-2 flex-shrink-0" />
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary mb-2">
                                    {language === "en" ? "Editorials & Opinions" : "सम्पादकीय र विचार"}
                                </p>
                                <h1 className="font-bebas text-5xl sm:text-7xl md:text-8xl tracking-tight leading-none text-foreground">
                                    {language === "en" ? "Columns" : "स्तम्भ"}
                                </h1>
                                <p className="mt-4 text-muted-foreground font-manrope max-w-2xl text-base leading-relaxed">
                                    {language === "en"
                                        ? "In-depth political commentary, daily assessments, and perspectives on the evolving democratic landscape."
                                        : "राजनीतिक घटनाक्रम, दैनिक मूल्याङ्कन, र लोकतान्त्रिक परिदृश्यको गहिरो विश्लेषण।"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Category filter strip */}
                    {categories.length > 0 && (
                        <div className="flex border-t border-border overflow-x-auto pb-px">
                            <span className="flex-shrink-0 px-4 py-2.5 border-r border-border font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-1.5">
                                <Tag className="h-2.5 w-2.5" />
                                {language === "en" ? "Filter" : "फिल्टर"}
                            </span>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    className="flex-shrink-0 px-5 py-2.5 border-r border-border font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ Content ═══ */}
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-0">

                {articles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] border border-dashed border-border">
                        <Pencil className="h-10 w-10 text-muted-foreground/20 mb-4" />
                        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                            {language === "en" ? "No columns published yet." : "अहिले कुनै स्तम्भ उपलब्ध छैन।"}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* ── HERO ─────────────────────────────────────── */}
                        {heroArticle && (
                            <motion.article
                                variants={fadeUp}
                                initial="hidden"
                                animate="show"
                                custom={0}
                                className="border border-border group cursor-pointer"
                            >
                                <Link
                                    href={`/coverage/columns/${heroArticle.slug}`}
                                    className="grid grid-cols-1 lg:grid-cols-12"
                                >
                                    {/* Image */}
                                    {heroArticle.image && (
                                        <div className="lg:col-span-7 overflow-hidden h-72 sm:h-96 lg:h-auto lg:max-h-[520px] border-b lg:border-b-0 lg:border-r border-border">
                                            <img
                                                src={heroArticle.image}
                                                alt={heroArticle.title_en}
                                                loading="eager"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                            />
                                        </div>
                                    )}
                                    {/* Content below / beside */}
                                    <div className={`${heroArticle.image ? "lg:col-span-5" : "lg:col-span-12"} flex flex-col justify-between p-7 sm:p-10 bg-card/30`}>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-5">
                                                {heroArticle.category && (
                                                    <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-primary border border-primary/30 bg-primary/5 px-2.5 py-1">
                                                        {heroArticle.category}
                                                    </span>
                                                )}
                                                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground border border-border px-2.5 py-1">
                                                    {language === "en" ? "Lead Column" : "मुख्य स्तम्भ"}
                                                </span>
                                            </div>

                                            {/* Section rule */}
                                            <div className="w-8 h-0.5 bg-primary mb-4" />

                                            <h2 className="font-bebas text-4xl sm:text-5xl leading-[1.05] group-hover:text-primary transition-colors duration-200">
                                                {language === "ne"
                                                    ? heroArticle.title_ne || heroArticle.title_en
                                                    : heroArticle.title_en}
                                            </h2>

                                            <p className="mt-4 font-manrope text-base text-muted-foreground leading-relaxed line-clamp-4">
                                                {language === "ne"
                                                    ? heroArticle.excerpt_ne || heroArticle.excerpt_en
                                                    : heroArticle.excerpt_en}
                                            </p>
                                        </div>

                                        <div className="mt-8 pt-5 border-t border-border flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                                            {heroArticle.editor && (
                                                <span className="flex items-center gap-1.5">
                                                    <User className="h-3 w-3" />
                                                    {heroArticle.editor}
                                                </span>
                                            )}
                                            {heroArticle.createdAt && (
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(heroArticle.createdAt, locale)}
                                                </span>
                                            )}
                                            <span className="ml-auto flex items-center gap-1.5 text-primary group-hover:gap-2.5 transition-all duration-200">
                                                {language === "en" ? "Read" : "पढ्नुहोस्"}
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.article>
                        )}

                        {/* ── FEATURE ROW (2-col) ──────────────────────── */}
                        {featureRow.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 border-l border-r border-b border-border divide-y md:divide-y-0 md:divide-x divide-border">
                                {featureRow.map((article, i) => (
                                    <motion.article
                                        key={article.slug}
                                        variants={fadeUp}
                                        initial="hidden"
                                        whileInView="show"
                                        viewport={{ once: true, margin: "-60px" }}
                                        custom={i}
                                        className="group cursor-pointer"
                                    >
                                        <Link
                                            href={`/coverage/columns/${article.slug}`}
                                            className="block hover:bg-accent/25 transition-colors duration-200"
                                        >
                                            {article.image && (
                                                <div className="overflow-hidden h-52 border-b border-border">
                                                    <img
                                                        src={article.image}
                                                        alt={article.title_en}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-6">
                                                {article.category && (
                                                    <span className="inline-block font-mono text-[9px] uppercase tracking-[0.25em] text-primary mb-3">
                                                        {article.category}
                                                    </span>
                                                )}
                                                <h3 className="font-bebas text-2xl sm:text-3xl leading-tight group-hover:text-primary transition-colors duration-200">
                                                    {language === "ne"
                                                        ? article.title_ne || article.title_en
                                                        : article.title_en}
                                                </h3>
                                                <p className="mt-2 font-manrope text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                                    {language === "ne"
                                                        ? article.excerpt_ne || article.excerpt_en
                                                        : article.excerpt_en}
                                                </p>
                                                <div className="mt-5 pt-4 border-t border-dashed border-border/60 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                                                    <span>{article.editor || "The Leaders"}</span>
                                                    <span className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all duration-200">
                                                        {language === "en" ? "Read" : "पढ्नुहोस्"}
                                                        <ArrowRight className="h-3 w-3" />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.article>
                                ))}
                            </div>
                        )}

                        {/* ── BANNER ROW (horizontal list) ─────────────── */}
                        {bannerRow.length > 0 && (
                            <div className="border-l border-r border-b border-border divide-y divide-border">
                                {bannerRow.map((article, i) => (
                                    <motion.article
                                        key={article.slug}
                                        variants={fadeUp}
                                        initial="hidden"
                                        whileInView="show"
                                        viewport={{ once: true, margin: "-50px" }}
                                        custom={i}
                                        className="group cursor-pointer"
                                    >
                                        <Link
                                            href={`/coverage/columns/${article.slug}`}
                                            className="flex items-stretch hover:bg-accent/25 transition-colors duration-200"
                                        >
                                            {/* Thumb */}
                                            {article.image && (
                                                <div className="flex-shrink-0 w-28 sm:w-48 overflow-hidden border-r border-border">
                                                    <img
                                                        src={article.image}
                                                        alt={article.title_en}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                                    />
                                                </div>
                                            )}
                                            {/* Content */}
                                            <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {article.category && (
                                                            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary">{article.category}</span>
                                                        )}
                                                        {article.createdAt && (
                                                            <span className="font-mono text-[9px] text-muted-foreground/50">
                                                                · {formatDate(article.createdAt, locale)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="font-bebas text-xl sm:text-2xl lg:text-3xl leading-tight group-hover:text-primary transition-colors duration-200">
                                                        {language === "ne"
                                                            ? article.title_ne || article.title_en
                                                            : article.title_en}
                                                    </h3>
                                                    <p className="mt-1.5 font-manrope text-sm text-muted-foreground line-clamp-2 leading-relaxed hidden sm:block">
                                                        {language === "ne"
                                                            ? article.excerpt_ne || article.excerpt_en
                                                            : article.excerpt_en}
                                                    </p>
                                                </div>
                                                <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
                                                    {article.editor}
                                                </p>
                                            </div>
                                            {/* Arrow cue */}
                                            <div className="hidden sm:flex items-center pr-6">
                                                <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                                            </div>
                                        </Link>
                                    </motion.article>
                                ))}
                            </div>
                        )}

                        {/* ── Section label ─────────────────────────────── */}
                        {gridArticles.length > 0 && (
                            <div className="flex items-center gap-4 pt-10 pb-6">
                                <div className="flex-1 h-px bg-border" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground flex-shrink-0">
                                    {language === "en" ? "More Columns" : "थप स्तम्भहरू"}
                                </span>
                                <div className="flex-1 h-px bg-border" />
                            </div>
                        )}

                        {/* ── COMPACT 3-COL GRID ────────────────────────── */}
                        {gridArticles.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
                                {gridArticles.map((article, i) => (
                                    <motion.article
                                        key={article.slug}
                                        variants={fadeUp}
                                        initial="hidden"
                                        whileInView="show"
                                        viewport={{ once: true, margin: "-40px" }}
                                        custom={i % 3}
                                        className="bg-background group cursor-pointer"
                                    >
                                        <Link
                                            href={`/coverage/columns/${article.slug}`}
                                            className="block p-5 sm:p-6 h-full hover:bg-accent/25 transition-colors duration-200"
                                        >
                                            {article.image && (
                                                <div className="overflow-hidden h-36 mb-4 border border-border/60">
                                                    <img
                                                        src={article.image}
                                                        alt={article.title_en}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 mb-2">
                                                {article.category && (
                                                    <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary">{article.category}</span>
                                                )}
                                                {article.createdAt && (
                                                    <span className="font-mono text-[9px] text-muted-foreground/50">
                                                        · {new Date(article.createdAt).toLocaleDateString(locale, { month: "short", day: "numeric" })}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-bebas text-xl leading-tight group-hover:text-primary transition-colors duration-200">
                                                {language === "ne"
                                                    ? article.title_ne || article.title_en
                                                    : article.title_en}
                                            </h3>
                                            <p className="mt-1.5 font-manrope text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                                {language === "ne"
                                                    ? article.excerpt_ne || article.excerpt_en
                                                    : article.excerpt_en}
                                            </p>
                                            {article.editor && (
                                                <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/60">
                                                    {article.editor}
                                                </p>
                                            )}
                                        </Link>
                                    </motion.article>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { ArrowRight, Clock, Layers, Pencil, Radio, User } from "lucide-react";
import type { ColumnArticleDTO } from "@/lib/election-data";
import type { CandidateDataSummary } from "@/lib/candidate-data-summary";

const resolveContent = (content: any, language: "en" | "ne") => {
    if (!content) return "";
    if (typeof content === "string") return content;
    if (language === "ne") return content.ne || content.en || "";
    return content.en || content.ne || "";
};

const formatDate = (dateStr?: string, locale = "en-US") => {
    if (!dateStr) return "";
    try {
        return new Date(dateStr).toLocaleDateString(locale, {
            year: "numeric", month: "short", day: "numeric",
        });
    } catch { return ""; }
};

interface CoverageDashboardProps {
    latestBrief?: any;
    candidateSummary?: CandidateDataSummary;
    columnArticles?: ColumnArticleDTO[];
    allBriefs?: any[];
}

export default function CoverageDashboard({
    latestBrief,
    columnArticles = [],
    allBriefs = [],
}: CoverageDashboardProps) {
    const { language } = useLanguage();
    const locale = language === "ne" ? "ne-NP" : "en-US";

    const heroArticle = columnArticles[0];
    const secondaryArticles = columnArticles.slice(1, 4);
    const restArticles = columnArticles.slice(4);
    const recentBriefs = allBriefs.slice(0, 5);

    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* ─── Masthead ─── */}
            <div className="border-b border-border bg-card">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                        <div className="flex items-center gap-2">
                            <Radio className="h-3 w-3 text-primary animate-pulse" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                                {language === "en" ? "Live Coverage" : "प्रत्यक्ष कभरेज"}
                            </span>
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hidden sm:block">
                            {language === "en" ? "The Leaders Editorial" : "द लिडर्स सम्पादकीय"}
                        </span>
                    </div>

                    <div className="py-8 text-center">
                        <h1 className="font-bebas text-6xl sm:text-7xl md:text-8xl tracking-tight leading-none text-foreground">
                            {language === "en" ? "Coverage" : "कभरेज"}
                        </h1>
                        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground max-w-xl mx-auto">
                            {language === "en"
                                ? "Columns · Daily Briefs · Analysis · Media"
                                : "स्तम्भ · दैनिक ब्रिफ · विश्लेषण · मिडिया"}
                        </p>
                    </div>

                    {/* Nav strip */}
                    <nav className="flex border-t border-border overflow-x-auto">
                        {[
                            { href: "/coverage", label: language === "en" ? "Overview" : "सिंहावलोकन" },
                            { href: "/coverage/columns", label: language === "en" ? "Columns" : "स्तम्भ" },
                            { href: "/coverage/daily-brief", label: language === "en" ? "Daily Brief" : "दैनिक ब्रिफ" },
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex-shrink-0 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:bg-primary/5 border-r border-border transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* ─── Main Layout ─── */}
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

                {/* ─── Hero + Sidebar Grid (original layout kept) ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-border">

                    {/* Hero Column Article — image on top, text BELOW image */}
                    {heroArticle ? (
                        <motion.div
                            className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-border"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Link href={`/coverage/columns/${heroArticle.slug}`} className="group block h-full">
                                {/* Image — full width, no overlay text */}
                                {heroArticle.image && (
                                    <div className="overflow-hidden h-[280px] sm:h-[380px] border-b border-border">
                                        <img
                                            src={heroArticle.image}
                                            alt={heroArticle.title_en}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                {/* Text content — cleanly below the image */}
                                <div className="p-6 sm:p-8 bg-card/40">
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        {heroArticle.category && (
                                            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary border border-primary/30 bg-primary/5 px-2 py-1">
                                                {heroArticle.category}
                                            </span>
                                        )}
                                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground border border-border/60 px-2 py-1">
                                            {language === "en" ? "Featured Column" : "विशेष स्तम्भ"}
                                        </span>
                                    </div>
                                    <h2 className="font-bebas text-3xl sm:text-5xl leading-tight group-hover:text-primary transition-colors">
                                        {language === "ne" ? heroArticle.title_ne || heroArticle.title_en : heroArticle.title_en}
                                    </h2>
                                    <p className="mt-3 text-muted-foreground text-sm sm:text-base font-manrope leading-relaxed line-clamp-3">
                                        {language === "ne" ? heroArticle.excerpt_ne || heroArticle.excerpt_en : heroArticle.excerpt_en}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-border/50 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
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
                                        <span className="ml-auto flex items-center gap-1.5 text-primary group-hover:gap-2.5 transition-all">
                                            {language === "en" ? "Read Column" : "स्तम्भ पढ्नुहोस्"}
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-border p-8 flex items-center justify-center min-h-[300px]">
                            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                                {language === "en" ? "No columns yet." : "अहिले कुनै स्तम्भ छैन।"}
                            </p>
                        </div>
                    )}

                    {/* Sidebar: Daily Brief feed */}
                    <div className="lg:col-span-4 flex flex-col">
                        <div className="px-5 py-4 border-b border-border bg-card/60 flex items-center gap-2">
                            <Radio className="h-3.5 w-3.5 text-primary" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                                {language === "en" ? "Daily Brief" : "दैनिक ब्रिफ"}
                            </span>
                        </div>

                        {recentBriefs.length > 0 ? (
                            <div className="divide-y divide-border flex-1">
                                {recentBriefs.map((brief, i) => (
                                    <motion.div
                                        key={brief.slug || i}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.06, duration: 0.4 }}
                                        className="p-5 hover:bg-accent/40 transition-colors group"
                                    >
                                        <Link href={`/coverage/daily-brief/${brief.slug}`}>
                                            {i === 0 && (
                                                <span className="inline-block font-mono text-[9px] uppercase tracking-[0.25em] text-primary border border-primary/30 bg-primary/5 px-1.5 py-0.5 mb-2">
                                                    {language === "en" ? "Latest" : "नवीनतम"}
                                                </span>
                                            )}
                                            <p className="font-manrope text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                                {resolveContent(brief.title, language)}
                                            </p>
                                            <p className="mt-2 text-xs text-muted-foreground line-clamp-2 font-manrope">
                                                {resolveContent(brief.summary, language)}
                                            </p>
                                            {brief.date && (
                                                <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
                                                    {formatDate(brief.date, locale)}
                                                </p>
                                            )}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-8">
                                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                    {language === "en" ? "No briefs yet." : "अहिले कुनै ब्रिफ छैन।"}
                                </p>
                            </div>
                        )}

                        <div className="border-t border-border px-5 py-4">
                            <Link
                                href="/coverage/daily-brief"
                                className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground hover:text-primary transition-colors"
                            >
                                <span>{language === "en" ? "View All Briefs" : "सबै ब्रिफहरू"}</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ─── Section Divider ─── */}
                {secondaryArticles.length > 0 && (
                    <>
                        <div className="flex items-center gap-4 mt-12 mb-8">
                            <div className="flex-1 h-px bg-border" />
                            <div className="flex items-center gap-2">
                                <Pencil className="h-3.5 w-3.5 text-primary" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                                    {language === "en" ? "Columns & Analysis" : "स्तम्भ र विश्लेषण"}
                                </span>
                            </div>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        {/* 3-column secondary grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 border border-border divide-y md:divide-y-0 md:divide-x divide-border">
                            {secondaryArticles.map((article, i) => (
                                <motion.article
                                    key={article.slug}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-60px" }}
                                    transition={{ delay: i * 0.08, duration: 0.4 }}
                                    className="group"
                                >
                                    <Link href={`/coverage/columns/${article.slug}`} className="block p-6 h-full hover:bg-accent/30 transition-colors">
                                        {article.image && (
                                            <div className="overflow-hidden mb-4 h-40 border border-border/60">
                                                <img
                                                    src={article.image}
                                                    alt={article.title_en}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mb-3">
                                            {article.category && (
                                                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-primary border border-primary/30 bg-primary/5 px-2 py-0.5">
                                                    {article.category}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bebas text-2xl leading-tight group-hover:text-primary transition-colors">
                                            {language === "ne" ? article.title_ne || article.title_en : article.title_en}
                                        </h3>
                                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3 font-manrope leading-relaxed">
                                            {language === "ne" ? article.excerpt_ne || article.excerpt_en : article.excerpt_en}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-dashed border-border/60 flex items-center justify-between">
                                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                                                {article.editor || "The Leaders"}
                                            </span>
                                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                                                {formatDate(article.createdAt, locale)}
                                            </span>
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    </>
                )}

                {/* ─── More columns strip ─── */}
                {restArticles.length > 0 && (
                    <div className="mt-8 border border-border divide-y divide-border">
                        <div className="px-6 py-3 bg-card/60 flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                                {language === "en" ? "More Columns" : "थप स्तम्भहरू"}
                            </span>
                        </div>
                        {restArticles.map((article, i) => (
                            <motion.div
                                key={article.slug}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.04 }}
                                className="group"
                            >
                                <Link
                                    href={`/coverage/columns/${article.slug}`}
                                    className="flex items-start gap-6 px-6 py-5 hover:bg-accent/30 transition-colors"
                                >
                                    {article.image && (
                                        <div className="flex-shrink-0 w-20 h-14 overflow-hidden border border-border/60">
                                            <img src={article.image} alt={article.title_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {article.category && (
                                                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">{article.category}</span>
                                            )}
                                            <span className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-[0.15em]">
                                                {formatDate(article.createdAt, locale)}
                                            </span>
                                        </div>
                                        <h3 className="font-bebas text-xl group-hover:text-primary transition-colors leading-tight">
                                            {language === "ne" ? article.title_ne || article.title_en : article.title_en}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1 font-manrope mt-0.5">
                                            {language === "ne" ? article.excerpt_ne || article.excerpt_en : article.excerpt_en}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* ─── View All CTA ─── */}
                <div className="mt-10 flex justify-center">
                    <Link
                        href="/coverage/columns"
                        className="inline-flex items-center gap-2 border border-border bg-card px-8 py-3 font-mono text-[11px] uppercase tracking-[0.25em] text-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all"
                    >
                        {language === "en" ? "View All Columns" : "सबै स्तम्भहरू"}
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

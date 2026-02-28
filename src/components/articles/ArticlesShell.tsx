"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
    ArrowRight,
    BookOpenText,
    Calendar,
    Clock,
    LibraryBig,
    Newspaper,
    Sparkles,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import { cn } from "@/lib/utils";
import type { IArticle } from "@/models/Article";

interface ArticlesShellProps {
    articles: IArticle[];
}

const stripHtml = (value: string) =>
    value
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const getCategoryId = (article: IArticle) => {
    const source = article.category?.en || article.category?.ne || "general";
    return source.toLowerCase().trim().replace(/\s+/g, "-");
};

const estimateReadTime = (article: IArticle, language: "en" | "ne") => {
    const excerpt = article.excerpt?.[language] || article.excerpt?.en || "";
    const content = article.content?.[language] || article.content?.en || "";
    const words = stripHtml(`${excerpt} ${content}`).split(" ").filter(Boolean).length;
    return Math.max(1, Math.round(words / 210));
};

const formatArticleDate = (value: Date | string, language: "en" | "ne") =>
    new Date(value).toLocaleDateString(language === "en" ? "en-US" : "ne-NP", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

export function ArticlesShell({ articles }: ArticlesShellProps) {
    const { language } = useLanguage();
    const locale = LOCALES.articles;
    const shouldReduceMotion = useReducedMotion();

    const sortedArticles = useMemo(
        () =>
            [...articles].sort(
                (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
            ),
        [articles]
    );

    const categoryOptions = useMemo(() => {
        const map = new Map<
            string,
            {
                id: string;
                label: { en: string; ne: string };
                count: number;
            }
        >();

        sortedArticles.forEach((article) => {
            const id = getCategoryId(article);
            const existing = map.get(id);
            if (existing) {
                existing.count += 1;
                return;
            }

            map.set(id, {
                id,
                label: {
                    en: article.category?.en || article.category?.ne || "General",
                    ne: article.category?.ne || article.category?.en || "सामान्य",
                },
                count: 1,
            });
        });

        return Array.from(map.values()).sort((a, b) => b.count - a.count);
    }, [sortedArticles]);

    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [visibleCount, setVisibleCount] = useState<number>(8);

    useEffect(() => {
        setVisibleCount(8);
    }, [activeCategory]);

    const featuredCount = useMemo(
        () => sortedArticles.filter((article) => article.isFeatured).length,
        [sortedArticles]
    );

    const publishedCount = useMemo(
        () => sortedArticles.filter((article) => article.status === "published").length,
        [sortedArticles]
    );

    const scopedArticles = useMemo(() => {
        if (activeCategory === "all") return sortedArticles;
        return sortedArticles.filter((article) => getCategoryId(article) === activeCategory);
    }, [activeCategory, sortedArticles]);

    const [leadArticle, ...restArticles] = scopedArticles;
    const visibleArticles = restArticles.slice(0, visibleCount);
    const hasMore = visibleCount < restArticles.length;

    return (
        <div className="homepage-shell min-h-screen bg-background text-foreground">
            <section className="relative overflow-hidden border-y border-border/80">
                <motion.div
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : {
                                opacity: [0.16, 0.32, 0.16],
                                x: [0, 18, 0],
                            }
                    }
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                    className="pointer-events-none absolute -left-20 top-16 h-64 w-64 rounded-full bg-primary/12 blur-3xl"
                />
                <motion.div
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : {
                                opacity: [0.1, 0.24, 0.1],
                                y: [0, -18, 0],
                            }
                    }
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="pointer-events-none absolute right-[-6rem] top-8 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(183,28,28,0.08)_0%,rgba(183,28,28,0)_52%)]" />

                <div className="container relative z-10 mx-auto px-4 py-12 sm:py-14 lg:py-16">
                    <div className="max-w-4xl">
                        <span className="home-kicker gap-2">
                            <Newspaper className="h-3.5 w-3.5" />
                            {language === "en" ? "Newsroom Archive" : "समाचार अभिलेख"}
                        </span>
                        <h1 className="home-title-xl mt-4">{tString(locale.heading, language)}</h1>
                        <p className="home-body mt-4 max-w-3xl">{tString(locale.subheading, language)}</p>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        <div className="border border-border/80 bg-card/70 p-4">
                            <div className="inline-flex h-8 w-8 items-center justify-center border border-primary/35 bg-primary/10 text-primary">
                                <LibraryBig className="h-4 w-4" />
                            </div>
                            <p className="home-meta mt-3">{language === "en" ? "Total Articles" : "कुल लेख"}</p>
                            <p className="mt-1 text-2xl text-foreground">{sortedArticles.length}</p>
                        </div>
                        <div className="border border-border/80 bg-card/70 p-4">
                            <div className="inline-flex h-8 w-8 items-center justify-center border border-primary/35 bg-primary/10 text-primary">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <p className="home-meta mt-3">{language === "en" ? "Featured" : "फिचर्ड"}</p>
                            <p className="mt-1 text-2xl text-foreground">{featuredCount}</p>
                        </div>
                        <div className="border border-border/80 bg-card/70 p-4">
                            <div className="inline-flex h-8 w-8 items-center justify-center border border-primary/35 bg-primary/10 text-primary">
                                <BookOpenText className="h-4 w-4" />
                            </div>
                            <p className="home-meta mt-3">{language === "en" ? "Published" : "प्रकाशित"}</p>
                            <p className="mt-1 text-2xl text-foreground">{publishedCount}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="articles-archive-grid" className="container mx-auto px-4 py-10 sm:py-12 lg:py-14">
                {!scopedArticles || scopedArticles.length === 0 ? (
                    <div className="border border-dashed border-border bg-card/40 px-6 py-20 text-center">
                        <p className="text-xl text-muted-foreground">{tString(locale.empty.title, language)}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{tString(locale.empty.subtitle, language)}</p>
                    </div>
                ) : (
                    <div className="grid items-start gap-7 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
                        <aside className="border border-border/80 bg-card/68 p-4 lg:sticky lg:top-24">
                            <p className="home-meta">{language === "en" ? "Filter by Topic" : "विषयअनुसार छान्नुहोस्"}</p>
                            <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                                <button
                                    type="button"
                                    onClick={() => setActiveCategory("all")}
                                    className={cn(
                                        "inline-flex min-h-11 items-center justify-between border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
                                        activeCategory === "all"
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border/80 bg-background/75 text-foreground/88 hover:border-primary/50 hover:text-primary"
                                    )}
                                >
                                    <span>{language === "en" ? "All" : "सबै"}</span>
                                    <span>{sortedArticles.length}</span>
                                </button>
                                {categoryOptions.map((category) => {
                                    const isActive = activeCategory === category.id;
                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => setActiveCategory(category.id)}
                                            className={cn(
                                                "inline-flex min-h-11 items-center justify-between border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
                                                isActive
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border/80 bg-background/75 text-foreground/88 hover:border-primary/50 hover:text-primary"
                                            )}
                                        >
                                            <span className="line-clamp-1 text-left">
                                                {language === "en" ? category.label.en : category.label.ne}
                                            </span>
                                            <span>{category.count}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </aside>

                        <div className="min-w-0 space-y-5">
                            {leadArticle ? (
                                <motion.article
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-70px" }}
                                    transition={{ duration: 0.4 }}
                                    className="group overflow-hidden border border-border/80 bg-card/70"
                                >
                                    <Link href={`/articles/${leadArticle.slug}`} className="block">
                                        <div className="grid md:grid-cols-[42%_58%]">
                                            <div className="relative border-b border-border/80 md:border-b-0 md:border-r">
                                                <div className="aspect-[16/11] w-full overflow-hidden bg-muted">
                                                    <img
                                                        src={
                                                            leadArticle.image ||
                                                            "https://placehold.co/1200x760/f2ede4/6b7280?text=Article"
                                                        }
                                                        alt={leadArticle.title?.[language] || leadArticle.title?.en || "Article"}
                                                        className="home-image-base h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                                                    />
                                                    <div className="absolute inset-0 home-image-overlay-neutral" />
                                                </div>
                                            </div>

                                            <div className="flex flex-col p-5 sm:p-6 lg:p-7">
                                                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                                    <span className="inline-flex border border-primary/40 bg-primary/10 px-2 py-1 text-primary">
                                                        {leadArticle.category?.[language] || leadArticle.category?.en}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-primary" />
                                                        {formatArticleDate(leadArticle.publishedDate, language)}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5 text-primary" />
                                                        {estimateReadTime(leadArticle, language)} {language === "en" ? "min" : "मिनेट"}
                                                    </span>
                                                </div>

                                                <h2 className="home-title-lg mt-4 text-foreground transition-colors group-hover:text-primary">
                                                    {leadArticle.title?.[language] || leadArticle.title?.en}
                                                </h2>

                                                <p className="mt-3 line-clamp-4 text-[0.98rem] leading-7 text-muted-foreground">
                                                    {leadArticle.excerpt?.[language] || leadArticle.excerpt?.en}
                                                </p>

                                                <span className="mt-6 inline-flex items-center gap-2 border-t border-border/80 pt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
                                                    {language === "en" ? "Read Lead Story" : "मुख्य लेख पढ्नुहोस्"}
                                                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.article>
                            ) : null}

                            <div className="space-y-4">
                                {visibleArticles.map((article, index) => (
                                    <motion.article
                                        key={article._id as string}
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-40px" }}
                                        transition={{ duration: 0.32, delay: index * 0.04 }}
                                        className="group overflow-hidden border border-border/80 bg-card/60 transition-colors hover:border-primary/50"
                                    >
                                        <Link href={`/articles/${article.slug}`} className="block">
                                            <div className="grid items-stretch sm:grid-cols-[170px_minmax(0,1fr)]">
                                                <div className="relative border-b border-border/80 sm:border-b-0 sm:border-r">
                                                    <div className="aspect-[16/10] w-full overflow-hidden bg-muted sm:h-full sm:aspect-auto">
                                                        <img
                                                            src={
                                                                article.image ||
                                                                "https://placehold.co/900x560/f2ede4/6b7280?text=Article"
                                                            }
                                                            alt={article.title?.[language] || article.title?.en || "Article"}
                                                            className="home-image-base h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                                                        />
                                                        <div className="absolute inset-0 home-image-overlay-neutral" />
                                                    </div>
                                                </div>

                                                <div className="p-4 sm:p-5">
                                                    <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                                        <span className="inline-flex border border-primary/35 bg-primary/10 px-2 py-0.5 text-primary">
                                                            {article.category?.[language] || article.category?.en}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5 text-primary" />
                                                            {formatArticleDate(article.publishedDate, language)}
                                                        </span>
                                                    </div>

                                                    <h3 className="mt-2 line-clamp-2 text-[1.4rem] leading-[1.22] text-foreground transition-colors group-hover:text-primary">
                                                        {article.title?.[language] || article.title?.en}
                                                    </h3>

                                                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">
                                                        {article.excerpt?.[language] || article.excerpt?.en}
                                                    </p>

                                                    <span className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
                                                        {language === "en" ? "Read Story" : "पूरा पढ्नुहोस्"}
                                                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.article>
                                ))}
                            </div>

                            {hasMore ? (
                                <div className="pt-2 text-center">
                                    <button
                                        type="button"
                                        onClick={() => setVisibleCount((prev) => prev + 8)}
                                        className="inline-flex min-h-11 items-center border border-border/80 bg-background/75 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/88 transition-colors hover:border-primary/60 hover:text-primary"
                                    >
                                        {language === "en" ? "Load More Articles" : "थप लेख लोड गर्नुहोस्"}
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

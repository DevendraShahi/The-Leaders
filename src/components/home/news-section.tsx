"use client";

import Link from "next/link";
import { ArticleGrid } from "./article-grid";
import { useLanguage } from "@/components/providers/language-provider";
import { IArticle } from "@/models/Article";
import { LOCALES, tString } from "@/lib/locales";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface NewsSectionProps {
    articles: IArticle[];
}

export function NewsSection({ articles }: NewsSectionProps) {
    const { language } = useLanguage();
    const locale = LOCALES.home.newsSection;

    if (!articles || articles.length === 0) {
        return null;
    }

    return (
        <section id="home-section-4" className="relative overflow-hidden border-y border-border/80 bg-background py-20">
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
            />
            <div className="pointer-events-none absolute inset-0 bg-primary/5" />

            <div className="container relative mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
                >
                    <div>
                        <p className="home-kicker mb-4">{tString(locale.badge, language)}</p>
                        <h2 className="section-title mb-2 md:text-6xl">
                            {tString(locale.headingMain, language)}{" "}
                            <span className="text-primary">{tString(locale.headingAccent, language)}</span>
                        </h2>
                        <p className="section-subtitle mt-2 max-w-2xl">{tString(locale.subtitle, language)}</p>
                    </div>

                    <Link
                        href="/articles"
                        className="group hidden shrink-0 items-center gap-2 border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary sm:inline-flex"
                    >
                        {language === "en" ? "All Analysis" : "सबै विश्लेषण"}
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                </motion.div>

                <div className="mb-10 h-px bg-border/80" />

                <ArticleGrid articles={articles} />

                <div className="mt-10 h-px bg-border/80" />

                <div className="mt-10 text-center sm:hidden">
                    <Link
                        href="/articles"
                        className="group inline-flex items-center gap-2 border border-border px-6 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-all hover:border-primary/60 hover:text-foreground"
                    >
                        {language === "en" ? "All Analysis" : "सबै विश्लेषण"}
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

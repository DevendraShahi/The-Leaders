"use client";

import Link from "next/link";
import { ArticleGrid } from "./article-grid";
import { useLanguage } from "@/components/providers/language-provider";
import { IArticle } from "@/models/Article";
import { LOCALES, tString } from "@/lib/locales";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <section id="home-section-4" className="relative overflow-hidden bg-background py-20 sm:py-32">
            <div className="container relative mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
                >
                    <div className="max-w-3xl">
                        <p className="home-kicker mb-4 text-primary font-bold">{tString(locale.badge, language)}</p>
                        <h2 className="section-title mb-4 md:text-6xl lg:text-7xl">
                            {tString(locale.headingMain, language)}{" "}
                            <span className="text-primary">{tString(locale.headingAccent, language)}</span>
                        </h2>
                        <p className="section-subtitle mt-2 max-w-2xl text-lg text-muted-foreground">{tString(locale.subtitle, language)}</p>
                    </div>

                    <Button asChild variant="outline" className="hidden sm:inline-flex group shadow-sm">
                        <Link prefetch={false} href="/articles">
                            {language === "en" ? "All Analysis" : "सबै विश्लेषण"}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </motion.div>

                <ArticleGrid articles={articles} />

                <div className="mt-12 text-center sm:hidden">
                    <Button asChild variant="outline" size="lg" className="w-full group shadow-sm">
                        <Link prefetch={false} href="/articles">
                            {language === "en" ? "All Analysis" : "सबै विश्लेषण"}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}

"use client";

import { ArticleGrid } from "./article-grid";
import { useLanguage } from "@/components/providers/language-provider";
import { IArticle } from "@/models/Article";
import { LOCALES, tString } from "@/lib/locales";

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
        <section className="border-t border-border/30 bg-background py-24">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-12 max-w-4xl text-center">
                    <span className="mb-4 inline-block border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                        {tString(locale.badge, language)}
                    </span>
                    <h2 className="section-title text-foreground md:text-6xl">
                        {tString(locale.headingMain, language)} <span className="text-primary">{tString(locale.headingAccent, language)}</span>
                    </h2>
                    <p className="section-subtitle mx-auto mt-4 max-w-2xl">
                        {tString(locale.subtitle, language)}
                    </p>
                </div>
                <ArticleGrid articles={articles} />
            </div>
        </section>
    );
}

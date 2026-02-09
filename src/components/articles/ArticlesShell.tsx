"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import { ArticleGrid } from "@/components/home/article-grid";
import type { IArticle } from "@/models/Article";
import { Newspaper, LibraryBig, Sparkles } from "lucide-react";

interface ArticlesShellProps {
    articles: IArticle[];
}

export function ArticlesShell({ articles }: ArticlesShellProps) {
    const { language } = useLanguage();
    const locale = LOCALES.articles;
    const featuredCount = articles.filter((article) => article.isFeatured).length;

    return (
        <div className="min-h-screen bg-background">
            <section className="relative overflow-hidden border-b border-border/40 bg-background">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(183,28,28,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(183,28,28,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
                <div className="container relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <span className="mb-5 inline-flex items-center gap-2 border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                            <Newspaper className="h-3.5 w-3.5" />
                            {language === "en" ? "Editorial Desk" : "सम्पादकीय डेस्क"}
                        </span>
                        <h1 className="page-title uppercase text-foreground">
                            {tString(locale.heading, language)}
                        </h1>
                        <p className="page-subtitle mx-auto mt-5 max-w-3xl">
                            {tString(locale.subheading, language)}
                        </p>
                    </div>

                    <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
                        <div className="border border-border bg-card/50 p-4 text-left">
                            <div className="mb-1 inline-flex h-7 w-7 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
                                <LibraryBig className="h-4 w-4" />
                            </div>
                            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                {language === "en" ? "Total Articles" : "कुल लेख"}
                            </div>
                            <div className="mt-1 text-2xl font-semibold text-foreground">{articles.length}</div>
                        </div>
                        <div className="border border-border bg-card/50 p-4 text-left">
                            <div className="mb-1 inline-flex h-7 w-7 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                {language === "en" ? "Featured" : "फिचर्ड"}
                            </div>
                            <div className="mt-1 text-2xl font-semibold text-foreground">{featuredCount}</div>
                        </div>
                        <div className="border border-border bg-card/50 p-4 text-left">
                            <div className="mb-1 inline-flex h-7 w-7 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
                                <Newspaper className="h-4 w-4" />
                            </div>
                            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                {language === "en" ? "Published" : "प्रकाशित"}
                            </div>
                            <div className="mt-1 text-2xl font-semibold text-foreground">
                                {articles.filter((article) => article.status === "published").length}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {!articles || articles.length === 0 ? (
                    <div className="border border-dashed border-border bg-card/40 px-6 py-20 text-center">
                        <p className="text-xl font-semibold text-muted-foreground">{tString(locale.empty.title, language)}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{tString(locale.empty.subtitle, language)}</p>
                    </div>
                ) : (
                    <ArticleGrid articles={articles} />
                )}
            </section>
        </div>
    );
}

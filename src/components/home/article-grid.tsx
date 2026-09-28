"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import { IArticle } from "@/models/Article";
import { useLanguage } from "@/components/providers/language-provider";
import { trackHomeEvent } from "@/lib/home-analytics";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ArticleGridProps {
    articles: IArticle[];
}

function estimateReadTime(text: string): number {
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
}

export function ArticleGrid({ articles }: ArticleGridProps) {
    const { language } = useLanguage();
    const lang = language;

    if (!articles || articles.length === 0) return null;

    const [hero, ...rest] = articles;

    return (
        <div className="space-y-6">
            {hero && (
                <motion.article
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative overflow-hidden"
                >
                    <Link
                        href={`/articles/${hero.slug}`}
                        className="block h-full"
                        onClick={() =>
                            trackHomeEvent("home_article_click", {
                                article_slug: hero.slug,
                                card_type: "featured",
                            })
                        }
                    >
                        <Card className="h-full border border-border/20 overflow-hidden transition-all duration-300 hover:border-border/40">
                            <div className="relative aspect-[16/10] w-full bg-muted sm:aspect-[20/9]">
                                <img
                                    src={hero.image || "https://placehold.co/1400x560/f2ede4/6b7280?text=Article"}
                                    alt={hero.title[lang]}
                                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                            </div>

                            <div className="relative z-10 -mt-10 px-4 pb-5 sm:absolute sm:bottom-0 sm:left-0 sm:mt-0 sm:w-full sm:px-8 sm:pb-8 lg:px-10 lg:pb-10">
                                <div className="max-w-4xl bg-card p-6 shadow-sm border border-border/20 sm:p-6 lg:p-8 rounded-xl transition-all group-hover:shadow-md">
                                    <div className="mb-4 inline-flex">
                                        <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-[0.14em]">
                                            {hero.category[lang]}
                                        </Badge>
                                    </div>

                                    <h3
                                        className={cn(
                                            "mb-3 max-w-4xl line-clamp-3 text-foreground transition-colors group-hover:text-primary sm:line-clamp-none",
                                            lang === "ne"
                                                ? "text-[1.8rem] font-semibold leading-[1.18] tracking-normal sm:text-[2.35rem] lg:text-[2.7rem]"
                                                : "font-editorial text-[1.8rem] leading-[1.1] tracking-[-0.01em] sm:text-[2.15rem] lg:text-[2.55rem]"
                                        )}
                                    >
                                        {hero.title[lang]}
                                    </h3>

                                    <p className="mb-5 line-clamp-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                        {hero.excerpt[lang]}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.11em] text-muted-foreground font-bold">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(hero.publishedDate).toLocaleDateString(lang === "en" ? "en-US" : "ne-NP", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                {estimateReadTime(hero.excerpt[lang])}&nbsp;min
                                            </span>
                                        </div>
                                        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground font-bold transition-colors group-hover:text-primary sm:ml-0">
                                            {lang === "en" ? "Read Story" : "पूरा पढ्नुहोस्"}
                                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Link>
                </motion.article>
            )}

            {rest.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2">
                    {rest.map((article, index) => (
                        <motion.article
                            key={article._id as string}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                            className="group h-full"
                        >
                            <Link
                                href={`/articles/${article.slug}`}
                                onClick={() =>
                                    trackHomeEvent("home_article_click", {
                                        article_slug: article.slug,
                                        card_type: "secondary_title",
                                    })
                                }
                                className="block h-full"
                            >
                                <Card className="flex h-full flex-col border border-border/20 transition-all duration-300 hover:border-border/40 hover:bg-muted/50 overflow-hidden">
                                    <div className="relative overflow-hidden">
                                        <div className="aspect-[16/10] w-full bg-muted">
                                            <img
                                                src={article.image || "https://placehold.co/900x560/f2ede4/6b7280?text=Article"}
                                                alt={article.title[lang]}
                                                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                                            />
                                        </div>
                                    </div>

                                    <CardContent className="flex flex-1 flex-col p-6">
                                        <div className="mb-4 flex flex-wrap items-center gap-3">
                                            <Badge variant="secondary" className="font-mono text-[9px] uppercase tracking-[0.13em]">
                                                {article.category[lang]}
                                            </Badge>
                                            <div className="flex items-center font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground font-bold">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(article.publishedDate).toLocaleDateString(
                                                        lang === "en" ? "en-US" : "ne-NP",
                                                        { month: "short", day: "numeric", year: "numeric" }
                                                    )}
                                                </span>
                                                <span className="mx-2 hidden h-3 w-px bg-border/40 sm:block" />
                                                <span className="ml-3 flex items-center gap-1.5 sm:ml-0">
                                                    <Clock className="h-3 w-3" />
                                                    {estimateReadTime(article.excerpt[lang])}&nbsp;min
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="mb-3 line-clamp-3 flex-grow font-editorial text-[1.5rem] leading-[1.16] tracking-[-0.01em] text-foreground transition-colors group-hover:text-primary">
                                            {article.title[lang]}
                                        </h3>

                                        <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                                            {article.excerpt[lang]}
                                        </p>

                                        <div className="relative z-10 mt-auto pt-4 border-t border-border/10">
                                            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground font-bold transition-colors group-hover:text-primary">
                                                {lang === "en" ? "Read Story" : "पूरा पढ्नुहोस्"}
                                                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.article>
                    ))}
                </div>
            )}
        </div>
    );
}

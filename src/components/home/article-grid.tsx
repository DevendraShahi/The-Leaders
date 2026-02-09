"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Dot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IArticle } from "@/models/Article";
import { useLanguage } from "@/components/providers/language-provider";

interface ArticleGridProps {
    articles: IArticle[];
}

export function ArticleGrid({ articles }: ArticleGridProps) {
    const { language } = useLanguage();
    const lang = language;

    return (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
                <motion.article
                    key={article._id as string}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="group flex h-full flex-col border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
                >
                    <div className="relative overflow-hidden border-b border-border">
                        <div className="aspect-[16/10] w-full bg-muted">
                            <img
                                src={article.image || "https://placehold.co/900x560/png?text=Article"}
                                alt={article.title[lang]}
                                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                        <div className="absolute left-4 top-4">
                            <Badge
                                variant="secondary"
                                className="rounded-none border border-border/60 bg-background/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]"
                            >
                                {article.category[lang]}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                        <div className="mb-4 flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                                {new Date(article.publishedDate).toLocaleDateString(lang === "en" ? "en-US" : "ne-NP", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                            <Dot className="h-3.5 w-3.5 text-border" />
                            <span className="line-clamp-1">{article.author[lang]}</span>
                        </div>

                        <h3 className="mb-3 line-clamp-3 font-sans text-[1.25rem] leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary md:text-[1.35rem]">
                            <Link href={`/articles/${article.slug}`}>{article.title[lang]}</Link>
                        </h3>

                        <p className="mb-6 line-clamp-3 flex-grow text-sm leading-relaxed text-muted-foreground">
                            {article.excerpt[lang]}
                        </p>

                        <div className="mt-auto border-t border-border pt-4">
                            <Link
                                href={`/articles/${article.slug}`}
                                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-primary transition-colors hover:text-primary/80"
                            >
                                {lang === "en" ? "Read Story" : "पूरा पढ्नुहोस्"}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </motion.article>
            ))}
        </div>
    );
}

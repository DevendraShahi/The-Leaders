"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IArticle } from "@/models/Article";

interface ArticleGridProps {
    articles: IArticle[];
}

export function ArticleGrid({ articles }: ArticleGridProps) {
    const [lang, setLang] = useState<"en" | "ne">("en");

    const toggleLang = () => {
        setLang((prev) => (prev === "en" ? "ne" : "en"));
    };

    return (
        <div>
            <div className="flex justify-end mb-8">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleLang}
                    className="flex items-center gap-2 font-manrope"
                >
                    <Globe className="w-4 h-4" />
                    {lang === "en" ? "नेपालीमा पढ्नुहोस्" : "Read in English"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article, index) => (
                    <motion.article
                        key={article._id as string}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="group flex flex-col bg-background border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md"
                    >
                        {/* Image container */}
                        <div className="relative h-48 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={article.image || "https://placehold.co/600x400/png?text=Article"}
                                alt={article.title[lang]}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-4 left-4">
                                <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm hover:bg-background text-xs font-bold uppercase tracking-wider">
                                    {article.category[lang]}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex flex-col flex-grow p-6">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 font-manrope">
                                <Calendar className="w-3 h-3" />
                                <span>
                                    {new Date(article.publishedDate).toLocaleDateString(
                                        lang === "en" ? "en-US" : "ne-NP",
                                        { year: 'numeric', month: 'long', day: 'numeric' }
                                    )}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                                <span>{article.author[lang]}</span>
                            </div>

                            <h3 className="text-xl font-bebas font-bold mb-3 leading-snug group-hover:text-primary transition-colors">
                                <Link href={`/articles/${article.slug}`}>
                                    {article.title[lang]}
                                </Link>
                            </h3>

                            <p className="text-muted-foreground text-sm line-clamp-3 mb-6 font-manrope leading-relaxed flex-grow">
                                {article.excerpt[lang]}
                            </p>

                            <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <Link
                                    href={`/articles/${article.slug}`}
                                    className="inline-flex items-center text-sm font-bold text-primary hover:text-primary/80 uppercase tracking-widest font-bebas transition-colors"
                                >
                                    {lang === "en" ? "Read Full Story" : "पूरा पढ्नुहोस्"}
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </motion.article>
                ))}
            </div>
        </div>
    );
}

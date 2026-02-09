"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Share2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

interface ElectionArticle {
    title_en: string;
    title_ne?: string;
    slug: string;
    excerpt_en?: string;
    excerpt_ne?: string;
    content_en: string;
    content_ne?: string;
    editor?: string;
    createdAt?: string;
    author?: string;
    tags?: string[];
    readTime?: number;
    image?: string;
}

interface AnalysisDetailClientProps {
    article: ElectionArticle;
}

// Helper to normalize weirdly capitalized text to readable sentence case
function normalizeText(text: string): string {
    // Check if text looks like "Every Word Is Capitalized" format
    const words = text.split(/\s+/);
    const allWordsCapitalized = words.length > 3 && words.filter(w => w.length > 0).every(word => {
        return /^[A-Z]/.test(word) || word.length <= 2; // All words start with caps or are short (like "a", "of")
    });

    if (!allWordsCapitalized) {
        return text; // Already properly formatted
    }

    // List of words that should stay uppercase (acronyms, etc.)
    const acronyms = ['EC', 'NHRC', 'PR', 'FPTP', 'UML', 'US', 'UK', 'UN', 'IT', 'AI', 'HR'];

    // List of proper nouns that should stay capitalized
    const properNouns = ['Nepal', 'Nepali', 'Kathmandu', 'Leaders', 'Election', 'Commission',
        'Advertising', 'Board', 'Third-party', 'Social', 'Media', 'Digital',
        'Code-of-conduct', 'Framework'];

    return words.map((word, index) => {
        // Keep acronyms as-is
        if (acronyms.includes(word.toUpperCase())) {
            return word.toUpperCase();
        }

        // First word of sentence or after punctuation should be capitalized
        if (index === 0 || /[.!?:]$/.test(words[index - 1])) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }

        // Check if it's a proper noun
        const isProperNoun = properNouns.some(noun =>
            word.toLowerCase() === noun.toLowerCase()
        );

        if (isProperNoun) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }

        // Everything else lowercase
        return word.toLowerCase();
    }).join(' ');
}

// Helper function to parse inline markdown (bold, italic, etc.)
function parseInlineMarkdown(text: string) {
    const parts: (string | React.JSX.Element)[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
        // Match bold text **text**
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        if (boldMatch && boldMatch.index !== undefined) {
            if (boldMatch.index > 0) {
                parts.push(remaining.substring(0, boldMatch.index));
            }
            parts.push(
                <strong key={`bold-${key++}`} className="font-semibold text-foreground">
                    {boldMatch[1]}
                </strong>
            );
            remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
            continue;
        }

        // Match italic text *text*
        const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);
        if (italicMatch && italicMatch.index !== undefined) {
            if (italicMatch.index > 0) {
                parts.push(remaining.substring(0, italicMatch.index));
            }
            parts.push(
                <em key={`italic-${key++}`} className="italic">
                    {italicMatch[1]}
                </em>
            );
            remaining = remaining.substring(italicMatch.index + italicMatch[0].length);
            continue;
        }

        parts.push(remaining);
        break;
    }

    return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
}

export function AnalysisDetailClient({ article }: AnalysisDetailClientProps) {
    const { language } = useLanguage();
    const detailLocale = LOCALES.analysisDetail;
    const [readProgress, setReadProgress] = useState(0);

    const createdDate = article.createdAt ? new Date(article.createdAt) : new Date();

    // Determine content based on language
    const title = language === "ne" && article.title_ne ? article.title_ne : article.title_en;
    const excerpt = language === "ne" && article.excerpt_ne ? article.excerpt_ne : article.excerpt_en;
    const content = language === "ne" && article.content_ne ? article.content_ne : article.content_en;

    const estimatedReadTime = article.readTime || Math.ceil(content.split(/\s+/).length / 200);
    const wordCount = content.split(/\s+/).length;

    // Track reading progress
    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;
            const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
            setReadProgress(Math.min(progress, 100));
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Parse content blocks
    const blocks = (content || "").split(/\n{2,}/).map((raw) => raw.trim()).filter(Boolean);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Reading Progress Bar */}
            <div
                className="fixed top-0 left-0 h-0.5 bg-primary z-50 transition-all duration-100"
                style={{ width: `${readProgress}%` }}
            />

            {/* Back Navigation */}
            <div className="border-b border-border/50">
                <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-4">
                    <Link
                        href="/election-2026/analyses"
                        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span>{tString(detailLocale.backLink, language)}</span>
                    </Link>
                </div>
            </div>

            {/* Article Header */}
            <header className="relative border-b border-border/50 bg-muted/20 overflow-hidden">
                {article.image && (
                    <div className="absolute inset-0">
                        <img
                            src={article.image}
                            alt={title}
                            className="h-full w-full object-cover object-center opacity-40"
                            loading="eager"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/70 to-background/95" />
                    </div>
                )}
                <div className="relative z-10 container mx-auto max-w-4xl px-4 sm:px-6 py-12 md:py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        {/* Category Badge */}
                        <Badge
                            variant="outline"
                            className="rounded-none px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-primary border-primary/30 bg-primary/5"
                        >
                            {tString(detailLocale.badge, language)}
                        </Badge>

                        {/* Title */}
                        <h1 className="font-bebas text-5xl sm:text-6xl md:text-7xl leading-[0.9] tracking-tight uppercase text-foreground max-w-3xl">
                            {title}
                        </h1>

                        {/* Subtitle/Excerpt */}
                        {excerpt && (
                            <p className="text-base md:text-lg leading-relaxed text-muted-foreground max-w-2xl font-sans">
                                {excerpt}
                            </p>
                        )}

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground pt-4">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <time dateTime={createdDate.toISOString()}>
                                    {createdDate.toLocaleDateString(language === "ne" ? "ne-NP" : "en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </time>
                            </div>

                            <span className="text-border">·</span>

                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>{estimatedReadTime} {tString(detailLocale.stats.minRead, language)}</span>
                            </div>

                            {article.editor && (
                                <>
                                    <span className="text-border">·</span>
                                    <span>{tString(detailLocale.stats.editor, language)}: {article.editor}</span>
                                </>
                            )}
                        </div>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {article.tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="rounded-none px-3 py-1 text-[10px] font-mono uppercase tracking-widest border border-border bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
                <div className="grid lg:grid-cols-[1fr_280px] gap-12">
                    {/* Article Content */}
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-[75ch]"
                    >
                        <div className="max-w-none">
                            <div className="space-y-6 font-sans text-[17px] leading-[1.7] text-foreground/90">
                                {blocks.map((block, idx) => {
                                    // H2 Headings
                                    if (block.startsWith("## ")) {
                                        const title = block.replace(/^##\s+/, "");
                                        return (
                                            <h2
                                                key={idx}
                                                className="font-bebas text-3xl md:text-4xl tracking-wide text-foreground mt-12 mb-4 first:mt-0 uppercase"
                                            >
                                                {title}
                                            </h2>
                                        );
                                    }

                                    // H3 Headings
                                    if (block.startsWith("### ")) {
                                        const title = block.replace(/^###\s+/, "");
                                        return (
                                            <h3
                                                key={idx}
                                                className="font-bebas text-2xl md:text-3xl tracking-wide text-foreground mt-10 mb-3 uppercase"
                                            >
                                                {title}
                                            </h3>
                                        );
                                    }

                                    const lines = block.split("\n");

                                    // Numbered lists
                                    if (lines.every((l) => /^\d+[\)\.]\s/.test(l.trim()) || l.trim() === "")) {
                                        return (
                                            <ol key={idx} className="space-y-3 my-4 pl-6 list-decimal marker:text-primary marker:font-medium">
                                                {lines.filter(l => l.trim()).map((l, liIdx) => {
                                                    const content = l.replace(/^\d+[\)\.]\s*/, "");
                                                    return (
                                                        <li key={liIdx} className="pl-2">
                                                            {parseInlineMarkdown(normalizeText(content))}
                                                        </li>
                                                    );
                                                })}
                                            </ol>
                                        );
                                    }

                                    // Bullet lists
                                    if (lines.every((l) => l.trim().startsWith("- ") || l.trim() === "")) {
                                        return (
                                            <ul key={idx} className="space-y-3 my-4 pl-6 list-disc marker:text-primary">
                                                {lines.filter(l => l.trim()).map((l, liIdx) => {
                                                    const content = l.replace(/^-+\s*/, "");
                                                    return (
                                                        <li key={liIdx} className="pl-2">
                                                            {parseInlineMarkdown(normalizeText(content))}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        );
                                    }

                                    // First paragraph with drop cap
                                    if (idx === 0) {
                                        return (
                                            <p key={idx} className="first-letter:text-6xl first-letter:font-bebas first-letter:text-primary first-letter:float-left first-letter:mr-2 first-letter:leading-[0.8] first-letter:mt-1 font-manrope text-base md:text-lg leading-relaxed normal-case tracking-normal">
                                                {parseInlineMarkdown(normalizeText(block))}
                                            </p>
                                        );
                                    }

                                    // Regular paragraphs
                                    return <p key={idx} className="my-4 font-manrope text-base md:text-lg leading-relaxed normal-case tracking-normal text-muted-foreground/90">{parseInlineMarkdown(normalizeText(block))}</p>;
                                })}
                            </div>
                        </div>

                        {/* Series Badge */}
                        <div className="mt-16 pt-8 border-t border-border">
                            <Link
                                href="/election-2026/analyses"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-none border border-border bg-muted/40 hover:bg-muted transition-colors text-xs font-mono uppercase tracking-widest"
                            >
                                <span className="text-muted-foreground">{tString(detailLocale.partOf, language)}</span>
                                <span className="text-foreground">{tString(detailLocale.seriesTitle, language)}</span>
                                <ChevronLeft className="h-4 w-4 rotate-180" />
                            </Link>
                        </div>
                    </motion.article>

                    {/* Sidebar */}
                    <motion.aside
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="space-y-6 lg:sticky lg:top-6 lg:self-start"
                    >
                        {/* Reader's Guide */}
                        <div className="rounded-none border border-border bg-card p-6">
                            <h3 className="font-bebas text-xl uppercase tracking-wider text-foreground mb-3">
                                {tString(detailLocale.readersGuide.title, language)}
                            </h3>
                            <p className="text-sm leading-relaxed text-muted-foreground font-sans">
                                {tString(detailLocale.readersGuide.text, language)}
                            </p>
                        </div>

                        {/* Mission */}
                        <div className="rounded-none border border-primary/20 bg-primary/5 p-4 text-center">
                            <p className="text-[10px] font-mono uppercase tracking-widest text-primary">
                                {tString(detailLocale.mission, language)}
                            </p>
                        </div>

                        {/* Article Stats */}
                        <div className="rounded-none border border-border bg-muted/30 p-6">
                            <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                                {tString(detailLocale.stats.title, language)}
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground font-sans">{tString(detailLocale.stats.readTime, language)}</span>
                                    <span className="font-medium text-foreground font-sans">{estimatedReadTime} min</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground font-sans">{tString(detailLocale.stats.wordCount, language)}</span>
                                    <span className="font-medium text-foreground font-sans">{wordCount}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground font-sans">{tString(detailLocale.stats.published, language)}</span>
                                    <span className="font-medium text-foreground font-sans">
                                        {createdDate.toLocaleDateString(language === "ne" ? "ne-NP" : "en-US", { month: "short", year: "numeric" })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Share */}
                        <Button
                            variant="outline"
                            className="w-full rounded-none font-mono uppercase tracking-widest text-xs"
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title,
                                        text: excerpt || "",
                                        url: window.location.href,
                                    });
                                }
                            }}
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            {tString(detailLocale.share, language)}
                        </Button>
                    </motion.aside>
                </div>
            </div>
        </div>
    );
}

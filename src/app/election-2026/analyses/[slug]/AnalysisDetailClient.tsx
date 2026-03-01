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

function normalizeMarkdownContent(value: string): string {
    if (!value) return "";
    return value
        .replace(/\r\n/g, "\n")
        .replace(/([^\n])\s(#{1,6}\s)/g, "$1\n\n$2")
        .replace(/(^|\n)\s*(#{1,6}\s[^\n]+)\n(?!\n)/g, "$1$2\n\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

// Helper function to parse inline markdown (bold, italic, etc.)
function parseInlineMarkdown(text: string) {
    const parts: (string | React.JSX.Element)[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
        // Match inline code `code`
        const codeMatch = remaining.match(/`([^`]+?)`/);
        // Match bold text **text**
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        // Match italic text *text*
        const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);

        const matches = [
            codeMatch
                ? { type: "code" as const, match: codeMatch, index: codeMatch.index ?? 0 }
                : null,
            boldMatch
                ? { type: "bold" as const, match: boldMatch, index: boldMatch.index ?? 0 }
                : null,
            italicMatch
                ? { type: "italic" as const, match: italicMatch, index: italicMatch.index ?? 0 }
                : null,
        ].filter(Boolean) as Array<{
            type: "code" | "bold" | "italic";
            match: RegExpMatchArray;
            index: number;
        }>;

        if (matches.length === 0) {
            parts.push(remaining);
            break;
        }

        matches.sort((a, b) => a.index - b.index);
        const nextMatch = matches[0];

        if (nextMatch.index > 0) {
            parts.push(remaining.substring(0, nextMatch.index));
        }

        if (nextMatch.type === "code") {
            parts.push(
                <code
                    key={`code-${key++}`}
                    className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
                >
                    {nextMatch.match[1]}
                </code>
            );
            remaining = remaining.substring(nextMatch.index + nextMatch.match[0].length);
            continue;
        }

        if (nextMatch.type === "bold") {
            parts.push(
                <strong key={`bold-${key++}`} className="font-semibold text-foreground">
                    {nextMatch.match[1]}
                </strong>
            );
            remaining = remaining.substring(nextMatch.index + nextMatch.match[0].length);
            continue;
        }

        if (nextMatch.type === "italic") {
            parts.push(
                <em key={`italic-${key++}`} className="italic text-foreground/90">
                    {nextMatch.match[1]}
                </em>
            );
            remaining = remaining.substring(nextMatch.index + nextMatch.match[0].length);
            continue;
        }

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

        if (italicMatch && italicMatch.index !== undefined) {
            if (italicMatch.index > 0) {
                parts.push(remaining.substring(0, italicMatch.index));
            }
            parts.push(
                <em key={`italic-${key++}`} className="italic text-foreground/90">
                    {italicMatch[1]}
                </em>
            );
            remaining = remaining.substring(italicMatch.index + italicMatch[0].length);
            continue;
        }
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
    const normalizedContent = normalizeMarkdownContent(content || "");

    const estimatedReadTime = article.readTime || Math.ceil(normalizedContent.split(/\s+/).length / 200);
    const wordCount = normalizedContent.split(/\s+/).length;

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
    const blocks = normalizedContent.split(/\n{2,}/).map((raw) => raw.trim()).filter(Boolean);

    return (
        <div className="election-typography min-h-screen bg-background text-foreground">
            {/* Reading Progress Bar */}
            <div
                className="fixed top-0 left-0 h-0.5 bg-primary z-50 transition-all duration-100"
                style={{ width: `${readProgress}%` }}
            />

            {/* Back Navigation */}
            <div className="border-b border-border/50">
                <div className="container mx-auto max-w-4xl px-4 py-3 sm:px-6 sm:py-4">
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
                <div className="relative z-10 container mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 md:py-12 lg:py-14">
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
                        <h1 className="max-w-3xl break-words font-bebas text-3xl leading-[1.02] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                            {title}
                        </h1>

                        {/* Subtitle/Excerpt */}
                        {excerpt && (
                            <p className="max-w-2xl font-sans text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
                                {excerpt}
                            </p>
                        )}

                        {/* Metadata */}
                        <div className="flex flex-wrap items-start gap-x-4 gap-y-2 pt-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground sm:items-center sm:text-[11px]">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <time dateTime={createdDate.toISOString()}>
                                    {createdDate.toLocaleDateString(language === "ne" ? "ne-NP" : "en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </time>
                            </div>

                            <span className="hidden text-border sm:inline">·</span>

                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>{estimatedReadTime} {tString(detailLocale.stats.minRead, language)}</span>
                            </div>

                            {article.editor && (
                                <>
                                    <span className="hidden text-border sm:inline">·</span>
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
                                        className="cursor-pointer rounded-none border border-border bg-secondary px-2 py-1 text-[10px] font-mono uppercase tracking-widest transition-colors hover:bg-secondary/80 sm:px-3"
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
            <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 md:py-12">
                <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:gap-12">
                    {/* Article Content */}
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-[75ch]"
                    >
                        <div className="max-w-none">
                            <div className="space-y-4 font-manrope text-sm leading-[1.75] tracking-normal text-foreground/90 sm:space-y-5 sm:text-base md:text-lg">
                                {blocks.map((block, idx) => {
                                    const headingMatch = block.match(/^(#{1,6})\s+(.+)$/);
                                    if (headingMatch) {
                                        const level = headingMatch[1].length;
                                        const title = headingMatch[2].trim();

                                        if (level === 1) {
                                            return (
                                                <h2
                                                    key={idx}
                                                    className="mt-6 font-bebas text-2xl leading-snug tracking-wide text-foreground sm:text-3xl"
                                                >
                                                    {title}
                                                </h2>
                                            );
                                        }

                                        if (level === 2) {
                                            return (
                                                <h3
                                                    key={idx}
                                                    className="mt-5 font-bebas text-xl leading-snug tracking-wide text-foreground sm:text-2xl"
                                                >
                                                    {title}
                                                </h3>
                                            );
                                        }

                                        return (
                                            <h4
                                                key={idx}
                                                className="mt-4 font-bebas text-lg leading-snug tracking-wide text-foreground sm:text-xl"
                                            >
                                                {title}
                                            </h4>
                                        );
                                    }
                                    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);

                                    // Numbered lists
                                    if (lines.length > 0 && lines.every((l) => /^\d+[\)\.]\s/.test(l))) {
                                        return (
                                            <ol key={idx} className="my-3 list-decimal space-y-2 pl-5 marker:font-medium marker:text-primary sm:my-4 sm:pl-6">
                                                {lines.map((l, liIdx) => {
                                                    const content = l.replace(/^\d+[\)\.]\s*/, "");
                                                    return (
                                                        <li key={liIdx} className="pl-1 leading-relaxed">
                                                            {parseInlineMarkdown(normalizeText(content))}
                                                        </li>
                                                    );
                                                })}
                                            </ol>
                                        );
                                    }

                                    // Bullet lists
                                    if (lines.length > 0 && lines.every((l) => l.startsWith("- "))) {
                                        return (
                                            <ul key={idx} className="my-3 list-disc space-y-2 pl-5 marker:text-primary sm:my-4 sm:pl-6">
                                                {lines.map((l, liIdx) => {
                                                    const content = l.replace(/^-+\s*/, "");
                                                    return (
                                                        <li key={liIdx} className="pl-1 leading-relaxed">
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
                                            <p key={idx} className="first-letter:float-left first-letter:mr-1.5 first-letter:mt-0.5 first-letter:font-bebas first-letter:text-4xl first-letter:leading-[0.85] first-letter:text-primary sm:first-letter:mr-2 sm:first-letter:mt-1 sm:first-letter:text-5xl md:first-letter:text-6xl">
                                                {parseInlineMarkdown(normalizeText(block))}
                                            </p>
                                        );
                                    }

                                    // Regular paragraphs
                                    return <p key={idx} className="my-3 break-words text-muted-foreground/90 sm:my-4">{parseInlineMarkdown(normalizeText(block))}</p>;
                                })}
                            </div>
                        </div>

                        {/* Series Badge */}
                        <div className="mt-12 border-t border-border pt-8 sm:mt-16">
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
                        className="space-y-4 sm:space-y-6 lg:sticky lg:top-6 lg:self-start"
                    >
                        {/* Reader's Guide */}
                        <div className="rounded-none border border-border bg-card p-4 sm:p-6">
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
                        <div className="rounded-none border border-border bg-muted/30 p-4 sm:p-6">
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

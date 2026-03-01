"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import type { DailyBriefDTO, LocalizedValue } from "@/lib/election-data";

function resolveText(value: LocalizedValue, language: "en" | "ne"): string {
    if (typeof value === "string") return value;
    return language === "ne" ? value.ne || value.en || "" : value.en || value.ne || "";
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

function parseInlineMarkdown(text: string) {
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
        const codeMatch = remaining.match(/`([^`]+?)`/);
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
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
    }

    return parts;
}

interface DailyBriefDetailClientProps {
    brief: DailyBriefDTO;
}

export function DailyBriefDetailClient({ brief }: DailyBriefDetailClientProps) {
    const { language } = useLanguage();
    const locale = LOCALES.dailyBriefDetail;
    const title = resolveText(brief.title, language);
    const summary = resolveText(brief.summary, language);
    const content = resolveText(brief.content, language);
    const normalizedContent = normalizeMarkdownContent(content);
    const containsHtml = /<[^>]+>/.test(normalizedContent);
    const blocks = normalizedContent.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

    return (
        <div className="election-typography min-h-screen bg-background">
            <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto max-w-4xl px-4 py-3 sm:px-6 sm:py-4">
                    <Link
                        href="/election-2026/daily-brief"
                        className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {tString(locale.backLink.label, language)}
                    </Link>
                </div>
            </div>

            <header className="relative border-b-2 border-primary/20 overflow-hidden">
                {brief.image && (
                    <div className="absolute inset-0">
                        <img
                            src={brief.image}
                            alt={title}
                            className="h-full w-full object-cover object-center opacity-40"
                            loading="eager"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/70 to-background/95" />
                    </div>
                )}
                <div className="relative z-10 container mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 md:py-12">
                    <div className="mb-6">
                        <div className="inline-block border border-primary/20 bg-primary/5 px-3 py-1 mb-4">
                            <span className="text-primary font-mono text-xs uppercase tracking-widest">
                                {tString(locale.badge.label, language)}
                            </span>
                        </div>
                    </div>

                    <h1 className="mb-5 break-words font-bebas text-3xl leading-[1.02] tracking-tight text-foreground sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
                        {title}
                    </h1>

                    <div className="flex flex-wrap items-start gap-3 text-xs font-mono text-muted-foreground sm:items-center sm:gap-4 sm:text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="uppercase tracking-wider">
                                {tString(locale.meta.dateLabel, language)}:
                            </span>
                            <time dateTime={brief.date}>
                                {new Date(brief.date).toLocaleDateString(language === "ne" ? "ne-NP" : "en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </time>
                        </div>

                        {brief.tags && brief.tags.length > 0 && (
                            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                                <span className="hidden text-border sm:inline">•</span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    <span className="uppercase tracking-wider">
                                        {tString(locale.meta.tagsLabel, language)}:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {brief.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="outline"
                                                className="rounded-none px-2 py-0.5 font-mono text-[10px] uppercase sm:text-xs"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {summary && (
                        <div className="mt-6 pt-6 border-t border-border">
                            <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-2">
                                {tString(locale.summary.sectionLabel, language)}
                            </p>
                            <p className="font-sans text-base italic leading-relaxed text-foreground/90 sm:text-lg md:text-xl">
                                {summary}
                            </p>
                        </div>
                    )}
                </div>
            </header>

            <article className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 md:py-12">
                <Separator className="my-6 sm:my-8" />

                <div className="mb-4 text-sm font-mono uppercase tracking-widest text-muted-foreground">
                    {tString(locale.content.sectionLabel, language)}
                </div>

                <div className="max-w-none">
                    {containsHtml ? (
                        <div
                            className="prose prose-sm max-w-none prose-neutral dark:prose-invert sm:prose-base prose-headings:font-bebas prose-headings:tracking-wide prose-headings:normal-case prose-headings:text-foreground prose-p:font-manrope prose-p:text-sm prose-p:leading-[1.75] prose-p:text-foreground/90 sm:prose-p:text-base prose-li:font-manrope prose-li:text-sm prose-li:leading-[1.75] prose-li:text-foreground/90 sm:prose-li:text-base prose-strong:text-foreground prose-em:text-foreground/90 prose-code:font-mono prose-code:text-sm prose-pre:font-mono prose-a:text-primary"
                            dangerouslySetInnerHTML={{ __html: normalizedContent }}
                        />
                    ) : (
                        <div className="space-y-4 font-manrope text-sm leading-[1.75] tracking-normal text-foreground/90 sm:space-y-5 sm:text-base md:text-lg">
                            {blocks.map((block, index) => {
                                const headingMatch = block.match(/^(#{1,6})\s+(.+)$/);
                                if (headingMatch) {
                                    const level = headingMatch[1].length;
                                    const headingText = headingMatch[2].trim();

                                    if (level === 1) {
                                        return (
                                            <h2
                                                key={`h-${index}`}
                                                className="mt-6 font-bebas text-2xl md:text-3xl leading-snug tracking-wide text-foreground"
                                            >
                                                {headingText}
                                            </h2>
                                        );
                                    }
                                    if (level === 2) {
                                        return (
                                            <h3
                                                key={`h-${index}`}
                                                className="mt-5 font-bebas text-xl md:text-2xl leading-snug tracking-wide text-foreground"
                                            >
                                                {headingText}
                                            </h3>
                                        );
                                    }
                                    return (
                                        <h4
                                            key={`h-${index}`}
                                            className="mt-4 font-bebas text-lg md:text-xl leading-snug tracking-wide text-foreground"
                                        >
                                            {headingText}
                                        </h4>
                                    );
                                }

                                const lines = block
                                    .split("\n")
                                    .map((line) => line.trim())
                                    .filter(Boolean);

                                if (lines.length > 0 && lines.every((line) => /^[-*]\s+/.test(line))) {
                                    const items = lines.map((line) => line.replace(/^[-*]\s+/, ""));

                                    return (
                                        <ul key={`list-${index}`} className="my-2 list-disc space-y-2 pl-5 marker:text-primary sm:pl-6">
                                            {items.map((item, itemIndex) => (
                                                <li key={`li-${index}-${itemIndex}`} className="pl-1 leading-relaxed">
                                                    {parseInlineMarkdown(item)}
                                                </li>
                                            ))}
                                        </ul>
                                    );
                                }

                                if (lines.length > 0 && lines.every((line) => /^\d+[\.)]\s+/.test(line))) {
                                    const items = lines.map((line) => line.replace(/^\d+[\.)]\s+/, ""));

                                    return (
                                        <ol key={`list-num-${index}`} className="my-2 list-decimal space-y-2 pl-5 marker:text-primary sm:pl-6">
                                            {items.map((item, itemIndex) => (
                                                <li key={`li-num-${index}-${itemIndex}`} className="pl-1 leading-relaxed">
                                                    {parseInlineMarkdown(item)}
                                                </li>
                                            ))}
                                        </ol>
                                    );
                                }

                                return (
                                    <p key={`p-${index}`} className="break-words leading-relaxed text-foreground/90">
                                        {parseInlineMarkdown(block)}
                                    </p>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="mt-12 border-t border-border pt-8 sm:mt-16">
                    <Link
                        href="/election-2026/daily-brief"
                        className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-primary hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {tString(locale.footer.backToAll, language)}
                    </Link>
                </div>
            </article>
        </div>
    );
}

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
        .replace(/([^\n])\s(#{2,6}\s)/g, "$1\n\n$2")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function parseInlineMarkdown(text: string) {
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
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
            <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-20">
                <div className="container mx-auto max-w-4xl px-4 py-4">
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
                <div className="relative z-10 container mx-auto max-w-4xl px-4 py-12">
                    <div className="mb-6">
                        <div className="inline-block border border-primary/20 bg-primary/5 px-3 py-1 mb-4">
                            <span className="text-primary font-mono text-xs uppercase tracking-widest">
                                {tString(locale.badge.label, language)}
                            </span>
                        </div>
                    </div>

                    <h1 className="font-bebas text-4xl md:text-6xl lg:text-7xl text-foreground mb-6 uppercase tracking-tight leading-[0.98]">
                        {title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-muted-foreground">
                        <div className="flex items-center gap-2">
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
                            <>
                                <span className="text-border">•</span>
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    <span className="uppercase tracking-wider">
                                        {tString(locale.meta.tagsLabel, language)}:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {brief.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="outline"
                                                className="font-mono text-xs uppercase px-2 py-0.5 rounded-none"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {summary && (
                        <div className="mt-6 pt-6 border-t border-border">
                            <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-2">
                                {tString(locale.summary.sectionLabel, language)}
                            </p>
                            <p className="text-xl md:text-2xl font-sans leading-relaxed text-foreground/90 italic">
                                {summary}
                            </p>
                        </div>
                    )}
                </div>
            </header>

            <article className="container mx-auto max-w-4xl px-4 py-12">
                <Separator className="my-8" />

                <div className="mb-4 text-sm font-mono uppercase tracking-widest text-muted-foreground">
                    {tString(locale.content.sectionLabel, language)}
                </div>

                <div className="prose prose-lg max-w-none">
                    {containsHtml ? (
                        <div
                            className="font-sans text-lg leading-relaxed text-foreground"
                            dangerouslySetInnerHTML={{ __html: normalizedContent }}
                        />
                    ) : (
                        <div className="space-y-4 font-sans text-lg leading-relaxed text-foreground">
                            {blocks.map((block, index) => {
                                const headingMatch = block.match(/^(#{1,6})\s+(.+)$/);
                                if (headingMatch) {
                                    const level = headingMatch[1].length;
                                    const headingText = headingMatch[2].trim();

                                    if (level === 1) {
                                        return (
                                            <h2 key={`h-${index}`} className="font-bebas text-4xl uppercase tracking-wide text-foreground">
                                                {headingText}
                                            </h2>
                                        );
                                    }
                                    if (level === 2) {
                                        return (
                                            <h3 key={`h-${index}`} className="font-bebas text-3xl uppercase tracking-wide text-foreground">
                                                {headingText}
                                            </h3>
                                        );
                                    }
                                    return (
                                        <h4 key={`h-${index}`} className="font-bebas text-2xl uppercase tracking-wide text-foreground">
                                            {headingText}
                                        </h4>
                                    );
                                }

                                if (block.startsWith("- ") || block.startsWith("* ")) {
                                    const items = block
                                        .split("\n")
                                        .map((line) => line.trim())
                                        .filter((line) => line.startsWith("- ") || line.startsWith("* "))
                                        .map((line) => line.replace(/^[-*]\s+/, ""));

                                    return (
                                        <ul key={`list-${index}`} className="list-disc space-y-2 pl-6 text-foreground/95">
                                            {items.map((item, itemIndex) => (
                                                <li key={`li-${index}-${itemIndex}`}>{parseInlineMarkdown(item)}</li>
                                            ))}
                                        </ul>
                                    );
                                }

                                return (
                                    <p key={`p-${index}`} className="text-foreground/95">
                                        {parseInlineMarkdown(block)}
                                    </p>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="mt-16 pt-8 border-t border-border">
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

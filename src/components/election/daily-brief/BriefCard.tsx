"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DailyBriefDTO, LocalizedValue } from "@/lib/election-data";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

type BriefCardVariant = "default" | "compact";

interface BriefCardProps {
    brief: DailyBriefDTO;
    variant?: BriefCardVariant;
    align?: "left" | "right";
}

export function BriefCard({ brief, variant = "default", align }: BriefCardProps) {
    const { language } = useLanguage();
    const resolveText = (value: LocalizedValue) => {
        if (typeof value === "string") return value;
        return language === "ne" ? value.ne || value.en || "" : value.en || value.ne || "";
    };

    const title = resolveText(brief.title);
    const summary = resolveText(brief.summary);

    const borderAccent =
        align === "left"
            ? "border-l-2 border-l-primary"
            : align === "right"
                ? "border-r-2 border-r-primary"
                : "border-l-2 border-l-primary";

    const titleSize = variant === "compact" ? "text-[1.25rem]" : "text-[1.45rem]";
    const summaryClamp = variant === "compact" ? "line-clamp-2" : "line-clamp-4";

    return (
        <div className={cn("group border border-border bg-card transition-colors hover:border-primary/60 rounded-none", borderAccent)}>
            {brief.image && (
                <div className="relative w-full aspect-[16/9] overflow-hidden border-b border-border bg-muted/30 dark:bg-[#151515]">
                    <img
                        src={brief.image}
                        alt={title}
                        className="h-full w-full object-cover object-center"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                </div>
            )}

            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-muted-foreground text-xs font-mono uppercase tracking-wider">
                        <Clock className="w-3 h-3 mr-1.5" />
                        {new Date(brief.date).toLocaleDateString(language === "ne" ? "ne-NP" : "en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </div>
                    {brief.tags && brief.tags.length > 0 && (
                        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide rounded-none">
                            {brief.tags[0]}
                        </Badge>
                    )}
                </div>

                <h3 className={cn("font-sans tracking-tight leading-[1.12] text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-4", titleSize)}>
                    {title}
                </h3>

                <p className={cn("text-muted-foreground font-sans text-sm leading-relaxed mb-6", summaryClamp)}>
                    {summary}
                </p>

                <Link
                    href={`/election-2026/daily-brief/${brief.slug}`}
                    className="inline-flex items-center text-primary font-mono text-xs uppercase tracking-widest font-bold group-hover:translate-x-1 transition-transform"
                >
                    {tString(LOCALES.election2026.dailyBrief.readMore, language)}
                    <ArrowRight className="w-3 h-3 ml-2" />
                </Link>
            </div>
        </div>
    );
}

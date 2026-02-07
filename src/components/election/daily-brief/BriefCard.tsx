"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DailyBriefDTO } from "@/lib/election-data";

type BriefCardVariant = "default" | "compact";

interface BriefCardProps {
    brief: DailyBriefDTO;
    variant?: BriefCardVariant;
    align?: "left" | "right";
}

export function BriefCard({ brief, variant = "default", align }: BriefCardProps) {
    const borderAccent =
        align === "left"
            ? "border-l-2 border-l-primary"
            : align === "right"
                ? "border-r-2 border-r-primary"
                : "border-l-2 border-l-primary";

    const titleSize = variant === "compact" ? "text-2xl" : "text-3xl";
    const summaryClamp = variant === "compact" ? "line-clamp-2" : "line-clamp-4";

    return (
        <div className={cn("group border border-border bg-card transition-colors hover:border-primary/60 rounded-none", borderAccent)}>
            {brief.image && (
                <div className="relative w-full aspect-[16/9] overflow-hidden border-b border-border bg-muted/30 dark:bg-[#151515]">
                    <img
                        src={brief.image}
                        alt={brief.title}
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
                        {format(new Date(brief.date), "MMM d, yyyy")}
                    </div>
                    {brief.tags && brief.tags.length > 0 && (
                        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide rounded-none">
                            {brief.tags[0]}
                        </Badge>
                    )}
                </div>

                <h3 className={cn("font-bebas uppercase tracking-tight leading-[0.9] text-foreground mb-3 group-hover:text-primary transition-colors", titleSize)}>
                    {brief.title}
                </h3>

                <p className={cn("text-muted-foreground font-sans text-sm leading-relaxed mb-6", summaryClamp)}>
                    {brief.summary}
                </p>

                <Link
                    href={`/election-2026/daily-brief/${brief.slug}`}
                    className="inline-flex items-center text-primary font-mono text-xs uppercase tracking-widest font-bold group-hover:translate-x-1 transition-transform"
                >
                    Read Briefing
                    <ArrowRight className="w-3 h-3 ml-2" />
                </Link>
            </div>
        </div>
    );
}

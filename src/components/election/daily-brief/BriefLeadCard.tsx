"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DailyBriefDTO } from "@/lib/election-data";

type LeadVariant = "grid" | "stack" | "timeline";

interface BriefLeadCardProps {
    brief: DailyBriefDTO;
    variant?: LeadVariant;
}

export function BriefLeadCard({ brief, variant = "grid" }: BriefLeadCardProps) {
    const titleSize =
        variant === "stack" ? "text-3xl md:text-4xl" : variant === "timeline" ? "text-4xl md:text-5xl" : "text-4xl md:text-5xl";
    const summarySize =
        variant === "stack" ? "text-base" : "text-lg";

    return (
        <div className="relative border-2 border-primary bg-gradient-to-r from-primary/5 to-transparent rounded-none p-8">
            <div className="absolute -top-3 left-8">
                <Badge className="bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider px-3 py-1 rounded-none">
                    Lead Brief
                </Badge>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
                        <span>{format(new Date(brief.date), "MMMM d, yyyy")}</span>
                        <span className="text-border">•</span>
                        <span>Daily Intelligence</span>
                    </div>

                    <Link href={`/election-2026/daily-brief/${brief.slug}`}>
                        <h3 className={`font-bebas uppercase leading-[0.9] text-foreground mb-4 hover:text-primary transition-colors ${titleSize}`}>
                            {brief.title}
                        </h3>
                    </Link>

                    <p className={`font-sans text-muted-foreground leading-relaxed mb-6 ${summarySize}`}>
                        {brief.summary}
                    </p>

                    {brief.tags && brief.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {brief.tags.slice(0, 4).map((tag) => (
                                <Badge key={tag} variant="outline" className="font-mono text-[10px] uppercase tracking-wide rounded-none">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {brief.image && (
                    <div className="md:w-1/3">
                        <div className="relative w-full aspect-[16/9] overflow-hidden border border-border bg-muted/30 dark:bg-[#151515]">
                            <img
                                src={brief.image}
                                alt={brief.title}
                                className="h-full w-full object-cover object-center"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 flex justify-end">
                <Link
                    href={`/election-2026/daily-brief/${brief.slug}`}
                    className="inline-flex items-center text-primary font-mono text-xs uppercase tracking-widest font-bold hover:translate-x-1 transition-transform"
                >
                    Read Full Brief
                    <ArrowRight className="w-3 h-3 ml-2" />
                </Link>
            </div>
        </div>
    );
}

"use client";

import type { DailyBriefDTO } from "@/lib/election-data";
import { BriefCard } from "./BriefCard";
import { BriefLeadCard } from "./BriefLeadCard";

interface DailyBriefGridProps {
    briefs: DailyBriefDTO[];
}

interface GroupedBriefs {
    [dateKey: string]: DailyBriefDTO[];
}

export function DailyBriefGrid({ briefs }: DailyBriefGridProps) {
    if (!briefs.length) return null;

    const [lead, ...rest] = briefs;
    const grouped = rest.reduce((acc: GroupedBriefs, brief) => {
        const dateKey = new Date(brief.date).toISOString().split("T")[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(brief);
        return acc;
    }, {});

    const dates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <div className="container mx-auto max-w-7xl px-4 pb-24">
            <div className="mb-12">
                <BriefLeadCard brief={lead} variant="grid" />
            </div>

            {dates.map((dateKey) => {
                const date = new Date(dateKey);
                const label = date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                }).toUpperCase();

                return (
                    <section key={dateKey} className="mb-14">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-px bg-primary" />
                            <h2 className="font-bebas text-3xl md:text-4xl uppercase tracking-tight text-foreground">
                                {label}
                            </h2>
                            <div className="flex-1 h-px bg-primary/20" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {grouped[dateKey].map((brief) => (
                                <BriefCard key={brief.slug} brief={brief} />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

"use client";

import type { DailyBriefDTO } from "@/lib/election-data";
import { BriefCard } from "./BriefCard";
import { BriefLeadCard } from "./BriefLeadCard";
import { useLanguage } from "@/components/providers/language-provider";

interface DailyBriefStackProps {
    briefs: DailyBriefDTO[];
}

interface GroupedBriefs {
    [dateKey: string]: DailyBriefDTO[];
}

export function DailyBriefStack({ briefs }: DailyBriefStackProps) {
    const { language } = useLanguage();

    if (!briefs.length) return null;

    const grouped = briefs.reduce((acc: GroupedBriefs, brief) => {
        const dateKey = new Date(brief.date).toISOString().split("T")[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(brief);
        return acc;
    }, {});

    const dates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <div className="container mx-auto max-w-5xl px-4 pb-24">
            {dates.map((dateKey) => {
                const date = new Date(dateKey);
                const label = date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                });
                const localizedLabel = date.toLocaleDateString(language === "ne" ? "ne-NP" : "en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                }).toUpperCase();

                const [lead, ...rest] = grouped[dateKey];

                return (
                    <section key={dateKey} className="mb-16">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-px bg-primary" />
                            <h2 className="font-bebas text-4xl md:text-5xl uppercase tracking-tight text-foreground">
                                {language === "ne" ? localizedLabel : label.toUpperCase()}
                            </h2>
                        </div>

                        <div className="mb-6">
                            <BriefLeadCard brief={lead} variant="stack" />
                        </div>

                        <div className="space-y-4">
                            {rest.map((brief) => (
                                <BriefCard key={brief.slug} brief={brief} variant="compact" />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

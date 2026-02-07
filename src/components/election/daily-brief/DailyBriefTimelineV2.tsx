"use client";

import { motion } from "framer-motion";
import type { DailyBriefDTO } from "@/lib/election-data";
import { BriefCard } from "./BriefCard";
import { BriefLeadCard } from "./BriefLeadCard";

interface DailyBriefTimelineV2Props {
    briefs: DailyBriefDTO[];
}

interface GroupedBriefs {
    [dateKey: string]: DailyBriefDTO[];
}

export function DailyBriefTimelineV2({ briefs }: DailyBriefTimelineV2Props) {
    if (!briefs.length) return null;

    const grouped = briefs.reduce((acc: GroupedBriefs, brief) => {
        const dateKey = new Date(brief.date).toISOString().split("T")[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(brief);
        return acc;
    }, {});

    const dates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-primary/40 hidden md:block" />

            {dates.map((dateKey, dateIndex) => {
                const items = grouped[dateKey];
                const [lead, ...rest] = items;

                const date = new Date(dateKey);
                const label = date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                }).toUpperCase();

                return (
                    <div key={dateKey} className="mb-20">
                        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 mb-10 border-b-2 border-primary/20">
                            <div className="container mx-auto px-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-px bg-primary" />
                                    <h2 className="font-bebas text-4xl md:text-5xl uppercase tracking-tight text-foreground">
                                        {label}
                                    </h2>
                                    <div className="flex-1 h-px bg-primary/20" />
                                </div>
                            </div>
                        </div>

                        <div className="container mx-auto px-4 mb-10">
                            <BriefLeadCard brief={lead} variant="timeline" />
                        </div>

                        {rest.map((brief, index) => {
                            const position = index % 2 === 0 ? "left" : "right";
                            const globalIndex = dateIndex * 10 + index + 1;

                            return (
                                <div key={brief.slug} className="relative mb-12">
                                    <div className="absolute left-1/2 top-8 -translate-x-1/2 z-10 hidden md:block">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.3, delay: globalIndex * 0.05 }}
                                            className="w-4 h-4 border-2 border-primary bg-background"
                                        />
                                    </div>

                                    <div
                                        className={`absolute top-8 hidden md:block ${position === "left"
                                            ? "left-1/2 right-0 ml-3"
                                            : "left-0 right-1/2 mr-3"
                                            }`}
                                    >
                                        <div className="h-px bg-primary/30" />
                                    </div>

                                    <div
                                        className={`container mx-auto px-4 md:px-8 ${position === "left"
                                            ? "md:pr-[52%]"
                                            : "md:pl-[52%]"
                                            }`}
                                    >
                                        <BriefCard brief={brief} align={position} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
}

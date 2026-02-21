"use client";

import { useState, useRef } from "react";
import { TimelineData, MonthGroup } from "@/lib/types/timeline-types";
import { groupTimelineData } from "@/lib/utils/timeline-utils";
import { MonthSection } from "./MonthSection";
import { motion } from "framer-motion";

interface TimelineContainerProps {
    data: TimelineData;
}

export function TimelineContainer({ data }: TimelineContainerProps) {
    const groupedData = groupTimelineData(data);
    const [activeMonthKey, setActiveMonthKey] = useState<string | null>(groupedData[0]?.monthKey || null);
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="w-full h-[calc(100vh-80px)] overflow-hidden bg-background relative flex flex-col">
            {/* Helper Navigation Text */}
            <div className="absolute top-4 left-6 z-20 pointer-events-none">
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] border py-1 px-2 rounded-full border-border bg-background/50 backdrop-blur">
                    Scroll Horizontally • Click to Expand
                </span>
            </div>

            {/* Horizontal Scroll Area */}
            <div
                ref={containerRef}
                className="flex-1 w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory py-12 px-6 flex items-center custom-scrollbar"
            >
                <div className="flex select-none h-[calc(100vh-160px)] items-center">
                    {groupedData.map((month) => (
                        <MonthSection
                            key={month.monthKey}
                            month={month}
                            isActive={activeMonthKey === month.monthKey}
                            onActivate={() => setActiveMonthKey(month.monthKey)}
                        />
                    ))}

                    {/* Spacer for right padding */}
                    <div className="w-24 flex-shrink-0" />
                </div>
            </div>

            {/* Global Timeline Progress (Optional visualization at bottom) */}
            <div className="h-1 w-full bg-muted/20 absolute bottom-0">
                <motion.div
                    className="h-full bg-primary origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1 }}
                />
            </div>
        </div>
    );
}

"use client";

import { motion } from "framer-motion";
import { MonthGroup, DayGroup } from "@/lib/types/timeline-types";
import { DayColumn } from "./DayColumn";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MonthSectionProps {
    month: MonthGroup;
    isActive: boolean;
    onActivate: () => void;
}

export function MonthSection({ month, isActive, onActivate }: MonthSectionProps) {
    const [activeDayDate, setActiveDayDate] = useState<string | null>(null);

    const toggleDay = (date: string) => {
        if (activeDayDate === date) {
            setActiveDayDate(null);
        } else {
            setActiveDayDate(date);
        }
    };

    return (
        <motion.div
            layout
            className={cn(
                "relative flex-shrink-0 transition-all duration-500 rounded-2xl border overflow-hidden",
                isActive ? "w-full md:w-[80vw] bg-background/50 border-primary shadow-2xl mr-8" : "w-[120px] md:w-[160px] bg-muted/20 border-border hover:bg-muted/30 cursor-pointer mr-4"
            )}
            onClick={!isActive ? onActivate : undefined}
        >
            {/* Month Label (Collapsed State) */}
            {!isActive && (
                <div className="h-full flex flex-col items-center justify-center py-12 gap-4">
                    <span className="text-4xl md:text-6xl font-bebas text-muted-foreground/50 rotate-[-90deg] whitespace-nowrap tracking-widest origin-center translate-y-8">
                        {month.monthName}
                    </span>
                    <span className="text-sm font-mono text-muted-foreground/40 mt-auto">
                        {month.year}
                    </span>
                </div>
            )}

            {/* Expanded State */}
            {isActive && (
                <div className="h-full flex flex-col p-6 md:p-8">
                    {/* Header */}
                    <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-white/5">
                        <h2 className="text-6xl md:text-8xl font-bebas text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                            {month.monthName}
                        </h2>
                        <span className="text-2xl font-mono text-primary tracking-[0.2em] opacity-80">
                            /{month.year}
                        </span>
                    </div>

                    {/* Days Horizontal Scroll */}
                    <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4">
                        <div className="flex gap-6 h-full items-start">
                            {month.days.map((day) => (
                                <DayColumn
                                    key={day.date}
                                    day={day}
                                    isActive={activeDayDate === day.date}
                                    onToggle={() => toggleDay(day.date)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

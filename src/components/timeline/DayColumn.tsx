"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DayGroup } from "@/lib/types/timeline-types";
import { EventCard } from "./EventCard";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface DayColumnProps {
    day: DayGroup;
    isActive: boolean;
    onToggle: () => void;
}

export function DayColumn({ day, isActive, onToggle }: DayColumnProps) {
    return (
        <div className="flex flex-col gap-4 min-w-[300px] md:min-w-[350px] snap-center">
            {/* Day Header */}
            <motion.button
                onClick={onToggle}
                className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group",
                    isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                        : "bg-muted/10 border-border hover:border-primary/50 text-foreground"
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-lg flex flex-col items-center justify-center border",
                        isActive ? "bg-primary-foreground/10 border-primary-foreground/20" : "bg-background border-border"
                    )}>
                        <span className="text-xl font-bold font-bebas leading-none">{day.day}</span>
                    </div>
                    <div>
                        <div className="font-bebas text-2xl tracking-wide">{day.month} {day.day}</div>
                        <div className="text-xs font-mono opacity-80 uppercase tracking-widest">{day.nepaliDate}</div>
                    </div>
                </div>
                <ChevronRight className={cn(
                    "w-5 h-5 transition-transform duration-300",
                    isActive ? "rotate-90" : "group-hover:translate-x-1"
                )} />
            </motion.button>

            {/* Events List (Expandable) */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-col gap-3 pl-2 border-l-2 border-primary/20 ml-6 pb-4">
                            {day.events.map((event, idx) => (
                                <EventCard key={event.event_id} event={event} index={idx} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

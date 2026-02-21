"use client";

import { TimelineEvent } from "@/lib/types/timeline-types";
import { formatTime } from "@/lib/utils/timeline-utils";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EventItemProps {
    event: TimelineEvent;
    position: "top" | "bottom";
    index: number;
}

export function EventItem({ event, position, index }: EventItemProps) {
    return (
        <div className="relative flex-shrink-0 w-[400px] h-full flex flex-col justify-center items-center group">
            {/* Central Axis Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-3 h-3 bg-primary rounded-full ring-4 ring-background group-hover:scale-150 transition-transform duration-300" />
                <div className="absolute inset-0 w-3 h-3 bg-primary rounded-full animate-ping opacity-20" />
            </div>

            {/* Vertical Connector Line */}
            <div className={cn(
                "absolute left-1/2 w-px bg-border group-hover:bg-primary/50 transition-colors duration-500 z-10",
                position === "top" ? "bottom-[50%] h-[100px]" : "top-[50%] h-[100px]"
            )} />

            {/* Content Container */}
            <div className={cn(
                "absolute w-full px-6 transition-all duration-500",
                position === "top" ? "bottom-[calc(50%+100px)]" : "top-[calc(50%+100px)]"
            )}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="space-y-3"
                >
                    {/* Date & Time */}
                    <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        <span className="text-primary font-bold">{event.date_gregorian}</span>
                        <span className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
                        <span>{formatTime(event.time)}</span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-2xl md:text-3xl font-bebas leading-[0.9] tracking-wide group-hover:text-primary transition-colors duration-300">
                        {event.event_headline}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-foreground/70 font-manrope leading-relaxed line-clamp-4 max-w-[90%] border-l-2 border-primary/20 pl-3 group-hover:border-primary transition-colors">
                        {event.brief_description}
                    </p>

                    {/* Source Link */}
                    {event.source_url && (
                        <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="inline-block text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-primary transition-all mt-2">
                            Read Source →
                        </a>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

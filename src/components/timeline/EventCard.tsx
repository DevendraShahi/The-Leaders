"use client";

import { motion } from "framer-motion";
import { TimelineEvent } from "@/lib/types/timeline-types";
import { formatTime } from "@/lib/utils/timeline-utils";
import { ExternalLink, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
    event: TimelineEvent;
    index: number;
}

export function EventCard({ event, index }: EventCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group relative bg-card/50 backdrop-blur-md border border-border p-4 rounded-lg hover:border-primary/50 transition-colors duration-300 w-full md:w-[350px]"
        >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors duration-300 rounded-l-lg" />

            <div className="pl-3 space-y-3">
                {/* Header: Time, Category, Badge */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(event.time)}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/20 text-primary/80">
                        {event.event_category}
                    </Badge>
                </div>

                {/* Headline */}
                <h4 className="text-lg font-bebas tracking-wide leading-tight group-hover:text-primary transition-colors">
                    {event.event_headline}
                </h4>

                {/* Location & Context */}
                {event.location && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.location}</span>
                    </div>
                )}

                {/* Description */}
                <p className="text-sm text-muted-foreground/80 font-manrope leading-relaxed line-clamp-3">
                    {event.brief_description}
                </p>

                {/* Footer: Source */}
                {event.source_url && (
                    <div className="pt-2 border-t border-dashed border-border/50 flex justify-end">
                        <a
                            href={event.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
                        >
                            Source <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

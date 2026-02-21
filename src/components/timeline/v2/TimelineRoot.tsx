"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import { TimelineData } from "@/lib/types/timeline-types";
import { groupTimelineData } from "@/lib/utils/timeline-utils";
import { MonthBackdrop } from "./MonthBackdrop";
import { EventItem } from "./EventItem";

interface TimelineRootProps {
    data: TimelineData;
}

export function TimelineRoot({ data }: TimelineRootProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const x = useMotionValue(0);
    const scrollSpring = useSpring(x, { damping: 50, stiffness: 400, mass: 1 });

    // Group Data
    const groupedData = groupTimelineData(data);
    const allEvents = groupedData.flatMap(m => m.days.flatMap(d => d.events));

    // Lock Body Scroll
    useEffect(() => {
        // Store original values
        const originalStyle = window.getComputedStyle(document.body).overflow;

        // Lock
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.touchAction = "none"; // Prevent mobile scrolling

        return () => {
            // Restore
            document.body.style.overflow = originalStyle;
            document.body.style.position = "";
            document.body.style.width = "";
            document.body.style.height = "";
            document.body.style.touchAction = "";
        };
    }, []);

    useEffect(() => {
        const calculateWidth = () => {
            if (containerRef.current) {
                const totalWidth = containerRef.current.scrollWidth - window.innerWidth;
                setContainerWidth(Math.max(0, totalWidth));
            }
        };

        // Initial calc
        calculateWidth();
        // Recalc after a brief delay to ensure rendering
        setTimeout(calculateWidth, 500);

        window.addEventListener("resize", calculateWidth);
        return () => window.removeEventListener("resize", calculateWidth);
    }, [allEvents]);

    const onWheel = (e: React.WheelEvent) => {
        // Horizontal scroll via vertical wheel
        const delta = e.deltaY;
        const currentX = x.get();
        let newX = currentX - delta;

        // Clamp
        if (newX > 0) newX = 0;
        if (newX < -containerWidth) newX = -containerWidth;

        x.set(newX);
    };

    // Progress Bar Transform
    const progressScale = useTransform(scrollSpring, [0, -containerWidth], [0, 1]);

    return (
        <div
            className="fixed inset-0 z-50 overflow-hidden bg-background flex flex-col"
            onWheel={onWheel}
        >
            {/* Background Layer - Static noise/texture */}
            <div className="absolute inset-0 z-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

            {/* Moving Track */}
            <motion.div
                ref={containerRef}
                style={{ x: scrollSpring }}
                className="flex h-full items-center relative z-10 pl-[50vw] pr-[50vw]" // Center start
            >
                {/* 1. Month Backdrops Layer */}
                <div className="absolute top-0 left-0 h-full w-full pointer-events-none z-0">
                    {/* 
                       Note: Mapping backdrops absolutely is tricky because we need their exact X position.
                       For v2, we can render them IN FLOW but with absolute positioning relative to a parent? 
                       Or just render them as part of the flow. 
                       Let's render them as a separate background layer that moves with the track.
                    */}
                    {groupedData.map((month, idx) => (
                        <div key={month.monthKey} className="absolute top-0 bottom-0 flex items-center justify-center opacity-10 select-none"
                            style={{
                                left: `${idx * 2000}px`, // Approximate spacing
                                width: '2000px'
                            }}>
                            <h1 className="text-[30vw] font-bebas leading-none text-foreground/5 whitespace-nowrap">
                                {month.monthName}
                            </h1>
                        </div>
                    ))}
                </div>

                {/* 2. Central Axis Line - infinite length approximation */}
                <div className="absolute left-0 right-0 top-1/2 h-px bg-border z-0 w-[50000px]" />

                {/* 3. Render Events Iteratively */}
                {allEvents.map((event, idx) => (
                    <EventItem
                        key={event.event_id}
                        event={event}
                        index={idx}
                        position={idx % 2 === 0 ? "top" : "bottom"}
                    />
                ))}
            </motion.div>

            {/* UI: Progress Bar */}
            <div className="fixed bottom-0 left-0 right-0 h-2 bg-muted/20">
                <motion.div
                    style={{ scaleX: progressScale }}
                    className="h-full bg-primary origin-left"
                />
            </div>

            {/* UI: Scrubber / Header Overlay */}
            <div className="fixed bottom-8 left-8 z-50 pointer-events-none mix-blend-difference text-white">
                <h2 className="text-4xl font-bebas">
                    TIMELINE SCROLL
                </h2>
                <p className="text-xs font-mono opacity-70">
                    USE MOUSE WHEEL OR DRAG
                </p>
            </div>
        </div>
    );
}

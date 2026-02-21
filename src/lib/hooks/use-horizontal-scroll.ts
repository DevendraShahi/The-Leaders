"use client";

import { useScroll, useSpring, useTransform, useMotionValue, useVelocity, useAnimationFrame } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export function useHorizontalScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    // We'll map vertical window scroll to horizontal translation
    // OR we can implement a drag/wheel logic.
    // For "Cinematic" feel, hijacking wheel for horizontal is common in these specific experiences.

    const x = useMotionValue(0);
    const springX = useSpring(x, {
        damping: 50,
        stiffness: 400,
        mass: 0.8
    });

    useEffect(() => {
        if (!containerRef.current) return;

        const updateWidth = () => {
            // Total scrollable width = content width - viewport width
            const scrollWidth = containerRef.current?.scrollWidth || 0;
            const clientWidth = containerRef.current?.clientWidth || 0;
            setContainerWidth(scrollWidth - clientWidth);
        };

        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    const handleWheel = (e: React.WheelEvent) => {
        // Determine scroll amount. Multiplier for speed.
        // If shift key held, user is naturally horizontal scrolling
        const delta = e.shiftKey ? e.deltaY : e.deltaY;

        // Update target X
        const newX = x.get() - delta;

        // Clamp
        const clampedX = Math.max(Math.min(newX, 0), -containerWidth);

        x.set(clampedX);
    };

    return { containerRef, x: springX, handleWheel, containerWidth };
}

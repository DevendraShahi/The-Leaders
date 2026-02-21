"use client";

import { motion, MotionValue, useTransform } from "framer-motion";

interface MonthBackdropProps {
    monthName: string;
    year: string;
    x: MotionValue<number>;
    index: number;
}

export function MonthBackdrop({ monthName, year, x, index }: MonthBackdropProps) {
    // Parallax effect: Moves slower than the foreground
    // We need to base this on the month's position roughly
    // For now, simpler parallax: apply a transform based on global x

    const parallaxX = useTransform(x, (latest) => latest * 0.2);

    return (
        <div className="absolute top-0 bottom-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 w-screen left-0"
            style={{ left: `${index * 100}vw` }}
        >
            <motion.h1
                style={{ x: parallaxX }}
                className="text-[15vw] md:text-[20vw] font-bebas text-muted-foreground/5 whitespace-nowrap leading-none tracking-tighter"
            >
                {monthName}
            </motion.h1>
            <div className="absolute top-[60%] left-10 opacity-10">
                <span className="text-[5vw] font-mono tracking-widest text-primary">{year}</span>
            </div>
        </div>
    );
}

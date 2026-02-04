"use client";

import { motion, useScroll } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Timeline } from "@/components/home/timeline";

export default function HistoryPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <div ref={containerRef} className="bg-background min-h-screen relative">
            {/* Global Progress Bar */}
            <motion.div
                style={{ scaleX: scrollYProgress }}
                className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-[100]"
            />

            {/* Hero Section */}
            <section className="h-[70vh] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1572953109213-3be62398eb95?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black z-10" />

                {/* Hero Content */}
                <div className="relative z-20 text-center px-4">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-block py-1 px-4 bg-primary text-black font-bebas tracking-widest uppercase mb-6"
                    >
                        <span className="block">The Archives</span>
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-7xl md:text-9xl font-bebas font-bold text-white uppercase tracking-tighter mb-4 drop-shadow-2xl"
                    >
                        Timeline of <span className="text-primary">Chaos</span>
                    </motion.h1>
                    <p className="max-w-2xl mx-auto text-foreground/80 font-manrope text-lg font-light tracking-wide">
                        From the blood of Kot to the birth of a Republic. The history of Nepal is written in fire.
                    </p>
                </div>
            </section>

            {/* Full Timeline Component */}
            <div className="relative z-20 -mt-20">
                <Timeline />
            </div>
        </div>
    );
}

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

export function Manifesto() {
    const { language } = useLanguage();
    const l = LOCALES.home.manifesto;

    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    return (
        <section ref={ref} className="relative h-[80vh] flex items-center justify-center overflow-hidden">
            {/* Parallax Background */}
            <motion.div
                style={{ y }}
                className="absolute inset-0 z-0"
            >
                <div
                    className="w-full h-[120%] bg-cover bg-center opacity-40 brightness-50"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1544555029-7df9f893f631?q=80&w=2666&auto=format&fit=crop')", // Burning paper / fire embers
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
            </motion.div>

            <div className="container relative z-10 px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                >
                    <h2 className="text-4xl md:text-7xl lg:text-8xl font-bebas font-bold text-foreground uppercase leading-none tracking-tight mb-8">
                        &ldquo;{tString(l.part1, language)} <br className="hidden md:block" />
                        <span className="text-primary mx-2">{tString(l.highlight1, language)}</span> <br />
                        {tString(l.part2, language)}&rdquo;
                    </h2>
                    <p className="text-xl md:text-3xl text-muted-foreground font-bebas tracking-widest uppercase">
                        {tString(l.part3, language)}{" "}
                        <span className="text-foreground border-b-2 border-primary">
                            {tString(l.highlight2, language)}
                        </span>
                        {tString(l.part4, language)}
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

export function Manifesto() {
    const { language } = useLanguage();
    const l = LOCALES.home.manifesto;

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
            <div className="container relative z-10 px-4 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="text-center max-w-4xl"
                >
                    <motion.h2
                        className={`text-3xl md:text-5xl lg:text-6xl font-bebas text-foreground tracking-tight mb-8 drop-shadow-md ${language === "ne" ? "font-semibold leading-[1.2]" : "font-black uppercase leading-[0.94]"
                            }`}
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        &ldquo;{tString(l.part1, language)}
                        <br className="hidden md:block" />
                        <span className="text-primary mx-2">{tString(l.highlight1, language)}</span>
                        <br />
                        {tString(l.part2, language)}&rdquo;
                    </motion.h2>

                    <motion.p
                        className={`mx-auto max-w-3xl text-base md:text-xl text-muted-foreground drop-shadow-sm ${language === "ne" ? "font-sans font-medium leading-[1.55]" : "font-bebas uppercase tracking-[0.08em]"
                            }`}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        {tString(l.part3, language)}{" "}
                        <span className="text-foreground border-b-2 border-primary/80">
                            {tString(l.highlight2, language)}
                        </span>
                        {tString(l.part4, language)}
                    </motion.p>

                    <div className="mx-auto mt-8 flex w-fit items-center gap-2 border border-primary/30 bg-card/40 backdrop-blur-sm px-4 py-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                            {language === "en" ? "Civic Manifesto" : "नागरिक घोषणापत्र"}
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

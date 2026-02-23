"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export function Hero() {
    const { language } = useLanguage();
    const isNepali = language === "ne";

    return (
        <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden border-y border-border/80 bg-background">
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=2576&auto=format&fit=crop')",
                }}
            >
                <div className="absolute inset-0 bg-background/74 dark:bg-background/78" />
            </div>

            <div className="container relative z-10 px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <span className="mb-6 inline-block border border-primary/40 bg-primary/10 px-4 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-primary">
                        <span className="block">{isNepali ? "शक्तिको अभिलेखागार" : "Archive of Power"}</span>
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mb-6 text-foreground drop-shadow-[0_8px_26px_rgba(183,28,28,0.14)]"
                    style={{
                        fontFamily: "var(--font-editorial), serif",
                        fontSize: "clamp(2.25rem, 8vw, 6.8rem)",
                        lineHeight: 1.02,
                        letterSpacing: "-0.015em",
                    }}
                >
                    {isNepali ? (
                        <>
                            <span className="text-primary">The Leaders</span>
                            <br />
                            <span className="text-primary tracking-normal">नेपालको राजनीति</span>
                        </>
                    ) : (
                        <>
                            The Leaders
                            <br />
                            <span className="text-primary tracking-normal">of Nepal</span>
                        </>
                    )}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mx-auto mb-12 max-w-2xl text-base leading-relaxed text-foreground/74 sm:text-lg"
                >
                    {isNepali ? (
                        <>
                            नेपालको आजको रुप दिन साहसिक निर्णय गर्ने नेताहरू, विद्रोहीहरू र योजनाकारहरूको यात्रा एकै ठाउँमा।
                            <span className="text-primary font-medium"> शक्ति। विरासत। मूल्य।</span>
                        </>
                    ) : (
                        <>
                            Discover the visionaries, revolutionaries, and statesmen who shaped the destiny of a nation.
                            <span className="text-primary font-medium"> Power. Legacy. Vision.</span>
                        </>
                    )}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex flex-col items-center justify-center gap-6 sm:flex-row"
                >
                    <Button size="lg" className="h-14 w-full px-10 font-sans text-sm sm:w-auto">
                        <span>{isNepali ? "जीवन यात्रा पढ्नुहोस्" : "Explore Biographies"}</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="group h-14 w-full border-primary/50 bg-background/72 px-10 font-sans text-sm text-primary hover:bg-primary/12 hover:text-primary sm:w-auto"
                    >
                        <span className="flex items-center">
                            {isNepali ? "समयरेखा हेर्नुहोस्" : "View Timeline"}
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1.5" />
                        </span>
                    </Button>
                </motion.div>
            </div>

            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-background/40" />
        </section>
    );
}

"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

export default function TermsPage() {
    const { language } = useLanguage();
    const locale = LOCALES.terms;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <motion.section
                className="relative min-h-[50vh] flex items-center justify-center overflow-hidden border-b border-border/10"
            >
                {/* Minimal Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(183,28,28,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(183,28,28,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="max-w-5xl mx-auto flex flex-col items-center justify-center relative"
                    >
                        {/* Centered "Legal" Label */}
                        <div className="relative mb-6">
                            <div className="border border-[#B71C1C]/30 px-6 py-2 backdrop-blur-sm bg-background/50">
                                <span className="text-[#B71C1C] font-mono text-sm tracking-[0.3em] uppercase">
                                    {tString(locale.hero.label, language)}
                                </span>
                            </div>
                            {/* Decorative Line */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-px h-6 bg-[#B71C1C]/20" />
                        </div>

                        <h1 className="page-title mt-4 text-foreground text-center md:text-8xl">
                            {tString(locale.hero.heading, language)}
                        </h1>

                        <p className="mt-6 font-mono text-sm text-muted-foreground tracking-widest uppercase">
                            {tString(locale.hero.updated, language)}
                        </p>
                    </motion.div>
                </div>
            </motion.section>

            {/* Content */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="space-y-12 text-lg leading-relaxed text-foreground/80"
                    >
                        {locale.sections.map((section, idx) => (
                            <div key={idx} className="space-y-4">
                                <h2 className="section-title text-foreground text-3xl md:text-4xl normal-case tracking-normal">
                                    {tString(section.heading, language)}
                                </h2>
                                <p>{tString(section.body, language)}</p>
                                {/* Terms traditionally don't have lists in our current locale data, 
                                    but keeping this safe check just in case. 
                                    (TS might complain if 'list' doesn't exist on type, but 'any' or loose typing in locale file might allow it.
                                     Actually, checking locale.ts again: terms sections don't have list. 
                                     I will omit list rendering to avoid type error if strict.) 
                                */}
                            </div>
                        ))}

                        {/* Contact */}
                        <div className="pt-12 border-t border-border/20">
                            <p className="text-sm text-muted-foreground">
                                {tString(locale.footer, language)}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

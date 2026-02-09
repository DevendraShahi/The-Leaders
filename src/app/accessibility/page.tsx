"use client";

import { motion } from "framer-motion";
import {
    Eye,
    Keyboard,
    Smartphone,
    Layers,
    CheckCircle2,
    Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

export default function AccessibilityPage() {
    const { language } = useLanguage();
    const locale = LOCALES.accessibility;
    const extra = LOCALES.accessibilityExtra;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section - Restored "Statement" Aesthetic */}
            <motion.section
                className="relative min-h-[50vh] flex items-center justify-center overflow-hidden border-b border-border/10"
            >
                {/* Minimal Grid Background (Restored) */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(183,28,28,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(183,28,28,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="max-w-5xl mx-auto flex flex-col items-center justify-center relative"
                    >
                        {/* Restored "Statement" Label & Decorative Line */}
                        <div className="relative mb-6">
                            <div className="border border-[#B71C1C]/30 px-6 py-2 backdrop-blur-sm bg-background/50">
                                <span className="text-[#B71C1C] font-mono text-sm tracking-[0.3em] uppercase">
                                    {tString(locale.hero.label, language)}
                                </span>
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-px h-6 bg-[#B71C1C]/20" />
                        </div>

                        <h1 className="page-title mt-4 text-foreground text-center md:text-8xl">
                            {tString(locale.hero.heading, language)}
                        </h1>

                        <p className="mt-6 font-mono text-xs text-muted-foreground tracking-widest uppercase">
                            {tString(locale.hero.subheading, language)}
                        </p>
                    </motion.div>
                </div>
            </motion.section>

            {/* Content */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="space-y-20"
                    >
                        {/* General Statement (Restored & Styled) */}
                        <div className="flex flex-col md:flex-row gap-8 items-start border-l-2 border-primary/20 pl-6 md:pl-10">
                            <div className="space-y-4 max-w-2xl">
                                <h2 className="section-title text-foreground">
                                    {tString(locale.commitment.heading, language)}
                                </h2>
                                <p className="text-lg leading-relaxed text-muted-foreground font-manrope">
                                    {tString(locale.commitment.body, language)}
                                </p>
                            </div>
                        </div>

                        {/* Feature Grid (Integrated with Editorial Style) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 my-16 py-12 border-y border-border/10">
                            {locale.features.map((feature, index) => (
                                <motion.div
                                    key={feature.title.en}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group"
                                >
                                    <div className="h-10 w-10 text-primary mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                                        {index === 0 && <Eye strokeWidth={1.5} />}
                                        {index === 1 && <Keyboard strokeWidth={1.5} />}
                                        {index === 2 && <Smartphone strokeWidth={1.5} />}
                                        {index === 3 && <Layers strokeWidth={1.5} />}
                                    </div>
                                    <h3 className="font-bebas text-xl tracking-wide mb-2 text-foreground">
                                        {tString(feature.title, language)}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed font-manrope">
                                        {tString(feature.description, language)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Conformance Status */}
                        <div className="grid md:grid-cols-[1fr_2fr] gap-8">
                            <div>
                                <h2 className="section-title text-foreground mb-4">
                                    {tString(extra.conformance.heading, language)}
                                </h2>
                                <div className="inline-flex items-center gap-2 text-green-600 bg-green-500/5 px-3 py-1 rounded-full text-sm font-bold border border-green-500/10">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {tString(extra.conformance.badgeLabel, language)}
                                </div>
                            </div>
                            <div className="space-y-4 text-muted-foreground font-manrope leading-relaxed">
                                <p>{tString(extra.conformance.p1, language)}</p>
                                <p>{tString(extra.conformance.p2, language)}</p>
                            </div>
                        </div>

                        {/* Technical Specs & Feedback */}
                        <div className="grid md:grid-cols-2 gap-12 pt-12 border-t border-border/10">
                            <div className="space-y-6">
                                <h2 className="section-title text-foreground text-3xl md:text-4xl">
                                    {tString(extra.technical.heading, language)}
                                </h2>
                                <p className="text-muted-foreground font-manrope">
                                    {tString(extra.technical.body, language)}
                                </p>
                                <ul className="flex flex-wrap gap-2">
                                    {extra.technical.techList.map((tech) => (
                                        <li key={tech.en} className="px-3 py-1 bg-secondary/30 text-secondary-foreground text-sm font-mono border border-border rounded">
                                            {tString(tech, language)}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-6 bg-secondary/5 p-8 rounded-lg border border-border/50">
                                <h2 className="section-title text-foreground text-3xl md:text-4xl">
                                    {tString(extra.feedback.heading, language)}
                                </h2>
                                <p className="text-muted-foreground font-manrope">
                                    {tString(extra.feedback.body, language)}
                                </p>

                                <Button className="w-full sm:w-auto font-bebas tracking-wider" asChild>
                                    <a href="mailto:theleadersnp@gmail.com" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        {tString(extra.feedback.buttonLabel, language)}
                                    </a>
                                </Button>
                                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-4">
                                    {tString(extra.feedback.responseTime, language)}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

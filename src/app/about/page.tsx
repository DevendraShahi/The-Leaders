"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, MessageSquare, Award, Sparkles, Archive, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimatedLogoText } from "@/components/ui/animated-text";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

// Metadata is set in layout.tsx for client components

export default function AboutPage() {
    const { language } = useLanguage();
    const aboutLocale = LOCALES.about;

    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <motion.section
                style={{ opacity, scale }}
                className="relative min-h-[70vh] flex items-center justify-center overflow-hidden border-b border-border/10"
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
                        {/* Centered "About" Label - Absolute or tightly centered */}
                        <div className="relative mb-6">
                            <div className="border border-[#B71C1C]/30 px-6 py-2 backdrop-blur-sm bg-background/50">
                                <span className="text-[#B71C1C] font-mono text-sm tracking-[0.3em] uppercase">
                                    {tString(aboutLocale.hero.label, language)}
                                </span>
                            </div>
                            {/* Decorative Line connecting label to text */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-px h-6 bg-[#B71C1C]/20" />
                        </div>

                        {/* Main Visual */}
                        <motion.div
                            className="w-full flex justify-center py-4"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                        >
                            <AnimatedLogoText
                                text={tString(aboutLocale.hero.logoText, language)}
                                language={language}
                                className={`text-5xl md:text-7xl lg:text-8xl [font-family:var(--font-bebas)] text-foreground drop-shadow-[0_12px_28px_rgba(0,0,0,0.24)] ${language === "ne"
                                    ? "font-semibold tracking-normal leading-[1.18]"
                                    : "font-black uppercase tracking-[-0.015em] leading-[0.9]"
                                    }`}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                            className="h-[2px] w-28 origin-center bg-[#B71C1C]/70"
                        />

                        <p className={`mt-8 text-2xl md:text-3xl [font-family:var(--font-bebas)] text-[#B71C1C] text-center ${language === "ne" ? "font-semibold tracking-normal leading-[1.35]" : "font-black tracking-[0.02em]"}`}>
                            {tString(aboutLocale.hero.tagline, language)}
                        </p>

                        <p className="page-subtitle mt-8 max-w-3xl mx-auto text-center">
                            {tString(aboutLocale.hero.paragraph, language)}
                        </p>
                    </motion.div>
                </div>
            </motion.section>

            {/* Welcome Statement */}
            <section className="py-24 border-b border-border/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-[1px] bg-[#B71C1C]" />
                                <h2 className="text-sm font-mono tracking-[0.3em] uppercase text-muted-foreground">
                                    {tString(aboutLocale.welcomeBlock.sectionLabel, language)}
                                </h2>
                            </div>

                            <div className="space-y-6 text-foreground/80 text-lg leading-relaxed">
                                <p className="section-title text-foreground text-3xl leading-tight md:text-4xl">
                                    {tString(aboutLocale.welcomeBlock.p1, language)}
                                </p>
                                <p>
                                    {tString(aboutLocale.welcomeBlock.p2, language)}
                                </p>
                                <p>
                                    {tString(aboutLocale.welcomeBlock.p3, language)}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Philosophy */}
            <section className="py-24 border-b border-border/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="section-title text-foreground mb-4 md:text-6xl">
                                {tString(aboutLocale.philosophy.heading, language)}
                            </h2>
                            <p className="text-muted-foreground font-mono text-sm tracking-wider">
                                {tString(aboutLocale.philosophy.subheading, language)}
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-px bg-foreground/5">
                            {aboutLocale.philosophy.values.map((value, index) => (
                                <motion.div
                                    key={value.title.en}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="bg-background p-8 md:p-12 group hover:bg-[#B71C1C]/5 transition-colors duration-300"
                                >
                                    {index === 0 && (
                                        <Shield
                                            className="w-12 h-12 text-[#B71C1C] mb-6 group-hover:scale-110 transition-transform"
                                            strokeWidth={1.5}
                                        />
                                    )}
                                    {index === 1 && (
                                        <MessageSquare
                                            className="w-12 h-12 text-[#B71C1C] mb-6 group-hover:scale-110 transition-transform"
                                            strokeWidth={1.5}
                                        />
                                    )}
                                    {index === 2 && (
                                        <Archive
                                            className="w-12 h-12 text-[#B71C1C] mb-6 group-hover:scale-110 transition-transform"
                                            strokeWidth={1.5}
                                        />
                                    )}
                                    {index === 3 && (
                                        <Lightbulb
                                            className="w-12 h-12 text-[#B71C1C] mb-6 group-hover:scale-110 transition-transform"
                                            strokeWidth={1.5}
                                        />
                                    )}
                                    <h3 className="text-2xl font-bebas text-foreground uppercase mb-3 tracking-wide">
                                        {tString(value.title, language)}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {tString(value.description, language)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Why We Stand Out */}
            <section className="py-24 border-b border-border/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="section-title text-foreground mb-4 md:text-6xl">
                                {tString(aboutLocale.differentiators.heading, language)}
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                {tString(aboutLocale.differentiators.subheading, language)}
                            </p>
                        </motion.div>

                        <div className="space-y-12">
                            {aboutLocale.differentiators.items.map((item, index) => (
                                <motion.div
                                    key={item.title.en}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex gap-6 md:gap-8 group"
                                >
                                    <div className="flex-shrink-0">
                                        <span className="text-5xl md:text-6xl font-mono text-[#B71C1C]/30 group-hover:text-[#B71C1C] transition-colors">
                                            {tString(item.number, language)}
                                        </span>
                                    </div>
                                    <div className="flex-1 pt-3">
                                        <h3 className="text-2xl md:text-3xl font-bebas text-foreground uppercase mb-3 tracking-wide">
                                            {tString(item.title, language)}
                                        </h3>
                                        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                                            {tString(item.description, language)}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Commitment */}
            <section className="py-24 border-b border-border/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="space-y-8 text-center"
                        >
                            <Award className="w-16 h-16 text-[#B71C1C] mx-auto" strokeWidth={1.5} />
                            <h2 className="section-title text-foreground md:text-5xl">
                                {tString(aboutLocale.commitment.heading, language)}
                            </h2>
                            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                                <p>{tString(aboutLocale.commitment.p1, language)}</p>
                                <p>{tString(aboutLocale.commitment.p2, language)}</p>
                                <p>{tString(aboutLocale.commitment.p3, language)}</p>
                                <div className="pt-8 flex items-center justify-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#B71C1C]" />
                                    <p className="text-[#B71C1C] font-mono text-sm tracking-widest uppercase">
                                        {tString(aboutLocale.commitment.tagline, language)}
                                    </p>
                                    <Sparkles className="w-5 h-5 text-[#B71C1C]" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center space-y-8"
                    >
                        <h2 className="section-title text-foreground leading-tight md:text-6xl">
                            {tString(aboutLocale.cta.heading, language)
                                .split("\n")
                                .map((line, idx) => (
                                    <span key={idx} className={idx > 0 ? "block" : undefined}>
                                        {line}
                                    </span>
                                ))}
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            {tString(aboutLocale.cta.body, language)}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                            <Link href="/leaders">
                                <Button size="lg">
                                    {tString(aboutLocale.cta.buttonLeaders, language)}
                                </Button>
                            </Link>
                            <Link href="/election-2026">
                                <Button size="lg" variant="outline">
                                    {tString(aboutLocale.cta.buttonElection, language)}
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

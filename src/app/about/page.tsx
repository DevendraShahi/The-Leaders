"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, BookOpen, MessageSquare, Database, Award, Sparkles, Archive, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimatedLogoText } from "@/components/ui/animated-text";

// Metadata is set in layout.tsx for client components

const VALUES = [
    {
        icon: Shield,
        title: "Truth is Our North Star",
        description: "We believe in the facts. We stick to the laws. We don't cut corners, and we don't sugarcoat. Absolute integrity is our foundation.",
    },
    {
        icon: MessageSquare,
        title: "Expression Without Imposition",
        description: "We have thoughts—plenty of them. We express them boldly, but we never demand agreement. Every archive entry is an invitation to conversation.",
    },
    {
        icon: Archive,
        title: "The Archive of Interest",
        description: "A curated repository for political discourse and historical significance. We host the 'right' information to foster informed democratic participation.",
    },
    {
        icon: Lightbulb,
        title: "Forged in Debate",
        description: "The best ideas emerge from friction. We believe every data point is a starting point for dialogue, not a decree.",
    },
];

const DIFFERENTIATORS = [
    {
        number: "01",
        title: "Grand Central Station for Political Information",
        description: "A central hub where the past is archived, the present is debated, and the future is informed. We're the definitive digital archive for those who value depth and history.",
    },
    {
        number: "02",
        title: "Clean & Uniform",
        description: "We cut through digital noise with a minimalist, 'Newspaper' aesthetic that lets the content breathe. Clarity over clutter, always.",
    },
    {
        number: "03",
        title: "Meaningful Motion",
        description: "Smooth animations and transitions that make exploring complex political landscapes feel as fluid as a conversation. Form follows function.",
    },
    {
        number: "04",
        title: "Confidential by Nature",
        description: "We keep internal operations quiet to protect independence. By maintaining professional distance, we keep focus entirely on the data and dialogue.",
    },
];

export default function AboutPage() {
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
                                    About
                                </span>
                            </div>
                            {/* Decorative Line connecting label to text */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-px h-6 bg-[#B71C1C]/20" />
                        </div>

                        {/* Main Visual */}
                        <div className="w-full flex justify-center py-4">
                            <AnimatedLogoText
                                text="THE LEADERS"
                                className="text-7xl md:text-8xl lg:text-9xl font-bebas text-foreground uppercase tracking-tighter leading-[0.9]"
                            />
                        </div>

                        <p className="mt-8 text-3xl md:text-4xl font-bebas text-[#B71C1C] tracking-wide text-center">
                            Truth, Unfiltered.
                        </p>

                        <p className="mt-8 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center">
                            A digital vault for the curious, the skeptical, and the visionary. The definitive archive where the past is preserved, the present is debated, and the future is informed.
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
                                <h2 className="text-sm font-mono tracking-[0.3em] uppercase text-muted-foreground">Welcome</h2>
                            </div>

                            <div className="space-y-6 text-foreground/80 text-lg leading-relaxed">
                                <p className="text-2xl md:text-3xl font-bebas text-foreground leading-tight">
                                    We aren't here to tell you what to think; we're here to provide the architectural blueprints for you to build your own perspective.
                                </p>
                                <p>
                                    In an era of fleeting headlines and fragmented truths, <span className="text-[#B71C1C] font-bebas text-xl">The Leaders</span> stands as the <strong>Grand Central Station for political information</strong>—a central hub where depth meets history, and where well-reasoned debate is not just welcomed, but celebrated.
                                </p>
                                <p>
                                    We serve as a digital vault for those who refuse to accept information at face value. For the curious. For the skeptical. For the visionary who knows that true understanding is built on a foundation of facts, context, and rigorous inquiry.
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
                            <h2 className="text-5xl md:text-6xl font-bebas text-foreground uppercase mb-4">Our Philosophy</h2>
                            <p className="text-muted-foreground font-mono text-sm tracking-wider">How we operate</p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-px bg-foreground/5">
                            {VALUES.map((value, index) => (
                                <motion.div
                                    key={value.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="bg-background p-8 md:p-12 group hover:bg-[#B71C1C]/5 transition-colors duration-300"
                                >
                                    <value.icon className="w-12 h-12 text-[#B71C1C] mb-6 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                                    <h3 className="text-2xl font-bebas text-foreground uppercase mb-3 tracking-wide">{value.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
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
                            <h2 className="text-5xl md:text-6xl font-bebas text-foreground uppercase mb-4">Why We Stand Out</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                We've mastered the art of being serious about information while staying playful and engaging in its delivery.
                            </p>
                        </motion.div>

                        <div className="space-y-12">
                            {DIFFERENTIATORS.map((item, index) => (
                                <motion.div
                                    key={item.number}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex gap-6 md:gap-8 group"
                                >
                                    <div className="flex-shrink-0">
                                        <span className="text-5xl md:text-6xl font-mono text-[#B71C1C]/30 group-hover:text-[#B71C1C] transition-colors">
                                            {item.number}
                                        </span>
                                    </div>
                                    <div className="flex-1 pt-3">
                                        <h3 className="text-2xl md:text-3xl font-bebas text-foreground uppercase mb-3 tracking-wide">
                                            {item.title}
                                        </h3>
                                        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                                            {item.description}
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
                            <h2 className="text-4xl md:text-5xl font-bebas text-foreground uppercase">Our Commitment</h2>
                            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                                <p>
                                    We remain dedicated to maintaining this platform as a <strong className="text-foreground">transparent, credible, and accessible</strong> resource for all citizens interested in Nepal's political journey.
                                </p>
                                <p>
                                    While we keep certain operational details confidential to protect our independence, our content and methodologies are always open to scrutiny and feedback.
                                </p>
                                <p>
                                    We exist to preserve history, document the present, and provide the tools for true civic engagement.
                                </p>
                                <div className="pt-8 flex items-center justify-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#B71C1C]" />
                                    <p className="text-[#B71C1C] font-mono text-sm tracking-widest uppercase">
                                        Truth. Transparency. Democracy.
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
                        <h2 className="text-5xl md:text-6xl font-bebas text-foreground uppercase leading-tight">
                            Lead the Conversation.
                            <br />
                            Join the Archive.
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Dive into our comprehensive archive of leaders, election data, and political insights.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                            <Link href="/leaders">
                                <Button size="lg">
                                    Discover Leaders
                                </Button>
                            </Link>
                            <Link href="/election-2026">
                                <Button size="lg" variant="outline">
                                    Explore Election Data
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

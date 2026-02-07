"use client";

import { motion } from "framer-motion";
import { ArrowRight, Trophy, BarChart3, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ElectionSpecial() {
    return (
        <section className="relative overflow-hidden bg-background py-24 border-y border-border">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-background to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <div className="inline-block border border-[#B71C1C]/30 px-4 py-1.5 bg-[#B71C1C]/5">
                                <span className="font-mono text-xs tracking-[0.2em] uppercase text-[#B71C1C]">
                                    Special Coverage
                                </span>
                            </div>
                            <h2 className="font-bebas text-5xl md:text-7xl leading-[0.9] tracking-tight uppercase">
                                Road to <span className="text-[#B71C1C]">Election 2026</span>
                            </h2>
                            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-serif">
                                Follow every moment of Nepal&apos;s most pivotal general election. From candidate filings to live results, access definitive data and expert analysis.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            {[
                                {
                                    icon: BarChart3,
                                    title: "Live Dashboard",
                                    desc: "Real-time tracking of seat projections and turnout across all 7 provinces."
                                },
                                {
                                    icon: Users,
                                    title: "Candidate Profiles",
                                    desc: "Comprehensive biographies and histories of over 3,000 candidates."
                                },
                                {
                                    icon: Trophy,
                                    title: "Historical Data",
                                    desc: "Compare 2026 trends with 2022 and 2017 election results."
                                }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + (i * 0.1), duration: 0.5 }}
                                    className="flex gap-4 group"
                                >
                                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center border border-border bg-background group-hover:border-[#B71C1C]/50 transition-colors">
                                        <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-[#B71C1C] transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="font-bebas text-xl uppercase tracking-wide group-hover:text-[#B71C1C] transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {item.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <Link href="/election-2026">
                                <Button size="lg" className="rounded-none font-mono tracking-wider uppercase bg-[#B71C1C] hover:bg-[#B71C1C]/90 text-white px-8">
                                    Visit Grand Central
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right: Visual/Image Placeholder */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] md:aspect-square relative border border-border bg-muted/10 p-4">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#B71C1C]" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#B71C1C]" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#B71C1C]" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#B71C1C]" />

                            {/* Inner Container for Map or Screenshot */}
                            <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative group">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540910419868-474947cebacb?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                                <div className="relative z-10 text-center p-8 bg-black/60 backdrop-blur-sm border border-white/10 max-w-sm mx-auto">
                                    <span className="block text-[#B71C1C] font-mono text-xs uppercase tracking-[0.2em] mb-2">Live Access</span>
                                    <h3 className="text-white font-bebas text-4xl uppercase mb-4">Election Command Center</h3>
                                    <p className="text-white/60 text-sm mb-6">
                                        The most advanced election tracking platform in Nepal.
                                    </p>
                                    <div className="flex justify-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-xs text-red-400 font-mono uppercase">Live Updates Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Background Splashes */}
                        <div className="absolute -z-10 top-1/2 -right-12 w-64 h-64 bg-[#B71C1C]/10 rounded-full blur-3xl opacity-50" />
                        <div className="absolute -z-10 bottom-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl opacity-30" />
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

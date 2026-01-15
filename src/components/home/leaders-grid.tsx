"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

const leaders = [
    {
        name: "Narayan Gopal",
        role: "The Voice",
        desc: "He sang the soul of a nation. His voice was the revolution of the heart.",
        image: "https://i.scdn.co/image/ab6761610000e5ebfdceaf9ed3123fed34e4f12e"
    },
    {
        name: "Bishweshwar P. Koirala",
        role: "The Democratic Spirit",
        desc: "Fought for freedom with a pen in one hand and conviction in the other.",
        image: "/img/Leaders/BP_Koirala.jpg"
    },
    {
        name: "Pasang Lhamu",
        role: "The Summit Breaker",
        desc: "She conquered the roof of the world and shattered the glass ceiling.",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop"
    },
];

export function LeadersGrid() {
    return (
        <section className="py-32 bg-background relative overflow-hidden">
            {/* Background Grime */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-background to-background pointer-events-none" />

            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-20 text-center"
                >
                    <h2 className="text-6xl md:text-8xl font-bebas font-bold text-foreground mb-4 uppercase tracking-tighter">
                        The <span className="text-primary">Pacts</span>
                    </h2>
                    <p className="max-w-xl mx-auto text-muted-foreground text-lg font-manrope font-light tracking-wide">
                        Legends bound by history. Their actions echoed through time.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {leaders.map((leader, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="group relative bg-card border border-border hover:border-primary/50 transition-all duration-500"
                        >
                            {/* Image Container */}
                            <div className="relative h-[550px] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 bg-zinc-900">
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-900/40 to-transparent z-10 opacity-90 transition-opacity duration-500" />
                                <Image
                                    src={leader.image}
                                    alt={leader.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                />

                                {/* Overlay Content */}
                                <div className="absolute bottom-0 left-0 right-0 z-20 p-6 flex flex-col justify-end">
                                    <div className="transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                                        <span className="block text-primary font-bebas text-lg tracking-widest mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            {leader.role}
                                        </span>
                                        <h3 className="text-5xl font-bebas text-white uppercase tracking-tighter leading-none mb-3 group-hover:text-primary transition-colors duration-300">
                                            {leader.name}
                                        </h3>

                                        {/* Description Reveal */}
                                        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                                            <div className="overflow-hidden">
                                                <div className="border-l-2 border-primary pl-4 mb-4 pt-1">
                                                    <p className="text-zinc-300 font-manrope text-base leading-relaxed">
                                                        {leader.desc}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" className="p-0 h-auto text-white hover:text-primary transition-colors font-bebas text-lg uppercase tracking-wider flex items-center gap-2 mb-2">
                                                    Read Full Profile <ArrowUpRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Corner Accents */}
                                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/0 group-hover:border-primary transition-all duration-500" />
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/0 group-hover:border-primary transition-all duration-500" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <Button variant="outline" size="lg" className="h-14 px-12 text-xl font-bebas tracking-wide text-foreground border-foreground/20 hover:bg-foreground hover:text-background rounded-none transition-all uppercase">
                        View All Leaders
                    </Button>
                </div>
            </div>
        </section>
    );
}

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import historyData from "@/data/history.json";

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
                    <p className="max-w-2xl mx-auto text-zinc-400 font-manrope text-lg font-light tracking-wide">
                        From the blood of Kot to the birth of a Republic. The history of Nepal is written in fire.
                    </p>
                </div>
            </section>

            {/* Timeline Sections */}
            <div className="relative pb-40">
                {/* Central Vein Line */}
                <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-[2px] bg-border md:-translate-x-1/2 z-0">
                    <motion.div
                        style={{ scaleY: scrollYProgress }}
                        className="absolute top-0 w-full bg-gradient-to-b from-primary via-primary to-transparent origin-top h-full shadow-[0_0_15px_rgba(229,9,20,0.5)]"
                    />
                </div>

                {historyData.map((era, eraIndex) => (
                    <div key={eraIndex} className="relative z-10 mb-32">
                        {/* Sticky Era Header */}
                        <div className="sticky top-20 z-30 flex justify-center mb-16 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="bg-background/90 backdrop-blur-md border px-8 py-3 border-primary/50 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                            >
                                <div className="text-center">
                                    <h2 className="text-3xl md:text-5xl font-bebas text-foreground uppercase tracking-wide">{era.era}</h2>
                                    <span className="text-primary font-bebas tracking-widest">{era.period}</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Events */}
                        <div className="container mx-auto px-4">
                            {era.events.map((event, index) => (
                                <div key={index} className={`flex flex-col md:flex-row items-center gap-8 mb-24 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>

                                    {/* Card Side */}
                                    <motion.div
                                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ margin: "-100px", once: true }}
                                        transition={{ duration: 0.6 }}
                                        className="w-full md:w-1/2"
                                    >
                                        <div className={`relative group bg-card border border-border p-6 hover:border-primary/50 transition-colors duration-500 ${index % 2 === 0 ? "text-right" : "text-left"}`}>
                                            {/* Image */}
                                            <div className="relative h-64 w-full mb-6 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                                                <Image
                                                    src={event.image}
                                                    alt={event.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80" />
                                            </div>

                                            <span className="text-primary font-bebas text-5xl tracking-tighter block mb-2">{event.year}</span>
                                            <h3 className="text-3xl text-foreground font-bebas uppercase tracking-wide mb-3 group-hover:text-primary transition-colors">{event.title}</h3>
                                            <p className="text-muted-foreground font-manrope leading-relaxed">{event.desc}</p>

                                            {/* Corner Accents */}
                                            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/0 group-hover:border-primary transition-all duration-300" />
                                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/0 group-hover:border-primary transition-all duration-300" />
                                        </div>
                                    </motion.div>

                                    {/* Center Node */}
                                    <div className="relative md:absolute left-[20px] md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-4 h-4 z-20 hidden md:flex">
                                        <div className="w-4 h-4 bg-background border-2 border-primary rotate-45 transform group-hover:scale-125 transition-transform" />
                                    </div>

                                    {/* Empty Side for Balance */}
                                    <div className="hidden md:block w-1/2" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

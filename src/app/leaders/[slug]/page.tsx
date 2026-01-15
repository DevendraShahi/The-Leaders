"use client";

import { useParams, notFound } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Award, Users } from "lucide-react";
import leadersData from "@/data/leaders.json";

export default function LeaderProfile() {
    const params = useParams();
    const leader = leadersData.find((l) => l.slug === params.slug);

    if (!leader) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center">
                <h1 className="text-6xl font-bebas text-primary mb-4">404 - File Not Found</h1>
                <p className="text-zinc-500 mb-8 font-manrope">The requested dossier does not exist or has been redacted.</p>
                <Link href="/leaders">
                    <Button variant="outline" className="font-bebas text-xl">Return to Roster</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative h-screen w-full overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30 z-10" />
                    <Image
                        src={leader.cover || leader.image}
                        alt={leader.name}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 z-20 pb-20 pt-32 bg-gradient-to-t from-black via-black/90 to-transparent">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Link href="/leaders" className="inline-flex items-center text-white/60 hover:text-primary transition-colors mb-6 font-bebas text-xl tracking-wide group">
                                <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Files
                            </Link>

                            <span className="block text-primary font-bebas text-3xl md:text-4xl tracking-[0.2em] mb-2 uppercase drop-shadow-lg">
                                {leader.role}
                            </span>
                            <h1 className="text-7xl md:text-9xl font-bebas font-bold text-white uppercase tracking-tighter leading-none mb-8 drop-shadow-2xl">
                                {leader.name}
                            </h1>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl border-t border-white/10 pt-8">
                                <div>
                                    <span className="block text-zinc-500 font-bebas text-sm tracking-widest uppercase mb-1">Status</span>
                                    <span className="text-2xl text-white font-bebas tracking-wide">{leader.status}</span>
                                </div>
                                <div>
                                    <span className="block text-zinc-500 font-bebas text-sm tracking-widest uppercase mb-1">Era</span>
                                    <span className="text-2xl text-white font-bebas tracking-wide">{leader.years}</span>
                                </div>
                                <div>
                                    <span className="block text-zinc-500 font-bebas text-sm tracking-widest uppercase mb-1">Affiliation</span>
                                    <span className="text-2xl text-white font-bebas tracking-wide">{leader.party}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <section className="container mx-auto px-4 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* Left Column: Bio & Stats */}
                    <div className="lg:col-span-7 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-bebas text-primary mb-6 flex items-center gap-4">
                                <span className="w-8 h-[2px] bg-primary"></span>
                                The Story
                            </h2>
                            <p className="text-lg md:text-xl text-foreground font-manrope leading-relaxed">
                                {leader.bio}
                            </p>
                        </motion.div>

                        {/* Key Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {Object.entries(leader.stats).map(([key, value], index) => (
                                <div key={key} className="bg-card border border-border p-6 hover:border-primary/30 transition-colors">
                                    <div>
                                        <span className="block text-muted-foreground font-bebas text-sm tracking-widest uppercase mb-2">{key.replace('_', ' ')}</span>
                                        <span className="block text-4xl font-bebas text-foreground tracking-wide">{value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Timeline */}
                    <div className="lg:col-span-5">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-card border border-border p-8 relative overflow-hidden"
                        >
                            {/* Decorative Noise */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                            <h3 className="text-3xl font-bebas text-foreground mb-8 border-b border-border pb-4">
                                Path to Power
                            </h3>

                            <div className="space-y-8 relative">
                                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-white/10" />

                                {leader.timeline.map((item, index) => (
                                    <div key={index} className="relative pl-8">
                                        <span className="absolute left-0 top-1.5 w-4 h-4 bg-black border-2 border-primary rounded-full z-10" />
                                        <span className="block text-primary font-bebas text-xl tracking-widest mb-1">{item.year}</span>
                                        <p className="text-muted-foreground font-manrope">{item.event}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                </div>
            </section >
        </div >
    );
}

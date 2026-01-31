"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpRight } from "lucide-react";
import { ILeader } from "@/models/Leader";

// Helper to get localized string (defaulting to 'en')
const getLoc = (field: string | { en: string; ne: string } | undefined | null) => {
    if (!field) return "";
    if (typeof field === 'string') return field;
    return field.en || field.ne || "";
};

interface LeadersListProps {
    leaders: ILeader[];
}

export default function LeadersList({ leaders }: LeadersListProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredLeaders = leaders.filter((leader) => {
        const name = getLoc(leader.name).toLowerCase();
        const role = getLoc(leader.position).toLowerCase(); // Mapped 'position' to 'role' conceptually
        const term = searchTerm.toLowerCase();
        return name.includes(term) || role.includes(term);
    });

    return (
        <div className="min-h-screen bg-background pt-24 pb-20">
            {/* Header Section */}
            <section className="container mx-auto px-4 mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    <span className="inline-block py-1 px-4 bg-primary text-black font-bebas tracking-widest uppercase mb-6">
                        <span className="block">Classified Files</span>
                    </span>
                    <h1 className="text-7xl md:text-9xl font-bebas font-bold text-foreground uppercase tracking-tighter mb-8 leading-[0.85] drop-shadow-2xl">
                        The <span className="text-primary">Roster</span>
                    </h1>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <Input
                            type="text"
                            placeholder="SEARCH THE SHADOWS..."
                            className="h-16 pl-14 bg-muted/50 border-primary/20 text-foreground placeholder:text-muted-foreground font-bebas text-2xl tracking-widest focus-visible:ring-primary uppercase rounded-none transition-all focus:bg-muted"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-primary transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                    </div>
                </motion.div>
            </section>


            {/* Grid Section */}
            <section className="container mx-auto px-4">
                {filteredLeaders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredLeaders.map((leader, index) => (
                            <motion.div
                                key={leader._id || leader.slug}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group relative h-[500px] overflow-hidden border border-border hover:border-primary/50 transition-colors bg-card"
                            >
                                <Link href={`/leaders/${leader.slug}`} className="block h-full w-full">
                                    {/* Image */}
                                    <div className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-700">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-900/60 to-transparent z-10 opacity-90 transition-opacity duration-500" />
                                        <Image
                                            src={leader.image || '/placeholder-leader.jpg'}
                                            alt={getLoc(leader.name)}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 z-20 p-6 flex flex-col justify-end">
                                        <div className="transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="block text-primary font-bebas text-lg tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                                                    {getLoc(leader.position)}
                                                </span>
                                                <span className="text-muted-foreground font-bebas text-sm border border-border px-2 py-0.5 rounded-none">{getLoc(leader.years)}</span>
                                            </div>
                                            <h3 className="text-5xl font-bebas text-white uppercase tracking-tighter leading-none mb-4 group-hover:text-primary transition-colors">
                                                {getLoc(leader.name)}
                                            </h3>

                                            <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300">
                                                <p className="text-zinc-400 font-manrope text-sm leading-relaxed mb-4 line-clamp-2">
                                                    {getLoc(leader.desc)}
                                                </p>
                                                <div className="flex items-center text-white font-bebas tracking-wider text-xl group-hover:translate-x-2 transition-transform">
                                                    Open File <ArrowUpRight className="ml-2 w-5 h-5 text-primary" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Accents */}
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/0 group-hover:border-primary transition-all duration-500" />
                                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/0 group-hover:border-primary transition-all duration-500" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <h3 className="text-4xl font-bebas text-muted-foreground uppercase">No Records Found</h3>
                        <p className="text-muted-foreground font-manrope">The archives are silent.</p>
                    </div>
                )}
            </section>
        </div>
    );
}

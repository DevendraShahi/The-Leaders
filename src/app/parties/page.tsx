"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const PARTIES = [
    {
        name: "Nepali Congress",
        acronym: "NC",
        color: "#2E7D32", // Example brand color
        founded: "1946",
        ideology: "Social Democracy",
        description: "The oldest political party in Nepal, historically leading major democratic movements."
    },
    {
        name: "CPN (UML)",
        acronym: "UML",
        color: "#D32F2F",
        founded: "1991",
        ideology: "People's Multiparty Democracy",
        description: "A major communist party advocating for nationalism and social welfare."
    },
    {
        name: "CPN (Maoist Centre)",
        acronym: "MC",
        color: "#C62828",
        founded: "1994",
        ideology: "Marxism–Leninism–Maoism",
        description: "Led the People's War and played a key role in establishing the republic."
    },
    {
        name: "Rastriya Swatantra Party",
        acronym: "RSP",
        color: "#1976D2",
        founded: "2022",
        ideology: "Constitutionalism, Good Governance",
        description: "An emerging political force focusing on anti-corruption and governance reform."
    },
    {
        name: "Rastriya Prajatantra Party",
        acronym: "RPP",
        color: "#FBC02D",
        founded: "1990",
        ideology: "Hindu Constitutional Monarchism",
        description: "A conservative party advocating for traditional values and national identity."
    },
    {
        name: "Janamat Party",
        acronym: "JP",
        color: "#E64A19",
        founded: "2019",
        ideology: "Social Justice, Regionalism",
        description: "Focuses on agrarian issues and rights of the Madhesi community."
    }
];

export default function PartiesPage() {
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
                        {/* Centered "Entities" Label */}
                        <div className="relative mb-6">
                            <div className="border border-[#B71C1C]/30 px-6 py-2 backdrop-blur-sm bg-background/50">
                                <span className="text-[#B71C1C] font-mono text-sm tracking-[0.3em] uppercase">
                                    Entities
                                </span>
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-px h-6 bg-[#B71C1C]/20" />
                        </div>

                        <h1 className="mt-4 text-6xl md:text-8xl font-bebas text-foreground uppercase tracking-tighter leading-none text-center">
                            Political Parties
                        </h1>

                        <p className="mt-6 text-xl text-muted-foreground max-w-2xl text-center">
                            The organizations shaping the political landscape of Nepal.
                        </p>
                    </motion.div>
                </div>
            </motion.section>

            {/* Parties Grid */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PARTIES.map((party, index) => (
                            <motion.div
                                key={party.acronym}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="group relative bg-card border border-border p-8 hover:border-primary/50 transition-all duration-300 overflow-hidden"
                            >
                                {/* Hover Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div
                                            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold font-bebas shadow-lg"
                                            style={{ backgroundColor: party.color }}
                                        >
                                            {party.acronym}
                                        </div>
                                        <ArrowUpRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>

                                    <h3 className="text-3xl font-bebas text-foreground mb-2 group-hover:text-primary transition-colors relative inline-block">
                                        {party.name}
                                    </h3>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="text-xs font-mono py-1 px-2 border border-border rounded bg-background/50 text-muted-foreground">
                                            Founded: {party.founded}
                                        </span>
                                    </div>

                                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                        {party.description}
                                    </p>

                                    <div className="pt-4 border-t border-border/50">
                                        <span className="text-xs font-mono uppercase tracking-wider text-primary">
                                            {party.ideology}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

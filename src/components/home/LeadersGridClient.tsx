"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

interface Leader {
    _id?: string;
    slug: string; // Assuming slug is always present, if not, make it optional too
    name: { en: string; ne: string } | string;
    position?: { en: string; ne: string } | string;
    desc?: { en: string; ne: string } | string;
    image?: string;
}

interface LeadersGridClientProps {
    leaders: Leader[];
}

export function LeadersGridClient({ leaders }: LeadersGridClientProps) {
    const { language } = useLanguage();
    const l = LOCALES.home.leadersGrid;

    // Helper to handle mixed string/object types safely with tString
    const resolveContent = (content: { en: string; ne: string } | string | undefined | null) => {
        if (!content) return "";
        if (typeof content === "string") return content;
        return tString(content, language);
    };

    return (
        <section className="py-24 bg-background relative overflow-hidden border-t border-border/10">
            <div className="container mx-auto px-4">
                <div className="mb-20 text-center">
                    <h2 className="section-title mb-4 md:text-6xl">
                        {tString(l.heading, language)}
                    </h2>
                    <p className="section-subtitle mx-auto max-w-xl md:text-lg">
                        {tString(l.subheading, language)}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {leaders.map((leader, index) => (
                        <div
                            key={leader._id || index}
                            className="group relative h-[550px] overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 bg-card"
                        >
                            <Link href={`/leaders/${leader.slug}`} className="block h-full w-full">
                                {/* Image Container */}
                                <div className="relative h-full w-full grayscale group-hover:grayscale-0 transition-all duration-700 bg-zinc-900">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-900/40 to-transparent z-10 opacity-90 transition-opacity duration-500" />
                                    <Image
                                        src={leader.image || '/placeholder-leader.jpg'}
                                        alt={resolveContent(leader.name)}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />

                                    {/* Overlay Content */}
                                    <div className="absolute bottom-0 left-0 right-0 z-20 p-6 flex flex-col justify-end">
                                        <div className="transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                                            <span className="block text-primary font-bebas text-lg tracking-widest mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                {resolveContent(leader.position)}
                                            </span>
                                            <h3 className="text-5xl font-bebas text-white uppercase tracking-tighter leading-none mb-3 group-hover:text-primary transition-colors duration-300">
                                                {resolveContent(leader.name)}
                                            </h3>

                                            {/* Description Reveal */}
                                            <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                                                <div className="overflow-hidden">
                                                    <div className="border-l-2 border-primary pl-4 mb-4 pt-1">
                                                        <p className="text-zinc-300 font-manrope text-base leading-relaxed line-clamp-3">
                                                            {resolveContent(leader.desc)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-white hover:text-primary transition-colors font-bebas text-lg uppercase tracking-wider mb-2">
                                                        {tString(l.readProfile, language)} <ArrowUpRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Corner Accents */}
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/0 group-hover:border-primary transition-all duration-500" />
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/0 group-hover:border-primary transition-all duration-500" />
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <Link href="/leaders">
                        <Button variant="outline" size="lg">
                            {tString(l.viewAll, language)}
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

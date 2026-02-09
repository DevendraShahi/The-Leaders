"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import { PartyGrid } from "@/components/election/PartyGrid";
import { PartyDTO } from "@/lib/election-data";

interface PartiesClientProps {
    parties: PartyDTO[];
}

export function PartiesClient({ parties }: PartiesClientProps) {
    const { language } = useLanguage();
    const locale = LOCALES.election2026.parties;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-8 border-b border-border/60 pb-8">
                    <div className="flex items-center gap-4 mb-4 opacity-60">
                        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                            {tString(locale.archive, language)}
                        </span>
                        <div className="h-px w-12 bg-border"></div>
                        <span className="text-xs font-mono uppercase tracking-widest text-[#B71C1C]">
                            {tString(locale.registeredOrgs, language)}
                        </span>
                    </div>
                    <h1 className="font-bebas text-5xl md:text-7xl text-foreground mb-4 uppercase">
                        {tString(locale.heading, language)}
                    </h1>
                    <p className="text-muted-foreground font-manrope text-lg max-w-2xl leading-relaxed">
                        {tString(locale.description, language)}
                    </p>
                </div>
                {/* Main Grid Component - Handles all filtering/sorting client-side */}
                <PartyGrid parties={parties} />
            </div>
        </div>
    );
}

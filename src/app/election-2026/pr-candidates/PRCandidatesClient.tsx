"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import { PRCandidateViewer } from "@/components/election/PRCandidateViewer";
import { ElectionMap } from "@/components/election/ElectionMap";
import { PRPartyList } from "@/lib/pr-candidate-data";

interface PRCandidatesClientProps {
    prData: PRPartyList[];
}

export function PRCandidatesClient({ prData }: PRCandidatesClientProps) {
    const { language } = useLanguage();
    const locale = LOCALES.election2026.prCandidates;

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
            <div>
                <h1 className="font-bebas text-4xl md:text-6xl text-primary">
                    {tString(locale.heading, language)}
                </h1>
                <p className="text-muted-foreground mt-2 font-manrope text-lg">
                    {tString(locale.description, language)}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3">
                    <div className="relative w-full border-y border-primary/20 md:py-12 bg-background/50 backdrop-blur">
                        <div className="h-[400px] md:h-[600px] w-full">
                            <ElectionMap className="w-full h-full" />
                        </div>
                        <div className="absolute top-4 left-4 pointer-events-none">
                            {/* Title removed in original as well, keeping structure generic */}
                        </div>
                    </div>
                </div>
            </div>

            <PRCandidateViewer initialData={prData} />
        </div>
    );
}

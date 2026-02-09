"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import { Separator } from "@/components/ui/separator";
import { DailyBriefGrid } from "@/components/election/daily-brief/DailyBriefGrid";
import { DailyBriefStack } from "@/components/election/daily-brief/DailyBriefStack";
import { DailyBriefTimelineV2 } from "@/components/election/daily-brief/DailyBriefTimelineV2";

interface DailyBriefClientProps {
    briefs: any[];
    layout: string;
    showLayoutLabel: boolean;
}

export function DailyBriefClient({ briefs, layout, showLayoutLabel }: DailyBriefClientProps) {
    const { language } = useLanguage();
    const locale = LOCALES.dailyBriefIndex;

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Subtle Paper Grain */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opactiy='1'/%3E%3C/svg%3E")`,
                }}
            />
            {/* Header Section */}
            <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <div className="inline-block border border-primary/20 bg-primary/5 px-4 py-1 mb-4">
                        <span className="text-primary font-mono text-xs uppercase tracking-widest">
                            {tString(locale.hero.badgeLabel, language)}
                        </span>
                    </div>
                    <h1 className="page-title text-foreground mb-6 uppercase">
                        {tString(locale.hero.title, language)}
                    </h1>
                    <p className="page-subtitle">
                        {tString(locale.hero.description, language)}
                    </p>
                    {showLayoutLabel && (
                        <div className="mt-4 inline-flex border border-border bg-muted/30 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                            {tString(locale.hero.layoutLabelPrefix, language)} {layout}
                        </div>
                    )}
                </div>

                <Separator className="my-8" />
            </div>

            {/* Timeline Content */}
            {briefs.length > 0 ? (
                <>
                    {layout === "grid" && <DailyBriefGrid briefs={briefs} />}
                    {layout === "stack" && <DailyBriefStack briefs={briefs} />}
                    {layout === "timeline" && <DailyBriefTimelineV2 briefs={briefs} />}
                </>
            ) : (
                <div className="container mx-auto max-w-4xl px-4 py-24">
                    <div className="flex flex-col items-center justify-center bg-muted/30 border border-dashed border-border p-12">
                        <div className="w-16 h-16 bg-muted flex items-center justify-center mb-4">
                            <span className="text-2xl">📋</span>
                        </div>
                        <h3 className="font-bebas text-2xl text-muted-foreground mb-2 uppercase">
                            {tString(locale.empty.title, language)}
                        </h3>
                        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                            {tString(locale.empty.subtitle, language)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

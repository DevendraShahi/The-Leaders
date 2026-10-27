"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity } from "lucide-react";
import Link from "next/link";

export function Hero() {
    const { language } = useLanguage();
    const isNepali = language === "ne";

    return (
        <section className="relative flex min-h-[90svh] flex-col justify-center items-center bg-background text-foreground font-sans overflow-hidden">
            {/* Layer 1: Ambient Background with "Atmospheric Depth" */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-background">
                {/* Subtle depth gradient mimicking the "mountain horizon" horizon line */}
                <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-primary/5 to-transparent z-10" />
            </div>

            <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-5xl px-6 md:px-12 py-24 mx-auto text-center">
                
                {/* Mobile/Tablet specific status pill - Elevated using surface-container-lowest equivalent */}
                <div className="flex items-center gap-2 px-4 py-2 mb-8 bg-card border border-border/20 rounded-full shadow-sm">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-xs font-mono tracking-[0.15em] uppercase text-foreground/80">
                        {isNepali ? "सक्रिय अनुगमन" : "Active Tracking"}
                    </span>
                </div>

                {/* Editorial Scale Typography */}
                <div className="space-y-4 mb-10">
                    <h2 className="text-sm md:text-base font-semibold tracking-[0.3em] uppercase text-muted-foreground font-sans">
                        {isNepali ? "साहसिक निर्णय लिनेहरू" : "The bold decision makers"}
                    </h2>
                    <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-editorial font-bold tracking-tighter text-foreground leading-[0.9] drop-shadow-sm">
                        {isNepali ? "द लिडर्स" : "THE LEADERS"}
                    </h1>
                    <p className="text-sm md:text-lg italic font-serif text-muted-foreground mt-4">
                        &mdash; {isNepali ? "हाम्रो इतिहास, हाम्रो गौरव" : "Shaping a nation's destiny"} &mdash;
                    </p>
                </div>

                {/* Body Text */}
                <p className="max-w-2xl text-base md:text-xl text-muted-foreground font-sans leading-relaxed mb-12">
                    {isNepali 
                        ? "नेपालको आजको रुप दिन साहसिक निर्णय गर्ने नेताहरू, विद्रोहीहरू र योजनाकारहरूको यात्रा एकै ठाउँमा।" 
                        : "Discover the visionaries, revolutionaries, and statesmen who shaped the destiny of a nation."}
                </p>

                {/* Buttons - adhering to Shadcn defaults and brand border-radius */}
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center justify-center">
                    <Button 
                        size="lg" 
                        className="w-full sm:w-auto font-semibold tracking-widest uppercase shadow-md"
                        asChild
                    >
                        <Link prefetch={false} href="/leaders">
                            {isNepali ? "जीवन यात्रा पढ्नुहोस्" : "EXPLORE BIOGRAPHIES"}
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="group w-full sm:w-auto font-semibold tracking-widest uppercase shadow-sm"
                        asChild
                    >
                        <Link prefetch={false} href="/articles">
                            <span className="flex items-center">
                                {isNepali ? "लेखहरू पढ्नुहोस्" : "EXPLORE ARTICLES"}
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Desktop Telemetry Framing - Glassmorphism floating data */}
            <div className="absolute top-12 left-12 hidden xl:flex flex-col gap-2 items-start justify-center opacity-80 z-20 bg-card/70 backdrop-blur-md p-4 rounded-xl border border-border/20 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-foreground font-mono">
                        {isNepali ? "लाइभ आर्काइभ" : "Live Archive"}
                    </span>
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                    {isNepali ? "निरन्तर अद्यावधिके" : "Updating continuously"}
                </div>
            </div>

            <div className="absolute bottom-12 right-12 hidden xl:flex flex-col gap-2 items-end justify-center opacity-80 z-20 bg-card/70 backdrop-blur-md p-4 rounded-xl border border-border/20 shadow-sm">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono text-right">
                    {isNepali ? "इतिहास संकलन सुरु" : "Documenting since start"}
                </div>
                <div className="text-[11px] uppercase tracking-[0.2em] font-medium text-foreground text-right font-mono">
                    <span className="font-bold">{isNepali ? "नेपालको इतिहास" : "NEPAL HISTORY"}</span>
                </div>
            </div>
        </section>
    );
}

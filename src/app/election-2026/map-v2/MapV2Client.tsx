"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import { InteractiveNepalMap } from "@/components/election/InteractiveNepalMap";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";

export function MapV2Client() {
    const { language } = useLanguage();
    const locale = LOCALES.election2026.mapV2;
    const nav = LOCALES.election2026.nav;

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            <main className="flex-1 px-0 py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="space-y-3 border-b border-border/60 pb-6">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                                {tString(nav.brand, language)}
                            </span>
                            <div className="h-px w-12 bg-border" />
                            <span className="text-xs font-mono uppercase tracking-widest text-primary">
                                {tString(locale.title, language)}
                            </span>
                        </div>
                        <h1 className="page-title text-foreground uppercase">
                            {tString(locale.heading, language)}
                        </h1>
                        <p className="page-subtitle max-w-3xl">
                            {tString(locale.longDescription, language)}
                        </p>
                    </div>

                    <div className="h-[640px] w-full border border-border bg-muted/10">
                        <InteractiveNepalMap className="h-full w-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        <div className="p-4 bg-muted/20 border border-border rounded-none">
                            <h3 className="font-bebas text-lg mb-2 uppercase tracking-wide">{tString(locale.views.province.title, language)}</h3>
                            <p className="text-sm text-muted-foreground font-manrope">
                                {tString(locale.views.province.desc, language)}
                            </p>
                        </div>
                        <div className="p-4 bg-muted/20 border border-border rounded-none">
                            <h3 className="font-bebas text-lg mb-2 uppercase tracking-wide">{tString(locale.views.district.title, language)}</h3>
                            <p className="text-sm text-muted-foreground font-manrope">
                                {tString(locale.views.district.desc, language)}
                            </p>
                        </div>
                        <div className="p-4 bg-muted/20 border border-border rounded-none">
                            <h3 className="font-bebas text-lg mb-2 uppercase tracking-wide">{tString(locale.views.constituency.title, language)}</h3>
                            <p className="text-sm text-muted-foreground font-manrope">
                                {tString(locale.views.constituency.desc, language)}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

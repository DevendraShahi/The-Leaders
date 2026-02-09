"use client";

import { useState, useMemo } from "react";
import { FactCheckFilter } from "@/components/election/FactCheckFilter";
import { AnimatedFactCheckCard } from "@/components/election/AnimatedFactCheckCard";
import { VerdictStatsBar } from "@/components/election/VerdictStatsBar";
import { Separator } from "@/components/ui/separator";
import type { FactCheckDTO } from "@/lib/election-data";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import { slugify } from "@/lib/slug";

interface FactChecksPageProps {
    factChecks: FactCheckDTO[];
}

export function FactChecksPageClient({ factChecks }: FactChecksPageProps) {
    const { language } = useLanguage();
    const locale = LOCALES.factChecksIndex;
    const [activeFilter, setActiveFilter] = useState("all");

    // Calculate counts for each verdict type
    const counts = useMemo(() => ({
        all: factChecks.length,
        true: factChecks.filter(fc => fc.verdict === "true").length,
        false: factChecks.filter(fc => fc.verdict === "false").length,
        misleading: factChecks.filter(fc => fc.verdict === "misleading").length,
        unverified: factChecks.filter(fc => fc.verdict === "unverified").length,
    }), [factChecks]);

    // Filter fact checks based on active filter
    const filteredChecks = useMemo(() => {
        if (activeFilter === "all") return factChecks;
        return factChecks.filter(fc => fc.verdict === activeFilter);
    }, [factChecks, activeFilter]);

    const resolveContent = (content: any) => {
        if (!content) return "";
        if (typeof content === "string") return content;
        if (typeof content === "object" && ("en" in content || "ne" in content)) {
            return tString(content, language);
        }
        return "";
    };

    const resolveSlug = (check: FactCheckDTO) => {
        const claim = resolveContent(check.claim);
        return check.slug || slugify(claim, 60) || check.id || "";
    };

    const formatWithCount = (template: { en: string; ne: string }, count: number) => {
        return tString(template, language).replace("{count}", String(count));
    };

    const activeFilterLabel =
        activeFilter === "true"
            ? tString(locale.indexRow.true, language).replace("{count}", "").trim()
            : activeFilter === "false"
                ? tString(locale.indexRow.false, language).replace("{count}", "").trim()
                : activeFilter === "misleading"
                    ? tString(locale.indexRow.misleading, language).replace("{count}", "").trim()
                    : activeFilter === "unverified"
                        ? tString(locale.indexRow.unverified, language).replace("{count}", "").trim()
                        : "";

    const featuredCheck = filteredChecks[0];
    const featuredClaim = featuredCheck ? resolveContent(featuredCheck.claim) : "";
    const featuredSlug = featuredCheck ? resolveSlug(featuredCheck) : "";
    const featuredLink = featuredSlug
        ? `/election-2026/fact-checks/${featuredSlug}`
        : "/election-2026/fact-checks";

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opactiy='1'/%3E%3C/svg%3E")`,
                }}
            />
            {/* Header Section */}
            <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
                <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-end">
                    <div>
                        <div className="inline-block border border-primary/20 bg-primary/5 px-4 py-1 mb-4">
                            <span className="text-primary font-mono text-xs uppercase tracking-widest">
                                {tString(locale.hero.badgeLabel, language)}
                            </span>
                        </div>
                        <h1 className="page-title text-foreground mb-6 uppercase">
                            {tString(locale.hero.titleMain, language)}
                        </h1>
                        <p className="page-subtitle max-w-2xl">
                            {tString(locale.hero.description, language)}
                        </p>
                    </div>
                    <div className="border border-border bg-card p-6">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                            {tString(locale.archiveNote.label, language)}
                        </div>
                        <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                            {tString(locale.archiveNote.body, language)}
                        </p>
                    </div>
                </div>

                <div className="mt-10 border-t border-border pt-6 flex flex-wrap gap-4">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        {tString(locale.indexRow.indexLabel, language)}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/80">
                        {formatWithCount(locale.indexRow.total, counts.all)}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/80">
                        {formatWithCount(locale.indexRow.true, counts.true)}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/80">
                        {formatWithCount(locale.indexRow.false, counts.false)}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/80">
                        {formatWithCount(locale.indexRow.misleading, counts.misleading)}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/80">
                        {formatWithCount(locale.indexRow.unverified, counts.unverified)}
                    </div>
                </div>

                <Separator className="my-8" />
            </div>

            {/* Archive Grid */}
            <div className="container mx-auto max-w-7xl px-4 py-12 relative z-10">
                {/* Luxe Controls Row */}
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border border-border bg-card p-5 mb-10">
                    <div className="flex flex-wrap gap-2">
                        <FactCheckFilter
                            activeFilter={activeFilter}
                            onFilterChange={setActiveFilter}
                            counts={counts}
                            variant="bar"
                            sticky={false}
                            useContainer={false}
                            className="border-none bg-transparent p-0"
                        />
                    </div>
                    <div className="min-w-[260px]">
                        <VerdictStatsBar factChecks={filteredChecks} variant="sidebar" />
                    </div>
                </div>

                {filteredChecks.length > 0 ? (
                    <>
                        <div className="mb-10">
                            <div className="border-2 border-primary bg-gradient-to-r from-primary/5 to-transparent p-6">
                                <div className="grid gap-6 md:grid-cols-[1fr_220px] items-start">
                                    <div className="space-y-4">
                                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                            {tString(locale.featured.label, language)}
                                        </div>
                                        <Link href={featuredLink}>
                                            <h2 className="font-sans text-2xl md:text-3xl leading-[1.05] tracking-tight text-foreground hover:text-primary transition-colors line-clamp-4">
                                                {featuredClaim}
                                            </h2>
                                        </Link>
                                        <p className="text-muted-foreground font-sans text-base leading-relaxed line-clamp-3">
                                            {resolveContent(featuredCheck?.analysis)}
                                        </p>
                                        <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                                            {resolveContent(featuredCheck?.claimBy)}
                                        </div>
                                    </div>
                                    {featuredCheck?.image && (
                                        <div className="relative aspect-square overflow-hidden border border-border bg-muted/30 dark:bg-[#151515]">
                                            <img
                                                src={featuredCheck.image}
                                                alt={featuredClaim}
                                                className="h-full w-full object-cover object-center"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredChecks.slice(1).map((check, index) => (
                                <div key={check.id || `${resolveContent(check.claim)}-${check.date}-${index}`}>
                                    <AnimatedFactCheckCard
                                        slug={resolveSlug(check)}
                                        claim={resolveContent(check.claim)}
                                        claimBy={resolveContent(check.claimBy)}
                                        verdict={check.verdict}
                                        analysis={resolveContent(check.analysis)}
                                        date={check.date}
                                        image={check.image}
                                        index={index}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 max-w-2xl mx-auto">
                        <div className="bg-muted/30 border border-dashed border-border p-12 text-center w-full">
                            <div className="w-16 h-16 bg-muted flex items-center justify-center mb-4 mx-auto">
                                <span className="text-2xl">🔍</span>
                            </div>
                            <h3 className="font-bebas text-2xl text-muted-foreground mb-2 uppercase">
                                {tString(locale.empty.title, language)}
                            </h3>
                            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
                                {activeFilter === "all"
                                    ? tString(locale.empty.subtitleAll, language)
                                    : tString(locale.empty.subtitleFiltered, language).replace("{verdict}", activeFilterLabel)}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

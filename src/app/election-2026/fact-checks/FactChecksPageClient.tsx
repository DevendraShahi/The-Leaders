"use client";

import { useState, useMemo } from "react";
import { FactCheckFilter } from "@/components/election/FactCheckFilter";
import { AnimatedFactCheckCard } from "@/components/election/AnimatedFactCheckCard";
import { VerdictStatsBar } from "@/components/election/VerdictStatsBar";
import { Separator } from "@/components/ui/separator";
import type { FactCheckDTO } from "@/lib/election-data";
import Link from "next/link";

interface FactChecksPageProps {
    factChecks: FactCheckDTO[];
}

export function FactChecksPageClient({ factChecks }: FactChecksPageProps) {
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
                                Verification Archive
                            </span>
                        </div>
                        <h1 className="font-bebas text-5xl md:text-7xl text-foreground mb-6 uppercase tracking-tight">
                            Fact <span className="text-primary">Checks</span>
                        </h1>
                        <p className="text-muted-foreground font-sans text-xl leading-relaxed max-w-2xl">
                            A disciplined ledger of claims, verdicts, and evidence — designed to protect voter trust.
                        </p>
                    </div>
                    <div className="border border-border bg-card p-6">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                            Archive Note
                        </div>
                        <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                            Each dossier captures the claim, the strongest evidence, and the final verdict. Use filters
                            to isolate confirmed truths, false narratives, and misleading claims.
                        </p>
                    </div>
                </div>

                <div className="mt-10 border-t border-border pt-6 flex flex-wrap gap-4">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Index:
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/80">
                        Total {counts.all}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/80">
                        True {counts.true}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/80">
                        False {counts.false}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/80">
                        Misleading {counts.misleading}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/80">
                        Unverified {counts.unverified}
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
                        {/* Featured Card */}
                        <div className="mb-10">
                            <div className="border-2 border-primary bg-gradient-to-r from-primary/5 to-transparent p-6">
                                <div className="grid gap-6 md:grid-cols-[1fr_220px] items-start">
                                    <div className="space-y-4">
                                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                            Featured Dossier
                                        </div>
                                        <Link href={`/election-2026/fact-checks/${filteredChecks[0].slug || filteredChecks[0].claim.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 60)}`}>
                                            <h2 className="font-bebas text-4xl md:text-5xl uppercase leading-[0.9] text-foreground hover:text-primary transition-colors">
                                                {filteredChecks[0].claim}
                                            </h2>
                                        </Link>
                                        <p className="text-muted-foreground font-sans text-base leading-relaxed line-clamp-3">
                                            {filteredChecks[0].analysis}
                                        </p>
                                        <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                                            {filteredChecks[0].claimBy}
                                        </div>
                                    </div>
                                    {filteredChecks[0].image && (
                                        <div className="relative aspect-square overflow-hidden border border-border bg-muted/30 dark:bg-[#151515]">
                                            <img
                                                src={filteredChecks[0].image}
                                                alt={filteredChecks[0].claim}
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
                                <AnimatedFactCheckCard
                                    key={check.id || `${check.claim}-${check.date}-${index}`}
                                    slug={check.slug}
                                    claim={check.claim}
                                    claimBy={check.claimBy}
                                    verdict={check.verdict}
                                    analysis={check.analysis}
                                    date={check.date}
                                    image={check.image}
                                    index={index}
                                />
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
                                No Fact Checks Found
                            </h3>
                            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
                                {activeFilter === "all"
                                    ? "We are currently verifying new claims."
                                    : `No ${activeFilter} fact checks available.`}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

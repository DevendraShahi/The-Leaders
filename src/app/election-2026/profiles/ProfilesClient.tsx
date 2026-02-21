"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/components/providers/language-provider";
import { PRCandidateViewer } from "@/components/election/PRCandidateViewer";
import { FPTPCandidateViewer } from "@/components/election/FPTPCandidateViewer";
import { LOCALES, tString } from "@/lib/locales";
import type { PRPartyList } from "@/lib/pr-candidate-data";
import type { FPTPCandidateDataset } from "@/lib/fptp-candidate-data";
import type { CandidateDataSummary } from "@/lib/candidate-data-summary";
import type { PartyRankIndex } from "@/lib/fptp-party-ranking";
import { Database, Layers, MapPinned, RefreshCw } from "lucide-react";

type CandidateMode = "fptp" | "pr";

interface ProfilesClientProps {
    prData: PRPartyList[];
    fptpDataset: FPTPCandidateDataset;
    summary: CandidateDataSummary;
    fptpPartyRankIndex: PartyRankIndex;
    prPartyRankIndex: PartyRankIndex;
}

function formatCompact(value: number) {
    return new Intl.NumberFormat("en-US").format(value);
}

function formatSyncedAt(value: string | null, language: "en" | "ne") {
    if (!value) return language === "ne" ? "उपलब्ध छैन" : "Not available";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleString(language === "ne" ? "ne-NP" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function ProfilesClient({ prData, fptpDataset, summary, fptpPartyRankIndex, prPartyRankIndex }: ProfilesClientProps) {
    const { language } = useLanguage();
    const locale = LOCALES.election2026.profiles;

    const [mode, setMode] = useState<CandidateMode>("fptp");

    const modeLabel = useMemo(
        () =>
            mode === "fptp"
                ? tString(locale.modes.fptp, language)
                : tString(locale.modes.pr, language),
        [language, locale.modes.fptp, locale.modes.pr, mode]
    );

    const summaryCards = [
        {
            id: "fptp",
            label: tString(locale.stats.fptpCandidates, language),
            value: formatCompact(summary.fptpCandidates),
            icon: Database,
        },
        {
            id: "fptpParties",
            label: tString(locale.stats.fptpParties, language),
            value: formatCompact(summary.fptpParties),
            icon: MapPinned,
        },
        {
            id: "pr",
            label: tString(locale.stats.prCandidates, language),
            value: formatCompact(summary.prCandidates),
            icon: Layers,
        },
        {
            id: "prParties",
            label: tString(locale.stats.prParties, language),
            value: formatCompact(summary.prParties),
            icon: Database,
        },
    ];

    return (
        <div className="election-typography min-h-screen bg-background">
            <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="space-y-8">
                    <section className="relative overflow-hidden border border-border/70 bg-gradient-to-br from-[#B71C1C]/8 via-background to-background p-6 md:p-8">
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(183,28,28,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(183,28,28,0.03)_1px,transparent_1px)] bg-[size:82px_82px]" />
                        <div className="relative space-y-4">
                            <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                                <span>{tString(locale.archive, language)}</span>
                                <span className="h-px w-12 bg-border" />
                                <span className="text-primary">{modeLabel}</span>
                            </div>

                            <h1 className="font-bebas text-5xl uppercase leading-[0.9] tracking-tight text-foreground md:text-7xl">
                                {tString(locale.heading, language)}
                            </h1>
                            <p className="max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                                {tString(locale.description, language)}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                                <Badge variant="outline" className="rounded-none px-2 py-1 font-mono uppercase tracking-widest">
                                    {tString(locale.stats.fptpParties, language)}: {formatCompact(summary.fptpParties)}
                                </Badge>
                                <Badge variant="outline" className="rounded-none px-2 py-1 font-mono uppercase tracking-widest">
                                    {tString(locale.stats.prParties, language)}: {formatCompact(summary.prParties)}
                                </Badge>
                                <Badge variant="outline" className="rounded-none px-2 py-1 font-mono uppercase tracking-widest">
                                    {tString(locale.stats.coverage, language)}: {formatCompact(summary.fptpDistricts)} / {formatCompact(summary.fptpConstituencies)}
                                </Badge>
                                <Badge variant="secondary" className="rounded-none px-2 py-1 font-mono uppercase tracking-widest">
                                    <RefreshCw className="mr-1 h-3 w-3" />
                                    {tString(locale.stats.lastSynced, language)}: {formatSyncedAt(summary.lastSyncedAt, language)}
                                </Badge>
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {summaryCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <Card key={card.id} className="rounded-none border border-border/70 bg-card/60 backdrop-blur-sm">
                                    <CardContent className="flex items-start justify-between p-4">
                                        <div>
                                            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                                                {card.label}
                                            </p>
                                            <p className="mt-1 font-bebas text-4xl leading-none tracking-tight text-foreground">
                                                {card.value}
                                            </p>
                                        </div>
                                        <div className="rounded-none border border-border/70 bg-background/80 p-2">
                                            <Icon className="h-4 w-4 text-primary" />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </section>

                    <section className="space-y-4 border border-border/70 bg-muted/10 p-4 md:p-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="font-bebas text-2xl uppercase tracking-wide text-foreground">
                                    {tString(locale.viewerTitle, language)}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {mode === "fptp"
                                        ? tString(locale.modeDescriptions.fptp, language)
                                        : tString(locale.modeDescriptions.pr, language)}
                                </p>
                            </div>

                            <div className="inline-flex w-full border border-border bg-background p-1 md:w-auto">
                                <Button
                                    type="button"
                                    onClick={() => setMode("fptp")}
                                    variant={mode === "fptp" ? "default" : "ghost"}
                                    className="w-1/2 rounded-none font-mono text-[11px] uppercase tracking-[0.2em] md:w-auto"
                                >
                                    {tString(locale.modes.fptp, language)}
                                    <span className="ml-2">{formatCompact(summary.fptpCandidates)}</span>
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setMode("pr")}
                                    variant={mode === "pr" ? "default" : "ghost"}
                                    className="w-1/2 rounded-none font-mono text-[11px] uppercase tracking-[0.2em] md:w-auto"
                                >
                                    {tString(locale.modes.pr, language)}
                                    <span className="ml-2">{formatCompact(summary.prCandidates)}</span>
                                </Button>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground">{tString(locale.datasetNote, language)}</p>
                    </section>

                    <Separator className="my-8" />

                    {mode === "fptp" ? (
                        <FPTPCandidateViewer
                            dataset={fptpDataset}
                            partyRankIndex={fptpPartyRankIndex}
                        />
                    ) : (
                        <PRCandidateViewer
                            initialData={prData}
                            partyRankIndex={prPartyRankIndex}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

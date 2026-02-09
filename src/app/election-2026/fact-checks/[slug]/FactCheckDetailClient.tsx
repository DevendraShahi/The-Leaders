"use client";

import type { FactCheckDTO, LocalizedValue } from "@/lib/election-data";
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ShieldCheck,
    ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

// --- Verdict Config ---
const getVerdictConfig = (v: string, language: "en" | "ne") => {
    const locale = LOCALES.factCheckDetail.verdict;
    switch (v) {
        case "true":
            return {
                color: "text-green-600",
                bg: "bg-green-500",
                border: "border-green-600",
                icon: CheckCircle,
                label: tString(locale.true.label, language),
                stampInfo: tString(locale.true.stamp, language),
            };
        case "false":
            return {
                color: "text-red-600",
                bg: "bg-red-600",
                border: "border-red-600",
                icon: XCircle,
                label: tString(locale.false.label, language),
                stampInfo: tString(locale.false.stamp, language),
            };
        case "misleading":
            return {
                color: "text-amber-500",
                bg: "bg-amber-500",
                border: "border-amber-500",
                icon: AlertTriangle,
                label: tString(locale.misleading.label, language),
                stampInfo: tString(locale.misleading.stamp, language),
            };
        default:
            return {
                color: "text-gray-500",
                bg: "bg-gray-500",
                border: "border-gray-500",
                icon: ShieldCheck,
                label: tString(locale.unverified.label, language),
                stampInfo: tString(locale.unverified.stamp, language),
            };
    }
};

// --- Helper Functions ---
function resolveText(value: LocalizedValue, language: "en" | "ne"): string {
    if (typeof value === "string") return value;
    return language === "ne" ? value.ne || value.en || "" : value.en || value.ne || "";
}

function generateSlug(claim: string): string {
    return claim
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 60);
}

// --- Client Component for Interactions ---
export function FactCheckDetailClient({ factCheck }: { factCheck: FactCheckDTO }) {
    const { language } = useLanguage();
    const locale = LOCALES.factCheckDetail;
    const claim = resolveText(factCheck.claim, language);
    const claimBy = resolveText(factCheck.claimBy, language);
    const analysis = resolveText(factCheck.analysis, language);
    const config = getVerdictConfig(factCheck.verdict, language);
    const Icon = config.icon;

    return (
        <div className="min-h-screen bg-background dark:bg-[#0D0D0D] text-foreground relative overflow-hidden font-sans selection:bg-primary/10 selection:text-primary antialiased">
            {/* Background Texture (Subtle Grain) */}
            <div
                className="fixed inset-0 opacity-[0.04] pointer-events-none z-0 mix-blend-multiply"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opactiy='1'/%3E%3C/svg%3E")`
                }}
            ></div>

            {/* Back Navigation */}
            <div className="absolute top-0 left-0 w-full z-50 p-6 md:p-8 flex justify-between items-center">
                <Link
                    href="/election-2026/fact-checks"
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {tString(locale.backLink.label, language)}
                </Link>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/70">
                    {tString(locale.header.refPrefix, language)} {generateSlug(claim).substring(0, 8).toUpperCase()}
                </div>
            </div>

            <div className="relative z-10 container mx-auto max-w-4xl px-4 py-24 md:py-32 flex flex-col items-center">

                {/* 1. Header Section - Clean Document Look */}
                <div className="w-full relative mb-10 border-y border-border/60 bg-background/80">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative z-10 w-full text-center px-6 py-12 md:py-14"
                    >
                    <Badge
                        variant="outline"
                        className="mb-6 rounded-none px-3 py-1 text-[10px] font-mono uppercase tracking-widest border-border text-muted-foreground bg-background/40 dark:bg-background/20"
                    >
                        {tString(locale.header.caseBadge, language)}
                    </Badge>

                    <h1 className="font-bebas text-5xl md:text-7xl leading-[0.9] mb-8 tracking-tight max-w-3xl mx-auto">
                        "{claim}"
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-muted-foreground">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-mono uppercase tracking-widest mb-1 opacity-70">
                                {tString(locale.header.claimSourceLabel, language)}
                            </span>
                            <span className="font-sans font-bold text-foreground">{claimBy}</span>
                        </div>
                        <div className="w-px h-8 bg-border hidden md:block"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-mono uppercase tracking-widest mb-1 opacity-70">
                                {tString(locale.header.dateInfoLabel, language)}
                            </span>
                            <span className="font-sans font-bold text-foreground">
                                {new Date(factCheck.date).toLocaleDateString(language === "ne" ? "ne-NP" : "en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    </div>
                    </motion.div>
                </div>

                {factCheck.image && (
                    <div className="w-full max-w-4xl mb-14">
                        <div className="relative aspect-square overflow-hidden border border-border bg-muted/30 dark:bg-[#151515]">
                            <img
                                src={factCheck.image}
                                alt={claim}
                                className="h-full w-full object-cover object-center"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                        </div>
                    </div>
                )}

                {/* 2. Case Dossier */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full bg-card dark:bg-[#151515] border border-border shadow-sm relative overflow-hidden"
                >
                    <div className={cn("absolute top-0 left-0 w-full h-1", config.bg)}></div>

                    <div className="grid md:grid-cols-[240px_1fr] gap-0">
                        {/* Dossier Sidebar */}
                        <div className="border-b md:border-b-0 md:border-r border-border p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <Badge
                                    className={cn(
                                        "rounded-none px-3 py-1 text-sm font-mono uppercase tracking-wider bg-transparent border-2",
                                        config.color,
                                        config.border
                                    )}
                                    variant="outline"
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {config.label}
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                    {tString(locale.sidebar.claimSourceLabel, language)}
                                </div>
                                <div className="font-sans font-semibold text-foreground">{claimBy}</div>
                            </div>

                            <div className="space-y-3">
                                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                    {tString(locale.sidebar.loggedDateLabel, language)}
                                </div>
                                <div className="font-sans text-foreground">
                                    {new Date(factCheck.date).toLocaleDateString(language === "ne" ? "ne-NP" : "en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                    {tString(locale.sidebar.caseIdLabel, language)}
                                </div>
                                <div className="font-mono text-xs text-foreground">
                                    {generateSlug(claim).substring(0, 12).toUpperCase()}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border">
                                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                    {tString(locale.sidebar.caseNotesLabel, language)}
                                </div>
                                <p className="mt-2 text-xs font-sans text-muted-foreground leading-relaxed">
                                    {tString(locale.sidebar.caseNotesBody, language)}
                                </p>
                            </div>
                        </div>

                        {/* Dossier Content */}
                        <div className="p-8 md:p-10">
                            <section className="mb-10">
                                <h3 className="font-bebas text-2xl uppercase tracking-wider mb-4 pb-2 border-b border-border/40">
                                    {tString(locale.analysis.heading, language)}
                                </h3>
                                <div className="font-sans text-lg leading-relaxed text-muted-foreground space-y-6">
                                    {analysis.split('\n').map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                                </div>
                            </section>

                            {factCheck.sources && factCheck.sources.length > 0 && (
                                <section className="pt-6 border-t border-border/40">
                                    <h3 className="font-bebas text-xl text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4" /> {tString(locale.sources.heading, language)}
                                    </h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {factCheck.sources.map((source, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start gap-3 group p-3 bg-muted/40 dark:bg-[#141414] border border-border/60 hover:border-border transition-colors"
                                            >
                                                <span className="font-mono text-[10px] text-muted-foreground mt-1 uppercase">
                                                    {tString(locale.sources.exhibitLabel, language).replace("{index}", String(index + 1))}
                                                </span>
                                                <span className="font-sans text-sm text-muted-foreground group-hover:text-foreground font-medium break-all">
                                                    {source}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

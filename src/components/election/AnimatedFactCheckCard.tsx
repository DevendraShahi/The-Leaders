"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, XCircle, ShieldCheck, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

interface FactCheckProps {
    claim: string;
    slug?: string;
    claimBy: string;
    verdict: "true" | "false" | "misleading" | "unverified" | string;
    analysis: string;
    date: Date | string;
    image?: string;
    index?: number;
}

interface VerdictConfig {
    color: string;
    accent: string;
    border: string;
    icon: LucideIcon;
    label: string;
}

const getVerdictConfig = (v: string, language: "en" | "ne"): VerdictConfig => {
    const verdictLocale = LOCALES.factCheckDetail.verdict;
    switch (v) {
        case "true":
            return {
                color: "text-green-600",
                accent: "border-l-green-600",
                border: "border-green-600/40",
                icon: CheckCircle,
                label: tString(verdictLocale.true.label, language),
            };
        case "false":
            return {
                color: "text-red-600",
                accent: "border-l-red-600",
                border: "border-red-600/40",
                icon: XCircle,
                label: tString(verdictLocale.false.label, language),
            };
        case "misleading":
            return {
                color: "text-amber-500",
                accent: "border-l-amber-500",
                border: "border-amber-500/40",
                icon: AlertTriangle,
                label: tString(verdictLocale.misleading.label, language),
            };
        default:
            return {
                color: "text-gray-500",
                accent: "border-l-gray-500",
                border: "border-gray-500/40",
                icon: ShieldCheck,
                label: tString(verdictLocale.unverified.label, language),
            };
    }
};

export function AnimatedFactCheckCard({ claim, slug, claimBy, verdict, analysis, date, image, index = 0 }: FactCheckProps) {
    const { language } = useLanguage();
    const config = getVerdictConfig(verdict, language);
    const Icon = config.icon;

    // Generate slug from claim (temporary, ideally should come from backend)
    const resolvedSlug = slug || claim.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 60);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="h-full"
        >
            <Link href={`/election-2026/fact-checks/${resolvedSlug}`}>
                <Card className="h-full bg-card border border-border hover:border-primary/50 transition-colors duration-300 rounded-none overflow-hidden">
                    {image && (
                        <div className="relative w-full aspect-square overflow-hidden border-b border-border bg-muted/30 dark:bg-[#151515]">
                            <img
                                src={image}
                                alt={claim}
                                className="h-full w-full object-cover object-center"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-transparent to-transparent" />
                        </div>
                    )}

                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                                {new Date(date).toLocaleDateString(language === "ne" ? "ne-NP" : "en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                            <div className={cn("flex items-center gap-1.5 px-2 py-1 border text-[10px] font-mono uppercase tracking-widest bg-background", config.color, config.border)}>
                                <Icon className="w-3 h-3" />
                                <span>{config.label}</span>
                            </div>
                        </div>

                        <h3 className="font-sans text-[1.3rem] md:text-[1.5rem] leading-[1.1] tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-4">
                            {claim}
                        </h3>

                        <div className="flex items-start gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                            <span className={cn("h-2 w-2 border", config.border)} />
                            <span>{tString(LOCALES.factCheckDetail.header.claimSourceLabel, language)}</span>
                            <span className="text-border">/</span>
                            <span className="text-foreground/80 line-clamp-2">{claimBy}</span>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed font-sans line-clamp-3">
                            {analysis}
                        </p>

                        <div className="pt-2 text-primary font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                            {tString(LOCALES.election2026.factChecks.readAnalysis, language)} <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>
                </Card>
            </Link>
        </motion.div>
    );
}

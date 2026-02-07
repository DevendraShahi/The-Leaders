"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, HelpCircle, XCircle, ShieldCheck, ArrowRight } from "lucide-react";

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
    icon: React.ElementType;
    label: string;
}

const getVerdictConfig = (v: string): VerdictConfig => {
    switch (v) {
        case "true":
            return {
                color: "text-green-600",
                accent: "border-l-green-600",
                border: "border-green-600/40",
                icon: CheckCircle,
                label: "Verified True",
            };
        case "false":
            return {
                color: "text-red-600",
                accent: "border-l-red-600",
                border: "border-red-600/40",
                icon: XCircle,
                label: "False",
            };
        case "misleading":
            return {
                color: "text-amber-500",
                accent: "border-l-amber-500",
                border: "border-amber-500/40",
                icon: AlertTriangle,
                label: "Misleading",
            };
        default:
            return {
                color: "text-gray-500",
                accent: "border-l-gray-500",
                border: "border-gray-500/40",
                icon: ShieldCheck,
                label: "Unverified",
            };
    }
};

export function AnimatedFactCheckCard({ claim, slug, claimBy, verdict, analysis, date, image, index = 0 }: FactCheckProps) {
    const config = getVerdictConfig(verdict);
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
                                {format(new Date(date), "MMM d, yyyy")}
                            </span>
                            <div className={cn("flex items-center gap-1.5 px-2 py-1 border text-[10px] font-mono uppercase tracking-widest bg-background", config.color, config.border)}>
                                <Icon className="w-3 h-3" />
                                <span>{config.label}</span>
                            </div>
                        </div>

                        <h3 className="font-bebas text-3xl leading-[0.9] uppercase text-foreground group-hover:text-primary transition-colors">
                            {claim}
                        </h3>

                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                            <span className={cn("h-2 w-2 border", config.border)} />
                            <span>Source</span>
                            <span className="text-border">/</span>
                            <span className="text-foreground/80">{claimBy}</span>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed font-sans line-clamp-3">
                            {analysis}
                        </p>

                        <div className="pt-2 text-primary font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                            Read Dossier <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>
                </Card>
            </Link>
        </motion.div>
    );
}

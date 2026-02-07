"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FactCheckDTO } from "@/lib/election-data";

interface VerdictStatsBarProps {
    factChecks: FactCheckDTO[];
    variant?: "bar" | "sidebar";
    className?: string;
}

const VERDICT_COLORS: Record<string, string> = {
    true: "bg-green-600",
    false: "bg-red-600",
    misleading: "bg-amber-500",
    unverified: "bg-gray-500",
};

export function VerdictStatsBar({ factChecks, variant = "bar", className }: VerdictStatsBarProps) {
    const total = factChecks.length;

    const counts = {
        true: factChecks.filter((f) => f.verdict === "true").length,
        false: factChecks.filter((f) => f.verdict === "false").length,
        misleading: factChecks.filter((f) => f.verdict === "misleading").length,
        unverified: factChecks.filter((f) => f.verdict === "unverified").length,
    };

    if (total === 0) {
        return null;
    }

    return (
        <div
            className={cn(
                variant === "bar"
                    ? "sticky top-[152px] z-10 border-b border-border bg-background/95 backdrop-blur-sm"
                    : "border border-border bg-background/95",
                className
            )}
        >
            <div className={variant === "bar" ? "container mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8" : "px-4 py-4"}>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                            Verdict Distribution
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/80">
                            {total} checks
                        </span>
                    </div>

                    <div className="flex-1">
                        <div className="h-2 w-full bg-border/30 overflow-hidden flex rounded-none">
                            {(["true", "false", "misleading", "unverified"] as const).map((key) => {
                                const value = counts[key];
                                if (!value) return null;
                                const width = (value / total) * 100;
                                return (
                                    <motion.div
                                        key={key}
                                        className={VERDICT_COLORS[key]}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${width}%` }}
                                        transition={{ duration: 0.6 }}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {(["true", "false", "misleading", "unverified"] as const).map((key) => {
                            const value = counts[key];
                            if (!value) return null;
                            return (
                                <div key={key} className="flex items-center gap-1">
                                    <span
                                        className={`w-2 h-2 ${VERDICT_COLORS[key]} inline-block`}
                                    />
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                        {key} {value}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FactCheckFilterProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    counts: {
        all: number;
        true: number;
        false: number;
        misleading: number;
        unverified: number;
    };
    variant?: "bar" | "sidebar";
    className?: string;
    sticky?: boolean;
    useContainer?: boolean;
}

const FILTERS = [
    { value: "all", label: "All Checks", icon: null },
    { value: "true", label: "True", icon: CheckCircle, color: "text-green-600" },
    { value: "false", label: "False", icon: XCircle, color: "text-primary" },
    { value: "misleading", label: "Misleading", icon: AlertTriangle, color: "text-amber-500" },
] as const;

export function FactCheckFilter({
    activeFilter,
    onFilterChange,
    counts,
    variant = "bar",
    className,
    sticky = true,
    useContainer = true,
}: FactCheckFilterProps) {
    return (
        <div
            className={cn(
                "border-border bg-background/95 backdrop-blur-sm",
                variant === "bar" ? (sticky ? "border-y sticky top-0 z-20 py-6" : "border-y py-4") : "border",
                className
            )}
        >
            <div className={cn(variant === "bar" ? (useContainer ? "container mx-auto px-4" : "px-0") : "px-4")}>
                <div
                    className={cn(
                        "flex flex-wrap gap-3 justify-start",
                        variant === "bar" && useContainer && "justify-center"
                    )}
                >
                    {FILTERS.map((filter) => {
                        const Icon = filter.icon;
                        const count = counts[filter.value as keyof typeof counts];
                        const isActive = activeFilter === filter.value;

                        return (
                            <motion.button
                                key={filter.value}
                                onClick={() => onFilterChange(filter.value)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "relative px-6 py-3 font-mono text-xs uppercase tracking-widest transition-all duration-300",
                                    "border-2 bg-background hover:bg-muted/50",
                                    isActive
                                        ? "border-primary text-foreground"
                                        : "border-border text-muted-foreground hover:border-primary/50"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {Icon && <Icon className={cn("w-4 h-4", filter.color)} />}
                                    <span>{filter.label}</span>
                                    <Badge
                                        variant={isActive ? "default" : "outline"}
                                        className="ml-1 font-bold text-[10px] rounded-none"
                                    >
                                        {count}
                                    </Badge>
                                </div>

                                {/* Active Indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeFilter"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

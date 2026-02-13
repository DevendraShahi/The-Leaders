"use client";

import * as React from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LanguageToggleProps {
    className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
    const { language, setLanguage } = useLanguage();
    const activeIndex = language === "en" ? 0 : 1;

    return (
        <div className={cn("relative grid grid-cols-2 items-center border border-border/60 rounded-none text-[11px] font-mono uppercase tracking-[0.18em] overflow-hidden bg-background/50 backdrop-blur-sm", className)}>
            <motion.div
                aria-hidden
                className="absolute inset-y-0 left-0 z-0 w-1/2 bg-primary"
                animate={{ x: `${activeIndex * 100}%` }}
                transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.9 }}
            />
            <button
                type="button"
                onClick={() => setLanguage("en")}
                aria-pressed={language === "en"}
                className={cn(
                    "relative z-10 px-3 py-1.5 transition-all duration-300 min-w-[36px]",
                    language === "en"
                        ? "text-primary-foreground font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
            >
                <span className="relative z-10">EN</span>
            </button>
            <button
                type="button"
                onClick={() => setLanguage("ne")}
                aria-pressed={language === "ne"}
                className={cn(
                    "relative z-10 px-3 py-1.5 transition-all duration-300 min-w-[36px]",
                    language === "ne"
                        ? "text-primary-foreground font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
            >
                <span className="relative z-10">NE</span>
            </button>
        </div>
    );
}

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

    return (
        <div className={cn("flex items-center border border-border/60 rounded-none text-[11px] font-mono uppercase tracking-[0.18em] overflow-hidden bg-background/50 backdrop-blur-sm", className)}>
            <button
                type="button"
                onClick={() => setLanguage("en")}
                className={cn(
                    "relative px-3 py-1.5 transition-all duration-300 min-w-[36px]",
                    language === "en"
                        ? "text-primary-foreground font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
            >
                {language === "en" && (
                    <motion.div
                        layoutId="active-lang"
                        className="absolute inset-0 bg-primary z-[-1]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}
                <span className="relative z-10">EN</span>
            </button>
            <div className="w-[1px] h-3 bg-border/60" />
            <button
                type="button"
                onClick={() => setLanguage("ne")}
                className={cn(
                    "relative px-3 py-1.5 transition-all duration-300 min-w-[36px]",
                    language === "ne"
                        ? "text-primary-foreground font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
            >
                {language === "ne" && (
                    <motion.div
                        layoutId="active-lang"
                        className="absolute inset-0 bg-primary z-[-1]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}
                <span className="relative z-10">NE</span>
            </button>
        </div>
    );
}

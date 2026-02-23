"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
    Activity,
    ArrowLeft,
    CalendarDays,
    ExternalLink,
    FileSearch,
    FileText,
    Printer,
    Scale,
    UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { getElectionSnapshotStats, type SnapshotIconKey } from "@/lib/election-snapshot-data";

const SNAPSHOT_ICON_MAP: Record<SnapshotIconKey, React.ComponentType<{ className?: string }>> = {
    calendar: CalendarDays,
    scale: Scale,
    users: UsersRound,
    fileText: FileText,
    printer: Printer,
    activity: Activity,
    fileSearch: FileSearch,
};

export function SnapshotFactsClient() {
    const { language } = useLanguage();
    const shouldReduceMotion = useReducedMotion();
    const stats = useMemo(() => getElectionSnapshotStats(language), [language]);

    return (
        <section className="election-typography relative overflow-hidden border-y border-border/80 bg-background py-10 sm:py-12">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(183,28,28,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(183,28,28,0.04)_1px,transparent_1px)] bg-[size:96px_96px]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_60%_at_50%_0%,rgba(183,28,28,0.16),transparent_72%)]" />

            <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-3">
                        <Badge className="border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                            {language === "en" ? "Verified Snapshot" : "प्रमाणित स्न्यापसट"}
                        </Badge>
                        <h1 className="font-editorial text-[2rem] leading-[1.05] text-foreground sm:text-[2.4rem]">
                            {language === "en" ? "Election Reference Metrics" : "निर्वाचन सन्दर्भ सूचक"}
                        </h1>
                        <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
                            {language === "en"
                                ? "Using your provided verified dataset (EC 2022 bulletin metrics + EC e-Bulletin updates from 2080). Each card links directly to the source."
                                : "तपाईंले उपलब्ध गराउनुभएको प्रमाणित तथ्याङ्क (२०७९ निर्वाचन सूचक र २०८० इ-बुलेटिन अद्यावधिक) प्रयोग गरिएको छ। हरेक कार्डले स्रोतमा सिधै लैजान्छ।"}
                        </p>
                    </div>

                    <Link href="/election-2026" className="w-full sm:w-auto">
                        <Button
                            variant="outline"
                            className="w-full border-primary/50 bg-background/60 font-mono text-[10px] uppercase tracking-[0.13em] text-primary hover:bg-primary/10 hover:text-primary sm:w-auto"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {language === "en" ? "Back to Election Hub" : "निर्वाचन हबमा फर्किनुहोस्"}
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {stats.map((stat, index) => {
                        const StatIcon = SNAPSHOT_ICON_MAP[stat.icon];

                        return (
                            <motion.a
                                key={stat.id}
                                href={stat.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.28, delay: index * 0.03 }}
                                whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                                className="group block border border-border/80 bg-card/55 p-4 transition-colors hover:border-primary/55 hover:bg-card/75"
                            >
                                <div className="mb-2 inline-flex h-8 w-8 items-center justify-center border border-primary/40 bg-primary/10 text-primary">
                                    <StatIcon className="h-4 w-4" />
                                </div>

                                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                    {stat.label[language]}
                                </p>
                                <p className="mt-1 font-editorial text-[1.85rem] leading-none tracking-tight text-foreground">
                                    {stat.value}
                                </p>
                                <p className="mt-2 text-[0.84rem] leading-6 text-muted-foreground">
                                    {stat.hint[language]}
                                </p>
                                <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-muted-foreground/90">
                                    {stat.evidenceLine}
                                </p>

                                <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.11em] text-primary">
                                        {stat.source[language]}
                                    </span>
                                    <ExternalLink className="h-3.5 w-3.5 text-primary transition-transform group-hover:translate-x-0.5" />
                                </div>
                            </motion.a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

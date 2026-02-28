"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LOCALES, tString } from "@/lib/locales";
import type { ManifestoDocument } from "@/lib/manifesto-data";

const tileMotion = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0 },
};

function getPdfCardPreviewSrc(fileUrl: string) {
    return `${fileUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`;
}

function getLatestManifestoDate(manifestos: ManifestoDocument[], language: "en" | "ne") {
    if (manifestos.length === 0) return "-";

    const latest = manifestos.reduce((current, next) => {
        if (next.updatedAtISO > current.updatedAtISO) return next;
        return current;
    });

    return latest.updatedAtLabel[language];
}

interface ManifestoIndexClientProps {
    manifestos: ManifestoDocument[];
}

export function ManifestoIndexClient({ manifestos }: ManifestoIndexClientProps) {
    const { language } = useLanguage();
    const shouldReduceMotion = useReducedMotion();
    const locale = LOCALES.election2026.manifestos;

    const [query, setQuery] = useState("");

    const filteredManifestos = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return manifestos;

        return manifestos.filter((manifesto) => {
            const haystack = [
                manifesto.partyName.en,
                manifesto.partyName.ne,
                manifesto.partyShort,
                manifesto.fileName,
            ]
                .join(" ")
                .toLowerCase();

            return haystack.includes(needle);
        });
    }, [manifestos, query]);

    const latestUpdated = useMemo(
        () => getLatestManifestoDate(manifestos, language),
        [language, manifestos]
    );

    const activeCycle = useMemo(() => manifestos[0]?.year ?? "2082", [manifestos]);

    return (
        <section className="election-typography min-h-screen bg-background">
            <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <motion.header
                    initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
                    animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="relative overflow-hidden border border-border/80 bg-card/80 p-6 md:p-8"
                >
                    <div className="pointer-events-none absolute inset-0 bg-primary/5" />
                    <div className="pointer-events-none absolute -left-24 top-10 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 border border-primary/25 bg-primary/10 px-3 py-1">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                                {tString(locale.archive, language)}
                            </span>
                        </div>

                        <h1 className="mt-4 font-bebas text-5xl uppercase leading-[0.92] tracking-tight text-foreground md:text-7xl">
                            {tString(locale.heading, language)}
                        </h1>

                        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                            {tString(locale.description, language)}
                        </p>

                        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                            <div className="border border-border/70 bg-background/80 p-4">
                                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                                    {tString(locale.stats.totalDocuments, language)}
                                </p>
                                <p className="mt-2 font-bebas text-4xl leading-none text-foreground">
                                    {manifestos.length}
                                </p>
                            </div>

                            <div className="border border-border/70 bg-background/80 p-4">
                                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                                    {tString(locale.stats.electionCycle, language)}
                                </p>
                                <p className="mt-2 font-bebas text-4xl leading-none text-foreground">
                                    {activeCycle}
                                </p>
                            </div>

                            <div className="border border-border/70 bg-background/80 p-4">
                                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                                    {tString(locale.stats.lastUpdated, language)}
                                </p>
                                <p className="mt-2 text-xl font-semibold leading-none text-foreground">
                                    {latestUpdated}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.header>

                <div className="mt-6 border border-border/80 bg-card/70 p-4 md:p-5">
                    <label className="relative block">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={tString(locale.searchPlaceholder, language)}
                            className="h-11 rounded-none border-border bg-background pl-9"
                            aria-label={tString(locale.searchPlaceholder, language)}
                        />
                    </label>
                </div>

                {filteredManifestos.length === 0 ? (
                    <div className="mt-6 border border-border/80 bg-card/70 p-10 text-center">
                        <h2 className="font-bebas text-3xl uppercase tracking-wide text-foreground">
                            {tString(locale.empty.title, language)}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground md:text-base">
                            {tString(locale.empty.body, language)}
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {filteredManifestos.map((manifesto, index) => (
                            <motion.article
                                key={manifesto.slug}
                                variants={tileMotion}
                                initial={shouldReduceMotion ? undefined : "hidden"}
                                whileInView={shouldReduceMotion ? undefined : "visible"}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.35, delay: index * 0.04 }}
                                className="group relative overflow-hidden border border-border/80 bg-card/80 transition-colors hover:border-primary/45"
                            >
                                <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 bg-primary/10 blur-2xl" />

                                <div className="aspect-[4/5] w-full overflow-hidden border-b border-border/70 bg-background">
                                    <iframe
                                        title={`${manifesto.partyName.en} manifesto preview`}
                                        src={getPdfCardPreviewSrc(manifesto.fileUrl)}
                                        className="h-full w-full pointer-events-none"
                                        loading="lazy"
                                    />
                                </div>

                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <Badge
                                            variant="outline"
                                            className="rounded-none border-primary/35 bg-primary/10 font-mono text-[10px] uppercase tracking-[0.16em] text-primary"
                                        >
                                            {manifesto.year}
                                        </Badge>
                                    </div>

                                    <h2 className="mt-4 text-xl font-semibold leading-tight text-foreground md:text-2xl">
                                        {manifesto.partyName[language]}
                                    </h2>

                                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                        {manifesto.blurb[language]}
                                    </p>

                                    <div className="mt-5 grid grid-cols-3 items-center gap-2">
                                        <Button asChild className="h-9 min-w-0 rounded-none px-2 text-[11px] uppercase tracking-[0.12em] whitespace-nowrap">
                                            <Link href={`/election-2026/manifesto/${manifesto.slug}`}>
                                                Open
                                                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                                            </Link>
                                        </Button>

                                        <Button
                                            variant="outline"
                                            asChild
                                            className="h-9 min-w-0 rounded-none border-border px-2 text-[11px] uppercase tracking-[0.12em] whitespace-nowrap"
                                        >
                                            <a href={manifesto.fileUrl} target="_blank" rel="noopener noreferrer">
                                                PDF
                                            </a>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            asChild
                                            className="h-9 min-w-0 rounded-none px-2 text-[11px] uppercase tracking-[0.12em] whitespace-nowrap"
                                        >
                                            <a
                                                href={manifesto.fileUrl}
                                                download={manifesto.fileName}
                                                aria-label="Download"
                                            >
                                                Download
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

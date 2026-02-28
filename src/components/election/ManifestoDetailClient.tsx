"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
    ArrowLeft,
    ArrowUpRight,
    Download,
    ExternalLink,
    FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import type { ManifestoDocument } from "@/lib/manifesto-data";

const revealMotion = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
};

interface ManifestoDetailClientProps {
    manifesto: ManifestoDocument;
    related: ManifestoDocument[];
}

export function ManifestoDetailClient({ manifesto, related }: ManifestoDetailClientProps) {
    const { language } = useLanguage();
    const shouldReduceMotion = useReducedMotion();
    const locale = LOCALES.election2026.manifestos;

    return (
        <section className="election-typography min-h-screen bg-background">
            <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <motion.header
                    variants={revealMotion}
                    initial={shouldReduceMotion ? undefined : "hidden"}
                    animate={shouldReduceMotion ? undefined : "visible"}
                    transition={{ duration: 0.45 }}
                    className="relative overflow-hidden border border-border/80 bg-card/80 p-6 md:p-8"
                >
                    <div className="pointer-events-none absolute inset-0 bg-primary/5" />
                    <div className="relative">
                        <Button asChild variant="ghost" className="mb-4 h-10 rounded-none px-3 text-xs uppercase tracking-[0.12em]">
                            <Link href="/election-2026/manifesto">
                                <ArrowLeft className="h-4 w-4" />
                                {tString(locale.actions.backToLibrary, language)}
                            </Link>
                        </Button>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="rounded-none border-primary/35 bg-primary/10 font-mono text-[10px] uppercase tracking-[0.15em] text-primary"
                            >
                                {tString(locale.labels.policyDossier, language)}
                            </Badge>
                            <Badge variant="outline" className="rounded-none font-mono text-[10px] uppercase tracking-[0.14em]">
                                {manifesto.year}
                            </Badge>
                        </div>

                        <h1 className="mt-4 text-4xl font-semibold leading-tight text-foreground md:text-6xl">
                            {manifesto.partyName[language]}
                        </h1>

                        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                            {manifesto.blurb[language]}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2">
                            <Badge variant="secondary" className="rounded-none px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest">
                                {tString(locale.labels.cycle, language)}: {manifesto.year}
                            </Badge>
                            <Badge variant="secondary" className="rounded-none px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest">
                                {tString(locale.labels.updated, language)}: {manifesto.updatedAtLabel[language]}
                            </Badge>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Button asChild className="h-11 rounded-none px-5 text-xs uppercase tracking-[0.12em]">
                                <a href={manifesto.fileUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                    {tString(locale.actions.openPdf, language)}
                                </a>
                            </Button>

                            <Button variant="outline" asChild className="h-11 rounded-none border-border px-5 text-xs uppercase tracking-[0.12em]">
                                <a href={manifesto.fileUrl} download={manifesto.fileName}>
                                    <Download className="h-4 w-4" />
                                    {tString(locale.actions.downloadPdf, language)}
                                </a>
                            </Button>
                        </div>
                    </div>
                </motion.header>

                <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <motion.article
                        variants={revealMotion}
                        initial={shouldReduceMotion ? undefined : "hidden"}
                        animate={shouldReduceMotion ? undefined : "visible"}
                        transition={{ duration: 0.45, delay: 0.08 }}
                        className="border border-border/80 bg-card/80 p-4 md:p-5"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="font-bebas text-3xl uppercase tracking-wide text-foreground md:text-4xl">
                                {tString(locale.preview.title, language)}
                            </h2>
                            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                                {manifesto.fileName}
                            </p>
                        </div>

                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                            {tString(locale.preview.note, language)}
                        </p>

                        <div className="mt-4 h-[74vh] min-h-[520px] w-full overflow-hidden border border-border/70 bg-background">
                            <iframe
                                title={`${manifesto.partyName.en} manifesto PDF`}
                                src={`${manifesto.fileUrl}#view=FitH`}
                                className="h-full w-full"
                            />
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>{tString(locale.preview.unavailable, language)}</span>
                            <Link
                                href={manifesto.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-mono uppercase tracking-widest text-primary"
                            >
                                {tString(locale.actions.openPdf, language)}
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </motion.article>

                    <motion.aside
                        variants={revealMotion}
                        initial={shouldReduceMotion ? undefined : "hidden"}
                        animate={shouldReduceMotion ? undefined : "visible"}
                        transition={{ duration: 0.45, delay: 0.12 }}
                        className="space-y-5"
                    >
                        <div className="border border-border/80 bg-card/80 p-5">
                            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                                {tString(locale.labels.sourceFile, language)}
                            </p>

                            <div className="mt-3 flex items-start gap-2">
                                <FileText className="mt-0.5 h-4 w-4 text-primary" />
                                <p className="text-sm leading-relaxed text-foreground">{manifesto.fileName}</p>
                            </div>

                            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                                <p>{tString(locale.labels.updated, language)}: {manifesto.updatedAtLabel[language]}</p>
                            </div>

                            <Button asChild className="mt-4 h-10 w-full rounded-none text-xs uppercase tracking-[0.12em]">
                                <a href={manifesto.fileUrl} target="_blank" rel="noopener noreferrer">
                                    {tString(locale.actions.openPdf, language)}
                                </a>
                            </Button>
                        </div>

                        {related.length > 0 ? (
                            <div className="border border-border/80 bg-card/80 p-5">
                                <h3 className="font-bebas text-2xl uppercase tracking-wide text-foreground">
                                    {tString(locale.related.heading, language)}
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {tString(locale.related.subtitle, language)}
                                </p>

                                <div className="mt-4 space-y-3">
                                    {related.map((item) => (
                                        <Link
                                            key={item.slug}
                                            href={`/election-2026/manifesto/${item.slug}`}
                                            className="group block border border-border/70 bg-background/70 px-3 py-2 transition-colors hover:border-primary/40"
                                        >
                                            <p className="text-sm font-medium text-foreground group-hover:text-primary">
                                                {item.partyName[language]}
                                            </p>
                                            <p className="mt-1 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                                                {item.year}
                                            </p>
                                        </Link>
                                    ))}
                                </div>

                                <Button asChild variant="outline" className="mt-4 h-10 w-full rounded-none text-xs uppercase tracking-[0.12em]">
                                    <Link href="/election-2026/manifesto">
                                        {tString(locale.actions.viewOtherManifestos, language)}
                                    </Link>
                                </Button>
                            </div>
                        ) : null}
                    </motion.aside>
                </div>
            </div>
        </section>
    );
}

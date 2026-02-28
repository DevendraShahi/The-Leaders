"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ILeader } from "@/models/Leader";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString, type LanguageCode } from "@/lib/locales";
import { cn } from "@/lib/utils";

type LocalizedField = { en?: string; ne?: string } | string | null | undefined;

const resolveContent = (field: LocalizedField, language: LanguageCode) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    const primary = language === "ne" ? field.ne : field.en;
    const fallback = language === "ne" ? field.en : field.ne;
    return primary || fallback || "";
};

const formatStatLabel = (key: string, language: LanguageCode) => {
    const cleaned = key.replace(/_/g, " ").replace(/-/g, " ").trim();
    if (!cleaned) return key;
    if (language === "ne") return cleaned;
    return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function LeaderDetailClient({ leader }: { leader: ILeader }) {
    const { language } = useLanguage();
    const locale = LOCALES.leadersDetail;

    const name = resolveContent(leader.name, language);
    const position = resolveContent(leader.position, language);
    const summary = resolveContent(leader.desc, language) || resolveContent(leader.bio, language);
    const bio = resolveContent(leader.bio, language) || summary;
    const era = resolveContent(leader.years, language);
    const affiliation = resolveContent(leader.party, language);
    const isLegacy = !leader.isActive || String(leader.status).toLowerCase() === "archived";
    const statusBadge = isLegacy ? tString(locale.badges.legacy, language) : tString(locale.badges.active, language);

    const statsEntries = useMemo(() => {
        if (!leader.stats || Array.isArray(leader.stats)) return [] as Array<[string, LocalizedField]>;
        return Object.entries(leader.stats) as Array<[string, LocalizedField]>;
    }, [leader.stats]);

    const timelineEntries = useMemo(() => {
        if (!Array.isArray(leader.timeline)) return [];
        return leader.timeline.filter((item) => item && (item.year || item.event));
    }, [leader.timeline]);

    return (
        <div className="homepage-shell leaders-canvas election-typography min-h-screen bg-background pb-16 font-sans">
            <section className="relative w-full border-y border-border/80">
                <div className="relative h-[34vh] min-h-[240px] sm:h-[42vh] lg:h-[52vh]">
                    <Image
                        src={leader.cover || leader.image || "/placeholder-cover.jpg"}
                        alt={name || "Leader profile"}
                        fill
                        priority
                        className="object-cover object-top home-image-base"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 home-image-overlay-strong" />
                    <div className="absolute inset-0 home-image-overlay-soft opacity-65" />
                </div>
            </section>

            <section className="container mx-auto px-4">
                <motion.article
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="border border-t-0 border-border/80 bg-card/52 p-5 sm:p-8 lg:p-10"
                >
                    <Link
                        href="/leaders"
                        className="mb-4 inline-flex h-10 w-fit items-center gap-2 border border-border/80 bg-background/70 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/90 transition-colors hover:border-primary/55 hover:text-primary"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        {tString(locale.backToRoster, language)}
                    </Link>

                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex border border-primary/45 bg-primary/14 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-primary">
                            {position || "—"}
                        </span>
                        <span className="inline-flex border border-border/75 bg-background/72 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-foreground/86">
                            {statusBadge}
                        </span>
                        {leader.isFeatured ? (
                            <span className="inline-flex border border-border/75 bg-background/72 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-foreground/86">
                                {tString(locale.badges.featured, language)}
                            </span>
                        ) : null}
                    </div>

                    <h1
                        className={cn(
                            "font-editorial max-w-5xl text-[clamp(2.1rem,7.8vw,5.8rem)] leading-[0.94] tracking-[-0.02em] text-foreground",
                            language === "ne" ? "font-semibold tracking-normal leading-[1.14]" : ""
                        )}
                    >
                        {name}
                    </h1>

                    {summary ? (
                        <p className="mt-3 max-w-3xl text-[0.98rem] leading-8 text-muted-foreground">{summary}</p>
                    ) : null}

                    <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
                        <div className="border border-border/80 bg-background/72 p-3 sm:p-4">
                            <p className="home-meta">{tString(locale.statusLabel, language)}</p>
                            <p className="mt-2 text-base text-foreground">{statusBadge}</p>
                        </div>
                        <div className="border border-border/80 bg-background/72 p-3 sm:p-4">
                            <p className="home-meta">{tString(locale.eraLabel, language)}</p>
                            <p className="mt-2 text-base text-foreground">{era || "—"}</p>
                        </div>
                        <div className="border border-border/80 bg-background/72 p-3 sm:p-4">
                            <p className="home-meta">{tString(locale.affiliationLabel, language)}</p>
                            <p className="mt-2 text-base text-foreground">{affiliation || "—"}</p>
                        </div>
                    </div>
                </motion.article>
            </section>

            <section className="container mx-auto mt-8 px-4">
                <div className="grid items-start gap-6 lg:grid-cols-[1.16fr_0.84fr]">
                    <motion.article
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={{ duration: 0.35 }}
                        className="border border-border/80 bg-card/58 p-6 sm:p-8"
                    >
                        <h2 className="home-title-md text-foreground">{tString(locale.storyHeading, language)}</h2>
                        <p className="mt-4 whitespace-pre-line text-[0.98rem] leading-8 text-muted-foreground">{bio || summary || "—"}</p>
                    </motion.article>

                    <motion.aside
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={{ duration: 0.35, delay: 0.05 }}
                        className="self-start border border-border/80 bg-card/58 p-6 sm:p-8"
                    >
                        <h3 className="home-title-md border-b border-border/80 pb-4 text-foreground">{tString(locale.timelineHeading, language)}</h3>

                        {timelineEntries.length > 0 ? (
                            <div className="relative mt-6 space-y-7">
                                <div className="absolute bottom-1 left-[0.46rem] top-1 w-px bg-border/95" />
                                {timelineEntries.map((item, index) => (
                                    <div key={`${item.year}-${index}`} className="relative pl-7">
                                        <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />
                                        <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-primary">{item.year || "—"}</p>
                                        <p className="mt-1 text-[0.98rem] leading-7 text-foreground/86">
                                            {resolveContent(item.event, language) || "—"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 text-sm leading-7 text-muted-foreground">{tString(locale.noTimeline, language)}</p>
                        )}

                        <div className="mt-8 border-t border-border/80 pt-6">
                            <h3 className="home-title-md text-foreground">{tString(locale.keyStatsHeading, language)}</h3>
                            {statsEntries.length > 0 ? (
                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                    {statsEntries.map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="border border-border/80 bg-background/72 p-4 transition-colors hover:border-primary/45"
                                        >
                                            <p className="home-meta">{formatStatLabel(key, language)}</p>
                                            <p className="mt-2 text-[0.98rem] leading-7 text-foreground/88">
                                                {resolveContent(value, language) || "—"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-4 text-[0.98rem] leading-7 text-muted-foreground">{tString(locale.noStats, language)}</p>
                            )}
                        </div>
                    </motion.aside>
                </div>
            </section>
        </div>
    );
}

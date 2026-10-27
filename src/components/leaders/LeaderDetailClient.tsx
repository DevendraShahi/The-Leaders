"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Twitter, Globe, Linkedin, MapPin, Calendar, ExternalLink, BookOpen } from "lucide-react";
import { ILeader } from "@/models/Leader";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString, type LanguageCode } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "@/components/common/MarkdownContent";
import { LEADER_PORTRAIT_MAP, LEADER_WIKI_MAP } from "@/components/home/NewsArchiveSpotlight";

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

const formatDate = (date: Date | string | undefined, language: LanguageCode): string => {
    if (!date) return "";
    const d = new Date(date);
    if (language === "ne") {
        const neDigits = ["0", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
        const day = d.getDate().toString().split("").map(c => neDigits[parseInt(c)] || c).join("");
        const month = d.toLocaleDateString("ne-NP", { month: "long" });
        const year = d.getFullYear().toString().split("").map(c => neDigits[parseInt(c)] || c).join("");
        return `${day} ${month} ${year}`;
    }
    return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
};

const SocialIcon = ({ platform }: { platform: string }) => {
    const iconClass = "w-4 h-4";
    const p = platform.toLowerCase();
    
    if (p.includes("twitter") || p.includes("x")) {
        return (
            <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        );
    }
    if (p.includes("facebook")) {
        return (
            <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        );
    }
    if (p.includes("instagram")) {
        return (
            <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
        );
    }
    if (p.includes("linkedin")) {
        return <Linkedin className={iconClass} />;
    }
    return <Globe className={iconClass} />;
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
    })
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

    const statsEntries = useMemo(() => {
        if (!leader.stats || Array.isArray(leader.stats)) return [] as Array<[string, LocalizedField]>;
        return Object.entries(leader.stats) as Array<[string, LocalizedField]>;
    }, [leader.stats]);

    const timelineEntries = useMemo(() => {
        if (!Array.isArray(leader.timeline)) return [];
        return leader.timeline.filter((item) => item && (item.year || item.event));
    }, [leader.timeline]);

    const socialLinks = useMemo(() => {
        if (!leader.socialLinks || !Array.isArray(leader.socialLinks)) return [];
        return leader.socialLinks.filter(link => link && link.platform && link.url);
    }, [leader.socialLinks]);

    const hasBirthDate = !!leader.birthDate;
    const hasDeathDate = !!leader.deathDate;

    const portraitImage = (leader.slug && LEADER_PORTRAIT_MAP[leader.slug]) || leader.image;
    const wikiUrl = (leader.slug && LEADER_WIKI_MAP[leader.slug]) || (leader.name?.en ? `https://en.wikipedia.org/wiki/${encodeURIComponent(leader.name.en.replace(/\s+/g, "_"))}` : null);

    return (
        <div className="leader-canvas min-h-screen">
            {/* Hero Section - Full Width */}
            <motion.section 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative w-full"
            >
                <div className="relative h-[40vh] min-h-[300px] sm:h-[45vh] lg:h-[50vh]">
                    <Image
                        src={leader.cover || portraitImage || "/the-leaders-banner.png"}
                        alt={name || "Leader profile"}
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 leader-hero-overlay" />
                </div>
            </motion.section>

            {/* Main Content - Clean Layout */}
            <section className="container mx-auto px-4 py-10 lg:py-14">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
                >
                    {/* Left Column - Profile Info + Bio */}
                    <motion.div 
                        custom={0}
                        variants={itemVariants}
                        className="lg:col-span-8 space-y-8"
                    >
                        {/* Profile Header Card */}
                        <div className="leader-card p-6 sm:p-8 lg:p-10">
                            <Link prefetch={false}
                                href="/leaders"
                                className="inline-flex items-center gap-2 text-sm text-[var(--leader-text-secondary)] hover:text-[var(--leader-accent)] transition-colors mb-6"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {tString(locale.backToRoster, language)}
                            </Link>

                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
                                <div className="flex items-start gap-4 sm:gap-6">
                                    {portraitImage && (
                                        <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xs overflow-hidden border border-[var(--leader-border)] shrink-0 shadow-xs bg-muted/40">
                                            <Image
                                                src={portraitImage}
                                                alt={name}
                                                fill
                                                className="object-cover object-top filter grayscale contrast-105 hover:grayscale-0 transition-all duration-500"
                                                sizes="96px"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        {position && (
                                            <span className="leader-badge leader-badge-primary mb-3">
                                                {position}
                                            </span>
                                        )}
                                        <h1 className={cn(
                                            "leader-h1",
                                            language === "ne" ? "font-semibold tracking-normal" : ""
                                        )}>
                                            {name}
                                        </h1>
                                        {wikiUrl && (
                                            <div className="mt-2.5">
                                                <a
                                                    href={wikiUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted border border-border/70 rounded-xs transition-colors"
                                                >
                                                    <span>{language === "ne" ? "विकिपिडिया अभिलेख" : "Wikipedia Archive"}</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {leader.isFeatured && (
                                    <span className="leader-badge leader-badge-secondary self-start">
                                        {tString(locale.badges.featured, language)}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-y-2 text-sm text-[var(--leader-text-secondary)] pb-6 border-b border-[var(--leader-border)]">
                                {affiliation && (
                                    <span className="flex items-center gap-2 pr-6 border-r border-[var(--leader-border)]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--leader-accent)] flex-shrink-0" />
                                        <span className="truncate">{affiliation}</span>
                                    </span>
                                )}
                                {era && (
                                    <span className="flex items-center gap-2 pl-0 sm:pl-4">
                                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{era}</span>
                                    </span>
                                )}
                            </div>

                            {summary && (
                                <div className="pt-6">
                                    <p className="leader-body text-lg leading-relaxed">
                                        {summary}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Biography Section */}
                        <div className="leader-card p-6 sm:p-8 lg:p-10">
                            <h2 className="leader-h2 pb-4 mb-6 border-b border-[var(--leader-border)]">
                                {tString(locale.storyHeading, language)}
                            </h2>
                            
                            <MarkdownContent 
                                content={bio || summary} 
                                showLanguageAlert={true} 
                            />

                            {socialLinks.length > 0 && (
                                <div className="mt-10 pt-6 border-t border-[var(--leader-border)]">
                                    <p className="leader-meta mb-4">Connect</p>
                                    <div className="leader-social">
                                        {socialLinks.map((link, index) => (
                                            <a
                                                key={index}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="leader-social-link"
                                                aria-label={link.platform}
                                            >
                                                <SocialIcon platform={link.platform} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Column - Sidebar */}
                    <motion.aside 
                        custom={1}
                        variants={itemVariants}
                        className="lg:col-span-4 space-y-6"
                    >
                        {/* Important Dates */}
                        {(hasBirthDate || hasDeathDate) && (
                            <div className="leader-card p-5">
                                <p className="leader-meta mb-4">Important Dates</p>
                                <div className="space-y-4">
                                    {hasBirthDate && (
                                        <div className="flex items-start gap-3">
                                            <Calendar className="w-4 h-4 mt-0.5 text-[var(--leader-accent)]" />
                                            <div>
                                                <p className="text-xs text-[var(--leader-muted)] uppercase tracking-wider">Born</p>
                                                <p className="leader-date"><span>{formatDate(leader.birthDate, language)}</span></p>
                                            </div>
                                        </div>
                                    )}
                                    {hasDeathDate && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 mt-0.5 text-[var(--leader-accent)]" />
                                            <div>
                                                <p className="text-xs text-[var(--leader-muted)] uppercase tracking-wider">Died</p>
                                                <p className="leader-date"><span>{formatDate(leader.deathDate, language)}</span></p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="leader-card p-5">
                            <h3 className="leader-h3 pb-3 mb-5 border-b border-[var(--leader-border)]">
                                {tString(locale.timelineHeading, language)}
                            </h3>

                            {timelineEntries.length > 0 ? (
                                <div className="leader-timeline">
                                    {timelineEntries.map((item, index) => (
                                        <motion.div
                                            key={`${item.year}-${index}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className="leader-timeline-item"
                                        >
                                            <div className="leader-timeline-dot" />
                                            <p className="leader-timeline-year">{item.year || "—"}</p>
                                            <div className="leader-timeline-event">
                                                <MarkdownContent 
                                                    content={item.event} 
                                                    showLanguageAlert={false} 
                                                    className="text-sm"
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <p className="leader-body text-sm italic opacity-70">
                                    {tString(locale.noTimeline, language)}
                                </p>
                            )}
                        </div>

                        {/* Key Stats */}
                        <div className="leader-card p-5">
                            <h3 className="leader-h3 pb-3 mb-5 border-b border-[var(--leader-border)]">
                                {tString(locale.keyStatsHeading, language)}
                            </h3>

                            {statsEntries.length > 0 ? (
                                <div className="space-y-3">
                                    {statsEntries.map(([key, value]) => (
                                        <div key={key} className="leader-stat">
                                            <p className="leader-stat-label">{formatStatLabel(key, language)}</p>
                                            <p className="leader-stat-value">
                                                {resolveContent(value, language) || "—"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="leader-body text-sm italic opacity-70">
                                    {tString(locale.noStats, language)}
                                </p>
                            )}
                        </div>

                        {/* Archival Sources & Verification */}
                        <div className="leader-card p-5">
                            <h3 className="leader-h3 pb-3 mb-4 border-b border-[var(--leader-border)] flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-[var(--leader-accent)]" />
                                    <span>{language === "ne" ? "ऐतिहासिक स्रोत तथा अभिलेख" : "Archival Sources & Verification"}</span>
                                </span>
                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                            </h3>

                            <div className="space-y-2.5">
                                {(leader.dataSources && leader.dataSources.length > 0) ? (
                                    leader.dataSources.map((source, idx) => (
                                        <a
                                            key={idx}
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-3 rounded-xs border border-[var(--leader-border)] bg-[var(--leader-surface)] hover:border-[var(--leader-accent)] transition-colors group"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-semibold text-foreground group-hover:text-[var(--leader-accent)]">
                                                    {source.title || (language === "ne" ? "विकिपिडिया जीवनी अभिलेख" : "Wikipedia Biographical Archive")}
                                                </span>
                                                <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-[var(--leader-accent)] shrink-0" />
                                            </div>
                                            <p className="text-[10px] font-mono text-muted-foreground mt-1 truncate">
                                                {source.url}
                                            </p>
                                        </a>
                                    ))
                                ) : wikiUrl ? (
                                    <a
                                        href={wikiUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-3 rounded-xs border border-[var(--leader-border)] bg-[var(--leader-surface)] hover:border-[var(--leader-accent)] transition-colors group"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-semibold text-foreground group-hover:text-[var(--leader-accent)]">
                                                {language === "ne" ? "विकिपिडिया खुला ऐतिहासिक अभिलेख" : "Wikipedia Open Biographical Archive"}
                                            </span>
                                            <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-[var(--leader-accent)] shrink-0" />
                                        </div>
                                        <p className="text-[10px] font-mono text-muted-foreground mt-1 truncate">
                                            {wikiUrl}
                                        </p>
                                    </a>
                                ) : null}
                            </div>
                        </div>
                    </motion.aside>
                </motion.div>
            </section>
        </div>
    );
}

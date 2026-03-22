"use client";

import { motion } from "framer-motion";
import { ElectionMap } from "../../../components/election/ElectionMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImpressivePieChart } from "./charts/ImpressivePieChart";
import { TurnoutTrendChart } from "./charts/TurnoutTrendChart";
import { TabbedDemographics } from "./charts/TabbedDemographics";
import { RegionalBreakdownChart } from "./charts/RegionalBreakdownChart";
import { DistrictNewsPanel } from "./DistrictNewsPanel";
import { getAnalyticsData } from "@/lib/analytics-data";
import { ElectionSpecial } from "@/components/home/ElectionSpecial";
import { useElectionStore } from "@/lib/election-store";
import {
    TrendingUp,
    Bell,
    ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import type { CandidateDataSummary } from "@/lib/candidate-data-summary";

// Helper for content resolution (if we had bilingual data, currently mostly static strings or en-only data)
const resolveContent = (content: any, language: "en" | "ne") => {
    if (!content) return "";
    if (typeof content === "string") return content;
    return tString(content, language);
};

interface AnalyticsDashboardProps {
    latestBrief?: any;
    latestFactCheck?: any;
    candidateSummary?: CandidateDataSummary;
    electionArticles?: {
        title_en: string;
        excerpt_en: string;
        content_en: string;
        slug: string;
        image?: string;
        tags?: string[];
        status: string;
        createdAt?: string;
        // Optional Nepali fields if available in future
        title_ne?: string;
        excerpt_ne?: string;
    }[];
    allBriefs?: any[];
    allFactChecks?: any[];
}

export default function AnalyticsDashboard({
    latestBrief,
    latestFactCheck,
    candidateSummary,
    electionArticles = [],
    allBriefs = [],
    allFactChecks = [],
}: AnalyticsDashboardProps) {
    const analytics = getAnalyticsData();
    const { selectedDistrict } = useElectionStore();
    const { language } = useLanguage();
    const l = LOCALES.election2026;
    const demographicsData = candidateSummary
        ? {
            ...analytics.demographicsData,
            genderDistribution: candidateSummary.genderBreakdown.map((entry) => ({
                gender: entry.gender,
                count: entry.count,
                percentage: entry.percentage,
            })),
        }
        : analytics.demographicsData;

    return (
        <div className="election-typography min-h-screen bg-background">
            {/* Hero Section */}
            <motion.section
                className="relative overflow-hidden border-b border-border/10 bg-gradient-to-br from-[#B71C1C]/10 via-background to-background"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <div className="absolute inset-0 bg-[linear-gradient(rgba(183,28,28,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(183,28,28,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />

                <div className="container relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-block px-4 py-1 bg-[#B71C1C] text-white backdrop-blur-sm mb-6">
                            <span className="flex items-center gap-2 font-bebas text-sm tracking-widest uppercase">
                                <TrendingUp className="h-4 w-4" />
                                {tString(l.hero.label, language)}
                            </span>
                        </div>

                        <h1 className="mt-6 font-bebas text-6xl leading-[0.9] tracking-tight md:text-7xl lg:text-8xl">
                            <span className="block text-foreground">{tString(l.hero.heading, language).split(" ").slice(0, 2).join(" ")}</span>
                            <span className="block bg-gradient-to-r from-[#B71C1C] to-[#D32F2F] bg-clip-text text-transparent">
                                {tString(l.hero.heading, language).split(" ").slice(2).join(" ")}
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                            {tString(l.hero.description, language)}
                        </p>
                    </motion.div>
                </div>
            </motion.section>

            {/* Road to 2026 Election Section */}
            <ElectionSpecial
                dailyBriefs={allBriefs.slice(0, 6)}
                factChecks={allFactChecks.slice(0, 6)}
                analyses={electionArticles.slice(0, 6)}
            />

            {/* Main Content - Spacious Vertical Layout */}
            <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="space-y-24">

                    {/* Section 1: Interactive Map */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4"
                    >
                        <div className="text-center">
                            <h2 className="font-bebas text-4xl uppercase tracking-wide text-foreground md:text-5xl">
                                {tString(l.map.title, language)}
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                {tString(l.map.description, language)}
                            </p>
                        </div>

                        {/* Backgroundless map container with Overlay */}
                        <div className="relative h-[400px] w-full overflow-hidden md:h-[600px]">
                            <ElectionMap className="h-full w-full" />
                        </div>
                        <p className="mt-4 text-center text-sm text-muted-foreground md:mt-6">
                            {selectedDistrict
                                ? `Selected: ${selectedDistrict} - Click again to view details`
                                : tString(l.map.placeholder, language)
                            }
                        </p>
                    </motion.section>

                    {/* Subtle Divider */}
                    <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                    {/* Section: 2026/2082 Election Results Pie */}
                    <motion.section
                        className="space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4169E1] text-white text-[11px] font-mono uppercase tracking-widest mb-4">
                                {language === "en" ? "Official Final Results · March 5, 2026" : "आधिकारिक अन्तिम नतिजा · फाल्गुन २१, २०८२"}
                            </div>
                            <h2 className="font-bebas text-4xl uppercase tracking-wide text-foreground md:text-5xl">
                                {language === "en" ? "2026 Election Results" : "२०८२ निर्वाचन परिणाम"}
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                {language === "en"
                                    ? "Verified total seats (275) with PR vote share and FPTP / PR seat breakdown"
                                    : "प्रमाणित कुल सिट (२७५) — समानुपातिक मत प्रतिशत र प्रत्यक्ष/समानुपातिक विभाजन"}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {language === "en"
                                    ? "RSP's 182-seat landslide is the largest single-party majority since democracy was restored in 1991."
                                    : "RSP को १८२ सिटको ऐतिहासिक जित — १९९१ पछिको सबभन्दा ठूलो एकल दलको बहुमत।"}
                            </p>
                            <div className="mt-3 flex flex-wrap justify-center gap-2">
                                <a
                                    href="https://en.wikipedia.org/wiki/2026_Nepalese_general_election"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center border border-border/65 bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
                                >
                                    {language === "en" ? "Source: Wikipedia (2026 Nepalese general election)" : "स्रोत: विकिपिडिया (२०८२ नेपाल आम निर्वाचन)"}
                                </a>
                                <a
                                    href="https://election.gov.np/np"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center border border-border/65 bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
                                >
                                    {language === "en" ? "Election Commission Nepal" : "निर्वाचन आयोग नेपाल"}
                                </a>
                            </div>
                        </div>
                        <div className="mx-auto w-full max-w-7xl">
                            <ImpressivePieChart data={analytics.electionResults2082} />
                        </div>
                    </motion.section>

                    {/* Subtle Divider */}
                    <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                    {/* Section: 2022 Election Results Pie */}
                    <motion.section
                        className="space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="text-center">
                            <h2 className="font-bebas text-4xl uppercase tracking-wide text-foreground md:text-5xl">
                                {language === "en" ? "2022 Election Results" : "२०७९ निर्वाचन परिणाम"}
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                {language === "en"
                                    ? "Verified total seats with PR vote share and PR seats"
                                    : "प्रमाणित कुल सिट, समानुपातिक मत प्रतिशत र समानुपातिक सिट"}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {language === "en"
                                    ? "Tap or hover a party row or pie slice to inspect details."
                                    : "विवरण हेर्न दलको पंक्ति वा पाइ स्लाइसमा ट्याप/होभर गर्नुहोस्।"}
                            </p>
                            <a
                                href="https://en.wikipedia.org/wiki/2022_Nepalese_general_election"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center border border-border/65 bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
                            >
                                {language === "en" ? "Source: Wikipedia (2022 Nepalese general election)" : "स्रोत: विकिपिडिया (२०७९ नेपाल आम निर्वाचन)"}
                            </a>
                        </div>
                        <div className="mx-auto w-full max-w-7xl">
                            <ImpressivePieChart data={analytics.electionResults2079} />
                        </div>
                    </motion.section>

                    {/* Subtle Divider */}
                    <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                    {/* Section: 2074 Election Results Pie */}
                    <motion.section
                        className="space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="text-center">
                            <h2 className="font-bebas text-4xl uppercase tracking-wide text-foreground md:text-5xl">
                                {language === "en" ? "2074 Election Results" : "२०७४ निर्वाचन परिणाम"}
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                {language === "en"
                                    ? "Verified total seats with PR vote share and PR seats"
                                    : "प्रमाणित कुल सिट, समानुपातिक मत प्रतिशत र समानुपातिक सिट"}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {language === "en"
                                    ? "Tap or hover a party row or pie slice to inspect details."
                                    : "विवरण हेर्न दलको पंक्ति वा पाइ स्लाइसमा ट्याप/होभर गर्नुहोस्।"}
                            </p>
                            <a
                                href="https://en.wikipedia.org/wiki/2017_Nepalese_legislative_election"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center border border-border/65 bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
                            >
                                {language === "en" ? "Source: Wikipedia (2017 Nepalese legislative election)" : "स्रोत: विकिपिडिया (२०७४ नेपालको संसदीय निर्वाचन)"}
                            </a>
                        </div>
                        <div className="mx-auto w-full max-w-7xl">
                            <ImpressivePieChart data={analytics.electionResults2074} />
                        </div>
                    </motion.section>

                    {/* Subtle Divider */}
                    <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                    {/* Section 2: Voter Turnout Trends */}
                    <motion.section
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <div className="text-center">
                            <h2 className="font-bebas text-4xl uppercase tracking-wide text-foreground md:text-5xl">
                                {tString(l.turnout.title, language)}
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                {tString(l.turnout.subtitle, language)}
                            </p>
                        </div>
                        <div className="mx-auto max-w-5xl">
                            <TurnoutTrendChart data={analytics.turnoutHistory} />
                        </div>
                    </motion.section>

                    {/* Subtle Divider */}
                    <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                    {/* Section 5: Provincial Breakdown */}
                    <motion.section
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <div className="text-center">
                            <h2 className="font-bebas text-4xl uppercase tracking-wide text-foreground md:text-5xl">
                                {tString(l.provincial.title, language)}
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                {language === "en"
                                    ? "2026 province-wise FPTP winners and PR vote share"
                                    : "२०८२ प्रदेशगत प्रत्यक्ष विजेता र समानुपातिक मत हिस्सा"}
                            </p>
                        </div>
                        <RegionalBreakdownChart data={analytics.regionalBreakdown} />

                        <div className="rounded-lg border border-border/60 bg-card/45 p-4 sm:p-5">
                            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                                {language === "en" ? "Provincial Reference Notes" : "प्रदेशगत सन्दर्भ नोट"}
                            </p>
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                {language === "en"
                                    ? "FPTP seat totals are verified (RSP 125, NC 18, UML 9, NCP 8, SSP 3, RPP 1, IND 1 = 165). Provincial PR vote shares are approximated from national figures (RSP 47.8%, NC 19.1%, UML 13.4%) and available constituency data — exact provincial PR splits were not published by ECN."
                                    : "प्रत्यक्ष सिट संख्या प्रमाणित छ (RSP १२५, कांग्रेस १८, एमाले ९, NCP ८, SSP ३, RPP १, IND १ = १६५)। प्रदेशगत समानुपातिक मत राष्ट्रिय तथ्याङ्क र उपलब्ध क्षेत्रगत डेटाबाट अनुमान गरिएको हो।"}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <a
                                    href="https://en.wikipedia.org/wiki/2026_Nepalese_general_election"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="border border-border/65 bg-background/70 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
                                >
                                    Wikipedia (2026 Election)
                                </a>
                                <a
                                    href="https://election.gov.np/en/page/result-hor"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="border border-border/65 bg-background/70 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
                                >
                                    ECN Official Results
                                </a>
                                <a
                                    href="https://kathmandupost.com/national/2026/03/09/rsp-wins-125-fptp-seats-maintains-wide-lead-in-proportional-representation-vote-count"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="border border-border/65 bg-background/70 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
                                >
                                    Kathmandu Post
                                </a>
                            </div>
                        </div>
                    </motion.section>

                    {/* Section 6-7: Combined Demographics (Tabbed) */}
                    <motion.section
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <div className="text-center">
                            <h2 className="font-bebas text-4xl uppercase tracking-wide text-foreground md:text-5xl">
                                {tString(l.demographics.title, language)}
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                {tString(l.demographics.subtitle, language)}
                            </p>
                        </div>
                        <div className="mx-auto max-w-5xl">
                            <TabbedDemographics data={demographicsData} />
                        </div>
                    </motion.section>

                    {/* Subtle Divider */}
                    <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                    {/* Section 8: Election Analyses */}
                    {electionArticles.length > 0 && (
                        <>
                            <motion.section
                                className="space-y-6"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                            >
                                <div className="text-center">
                                    <h2 className="font-bebas text-4xl uppercase tracking-wide text-foreground md:text-5xl">
                                        {tString(l.analyses.title, language)}
                                    </h2>
                                    <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                                        {tString(l.analyses.description, language)}
                                    </p>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {electionArticles.map((article, index) => (
                                        <motion.div
                                            key={article.slug}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "-60px" }}
                                            transition={{ duration: 0.4, delay: index * 0.05 }}
                                        >
                                            <Card className="h-full border-border/40 rounded-none bg-card flex flex-col group">
                                                {article.image && (
                                                    <div className="relative h-36 w-full overflow-hidden border-b border-border/60">
                                                        <img
                                                            src={article.image}
                                                            alt={article.title_en}
                                                            className="h-full w-full object-cover object-center"
                                                            loading="lazy"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-transparent to-transparent" />
                                                    </div>
                                                )}
                                                <CardHeader className="pb-3 border-b border-dashed border-border/60">
                                                    <CardTitle className="font-bebas text-xl tracking-wide text-foreground">
                                                        <Link
                                                            href={`/election-2026/analyses/${article.slug}`}
                                                            className="hover:text-primary transition-colors"
                                                        >
                                                            {language === 'ne' && article.title_ne ? article.title_ne : article.title_en}
                                                        </Link>
                                                    </CardTitle>
                                                    {article.createdAt && (
                                                        <p className="mt-1 text-[11px] text-muted-foreground font-mono uppercase tracking-[0.2em]">
                                                            {new Date(article.createdAt).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric",
                                                            })}
                                                        </p>
                                                    )}
                                                </CardHeader>
                                                <CardContent className="flex-1 flex flex-col pt-4">
                                                    <p className="text-sm text-muted-foreground font-manrope leading-relaxed line-clamp-4 mb-4">
                                                        {language === 'ne' && article.excerpt_ne ? article.excerpt_ne : article.excerpt_en}
                                                    </p>
                                                    <div className="mt-auto pt-3 border-t border-dashed border-border flex items-center justify-between gap-2">
                                                        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.25em]">
                                                            Deep dive &mdash; Election 2026
                                                        </p>
                                                        <Link
                                                            href={`/election-2026/analyses/${article.slug}`}
                                                            className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary hover:text-primary/80"
                                                        >
                                                            {tString(l.analyses.readAnalysis, language)} →
                                                        </Link>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="mt-8 flex justify-center">
                                    <Button
                                        variant="outline"
                                        className="rounded-none border-border/60 font-mono text-[11px] uppercase tracking-[0.25em]"
                                        asChild
                                    >
                                        <Link href="/election-2026/analyses">{tString(l.analyses.viewAll, language)}</Link>
                                    </Button>
                                </div>
                            </motion.section>

                            {/* Subtle Divider */}
                            <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                        </>
                    )}

                    {/* Section 8: Additional Resources */}
                    <motion.section
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <div className="text-center">
                            <h2 className="font-bebas text-3xl uppercase tracking-wide text-muted-foreground md:text-4xl">
                                {tString(l.resources.title, language)}
                            </h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Daily Brief */}
                            {latestBrief && (
                                <Card className="border-border/30">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 font-bebas text-xl uppercase">
                                            <Bell className="h-4 w-4 text-muted-foreground" />
                                            {tString(l.resources.dailyBrief, language)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Link href={`/election-2026/daily-brief/${latestBrief.slug}`} className="block group/link">
                                            <h4 className="font-bold leading-tight transition-colors group-hover/link:text-[#B71C1C]">
                                                {resolveContent(latestBrief.title, language)}
                                            </h4>
                                            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                                {resolveContent(latestBrief.summary, language)}
                                            </p>
                                        </Link>
                                        <Button variant="outline" size="sm" className="mt-4" asChild>
                                            <Link href="/election-2026/daily-brief">{tString(l.resources.viewAllBriefs, language)}</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Fact Check */}
                            {latestFactCheck && (
                                <Card className="border-border/30">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 font-bebas text-xl uppercase">
                                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                            {tString(l.resources.factCheck, language)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <h4 className="font-bold leading-tight">
                                            &ldquo;{resolveContent(latestFactCheck.claim, language)}&rdquo;
                                        </h4>
                                        <div className="my-3 inline-block rounded bg-muted px-2 py-1 text-xs font-bold uppercase text-foreground">
                                            {resolveContent(latestFactCheck.verdict, language)}
                                        </div>
                                        <p className="line-clamp-2 text-sm text-muted-foreground">
                                            {resolveContent(latestFactCheck.analysis, language)}
                                        </p>
                                        <Button variant="outline" size="sm" className="mt-4" asChild>
                                            <Link href="/election-2026/fact-checks">{tString(l.resources.allVerifications, language)}</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </motion.section>

                </div>
            </div>

            {/* District News Panel */}
            <DistrictNewsPanel
                district={selectedDistrict}
            />
        </div>
    );
}

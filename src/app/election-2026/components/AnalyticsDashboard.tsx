"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ElectionMap } from "../../../components/election/ElectionMap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImpressivePieChart } from "./charts/ImpressivePieChart";
import { TurnoutTrendChart } from "./charts/TurnoutTrendChart";
import { TabbedDemographics } from "./charts/TabbedDemographics";
import { RegionalBreakdownChart } from "./charts/RegionalBreakdownChart";
import { DistrictNewsPanel } from "./DistrictNewsPanel";
import { TrendingTopicsSection } from "./TrendingTopicsSection";
import { getAnalyticsData, getDistrictNews } from "@/lib/analytics-data";
import { useElectionStore } from "@/lib/election-store";
import { TrendingUp, Bell, ShieldCheck, Award } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AnalyticsDashboardProps {
    latestBrief?: any;
    latestFactCheck?: any;
    electionArticles?: {
        title_en: string;
        excerpt_en: string;
        content_en: string;
        slug: string;
        tags?: string[];
        status: string;
        createdAt?: string;
    }[];
}

export default function AnalyticsDashboard({
    latestBrief,
    latestFactCheck,
    electionArticles = [],
}: AnalyticsDashboardProps) {
    const analytics = getAnalyticsData();
    const { selectedDistrict } = useElectionStore();
    const [districtNewsOpen, setDistrictNewsOpen] = useState(false);
    const districtNews = selectedDistrict ? getDistrictNews(selectedDistrict) : null;

    // Open district panel when district is selected
    useState(() => {
        if (selectedDistrict && getDistrictNews(selectedDistrict)) {
            setDistrictNewsOpen(true);
        }
    });

    return (
        <div className="min-h-screen bg-background">
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
                                Live Analytics Dashboard
                            </span>
                        </div>

                        <h1 className="mt-6 font-bebas text-6xl leading-[0.9] tracking-tight md:text-7xl lg:text-8xl">
                            <span className="block text-foreground">ELECTION 2026</span>
                            <span className="block bg-gradient-to-r from-[#B71C1C] to-[#D32F2F] bg-clip-text text-transparent">
                                DATA & INSIGHTS
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                            Comprehensive analytics, real-time projections, and district-level insights.
                            Explore interactive charts and click any district on the map for detailed updates.
                        </p>
                    </motion.div>
                </div>
            </motion.section>

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
                                Interactive District Map
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                Click any district to view detailed news, demographics, and historical results
                            </p>
                        </div>

                        {/* Backgroundless map container with Overlay */}
                        <div className="relative h-[400px] w-full overflow-hidden rounded-xl md:h-[600px]">
                            <ElectionMap className="h-full w-full" />
                        </div>
                        <p className="mt-4 text-center text-sm text-muted-foreground md:mt-6">
                            {selectedDistrict
                                ? `Selected: ${selectedDistrict} - Click again to view details`
                                : "Click any district to explore local election data"
                            }
                        </p>
                    </motion.section>

                    {/* Subtle Divider */}
                    <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                    {/* Section 2: Most Competitive Races */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4 md:space-y-6"
                    >
                        <div className="text-center">
                            <h2 className="font-bebas text-4xl uppercase tracking-wide text-foreground md:text-5xl">
                                Most Competitive Races
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                Districts with the closest projected margins
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                            {analytics.districtCompetitiveness.map((district, index) => (
                                <motion.div
                                    key={district.district}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.4 }}
                                >
                                    {/* Competitive race cards with subtle borders */}
                                    <div className="group rounded-lg border border-border/50 bg-background/50 p-4 transition-all hover:border-border hover:shadow-sm">
                                        <div className="flex items-start justify-between">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B71C1C]/10 font-bebas text-lg text-[#B71C1C]">
                                                {index + 1}
                                            </div>
                                            {index === 0 && (
                                                <Award className="h-5 w-5 text-yellow-500" />
                                            )}
                                        </div>
                                        <h4 className="mt-3 font-bebas text-xl uppercase leading-tight text-foreground md:text-2xl">
                                            {district.district}
                                        </h4>

                                        <div className="mt-4 space-y-3">
                                            <div className="flex items-baseline justify-between">
                                                <span className="text-xs uppercase tracking-wider text-muted-foreground">Margin</span>
                                                <span className="font-bebas text-2xl text-[#B71C1C] md:text-3xl">
                                                    {district.margin}%
                                                </span>
                                            </div>
                                            <div className="rounded-lg bg-muted/20 p-3">
                                                <p className="text-xs uppercase tracking-wider text-muted-foreground">Leading Party</p>
                                                <p className="mt-1 font-bold text-foreground">{district.leadingParty}</p>
                                            </div>
                                            <div>
                                                <div className="h-2 overflow-hidden rounded-full bg-muted/30">
                                                    <motion.div
                                                        className="h-full bg-[#B71C1C]"
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${100 - district.competitivenessScore}%` }}
                                                        viewport={{ once: true }}
                                                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                                    />
                                                </div>
                                                <p className="mt-1.5 text-xs text-muted-foreground">
                                                    Competitiveness: {district.competitivenessScore}/100
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Subtle Divider */}
                    <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                    {/* Section 3: Party Projections */}
                    <motion.section
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <div className="space-y-24">
                            <ImpressivePieChart
                                data={analytics.partyProjections}
                                title="2026 Seat Projections"
                                subtitle="Projected parliamentary seat distribution"
                            />

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-border/50"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-background px-3 text-sm text-muted-foreground uppercase tracking-widest">
                                        vs Previous Election
                                    </span>
                                </div>
                            </div>

                            <ImpressivePieChart
                                data={analytics.electionResults2079}
                                title="2022 Election Results"
                                subtitle="Actual results from 2022 General Election (2079 BS)"
                            />
                        </div>
                    </motion.section>

                    {/* Subtle Divider */}
                    <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                    {/* Section 4: Voter Turnout Trends */}
                    <motion.section
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <div className="text-center">
                            <h2 className="font-bebas text-4xl uppercase tracking-wide text-foreground md:text-5xl">
                                Historical Turnout Analysis
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                Voter participation trends from 1991 to 2026 projection
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
                                Provincial Analysis
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                Comprehensive breakdown by all seven provinces
                            </p>
                        </div>
                        <RegionalBreakdownChart data={analytics.regionalBreakdown} />
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
                                Demographics Analysis
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                Switch between voter and candidate demographics
                            </p>
                        </div>
                        <div className="mx-auto max-w-5xl">
                            <TabbedDemographics data={analytics.demographicsData} />
                        </div>
                    </motion.section>

                    {/* Subtle Divider */}
                    <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                    {/* Section 8: Trending Topics */}
                    <motion.section
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <div className="text-center">
                            <h2 className="font-bebas text-4xl uppercase tracking-wide text-foreground md:text-5xl">
                                Trending Topics
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                Most discussed election issues
                            </p>
                        </div>

                        <TrendingTopicsSection initialData={analytics.trendingTopics} />
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
                                        Election Analyses
                                    </h2>
                                    <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                                        Deeper dives into the political dynamics, narratives, and numbers behind Nepal&apos;s 2026 election.
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
                                                            {article.title_en}
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
                                                        {article.excerpt_en}
                                                    </p>
                                                    <div className="mt-auto pt-3 border-t border-dashed border-border flex items-center justify-between gap-2">
                                                        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.25em]">
                                                            Deep dive &mdash; Election 2026
                                                        </p>
                                                        <Link
                                                            href={`/election-2026/analyses/${article.slug}`}
                                                            className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary hover:text-primary/80"
                                                        >
                                                            Read analysis →
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
                                        <Link href="/election-2026/analyses">View all election analyses</Link>
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
                                Additional Resources
                            </h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Daily Brief */}
                            {latestBrief && (
                                <Card className="border-border/30">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 font-bebas text-xl uppercase">
                                            <Bell className="h-4 w-4 text-muted-foreground" />
                                            Daily Brief
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Link href={`/election-2026/daily-brief/${latestBrief.slug}`} className="block group/link">
                                            <h4 className="font-bold leading-tight transition-colors group-hover/link:text-[#B71C1C]">
                                                {latestBrief.title}
                                            </h4>
                                            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                                {latestBrief.summary}
                                            </p>
                                        </Link>
                                        <Button variant="outline" size="sm" className="mt-4" asChild>
                                            <Link href="/election-2026/daily-brief">View All Briefs</Link>
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
                                            Latest Fact Check
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <h4 className="font-bold leading-tight">
                                            &ldquo;{latestFactCheck.claim}&rdquo;
                                        </h4>
                                        <div className="my-3 inline-block rounded bg-muted px-2 py-1 text-xs font-bold uppercase text-foreground">
                                            {latestFactCheck.verdict}
                                        </div>
                                        <p className="line-clamp-2 text-sm text-muted-foreground">
                                            {latestFactCheck.analysis}
                                        </p>
                                        <Button variant="outline" size="sm" className="mt-4" asChild>
                                            <Link href="/election-2026/fact-checks">All Verifications</Link>
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
                data={districtNews}
                onClose={() => {
                    setDistrictNewsOpen(false);
                }}
            />
        </div>
    );
}

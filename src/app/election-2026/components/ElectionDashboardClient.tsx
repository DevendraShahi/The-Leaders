"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Info, ShieldCheck, Calendar, Users, MapPin, TrendingUp, Bell } from "lucide-react";
import { ElectionMap } from "@/components/election/ElectionMap";
import { KathmanduValleyCallout } from "./KathmanduValleyCallout";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

interface ElectionDashboardClientProps {
    latestBrief?: any;
    latestFactCheck?: any;
    briefsCount: number;
}

export default function ElectionDashboardClient({
    latestBrief,
    latestFactCheck,
    briefsCount
}: ElectionDashboardClientProps) {
    const { language } = useLanguage();
    const locale = LOCALES.election2026.dashboard;

    // Helper for date formatting
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Helper to handle mixed content types
    const resolveContent = (content: any) => {
        if (!content) return "";
        if (typeof content === 'string') return content;
        if (typeof content === 'object' && ('en' in content || 'ne' in content)) {
            return tString(content, language);
        }
        return "";
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section with Gradient */}
            <motion.section
                className="relative overflow-hidden border-b border-border/10 bg-gradient-to-br from-[#B71C1C]/5 via-background to-background"
                initial="initial"
                animate="animate"
                variants={fadeInUp}
            >
                {/* Subtle grid background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(183,28,28,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(183,28,28,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />

                <div className="container relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <motion.div
                        className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        <motion.div className="flex-1" variants={fadeInUp}>
                            <motion.div
                                className="mb-4 inline-block"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                <div className="inline-block px-4 py-1 bg-[#B71C1C] text-white backdrop-blur-sm">
                                    <span className="flex items-center gap-2 font-bebas text-sm tracking-widest uppercase">
                                        <Calendar className="h-4 w-4" />
                                        {tString(locale.hero.badge, language)}
                                    </span>
                                </div>
                            </motion.div>

                            <h1 className="font-bebas text-5xl leading-[0.9] tracking-tight md:text-7xl lg:text-8xl">
                                <motion.span
                                    className="block text-foreground"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                >
                                    {tString(locale.hero.heading1, language)}
                                </motion.span>
                                <motion.span
                                    className="block bg-gradient-to-r from-[#B71C1C] to-[#D32F2F] bg-clip-text text-transparent"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                >
                                    {tString(locale.hero.heading2, language)}
                                </motion.span>
                            </h1>

                            <motion.p
                                className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.6 }}
                            >
                                {tString(locale.hero.subheading, language)}
                            </motion.p>

                            {/* Quick Stats */}
                            <motion.div
                                className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4"
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                            >
                                {[
                                    { icon: MapPin, label: tString(locale.hero.stats.districts, language), value: "77" },
                                    { icon: Users, label: tString(locale.hero.stats.candidates, language), value: "2,400+" },
                                    { icon: TrendingUp, label: tString(locale.hero.stats.briefs, language), value: briefsCount.toString() },
                                    { icon: ShieldCheck, label: tString(locale.hero.stats.factChecks, language), value: "50+" }
                                ].map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        variants={fadeInUp}
                                        className="group relative overflow-hidden rounded-none border border-border/50 bg-background/50 p-4 backdrop-blur transition-all hover:border-[#B71C1C]/30 hover:bg-[#B71C1C]/5"
                                    >
                                        <stat.icon className="mb-2 h-5 w-5 text-[#B71C1C] transition-transform group-hover:scale-110" />
                                        <div className="text-xl font-semibold text-foreground">{stat.value}</div>
                                        <div className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className="flex flex-col gap-3 sm:flex-row"
                            variants={fadeInUp}
                        >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="outline" className="group w-full sm:w-auto rounded-none">
                                    <Bell className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
                                    {tString(locale.hero.subscribe, language)}
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button asChild className="w-full sm:w-auto rounded-none">
                                    <Link href="/election-2026/pr-candidates">
                                        {tString(locale.hero.viewMap, language)}
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Main Content */}
            <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Map Area (2 columns) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Interactive Map */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-background via-background to-[#B71C1C]/5 backdrop-blur rounded-none">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(183,28,28,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(183,28,28,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

                                <CardHeader className="relative">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="font-sans text-2xl leading-tight tracking-tight">
                                                {tString(locale.mapCard.title, language)}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {tString(locale.mapCard.subtitle, language)}
                                            </CardDescription>
                                        </div>
                                        <motion.div
                                            whileHover={{ rotate: 15 }}
                                            transition={{ type: "spring" }}
                                        >
                                            <Info className="h-5 w-5 text-muted-foreground" />
                                        </motion.div>
                                    </div>
                                </CardHeader>

                                <CardContent className="relative">
                                    <div className="relative h-[500px] w-full overflow-hidden rounded-none border border-border/30 bg-background/50">
                                        <ElectionMap className="h-full w-full" />

                                        {/* Legend */}
                                        <motion.div
                                            className="absolute bottom-4 left-4 rounded-none border border-border/50 bg-background/90 p-3 text-xs backdrop-blur"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <div className="mb-2 text-xs font-semibold uppercase tracking-wider">{tString(locale.mapCard.legend.legendTitle, language)}</div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-3 w-3 rounded-none bg-[#B71C1C]" />
                                                    <span className="text-muted-foreground">{tString(locale.mapCard.legend.projected, language)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-3 w-3 rounded-none border-2 border-border bg-background" />
                                                    <span className="text-muted-foreground">{tString(locale.mapCard.legend.undecided, language)}</span>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Kathmandu Valley Callout - Positioned center-right, slightly bottom */}
                                        <div className="absolute right-4 top-[60%] z-10 w-32 -translate-y-1/2 md:right-12">
                                            <KathmanduValleyCallout />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Feature Cards Grid */}
                        <motion.div
                            className="grid gap-6 md:grid-cols-2"
                            variants={staggerContainer}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            {[
                                {
                                    title: tString(locale.features.prList.title, language),
                                    description: tString(locale.features.prList.desc, language),
                                    link: "/election-2026/pr-candidates",
                                    linkText: tString(locale.features.prList.link, language),
                                    bgText: tString(locale.features.prList.bgText, language),
                                    gradient: "from-[#B71C1C]/10 to-transparent"
                                },
                                {
                                    title: tString(locale.features.parties.title, language),
                                    description: tString(locale.features.parties.desc, language),
                                    link: "/election-2026/parties",
                                    linkText: tString(locale.features.parties.link, language),
                                    bgText: tString(locale.features.parties.bgText, language),
                                    gradient: "from-blue-500/10 to-transparent"
                                },
                                {
                                    title: tString(locale.features.manifestos.title, language),
                                    description: tString(locale.features.manifestos.desc, language),
                                    link: "/election-2026/manifesto",
                                    linkText: tString(locale.features.manifestos.link, language),
                                    bgText: tString(locale.features.manifestos.bgText, language),
                                    gradient: "from-foreground/5 to-transparent"
                                }
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeInUp}
                                    initial="rest"
                                    whileHover="hover"
                                >
                                    <Card className="group h-full overflow-hidden border-border/50 transition-all hover:border-[#B71C1C]/30 hover:shadow-lg rounded-none">
                                        <CardHeader>
                                            <CardTitle className="font-sans text-xl leading-tight tracking-tight">
                                                {feature.title}
                                            </CardTitle>
                                            <CardDescription className="text-base">
                                                {feature.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className={`mb-4 flex h-32 items-center justify-center rounded-none bg-gradient-to-br ${feature.gradient} border border-border/30`}>
                                                <span className="text-3xl font-semibold tracking-tight text-foreground/20">
                                                    {feature.bgText}
                                                </span>
                                            </div>
                                            <Button variant="link" asChild className="group/btn p-0 rounded-none">
                                                <Link href={feature.link} className="flex items-center gap-2">
                                                    {feature.linkText}
                                                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Sidebar: Daily Brief & Fact Checks */}
                    <motion.div
                        className="space-y-6 lg:sticky lg:top-20 lg:self-start"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        {/* Daily Brief */}
                        <Card className="group overflow-hidden border-[#B71C1C]/20 bg-gradient-to-br from-[#B71C1C]/5 via-background to-background transition-all hover:border-[#B71C1C]/40 hover:shadow-lg rounded-none">
                            {latestBrief?.image && (
                                <div className="relative h-32 w-full overflow-hidden border-b border-border/60">
                                    <img
                                        src={latestBrief.image}
                                        alt={resolveContent(latestBrief.title)}
                                        className="h-full w-full object-cover object-center"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-sans text-xl leading-tight tracking-tight">
                                    <Calendar className="h-5 w-5 text-[#B71C1C]" />
                                    {tString(locale.sidebar.briefTitle, language)}
                                    {latestBrief && (
                                        <span className="ml-auto text-xs font-normal text-muted-foreground">
                                            {formatDate(latestBrief.date)}
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {latestBrief ? (
                                    <>
                                        <Link href={`/election-2026/daily-brief/${latestBrief.slug}`} className="block group/link">
                                            <h4 className="text-[1.05rem] font-semibold leading-snug text-foreground transition-colors group-hover/link:text-[#B71C1C]">
                                                {resolveContent(latestBrief.title)}
                                            </h4>
                                            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                                                {resolveContent(latestBrief.summary)}
                                            </p>
                                        </Link>
                                        <Button className="w-full rounded-none" asChild>
                                            <Link href="/election-2026/daily-brief">{tString(locale.sidebar.readFull, language)}</Link>
                                        </Button>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">{tString(locale.sidebar.noBriefs, language)}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Latest Fact Check */}
                        <Card className="group overflow-hidden border-l-4 border-l-[#B71C1C] transition-all hover:shadow-lg rounded-none">
                            {latestFactCheck?.image && (
                                <div className="relative h-28 w-full overflow-hidden border-b border-border/60">
                                    <img
                                        src={latestFactCheck.image}
                                        alt={resolveContent(latestFactCheck.claim)}
                                        className="h-full w-full object-cover object-center"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                                </div>
                            )}
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 font-sans text-xl leading-tight tracking-tight text-[#B71C1C]">
                                    <ShieldCheck className="h-5 w-5" />
                                    {tString(locale.sidebar.factCheckTitle, language)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {latestFactCheck ? (
                                    <>
                                        <h4 className="mb-3 text-[1.02rem] font-semibold leading-snug">
                                            {tString(locale.sidebar.claim, language)}: &ldquo;{resolveContent(latestFactCheck.claim)}&rdquo;
                                        </h4>
                                        <div className="mb-3 inline-block rounded-none bg-[#B71C1C]/10 px-3 py-1 text-sm font-bold uppercase text-[#B71C1C]">
                                            {tString(locale.sidebar.verdict, language)}: {resolveContent(latestFactCheck.verdict)}
                                        </div>
                                        <p className="line-clamp-3 text-sm text-muted-foreground">
                                            {resolveContent(latestFactCheck.analysis)}
                                        </p>
                                        <Button variant="link" className="mt-3 p-0 rounded-none" asChild>
                                            <Link href="/election-2026/fact-checks" className="group/link flex items-center gap-1">
                                                {tString(locale.sidebar.seeAll, language)}
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">{tString(locale.sidebar.noFactChecks, language)}</p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

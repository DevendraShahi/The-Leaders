"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LineChart,
    Line,
} from "recharts";
import { DemographicsData } from "@/lib/analytics-data";
import { useLanguage } from "@/components/providers/language-provider";

interface TabbedDemographicsProps {
    data: DemographicsData;
}

type VoterCycleRow = {
    cycle: string;
    registered: number;
    turnout: number | null;
    source?: {
        abbr: string;
        label: string;
        url: string;
    };
};

type GenderRow = {
    gender: string;
    count: number;
    percentage: number;
    localizedGender: string;
};

const LABELS = {
    en: {
        voterTitle: "Voter Roll Profile",
        voterSubtitle: "Wikipedia verified voter-roll and turnout records by election cycle",
        registeredTitle: "Registered Voters by Cycle",
        turnoutTitle: "Turnout Rate Trend",
        turnoutPending: "Turnout not published yet",
        latestRoll: "Latest Voter Roll",
        growthFrom2022: "Growth from 2022 Federal",
        bestTurnout: "Highest Turnout",
        registeredVoters: "Registered voters",
        turnoutRate: "Turnout rate",
        sources: "Sources",
        candidateTitle: "Candidate Demographics Profile",
        candidateSubtitle: "Separate education and gender charts from the latest candidate dataset",
        educationTitle: "Education Levels",
        genderTitle: "Gender Share",
        topEducation: "Top Education Group",
        womenShare: "Women Share",
        totalCandidates: "Total Candidates",
        candidates: "candidates",
        genderCount: "Count",
    },
    ne: {
        voterTitle: "मतदाता रोल प्रोफाइल",
        voterSubtitle: "निर्वाचन चक्रअनुसार विकिपिडियाबाट प्रमाणित मतदाता रोल र मतदान दर",
        registeredTitle: "चक्रअनुसार दर्ता मतदाता",
        turnoutTitle: "मतदान दर प्रवृत्ति",
        turnoutPending: "मतदान दर अझै प्रकाशित छैन",
        latestRoll: "नवीनतम मतदाता रोल",
        growthFrom2022: "२०७९ संघीय निर्वाचनबाट वृद्धि",
        bestTurnout: "उच्चतम मतदान दर",
        registeredVoters: "दर्ता मतदाता",
        turnoutRate: "मतदान दर",
        sources: "स्रोत",
        candidateTitle: "उम्मेदवार डेमोग्राफिक्स प्रोफाइल",
        candidateSubtitle: "पछिल्लो उम्मेदवार डाटासेटबाट छुट्टाछुट्टै शिक्षा र लैंगिक चार्ट",
        educationTitle: "शैक्षिक स्तर",
        genderTitle: "लैंगिक हिस्सा",
        topEducation: "शीर्ष शैक्षिक समूह",
        womenShare: "महिला हिस्सा",
        totalCandidates: "कुल उम्मेदवार",
        candidates: "उम्मेदवार",
        genderCount: "संख्या",
    },
} as const;

export function TabbedDemographics({ data }: TabbedDemographicsProps) {
    const showCandidateDemographics = false;
    const { language } = useLanguage();
    const lang = language === "ne" ? "ne" : "en";
    const t = LABELS[lang];
    const locale = lang === "ne" ? "ne-NP" : "en-US";

    const formatNumber = (value: number) => value.toLocaleString(locale);
    const formatMillions = (value: number) => `${(value / 1_000_000).toFixed(2)}M`;
    const formatPercent = (value: number) => `${value.toFixed(2)}%`;

    const localizeGender = (value: string) => {
        if (lang === "en") return value;
        const normalized = value.toLowerCase();
        if (normalized === "male") return "पुरुष";
        if (normalized === "female") return "महिला";
        if (normalized === "other") return "अन्य";
        return value;
    };

    const voterCycles = useMemo<VoterCycleRow[]>(() => {
        if (data.voterRollByCycle && data.voterRollByCycle.length > 0) {
            return data.voterRollByCycle.map((row) => ({
                cycle: row.cycle,
                registered: row.registered,
                turnout: row.turnout ?? null,
                source: row.source,
            }));
        }

        return data.ageDistribution.map((row) => ({
            cycle: row.range,
            registered: row.count,
            turnout: null,
        }));
    }, [data.voterRollByCycle, data.ageDistribution]);

    const genderRows: GenderRow[] = data.genderDistribution.map((row) => ({
                ...row,
                localizedGender: localizeGender(row.gender),
    }));

    const latestCycle = voterCycles[voterCycles.length - 1] ?? null;
    const baseline2022 = voterCycles.find((row) =>
        row.cycle.toLowerCase().includes("2022 federal")
    ) ?? null;
    const growthFrom2022 =
        latestCycle && baseline2022 && baseline2022.registered > 0
            ? Number(
                  (
                      ((latestCycle.registered - baseline2022.registered) /
                          baseline2022.registered) *
                      100
                  ).toFixed(2)
              )
            : null;
    const bestTurnout = voterCycles
        .filter((row) => row.turnout !== null)
        .sort((a, b) => (b.turnout ?? 0) - (a.turnout ?? 0))[0];

    const sourceList = useMemo(() => {
        const unique = new Map<string, { abbr: string; label: string; url: string }>();
        voterCycles.forEach((row) => {
            if (row.source) unique.set(row.source.url, row.source);
        });
        return Array.from(unique.values());
    }, [voterCycles]);

    const totalCandidates = data.educationLevels.reduce(
        (sum, row) => sum + row.count,
        0
    );
    const femaleRow = data.genderDistribution.find(
        (row) => row.gender.toLowerCase() === "female"
    );
    const topEducation = [...data.educationLevels].sort((a, b) => b.count - a.count)[0];

    const VoterTooltip = ({ active, payload }: any) => {
        if (!active || !payload || payload.length === 0) return null;
        const row = payload[0].payload as VoterCycleRow;

        return (
            <div className="rounded-lg border border-border/60 bg-background/95 p-3 shadow-xl backdrop-blur">
                <p className="font-bebas text-base uppercase tracking-wide text-foreground">
                    {row.cycle}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {t.registeredVoters}:{" "}
                    <span className="font-semibold text-foreground">
                        {formatNumber(row.registered)}
                    </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {t.turnoutRate}:{" "}
                    <span className="font-semibold text-foreground">
                        {row.turnout === null ? t.turnoutPending : formatPercent(row.turnout)}
                    </span>
                </p>
            </div>
        );
    };

    const EducationTooltip = ({ active, payload }: any) => {
        if (!active || !payload || payload.length === 0) return null;
        const row = payload[0].payload as { level: string; count: number };
        return (
            <div className="rounded-lg border border-border/60 bg-background/95 p-3 shadow-xl backdrop-blur">
                <p className="font-bebas text-base uppercase tracking-wide text-foreground">
                    {row.level}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                        {formatNumber(row.count)}
                    </span>{" "}
                    {t.candidates}
                </p>
            </div>
        );
    };

    const GenderTooltip = ({ active, payload }: any) => {
        if (!active || !payload || payload.length === 0) return null;
        const row = payload[0].payload as GenderRow;
        return (
            <div className="rounded-lg border border-border/60 bg-background/95 p-3 shadow-xl backdrop-blur">
                <p className="font-bebas text-base uppercase tracking-wide text-foreground">
                    {row.localizedGender}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {t.genderCount}:{" "}
                    <span className="font-semibold text-foreground">
                        {formatNumber(row.count)}
                    </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {t.genderTitle}:{" "}
                    <span className="font-semibold text-foreground">
                        {formatPercent(row.percentage)}
                    </span>
                </p>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
        >
            <div className="space-y-5">
                <div className="rounded-xl border border-border/55 bg-card/40 p-4 sm:p-5">
                    <h4 className="font-bebas text-xl uppercase tracking-wide text-foreground">
                        {t.voterTitle}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">{t.voterSubtitle}</p>
                </div>

                <div className="rounded-xl border border-border/55 bg-card/40 p-4 sm:p-5">
                    <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        {t.registeredTitle}
                    </p>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={voterCycles} margin={{ top: 10, right: 12, left: 6, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-border/20" />
                            <XAxis dataKey="cycle" stroke="currentColor" className="text-xs text-muted-foreground" tick={{ fontSize: 11 }} />
                            <YAxis
                                stroke="currentColor"
                                className="text-xs text-muted-foreground"
                                tick={{ fontSize: 11 }}
                                tickFormatter={(value) => `${(value / 1_000_000).toFixed(1)}M`}
                            />
                            <Tooltip content={<VoterTooltip />} />
                            <Bar dataKey="registered" fill="#B71C1C" radius={[8, 8, 0, 0]} animationBegin={160} animationDuration={800} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-xl border border-border/55 bg-card/40 p-4 sm:p-5">
                    <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        {t.turnoutTitle}
                    </p>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={voterCycles} margin={{ top: 10, right: 6, left: 0, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-border/20" />
                            <XAxis dataKey="cycle" stroke="currentColor" className="text-xs text-muted-foreground" tick={{ fontSize: 11 }} />
                            <YAxis
                                stroke="currentColor"
                                className="text-xs text-muted-foreground"
                                tick={{ fontSize: 11 }}
                                domain={[55, 75]}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip content={<VoterTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="turnout"
                                stroke="#B71C1C"
                                strokeWidth={2.2}
                                dot={{ r: 3 }}
                                connectNulls={false}
                                animationDuration={800}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-border/45 bg-background/55 p-3">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            {t.latestRoll}
                        </p>
                        <p className="mt-1 font-bebas text-2xl text-foreground">
                            {latestCycle ? formatMillions(latestCycle.registered) : "--"}
                        </p>
                        {latestCycle ? (
                            <p className="text-xs text-muted-foreground">{latestCycle.cycle}</p>
                        ) : null}
                    </div>
                    <div className="rounded-lg border border-border/45 bg-background/55 p-3">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            {t.growthFrom2022}
                        </p>
                        <p className="mt-1 font-bebas text-2xl text-[#B71C1C]">
                            {growthFrom2022 === null
                                ? "--"
                                : `${growthFrom2022 > 0 ? "+" : ""}${growthFrom2022.toFixed(2)}%`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {lang === "en" ? "2022 Federal to 2026 Federal" : "२०७९ संघीयदेखि २०२६ संघीयसम्म"}
                        </p>
                    </div>
                    <div className="rounded-lg border border-border/45 bg-background/55 p-3">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            {t.bestTurnout}
                        </p>
                        <p className="mt-1 font-bebas text-2xl text-foreground">
                            {bestTurnout?.turnout !== undefined && bestTurnout.turnout !== null
                                ? formatPercent(bestTurnout.turnout)
                                : "--"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {bestTurnout?.cycle ?? t.turnoutPending}
                        </p>
                    </div>
                </div>

                {sourceList.length > 0 ? (
                    <div className="rounded-xl border border-border/55 bg-card/40 p-4 sm:p-5">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            {t.sources}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {sourceList.map((source) => (
                                <a
                                    key={source.url}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded border border-border/65 bg-background/65 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
                                    title={source.label}
                                >
                                    {source.abbr}
                                </a>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>

            {showCandidateDemographics ? (
                <div className="space-y-5">
                    <div className="rounded-xl border border-border/55 bg-card/40 p-4 sm:p-5">
                        <h4 className="font-bebas text-xl uppercase tracking-wide text-foreground">
                            {t.candidateTitle}
                        </h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t.candidateSubtitle}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border/55 bg-card/40 p-4 sm:p-5">
                        <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                            {t.educationTitle}
                        </p>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.educationLevels} margin={{ top: 20, right: 16, left: 8, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-border/20" />
                                <XAxis dataKey="level" stroke="currentColor" className="text-sm text-muted-foreground" tick={{ fontSize: 12 }} />
                                <YAxis stroke="currentColor" className="text-sm text-muted-foreground" tick={{ fontSize: 12 }} />
                                <Tooltip content={<EducationTooltip />} />
                                <Bar dataKey="count" fill="#B71C1C" radius={[8, 8, 0, 0]} animationBegin={180} animationDuration={900} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="rounded-xl border border-border/55 bg-card/40 p-4 sm:p-5">
                        <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                            {t.genderTitle}
                        </p>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={genderRows} margin={{ top: 12, right: 18, left: 8, bottom: 12 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-border/20" />
                                <XAxis
                                    dataKey="localizedGender"
                                    stroke="currentColor"
                                    className="text-sm text-muted-foreground"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    stroke="currentColor"
                                    className="text-sm text-muted-foreground"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip content={<GenderTooltip />} />
                                <Bar dataKey="percentage" fill="#B71C1C" radius={[8, 8, 0, 0]} animationBegin={200} animationDuration={900} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border border-border/45 bg-background/55 p-3">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                {t.totalCandidates}
                            </p>
                            <p className="mt-1 font-bebas text-2xl text-foreground">
                                {formatNumber(totalCandidates)}
                            </p>
                        </div>
                        <div className="rounded-lg border border-border/45 bg-background/55 p-3">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                {t.womenShare}
                            </p>
                            <p className="mt-1 font-bebas text-2xl text-[#B71C1C]">
                                {femaleRow ? formatPercent(femaleRow.percentage) : "--"}
                            </p>
                        </div>
                        <div className="rounded-lg border border-border/45 bg-background/55 p-3">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                {t.topEducation}
                            </p>
                            <p className="mt-1 font-bebas text-2xl text-foreground">
                                {topEducation?.level ?? "--"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {topEducation ? `${formatNumber(topEducation.count)} ${t.candidates}` : "--"}
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}
        </motion.div>
    );
}

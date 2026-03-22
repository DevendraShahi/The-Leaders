"use client";

import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Sector } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { PartyProjection } from "@/lib/analytics-data";
import { Crown } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

interface ImpressivePieChartProps {
    data: PartyProjection[];
    title?: string;
    subtitle?: string;
}

type ChartRow = {
    name: string;
    value: number;
    color: string;
    percentage: number;
    slug: string;
};

const MINOR_GROUP_THRESHOLD = 2;
const GROUPED_PARTIES_SLUG = "__grouped_small_parties__";

const formatVotePercent = (value: number) => `${value.toFixed(2)}%`;

const PARTY_NAME_BY_SLUG: Record<string, { en: string; ne: string }> = {
    "nepali-congress": { en: "Nepali Congress", ne: "नेपाली कांग्रेस" },
    "cpn-uml": { en: "CPN-UML", ne: "नेकपा (एमाले)" },
    "cpn-maoist": { en: "CPN (Maoist Centre)", ne: "नेकपा (माओवादी केन्द्र)" },
    rsp: { en: "Rastriya Swatantra Party", ne: "राष्ट्रिय स्वतन्त्र पार्टी" },
    rpp: { en: "Rastriya Prajatantra Party", ne: "राष्ट्रिय प्रजातन्त्र पार्टी" },
    "psp-nepal": { en: "People's Socialist Party, Nepal", ne: "जनता समाजवादी पार्टी, नेपाल" },
    "cpn-unified-socialist": { en: "CPN (Unified Socialist)", ne: "नेकपा (एकीकृत समाजवादी)" },
    "janamat-party": { en: "Janamat Party", ne: "जनमत पार्टी" },
    "loktantrik-samajwadi-party": { en: "Loktantrik Samajwadi Party", ne: "लोकतान्त्रिक समाजवादी पार्टी" },
    "nagarik-unmukti-party": { en: "Nagarik Unmukti Party", ne: "नागरिक उन्मुक्ति पार्टी" },
    nwpp: { en: "Nepal Workers and Peasants Party", ne: "नेपाल मजदुर किसान पार्टी" },
    "rastriya-janamorcha": { en: "Rastriya Janamorcha", ne: "राष्ट्रिय जनमोर्चा" },
    "rastriya-janata-party-nepal": { en: "Rastriya Janata Party Nepal", ne: "राष्ट्रिय जनता पार्टी नेपाल" },
    "federal-socialist-forum-nepal": {
        en: "Federal Socialist Forum, Nepal",
        ne: "संघीय समाजवादी फोरम, नेपाल",
    },
    "naya-shakti-party-nepal": { en: "Naya Shakti Party, Nepal", ne: "नयाँ शक्ति पार्टी, नेपाल" },
    "shram-sanskriti": { en: "Shram Sanskriti Party", ne: "श्रम संस्कृति पार्टी" },
    independent: { en: "Independent", ne: "स्वतन्त्र" },
    [GROUPED_PARTIES_SLUG]: { en: "Other small parties", ne: "अन्य साना दल" },
};

export function ImpressivePieChart({ data, title, subtitle }: ImpressivePieChartProps) {
    const { language } = useLanguage();
    const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const sortedData = useMemo(
        () => [...data].sort((a, b) => b.projectedSeats - a.projectedSeats),
        [data]
    );

    const totalSeats = sortedData.reduce((sum, party) => sum + party.projectedSeats, 0);
    const majoritySeats = Math.floor(totalSeats / 2) + 1;
    const totalParties = sortedData.length;

    const majorParties = sortedData.filter((party) => party.projectedSeats > MINOR_GROUP_THRESHOLD);
    const minorParties = sortedData.filter((party) => party.projectedSeats <= MINOR_GROUP_THRESHOLD);

    const groupedMinorParties: PartyProjection | null =
        minorParties.length > 1
            ? {
                  party: "Other small parties",
                  partySlug: GROUPED_PARTIES_SLUG,
                  color: "#6B7280",
                  projectedSeats: minorParties.reduce((sum, party) => sum + party.projectedSeats, 0),
                  voteSharePercentage: Number(
                      minorParties
                          .reduce(
                              (sum, party) => sum + (party.prVotePercentage ?? party.voteSharePercentage),
                              0
                          )
                          .toFixed(2)
                  ),
                  prVotePercentage: Number(
                      minorParties
                          .reduce(
                              (sum, party) => sum + (party.prVotePercentage ?? party.voteSharePercentage),
                              0
                          )
                          .toFixed(2)
                  ),
                  prSeats: minorParties.reduce((sum, party) => sum + (party.prSeats ?? 0), 0),
                  fptpSeats: minorParties.reduce((sum, party) => sum + (party.fptpSeats ?? 0), 0),
                  change: 0,
              }
            : null;

    const chartSource = groupedMinorParties ? [...majorParties, groupedMinorParties] : sortedData;

    const chartData: ChartRow[] = chartSource.map((party) => ({
        name: PARTY_NAME_BY_SLUG[party.partySlug]?.[language] ?? party.party,
        value: party.projectedSeats,
        color: party.color,
        percentage: party.prVotePercentage ?? party.voteSharePercentage,
        slug: party.partySlug,
    }));

    useEffect(() => {
        if (!selectedSlug && chartData.length > 0) {
            setSelectedSlug(chartData[0].slug);
        }
    }, [chartData, selectedSlug]);

    const activeIndex = useMemo(() => {
        if (chartData.length === 0) return null;
        const activeSlug = hoveredSlug ?? selectedSlug ?? chartData[0].slug;
        const index = chartData.findIndex((row) => row.slug === activeSlug);
        return index >= 0 ? index : 0;
    }, [chartData, hoveredSlug, selectedSlug]);

    const activeEntry = activeIndex !== null ? chartData[activeIndex] : null;

    const visibleListData = sortedData;

    const getHoverSlugForParty = (party: PartyProjection) => {
        if (groupedMinorParties && party.projectedSeats <= MINOR_GROUP_THRESHOLD) {
            return GROUPED_PARTIES_SLUG;
        }
        return party.partySlug;
    };

    if (sortedData.length === 0) {
        return (
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
                No 2022 results data available.
            </div>
        );
    }

    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 10}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius - 6}
                    outerRadius={innerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    opacity={0.5}
                />
            </g>
        );
    };

    return (
        <div className="space-y-5">
            {title && (
                <div className="text-center">
                    <h2 className="font-bebas text-4xl uppercase tracking-wide text-foreground md:text-5xl">
                        {title}
                    </h2>
                    {subtitle && <p className="mt-2 text-base text-muted-foreground md:text-lg">{subtitle}</p>}
                </div>
            )}

            <div className="rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border/60 bg-background/70 p-3 text-center">
                        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                            Total Seats
                        </p>
                        <p className="mt-1 font-bebas text-4xl leading-none text-foreground">{totalSeats}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/70 p-3 text-center">
                        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                            Majority Mark
                        </p>
                        <p className="mt-1 font-bebas text-4xl leading-none text-foreground">{majoritySeats}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/70 p-3 text-center">
                        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                            Parties Listed
                        </p>
                        <p className="mt-1 font-bebas text-4xl leading-none text-foreground">{totalParties}</p>
                    </div>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                    <div className="relative overflow-hidden rounded-xl bg-background/50 p-2 sm:p-3">
                        <div className="h-[280px] sm:h-[360px] lg:h-[430px]">
                            {isClient ? (
                                <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={320}>
                                    <PieChart>
                                        <defs>
                                            {chartData.map((entry) => (
                                                <radialGradient key={entry.slug} id={`gradient-${entry.slug}`}>
                                                    <stop offset="0%" stopColor={entry.color} stopOpacity={0.95} />
                                                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.68} />
                                                </radialGradient>
                                            ))}
                                        </defs>
                                        <Pie
                                            {...(activeIndex !== null && { activeIndex })}
                                            activeShape={renderActiveShape}
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="50%"
                                            outerRadius="78%"
                                            paddingAngle={1.5}
                                            dataKey="value"
                                            onMouseEnter={(_, index) => setHoveredSlug(chartData[index]?.slug ?? null)}
                                            onMouseLeave={() => setHoveredSlug(null)}
                                            onClick={(_, index) => setSelectedSlug(chartData[index]?.slug ?? null)}
                                            animationBegin={0}
                                            animationDuration={900}
                                            animationEasing="ease-out"
                                        >
                                            {chartData.map((entry) => (
                                                <Cell
                                                    key={entry.slug}
                                                    fill={`url(#gradient-${entry.slug})`}
                                                    stroke="hsl(var(--background))"
                                                    strokeWidth={2.5}
                                                />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border/60 bg-background/60 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                    Loading chart
                                </div>
                            )}
                        </div>

                        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
                            <div className="min-w-[150px] rounded-full bg-background/85 px-4 py-3 text-center shadow-md backdrop-blur">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeEntry?.slug ?? "empty-state"}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <p className="max-w-[170px] truncate text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                                            {activeEntry?.name ?? "No Data"}
                                        </p>
                                        <p className="mt-1 font-bebas text-5xl leading-none text-foreground">
                                            {activeEntry?.value ?? 0}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">total seats</p>
                                        {activeEntry && (
                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                {formatVotePercent(activeEntry.percentage)} PR votes
                                            </p>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="mt-2 rounded-lg bg-background/70 px-3 py-2 text-center md:hidden">
                            <p className="truncate text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                                {activeEntry?.name ?? "No Data"}
                            </p>
                            <p className="mt-1 font-bebas text-3xl leading-none text-foreground">
                                {activeEntry?.value ?? 0}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                {activeEntry ? `${formatVotePercent(activeEntry.percentage)} PR votes` : "PR votes"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                            Party Breakdown
                        </p>

                        <div className="max-h-[450px] space-y-2 overflow-y-auto pr-1">
                            {visibleListData.map((party) => {
                                const rank =
                                    sortedData.findIndex((entry) => entry.partySlug === party.partySlug) + 1;
                                const seatShare =
                                    totalSeats > 0 ? (party.projectedSeats / totalSeats) * 100 : 0;
                                const isActive = hoveredSlug === getHoverSlugForParty(party);
                                const prVote = party.prVotePercentage ?? party.voteSharePercentage;
                                const prSeats = party.prSeats ?? 0;

                                return (
                                    <motion.div
                                        key={party.partySlug}
                                        onMouseEnter={() => setHoveredSlug(getHoverSlugForParty(party))}
                                        onMouseLeave={() => setHoveredSlug(null)}
                                        onClick={() => setSelectedSlug(getHoverSlugForParty(party))}
                                        className={`cursor-pointer rounded-lg border p-3 transition-all ${
                                            isActive
                                                ? "border-primary/45 bg-primary/5 shadow-sm"
                                                : "border-border/55 bg-background/70 hover:border-border"
                                        }`}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    {rank === 1 && <Crown className="h-4 w-4 text-yellow-500" />}
                                                    <p className="truncate font-bebas text-lg uppercase leading-tight text-foreground">
                                                        {PARTY_NAME_BY_SLUG[party.partySlug]?.[language] ?? party.party}
                                                    </p>
                                                </div>
                                                <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                                                    <span className="rounded-full border border-border/70 bg-background/80 px-2 py-0.5">
                                                        {formatVotePercent(prVote)} PR votes
                                                    </span>
                                                    <span className="rounded-full border border-border/70 bg-background/80 px-2 py-0.5">
                                                        {prSeats} PR seats
                                                    </span>
                                                    {typeof party.fptpSeats === "number" && (
                                                        <span className="rounded-full border border-border/70 bg-background/80 px-2 py-0.5">
                                                            {party.fptpSeats} FPTP seats
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p className="font-bebas text-3xl leading-none text-foreground">
                                                    {party.projectedSeats}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">total seats</p>
                                            </div>
                                        </div>

                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/30">
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: party.color }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${seatShare}%` }}
                                                transition={{ duration: 0.7, ease: "easeOut" }}
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {groupedMinorParties && (
                            <p className="text-xs leading-6 text-muted-foreground">
                                {language === "en"
                                    ? `Small parties with ${MINOR_GROUP_THRESHOLD} or fewer seats are grouped in the pie chart for clarity.`
                                    : `${MINOR_GROUP_THRESHOLD} वा कम सिट भएका साना दललाई स्पष्टताका लागि पाइ चार्टमा समेटिएको छ।`}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

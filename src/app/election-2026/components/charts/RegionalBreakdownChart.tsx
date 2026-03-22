"use client";

import { useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from "recharts";
import { motion } from "framer-motion";
import { RegionalData } from "@/lib/analytics-data";
import { CircleHelp, MapPin } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

interface RegionalBreakdownChartProps {
    data: RegionalData[];
}

type ChartRow = RegionalData & {
    provinceLabel: string;
    seatGap: number;
    prGap: number;
    leadingSeatShare: number;
    runnerUpSeatShare: number;
};

const PROVINCE_LABELS: Record<string, { en: string; ne: string }> = {
    Koshi: { en: "Koshi", ne: "कोशी" },
    Madhesh: { en: "Madhesh", ne: "मधेश" },
    Bagmati: { en: "Bagmati", ne: "बागमती" },
    Gandaki: { en: "Gandaki", ne: "गण्डकी" },
    Lumbini: { en: "Lumbini", ne: "लुम्बिनी" },
    Karnali: { en: "Karnali", ne: "कर्णाली" },
    Sudurpashchim: { en: "Sudurpashchim", ne: "सुदूरपश्चिम" },
};

const PARTY_LABELS: Record<string, { en: string; ne: string }> = {
    "CPN-UML": { en: "CPN-UML", ne: "नेकपा (एमाले)" },
    "Nepali Congress": { en: "Nepali Congress", ne: "नेपाली कांग्रेस" },
    "Rastriya Swatantra Party": { en: "Rastriya Swatantra Party", ne: "राष्ट्रिय स्वतन्त्र पार्टी" },
    "CPN (Maoist Centre)": { en: "CPN (Maoist Centre)", ne: "नेकपा (माओवादी केन्द्र)" },
    "Nepali Congress / CPN-UML (Tie)": { en: "Nepali Congress / CPN-UML (Tie)", ne: "कांग्रेस / एमाले (बराबरी)" },
};

const LABELS = {
    en: {
        districts: "Districts",
        fptpSeats: "FPTP seats",
        topFptp: "Top FPTP",
        runnerUpFptp: "Runner-up FPTP",
        seatGap: "Seat gap",
        topPr: "Top PR",
        prVoteGap: "PR vote gap",
        yAxisLabel: "Top Party FPTP Seats",
        loadingChart: "Loading chart",
        pinnedDetails: "Pinned Province Details",
        seatShareSplit: "Seat share split",
        tooltipTitle: "Province pulse",
        hints: {
            fptpSeats: "Total direct-election seats in this province.",
            topFptp: "Party with the most FPTP seats in this province.",
            runnerUpFptp: "Party with the second-most FPTP seats in this province.",
            seatGap: "Difference between top and runner-up FPTP seats.",
            topPr: "Party with the highest proportional vote share in this province.",
            prVoteGap: "Vote-share difference between top and second PR parties.",
            seatShareSplit: "Top and runner-up share of total provincial FPTP seats.",
        },
    },
    ne: {
        districts: "जिल्ला",
        fptpSeats: "प्रत्यक्ष सिट",
        topFptp: "शीर्ष प्रत्यक्ष",
        runnerUpFptp: "दोस्रो प्रत्यक्ष",
        seatGap: "सिट अन्तर",
        topPr: "शीर्ष समानुपातिक",
        prVoteGap: "समानुपातिक मत अन्तर",
        yAxisLabel: "शीर्ष दलको प्रत्यक्ष सिट",
        loadingChart: "चार्ट लोड हुँदैछ",
        pinnedDetails: "छानिएको प्रदेश विवरण",
        seatShareSplit: "सिट हिस्सा तुलना",
        tooltipTitle: "प्रदेश स्थिति",
        hints: {
            fptpSeats: "यो प्रदेशको प्रत्यक्ष निर्वाचनका कुल सिट संख्या।",
            topFptp: "यो प्रदेशमा सबैभन्दा धेरै प्रत्यक्ष सिट जितेको दल।",
            runnerUpFptp: "यो प्रदेशमा दोस्रो धेरै प्रत्यक्ष सिट जितेको दल।",
            seatGap: "पहिलो र दोस्रो दलको प्रत्यक्ष सिटको अन्तर।",
            topPr: "यो प्रदेशमा समानुपातिक मतमा पहिलो स्थानमा रहेको दल।",
            prVoteGap: "पहिलो र दोस्रो समानुपातिक दलको मत प्रतिशत अन्तर।",
            seatShareSplit: "कुल प्रत्यक्ष सिटमा पहिलो र दोस्रो दलको हिस्सा।",
        },
    },
} as const;

function InfoHint({
    text,
    position = "top",
    align = "center",
}: {
    text: string;
    position?: "top" | "bottom";
    align?: "left" | "center" | "right";
}) {
    const [open, setOpen] = useState(false);

    return (
        <span className="relative ml-1 inline-flex align-middle">
            <span
                role="button"
                tabIndex={0}
                aria-label={text}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        setOpen((current) => !current);
                    }
                    if (event.key === "Escape") {
                        setOpen(false);
                    }
                }}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setOpen((current) => !current);
                }}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-border/65 bg-background/70 text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
            >
                <CircleHelp className="h-3 w-3" />
            </span>
            <span
                className={`pointer-events-none absolute z-[80] w-52 rounded-md border border-border/70 bg-background/95 px-2 py-1.5 text-[10px] leading-5 text-muted-foreground shadow-xl backdrop-blur transition-all ${
                    position === "top" ? "bottom-[125%]" : "top-[115%]"
                } ${
                    align === "left"
                        ? "left-0"
                        : align === "right"
                        ? "right-0"
                        : "left-1/2 -translate-x-1/2"
                } ${
                    open ? "visible translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0"
                }`}
            >
                {text}
            </span>
        </span>
    );
}

export function RegionalBreakdownChart({ data }: RegionalBreakdownChartProps) {
    const { language } = useLanguage();
    const lang = language === "ne" ? "ne" : "en";
    const t = LABELS[lang];
    const hints = t.hints;
    const locale = lang === "ne" ? "ne-NP" : "en-US";
    const percentFormatter = useMemo(
        () =>
            new Intl.NumberFormat(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
        [locale]
    );

    const [isClient, setIsClient] = useState(false);
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const formatPercent = (value: number) => `${percentFormatter.format(value)}%`;
    const localizeProvince = (value: string) => PROVINCE_LABELS[value]?.[lang] ?? value;
    const localizeParty = (value: string) => PARTY_LABELS[value]?.[lang] ?? value;

    const getBarColor = (index: number) => {
        const colors = ["#B71C1C", "#C62828", "#D84315", "#E64A19", "#EF6C00", "#8D6E63", "#546E7A"];
        return colors[index % colors.length];
    };

    const chartRows: ChartRow[] = useMemo(
        () =>
            data.map((row) => {
                const seatGap = row.leadingPartySeats - row.runnerUpPartySeats;
                const prGap = Number((row.leadingPrVoteShare - row.runnerUpPrVoteShare).toFixed(2));

                return {
                    ...row,
                    provinceLabel: localizeProvince(row.province),
                    seatGap,
                    prGap,
                    leadingSeatShare:
                        row.totalSeats > 0 ? Number(((row.leadingPartySeats / row.totalSeats) * 100).toFixed(2)) : 0,
                    runnerUpSeatShare:
                        row.totalSeats > 0 ? Number(((row.runnerUpPartySeats / row.totalSeats) * 100).toFixed(2)) : 0,
                };
            }),
        [data, lang]
    );

    useEffect(() => {
        if (!selectedProvince && chartRows.length > 0) {
            setSelectedProvince(chartRows[0].province);
        }
    }, [chartRows, selectedProvince]);

    const activeProvince = hoveredProvince ?? selectedProvince ?? chartRows[0]?.province ?? null;
    const activeRow = chartRows.find((row) => row.province === activeProvince) ?? chartRows[0];

    const handleChartMove = (state: any) => {
        const province = state?.activePayload?.[0]?.payload?.province as string | undefined;
        if (province) setHoveredProvince(province);
    };

    const handleChartClick = (state: any) => {
        const province = state?.activePayload?.[0]?.payload?.province as string | undefined;
        if (province) setSelectedProvince(province);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload || payload.length === 0) return null;
        const row = payload[0].payload as ChartRow;

        return (
            <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.16 }}
                className="w-[280px] rounded-xl border border-primary/25 bg-background/95 p-3 shadow-2xl backdrop-blur"
            >
                <div className="flex items-center justify-between gap-2">
                    <p className="font-bebas text-lg uppercase tracking-wide text-foreground">{row.provinceLabel}</p>
                    <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {t.tooltipTitle}
                    </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-border/55 bg-card/40 p-2">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{t.fptpSeats}</p>
                        <p className="font-bebas text-2xl leading-none text-foreground">{row.totalSeats}</p>
                    </div>
                    <div className="rounded-lg border border-border/55 bg-card/40 p-2">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{t.seatGap}</p>
                        <p className="font-bebas text-2xl leading-none text-[#B71C1C]">{row.seatGap}</p>
                    </div>
                </div>

                <div className="mt-3 space-y-2.5">
                    <div>
                        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{t.topFptp}</span>
                            <span className="font-semibold text-foreground">{localizeParty(row.leadingParty)} ({row.leadingPartySeats})</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted/35">
                            <div className="h-full bg-[#B71C1C]" style={{ width: `${row.leadingSeatShare}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{t.runnerUpFptp}</span>
                            <span className="font-semibold text-foreground">{localizeParty(row.runnerUpParty)} ({row.runnerUpPartySeats})</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted/35">
                            <div className="h-full bg-foreground/60" style={{ width: `${row.runnerUpSeatShare}%` }} />
                        </div>
                    </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-md border border-border/55 bg-card/40 p-2 text-muted-foreground">
                        <p className="uppercase tracking-[0.12em]">{t.topPr}</p>
                        <p className="mt-1 font-semibold text-foreground">{localizeParty(row.leadingPrParty)}</p>
                        <p>{formatPercent(row.leadingPrVoteShare)}</p>
                    </div>
                    <div className="rounded-md border border-border/55 bg-card/40 p-2 text-muted-foreground">
                        <p className="uppercase tracking-[0.12em]">{t.prVoteGap}</p>
                        <p className="mt-1 font-semibold text-foreground">{formatPercent(row.prGap)}</p>
                        <p>{localizeParty(row.runnerUpPrParty)}</p>
                    </div>
                </div>

                <p className="mt-2 text-[10px] leading-5 text-muted-foreground">{hints.seatGap}</p>
            </motion.div>
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
            <div className="h-[360px] w-full md:h-[420px]">
                {isClient ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={320}>
                        <BarChart
                            data={chartRows}
                            margin={{ top: 20, right: 20, left: 8, bottom: 48 }}
                            onMouseMove={handleChartMove}
                            onMouseLeave={() => setHoveredProvince(null)}
                            onClick={handleChartClick}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="currentColor"
                                className="stroke-border/20"
                            />
                            <XAxis
                                dataKey="provinceLabel"
                                stroke="currentColor"
                                className="text-sm text-muted-foreground"
                                tick={{ fontSize: 12 }}
                                height={58}
                            />
                            <YAxis
                                stroke="currentColor"
                                className="text-sm text-muted-foreground"
                                tick={{ fontSize: 12 }}
                                label={{ value: t.yAxisLabel, angle: -90, position: "insideLeft" }}
                            />
                            <Tooltip cursor={{ fill: "rgba(183,28,28,0.08)" }} content={<CustomTooltip />} />
                            <Bar dataKey="leadingPartySeats" radius={[8, 8, 0, 0]} animationBegin={200} animationDuration={900}>
                                {chartRows.map((entry, index) => {
                                    const isActive = entry.province === activeProvince;
                                    return (
                                        <Cell
                                            key={`cell-${entry.province}`}
                                            fill={getBarColor(index)}
                                            fillOpacity={isActive ? 1 : 0.5}
                                        />
                                    );
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border/60 bg-background/60 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        {t.loadingChart}
                    </div>
                )}
            </div>

            {activeRow && (
                <div className="rounded-lg border border-border/55 bg-card/35 p-4">
                    <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
                        {t.pinnedDetails}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                        <span className="font-bebas text-2xl uppercase text-foreground">{activeRow.provinceLabel}</span>
                        <span className="rounded-full border border-border/65 bg-background/70 px-2 py-0.5 text-xs text-muted-foreground">
                            {t.seatShareSplit}: {formatPercent(activeRow.leadingSeatShare)} / {formatPercent(activeRow.runnerUpSeatShare)}
                            <InfoHint text={hints.seatShareSplit} />
                        </span>
                        <span className="rounded-full border border-border/65 bg-background/70 px-2 py-0.5 text-xs text-muted-foreground">
                            {t.prVoteGap}: {formatPercent(activeRow.prGap)}
                            <InfoHint text={hints.prVoteGap} />
                        </span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {chartRows.map((province) => {
                    const isActive = province.province === activeProvince;

                    return (
                        <button
                            key={province.province}
                            type="button"
                            onMouseEnter={() => setHoveredProvince(province.province)}
                            onMouseLeave={() => setHoveredProvince(null)}
                            onClick={() => setSelectedProvince(province.province)}
                            className={`group relative z-0 overflow-visible rounded-lg border p-4 text-left transition-all hover:z-20 focus-within:z-20 ${
                                isActive
                                    ? "border-primary/45 bg-primary/5 shadow-sm"
                                    : "border-border/50 bg-background/50 hover:border-border hover:shadow-sm"
                            }`}
                        >
                            <div className="absolute right-2 top-2 opacity-5 transition-opacity group-hover:opacity-10">
                                <MapPin className="h-12 w-12 text-[#B71C1C]" />
                            </div>

                            <h4 className="relative font-bebas text-lg uppercase tracking-wide text-foreground">
                                {province.provinceLabel}
                            </h4>

                            <div className="relative mt-3 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground">{t.districts}</p>
                                    <p className="font-bebas text-xl text-foreground">{province.districts}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">{t.fptpSeats}</p>
                                    <p className="font-bebas text-xl text-foreground">{province.totalSeats}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t.topFptp}
                                        <InfoHint text={hints.topFptp} />
                                    </p>
                                    <p className="font-bebas text-xl text-[#B71C1C]">{province.leadingPartySeats}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {t.seatGap}
                                        <InfoHint text={hints.seatGap} />
                                    </p>
                                    <p className="font-bebas text-xl text-foreground">{province.seatGap}</p>
                                </div>
                            </div>

                            <div className="mt-3 space-y-1.5 border-t border-border/50 pt-3">
                                <p className="text-xs text-muted-foreground">
                                    {t.topFptp}: <span className="font-semibold text-foreground">{localizeParty(province.leadingParty)}</span>
                                    <InfoHint text={hints.topFptp} position="bottom" align="left" />
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {t.runnerUpFptp}: <span className="font-semibold text-foreground">{localizeParty(province.runnerUpParty)}</span>
                                    <InfoHint text={hints.runnerUpFptp} position="bottom" align="left" />
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {t.topPr}: <span className="font-semibold text-foreground">{localizeParty(province.leadingPrParty)}</span>{" "}
                                    ({formatPercent(province.leadingPrVoteShare)})
                                    <InfoHint text={hints.topPr} position="bottom" align="left" />
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {t.prVoteGap}: <span className="font-semibold text-foreground">{formatPercent(province.prGap)}</span>
                                    <InfoHint text={hints.prVoteGap} position="bottom" align="left" />
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
}

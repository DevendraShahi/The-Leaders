"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { TurnoutHistoryEntry } from "@/lib/analytics-data";

interface TurnoutTrendChartProps {
    data: TurnoutHistoryEntry[];
}

export function TurnoutTrendChart({ data }: TurnoutTrendChartProps) {
    const formatMillions = (value: number) => `${(value / 1000000).toFixed(1)}M`;
    const data2022 = data.find((entry) => entry.year === 2022);
    const data2026 = data.find((entry) => entry.year === 2026);
    const turnoutPeak = data.reduce<TurnoutHistoryEntry | null>((best, entry) => {
        if (!best) return entry;
        return entry.percentage > best.percentage ? entry : best;
    }, null);
    const voterGrowthFrom2022 =
        data2022 && data2022.totalVoters > 0 && data2026
            ? (((data2026.totalVoters - data2022.totalVoters) / data2022.totalVoters) * 100).toFixed(1)
            : null;

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
                    <p className="font-bebas text-lg text-foreground">{data.year}</p>
                    <p className="text-sm text-muted-foreground">
                        Turnout: <span className="font-bold text-[#B71C1C]">{data.percentage}%</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {formatMillions(data.totalVoters)} voters
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
        >
            <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorTurnout" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#B71C1C" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#B71C1C" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        className="stroke-border/20"
                    />
                    <XAxis
                        dataKey="year"
                        stroke="currentColor"
                        className="text-xs text-muted-foreground"
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        stroke="currentColor"
                        className="text-xs text-muted-foreground"
                        tick={{ fontSize: 12 }}
                        domain={[50, 85]}
                        tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="percentage"
                        stroke="#B71C1C"
                        strokeWidth={3}
                        fill="url(#colorTurnout)"
                        animationBegin={200}
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Key Insights - No borders */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted/10 p-3 text-center transition-all hover:bg-muted/20">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Peak Turnout</p>
                    <p className="mt-1 font-bebas text-2xl text-foreground">
                        {turnoutPeak ? `${turnoutPeak.percentage}%` : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">{turnoutPeak?.year ?? "N/A"}</p>
                </div>
                <div className="rounded-lg bg-muted/10 p-3 text-center transition-all hover:bg-muted/20">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">2026 Registered Voters</p>
                    <p className="mt-1 font-bebas text-2xl text-[#B71C1C]">
                        {data2026 ? formatMillions(data2026.totalVoters) : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {data2026 ? data2026.totalVoters.toLocaleString() : "No data"}
                    </p>
                </div>
                <div className="rounded-lg bg-muted/10 p-3 text-center transition-all hover:bg-muted/20">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Change vs 2022 Roll</p>
                    <p className="mt-1 font-bebas text-2xl text-foreground">
                        {voterGrowthFrom2022 ? `+${voterGrowthFrom2022}%` : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {data2022 ? `2022: ${data2022.totalVoters.toLocaleString()}` : "No baseline"}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

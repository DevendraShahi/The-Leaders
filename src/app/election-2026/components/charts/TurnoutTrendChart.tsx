"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { TurnoutHistoryEntry } from "@/lib/analytics-data";

interface TurnoutTrendChartProps {
    data: TurnoutHistoryEntry[];
}

export function TurnoutTrendChart({ data }: TurnoutTrendChartProps) {
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
                        {(data.totalVoters / 1000000).toFixed(1)}M voters
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
                    <p className="mt-1 font-bebas text-2xl text-foreground">78.3%</p>
                    <p className="text-xs text-muted-foreground">2013</p>
                </div>
                <div className="rounded-lg bg-muted/10 p-3 text-center transition-all hover:bg-muted/20">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">2026 Projection</p>
                    <p className="mt-1 font-bebas text-2xl text-[#B71C1C]">68.5%</p>
                    <p className="text-xs text-green-500">+7.5% from 2022</p>
                </div>
                <div className="rounded-lg bg-muted/10 p-3 text-center transition-all hover:bg-muted/20">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Expected Voters</p>
                    <p className="mt-1 font-bebas text-2xl text-foreground">19.2M</p>
                    <p className="text-xs text-muted-foreground">Projected</p>
                </div>
            </div>
        </motion.div>
    );
}

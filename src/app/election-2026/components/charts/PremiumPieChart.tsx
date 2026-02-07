"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { PartyProjection } from "@/lib/analytics-data";
import { TrendingUp, TrendingDown, Crown } from "lucide-react";

interface PremiumPieChartProps {
    data: PartyProjection[];
}

const PremiumPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="rounded-lg border border-border bg-background p-4 shadow-xl">
                <p className="font-bebas text-xl text-foreground">{data.name}</p>
                <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                        Seats: <span className="font-bold text-foreground">{data.value}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Vote Share: <span className="font-bold text-[#B71C1C]">{data.payload.percentage}%</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const PremiumPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > cx ? "start" : "end"}
            dominantBaseline="central"
            className="font-bebas text-sm drop-shadow-lg"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export function PremiumPieChart({ data }: PremiumPieChartProps) {
    const totalSeats = data.reduce((sum, party) => sum + party.projectedSeats, 0);

    const chartData = data.map(party => ({
        name: party.party,
        value: party.projectedSeats,
        color: party.color,
        percentage: party.voteSharePercentage,
        change: party.change
    }));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
        >
            <Card className="overflow-hidden border-border/50 md:border">
                <CardHeader className="pb-4">
                    <CardTitle className="font-bebas text-3xl uppercase tracking-wide">
                        Parliamentary Seat Distribution
                    </CardTitle>
                    <CardDescription className="text-base">
                        Projected allocation of {totalSeats} seats across major parties
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pb-8">
                    {/* Pie Chart */}
                    <div className="flex flex-col items-center lg:flex-row lg:items-start lg:justify-around lg:gap-8">
                        <div className="w-full lg:w-auto">
                            <ResponsiveContainer width="100%" height={400} className="mx-auto max-w-md">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={PremiumPieLabel}
                                        outerRadius={150}
                                        innerRadius={60}
                                        fill="#8884d8"
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={800}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                className="transition-opacity hover:opacity-80"
                                                stroke="hsl(var(--background))"
                                                strokeWidth={3}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<PremiumPieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Center stats */}
                            <div className="mt-4 text-center">
                                <p className="text-sm text-muted-foreground">Total Parliamentary Seats</p>
                                <p className="font-bebas text-5xl text-foreground">{totalSeats}</p>
                                <p className="text-xs text-muted-foreground">Majority: {Math.ceil(totalSeats / 2) + 1} seats</p>
                            </div>
                        </div>

                        {/* Party Legend Cards */}
                        <div className="mt-6 w-full space-y-3 lg:mt-0 lg:max-w-sm">
                            {data.map((party, index) => (
                                <motion.div
                                    key={party.partySlug}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                                    className="group relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-r from-muted/30 to-transparent p-4 transition-all hover:shadow-md"
                                >
                                    {/* Color indicator */}
                                    <div
                                        className="absolute left-0 top-0 h-full w-1.5"
                                        style={{ backgroundColor: party.color }}
                                    />

                                    <div className="ml-3 flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                                                <h4 className="font-bebas text-lg uppercase leading-tight text-foreground">
                                                    {party.party}
                                                </h4>
                                            </div>
                                            <div className="mt-1 flex items-baseline gap-3">
                                                <span className="font-bebas text-3xl text-foreground">
                                                    {party.projectedSeats}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {party.voteSharePercentage}% votes
                                                </span>
                                            </div>
                                        </div>

                                        {/* Change badge */}
                                        <div className={`flex items-center gap-1 rounded px-2 py-1 ${party.change > 0 ? "bg-green-500/10" :
                                                party.change < 0 ? "bg-red-500/10" : "bg-muted"
                                            }`}>
                                            {party.change > 0 ? (
                                                <TrendingUp className="h-3 w-3 text-green-500" />
                                            ) : party.change < 0 ? (
                                                <TrendingDown className="h-3 w-3 text-red-500" />
                                            ) : null}
                                            <span className={`font-bebas text-sm ${party.change > 0 ? "text-green-500" :
                                                    party.change < 0 ? "text-red-500" :
                                                        "text-muted-foreground"
                                                }`}>
                                                {party.change > 0 ? "+" : ""}{party.change}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

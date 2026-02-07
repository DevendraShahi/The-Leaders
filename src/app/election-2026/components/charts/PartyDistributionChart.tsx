"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { PartyProjection } from "@/lib/analytics-data";

interface PartyDistributionChartProps {
    data: PartyProjection[];
}

const PartyDistributionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
                <p className="font-bebas text-lg text-foreground">{data.name}</p>
                <p className="text-sm text-muted-foreground">
                    Seats: <span className="font-bold text-foreground">{data.value}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                    Vote Share: <span className="font-bold text-foreground">{data.percentage}%</span>
                </p>
            </div>
        );
    }
    return null;
};

export function PartyDistributionChart({ data }: PartyDistributionChartProps) {
    // Transform data for pie chart
    const chartData = data.map(party => ({
        name: party.party,
        value: party.projectedSeats,
        color: party.color,
        percentage: party.voteSharePercentage
    }));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="overflow-hidden border-border/50">
                <CardHeader>
                    <CardTitle className="font-bebas text-2xl uppercase tracking-wide">
                        Seat Projections
                    </CardTitle>
                    <CardDescription>
                        Projected seat distribution by party
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={100}
                                innerRadius={60}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={800}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        className="transition-opacity hover:opacity-80"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<PartyDistributionTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => <span className="text-sm">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Summary Stats */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        {data.slice(0, 4).map((party) => (
                            <div
                                key={party.partySlug}
                                className="rounded-lg border border-border/30 bg-muted/20 p-3"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: party.color }}
                                    />
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {party.party}
                                    </span>
                                </div>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="font-bebas text-2xl text-foreground">
                                        {party.projectedSeats}
                                    </span>
                                    <span className={`text-xs font-bold ${party.change > 0 ? "text-green-500" : "text-red-500"
                                        }`}>
                                        {party.change > 0 ? "+" : ""}{party.change}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

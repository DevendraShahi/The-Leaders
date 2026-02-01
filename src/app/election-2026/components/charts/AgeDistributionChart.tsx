"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { DemographicsData } from "@/lib/analytics-data";
import { Users } from "lucide-react";

interface AgeDistributionChartProps {
    data: DemographicsData;
}

export function AgeDistributionChart({ data }: AgeDistributionChartProps) {
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
                    <p className="font-bebas text-lg text-foreground">Age {data.range}</p>
                    <p className="text-sm text-[#B71C1C]">
                        {data.count.toLocaleString()} voters
                    </p>
                </div>
            );
        }
        return null;
    };

    const totalVoters = data.ageDistribution.reduce((sum, item) => sum + item.count, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
        >
            <Card className="overflow-hidden border-border/50">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="font-bebas text-3xl uppercase tracking-wide">
                                Voter Age Distribution
                            </CardTitle>
                            <CardDescription className="mt-2 text-base">
                                Registered voters by age group
                            </CardDescription>
                        </div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#B71C1C]/10">
                            <Users className="h-7 w-7 text-[#B71C1C]" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pb-8">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                            data={data.ageDistribution}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <defs>
                                <linearGradient id="ageGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#B71C1C" stopOpacity={0.9} />
                                    <stop offset="95%" stopColor="#B71C1C" stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="currentColor"
                                className="stroke-border/30"
                            />
                            <XAxis
                                dataKey="range"
                                stroke="currentColor"
                                className="text-sm text-muted-foreground"
                                tick={{ fontSize: 14 }}
                                label={{ value: 'Age Range', position: 'insideBottom', offset: -10 }}
                            />
                            <YAxis
                                stroke="currentColor"
                                className="text-sm text-muted-foreground"
                                tick={{ fontSize: 13 }}
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                                label={{ value: 'Number of Voters', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="count"
                                fill="url(#ageGradient)"
                                radius={[8, 8, 0, 0]}
                                animationBegin={400}
                                animationDuration={1000}
                            />
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Summary Stats */}
                    <div className="mt-8 grid grid-cols-3 gap-4">
                        <div className="rounded-lg border border-border/30 bg-muted/20 p-4 text-center">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Voters</p>
                            <p className="mt-2 font-bebas text-3xl text-foreground">
                                {(totalVoters / 1000000).toFixed(2)}M
                            </p>
                        </div>
                        <div className="rounded-lg border border-border/30 bg-muted/20 p-4 text-center">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Largest Group</p>
                            <p className="mt-2 font-bebas text-3xl text-[#B71C1C]">26-35</p>
                            <p className="text-xs text-muted-foreground">680K voters</p>
                        </div>
                        <div className="rounded-lg border border-border/30 bg-muted/20 p-4 text-center">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Youth (18-25)</p>
                            <p className="mt-2 font-bebas text-3xl text-foreground">
                                {((data.ageDistribution[0].count / totalVoters) * 100).toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

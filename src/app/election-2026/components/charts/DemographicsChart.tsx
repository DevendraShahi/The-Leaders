"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { DemographicsData } from "@/lib/analytics-data";

interface DemographicsChartProps {
    data: DemographicsData;
}

const DemographicsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
                <p className="font-bebas text-base text-foreground">{label}</p>
                <p className="text-sm text-[#B71C1C]">
                    {payload[0].value.toLocaleString()} candidates
                </p>
            </div>
        );
    }
    return null;
};

export function DemographicsChart({ data }: DemographicsChartProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
        >
            <Card className="overflow-hidden border-border/50">
                <CardHeader>
                    <CardTitle className="font-bebas text-2xl uppercase tracking-wide">
                        Candidate Demographics
                    </CardTitle>
                    <CardDescription>
                        Distribution by education level
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={data.educationLevels}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="currentColor"
                                className="stroke-border/30"
                            />
                            <XAxis
                                dataKey="level"
                                stroke="currentColor"
                                className="text-xs text-muted-foreground"
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis
                                stroke="currentColor"
                                className="text-xs text-muted-foreground"
                                tick={{ fontSize: 11 }}
                            />
                            <Tooltip content={<DemographicsTooltip />} />
                            <Bar
                                dataKey="count"
                                fill="#B71C1C"
                                radius={[8, 8, 0, 0]}
                                animationBegin={300}
                                animationDuration={1000}
                                className="transition-opacity hover:opacity-80"
                            />
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Gender Distribution */}
                    <div className="mt-6">
                        <h4 className="mb-3 font-bebas text-sm uppercase tracking-wider text-muted-foreground">
                            Gender Distribution
                        </h4>
                        <div className="flex gap-4">
                            {data.genderDistribution.map((gender) => (
                                <div
                                    key={gender.gender}
                                    className="flex-1 rounded-lg border border-border/30 bg-muted/20 p-4"
                                >
                                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                        {gender.gender}
                                    </p>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="font-bebas text-3xl text-foreground">
                                            {gender.count}
                                        </span>
                                        <span className="text-sm font-bold text-[#B71C1C]">
                                            {gender.percentage}%
                                        </span>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                                        <motion.div
                                            className="h-full bg-[#B71C1C]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${gender.percentage}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div >
    );
}

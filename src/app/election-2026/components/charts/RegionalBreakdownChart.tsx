"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { motion } from "framer-motion";
import { RegionalData } from "@/lib/analytics-data";
import { MapPin } from "lucide-react";

interface RegionalBreakdownChartProps {
    data: RegionalData[];
}

export function RegionalBreakdownChart({ data }: RegionalBreakdownChartProps) {
    const getBarColor = (index: number) => {
        const colors = ["#B71C1C", "#D32F2F", "#E57373", "#EF5350", "#F44336", "#FF5722", "#FF6F00"];
        return colors[index % colors.length];
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="rounded-lg border border-border bg-background p-4 shadow-lg">
                    <p className="font-bebas text-xl text-foreground">{data.province}</p>
                    <div className="mt-2 space-y-1">
                        <p className="text-sm text-muted-foreground">
                            Districts: <span className="font-bold text-foreground">{data.districts}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Candidates: <span className="font-bold text-foreground">{data.totalCandidates}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Turnout: <span className="font-bold text-[#B71C1C]">{data.turnoutProjection}%</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Leading: <span className="font-bold text-foreground">{data.leadingParty}</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
        >
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        className="stroke-border/20"
                    />
                    <XAxis
                        dataKey="province"
                        stroke="currentColor"
                        className="text-sm text-muted-foreground"
                        tick={{ fontSize: 12 }}
                        height={60}
                    />
                    <YAxis
                        stroke="currentColor"
                        className="text-sm text-muted-foreground"
                        tick={{ fontSize: 13 }}
                        label={{ value: 'Total Candidates', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="totalCandidates"
                        radius={[8, 8, 0, 0]}
                        animationBegin={300}
                        animationDuration={1000}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={getBarColor(index)}
                                className="transition-opacity hover:opacity-80"
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Province Summary Cards - With subtle borders */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.map((province, index) => (
                    <div
                        key={province.province}
                        className="group relative overflow-hidden rounded-lg border border-border/50 bg-background/50 p-4 transition-all hover:border-border hover:shadow-sm"
                    >
                        <div className="absolute right-2 top-2 opacity-5 transition-opacity group-hover:opacity-10">
                            <MapPin className="h-12 w-12 text-[#B71C1C]" />
                        </div>

                        <h4 className="relative font-bebas text-lg uppercase tracking-wide text-foreground">
                            {province.province}
                        </h4>

                        <div className="relative mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">Districts</p>
                                <p className="font-bebas text-xl text-foreground">{province.districts}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Candidates</p>
                                <p className="font-bebas text-xl text-foreground">{province.totalCandidates}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Turnout Proj.</p>
                                <p className="font-bebas text-xl text-[#B71C1C]">{province.turnoutProjection}%</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Leading</p>
                                <p className="truncate text-xs font-bold text-foreground">{province.leadingParty}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

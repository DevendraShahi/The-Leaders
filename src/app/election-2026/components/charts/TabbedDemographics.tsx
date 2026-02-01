"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { DemographicsData } from "@/lib/analytics-data";
import { Users, GraduationCap } from "lucide-react";

interface TabbedDemographicsProps {
    data: DemographicsData;
}

export function TabbedDemographics({ data }: TabbedDemographicsProps) {
    const [activeTab, setActiveTab] = useState<"voter" | "candidate">("voter");

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            return (
                <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
                    <p className="font-bebas text-lg text-foreground">{payload[0].payload.range || payload[0].payload.level}</p>
                    <p className="text-sm text-[#B71C1C]">
                        {typeof value === 'number' && value > 1000
                            ? value.toLocaleString()
                            : value
                        }
                        {typeof value === 'number' && value > 1000 ? ' voters' : ' candidates'}
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
            className="space-y-8"
        >
            <AnimatePresence mode="wait">
                {activeTab === "voter" ? (
                    <motion.div
                        key="voter"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        {/* Age Distribution Chart */}
                        <div>
                            <h4 className="mb-4 font-bebas text-xl uppercase tracking-wide text-foreground">
                                Age Distribution
                            </h4>
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
                                        className="stroke-border/20"
                                    />
                                    <XAxis
                                        dataKey="range"
                                        stroke="currentColor"
                                        className="text-sm text-muted-foreground"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        stroke="currentColor"
                                        className="text-sm text-muted-foreground"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="count"
                                        fill="url(#ageGradient)"
                                        radius={[8, 8, 0, 0]}
                                        animationBegin={200}
                                        animationDuration={1000}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Summary Stats - No borders */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="rounded-lg bg-muted/10 p-4 text-center transition-all hover:bg-muted/20">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Voters</p>
                                <p className="mt-2 font-bebas text-3xl text-foreground">
                                    {(totalVoters / 1000000).toFixed(2)}M
                                </p>
                            </div>
                            <div className="rounded-lg bg-muted/10 p-4 text-center transition-all hover:bg-muted/20">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground">Largest Group</p>
                                <p className="mt-2 font-bebas text-3xl text-[#B71C1C]">26-35</p>
                                <p className="text-xs text-muted-foreground">680K voters</p>
                            </div>
                            <div className="rounded-lg bg-muted/10 p-4 text-center transition-all hover:bg-muted/20">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground">Youth (18-25)</p>
                                <p className="mt-2 font-bebas text-3xl text-foreground">
                                    {((data.ageDistribution[0].count / totalVoters) * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="candidate"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        {/* Education Levels Chart */}
                        <div>
                            <h4 className="mb-4 font-bebas text-xl uppercase tracking-wide text-foreground">
                                Education Levels
                            </h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={data.educationLevels}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="currentColor"
                                        className="stroke-border/20"
                                    />
                                    <XAxis
                                        dataKey="level"
                                        stroke="currentColor"
                                        className="text-sm text-muted-foreground"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        stroke="currentColor"
                                        className="text-sm text-muted-foreground"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="count"
                                        fill="#B71C1C"
                                        radius={[8, 8, 0, 0]}
                                        animationBegin={200}
                                        animationDuration={1000}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Gender Distribution - No borders */}
                        <div>
                            <h4 className="mb-4 font-bebas text-xl uppercase tracking-wide text-foreground">
                                Gender Distribution
                            </h4>
                            <div className="grid gap-4 md:grid-cols-2">
                                {data.genderDistribution.map((gender) => (
                                    <div
                                        key={gender.gender}
                                        className="rounded-lg bg-muted/10 p-6 transition-all hover:bg-muted/15"
                                    >
                                        <p className="text-sm uppercase tracking-wider text-muted-foreground">
                                            {gender.gender}
                                        </p>
                                        <div className="mt-3 flex items-baseline gap-3">
                                            <span className="font-bebas text-5xl text-foreground">
                                                {gender.count}
                                            </span>
                                            <span className="text-xl font-bold text-[#B71C1C]">
                                                {gender.percentage}%
                                            </span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted/30">
                                            <motion.div
                                                className="h-full bg-[#B71C1C]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${gender.percentage}%` }}
                                                transition={{ duration: 1, delay: 0.3 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tab Switcher - Below graphs for better UX */}
            <div className="flex justify-center pt-4">
                <div className="inline-flex gap-2 rounded-lg border border-border/30 bg-muted/10 p-1">
                    <button
                        onClick={() => setActiveTab("voter")}
                        className={`relative px-6 py-2.5 font-bebas text-sm uppercase tracking-wide transition-all ${activeTab === "voter"
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {activeTab === "voter" && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 rounded-md bg-background shadow-sm"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Voter Demographics
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab("candidate")}
                        className={`relative px-6 py-2.5 font-bebas text-sm uppercase tracking-wide transition-all ${activeTab === "candidate"
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {activeTab === "candidate" && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 rounded-md bg-background shadow-sm"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Candidate Demographics
                        </span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

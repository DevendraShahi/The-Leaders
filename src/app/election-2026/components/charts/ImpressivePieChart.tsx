"use client";

import { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Sector } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { PartyProjection } from "@/lib/analytics-data";
import { TrendingUp, TrendingDown, Crown, ChevronRight } from "lucide-react";

interface ImpressivePieChartProps {
    data: PartyProjection[];
    title?: string;
    subtitle?: string;
}

export function ImpressivePieChart({ data, title, subtitle }: ImpressivePieChartProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const totalSeats = data.reduce((sum, party) => sum + party.projectedSeats, 0);

    const chartData = data.map(party => ({
        name: party.party,
        value: party.projectedSeats,
        color: party.color,
        percentage: party.voteSharePercentage,
        change: party.change,
        slug: party.partySlug
    }));

    // Custom active shape for interactive hover effect
    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 15}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius - 10}
                    outerRadius={innerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    opacity={0.6}
                />
            </g>
        );
    };

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(null);
    };

    return (
        <div className="space-y-8">
            {/* Section Header - Only render if title is provided */}
            {title && (
                <div className="text-center">
                    <h2 className="font-bebas text-4xl uppercase tracking-wide text-foreground md:text-5xl">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="mt-2 text-base text-muted-foreground md:text-lg">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}


            <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:justify-center">
                {/* Pie Chart Section */}
                <div className="relative w-full max-w-xl">
                    <ResponsiveContainer width="100%" height={450}>
                        <PieChart>
                            <defs>
                                {chartData.map((entry, index) => (
                                    <radialGradient key={`gradient-${index}`} id={`gradient-${entry.slug}`}>
                                        <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                                    </radialGradient>
                                ))}
                            </defs>
                            <Pie
                                {...(activeIndex !== null && { activeIndex })}
                                activeShape={renderActiveShape}
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={90}
                                outerRadius={160}
                                paddingAngle={2}
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                                onMouseLeave={onPieLeave}
                                animationBegin={0}
                                animationDuration={1200}
                                animationEasing="ease-out"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={`url(#gradient-${entry.slug})`}
                                        stroke="hsl(var(--background))"
                                        strokeWidth={3}
                                        style={{
                                            filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center Circle Stats - Overlaid on Chart */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <AnimatePresence mode="wait">
                            {activeIndex !== null ? (
                                <motion.div
                                    key="active"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex flex-col items-center">
                                        <p className="max-w-[120px] text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {chartData[activeIndex].name}
                                        </p>
                                        <p className="mt-1 font-bebas text-5xl text-foreground">
                                            {chartData[activeIndex].value}
                                        </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">seats</p>
                                    <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 ${chartData[activeIndex].change > 0 ? "bg-green-500/20" :
                                        chartData[activeIndex].change < 0 ? "bg-red-500/20" : "bg-muted"
                                        }`}>
                                        {chartData[activeIndex].change > 0 ? (
                                            <TrendingUp className="h-3 w-3 text-green-500" />
                                        ) : chartData[activeIndex].change < 0 ? (
                                            <TrendingDown className="h-3 w-3 text-red-500" />
                                        ) : null}
                                        <span className={`text-xs font-bold ${chartData[activeIndex].change > 0 ? "text-green-500" :
                                            chartData[activeIndex].change < 0 ? "text-red-500" :
                                                "text-muted-foreground"
                                            }`}>
                                            {chartData[activeIndex].change > 0 ? "+" : ""}
                                            {chartData[activeIndex].change}
                                        </span>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="default"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                        Total Seats
                                    </p>
                                    <p className="mt-1 font-bebas text-7xl text-foreground">
                                        {totalSeats}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Majority: {Math.ceil(totalSeats / 2) + 1}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Party Stats - No background, just content */}
                <div className="w-full max-w-md space-y-3">
                    {data.map((party, index) => (
                        <motion.div
                            key={party.partySlug}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                            className={`group relative cursor-pointer rounded-xl p-4 transition-all duration-300 ${activeIndex === index
                                ? 'translate-x-2 shadow-lg'
                                : 'hover:translate-x-1'
                                }`}
                            style={{
                                background: activeIndex === index
                                    ? `linear-gradient(135deg, ${party.color}15 0%, transparent 100%)`
                                    : 'transparent'
                            }}
                        >
                            {/* Animated left border */}
                            <motion.div
                                className="absolute left-0 top-0 h-full w-1 rounded-full"
                                style={{ backgroundColor: party.color }}
                                initial={{ scaleY: 0.3, opacity: 0.5 }}
                                animate={{
                                    scaleY: activeIndex === index ? 1 : 0.6,
                                    opacity: activeIndex === index ? 1 : 0.7
                                }}
                                transition={{ duration: 0.3 }}
                            />

                            <div className="ml-4 flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                                        <h4 className="font-bebas text-lg uppercase leading-tight text-foreground lg:text-xl">
                                            {party.party}
                                        </h4>
                                    </div>

                                    <div className="mt-2 flex items-baseline gap-4">
                                        <div>
                                            <span className="font-bebas text-4xl text-foreground">
                                                {party.projectedSeats}
                                            </span>
                                            <span className="ml-1 text-sm text-muted-foreground">seats</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {party.voteSharePercentage}% votes
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted/30">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: party.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(party.projectedSeats / totalSeats) * 100}%` }}
                                            transition={{ duration: 1, delay: 1 + index * 0.1, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>

                                {/* Change indicator */}
                                <div className="ml-4 flex flex-col items-end gap-1">
                                    <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${party.change > 0 ? "bg-green-500/10" :
                                        party.change < 0 ? "bg-red-500/10" : "bg-muted/50"
                                        }`}>
                                        {party.change > 0 ? (
                                            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                                        ) : party.change < 0 ? (
                                            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                                        ) : null}
                                        <span className={`font-bebas text-base ${party.change > 0 ? "text-green-500" :
                                            party.change < 0 ? "text-red-500" :
                                                "text-muted-foreground"
                                            }`}>
                                            {party.change > 0 ? "+" : ""}{party.change}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">vs 2022</span>
                                </div>

                                <ChevronRight
                                    className={`ml-2 h-5 w-5 text-muted-foreground transition-transform ${activeIndex === index ? 'translate-x-1' : ''
                                        }`}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

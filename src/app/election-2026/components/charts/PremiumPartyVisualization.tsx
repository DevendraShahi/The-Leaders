"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { PartyProjection } from "@/lib/analytics-data";
import { TrendingUp, TrendingDown, Crown } from "lucide-react";

interface PremiumPartyVisualizationProps {
    data: PartyProjection[];
}

export function PremiumPartyVisualization({ data }: PremiumPartyVisualizationProps) {
    const totalSeats = data.reduce((sum, party) => sum + party.projectedSeats, 0);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
        >
            <Card className="overflow-hidden border-border/50">
                <CardHeader>
                    <CardTitle className="font-bebas text-3xl uppercase tracking-wide">
                        Parliamentary Seat Projections
                    </CardTitle>
                    <CardDescription className="text-base">
                        Projected distribution of {totalSeats} seats across major political parties
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pb-8">
                    {/* Visual Seat Bar */}
                    <div className="space-y-4">
                        <div className="flex h-16 overflow-hidden rounded-lg border border-border">
                            {data.map((party, index) => {
                                const widthPercentage = (party.projectedSeats / totalSeats) * 100;
                                return (
                                    <motion.div
                                        key={party.partySlug}
                                        className="group relative flex items-center justify-center transition-all hover:brightness-110"
                                        style={{
                                            width: `${widthPercentage}%`,
                                            backgroundColor: party.color,
                                            minWidth: widthPercentage > 5 ? 'auto' : '0'
                                        }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${widthPercentage}%` }}
                                        transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                                    >
                                        {widthPercentage > 8 && (
                                            <span className="font-bebas text-sm font-bold text-white drop-shadow-md">
                                                {party.projectedSeats}
                                            </span>
                                        )}
                                        {/* Tooltip on hover */}
                                        <div className="absolute -top-16 left-1/2 z-10 hidden -translate-x-1/2 rounded-lg border border-border bg-background p-2 shadow-lg group-hover:block">
                                            <p className="whitespace-nowrap text-xs font-bold">{party.party}</p>
                                            <p className="text-xs text-muted-foreground">{party.projectedSeats} seats</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                        <p className="text-center text-xs text-muted-foreground">
                            Hover over sections to see party details
                        </p>
                    </div>

                    {/* Party Cards with Details */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {data.map((party, index) => (
                            <motion.div
                                key={party.partySlug}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                                className="group relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-muted/30 to-transparent p-5 transition-all hover:shadow-lg"
                            >
                                {/* Background color accent */}
                                <div
                                    className="absolute right-0 top-0 h-full w-1 transition-all group-hover:w-2"
                                    style={{ backgroundColor: party.color }}
                                />

                                {/* Party rank badge */}
                                {index === 0 && (
                                    <div className="absolute left-3 top-3">
                                        <Crown className="h-5 w-5 text-yellow-500" />
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {/* Party name */}
                                    <div>
                                        <h3 className="font-bebas text-xl uppercase leading-tight text-foreground">
                                            {party.party}
                                        </h3>
                                        <div className="mt-1 flex items-center gap-2">
                                            <div
                                                className="h-2 w-2 rounded-full"
                                                style={{ backgroundColor: party.color }}
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                {party.partySlug}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Seats projection */}
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-bebas text-4xl text-foreground">
                                            {party.projectedSeats}
                                        </span>
                                        <span className="text-sm text-muted-foreground">seats</span>
                                    </div>

                                    {/* Vote share percentage */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Vote Share</span>
                                            <span className="font-bold text-foreground">
                                                {party.voteSharePercentage}%
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                                            <motion.div
                                                className="h-full"
                                                style={{ backgroundColor: party.color }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${party.voteSharePercentage}%` }}
                                                transition={{ duration: 1, delay: 1 + index * 0.1 }}
                                            />
                                        </div>
                                    </div>

                                    {/* Change indicator */}
                                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                                        <span className="text-xs text-muted-foreground">vs 2022</span>
                                        <div className="flex items-center gap-1">
                                            {party.change > 0 ? (
                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                            ) : party.change < 0 ? (
                                                <TrendingDown className="h-4 w-4 text-red-500" />
                                            ) : null}
                                            <span className={`font-bebas text-lg ${party.change > 0 ? "text-green-500" :
                                                    party.change < 0 ? "text-red-500" :
                                                        "text-muted-foreground"
                                                }`}>
                                                {party.change > 0 ? "+" : ""}{party.change}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Majority Line Indicator */}
                    <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Seats Required for Majority</p>
                                <p className="font-bebas text-3xl text-foreground">{Math.ceil(totalSeats / 2) + 1}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-muted-foreground">Total Seats</p>
                                <p className="font-bebas text-3xl text-foreground">{totalSeats}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

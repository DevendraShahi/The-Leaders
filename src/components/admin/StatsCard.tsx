"use client";

import { ReactNode } from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: 'up' | 'down';
    trendValue?: string;
    // Maintained for compatibility but ignored in new design
    color?: string;
    delay?: number;
}

export default function StatsCard({ title, value, icon, trend, trendValue }: StatsCardProps) {
    return (
        <div className="bg-card border border-border p-6 hover:border-primary/50 transition-colors group relative overflow-hidden">
            {/* Hover Accent */}
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                        {title}
                    </p>
                    <h3 className="text-3xl font-bebas tracking-wide text-foreground">
                        {value}
                    </h3>
                </div>
                <div className="p-2 bg-muted/30 text-primary rounded-none">
                    {icon}
                </div>
            </div>

            {trend && (
                <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                        {trend === 'up' ? '↑' : '↓'} {trendValue}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">vs last month</span>
                </div>
            )}
        </div>
    );
}

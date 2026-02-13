"use client";

import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import AnalyticsTabs from "@/components/admin/analytics/AnalyticsTabs";
import { useAdminStats } from "@/components/admin/analytics/useAdminStats";

export default function AnalyticsElectionPage() {
    const { stats, loading, error } = useAdminStats();

    if (loading) return <div className="p-6 font-mono text-xs uppercase animate-pulse">Loading analytics...</div>;
    if (error) return <div className="p-6 text-destructive text-sm">{error}</div>;

    const electionBreakdown = stats?.audience?.electionBreakdown || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bebas uppercase tracking-wide">Election Analytics</h1>
                <p className="text-sm text-muted-foreground">Tracking for all election content sections and detail pages.</p>
            </div>
            <AnalyticsTabs />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Election Articles Views</p>
                    <p className="text-3xl font-bebas mt-1">{stats?.views?.electionArticles || 0}</p>
                </div>
                <div className="border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Daily Brief Views</p>
                    <p className="text-3xl font-bebas mt-1">{stats?.views?.dailyBriefs || 0}</p>
                </div>
                <div className="border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Fact Check Views</p>
                    <p className="text-3xl font-bebas mt-1">{stats?.views?.factChecks || 0}</p>
                </div>
            </div>

            <div className="border border-border bg-card p-4">
                <h2 className="text-lg font-bebas uppercase tracking-wide mb-4">Election Page Type Breakdown</h2>
                <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={electionBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                            <XAxis dataKey="pageType" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="views" fill="#B71C1C" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ExternalLink, Eye, MousePointerClick, Users } from "lucide-react";
import { format } from "date-fns";
import StatsCard from "@/components/admin/StatsCard";
import AnalyticsTabs from "@/components/admin/analytics/AnalyticsTabs";
import { useUmamiStats } from "@/components/admin/analytics/useUmamiStats";

function formatDuration(seconds: number) {
    if (!seconds) return "0s";
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.round(seconds % 60);
    return minutes > 0 ? `${minutes}m ${remainder}s` : `${remainder}s`;
}

export default function AnalyticsOverviewPage() {
    const { analytics, loading, error } = useUmamiStats(30);

    const pageviewTrend = (analytics?.pageviews || []).map((item: any) => ({
        day: format(new Date(item.t || item.x), "MMM d"),
        pageviews: item.y ?? item.pageviews ?? 0,
        sessions: (analytics?.sessions || []).find((session: any) => session.x === item.x || session.t === item.t)?.y ?? item.visitors ?? 0,
    }));

    if (loading) return <div className="p-6 font-mono text-xs uppercase animate-pulse">Loading Umami analytics...</div>;
    if (error) return <div className="p-6 text-destructive text-sm">{error}</div>;
    if (!analytics?.configured) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bebas uppercase tracking-wide">Umami Analytics</h1>
                    <p className="text-sm text-muted-foreground">Add your Umami website id and API key in `.env.local` to enable dashboard data.</p>
                </div>
                <AnalyticsTabs />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bebas uppercase tracking-wide">Umami Analytics</h1>
                    <p className="text-sm text-muted-foreground">Website metrics from Umami for the last 30 days.</p>
                </div>
                {analytics.dashboardUrl ? (
                    <a href={analytics.dashboardUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs font-mono uppercase tracking-wider hover:bg-muted">
                        Open Umami <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                ) : null}
            </div>

            <AnalyticsTabs />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatsCard title="Pageviews" value={analytics.stats.pageviews || 0} icon={<Eye className="h-5 w-5" />} />
                <StatsCard title="Visitors" value={analytics.stats.visitors || 0} icon={<Users className="h-5 w-5" />} />
                <StatsCard title="Visits" value={analytics.stats.visits || 0} icon={<MousePointerClick className="h-5 w-5" />} />
                <StatsCard title="Active Now" value={analytics.activeVisitors || 0} icon={<Activity className="h-5 w-5" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 border border-border bg-card p-4">
                    <h2 className="text-lg font-bebas uppercase tracking-wide mb-4">Pageviews</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={pageviewTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="pageviews" stroke="#B71C1C" fill="#B71C1C22" strokeWidth={2} />
                                <Area type="monotone" dataKey="sessions" stroke="#1f2937" fill="transparent" strokeWidth={1.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="border border-border bg-card p-4">
                    <h2 className="text-lg font-bebas uppercase tracking-wide mb-4">Session Quality</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Bounces</p>
                            <p className="text-2xl font-bebas">{analytics.stats.bounces || 0}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Total Time</p>
                            <p className="text-2xl font-bebas">{formatDuration(analytics.stats.totaltime || 0)}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Website ID</p>
                            <p className="text-xs font-mono break-all mt-1">{analytics.websiteId}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

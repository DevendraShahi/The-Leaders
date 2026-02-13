"use client";

import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Activity, BarChart3, Eye, FileText, Users } from "lucide-react";
import { format } from "date-fns";
import StatsCard from "@/components/admin/StatsCard";
import AnalyticsTabs from "@/components/admin/analytics/AnalyticsTabs";
import { useAdminStats } from "@/components/admin/analytics/useAdminStats";

export default function AnalyticsOverviewPage() {
    const { stats, loading, error } = useAdminStats();

    const audienceTrend = (stats?.audience?.audienceTrend || []).map((item: any) => ({
        ...item,
        day: format(new Date(item.date), "MMM d"),
    }));

    if (loading) return <div className="p-6 font-mono text-xs uppercase animate-pulse">Loading analytics...</div>;
    if (error) return <div className="p-6 text-destructive text-sm">{error}</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bebas uppercase tracking-wide">Analytics Dashboard</h1>
                <p className="text-sm text-muted-foreground">Website, content, and election performance metrics.</p>
            </div>

            <AnalyticsTabs />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatsCard title="Total Page Views" value={stats?.audience?.totalViews || 0} icon={<Eye className="h-5 w-5" />} />
                <StatsCard title="Unique Visitors" value={stats?.audience?.uniqueVisitors || 0} icon={<Users className="h-5 w-5" />} />
                <StatsCard title="Content Views" value={stats?.views?.totalContentViews || 0} icon={<FileText className="h-5 w-5" />} />
                <StatsCard title="30d Unique Visitors" value={stats?.audience?.uniqueVisitors30d || 0} icon={<Activity className="h-5 w-5" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 border border-border bg-card p-4">
                    <h2 className="text-lg font-bebas uppercase tracking-wide mb-4 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Audience Trend (14d)
                    </h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={audienceTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="views" stroke="#B71C1C" fill="#B71C1C22" strokeWidth={2} />
                                <Area type="monotone" dataKey="uniqueVisitors" stroke="#1f2937" fill="transparent" strokeWidth={1.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="border border-border bg-card p-4">
                    <h2 className="text-lg font-bebas uppercase tracking-wide mb-4">Top Paths</h2>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {(stats?.audience?.topPaths || []).slice(0, 8).map((path: any) => (
                            <div key={path.path} className="border border-border p-2">
                                <p className="text-xs font-mono break-all">{path.path}</p>
                                <p className="text-[11px] text-muted-foreground mt-1">{path.views} views • {path.uniqueVisitors} visitors</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

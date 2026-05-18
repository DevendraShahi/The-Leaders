"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Activity, BarChart3, CheckCircle2, FileText, History, Image as ImageIcon, Layers3, Mail, UserPlus, Users } from "lucide-react";
import { useAuth } from "@/components/admin/AuthProvider";
import StatsCard from "@/components/admin/StatsCard";

export default function AdminDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            try {
                const res = await fetch("/api/admin/stats", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    if (loading) {
        return <div className="p-8 font-mono text-xs uppercase animate-pulse">Loading dashboard...</div>;
    }

    const activityCount = stats?.recentActivity?.length || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="border-b border-border pb-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="font-bebas text-4xl text-foreground tracking-wide">Dashboard Overview</h1>
                        <p className="text-muted-foreground font-manrope text-sm mt-1">
                            Content operations, publishing pipeline, subscribers, and recent admin activity.
                        </p>
                    </div>
                    <Link href="/admin/analytics" className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs font-mono uppercase tracking-wider hover:bg-muted">
                        <BarChart3 className="h-4 w-4" />
                        View Umami Analytics
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <StatsCard title="Total Articles" value={stats?.counts?.articles || 0} icon={<FileText className="h-6 w-6" />} trend="up" trendValue={stats?.growth?.newArticlesIn30Days ? `+${stats.growth.newArticlesIn30Days}` : undefined} />
                <StatsCard title="Published Articles" value={stats?.counts?.articlesPublished || 0} icon={<CheckCircle2 className="h-6 w-6" />} />
                <StatsCard title="Leaders Profiles" value={stats?.counts?.leaders || 0} icon={<Users className="h-6 w-6" />} trend="up" trendValue={stats?.growth?.newLeadersIn30Days ? `+${stats.growth.newLeadersIn30Days}` : undefined} />
                <StatsCard title="History Events" value={stats?.counts?.history || 0} icon={<History className="h-6 w-6" />} trend="up" trendValue={stats?.growth?.newHistoryIn30Days ? `+${stats.growth.newHistoryIn30Days}` : undefined} />
                <StatsCard title="Media Assets" value={stats?.counts?.media || 0} icon={<ImageIcon className="h-6 w-6" />} trend="up" trendValue={stats?.growth?.newMediaIn30Days ? `+${stats.growth.newMediaIn30Days}` : undefined} />
                <StatsCard title="Recent Activity" value={activityCount} icon={<Activity className="h-6 w-6" />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Subscribers" value={stats?.kpis?.subscribersTotal || 0} icon={<UserPlus className="h-6 w-6" />} trend="up" trendValue={stats?.kpis?.subscribersIn30Days ? `+${stats.kpis.subscribersIn30Days}` : "0"} />
                <StatsCard title="Open Messages" value={stats?.kpis?.contactsNew || 0} icon={<Mail className="h-6 w-6" />} />
                <StatsCard title="Reply Rate" value={`${stats?.kpis?.contactReplyRate || 0}%`} icon={<CheckCircle2 className="h-6 w-6" />} />
                <StatsCard title="Publish Efficiency" value={`${stats?.kpis?.publishEfficiency || 0}%`} icon={<Layers3 className="h-6 w-6" />} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-card p-6 border border-border shadow-sm">
                    <h2 className="font-bebas text-xl tracking-wide mb-4 flex items-center gap-2 border-b border-border pb-4">
                        <Layers3 className="h-5 w-5 text-primary" />
                        Content Pipeline
                    </h2>
                    <div className="space-y-3 text-xs font-mono uppercase tracking-wider">
                        {[
                            { label: "Articles", data: stats?.pipeline?.articles },
                            { label: "Daily Briefs", data: stats?.pipeline?.dailyBriefs },
                            { label: "Fact Checks", data: stats?.pipeline?.factChecks },
                            { label: "Election Articles", data: stats?.pipeline?.electionArticles },
                        ].map((row) => (
                            <div key={row.label} className="border border-border p-3">
                                <p className="text-foreground mb-2">{row.label}</p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
                                    <span>Published: {row.data?.published || 0}</span>
                                    <span>Draft: {row.data?.draft || 0}</span>
                                    {"archived" in (row.data || {}) ? <span>Archived: {row.data?.archived || 0}</span> : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-card p-6 border border-border shadow-sm">
                    <h2 className="font-bebas text-xl tracking-wide mb-4 flex items-center gap-2 border-b border-border pb-4">
                        <Activity className="h-5 w-5 text-primary" />
                        Recent Activity
                    </h2>
                    <div className="space-y-4">
                        {stats?.recentActivity?.length > 0 ? (
                            stats.recentActivity.map((activity: any, index: number) => (
                                <div key={`${activity.id || index}`} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                                    <div className="mt-1.5 h-1.5 w-1.5 bg-primary flex-shrink-0" />
                                    <div>
                                        <span className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-muted border border-border text-foreground mb-1">
                                            @{activity.user}
                                        </span>
                                        <p className="text-sm font-medium text-foreground font-manrope">{activity.description}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                                            {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground font-mono text-xs uppercase">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/admin/AuthProvider';
import StatsCard from '@/components/admin/StatsCard';
import { FileText, Users, History, Image as ImageIcon, TrendingUp, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function AdminDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            try {
                const res = await fetch('/api/admin/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    // Mock data for chart if not enough real data
    const chartData = [
        { name: 'Mon', views: 400, articles: 2 },
        { name: 'Tue', views: 300, articles: 1 },
        { name: 'Wed', views: 200, articles: 3 },
        { name: 'Thu', views: 278, articles: 2 },
        { name: 'Fri', views: 189, articles: 1 },
        { name: 'Sat', views: 239, articles: 0 },
        { name: 'Sun', views: 349, articles: 4 },
    ];

    if (loading) {
        return <div className="p-8 font-mono text-xs uppercase animate-pulse">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="border-b border-border pb-6">
                <h1 className="font-bebas text-4xl text-foreground tracking-wide">
                    Dashboard Overview
                </h1>
                <p className="text-muted-foreground font-manrope text-sm mt-1">
                    System performance and content metrics.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Articles"
                    value={stats?.counts?.articles || 0}
                    icon={<FileText className="h-6 w-6" />}
                    trend="up"
                    trendValue={stats?.growth?.newArticlesIn30Days ? `+${stats.growth.newArticlesIn30Days}` : undefined}
                />
                <StatsCard
                    title="Leaders Profiles"
                    value={stats?.counts?.leaders || 0}
                    icon={<Users className="h-6 w-6" />}
                />
                <StatsCard
                    title="History Events"
                    value={stats?.counts?.history || 0}
                    icon={<History className="h-6 w-6" />}
                />
                <StatsCard
                    title="Media Assets"
                    value={stats?.counts?.media || 0}
                    icon={<ImageIcon className="h-6 w-6" />}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-card p-6 border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                        <h2 className="font-bebas text-xl tracking-wide flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Engagement Overview
                        </h2>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#B71C1C" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#B71C1C" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" opacity={0.5} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontFamily: 'Manrope', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontFamily: 'Manrope', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '0px',
                                        border: '1px solid #e5e5e5',
                                        boxShadow: 'none',
                                        fontFamily: 'Manrope',
                                        fontSize: '12px',
                                        textTransform: 'uppercase'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#B71C1C"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-card p-6 border border-border shadow-sm">
                    <h2 className="font-bebas text-xl tracking-wide mb-4 flex items-center gap-2 border-b border-border pb-4">
                        <Calendar className="h-5 w-5 text-primary" />
                        Recent Activity
                    </h2>
                    <div className="space-y-4">
                        {stats?.recentActivity?.length > 0 ? (
                            stats.recentActivity.map((activity: any, i: number) => (
                                <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-none bg-primary flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground font-manrope">
                                            {activity.description}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                                            {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
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

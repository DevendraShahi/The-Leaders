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
        return <div className="p-8">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                    Dashboard Overview
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Welcome back! Here's what's happening with your content today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Articles"
                    value={stats?.counts?.articles || 0}
                    icon={<FileText className="h-6 w-6" />}
                    color="blue"
                    delay={0.1}
                    trend="up"
                    trendValue={stats?.growth?.newArticlesIn30Days ? `+${stats.growth.newArticlesIn30Days} this month` : ''}
                />
                <StatsCard
                    title="Leaders Profiles"
                    value={stats?.counts?.leaders || 0}
                    icon={<Users className="h-6 w-6" />}
                    color="green"
                    delay={0.2}
                />
                <StatsCard
                    title="History Events"
                    value={stats?.counts?.history || 0}
                    icon={<History className="h-6 w-6" />}
                    color="purple"
                    delay={0.3}
                />
                <StatsCard
                    title="Media Assets"
                    value={stats?.counts?.media || 0}
                    icon={<ImageIcon className="h-6 w-6" />}
                    color="orange"
                    delay={0.4}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Engagement Overview
                        </h2>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="views" stroke="#3b82f6" fillOpacity={1} fill="url(#colorViews)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-500" />
                        Recent Activity
                    </h2>
                    <div className="space-y-4">
                        {stats?.recentActivity?.length > 0 ? (
                            stats.recentActivity.map((activity: any, i: number) => (
                                <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 dark:border-gray-800 last:border-0 last:pb-0">
                                    <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {activity.description}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {format(new Date(activity.timestamp), 'PP p')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

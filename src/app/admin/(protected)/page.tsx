'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/admin/AuthProvider';
import StatsCard from '@/components/admin/StatsCard';
import {
    FileText,
    Users,
    History,
    Image as ImageIcon,
    TrendingUp,
    Calendar,
    Activity,
    BarChart3,
    CheckCircle2,
    Mail,
    UserPlus,
    Layers3,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
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

    const contentTrend = (stats?.analytics?.contentTrend || []).map((item: any) => ({
        ...item,
        day: format(new Date(item.date), 'MMM d'),
    }));
    const acquisitionTrend = (stats?.analytics?.acquisitionTrend || []).map((item: any) => ({
        ...item,
        day: format(new Date(item.date), 'MMM d'),
    }));
    const activityByAction = stats?.analytics?.activityByAction || [];
    const categoryPerformance = stats?.analytics?.categoryPerformance || [];
    const mediaByCategory = stats?.analytics?.mediaByCategory || [];
    const articleStatus = stats?.articleStatus || { draft: 0, published: 0, archived: 0 };
    const statusChartData = [
        { name: 'Published', value: articleStatus.published || 0, color: '#16a34a' },
        { name: 'Draft', value: articleStatus.draft || 0, color: '#f59e0b' },
        { name: 'Archived', value: articleStatus.archived || 0, color: '#64748b' },
    ].filter((item) => item.value > 0);

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <StatsCard
                    title="Total Articles"
                    value={stats?.counts?.articles || 0}
                    icon={<FileText className="h-6 w-6" />}
                    trend="up"
                    trendValue={stats?.growth?.newArticlesIn30Days ? `+${stats.growth.newArticlesIn30Days}` : undefined}
                />
                <StatsCard
                    title="Published Articles"
                    value={stats?.counts?.articlesPublished || 0}
                    icon={<CheckCircle2 className="h-6 w-6" />}
                />
                <StatsCard
                    title="Leaders Profiles"
                    value={stats?.counts?.leaders || 0}
                    icon={<Users className="h-6 w-6" />}
                    trend="up"
                    trendValue={stats?.growth?.newLeadersIn30Days ? `+${stats.growth.newLeadersIn30Days}` : undefined}
                />
                <StatsCard
                    title="History Events"
                    value={stats?.counts?.history || 0}
                    icon={<History className="h-6 w-6" />}
                    trend="up"
                    trendValue={stats?.growth?.newHistoryIn30Days ? `+${stats.growth.newHistoryIn30Days}` : undefined}
                />
                <StatsCard
                    title="Media Assets"
                    value={stats?.counts?.media || 0}
                    icon={<ImageIcon className="h-6 w-6" />}
                    trend="up"
                    trendValue={stats?.growth?.newMediaIn30Days ? `+${stats.growth.newMediaIn30Days}` : undefined}
                />
                <StatsCard
                    title="30-Day Activities"
                    value={activityByAction.reduce((sum: number, item: any) => sum + (item.count || 0), 0)}
                    icon={<Activity className="h-6 w-6" />}
                />
            </div>

            {/* CMO / Content KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Subscribers"
                    value={stats?.kpis?.subscribersTotal || 0}
                    icon={<UserPlus className="h-6 w-6" />}
                    trend="up"
                    trendValue={stats?.kpis?.subscribersIn30Days ? `+${stats.kpis.subscribersIn30Days}` : '0'}
                />
                <StatsCard
                    title="Open Messages"
                    value={stats?.kpis?.contactsNew || 0}
                    icon={<Mail className="h-6 w-6" />}
                />
                <StatsCard
                    title="Reply Rate"
                    value={`${stats?.kpis?.contactReplyRate || 0}%`}
                    icon={<CheckCircle2 className="h-6 w-6" />}
                />
                <StatsCard
                    title="Publish Efficiency"
                    value={`${stats?.kpis?.publishEfficiency || 0}%`}
                    icon={<Layers3 className="h-6 w-6" />}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-card p-6 border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                        <h2 className="font-bebas text-xl tracking-wide flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            14-Day Content Trend
                        </h2>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={contentTrend}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#B71C1C" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#B71C1C" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" opacity={0.5} />
                                <XAxis
                                    dataKey="day"
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
                                    dataKey="total"
                                    stroke="#B71C1C"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="articles"
                                    stroke="#0f172a"
                                    strokeWidth={1.5}
                                    fillOpacity={0}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-card p-6 border border-border shadow-sm">
                    <h2 className="font-bebas text-xl tracking-wide mb-4 flex items-center gap-2 border-b border-border pb-4">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Activity Mix (30d)
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityByAction}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" opacity={0.4} />
                                <XAxis dataKey="action" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#B71C1C" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* CMO Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card p-6 border border-border shadow-sm">
                    <h2 className="font-bebas text-xl tracking-wide mb-4 flex items-center gap-2 border-b border-border pb-4">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Acquisition Trend (14d)
                    </h2>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={acquisitionTrend}>
                                <defs>
                                    <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#B71C1C" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#B71C1C" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" opacity={0.4} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="subscribers" stroke="#B71C1C" fill="url(#colorSubs)" strokeWidth={2} />
                                <Area type="monotone" dataKey="contacts" stroke="#0f172a" fillOpacity={0} strokeWidth={1.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-card p-6 border border-border shadow-sm">
                    <h2 className="font-bebas text-xl tracking-wide mb-4 flex items-center gap-2 border-b border-border pb-4">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Category Performance
                    </h2>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryPerformance}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" opacity={0.4} />
                                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="views" fill="#B71C1C" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-card p-6 border border-border shadow-sm">
                    <h2 className="font-bebas text-xl tracking-wide mb-4 flex items-center gap-2 border-b border-border pb-4">
                        <FileText className="h-5 w-5 text-primary" />
                        Article Status
                    </h2>
                    <div className="h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={46}
                                    paddingAngle={2}
                                >
                                    {statusChartData.map((entry: any) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-1.5">
                        {statusChartData.map((item: any) => (
                            <div key={item.name} className="flex items-center justify-between text-xs font-mono uppercase">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5" style={{ backgroundColor: item.color }} />
                                    <span>{item.name}</span>
                                </div>
                                <span className="text-muted-foreground">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-card p-6 border border-border shadow-sm">
                    <h2 className="font-bebas text-xl tracking-wide mb-4 flex items-center gap-2 border-b border-border pb-4">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Top Articles
                    </h2>
                    <div className="space-y-3">
                        {stats?.popularContent?.articles?.length > 0 ? (
                            stats.popularContent.articles.map((article: any) => (
                                <div key={article._id || article.slug} className="border border-border p-3">
                                    <p className="text-sm font-medium line-clamp-2">{article.title?.en || article.title || 'Untitled'}</p>
                                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-2">
                                        {article.views || 0} views
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground font-mono text-xs uppercase">No view data yet</p>
                        )}
                    </div>
                </div>

                <div className="bg-card p-6 border border-border shadow-sm">
                    <h2 className="font-bebas text-xl tracking-wide mb-4 flex items-center gap-2 border-b border-border pb-4">
                        <Layers3 className="h-5 w-5 text-primary" />
                        Content Pipeline
                    </h2>
                    <div className="space-y-3 text-xs font-mono uppercase tracking-wider">
                        {[
                            { label: 'Articles', data: stats?.pipeline?.articles },
                            { label: 'Daily Briefs', data: stats?.pipeline?.dailyBriefs },
                            { label: 'Fact Checks', data: stats?.pipeline?.factChecks },
                            { label: 'Election Articles', data: stats?.pipeline?.electionArticles },
                        ].map((row) => (
                            <div key={row.label} className="border border-border p-3">
                                <p className="text-foreground mb-2">{row.label}</p>
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span>Published: {row.data?.published || 0}</span>
                                    <span>Draft: {row.data?.draft || 0}</span>
                                    {'archived' in (row.data || {}) ? <span>Archived: {row.data?.archived || 0}</span> : <span />}
                                </div>
                            </div>
                        ))}
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
                                        <span className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-muted border border-border text-foreground mb-1">
                                            @{activity.user}
                                        </span>
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

            <div className="bg-card p-6 border border-border shadow-sm">
                <h2 className="font-bebas text-xl tracking-wide mb-4 flex items-center gap-2 border-b border-border pb-4">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Media Library Mix
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mediaByCategory.length > 0 ? (
                        mediaByCategory.map((item: any) => (
                            <div key={item.category} className="border border-border p-4">
                                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{item.category}</p>
                                <p className="text-2xl font-bebas mt-1">{item.count}</p>
                                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mt-2">
                                    {item.sizeMB} MB
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground font-mono text-xs uppercase">No media analytics available</p>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import AnalyticsTabs from "@/components/admin/analytics/AnalyticsTabs";
import { useAdminStats } from "@/components/admin/analytics/useAdminStats";

export default function AnalyticsAudiencePage() {
    const { stats, loading, error } = useAdminStats();

    if (loading) return <div className="p-6 font-mono text-xs uppercase animate-pulse">Loading analytics...</div>;
    if (error) return <div className="p-6 text-destructive text-sm">{error}</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bebas uppercase tracking-wide">Audience Analytics</h1>
                <p className="text-sm text-muted-foreground">Website-wide visitor behavior, top routes, and page category performance.</p>
            </div>
            <AnalyticsTabs />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Total Views</p>
                    <p className="text-3xl font-bebas mt-1">{stats?.audience?.totalViews || 0}</p>
                </div>
                <div className="border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Unique Visitors</p>
                    <p className="text-3xl font-bebas mt-1">{stats?.audience?.uniqueVisitors || 0}</p>
                </div>
                <div className="border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider font-mono text-muted-foreground">Unique Visitors (30d)</p>
                    <p className="text-3xl font-bebas mt-1">{stats?.audience?.uniqueVisitors30d || 0}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="border border-border bg-card">
                    <div className="px-4 py-3 border-b border-border">
                        <h2 className="text-base font-bebas uppercase tracking-wide">Page Type Breakdown</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[520px] text-sm">
                            <thead>
                                <tr className="border-b border-border text-xs uppercase tracking-wider font-mono text-muted-foreground">
                                    <th className="text-left px-4 py-3">Page Type</th>
                                    <th className="text-right px-4 py-3">Views</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(stats?.audience?.pageTypeBreakdown || []).map((row: any) => (
                                    <tr key={row.pageType} className="border-b border-border/60">
                                        <td className="px-4 py-3">{row.pageType}</td>
                                        <td className="px-4 py-3 text-right font-mono">{row.views || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="border border-border bg-card">
                    <div className="px-4 py-3 border-b border-border">
                        <h2 className="text-base font-bebas uppercase tracking-wide">Top Paths</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px] text-sm">
                            <thead>
                                <tr className="border-b border-border text-xs uppercase tracking-wider font-mono text-muted-foreground">
                                    <th className="text-left px-4 py-3">Path</th>
                                    <th className="text-right px-4 py-3">Views</th>
                                    <th className="text-right px-4 py-3">Visitors</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(stats?.audience?.topPaths || []).map((row: any) => (
                                    <tr key={row.path} className="border-b border-border/60">
                                        <td className="px-4 py-3 font-mono text-xs">{row.path}</td>
                                        <td className="px-4 py-3 text-right font-mono">{row.views || 0}</td>
                                        <td className="px-4 py-3 text-right font-mono">{row.uniqueVisitors || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="border border-border bg-card">
                <div className="px-4 py-3 border-b border-border">
                    <h2 className="text-base font-bebas uppercase tracking-wide">Region Breakdown</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-sm">
                        <thead>
                            <tr className="border-b border-border text-xs uppercase tracking-wider font-mono text-muted-foreground">
                                <th className="text-left px-4 py-3">Country</th>
                                <th className="text-left px-4 py-3">Region</th>
                                <th className="text-right px-4 py-3">Views</th>
                                <th className="text-right px-4 py-3">Visitors</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(stats?.audience?.regionBreakdown || []).map((row: any, index: number) => (
                                <tr key={`${row.country}-${row.region}-${index}`} className="border-b border-border/60">
                                    <td className="px-4 py-3">{row.country}</td>
                                    <td className="px-4 py-3">{row.region}</td>
                                    <td className="px-4 py-3 text-right font-mono">{row.views || 0}</td>
                                    <td className="px-4 py-3 text-right font-mono">{row.uniqueVisitors || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

"use client";

import AnalyticsTabs from "@/components/admin/analytics/AnalyticsTabs";
import { useUmamiStats } from "@/components/admin/analytics/useUmamiStats";

function MetricTable({ title, rows, label = "Value" }: { title: string; rows: Array<{ x: string; y: number }>; label?: string }) {
    return (
        <div className="border border-border bg-card">
            <div className="px-4 py-3 border-b border-border">
                <h2 className="text-base font-bebas uppercase tracking-wide">{title}</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                    <thead>
                        <tr className="border-b border-border text-xs uppercase tracking-wider font-mono text-muted-foreground">
                            <th className="text-left px-4 py-3">{label}</th>
                            <th className="text-right px-4 py-3">Visitors</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length > 0 ? rows.map((row, index) => (
                            <tr key={`${row.x}-${index}`} className="border-b border-border/60">
                                <td className="px-4 py-3 font-mono text-xs break-all">{row.x || "Unknown"}</td>
                                <td className="px-4 py-3 text-right font-mono">{row.y || 0}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={2}>No data yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function AnalyticsContentPage() {
    const { analytics, loading, error } = useUmamiStats(30);

    if (loading) return <div className="p-6 font-mono text-xs uppercase animate-pulse">Loading Umami analytics...</div>;
    if (error) return <div className="p-6 text-destructive text-sm">{error}</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bebas uppercase tracking-wide">Content Analytics</h1>
                <p className="text-sm text-muted-foreground">Top paths from Umami. Content-specific rollups should be modeled with Umami events or URL groups.</p>
            </div>
            <AnalyticsTabs />

            {!analytics?.configured ? (
                <div className="border border-border bg-card p-4 text-sm text-muted-foreground">Umami is not configured yet.</div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <MetricTable title="Top Paths" rows={analytics.metrics.paths || []} label="Path" />
                    <MetricTable title="Entry Pages" rows={analytics.metrics.entryPages || []} label="Entry" />
                    <MetricTable title="Exit Pages" rows={analytics.metrics.exitPages || []} label="Exit" />
                    <MetricTable title="Page Titles" rows={analytics.metrics.titles || []} label="Title" />
                    <MetricTable title="Hostnames" rows={analytics.metrics.hostnames || []} label="Hostname" />
                    <MetricTable title="Events" rows={analytics.metrics.events || []} label="Event" />
                    <MetricTable title="Tags" rows={analytics.metrics.tags || []} label="Tag" />
                </div>
            )}
        </div>
    );
}

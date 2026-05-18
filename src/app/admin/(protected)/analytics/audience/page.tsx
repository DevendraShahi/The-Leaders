"use client";

import AnalyticsTabs from "@/components/admin/analytics/AnalyticsTabs";
import { useUmamiStats } from "@/components/admin/analytics/useUmamiStats";

function MetricTable({ title, rows, label }: { title: string; rows: Array<{ x: string; y: number }>; label: string }) {
    return (
        <div className="border border-border bg-card">
            <div className="px-4 py-3 border-b border-border">
                <h2 className="text-base font-bebas uppercase tracking-wide">{title}</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                    <thead>
                        <tr className="border-b border-border text-xs uppercase tracking-wider font-mono text-muted-foreground">
                            <th className="text-left px-4 py-3">{label}</th>
                            <th className="text-right px-4 py-3">Visitors</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={`${row.x}-${index}`} className="border-b border-border/60">
                                <td className="px-4 py-3">{row.x || "Unknown"}</td>
                                <td className="px-4 py-3 text-right font-mono">{row.y || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function AnalyticsAudiencePage() {
    const { analytics, loading, error } = useUmamiStats(30);

    if (loading) return <div className="p-6 font-mono text-xs uppercase animate-pulse">Loading Umami analytics...</div>;
    if (error) return <div className="p-6 text-destructive text-sm">{error}</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bebas uppercase tracking-wide">Audience Analytics</h1>
                <p className="text-sm text-muted-foreground">Visitor geography and referral data from Umami.</p>
            </div>
            <AnalyticsTabs />

            {!analytics?.configured ? (
                <div className="border border-border bg-card p-4 text-sm text-muted-foreground">Umami is not configured yet.</div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <MetricTable title="Countries" rows={analytics.metrics.countries || []} label="Country" />
                    <MetricTable title="Regions" rows={analytics.metrics.regions || []} label="Region" />
                    <MetricTable title="Cities" rows={analytics.metrics.cities || []} label="City" />
                    <MetricTable title="Languages" rows={analytics.metrics.languages || []} label="Language" />
                    <MetricTable title="Browsers" rows={analytics.metrics.browsers || []} label="Browser" />
                    <MetricTable title="Operating Systems" rows={analytics.metrics.operatingSystems || []} label="OS" />
                    <MetricTable title="Devices" rows={analytics.metrics.devices || []} label="Device" />
                    <MetricTable title="Screens" rows={analytics.metrics.screens || []} label="Screen" />
                    <MetricTable title="Referrers" rows={analytics.metrics.referrers || []} label="Referrer" />
                    <MetricTable title="Channels" rows={analytics.metrics.channels || []} label="Channel" />
                </div>
            )}
        </div>
    );
}

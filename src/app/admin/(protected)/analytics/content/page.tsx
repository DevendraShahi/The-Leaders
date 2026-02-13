"use client";

import AnalyticsTabs from "@/components/admin/analytics/AnalyticsTabs";
import { useAdminStats } from "@/components/admin/analytics/useAdminStats";

type Row = {
    slug?: string;
    title?: { en?: string; ne?: string } | string;
    name?: { en?: string; ne?: string } | string;
    claim?: { en?: string; ne?: string } | string;
    title_en?: string;
    views?: number;
};

function resolveText(value: any): string {
    if (!value) return "Untitled";
    if (typeof value === "string") return value;
    return value.en || value.ne || "Untitled";
}

function TableSection({ title, rows, kind }: { title: string; rows: Row[]; kind: "title" | "name" | "claim" | "title_en" }) {
    return (
        <div className="border border-border bg-card">
            <div className="px-4 py-3 border-b border-border">
                <h2 className="text-base font-bebas uppercase tracking-wide">{title}</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                    <thead>
                        <tr className="border-b border-border text-xs uppercase tracking-wider font-mono text-muted-foreground">
                            <th className="text-left px-4 py-3">Content</th>
                            <th className="text-left px-4 py-3">Slug/ID</th>
                            <th className="text-right px-4 py-3">Views</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((item, idx) => (
                            <tr key={`${item.slug || idx}`} className="border-b border-border/60">
                                <td className="px-4 py-3">
                                    {kind === "title" && resolveText(item.title)}
                                    {kind === "name" && resolveText(item.name)}
                                    {kind === "claim" && resolveText(item.claim)}
                                    {kind === "title_en" && resolveText(item.title_en)}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{item.slug || "-"}</td>
                                <td className="px-4 py-3 text-right font-mono">{item.views || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function AnalyticsContentPage() {
    const { stats, loading, error } = useAdminStats();

    if (loading) return <div className="p-6 font-mono text-xs uppercase animate-pulse">Loading analytics...</div>;
    if (error) return <div className="p-6 text-destructive text-sm">{error}</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bebas uppercase tracking-wide">Content Analytics</h1>
                <p className="text-sm text-muted-foreground">Detailed stats across all non-election and election content entities.</p>
            </div>
            <AnalyticsTabs />

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="border border-border bg-card p-4"><p className="text-xs uppercase font-mono text-muted-foreground">Articles</p><p className="text-2xl font-bebas">{stats?.views?.articles || 0}</p></div>
                <div className="border border-border bg-card p-4"><p className="text-xs uppercase font-mono text-muted-foreground">Leaders</p><p className="text-2xl font-bebas">{stats?.views?.leaders || 0}</p></div>
                <div className="border border-border bg-card p-4"><p className="text-xs uppercase font-mono text-muted-foreground">History</p><p className="text-2xl font-bebas">{stats?.views?.history || 0}</p></div>
                <div className="border border-border bg-card p-4"><p className="text-xs uppercase font-mono text-muted-foreground">Daily Brief</p><p className="text-2xl font-bebas">{stats?.views?.dailyBriefs || 0}</p></div>
                <div className="border border-border bg-card p-4"><p className="text-xs uppercase font-mono text-muted-foreground">Fact Check</p><p className="text-2xl font-bebas">{stats?.views?.factChecks || 0}</p></div>
                <div className="border border-border bg-card p-4"><p className="text-xs uppercase font-mono text-muted-foreground">Election Articles</p><p className="text-2xl font-bebas">{stats?.views?.electionArticles || 0}</p></div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <TableSection title="Top Articles" rows={stats?.popularContent?.articles || []} kind="title" />
                <TableSection title="Top Leaders" rows={stats?.popularContent?.leaders || []} kind="name" />
                <TableSection title="Top History" rows={stats?.popularContent?.history || []} kind="title" />
                <TableSection title="Top Election Articles" rows={stats?.popularContent?.electionArticles || []} kind="title_en" />
                <TableSection title="Top Daily Briefs" rows={stats?.popularContent?.dailyBriefs || []} kind="title" />
                <TableSection title="Top Fact Checks" rows={stats?.popularContent?.factChecks || []} kind="claim" />
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/admin/AuthProvider";
import type { UmamiDashboardData } from "@/lib/umami";

export function useUmamiStats(days = 30) {
    const { isAuthenticated } = useAuth();
    const [analytics, setAnalytics] = useState<UmamiDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchStats = async () => {
            if (!isAuthenticated) return;
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/admin/umami?days=${days}`, {
                    credentials: 'same-origin',
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || "Failed to fetch Umami analytics");
                if (!cancelled) setAnalytics(data?.data?.analytics || null);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchStats();
        return () => {
            cancelled = true;
        };
    }, [days, isAuthenticated]);

    return { analytics, loading, error };
}

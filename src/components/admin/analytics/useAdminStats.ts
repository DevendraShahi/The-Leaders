"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/admin/AuthProvider";

export function useAdminStats() {
    const { token } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchWithRetry = async (attempt = 0): Promise<void> => {
            if (!token || cancelled) return;
            try {
                setError(null);
                const res = await fetch("/api/admin/stats", {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });
                if (!res.ok) throw new Error("Failed to fetch analytics");
                const data = await res.json();
                if (cancelled) return;
                setStats(data.data);
                setLoading(false);
            } catch (err) {
                if (cancelled) return;
                if (attempt < 2) {
                    await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 600));
                    return fetchWithRetry(attempt + 1);
                }
                setError(err instanceof Error ? err.message : "Unknown error");
                setLoading(false);
            }
        };

        const fetchStats = async () => {
            if (!token) return;
            setLoading(true);
            await fetchWithRetry();
        };

        fetchStats();
        const interval = window.setInterval(fetchStats, 60_000);
        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [token]);

    return { stats, loading, error };
}

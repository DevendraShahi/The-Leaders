import { NextRequest } from "next/server";
import { withAuth, apiResponse, apiError } from "@/lib/middleware";
import { getUmamiDashboardData } from "@/lib/umami";

async function getUmamiAnalytics(request: NextRequest) {
    try {
        const daysParam = Number(new URL(request.url).searchParams.get("days") || "30");
        const days = Number.isFinite(daysParam) ? Math.min(Math.max(daysParam, 1), 180) : 30;
        const analytics = await getUmamiDashboardData(days);
        return apiResponse({ analytics });
    } catch (error) {
        console.error("Umami analytics error:", error);
        return apiError(error instanceof Error ? error.message : "Failed to fetch Umami analytics", 500);
    }
}

export const GET = withAuth(getUmamiAnalytics);

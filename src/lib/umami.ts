export type UmamiMetricRow = {
    x: string;
    y: number;
};

export type UmamiPageviewRow = {
    x?: string;
    t?: string;
    y?: number;
    pageviews?: number;
    visitors?: number;
};

export type UmamiStats = {
    pageviews: number;
    visitors: number;
    visits: number;
    bounces: number;
    totaltime: number;
    comparison?: Partial<UmamiStats>;
};

export type UmamiMetricSet = {
    paths: UmamiMetricRow[];
    entryPages: UmamiMetricRow[];
    exitPages: UmamiMetricRow[];
    titles: UmamiMetricRow[];
    referrers: UmamiMetricRow[];
    channels: UmamiMetricRow[];
    countries: UmamiMetricRow[];
    regions: UmamiMetricRow[];
    cities: UmamiMetricRow[];
    browsers: UmamiMetricRow[];
    operatingSystems: UmamiMetricRow[];
    devices: UmamiMetricRow[];
    languages: UmamiMetricRow[];
    screens: UmamiMetricRow[];
    events: UmamiMetricRow[];
    hostnames: UmamiMetricRow[];
    tags: UmamiMetricRow[];
};

export type UmamiDashboardData = {
    configured: boolean;
    websiteId?: string;
    dashboardUrl?: string;
    stats: UmamiStats;
    activeVisitors: number;
    pageviews: UmamiPageviewRow[];
    sessions: UmamiPageviewRow[];
    metrics: UmamiMetricSet;
};

function envValue(name: string) {
    return (process.env[name] || "").trim();
}

export function getUmamiConfig() {
    const websiteId = envValue("NEXT_PUBLIC_UMAMI_WEBSITE_ID");
    const apiKey = envValue("UMAMI_API_KEY");
    const apiEndpoint = envValue("UMAMI_API_ENDPOINT") || "https://api.umami.is/v1";
    const dashboardUrl = envValue("UMAMI_DASHBOARD_URL");
    const hasRealWebsiteId = Boolean(websiteId && websiteId !== "dummy-umami-website-id");
    const hasRealApiKey = Boolean(apiKey && apiKey !== "dummy-umami-api-key");

    return {
        websiteId,
        apiKey,
        apiEndpoint: apiEndpoint.replace(/\/$/, ""),
        dashboardUrl,
        configured: hasRealWebsiteId && hasRealApiKey,
    };
}

async function umamiFetch<T>(path: string, searchParams: URLSearchParams): Promise<T> {
    const config = getUmamiConfig();
    if (!config.configured) {
        throw new Error("Umami is not configured");
    }

    const url = `${config.apiEndpoint}${path}?${searchParams.toString()}`;
    const response = await fetch(url, {
        headers: {
            Accept: "application/json",
            "x-umami-api-key": config.apiKey,
        },
        next: { revalidate: 1800, tags: ["umami-analytics"] },
    });

    if (!response.ok) {
        throw new Error(`Umami API returned ${response.status}`);
    }

    return response.json() as Promise<T>;
}

async function safeMetric(type: string, params: URLSearchParams) {
    try {
        return await umamiFetch<UmamiMetricRow[]>(type, params);
    } catch (error) {
        console.warn(`Failed to load Umami metric ${params.get("type")}:`, error);
        return [];
    }
}

export async function getUmamiDashboardData(days = 30): Promise<UmamiDashboardData> {
    const config = getUmamiConfig();
    if (!config.configured) {
        return {
            configured: false,
            websiteId: config.websiteId,
            dashboardUrl: config.dashboardUrl,
            stats: { pageviews: 0, visitors: 0, visits: 0, bounces: 0, totaltime: 0 },
            activeVisitors: 0,
            pageviews: [],
            sessions: [],
            metrics: {
                paths: [],
                entryPages: [],
                exitPages: [],
                titles: [],
                referrers: [],
                channels: [],
                countries: [],
                regions: [],
                cities: [],
                browsers: [],
                operatingSystems: [],
                devices: [],
                languages: [],
                screens: [],
                events: [],
                hostnames: [],
                tags: [],
            },
        };
    }

    const endAt = Date.now();
    const startAt = endAt - days * 24 * 60 * 60 * 1000;
    const baseParams = new URLSearchParams({
        startAt: String(startAt),
        endAt: String(endAt),
        timezone: "UTC",
    });

    const metricParams = (type: string, limit = 10) => {
        const params = new URLSearchParams(baseParams);
        params.set("type", type);
        params.set("limit", String(limit));
        return params;
    };

    const pageviewParams = new URLSearchParams(baseParams);
    pageviewParams.set("unit", days > 60 ? "month" : "day");

    const metricsPath = `/websites/${config.websiteId}/metrics`;
    const [stats, active, pageviewPayload, paths, entryPages, exitPages, titles, referrers, channels, countries, regions, cities, browsers, operatingSystems, devices, languages, screens, events, hostnames, tags] = await Promise.all([
        umamiFetch<UmamiStats>(`/websites/${config.websiteId}/stats`, baseParams),
        umamiFetch<{ visitors?: number }>(`/websites/${config.websiteId}/active`, new URLSearchParams()),
        umamiFetch<UmamiPageviewRow[] | { pageviews?: UmamiPageviewRow[]; sessions?: UmamiPageviewRow[] }>(`/websites/${config.websiteId}/pageviews`, pageviewParams),
        safeMetric(metricsPath, metricParams("path", 20)),
        safeMetric(metricsPath, metricParams("entry", 12)),
        safeMetric(metricsPath, metricParams("exit", 12)),
        safeMetric(metricsPath, metricParams("title", 12)),
        safeMetric(metricsPath, metricParams("referrer", 12)),
        safeMetric(metricsPath, metricParams("channel", 12)),
        safeMetric(metricsPath, metricParams("country", 20)),
        safeMetric(metricsPath, metricParams("region", 20)),
        safeMetric(metricsPath, metricParams("city", 20)),
        safeMetric(metricsPath, metricParams("browser", 12)),
        safeMetric(metricsPath, metricParams("os", 12)),
        safeMetric(metricsPath, metricParams("device", 12)),
        safeMetric(metricsPath, metricParams("language", 12)),
        safeMetric(metricsPath, metricParams("screen", 12)),
        safeMetric(metricsPath, metricParams("event", 20)),
        safeMetric(metricsPath, metricParams("hostname", 12)),
        safeMetric(metricsPath, metricParams("tag", 12)),
    ]);

    return {
        configured: true,
        websiteId: config.websiteId,
        dashboardUrl: config.dashboardUrl,
        stats,
        activeVisitors: active.visitors || 0,
        pageviews: Array.isArray(pageviewPayload) ? pageviewPayload : pageviewPayload.pageviews || [],
        sessions: Array.isArray(pageviewPayload) ? [] : pageviewPayload.sessions || [],
        metrics: {
            paths,
            entryPages,
            exitPages,
            titles,
            referrers,
            channels,
            countries,
            regions,
            cities,
            browsers,
            operatingSystems,
            devices,
            languages,
            screens,
            events,
            hostnames,
            tags,
        },
    };
}

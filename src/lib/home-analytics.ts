type HomeAnalyticsValue = string | number | boolean | null | undefined;

export type HomeAnalyticsPayload = Record<string, HomeAnalyticsValue>;

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
        dataLayer?: unknown[];
    }
}

export function trackHomeEvent(eventName: string, payload: HomeAnalyticsPayload = {}): void {
    if (typeof window === "undefined") return;

    try {
        if (typeof window.gtag === "function") {
            window.gtag("event", eventName, payload);
            return;
        }

        if (Array.isArray(window.dataLayer)) {
            window.dataLayer.push({ event: eventName, ...payload });
        }
    } catch {
        // Never block UI interactions because analytics is unavailable.
    }
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiBase } from "@/api/config";
import { useAppStore } from "@/state/useAppStore";
export type UsageEvent = "session_start" | "return_visit" | "article_open" | "article_complete" | "save_success" | "request_failure" | "render_failure";
/** Opt-in, first-party aggregate counters. No user, device, article or query identifiers. */
export function recordUsage(event: UsageEvent) {
    const state = useAppStore.getState();
    if (!state.usageSharing) return;
    void (async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        try { await fetch(`${apiBase()}/api/v1/usage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event, language: state.language }), signal: controller.signal }); }
        catch { /* Telemetry never blocks reading and does not recursively report failures. */ }
        finally { clearTimeout(timeout); }
    })();
}
export async function recordSession() {
    if (!useAppStore.getState().usageSharing) return;
    try {
        const today = new Date().toISOString().slice(0, 10);
        const last = await AsyncStorage.getItem("leaders:usage:last-day");
        recordUsage("session_start");
        if (last && last !== today) recordUsage("return_visit");
        await AsyncStorage.setItem("leaders:usage:last-day", today);
    } catch { /* Storage failure must not prevent launching the app. */ }
}

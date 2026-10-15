import { apiBase } from "@/api/config";
import { z } from "zod";
import { Platform } from "react-native";

const accountSchema = z.object({ isAdmin: z.boolean(), studioScope: z.string().min(1).nullable(), profile: z.object({ name: z.string(), role: z.string() }).nullable().optional() }).refine(value => !value.isAdmin || Boolean(value.studioScope));

export function accountApiBase() {
    const url = new URL(apiBase());
    // Expo's LAN URL and localhost are different cookie sites. Keep the web
    // preview on the same hostname as its local admin sign-in session.
    if (__DEV__ && Platform.OS === "web" && typeof window !== "undefined" && /^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname)) {
        url.hostname = window.location.hostname;
    }
    return url.toString().replace(/\/$/, "");
}

export async function fetchAdminAccount(token?: string | null) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch(`${accountApiBase()}/api/v1/auth/me`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            cache: "no-store", signal: controller.signal,
        });
        if (!response.ok) throw new AdminAccountError(response.status);
        return accountSchema.parse(await response.json());
    } finally { clearTimeout(timeout); }
}

export class AdminAccountError extends Error {
    constructor(public status: number) { super(status === 401 ? "Your session has expired. Please sign in again." : "Unable to verify account access"); }
}

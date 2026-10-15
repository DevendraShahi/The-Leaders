import Constants from "expo-constants";
const LOCAL_API_PORT = 3000;

function trimTrailingSlash(value: string) {
    return value.replace(/\/+$/, "");
}

function hostnameFromUri(value: string | null | undefined) {
    if (!value) return null;

    try {
        const url = new URL(value.includes("://") ? value : `http://${value}`);
        return url.hostname || null;
    } catch {
        return null;
    }
}

export function apiBase() {
    const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
    if (configuredUrl) {
        const url = new URL(configuredUrl);
        if (!__DEV__ && (url.protocol !== "https:" || ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname))) throw new Error("The Leaders API must use a public HTTPS URL in production.");
        return trimTrailingSlash(configuredUrl);
    }
    if (!__DEV__) throw new Error("The Leaders API is not configured for this release.");

    if (__DEV__) {
        const developmentHost = hostnameFromUri(
            Constants.expoConfig?.hostUri || Constants.linkingUri
        );
        if (developmentHost) return `http://${developmentHost}:${LOCAL_API_PORT}`;
    }

    return `http://localhost:${LOCAL_API_PORT}`;
}

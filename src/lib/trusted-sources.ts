import Settings from "@/models/Settings";

export type TrustedSource = { name: string; feedUrl: string; websiteUrl?: string; enabled: boolean };

function url(value: string) {
    try { return new URL(value); } catch { return null; }
}

export function isSafeExternalUrl(value: string) {
    const parsed = url(value);
    if (!parsed || !["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password) return false;
    const host = parsed.hostname.toLowerCase();
    return !(
        host === "localhost" || host.endsWith(".localhost") || /^127\./.test(host) || /^0\.0\.0\.0$/.test(host) ||
        /^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host) || host === "::1"
    );
}

export function isTrustedSourceUrl(value: string, sources: TrustedSource[]) {
    const candidate = url(value);
    if (!candidate) return false;
    return sources.some((source) => {
        const base = url(source.websiteUrl || source.feedUrl);
        return Boolean(source.enabled && base && candidate.hostname.toLowerCase() === base.hostname.toLowerCase());
    });
}

export async function getTrustedSources() {
    const settings = await Settings.findOne().lean();
    return (settings?.trustedSources || []).filter((source: TrustedSource) => source.enabled && isSafeExternalUrl(source.feedUrl)) as TrustedSource[];
}

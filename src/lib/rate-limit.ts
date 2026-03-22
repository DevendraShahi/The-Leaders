type RateLimitEntry = {
    count: number;
    resetAt: number;
};

type RateLimitStore = Map<string, RateLimitEntry>;

declare global {
    var __rateLimitStore: RateLimitStore | undefined;
}

function getStore(): RateLimitStore {
    if (!globalThis.__rateLimitStore) {
        globalThis.__rateLimitStore = new Map<string, RateLimitEntry>();
    }
    return globalThis.__rateLimitStore;
}

function cleanupStore(store: RateLimitStore, now: number) {
    for (const [key, entry] of store.entries()) {
        if (entry.resetAt <= now) {
            store.delete(key);
        }
    }
}

export function getClientIp(request: Request): string {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0]?.trim() || "unknown";
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp) return realIp.trim();

    const connectingIp = request.headers.get("cf-connecting-ip");
    if (connectingIp) return connectingIp.trim();

    return "unknown";
}

export function enforceRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number
): { limited: boolean; retryAfterSeconds?: number } {
    const now = Date.now();
    const store = getStore();

    // Opportunistic cleanup to prevent unbounded memory growth.
    if (store.size > 1000) {
        cleanupStore(store, now);
    }

    const existing = store.get(key);
    if (!existing || existing.resetAt <= now) {
        store.set(key, {
            count: 1,
            resetAt: now + windowMs,
        });
        return { limited: false };
    }

    if (existing.count >= maxRequests) {
        return {
            limited: true,
            retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
        };
    }

    existing.count += 1;
    store.set(key, existing);
    return { limited: false };
}

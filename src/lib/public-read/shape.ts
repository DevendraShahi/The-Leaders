import { absoluteUrl } from "@/lib/seo";

export type Bilingual = {
    en: string;
    ne: string;
};

export function bilingual(value: unknown): Bilingual {
    if (typeof value === "string") {
        const text = value.trim();
        return { en: text, ne: text };
    }

    if (!value || typeof value !== "object") {
        return { en: "", ne: "" };
    }

    const record = value as { en?: unknown; ne?: unknown };
    const en = typeof record.en === "string" ? record.en.trim() : "";
    const ne = typeof record.ne === "string" ? record.ne.trim() : "";

    return {
        en: en || ne,
        ne: ne || en,
    };
}

export function publicImage(value: unknown): string {
    if (typeof value !== "string") return "";
    const raw = value.trim();
    if (!raw) return "";
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    return absoluteUrl(raw.startsWith("/") ? raw : `/${raw}`);
}

export function toIso(value: unknown): string {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString();
    }
    if (typeof value === "string" && value.trim()) {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
        return value;
    }
    return "";
}

export function readPageParams(searchParams: URLSearchParams, defaultLimit = 20) {
    const pageValue = Number(searchParams.get("page") || "1");
    const limitValue = Number(searchParams.get("limit") || String(defaultLimit));
    const page = Number.isFinite(pageValue) ? Math.min(1000, Math.max(1, Math.floor(pageValue))) : 1;
    const limit = Number.isFinite(limitValue)
        ? Math.min(50, Math.max(1, Math.floor(limitValue)))
        : defaultLimit;

    return {
        page,
        limit,
        skip: (page - 1) * limit,
    };
}

export function pagePayload<T>(items: T[], total: number, page: number, limit: number) {
    return {
        items,
        page,
        limit,
        total,
        hasMore: page * limit < total,
    };
}

export function slicePage<T>(items: T[], page: number, limit: number) {
    const start = (page - 1) * limit;
    return pagePayload(items.slice(start, start + limit), items.length, page, limit);
}

export function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function includesQuery(value: string, query: string): boolean {
    return value.toLowerCase().includes(query.trim().toLowerCase());
}

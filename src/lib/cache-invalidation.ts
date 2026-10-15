import { revalidatePath, revalidateTag } from "next/cache";

export type PublicContentKind =
    | "article"
    | "leader"
    | "history"
    | "daily-brief"
    | "fact-check"
    | "election-article"
    | "column-article"
    | "settings";

const tagMap: Record<PublicContentKind, string[]> = {
    article: ["articles", "stats", "admin-stats"],
    leader: ["leaders", "stats", "admin-stats"],
    history: [],
    "daily-brief": ["daily-briefs", "admin-stats"],
    "fact-check": [],
    "election-article": [],
    "column-article": [],
    settings: ["settings"],
};

const basePathMap: Record<PublicContentKind, string[]> = {
    article: ["/", "/articles", "/api/v1/home", "/api/v1/articles", "/api/v1/search"],
    leader: ["/", "/leaders", "/api/v1/leaders", "/api/v1/search"],
    history: [],
    "daily-brief": ["/coverage", "/coverage/daily-brief", "/api/v1/home", "/api/v1/briefs"],
    "fact-check": [],
    "election-article": [],
    "column-article": [],
    settings: ["/", "/api/settings", "/api/maintenance/status"],
};

function detailPaths(kind: PublicContentKind, slug?: string) {
    if (!slug) return [];
    if (kind === "article") return [`/articles/${slug}`];
    if (kind === "leader") return [`/leaders/${slug}`];
    if (kind === "daily-brief") return [`/coverage/daily-brief/${slug}`];
    return [];
}

export function invalidatePublicContent(kind: PublicContentKind, slug?: string) {
    for (const tag of tagMap[kind]) {
        revalidateTag(tag, "max");
    }

    for (const path of [...basePathMap[kind], ...detailPaths(kind, slug)]) {
        revalidatePath(path);
    }
}

export function invalidateManyPublicContent(items: Array<{ kind: PublicContentKind; slug?: string }>) {
    const seen = new Set<string>();
    for (const item of items) {
        const key = `${item.kind}:${item.slug || ""}`;
        if (seen.has(key)) continue;
        seen.add(key);
        invalidatePublicContent(item.kind, item.slug);
    }
}

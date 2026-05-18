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
    history: ["history", "admin-stats"],
    "daily-brief": ["daily-briefs", "election-data", "admin-stats"],
    "fact-check": ["fact-checks", "election-data", "admin-stats"],
    "election-article": ["election-articles", "election-data", "admin-stats"],
    "column-article": ["column-articles", "election-data", "admin-stats"],
    settings: ["settings"],
};

const basePathMap: Record<PublicContentKind, string[]> = {
    article: ["/", "/articles"],
    leader: ["/", "/leaders"],
    history: ["/history"],
    "daily-brief": ["/coverage", "/coverage/daily-brief", "/election-2026", "/election-2026/daily-brief"],
    "fact-check": ["/election-2026", "/election-2026/fact-checks"],
    "election-article": ["/election-2026", "/election-2026/analyses"],
    "column-article": ["/coverage", "/coverage/columns"],
    settings: ["/", "/api/settings", "/api/maintenance/status"],
};

function detailPaths(kind: PublicContentKind, slug?: string) {
    if (!slug) return [];
    if (kind === "article") return [`/articles/${slug}`];
    if (kind === "leader") return [`/leaders/${slug}`];
    if (kind === "daily-brief") return [`/coverage/daily-brief/${slug}`, `/election-2026/daily-brief/${slug}`];
    if (kind === "fact-check") return [`/election-2026/fact-checks/${slug}`];
    if (kind === "election-article") return [`/election-2026/analyses/${slug}`];
    if (kind === "column-article") return [`/coverage/columns/${slug}`];
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

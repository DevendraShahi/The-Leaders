"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type ContentType =
    | "article"
    | "leader"
    | "daily-brief"
    | "fact-check"
    | "election-article";

type RouteMeta = {
    pageType: string;
    contentType?: ContentType;
    contentSlug?: string;
};

const VISITOR_KEY = "tl_visitor_id";

function getVisitorId(): string {
    if (typeof window === "undefined") return "";
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const generated = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(VISITOR_KEY, generated);
    return generated;
}

function getRouteMeta(pathname: string): RouteMeta {
    if (pathname === "/") return { pageType: "home" };
    if (pathname.startsWith("/admin")) return { pageType: "admin" };

    const articleMatch = pathname.match(/^\/articles\/([^/]+)$/);
    if (articleMatch) {
        return { pageType: "article-detail", contentType: "article", contentSlug: articleMatch[1] };
    }

    const leaderMatch = pathname.match(/^\/leaders\/([^/]+)$/);
    if (leaderMatch) {
        return { pageType: "leader-detail", contentType: "leader", contentSlug: leaderMatch[1] };
    }

    const electionArticleMatch = pathname.match(/^\/election-2026\/analyses\/([^/]+)$/);
    if (electionArticleMatch) {
        return { pageType: "election-article-detail", contentType: "election-article", contentSlug: electionArticleMatch[1] };
    }

    const briefMatch = pathname.match(/^\/election-2026\/daily-brief\/([^/]+)$/);
    if (briefMatch) {
        return { pageType: "daily-brief-detail", contentType: "daily-brief", contentSlug: briefMatch[1] };
    }

    const factCheckMatch = pathname.match(/^\/election-2026\/fact-checks\/([^/]+)$/);
    if (factCheckMatch) {
        return { pageType: "fact-check-detail", contentType: "fact-check", contentSlug: factCheckMatch[1] };
    }

    if (pathname.startsWith("/election-2026")) return { pageType: "election" };
    if (pathname.startsWith("/articles")) return { pageType: "articles" };
    if (pathname.startsWith("/leaders")) return { pageType: "leaders" };
    if (pathname.startsWith("/history")) return { pageType: "history" };

    return { pageType: "page" };
}

export default function ViewTracker() {
    const pathname = usePathname();

    useEffect(() => {
        if (!pathname) return;
        if (pathname.startsWith("/admin")) return;

        const visitorId = getVisitorId();
        const routeMeta = getRouteMeta(pathname);

        void fetch("/api/track-view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                visitorId,
                path: pathname,
                pageType: routeMeta.pageType,
                contentType: routeMeta.contentType,
                contentSlug: routeMeta.contentSlug,
            }),
            keepalive: true,
        }).catch(() => {});
    }, [pathname]);

    return null;
}

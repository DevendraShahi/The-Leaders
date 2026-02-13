import { IPermissions } from "@/models/Admin";

export type AdminPageKey = keyof IPermissions["pageAccess"];

type AdminRouteConfig = {
    key: AdminPageKey;
    matches: (pathname: string) => boolean;
};

export const ADMIN_ROUTE_ACCESS: AdminRouteConfig[] = [
    { key: "dashboard", matches: (pathname) => pathname === "/admin" },
    { key: "dashboard", matches: (pathname) => pathname.startsWith("/admin/analytics") },
    { key: "content", matches: (pathname) => pathname.startsWith("/admin/content") },
    { key: "media", matches: (pathname) => pathname.startsWith("/admin/media") },
    { key: "messages", matches: (pathname) => pathname.startsWith("/admin/messages") },
    { key: "settings", matches: (pathname) => pathname.startsWith("/admin/settings") },
    { key: "users", matches: (pathname) => pathname.startsWith("/admin/users") },
];

export const ADMIN_DEFAULT_REDIRECTS: Record<AdminPageKey, string> = {
    dashboard: "/admin",
    content: "/admin/content?type=articles",
    media: "/admin/media",
    messages: "/admin/messages",
    settings: "/admin/settings",
    users: "/admin/users",
};

export function hasAdminPageAccess(
    permissions: IPermissions | undefined,
    key: AdminPageKey
): boolean {
    return Boolean(permissions?.pageAccess?.[key]);
}

export function resolveRequiredAdminPage(pathname: string): AdminPageKey | null {
    const hit = ADMIN_ROUTE_ACCESS.find((route) => route.matches(pathname));
    return hit?.key || null;
}

export function firstAllowedAdminPage(
    permissions: IPermissions | undefined
): string | null {
    const pageAccess = permissions?.pageAccess;
    if (!pageAccess) return null;

    const orderedKeys: AdminPageKey[] = [
        "dashboard",
        "content",
        "media",
        "messages",
        "settings",
        "users",
    ];

    for (const key of orderedKeys) {
        if (pageAccess[key]) {
            return ADMIN_DEFAULT_REDIRECTS[key];
        }
    }

    return null;
}

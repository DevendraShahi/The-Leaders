import type { IAdmin } from "@/models/Admin";

export function accessRequestName(firstName?: string | null, lastName?: string | null) {
    return [firstName, lastName].filter(Boolean).join(" ").trim() || undefined;
}

export function usernameBase(username?: string | null, email?: string | null) {
    const candidate = username || email?.split("@")[0] || "newsroom";
    const normalized = candidate.toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    return normalized.slice(0, 40) || "newsroom";
}

export function canReviewAccessRequest(admin: IAdmin) {
    return admin.role === "superadmin";
}

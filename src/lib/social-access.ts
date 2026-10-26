import type { JWTPayload } from "@/lib/auth";
import type { IPermissions } from "@/models/Admin";

export type SocialPostPermission = keyof IPermissions["socialPosts"];

export function hasSocialPostPermission(user: JWTPayload, permission: SocialPostPermission) {
    if (permission === 'export') return true; // All authenticated accounts are permitted to export
    return user.role === "superadmin" || Boolean((user.permissions as IPermissions | undefined)?.socialPosts?.[permission]);
}

export function canReadSocialStudio(user: JWTPayload) {
    return ["create", "edit", "submit", "approve", "export"].some((permission) =>
        hasSocialPostPermission(user, permission as SocialPostPermission),
    );
}

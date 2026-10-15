import { describe, expect, it } from "vitest";
import { accessRequestName, canReviewAccessRequest, usernameBase } from "@/lib/admin-access-request";
import { getDefaultPermissions } from "@/lib/rbac";

describe("admin access requests", () => {
    it("creates a stable display name and safe username seed from Clerk identity data", () => {
        expect(accessRequestName("Asha", "Karki")).toBe("Asha Karki");
        expect(accessRequestName(null, null)).toBeUndefined();
        expect(usernameBase("Asha Karki!", "asha@example.com")).toBe("asha-karki");
        expect(usernameBase(undefined, "writer@example.com")).toBe("writer");
    });

    it("limits access-request decisions to the main admin role", () => {
        expect(canReviewAccessRequest({ role: "superadmin", permissions: getDefaultPermissions("superadmin") } as any)).toBe(true);
        expect(canReviewAccessRequest({ role: "editorial", permissions: getDefaultPermissions("editorial") } as any)).toBe(false);
    });
});

import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ account: vi.fn() }));
vi.mock("@/lib/mobile-auth", () => ({ getMobileAdmin: mocks.account }));
import { GET } from "@/app/api/v1/account/route";
const request = (origin = "https://mobile.example.com") => new NextRequest("https://api.example.com/api/v1/account", { headers: { origin } });
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("MOBILE_WEB_ORIGIN", "https://mobile.example.com"); });
afterEach(() => vi.unstubAllEnvs());
describe("Mobile admin tab access", () => {
    it.each(["signed_out", "not_provisioned", "inactive"])("hides Studio for %s accounts", async kind => {
        mocks.account.mockResolvedValue(null);
        const response = await GET(request());
        expect(await response.json()).toEqual({ isAdmin: false, studioScope: null, profile: null });
    });
    it("reveals Studio only for a verified active admin without disclosing account details", async () => {
        mocks.account.mockResolvedValue({ _id: "admin-1", email: "private@example.com" });
        const response = await GET(request());
        expect(await response.json()).toEqual({ isAdmin: true, studioScope: "admin-1", profile: {} });
        expect(response.headers.get("Cache-Control")).toBe("private, no-store");
        expect(response.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    });
    it("does not grant credentialed cross-origin access to arbitrary websites", async () => {
        mocks.account.mockResolvedValue(null);
        const response = await GET(request("https://untrusted.example.com"));
        expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    });
    it("fails closed when verification fails", async () => {
        mocks.account.mockRejectedValue(new Error("unavailable"));
        const response = await GET(request());
        expect(response.status).toBe(503);
        expect(await response.json()).toEqual({ isAdmin: false, studioScope: null });
    });
});

import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/admin/studio/media-search/route";

// Mock middleware authentication
vi.mock("@/lib/middleware", () => ({
    withAuth: (handler: any) => (req: any, ctx: any) => handler(req, ctx),
}));

// Mock dbConnect & Media model
vi.mock("@/lib/db", () => ({
    default: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/models/Media", () => ({
    default: {
        find: vi.fn().mockReturnValue({
            sort: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue([
                        {
                            _id: "media-123",
                            originalFilename: "kathmandu-durbar.jpg",
                            secureUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
                            width: 1200,
                            height: 800,
                            size: 154000,
                            credit: "Staff Archive",
                            rightsStatus: "Staff / Licensed",
                            altText: { en: "Kathmandu Durbar Square" },
                        },
                    ]),
                }),
            }),
        }),
    },
}));

describe("media-search API route", () => {
    it("returns search results for library source", async () => {
        const req = new NextRequest("http://localhost:3000/api/admin/studio/media-search?q=durbar&source=library");
        const res = await GET(req);
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.results.length).toBeGreaterThan(0);
        expect(data.results[0].title).toBe("kathmandu-durbar.jpg");
        expect(data.results[0].source).toBe("library");
    });

    it("rejects POST with invalid or non-http URLs", async () => {
        const req = new NextRequest("http://localhost:3000/api/admin/studio/media-search", {
            method: "POST",
            body: JSON.stringify({ url: "javascript:alert(1)" }),
        });
        const res = await POST(req);
        expect(res.status).toBe(400);

        const data = await res.json();
        expect(data.error).toBeDefined();
    });
});

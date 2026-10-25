import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import { optimizeImageForUpload } from "@/lib/image";

export interface StudioMediaItem {
    id: string;
    title: string;
    url: string;
    thumbnailUrl: string;
    source: "wikimedia" | "library" | "web";
    width?: number;
    height?: number;
    size?: number;
    author?: string;
    license?: string;
    description?: string;
}

// Fetch from Wikimedia Commons API (Public domain & Creative Commons)
async function searchWikimediaCommons(query: string, limit = 20): Promise<StudioMediaItem[]> {
    try {
        const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=${limit}&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json&origin=*`;
        const response = await fetch(endpoint, {
            headers: { "User-Agent": "TheLeadersStudio/1.0 (editorial@theleaders.com)" },
            next: { revalidate: 3600 },
        });

        if (!response.ok) return [];
        const json = await response.json();
        const pages = json.query?.pages;
        if (!pages) return [];

        const items: StudioMediaItem[] = [];
        for (const key of Object.keys(pages)) {
            const page = pages[key];
            const info = page.imageinfo?.[0];
            if (!info || !info.url) continue;

            const mime = info.mime || "";
            // Only accept raster images suitable for social studio
            if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) continue;

            const meta = info.extmetadata || {};
            const title = (meta.ObjectName?.value || page.title || "")
                .replace(/^File:/i, "")
                .replace(/\.[^/.]+$/, "");
            const author = meta.Artist?.value?.replace(/<[^>]*>?/gm, "").trim() || meta.Credit?.value?.replace(/<[^>]*>?/gm, "").trim() || "Wikimedia Commons";
            const license = meta.LicenseShortName?.value || meta.UsageTerms?.value || "Creative Commons / Public Domain";
            const description = meta.ImageDescription?.value?.replace(/<[^>]*>?/gm, "").slice(0, 160) || "";

            items.push({
                id: `wm-${page.pageid}`,
                title: title.slice(0, 90),
                url: info.url,
                thumbnailUrl: info.url,
                source: "wikimedia",
                width: info.width,
                height: info.height,
                size: info.size,
                author,
                license,
                description,
            });
        }
        return items;
    } catch {
        return [];
    }
}

// Search internal Media collection in MongoDB
async function searchInternalMedia(query: string, limit = 20): Promise<StudioMediaItem[]> {
    try {
        await dbConnect();
        const filter: any = {};
        if (query.trim()) {
            filter.$or = [
                { originalFilename: { $regex: query, $options: "i" } },
                { tags: { $regex: query, $options: "i" } },
                { "altText.en": { $regex: query, $options: "i" } },
                { "altText.ne": { $regex: query, $options: "i" } },
                { credit: { $regex: query, $options: "i" } },
            ];
        }

        const docs = await Media.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return docs.map(doc => ({
            id: `lib-${String(doc._id)}`,
            title: doc.originalFilename || "Uploaded Media",
            url: doc.secureUrl,
            thumbnailUrl: doc.secureUrl,
            source: "library",
            width: doc.width,
            height: doc.height,
            size: doc.size,
            author: doc.credit || "The Leaders Archive",
            license: doc.rightsStatus || "Staff / Licensed",
            description: doc.altText?.en || doc.tags?.join(", ") || "",
        }));
    } catch {
        return [];
    }
}

// GET: search media across sources
export const GET = withAuth(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const source = searchParams.get("source") || "all";
    const limit = Math.min(Number(searchParams.get("limit") || "24"), 40);

    const tasks: Promise<StudioMediaItem[]>[] = [];

    if (source === "all" || source === "wikimedia") {
        tasks.push(searchWikimediaCommons(q.trim() || "Nepal politics history leaders", limit));
    }
    if (source === "all" || source === "library") {
        tasks.push(searchInternalMedia(q.trim(), limit));
    }

    const resultsArray = await Promise.all(tasks);
    const combined = resultsArray.flat();

    return NextResponse.json({
        query: q,
        source,
        total: combined.length,
        results: combined,
    });
});

// POST: Fetch and proxy an external image URL to base64 Data URI (prevents CORS tainting on canvas)
export const POST = withAuth(async (request: NextRequest) => {
    try {
        const body = await request.json().catch(() => ({}));
        const targetUrl = typeof body?.url === "string" ? body.url.trim() : "";

        if (!targetUrl || (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://"))) {
            return NextResponse.json({ error: "Please provide a valid http or https image URL." }, { status: 400 });
        }

        // Fetch external image with 12s timeout and 20MB limit
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(targetUrl, {
            signal: controller.signal,
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            },
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            return NextResponse.json({ error: `Could not download image (HTTP ${response.status}).` }, { status: 502 });
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.startsWith("image/") || contentType.includes("svg")) {
            return NextResponse.json({ error: "The provided URL is not a raster image (JPEG, PNG, WebP)." }, { status: 400 });
        }

        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength > 20 * 1024 * 1024) {
            return NextResponse.json({ error: "Image exceeds 20 MB size limit." }, { status: 413 });
        }

        const rawBuffer = Buffer.from(arrayBuffer);

        // Optimize with sharp if needed
        let finalBuffer = rawBuffer;
        let mimeType = contentType.split(";")[0].trim();
        let width = 0;
        let height = 0;

        try {
            const optimized = await optimizeImageForUpload(rawBuffer);
            finalBuffer = Buffer.from(optimized.buffer);
            mimeType = optimized.mimeType || mimeType;
            width = optimized.width || 0;
            height = optimized.height || 0;
        } catch {
            // Keep rawBuffer if optimization isn't needed
        }

        const base64 = finalBuffer.toString("base64");
        const dataUri = `data:${mimeType};base64,${base64}`;

        return NextResponse.json({
            success: true,
            dataUri,
            mimeType,
            width,
            height,
            size: finalBuffer.byteLength,
        });
    } catch (err) {
        return NextResponse.json({
            error: err instanceof Error ? err.message : "Failed to fetch image from URL.",
        }, { status: 500 });
    }
});

import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { optimizeImageForUpload } from "@/lib/image";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export async function POST(req: Request) {
    const clientIp = getClientIp(req);
    const limit = enforceRateLimit(`contact-upload:${clientIp}`, 5, 10 * 60 * 1000);
    if (limit.limited) {
        return NextResponse.json(
            { error: "Too many uploads. Please try again later." },
            {
                status: 429,
                headers: { "Retry-After": String(limit.retryAfterSeconds || 600) },
            }
        );
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (file.size < 1 || file.size > MAX_UPLOAD_BYTES) {
            return NextResponse.json({ error: "Image must be between 1 byte and 8 MB" }, { status: 413 });
        }

        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
            return NextResponse.json({ error: "Only JPEG, PNG, and WebP images are supported" }, { status: 415 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const optimized = await optimizeImageForUpload(buffer, file.type || undefined);

        // Upload to Cloudinary using existing utility
        const result = await uploadImage(
            optimized.buffer,
            "general",
            `contact-${Date.now()}`,
            optimized.mimeType || file.type || undefined
        );

        return NextResponse.json({ url: result.secureUrl });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Invalid image or upload failed" }, { status: 400 });
    }
}

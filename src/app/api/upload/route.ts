import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { optimizeImageForUpload } from "@/lib/image";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
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
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}

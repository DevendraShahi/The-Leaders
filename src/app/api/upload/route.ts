import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Cloudinary using existing utility
        const result = await uploadImage(buffer, "general", `contact-${Date.now()}`);

        return NextResponse.json({ url: result.secureUrl });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}

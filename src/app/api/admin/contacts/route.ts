import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";

export async function GET() {
    try {
        await dbConnect();

        const messages = await Contact.find({})
            .sort({ createdAt: -1 })
            .limit(100);

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

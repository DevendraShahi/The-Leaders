import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
import { withPageAccess } from "@/lib/middleware";

async function getContacts(_request: NextRequest) {
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

export const GET = withPageAccess("messages", getContacts);

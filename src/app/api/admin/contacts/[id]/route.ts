import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: "Message ID required" },
                { status: 400 }
            );
        }

        const deleted = await Contact.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json(
                { error: "Message not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error("Error deleting message:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

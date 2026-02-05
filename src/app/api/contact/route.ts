import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const body = await req.json();
        const { name, email, phone, location, subject, message, feeling, attachmentUrl } = body;

        console.log("Contact POST received:", { name, email, subject, attachmentUrl });

        // Basic validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Strict check for attachmentUrl
        if (attachmentUrl && typeof attachmentUrl !== "string") {
            console.error("Invalid attachmentUrl format:", attachmentUrl);
            // We won't block the request, but we'll log it. 
            // Or we can fail:
            // return NextResponse.json({ error: "Invalid attachment format" }, { status: 400 });
        }

        const newContact = await Contact.create({
            name,
            email,
            phone,
            location,
            subject,
            message,
            feeling, // This might be empty if sent before feeling selection
            attachmentUrl,
            status: "new",
        });

        console.log("Contact created:", newContact._id, "attachmentUrl:", newContact.attachmentUrl);

        return NextResponse.json(
            { message: "Message sent successfully", contact: newContact },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating contact:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { id, feeling } = body;

        if (!id || !feeling) {
            return NextResponse.json(
                { error: "ID and Feeling are required" },
                { status: 400 }
            );
        }

        const updatedContact = await Contact.findByIdAndUpdate(
            id,
            { feeling },
            { new: true }
        );

        if (!updatedContact) {
            return NextResponse.json(
                { error: "Contact not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Feeling updated successfully", contact: updatedContact },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating contact:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

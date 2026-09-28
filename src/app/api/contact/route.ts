import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import Contact from "@/models/Contact";

const feelingSchema = z.enum(["hopeful", "concerned", "determined", "uncertain"]);

const attachmentUrlSchema = z
    .string()
    .url()
    .max(2_048)
    .refine((value) => {
        const url = new URL(value);
        return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
    }, "Attachment must be a secure Cloudinary URL");

const contactSubmissionSchema = z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    phone: z.string().trim().max(40).optional().default(""),
    location: z.string().trim().max(120).optional().default(""),
    subject: z.string().trim().min(2).max(200),
    message: z.string().trim().min(10).max(10_000),
    feeling: z.union([feelingSchema, z.literal("")]).optional().default(""),
    attachmentUrl: z.union([attachmentUrlSchema, z.literal("")]).optional().default(""),
}).strict();

const feelingUpdateSchema = z.object({
    id: z.string().refine(isValidObjectId, "Invalid contact ID"),
    feeling: feelingSchema,
}).strict();

function rateLimited(retryAfterSeconds: number) {
    return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
            status: 429,
            headers: { "Retry-After": String(retryAfterSeconds) },
        }
    );
}

export async function POST(request: Request) {
    const clientIp = getClientIp(request);
    const limit = enforceRateLimit(`contact:create:${clientIp}`, 5, 10 * 60 * 1000);
    if (limit.limited) return rateLimited(limit.retryAfterSeconds || 600);

    try {
        const parsed = contactSubmissionSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid contact submission", details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        await dbConnect();
        const contact = await Contact.create({
            ...parsed.data,
            feeling: parsed.data.feeling || undefined,
            attachmentUrl: parsed.data.attachmentUrl || undefined,
            status: "new",
        });

        return NextResponse.json(
            {
                message: "Message sent successfully",
                contact: { _id: contact._id },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating contact:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const clientIp = getClientIp(request);
    const limit = enforceRateLimit(`contact:feeling:${clientIp}`, 10, 10 * 60 * 1000);
    if (limit.limited) return rateLimited(limit.retryAfterSeconds || 600);

    try {
        const parsed = feelingUpdateSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid feeling update", details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        await dbConnect();
        const updatedContact = await Contact.findByIdAndUpdate(
            parsed.data.id,
            { feeling: parsed.data.feeling },
            { new: false }
        );

        if (!updatedContact) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Feeling updated successfully" });
    } catch (error) {
        console.error("Error updating contact:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

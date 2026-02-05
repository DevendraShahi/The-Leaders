import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subscriber from "@/models/Subscriber";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const { email } = await req.json();

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json(
                { error: "Please provide a valid email address." },
                { status: 400 }
            );
        }

        // Check if already subscribed
        const existing = await Subscriber.findOne({ email });
        if (existing) {
            // If inactive, reactivate? Or just say strictly already subscribed.
            // Let's just say success or "Already subscribed".
            return NextResponse.json(
                { message: "You are already subscribed to our newsletter." },
                { status: 200 }
            );
        }

        await Subscriber.create({ email });

        return NextResponse.json(
            { message: "Successfully subscribed to the newsletter!" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Subscription error:", error);
        return NextResponse.json(
            { error: "Internal server error. Please try again later." },
            { status: 500 }
        );
    }
}

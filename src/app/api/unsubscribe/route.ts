import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { normalizeEmail, isValidEmail } from "@/lib/subscription-verification";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const body = await req.json();
        const { email } = body;

        const normalizedEmail = normalizeEmail(String(email || ""));

        if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
            return NextResponse.json(
                { error: "Please provide a valid email address." },
                { status: 400 }
            );
        }

        const subscriber = await Subscriber.findOne({ email: normalizedEmail });

        if (!subscriber) {
            return NextResponse.json(
                { message: "You have been unsubscribed. No action was needed." },
                { status: 200 }
            );
        }

        if (!subscriber.isActive) {
            return NextResponse.json(
                { message: "You are already unsubscribed." },
                { status: 200 }
            );
        }

        subscriber.isActive = false;
        await subscriber.save();

        return NextResponse.json(
            { message: "You have been successfully unsubscribed." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Unsubscribe error:", error);
        return NextResponse.json(
            { error: "Failed to process unsubscribe request. Please try again later." },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email || !isValidEmail(email)) {
        return NextResponse.json(
            { error: "Invalid or missing email parameter." },
            { status: 400 }
        );
    }

    try {
        await dbConnect();
        const subscriber = await Subscriber.findOne({ email: normalizeEmail(email) });

        if (!subscriber) {
            return NextResponse.json(
                { subscribed: false, message: "Email not found in our subscription list." },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { 
                subscribed: subscriber.isActive,
                verified: subscriber.isVerified,
                message: subscriber.isActive ? "Email is currently subscribed." : "Email is unsubscribed."
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Unsubscribe GET error:", error);
        return NextResponse.json(
            { error: "Failed to check subscription status." },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import {
    generateVerificationCode,
    getOtpExpiryDate,
    hashVerificationCode,
    isResendCoolingDown,
    isValidEmail,
    normalizeEmail,
    sendVerificationEmail,
    verificationConfig,
} from "@/lib/subscription-verification";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email } = await req.json();
        const normalizedEmail = normalizeEmail(String(email || ""));

        if (!isValidEmail(normalizedEmail)) {
            return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
        }

        const subscriber = await Subscriber.findOne({ email: normalizedEmail }).select("+verificationCodeHash");
        if (!subscriber) {
            return NextResponse.json({ error: "No pending subscription found for this email." }, { status: 404 });
        }

        if (subscriber.isVerified && subscriber.isActive) {
            return NextResponse.json({ message: "This email is already verified and subscribed." }, { status: 200 });
        }

        if (isResendCoolingDown(subscriber.verificationSentAt)) {
            return NextResponse.json(
                { error: "Please wait a minute before requesting another verification code." },
                { status: 429 }
            );
        }

        const code = generateVerificationCode();
        subscriber.verificationCodeHash = hashVerificationCode(normalizedEmail, code) as any;
        subscriber.verificationExpiresAt = getOtpExpiryDate();
        subscriber.verificationSentAt = new Date();
        subscriber.verificationAttempts = 0;
        await subscriber.save();

        await sendVerificationEmail(normalizedEmail, code);

        const response: Record<string, any> = { message: "A new verification code has been sent." };
        if (process.env.NODE_ENV !== "production") {
            response.debugCode = code;
            response.verification = verificationConfig();
        }
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Subscribe resend error:", error);
        const details = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            {
                error: "Failed to resend verification code.",
                ...(process.env.NODE_ENV !== "production" ? { details } : {}),
            },
            { status: 500 }
        );
    }
}

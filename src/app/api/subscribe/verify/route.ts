import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { hashVerificationCode, isValidEmail, normalizeEmail, verificationConfig } from "@/lib/subscription-verification";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, code } = await req.json();

        const normalizedEmail = normalizeEmail(String(email || ""));
        const normalizedCode = String(code || "").trim();

        if (!isValidEmail(normalizedEmail) || !normalizedCode) {
            return NextResponse.json({ error: "Invalid email or verification code." }, { status: 400 });
        }

        const subscriber = await Subscriber.findOne({ email: normalizedEmail }).select("+verificationCodeHash");
        if (!subscriber) {
            return NextResponse.json({ error: "Invalid email or verification code." }, { status: 400 });
        }

        if (subscriber.isVerified && subscriber.isActive) {
            return NextResponse.json({ message: "Email is already verified and subscribed." }, { status: 200 });
        }

        const { maxVerificationAttempts } = verificationConfig();
        if ((subscriber.verificationAttempts || 0) >= maxVerificationAttempts) {
            return NextResponse.json({ error: "Too many failed attempts. Please request a new code." }, { status: 429 });
        }

        if (!subscriber.verificationCodeHash || !subscriber.verificationExpiresAt) {
            return NextResponse.json({ error: "No active verification request. Please request a new code." }, { status: 400 });
        }

        if (new Date(subscriber.verificationExpiresAt).getTime() < Date.now()) {
            return NextResponse.json({ error: "Verification code expired. Please request a new code." }, { status: 400 });
        }

        const expectedHash = hashVerificationCode(normalizedEmail, normalizedCode);
        if (subscriber.verificationCodeHash !== expectedHash) {
            subscriber.verificationAttempts = (subscriber.verificationAttempts || 0) + 1;
            await subscriber.save();
            return NextResponse.json({ error: "Invalid email or verification code." }, { status: 400 });
        }

        subscriber.isVerified = true;
        subscriber.isActive = true;
        subscriber.verifiedAt = new Date();
        subscriber.verificationCodeHash = undefined as any;
        subscriber.verificationExpiresAt = undefined;
        subscriber.verificationSentAt = undefined;
        subscriber.verificationAttempts = 0;
        await subscriber.save();

        return NextResponse.json({ message: "Email verified. Subscription completed successfully." }, { status: 200 });
    } catch (error) {
        console.error("Subscribe verify error:", error);
        return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
    }
}

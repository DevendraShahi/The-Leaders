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

        if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
            return NextResponse.json(
                { error: "Please provide a valid email address." },
                { status: 400 }
            );
        }

        const existing = await Subscriber.findOne({ email: normalizedEmail }).select("+verificationCodeHash");

        if (existing?.isVerified && existing?.isActive) {
            return NextResponse.json(
                { message: "You are already subscribed to our newsletter." },
                { status: 200 }
            );
        }

        if (isResendCoolingDown(existing?.verificationSentAt)) {
            return NextResponse.json(
                { error: "Please wait a minute before requesting another verification code." },
                { status: 429 }
            );
        }

        const code = generateVerificationCode();
        const codeHash = hashVerificationCode(normalizedEmail, code);
        const expiresAt = getOtpExpiryDate();
        const now = new Date();

        if (existing) {
            existing.isActive = false;
            existing.isVerified = false;
            existing.verifiedAt = undefined;
            existing.verificationCodeHash = codeHash as any;
            existing.verificationExpiresAt = expiresAt;
            existing.verificationSentAt = now;
            existing.verificationAttempts = 0;
            await existing.save();
        } else {
            await Subscriber.create({
                email: normalizedEmail,
                isActive: false,
                isVerified: false,
                verificationCodeHash: codeHash,
                verificationExpiresAt: expiresAt,
                verificationSentAt: now,
                verificationAttempts: 0,
                subscribedAt: now,
            });
        }

        await sendVerificationEmail(normalizedEmail, code);

        const response: Record<string, any> = {
            message: "Verification code sent to your email. Please verify to complete subscription.",
        };
        if (process.env.NODE_ENV !== "production") {
            response.debugCode = code;
            response.verification = verificationConfig();
        }

        return NextResponse.json(
            response,
            { status: 200 }
        );
    } catch (error) {
        console.error("Subscription error:", error);
        const details = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            {
                error: "Failed to send verification email. Please try again later.",
                ...(process.env.NODE_ENV !== "production" ? { details } : {}),
            },
            { status: 500 }
        );
    }
}

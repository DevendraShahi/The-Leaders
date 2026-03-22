import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
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
        const clientIp = getClientIp(req);
        const ipRateLimit = enforceRateLimit(`subscribe-resend:ip:${clientIp}`, 10, 10 * 60 * 1000);
        if (ipRateLimit.limited) {
            return NextResponse.json(
                { error: "Too many resend attempts. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(ipRateLimit.retryAfterSeconds ?? 60),
                    },
                }
            );
        }

        const { email } = await req.json();
        const normalizedEmail = normalizeEmail(String(email || ""));

        if (!isValidEmail(normalizedEmail)) {
            return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
        }

        const emailRateLimit = enforceRateLimit(`subscribe-resend:email:${normalizedEmail}`, 6, 30 * 60 * 1000);
        if (emailRateLimit.limited) {
            return NextResponse.json(
                { error: "Too many resend attempts for this email. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(emailRateLimit.retryAfterSeconds ?? 60),
                    },
                }
            );
        }

        await dbConnect();

        const subscriber = await Subscriber.findOne({ email: normalizedEmail }).select("+verificationCodeHash");
        if (!subscriber) {
            return NextResponse.json(
                { message: "If a pending subscription exists, a new verification code has been sent." },
                { status: 200 }
            );
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

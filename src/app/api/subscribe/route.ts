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
        const ipRateLimit = enforceRateLimit(`subscribe:ip:${clientIp}`, 12, 10 * 60 * 1000);
        if (ipRateLimit.limited) {
            return NextResponse.json(
                { error: "Too many subscription requests. Please try again shortly." },
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

        if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
            return NextResponse.json(
                { error: "Please provide a valid email address." },
                { status: 400 }
            );
        }

        const emailRateLimit = enforceRateLimit(`subscribe:email:${normalizedEmail}`, 6, 30 * 60 * 1000);
        if (emailRateLimit.limited) {
            return NextResponse.json(
                { error: "Too many verification requests for this email. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(emailRateLimit.retryAfterSeconds ?? 60),
                    },
                }
            );
        }

        await dbConnect();

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

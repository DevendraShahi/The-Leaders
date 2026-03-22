import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import {
    hashVerificationCode,
    isValidEmail,
    isValidVerificationCode,
    normalizeEmail,
    sendWelcomeEmail,
    verificationConfig,
} from "@/lib/subscription-verification";

export async function POST(req: Request) {
    try {
        const clientIp = getClientIp(req);
        const ipRateLimit = enforceRateLimit(`subscribe-verify:ip:${clientIp}`, 20, 10 * 60 * 1000);
        if (ipRateLimit.limited) {
            return NextResponse.json(
                { error: "Too many verification attempts. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(ipRateLimit.retryAfterSeconds ?? 60),
                    },
                }
            );
        }

        const { email, code } = await req.json();

        const normalizedEmail = normalizeEmail(String(email || ""));
        const normalizedCode = String(code || "").trim();
        const emailRateLimit = enforceRateLimit(`subscribe-verify:email:${normalizedEmail}`, 12, 15 * 60 * 1000);
        if (emailRateLimit.limited) {
            return NextResponse.json(
                { error: "Too many verification attempts for this email. Please request a new code later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(emailRateLimit.retryAfterSeconds ?? 60),
                    },
                }
            );
        }

        if (!isValidEmail(normalizedEmail) || !isValidVerificationCode(normalizedCode)) {
            return NextResponse.json({ error: "Invalid email or verification code." }, { status: 400 });
        }

        await dbConnect();

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

        try {
            await sendWelcomeEmail(normalizedEmail);
        } catch (welcomeEmailError) {
            console.error("Welcome email send failed:", welcomeEmailError);
        }

        return NextResponse.json({ message: "Email verified. Subscription completed successfully." }, { status: 200 });
    } catch (error) {
        console.error("Subscribe verify error:", error);
        return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
    }
}

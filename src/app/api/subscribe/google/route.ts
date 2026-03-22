import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { normalizeEmail, sendWelcomeEmail } from "@/lib/subscription-verification";

type GoogleTokenInfoResponse = {
    aud?: string;
    email?: string;
    email_verified?: string;
    exp?: string;
    iss?: string;
    sub?: string;
};

function getAllowedGoogleClientIds(): string[] {
    const ids = [
        process.env.GOOGLE_CLIENT_ID,
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    ]
        .filter(Boolean)
        .flatMap((entry) => String(entry).split(","))
        .map((value) => value.trim())
        .filter(Boolean);

    return Array.from(new Set(ids));
}

async function verifyGoogleIdToken(credential: string): Promise<{ email: string }> {
    const allowedClientIds = getAllowedGoogleClientIds();
    if (allowedClientIds.length === 0) {
        throw new Error("Google Sign-In is not configured. Missing GOOGLE_CLIENT_ID.");
    }

    const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
        {
            method: "GET",
            cache: "no-store",
            headers: {
                Accept: "application/json",
            },
        }
    );

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Google token verification failed: ${details}`);
    }

    const tokenInfo = (await response.json()) as GoogleTokenInfoResponse;
    const issuer = tokenInfo.iss || "";
    const isValidIssuer = issuer === "accounts.google.com" || issuer === "https://accounts.google.com";
    const isVerifiedEmail = tokenInfo.email_verified === "true";
    const email = normalizeEmail(String(tokenInfo.email || ""));
    const audience = String(tokenInfo.aud || "");
    const exp = Number(tokenInfo.exp || "0");
    const isTokenExpired = Number.isFinite(exp) ? exp <= Math.floor(Date.now() / 1000) : true;
    const isAllowedAudience = allowedClientIds.includes(audience);

    if (!isValidIssuer || !isVerifiedEmail || !email || !isAllowedAudience || isTokenExpired) {
        throw new Error("Invalid Google credential.");
    }

    return { email };
}

export async function POST(req: Request) {
    try {
        const clientIp = getClientIp(req);
        const ipRateLimit = enforceRateLimit(`subscribe-google:ip:${clientIp}`, 15, 10 * 60 * 1000);
        if (ipRateLimit.limited) {
            return NextResponse.json(
                { error: "Too many Google sign-in attempts. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(ipRateLimit.retryAfterSeconds ?? 60),
                    },
                }
            );
        }

        const { credential } = await req.json();
        const idToken = String(credential || "").trim();
        if (!idToken) {
            return NextResponse.json({ error: "Missing Google credential." }, { status: 400 });
        }

        const { email } = await verifyGoogleIdToken(idToken);
        const emailRateLimit = enforceRateLimit(`subscribe-google:email:${email}`, 10, 30 * 60 * 1000);
        if (emailRateLimit.limited) {
            return NextResponse.json(
                { error: "Too many subscription attempts for this email. Please try later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(emailRateLimit.retryAfterSeconds ?? 60),
                    },
                }
            );
        }

        await dbConnect();

        const existing = await Subscriber.findOne({ email }).select("+verificationCodeHash");
        const now = new Date();

        if (existing) {
            if (!(existing.isVerified && existing.isActive)) {
                existing.isVerified = true;
                existing.isActive = true;
                existing.verifiedAt = now;
                existing.verificationCodeHash = undefined as any;
                existing.verificationExpiresAt = undefined;
                existing.verificationSentAt = undefined;
                existing.verificationAttempts = 0;
                await existing.save();
            }
        } else {
            await Subscriber.create({
                email,
                isActive: true,
                isVerified: true,
                verifiedAt: now,
                verificationAttempts: 0,
                subscribedAt: now,
            });
        }

        try {
            await sendWelcomeEmail(email);
        } catch (welcomeEmailError) {
            console.error("Google subscribe welcome email failed:", welcomeEmailError);
        }

        return NextResponse.json(
            { message: "Subscribed successfully with Google." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Google subscribe error:", error);
        const details = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            {
                error: "Google sign-in failed. Please try email verification instead.",
                ...(process.env.NODE_ENV !== "production" ? { details } : {}),
            },
            { status: 400 }
        );
    }
}

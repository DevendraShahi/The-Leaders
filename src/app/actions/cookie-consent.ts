"use server";

import { cookies } from "next/headers";

export async function setCookieConsent(consent: "accepted" | "declined") {
    const cookieStore = await cookies();

    // Set the cookie with a long expiry (1 year)
    cookieStore.set("cookie-consent", consent, {
        httpOnly: true, // Not accessible via client-side JS (optional, but good for security if we only need server access)
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year in seconds
    });
}

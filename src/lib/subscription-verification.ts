import { createHash } from "crypto";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 15;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const MAX_VERIFICATION_ATTEMPTS = 5;

function getVerificationSecret(): string {
    return process.env.SUBSCRIBE_VERIFICATION_SECRET || process.env.JWT_SECRET || "subscribe-verification-secret";
}

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
    return /^\S+@\S+\.\S+$/.test(email);
}

export function generateVerificationCode(): string {
    const value = Math.floor(Math.random() * 10 ** OTP_LENGTH);
    return String(value).padStart(OTP_LENGTH, "0");
}

export function hashVerificationCode(email: string, code: string): string {
    const secret = getVerificationSecret();
    return createHash("sha256").update(`${normalizeEmail(email)}:${code}:${secret}`).digest("hex");
}

export function getOtpExpiryDate(): Date {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_TTL_MINUTES);
    return expiresAt;
}

export function isResendCoolingDown(sentAt?: Date | null): boolean {
    if (!sentAt) return false;
    const elapsedMs = Date.now() - new Date(sentAt).getTime();
    return elapsedMs < OTP_RESEND_COOLDOWN_SECONDS * 1000;
}

export function verificationConfig() {
    return {
        otpLength: OTP_LENGTH,
        otpTtlMinutes: OTP_TTL_MINUTES,
        resendCooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
        maxVerificationAttempts: MAX_VERIFICATION_ATTEMPTS,
    };
}

async function sendViaGmailSmtp(email: string, code: string): Promise<boolean> {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT || "465");
    const smtpSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : smtpPort === 465;

    if (!smtpUser || !smtpPass) return false;

    const nodemailerModule = await (Function("return import('nodemailer')")() as Promise<any>);
    const nodemailer = nodemailerModule.default || nodemailerModule;

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    });

    const from = process.env.SMTP_FROM_EMAIL || smtpUser;

    const text = `Your The Leaders verification code is ${code}. This code expires in ${OTP_TTL_MINUTES} minutes.`;
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h2 style="margin:0 0 12px 0;">Verify your email</h2>
        <p style="margin:0 0 12px 0;">Use this verification code to complete your subscription:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:0 0 12px 0;">${code}</p>
        <p style="margin:0 0 8px 0;">This code expires in ${OTP_TTL_MINUTES} minutes.</p>
      </div>
    `;

    await transporter.sendMail({
        from,
        to: email,
        subject: "Verify your subscription email",
        text,
        html,
    });

    return true;
}

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
    const smtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
    if (smtpConfigured) {
        try {
            const sentViaSmtp = await sendViaGmailSmtp(email, code);
            if (sentViaSmtp) return;
        } catch (smtpError) {
            const message = smtpError instanceof Error ? smtpError.message : String(smtpError);
            throw new Error(`SMTP email send failed: ${message}`);
        }
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL || "The Leaders <onboarding@resend.dev>";

    if (!apiKey) {
        if (process.env.NODE_ENV !== "production") {
            console.warn(`[subscribe:dev-email-fallback] Verification code for ${email}: ${code}`);
            return;
        }
        throw new Error("Email service is not configured (missing RESEND_API_KEY).");
    }

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h2 style="margin:0 0 12px 0;">Verify your email</h2>
        <p style="margin:0 0 12px 0;">Use this verification code to complete your subscription:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:0 0 12px 0;">${code}</p>
        <p style="margin:0 0 8px 0;">This code expires in ${OTP_TTL_MINUTES} minutes.</p>
        <p style="margin:0;color:#6b7280;">If you didn't request this, you can ignore this email.</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from,
            to: [email],
            subject: "Verify your subscription email",
            html,
        }),
    });

    if (!res.ok) {
        const details = await res.text();
        throw new Error(`Failed to send verification email: ${details}`);
    }
}

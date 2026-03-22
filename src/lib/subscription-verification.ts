import { createHash } from "crypto";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 15;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const MAX_VERIFICATION_ATTEMPTS = 5;
const DEV_VERIFICATION_SECRET = "dev-subscribe-verification-secret";
const BRAND_NAME = "The LeadersNP";
const DEFAULT_HOSTINGER_SMTP_HOST = "smtp.hostinger.com";
const DEFAULT_HOSTINGER_SMTP_PORT = 465;
let hostingerApiOnlyWarningShown = false;

function getVerificationSecret(): string {
    const configuredSecret = process.env.SUBSCRIBE_VERIFICATION_SECRET;
    if (configuredSecret) return configuredSecret;

    if (process.env.NODE_ENV === "production") {
        throw new Error("Missing SUBSCRIBE_VERIFICATION_SECRET in production environment.");
    }

    return DEV_VERIFICATION_SECRET;
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

export function isValidVerificationCode(code: string): boolean {
    return new RegExp(`^\\d{${OTP_LENGTH}}$`).test(code.trim());
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

type EmailPayload = {
    to: string;
    subject: string;
    text: string;
    html: string;
};

type EmailProviderMode = "auto" | "resend" | "smtp";

function getEmailProviderMode(): EmailProviderMode {
    const raw = (process.env.EMAIL_PROVIDER || "auto").trim().toLowerCase();
    if (raw === "resend" || raw === "smtp" || raw === "auto") {
        return raw;
    }
    return "auto";
}

function getSmtpConfig() {
    const smtpUser = process.env.SMTP_USER || process.env.HOSTINGER_EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.HOSTINGER_EMAIL_PASSWORD;
    const smtpHost = process.env.SMTP_HOST || process.env.HOSTINGER_SMTP_HOST || DEFAULT_HOSTINGER_SMTP_HOST;
    const smtpPort = Number(
        process.env.SMTP_PORT || process.env.HOSTINGER_SMTP_PORT || String(DEFAULT_HOSTINGER_SMTP_PORT)
    );
    const smtpSecure = process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === "true"
        : smtpPort === 465;
    const senderName = process.env.EMAIL_FROM_NAME || BRAND_NAME;
    const smtpFrom =
        process.env.SMTP_FROM_EMAIL ||
        process.env.HOSTINGER_EMAIL_FROM ||
        (smtpUser ? `${senderName} <${smtpUser}>` : undefined);

    return {
        smtpUser,
        smtpPass,
        smtpHost,
        smtpPort,
        smtpSecure,
        smtpFrom,
    };
}

function formatFromAddress(rawFrom: string | undefined, fallbackEmail?: string): string {
    if (rawFrom && rawFrom.includes("<")) return rawFrom;
    if (rawFrom && /^\S+@\S+\.\S+$/.test(rawFrom)) {
        return `${BRAND_NAME} <${rawFrom}>`;
    }
    if (fallbackEmail) {
        return `${BRAND_NAME} <${fallbackEmail}>`;
    }
    return BRAND_NAME;
}

function buildEmailHtmlLayout(input: {
    heading: string;
    intro: string;
    contentHtml: string;
    outro?: string;
    userEmail?: string;
}): string {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://the-leadersnp.com";
    const supportEmail = process.env.SUPPORT_EMAIL || "hello@the-leadersnp.com";
    const unsubscribeUrl = input.userEmail 
        ? `${siteUrl}/unsubscribe?email=${encodeURIComponent(input.userEmail)}`
        : `${siteUrl}/unsubscribe`;
    const year = new Date().getFullYear();

    return `
      <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e7eb;">
                <tr>
                  <td style="padding:24px 28px;border-bottom:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#6b7280;">${BRAND_NAME}</p>
                    <h1 style="margin:10px 0 0 0;font-size:24px;line-height:1.3;color:#111827;">${input.heading}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:22px 28px 10px 28px;">
                    <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#1f2937;">${input.intro}</p>
                    ${input.contentHtml}
                    ${input.outro ? `<p style="margin:20px 0 0 0;font-size:14px;line-height:1.7;color:#374151;">${input.outro}</p>` : ""}
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 28px;border-top:1px solid #e5e7eb;background:#fafafa;">
                    <p style="margin:0 0 4px 0;font-size:12px;color:#6b7280;">
                      <a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a> from this newsletter
                    </p>
                    <p style="margin:0 0 6px 0;font-size:12px;color:#6b7280;">
                      Need help? Contact us at <a href="mailto:${supportEmail}" style="color:#111827;">${supportEmail}</a>
                    </p>
                    <p style="margin:0 0 6px 0;font-size:12px;color:#6b7280;">
                      Visit: <a href="${siteUrl}" style="color:#111827;">${siteUrl}</a>
                    </p>
                    <p style="margin:0;font-size:11px;color:#9ca3af;">&copy; ${year} ${BRAND_NAME}. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;
}

function maybeWarnHostingerApiKeyWithoutMailbox(smtpUser?: string, smtpPass?: string) {
    if (hostingerApiOnlyWarningShown) return;
    if (!process.env.HOSTINGER_API_KEY) return;
    if (smtpUser && smtpPass) return;

    console.warn(
        "HOSTINGER_API_KEY is set, but subscribe email verification needs mailbox SMTP credentials. " +
        "Set SMTP_USER/SMTP_PASS (or HOSTINGER_EMAIL_USER/HOSTINGER_EMAIL_PASSWORD)."
    );
    hostingerApiOnlyWarningShown = true;
}

async function sendViaSmtp(payload: EmailPayload): Promise<boolean> {
    const {
        smtpUser,
        smtpPass,
        smtpHost,
        smtpPort,
        smtpSecure,
        smtpFrom,
    } = getSmtpConfig();

    if (!smtpUser || !smtpPass) {
        maybeWarnHostingerApiKeyWithoutMailbox(smtpUser, smtpPass);
        return false;
    }

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

    await transporter.sendMail({
        from: smtpFrom || smtpUser,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
    });

    return true;
}

async function sendViaResend(payload: EmailPayload): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return false;

    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: formatFromAddress(process.env.RESEND_FROM_EMAIL, "onboarding@resend.dev"),
            to: [payload.to],
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
        }),
    });

    if (!res.ok) {
        const details = await res.text();
        throw new Error(`Failed to send email: ${details}`);
    }

    return true;
}

async function sendTransactionalEmail(
    payload: EmailPayload,
    options?: { devFallbackLog?: string }
): Promise<void> {
    const providerMode = getEmailProviderMode();
    const tryResendFirst = providerMode === "resend" || (providerMode === "auto" && Boolean(process.env.RESEND_API_KEY));
    let smtpError: string | null = null;
    let resendError: string | null = null;

    const tryResend = async () => {
        try {
            const sentViaResend = await sendViaResend(payload);
            if (sentViaResend) return true;
        } catch (error) {
            resendError = error instanceof Error ? error.message : String(error);
        }
        return false;
    };

    const trySmtp = async () => {
        try {
            const sentViaSmtp = await sendViaSmtp(payload);
            if (sentViaSmtp) return true;
        } catch (error) {
            smtpError = error instanceof Error ? error.message : String(error);
        }
        return false;
    };

    if (tryResendFirst) {
        if (await tryResend()) return;
        if (providerMode !== "resend" && await trySmtp()) return;
    } else {
        if (await trySmtp()) return;
        if (providerMode !== "smtp" && await tryResend()) return;
    }

    // If the operator explicitly selected a provider and it failed/was missing, return a clear error.
    if (providerMode === "resend") {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("EMAIL_PROVIDER=resend but RESEND_API_KEY is missing.");
        }
        throw new Error(`Resend email send failed: ${resendError || "unknown error"}`);
    }
    if (providerMode === "smtp") {
        throw new Error(`SMTP email send failed: ${smtpError || "SMTP credentials missing or provider unavailable."}`);
    }

    if (process.env.NODE_ENV !== "production") {
        if (options?.devFallbackLog) {
            console.warn(options.devFallbackLog);
        }
        return;
    }

    if (smtpError) {
        throw new Error(`SMTP email send failed: ${smtpError}`);
    }
    if (resendError) {
        throw new Error(`Resend email send failed: ${resendError}`);
    }

    throw new Error(
        "Email service is not configured. Set RESEND_API_KEY/RESEND_FROM_EMAIL or SMTP_USER/SMTP_PASS."
    );
}

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://the-leadersnp.com";
    const codeBlockHtml = `
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:12px 0 16px 0;">
        <tr>
          <td style="padding:14px 18px;border:1px solid #d1d5db;background:#f9fafb;">
            <p style="margin:0;font-size:30px;font-weight:700;letter-spacing:7px;color:#111827;">${code}</p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 14px 0;font-size:14px;line-height:1.7;color:#374151;">
        This verification code will expire in <strong>${OTP_TTL_MINUTES} minutes</strong>.
      </p>
      <p style="margin:0;font-size:13px;line-height:1.7;color:#6b7280;">
        If you did not request this, please ignore this email.
      </p>
    `;

    const payload: EmailPayload = {
        to: email,
        subject: `${BRAND_NAME} | Verify your email`,
        text:
            `${BRAND_NAME}\n` +
            `Verification code: ${code}\n` +
            `This code expires in ${OTP_TTL_MINUTES} minutes.\n` +
            `If you did not request this email, you can ignore it.\n` +
            `${siteUrl}`,
        html: buildEmailHtmlLayout({
            heading: "Verify your email address",
            intro: "Thanks for subscribing. Use the verification code below to complete your subscription.",
            contentHtml: codeBlockHtml,
            userEmail: email,
        }),
    };

    await sendTransactionalEmail(payload, {
        devFallbackLog: `[subscribe:dev-email-fallback] Verification code for ${email}: ${code}`,
    });
}

export async function sendWelcomeEmail(email: string): Promise<void> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://the-leadersnp.com";
    const welcomeHtml = `
      <p style="margin:0 0 14px 0;font-size:14px;line-height:1.7;color:#374151;">
        Your email has been verified successfully and your subscription is now active.
      </p>
      <p style="margin:0 0 14px 0;font-size:14px;line-height:1.7;color:#374151;">
        You will now receive verified updates, election intelligence, and analysis from ${BRAND_NAME}.
      </p>
      <p style="margin:0;font-size:13px;line-height:1.7;color:#6b7280;">
        Explore latest coverage: <a href="${siteUrl}" style="color:#111827;">${siteUrl}</a>
      </p>
    `;

    const payload: EmailPayload = {
        to: email,
        subject: `${BRAND_NAME} | Subscription confirmed`,
        text:
            `Welcome to ${BRAND_NAME}.\n` +
            `Your email has been verified and your subscription is now active.\n` +
            `You will receive verified political updates and analysis.\n` +
            `${siteUrl}`,
        html: buildEmailHtmlLayout({
            heading: "Welcome to The LeadersNP",
            intro: "Your subscription is confirmed.",
            contentHtml: welcomeHtml,
            outro: "If this was not you, please contact support immediately.",
            userEmail: email,
        }),
    };

    await sendTransactionalEmail(payload);
}

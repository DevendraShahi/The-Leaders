import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import { verifyPassword } from '@/lib/auth';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';
import { issueMobileSession, mobileAuthHeaders, mobileAuthResponse } from '@/lib/mobile-auth';

const credentials = z.object({ email: z.string().trim().email().max(254).transform(value => value.toLowerCase()), password: z.string().min(1).max(256) }).strict();
export async function POST(request: Request) {
    const limited = (retryAfter: number) => mobileAuthResponse(request, { error: 'Too many login attempts. Please try again later.' }, 429, { 'Retry-After': String(retryAfter) });
    const ip = enforceRateLimit(`mobile-login:ip:${getClientIp(request)}`, 12, 15 * 60 * 1000);
    if (ip.limited) return limited(ip.retryAfterSeconds ?? 900);
    try {
        const parsed = credentials.safeParse(await request.json());
        if (!parsed.success) return mobileAuthResponse(request, { error: 'Enter a valid email address and password.' }, 400);
        const { email, password } = parsed.data;
        const account = enforceRateLimit(`mobile-login:account:${email}`, 8, 15 * 60 * 1000);
        if (account.limited) return limited(account.retryAfterSeconds ?? 900);
        await dbConnect();
        const admin = await Admin.findOne({ email }).select('+passwordHash');
        if (!admin || !await verifyPassword(password, admin.passwordHash)) return mobileAuthResponse(request, { error: 'Invalid email or password.' }, 401);
        if (!admin.isActive) return mobileAuthResponse(request, { error: 'This admin account is disabled. Contact your newsroom administrator.' }, 403);
        const session = issueMobileSession(String(admin._id), admin.passwordHash);
        admin.lastLogin = new Date();
        await admin.save();
        return mobileAuthResponse(request, session);
    } catch (error) {
        if (error instanceof SyntaxError) return mobileAuthResponse(request, { error: 'Invalid login request.' }, 400);
        return mobileAuthResponse(request, { error: 'The login service is unavailable. Please try again.' }, 503);
    }
}
export function OPTIONS(request: Request) {
    return new NextResponse(null, { status: 204, headers: mobileAuthHeaders(request) });
}

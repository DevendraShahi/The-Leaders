import { createHmac, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import { getJwtSecret } from '@/lib/auth-config';

const issuer = 'the-leaders-mobile';
const audience = 'the-leaders-mobile-account';
export const mobileSessionLifetime = 12 * 60 * 60;
const sessionSchema = z.object({ sub: z.string().regex(/^[a-f\d]{24}$/i), jti: z.string().uuid(), credential: z.string(), exp: z.number() });

function credentialVersion(passwordHash: string) {
    return createHmac('sha256', getJwtSecret()).update(passwordHash).digest('hex');
}
export function issueMobileSession(adminId: string, passwordHash: string) {
    const sessionId = randomUUID();
    const token = jwt.sign({ credential: credentialVersion(passwordHash) }, getJwtSecret(), {
        algorithm: 'HS256', issuer, audience, subject: adminId, jwtid: sessionId, expiresIn: mobileSessionLifetime,
    });
    return { token, sessionId, expiresAt: Date.now() + mobileSessionLifetime * 1000 };
}

export async function getMobileAdmin(request: Request) {
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) return null;
    let session;
    try {
        session = sessionSchema.parse(jwt.verify(authorization.slice(7), getJwtSecret(), { algorithms: ['HS256'], issuer, audience }));
    } catch { return null; }
    await dbConnect();
    const admin = await Admin.findById(session.sub).select('+passwordHash');
    if (!admin?.isActive || credentialVersion(admin.passwordHash) !== session.credential) return null;
    return admin;
}

export function mobileAuthHeaders(request: Request) {
    const origin = request.headers.get('origin');
    const headers: Record<string, string> = { 'Cache-Control': 'private, no-store', Vary: 'Origin, Authorization' };
    const local = process.env.NODE_ENV !== 'production' && (origin === 'http://localhost:8081' || origin === 'http://127.0.0.1:8081');
    if (origin && (origin === process.env.MOBILE_WEB_ORIGIN || local)) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type';
        headers['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, OPTIONS';
    }
    return headers;
}
export function mobileAuthResponse(request: Request, body: unknown, status = 200, extra: Record<string, string> = {}) {
    return NextResponse.json(body, { status, headers: { ...mobileAuthHeaders(request), ...extra } });
}

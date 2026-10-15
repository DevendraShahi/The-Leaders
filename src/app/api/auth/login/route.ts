import { NextResponse } from 'next/server';
import { POST as passwordLogin } from '@/app/api/v1/auth/login/route';
import { websiteSessionCookie } from '@/lib/website-auth';
export async function POST(request: Request) {
    if (request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({ error: 'Same-origin login required' }, { status: 403 });
    const result = await passwordLogin(request);
    if (!result.ok) return result;
    const session = await result.json();
    const response = NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'private, no-store' } });
    response.cookies.set(websiteSessionCookie, session.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 12 * 60 * 60 });
    return response;
}

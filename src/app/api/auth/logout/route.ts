import { NextResponse } from 'next/server';
import { websiteSessionCookie } from '@/lib/website-auth';
export async function POST(request: Request) {
    if (request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({ error: 'Same-origin logout required' }, { status: 403 });
    const response = NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'private, no-store' } });
    response.cookies.set(websiteSessionCookie, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
    return response;
}

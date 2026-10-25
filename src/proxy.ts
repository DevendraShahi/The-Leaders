import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { isClerkConfigured } from '@/lib/clerk-config';

const clerk = clerkMiddleware();

export default function proxy(request: NextRequest, event: NextFetchEvent) {
    // These endpoints have their own credential checks and never read Clerk auth.
    const passwordEndpoint = ['/api/auth/login', '/api/auth/logout'].includes(request.nextUrl.pathname.replace(/\/$/, ''));
    const nativeBearer = request.nextUrl.pathname.startsWith('/api/') && request.headers.has('authorization');
    if (!isClerkConfigured() || passwordEndpoint || nativeBearer) return NextResponse.next();
    return clerk(request, event);
}

// Public news pages and native /api/v1 clients do not need Clerk middleware.
export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*', '/api/auth/:path*'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge } from './src/lib/auth-edge';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for login page and public routes
    if (pathname === '/admin/login' || !pathname.startsWith('/admin')) {
        return NextResponse.next();
    }

    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
        // Redirect to login if no token
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Verify token (edge-compatible)
    const payload = await verifyTokenEdge(token);

    if (!payload) {
        // Invalid token - redirect to login
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('auth-token');
        return response;
    }

    // Role-based route protection
    const roleRoutes: Record<string, string[]> = {
        '/admin/users': ['superadmin'],
        '/admin/settings': ['superadmin', 'cto'],
        '/admin/content': ['superadmin', 'editorial'],
        '/admin/articles': ['superadmin', 'editorial'],
        '/admin/analytics': ['superadmin', 'cmo', 'editorial'],
    };

    // Check if route requires specific role
    for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
        if (pathname.startsWith(route)) {
            if (!allowedRoles.includes(payload.role)) {
                // Redirect to main dashboard if unauthorized for this specific route
                return NextResponse.redirect(new URL('/admin', request.url));
            }
        }
    }

    // Add user info to headers for downstream use (optional)
    const response = NextResponse.next();
    response.headers.set('x-admin-role', payload.role);
    response.headers.set('x-admin-id', payload.userId);

    return response;
}

export const config = {
    matcher: ['/admin/:path*'],
};

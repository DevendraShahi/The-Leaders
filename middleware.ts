import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for login page and public routes
  if (pathname === '/admin/login' || !pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Simple token check without external dependencies
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // For now, just pass through if token exists
  // Full JWT verification will be done server-side
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

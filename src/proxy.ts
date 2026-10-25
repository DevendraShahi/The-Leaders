import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

// Public news pages and native /api/v1 clients do not need Clerk middleware.
export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*', '/api/auth/:path*'],
};

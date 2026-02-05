import { withAuth } from '@/middleware/auth-middleware';
import { NextResponse } from 'next/server';

/**
 * GET /api/auth/debug
 * Debug endpoint to check current user's role and permissions
 */
export const GET = withAuth(async (request, { admin }) => {
    return NextResponse.json({
        success: true,
        data: {
            id: admin._id,
            email: admin.email,
            username: admin.username,
            role: admin.role,
            permissions: admin.permissions,
            isActive: admin.isActive,
            message: admin.role === 'superadmin'
                ? '✅ You have SuperAdmin access'
                : `⚠️ Your role is "${admin.role}" - you need "superadmin" to manage users`
        }
    });
});

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { IAdmin } from '@/models/Admin';
import { hasPermission } from '@/lib/rbac';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import AuditLog from '@/models/AuditLog';

/**
 * Higher-order function to protect API routes with authentication
 * Verifies JWT from cookies and attaches admin data to context
 */
export function withAuth(
    handler: (request: NextRequest, context: { admin: IAdmin; params?: any }) => Promise<NextResponse>
) {
    return async (request: NextRequest, { params }: { params?: any } = {}) => {
        try {
            const resolvedParams = params && typeof params?.then === 'function'
                ? await params
                : params;
            // Extract token from cookie
            const token = request.cookies.get('auth-token')?.value;

            if (!token) {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }

            // Verify token
            const payload = verifyToken(token);
            if (!payload) {
                return NextResponse.json(
                    { error: 'Invalid or expired token' },
                    { status: 401 }
                );
            }

            // Fetch full admin data from database
            await dbConnect();
            const admin = await Admin.findById(payload.userId).lean();

            if (!admin || !admin.isActive) {
                return NextResponse.json(
                    { error: 'Admin account not found or inactive' },
                    { status: 401 }
                );
            }

            // Pass admin to handler
            return handler(request, { admin: admin as IAdmin, params: resolvedParams });
        } catch (error) {
            console.error('Auth middleware error:', error);
            return NextResponse.json(
                { error: 'Authentication failed' },
                { status: 500 }
            );
        }
    };
}

/**
 * Middleware to require specific roles
 */
export function requireRole(allowedRoles: IAdmin['role'][]) {
    return function (
        handler: (request: NextRequest, context: { admin: IAdmin; params?: any }) => Promise<NextResponse>
    ) {
        return withAuth(async (request, context) => {
            const { admin } = context;

            if (!allowedRoles.includes(admin.role)) {
                return NextResponse.json(
                    { error: 'Insufficient permissions for this resource' },
                    { status: 403 }
                );
            }

            return handler(request, context);
        });
    };
}

/**
 * Middleware to require specific permission
 */
export function requirePermission(resource: keyof IAdmin['permissions'], action: string) {
    return function (
        handler: (request: NextRequest, context: { admin: IAdmin; params?: any }) => Promise<NextResponse>
    ) {
        return withAuth(async (request, context) => {
            const { admin } = context;

            if (!hasPermission(admin, resource, action)) {
                return NextResponse.json(
                    { error: `You don't have permission to ${action} ${resource}` },
                    { status: 403 }
                );
            }

            return handler(request, context);
        });
    };
}

/**
 * Middleware to enforce isolation for non-superadmin
 */
export function enforceIsolation() {
    return function (
        handler: (request: NextRequest, context: { admin: IAdmin; params?: any }) => Promise<NextResponse>
    ) {
        return withAuth(async (request, context) => {
            const { admin } = context;

            // Only superadmin can access multi-admin endpoints
            if (admin.role !== 'superadmin') {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }

            return handler(request, context);
        });
    };
}

/**
 * Log admin action to audit log
 */
export async function logAdminAction(
    admin: IAdmin,
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, any>,
    request?: NextRequest
) {
    try {
        await dbConnect();

        await AuditLog.create({
            adminId: admin._id,
            adminEmail: admin.email,
            adminRole: admin.role,
            action,
            resource,
            resourceId,
            details,
            ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
            userAgent: request?.headers.get('user-agent') || 'unknown',
            timestamp: new Date(),
        });
    } catch (error) {
        console.error('Failed to log admin action:', error);
        // Don't fail the request if logging fails
    }
}

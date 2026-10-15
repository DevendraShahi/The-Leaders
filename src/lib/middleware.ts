import { NextRequest, NextResponse } from 'next/server';
import { type JWTPayload } from './auth';
import { type IPermissions } from '@/models/Admin';
import { getWebsiteAdmin } from '@/lib/website-auth';

export interface AuthenticatedRequest extends NextRequest {
    user?: JWTPayload;
}

/**
 * Middleware to authenticate API requests
 * Verifies JWT token from Authorization header
 */
export async function authenticateRequest(request: NextRequest): Promise<{
    authenticated: boolean;
    user?: JWTPayload;
    error?: string;
    status?: 401 | 403 | 503;
}> {
    try {
        const admin = await getWebsiteAdmin(request);
        if (!admin) return { authenticated: false, error: 'Sign in is required', status: 401 };
        return {
            authenticated: true,
            user: {
                userId: String(admin._id),
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions,
            },
        };
    } catch (error) {
        console.error('Failed to validate admin session:', error);
        return {
            authenticated: false,
            error: 'Authentication service unavailable',
            status: 503,
        };
    }
}

/**
 * Higher-order function to protect API routes
 * Wraps route handlers with authentication
 */
export function withAuth(
    handler: (request: NextRequest, context: { user: JWTPayload; params: any }) => Promise<NextResponse>
) {
    return async (request: NextRequest, context: any = {}) => {
        const { params } = context;
        const resolvedParams = params && typeof params?.then === 'function'
            ? await params
            : params;
        const authResult = await authenticateRequest(request);

        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json(
                { error: authResult.error || 'Unauthorized' },
                { status: authResult.status || 401, headers: { 'Cache-Control': 'private, no-store' } }
            );
        }

        const response = await handler(request, { user: authResult.user, params: resolvedParams });
        response.headers.set('Cache-Control', 'private, no-store');
        return response;
    };
}

export function withPermission(
    resource: keyof IPermissions,
    action: string,
    handler: (request: NextRequest, context: { user: JWTPayload; params: any }) => Promise<NextResponse>
) {
    return withAuth(async (request, context) => {
        const permissions = context.user.permissions as IPermissions | undefined;
        const allowed = context.user.role === 'superadmin' || Boolean(
            permissions?.[resource] &&
            (permissions[resource] as Record<string, boolean>)[action]
        );

        if (!allowed) {
            return apiError('Insufficient permissions for this resource', 403);
        }

        return handler(request, context);
    });
}

export function withPageAccess(
    page: keyof IPermissions['pageAccess'],
    handler: (request: NextRequest, context: { user: JWTPayload; params: any }) => Promise<NextResponse>
) {
    return withAuth(async (request, context) => {
        const permissions = context.user.permissions as IPermissions | undefined;
        const allowed = context.user.role === 'superadmin' || permissions?.pageAccess?.[page] === true;

        if (!allowed) {
            return apiError('Insufficient permissions for this resource', 403);
        }

        return handler(request, context);
    });
}

/**
 * Create a standardized API response
 */
export function apiResponse<T>(
    data: T,
    status: number = 200,
    message?: string
): NextResponse {
    return NextResponse.json(
        {
            success: status >= 200 && status < 300,
            message,
            data,
        },
        { status }
    );
}

/**
 * Create a standardized API error response
 */
export function apiError(
    error: string,
    status: number = 400,
    details?: any
): NextResponse {
    return NextResponse.json(
        {
            success: false,
            error,
            details,
        },
        { status }
    );
}

/**
 * Parse JSON body from request with error handling
 */
export async function parseRequestBody<T>(request: NextRequest): Promise<{
    success: boolean;
    data?: T;
    error?: string;
}> {
    try {
        const data = await request.json();
        return { success: true, data };
    } catch {
        return {
            success: false,
            error: 'Invalid JSON in request body',
        };
    }
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields<T extends Record<string, any>>(
    data: T,
    requiredFields: (keyof T)[]
): { valid: boolean; missingFields?: string[] } {
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
        return {
            valid: false,
            missingFields: missingFields as string[],
        };
    }

    return { valid: true };
}

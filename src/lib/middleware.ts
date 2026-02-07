import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from './auth';

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
}> {
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
        return {
            authenticated: false,
            error: 'No authentication token provided',
        };
    }

    const user = verifyToken(token);

    if (!user) {
        return {
            authenticated: false,
            error: 'Invalid or expired token',
        };
    }

    return {
        authenticated: true,
        user,
    };
}

/**
 * Higher-order function to protect API routes
 * Wraps route handlers with authentication
 */
export function withAuth(
    handler: (request: NextRequest, context: { user: JWTPayload; params: any }) => Promise<NextResponse>
) {
    return async (request: NextRequest, { params }: { params?: any } = {}) => {
        const authResult = await authenticateRequest(request);

        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json(
                { error: authResult.error || 'Unauthorized' },
                { status: 401 }
            );
        }

        return handler(request, { user: authResult.user, params });
    };
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

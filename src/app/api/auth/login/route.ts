import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import ActivityLog from '@/models/ActivityLog';
import { verifyPassword, generateToken } from '@/lib/auth';
import { apiResponse, apiError, parseRequestBody } from '@/lib/middleware';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';

const loginSchema = z.object({
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    password: z.string().min(1).max(256),
}).strict();

function tooManyAttempts(retryAfterSeconds: number) {
    return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    );
}

export async function POST(request: NextRequest) {
    try {
        const clientIp = getClientIp(request);
        const ipLimit = enforceRateLimit(`admin-login:ip:${clientIp}`, 12, 15 * 60 * 1000);
        if (ipLimit.limited) return tooManyAttempts(ipLimit.retryAfterSeconds || 900);

        await dbConnect();

        // 1. Parse request body
        const bodyParse = await parseRequestBody(request);
        if (!bodyParse.success || !bodyParse.data) {
            return apiError(bodyParse.error || 'Invalid request', 400);
        }

        const parsed = loginSchema.safeParse(bodyParse.data);
        if (!parsed.success) {
            return apiError('Invalid email or password', 400);
        }
        const { email, password } = parsed.data;

        const accountLimit = enforceRateLimit(`admin-login:account:${email}`, 8, 15 * 60 * 1000);
        if (accountLimit.limited) return tooManyAttempts(accountLimit.retryAfterSeconds || 900);

        // 3. Find admin
        const admin = await Admin.findOne({ email }).select('+passwordHash');
        if (!admin) {
            // Return generic error for security
            return apiError('Invalid credentials', 401);
        }

        // 4. Check if active
        if (!admin.isActive) {
            return apiError('Account is disabled', 403);
        }

        // 5. Verify password
        const isValid = await verifyPassword(password, admin.passwordHash);
        if (!isValid) {
            return apiError('Invalid credentials', 401);
        }

        // 5.5 Auto-migrate admin if permissions field is missing
        if (!admin.permissions) {
            const { getDefaultPermissions } = await import('@/lib/rbac');
            // Map old 'editor' role to 'editorial'
            if (admin.role === 'editor' as any) {
                admin.role = 'editorial';
            }
            admin.permissions = getDefaultPermissions(admin.role);
            await admin.save();
            console.log(`✅ Auto-migrated admin: ${admin.email} (${admin.role})`);
        }
        const { ensurePermissionShape } = await import('@/lib/rbac');
        const normalizedPermissions = ensurePermissionShape(admin.role, admin.permissions);
        admin.permissions = normalizedPermissions;
        await admin.save();

        // 6. Generate token
        const token = generateToken({
            userId: admin._id.toString(),
            email: admin.email,
            role: admin.role,
            permissions: normalizedPermissions
        });

        // 7. Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // 8. Log activity
        await ActivityLog.create({
            adminId: admin._id,
            action: 'login',
            entityType: 'Auth',
            description: 'Admin logged in',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        // 9. Create response with cookie
        const response = apiResponse({
            message: 'Login successful',
            token,
            user: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                avatar: admin.avatar,
                permissions: normalizedPermissions
            }
        });

        // Set httpOnly cookie for middleware authentication
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 86400, // 24 hours
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return apiError('Internal server error', 500);
    }
}

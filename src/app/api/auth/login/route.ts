import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import ActivityLog from '@/models/ActivityLog';
import { verifyPassword, generateToken } from '@/lib/auth';
import { apiResponse, apiError, parseRequestBody } from '@/lib/middleware';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // 1. Parse request body
        const bodyParse = await parseRequestBody(request);
        if (!bodyParse.success || !bodyParse.data) {
            return apiError(bodyParse.error || 'Invalid request', 400);
        }

        const { email, password } = bodyParse.data as any;

        // 2. Validate fields
        if (!email || !password) {
            return apiError('Email and password are required', 400);
        }

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

        // 6. Generate token
        const token = generateToken({
            userId: admin._id.toString(),
            email: admin.email,
            role: admin.role
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

        // 9. Return success
        return apiResponse({
            message: 'Login successful',
            token,
            user: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                avatar: admin.avatar
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return apiError('Internal server error', 500);
    }
}

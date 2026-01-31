import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import ActivityLog from '@/models/ActivityLog';
import { hashPassword, generateToken } from '@/lib/auth';
import { apiResponse, apiError, parseRequestBody, validateRequiredFields } from '@/lib/middleware';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // 1. Check if an admin already exists (restrict to single admin if preferred, or just check setup token)
        // Since user requested SINGLE admin, we should check if ANY admin exists.
        const adminCount = await Admin.countDocuments();

        if (adminCount > 0) {
            // Check for setup token if adding more admins or recovery
            const { setupToken } = await request.json().catch(() => ({}));
            if (setupToken !== process.env.ADMIN_SETUP_TOKEN) {
                return apiError('Admin account already exists. Setup disabled.', 403);
            }
        }

        // 2. Parse request body
        const bodyParse = await parseRequestBody(request);
        if (!bodyParse.success || !bodyParse.data) {
            return apiError(bodyParse.error || 'Invalid request', 400);
        }

        const { email, password, name, setupToken } = bodyParse.data as any;

        // 3. Verify setup token
        if (process.env.ADMIN_SETUP_TOKEN && setupToken !== process.env.ADMIN_SETUP_TOKEN) {
            return apiError('Invalid setup token', 403);
        }

        // 4. Validate fields
        if (!email || !password) {
            return apiError('Email and password are required', 400);
        }

        // 5. Check if email already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return apiError('Admin with this email already exists', 409);
        }

        // 6. Create new admin
        const hashedPassword = await hashPassword(password);
        const username = email.split('@')[0]; // Default username from email

        const newAdmin = await Admin.create({
            email,
            passwordHash: hashedPassword,
            username,
            name: name || 'Admin',
            role: 'superadmin',
            isActive: true
        });

        // 7. Generate token
        const token = generateToken({
            userId: newAdmin._id.toString(),
            email: newAdmin.email,
            role: newAdmin.role
        });

        // 8. Log activity (if not the very first admin, unlikely recursively but good practice)
        // We can't use the middleware user here since we are creating one. 
        // We'll trust the setup token.

        await ActivityLog.create({
            adminId: newAdmin._id,
            action: 'create',
            entityType: 'Admin',
            entityId: newAdmin._id.toString(),
            description: 'Initial admin account setup',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        // 9. Return success
        return apiResponse({
            message: 'Admin account created successfully',
            token,
            user: {
                id: newAdmin._id,
                email: newAdmin.email,
                name: newAdmin.name,
                role: newAdmin.role
            }
        }, 201);

    } catch (error) {
        console.error('Admin setup error:', error);
        return apiError('Internal server error', 500);
    }
}

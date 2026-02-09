import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';
import { ensurePermissionShape } from '@/lib/rbac';

async function handler(request: NextRequest, { user }: { user: any }) {
    try {
        await dbConnect();

        const admin = await Admin.findById(user.userId);

        if (!admin) {
            return apiError('User not found', 404);
        }

        if (!admin.isActive) {
            return apiError('Account is disabled', 403);
        }

        const permissions = ensurePermissionShape(admin.role, admin.permissions as any);

        return apiResponse({
            user: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                avatar: admin.avatar,
                lastLogin: admin.lastLogin,
                permissions,
            }
        });

    } catch (error) {
        console.error('Me endpoint error:', error);
        return apiError('Internal server error', 500);
    }
}

export const GET = withAuth(handler);

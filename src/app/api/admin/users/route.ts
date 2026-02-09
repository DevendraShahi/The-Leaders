import { withAuth, requireRole, logAdminAction } from '@/middleware/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Admin, { IAdmin } from '@/models/Admin';
import { getDefaultPermissions, ensurePermissionShape } from '@/lib/rbac';
import { hashPassword } from '@/lib/auth';

/**
 * GET /api/admin/users
 * List admin accounts (authenticated admin)
 */
export const GET = requireRole(['superadmin'])(async (request, { admin }) => {
    try {
        await dbConnect();

        const usersRaw = await Admin.find(
            {}, // Authenticated admins can view account list
            { passwordHash: 0 } // Exclude password
        )
            .sort({ createdAt: -1 })
            .lean();
        const users = usersRaw.map((item: any) => ({
            ...item,
            permissions: ensurePermissionShape(item.role, item.permissions),
        }));

        await logAdminAction(admin, 'LIST_ADMINS', 'admin', undefined, undefined, request);

        return NextResponse.json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error('Error fetching admin users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch admin users' },
            { status: 500 }
        );
    }
});

/**
 * POST /api/admin/users
 * Create a new admin (superadmin only)
 */
export const POST = requireRole(['superadmin'])(async (request, { admin }) => {
    try {
        const body = await request.json();
        const { email, username, password, role, name, customPermissions } = body;

        // Validation
        if (!email || !username || !password || !role) {
            return NextResponse.json(
                { error: 'Missing required fields: email, username, password, role' },
                { status: 400 }
            );
        }

        if (!['cto', 'editorial', 'cmo'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role. Must be: cto, editorial, or cmo' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if email or username already exists
        const existing = await Admin.findOne({
            $or: [{ email }, { username }]
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Email or username already exists' },
                { status: 409 }
            );
        }

        // Get default permissions or use custom
        const permissions = ensurePermissionShape(
            role as IAdmin['role'],
            customPermissions || getDefaultPermissions(role as IAdmin['role'])
        );

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create admin
        const newAdmin = await Admin.create({
            email,
            username,
            passwordHash,
            role,
            name,
            permissions,
            isActive: true,
            createdBy: admin._id,
        });

        // Log action
        await logAdminAction(
            admin,
            'CREATE_ADMIN',
            'admin',
            newAdmin._id?.toString(),
            { role, email },
            request
        );

        // Return without password
        const { passwordHash: _, ...adminData } = newAdmin.toObject();

        return NextResponse.json({
            success: true,
            data: adminData,
            message: 'Admin created successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating admin:', error);
        return NextResponse.json(
            { error: 'Failed to create admin' },
            { status: 500 }
        );
    }
});

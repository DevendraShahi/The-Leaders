import { requireRole, logAdminAction } from '@/middleware/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Admin, { IAdmin } from '@/models/Admin';
import { getDefaultPermissions } from '@/lib/rbac';
import { hashPassword } from '@/lib/auth';

/**
 * GET /api/admin/users/[id]
 * Get specific admin details (superadmin only)
 */
export const GET = requireRole(['superadmin'])(async (request, { admin, params }) => {
    try {
        const { id } = params;
        await dbConnect();

        const targetAdmin = await Admin.findById(id, { passwordHash: 0 }).lean();

        if (!targetAdmin) {
            return NextResponse.json(
                { error: 'Admin not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: targetAdmin,
        });
    } catch (error) {
        console.error('Error fetching admin:', error);
        return NextResponse.json(
            { error: 'Failed to fetch admin' },
            { status: 500 }
        );
    }
});

/**
 * PUT /api/admin/users/[id]
 * Update admin (role, permissions, activate/deactivate)
 * Superadmin only
 */
export const PUT = requireRole(['superadmin'])(async (request, { admin, params }) => {
    try {
        const { id } = params;
        const body = await request.json();
        const { role, permissions, isActive, name, password } = body;

        await dbConnect();

        const targetAdmin = await Admin.findById(id);
        if (!targetAdmin) {
            return NextResponse.json(
                { error: 'Admin not found' },
                { status: 404 }
            );
        }

        // Prevent superadmin role change
        if (targetAdmin.role === 'superadmin') {
            return NextResponse.json(
                { error: 'Cannot modify superadmin account' },
                { status: 403 }
            );
        }

        // Update fields
        if (role) {
            if (!['cto', 'editorial', 'cmo'].includes(role)) {
                return NextResponse.json(
                    { error: 'Invalid role' },
                    { status: 400 }
                );
            }
            targetAdmin.role = role as IAdmin['role'];
            // Update permissions based on new role if not provided
            if (!permissions) {
                targetAdmin.permissions = getDefaultPermissions(role as IAdmin['role']);
            }
        }

        if (permissions) {
            targetAdmin.permissions = permissions;
        }

        if (typeof isActive === 'boolean') {
            targetAdmin.isActive = isActive;
        }

        if (name) {
            targetAdmin.name = name;
        }

        if (password) {
            targetAdmin.passwordHash = await hashPassword(password);
        }

        await targetAdmin.save();

        // Log action
        await logAdminAction(
            admin,
            'UPDATE_ADMIN',
            'admin',
            id,
            { role, isActive, permissionsUpdated: !!permissions },
            request
        );

        const { passwordHash: _, ...adminData } = targetAdmin.toObject();

        return NextResponse.json({
            success: true,
            data: adminData,
            message: 'Admin updated successfully',
        });
    } catch (error) {
        console.error('Error updating admin:', error);
        return NextResponse.json(
            { error: 'Failed to update admin' },
            { status: 500 }
        );
    }
});

/**
 * DELETE /api/admin/users/[id]
 * Delete admin (superadmin only)
 */
export const DELETE = requireRole(['superadmin'])(async (request, { admin, params }) => {
    try {
        const { id } = params;
        await dbConnect();

        const targetAdmin = await Admin.findById(id);
        if (!targetAdmin) {
            return NextResponse.json(
                { error: 'Admin not found' },
                { status: 404 }
            );
        }

        // Prevent superadmin deletion
        if (targetAdmin.role === 'superadmin') {
            return NextResponse.json(
                { error: 'Cannot delete superadmin account' },
                { status: 403 }
            );
        }

        await Admin.findByIdAndDelete(id);

        // Log action
        await logAdminAction(
            admin,
            'DELETE_ADMIN',
            'admin',
            id,
            { email: targetAdmin.email, role: targetAdmin.role },
            request
        );

        return NextResponse.json({
            success: true,
            message: 'Admin deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting admin:', error);
        return NextResponse.json(
            { error: 'Failed to delete admin' },
            { status: 500 }
        );
    }
});

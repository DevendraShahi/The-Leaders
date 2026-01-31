import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Leader from '@/models/Leader';
import ActivityLog from '@/models/ActivityLog';
import { withAuth, apiResponse, apiError, parseRequestBody } from '@/lib/middleware';

// GET: Fetch single leader
async function getLeader(request: NextRequest, { params }: { params: any }) {
    try {
        await dbConnect();
        const { id } = await params;

        const leader = await Leader.findById(id).populate('lastModifiedBy', 'name email');

        if (!leader) {
            return apiError('Leader not found', 404);
        }

        return apiResponse({ leader });

    } catch (error) {
        return apiError('Failed to fetch leader', 500);
    }
}

// PUT: Update leader
async function updateLeader(request: NextRequest, { user, params }: { user: any, params: any }) {
    try {
        await dbConnect();
        const { id } = await params;

        const bodyParse = await parseRequestBody(request);
        if (!bodyParse.success || !bodyParse.data) {
            return apiError(bodyParse.error || 'Invalid request', 400);
        }

        const data = bodyParse.data as any;

        // Add metadata
        data.lastModifiedBy = user.userId;

        const leader = await Leader.findByIdAndUpdate(
            id,
            { ...data },
            { new: true, runValidators: true }
        );

        if (!leader) {
            return apiError('Leader not found', 404);
        }

        // Log activity
        await ActivityLog.create({
            adminId: user.userId,
            action: 'update',
            entityType: 'Leader',
            entityId: leader._id.toString(),
            description: `Updated leader: ${leader.name.en}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ leader });

    } catch (error) {
        console.error('Update leader error:', error);
        return apiError('Failed to update leader', 500);
    }
}

// DELETE: Delete leader
async function deleteLeader(request: NextRequest, { user, params }: { user: any, params: any }) {
    try {
        await dbConnect();
        const { id } = await params;

        const leader = await Leader.findByIdAndDelete(id);

        if (!leader) {
            return apiError('Leader not found', 404);
        }

        // Log activity
        await ActivityLog.create({
            adminId: user.userId,
            action: 'delete',
            entityType: 'Leader',
            entityId: id,
            description: `Deleted leader: ${leader.name.en}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ message: 'Leader deleted successfully' });

    } catch (error) {
        return apiError('Failed to delete leader', 500);
    }
}

export const GET = withAuth(getLeader);
export const PUT = withAuth(updateLeader);
export const DELETE = withAuth(deleteLeader);

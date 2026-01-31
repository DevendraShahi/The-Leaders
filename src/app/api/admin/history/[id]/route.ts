import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import History from '@/models/History';
import ActivityLog from '@/models/ActivityLog';
import { withAuth, apiResponse, apiError, parseRequestBody } from '@/lib/middleware';

// GET: Fetch single history
async function getHistory(request: NextRequest, { params }: { params: any }) {
    try {
        await dbConnect();
        const { id } = await params;

        const history = await History.findById(id).populate('lastModifiedBy', 'name email');

        if (!history) {
            return apiError('History not found', 404);
        }

        return apiResponse({ history });

    } catch (error) {
        return apiError('Failed to fetch history', 500);
    }
}

// PUT: Update history
async function updateHistory(request: NextRequest, { user, params }: { user: any, params: any }) {
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

        const history = await History.findByIdAndUpdate(
            id,
            { ...data },
            { new: true, runValidators: true }
        );

        if (!history) {
            return apiError('History not found', 404);
        }

        // Log activity
        await ActivityLog.create({
            adminId: user.userId,
            action: 'update',
            entityType: 'History',
            entityId: history._id.toString(),
            description: `Updated history: ${history.title.en}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ history });

    } catch (error) {
        console.error('Update history error:', error);
        return apiError('Failed to update history', 500);
    }
}

// DELETE: Delete history
async function deleteHistory(request: NextRequest, { user, params }: { user: any, params: any }) {
    try {
        await dbConnect();
        const { id } = await params;

        const history = await History.findByIdAndDelete(id);

        if (!history) {
            return apiError('History not found', 404);
        }

        // Log activity
        await ActivityLog.create({
            adminId: user.userId,
            action: 'delete',
            entityType: 'History',
            entityId: id,
            description: `Deleted history: ${history.title.en}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ message: 'History deleted successfully' });

    } catch (error) {
        return apiError('Failed to delete history', 500);
    }
}

export const GET = withAuth(getHistory);
export const PUT = withAuth(updateHistory);
export const DELETE = withAuth(deleteHistory);

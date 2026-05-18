import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Leader from '@/models/Leader';
import ActivityLog from '@/models/ActivityLog';
import { withAuth, apiResponse, apiError, parseRequestBody } from '@/lib/middleware';
import { invalidatePublicContent } from '@/lib/cache-invalidation';

function safeDecode(value: string) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function normalizeSlug(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function findLeaderByIdOrSlug(id: string) {
    const decoded = safeDecode(id);
    const normalized = normalizeSlug(decoded);

    if (mongoose.Types.ObjectId.isValid(decoded)) {
        const byId = await Leader.findById(decoded);
        if (byId) return byId;
    }

    if (decoded) {
        const bySlug = await Leader.findOne({ slug: decoded });
        if (bySlug) return bySlug;

        // Support older datasets that used an `id` string field (e.g. "bp-koirala")
        const byLegacyId = await Leader.findOne({ id: decoded } as any);
        if (byLegacyId) return byLegacyId;
    }

    if (normalized) {
        const byNormalizedSlug = await Leader.findOne({ slug: normalized });
        if (byNormalizedSlug) return byNormalizedSlug;

        const byNormalizedLegacyId = await Leader.findOne({ id: normalized } as any);
        if (byNormalizedLegacyId) return byNormalizedLegacyId;
    }

    return null;
}

// GET: Fetch single leader
async function getLeader(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;

        const leader = await findLeaderByIdOrSlug(id);

        if (!leader) {
            return apiError('Leader not found', 404);
        }

        await leader.populate('lastModifiedBy', 'name email');

        return apiResponse({ leader });

    } catch (error) {
        return apiError('Failed to fetch leader', 500);
    }
}

// PUT: Update leader
async function updateLeader(request: NextRequest, { user, params }: { user: any, params: Promise<{ id: string }> }) {
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

        const existing = await findLeaderByIdOrSlug(id);
        if (!existing) {
            return apiError('Leader not found', 404);
        }

        const leader = await Leader.findByIdAndUpdate(
            existing._id,
            { ...data },
            { new: true, runValidators: true }
        );

        if (!leader) {
            return apiError('Leader not found', 404);
        }

        // Log activity
        await ActivityLog.create({ // Assuming AdminLog is meant to be ActivityLog based on imports, or AdminLog needs to be imported. Sticking to ActivityLog for now to avoid new import errors.
            adminId: user.userId, // Assuming session.userId is meant to be user.userId based on function signature.
            action: 'update',
            entityType: 'Leader',
            entityId: leader._id.toString(),
            description: `Updated leader: ${typeof leader.name === 'string' ? leader.name : leader.name.en}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });
        invalidatePublicContent('leader', leader.slug);

        return apiResponse({ leader });

    } catch (error: any) {
        console.error('Update leader error:', error);

        // Handle Mongoose Validation Errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return apiError(messages.join(', '), 400, error.errors);
        }

        return apiError(error.message || 'Failed to update leader', 500);
    }
}

// DELETE: Delete leader
async function deleteLeader(request: NextRequest, { user, params }: { user: any, params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;

        const existing = await findLeaderByIdOrSlug(id);
        if (!existing) {
            return apiError('Leader not found', 404);
        }

        const leader = await Leader.findByIdAndDelete(existing._id);

        if (!leader) {
            return apiError('Leader not found', 404);
        }

        // Log activity
        await ActivityLog.create({
            adminId: user.userId,
            action: 'delete',
            entityType: 'Leader',
            entityId: leader._id.toString(),
            description: `Deleted leader: ${typeof leader.name === 'string' ? leader.name : leader.name.en}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });
        invalidatePublicContent('leader', leader.slug);

        return apiResponse({ message: 'Leader deleted successfully' });

    } catch (error) {
        return apiError('Failed to delete leader', 500);
    }
}

export const GET = withAuth(getLeader);
export const PUT = withAuth(updateLeader);
export const DELETE = withAuth(deleteLeader);

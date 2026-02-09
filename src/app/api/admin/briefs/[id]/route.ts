import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { DailyBrief } from '@/models/ElectionContent';
import ActivityLog from '@/models/ActivityLog';
import { withAuth, apiResponse, apiError, parseRequestBody } from '@/lib/middleware';

function toLogText(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
        const localized = value as { en?: string; ne?: string };
        return localized.en || localized.ne || '';
    }
    return '';
}

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

async function findBriefByIdOrSlug(id: string) {
    const decoded = safeDecode(id);
    const normalized = normalizeSlug(decoded);

    if (mongoose.Types.ObjectId.isValid(decoded)) {
        const byId = await DailyBrief.findById(decoded);
        if (byId) return byId;
    }

    if (decoded) {
        const bySlug = await DailyBrief.findOne({ slug: decoded });
        if (bySlug) return bySlug;
    }

    if (normalized) {
        const byNormalized = await DailyBrief.findOne({ slug: normalized });
        if (byNormalized) return byNormalized;
        const byRegex = await DailyBrief.findOne({ slug: { $regex: normalized, $options: 'i' } });
        if (byRegex) return byRegex;
    }

    return null;
}

// GET: Get single brief
async function getBrief(request: NextRequest, { params, user }: { params: Promise<{ id: string }>, user: any }) {
    try {
        await dbConnect();
        const { id } = await params;
        const brief = await findBriefByIdOrSlug(id);

        if (!brief) {
            return apiError('Brief not found', 404);
        }

        return apiResponse({ brief });
    } catch (error) {
        return apiError('Failed to fetch brief', 500);
    }
}

// PUT: Update brief
async function updateBrief(request: NextRequest, { params, user }: { params: Promise<{ id: string }>, user: any }) {
    try {
        await dbConnect();
        const bodyParse = await parseRequestBody(request);

        if (!bodyParse.success || !bodyParse.data) {
            return apiError(bodyParse.error || 'Invalid request', 400);
        }

        const { id } = await params;
        const existing = await findBriefByIdOrSlug(id);
        if (!existing) {
            return apiError('Brief not found', 404);
        }

        const updateData = { ...(bodyParse.data as Record<string, any>) };
        if (Object.prototype.hasOwnProperty.call(updateData, 'status')) {
            updateData.isPublished = updateData.status === 'published';
        } else if (Object.prototype.hasOwnProperty.call(updateData, 'isPublished')) {
            updateData.status = updateData.isPublished ? 'published' : 'draft';
        }

        const brief = await DailyBrief.findByIdAndUpdate(
            existing._id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!brief) return apiError('Brief not found', 404);

        await ActivityLog.create({
            adminId: user.userId,
            action: 'update',
            entityType: 'DailyBrief',
            entityId: brief._id.toString(),
            description: `Updated brief: ${toLogText(brief.title)}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ brief });
    } catch (error) {
        return apiError('Failed to update brief', 500);
    }
}

// DELETE: Delete brief
async function deleteBrief(request: NextRequest, { params, user }: { params: Promise<{ id: string }>, user: any }) {
    try {
        await dbConnect();
        const { id } = await params;
        const existing = await findBriefByIdOrSlug(id);
        if (!existing) {
            return apiError('Brief not found', 404);
        }
        const brief = await DailyBrief.findByIdAndDelete(existing._id);

        if (!brief) {
            return apiError('Brief not found', 404);
        }

        await ActivityLog.create({
            adminId: user.userId,
            action: 'delete',
            entityType: 'DailyBrief',
            entityId: brief._id.toString(),
            description: `Deleted brief: ${toLogText(brief.title)}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ success: true });
    } catch (error) {
        return apiError('Failed to delete brief', 500);
    }
}

export const GET = withAuth(getBrief);
export const PUT = withAuth(updateBrief);
export const DELETE = withAuth(deleteBrief);

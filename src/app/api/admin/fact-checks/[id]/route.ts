import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { FactCheck } from '@/models/ElectionContent';
import ActivityLog from '@/models/ActivityLog';
import { withAuth, apiResponse, apiError, parseRequestBody } from '@/lib/middleware';
import { slugify } from '@/lib/slug';

function safeDecode(value: string) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function normalizeSlug(value: string) {
    return slugify(value, 60);
}

async function findFactCheckByIdOrSlug(id: string) {
    const decoded = safeDecode(id);
    const normalized = normalizeSlug(decoded);

    if (mongoose.Types.ObjectId.isValid(decoded)) {
        const byId = await FactCheck.findById(decoded);
        if (byId) return byId;
    }

    if (decoded) {
        const bySlug = await FactCheck.findOne({ slug: decoded });
        if (bySlug) return bySlug;
    }

    if (normalized) {
        const byNormalized = await FactCheck.findOne({ slug: normalized });
        if (byNormalized) return byNormalized;
        const byRegex = await FactCheck.findOne({ slug: { $regex: normalized, $options: 'i' } });
        if (byRegex) return byRegex;

        const tokenRegex = normalized.split("-").filter(Boolean).join(".*");
        const byClaim = await FactCheck.findOne({ claim: { $regex: tokenRegex, $options: 'i' } });
        if (byClaim) {
            if (!byClaim.slug) {
                await FactCheck.updateOne({ _id: byClaim._id }, { $set: { slug: normalized } });
                byClaim.slug = normalized;
            }
            return byClaim;
        }
    }

    return null;
}

// GET
async function getFactCheck(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const factCheck = await findFactCheckByIdOrSlug(id);

        if (!factCheck) return apiError('Not found', 404);

        return apiResponse({ factCheck });
    } catch (error) {
        return apiError('Error fetching fact check', 500);
    }
}

// PUT
async function updateFactCheck(request: NextRequest, { params, user }: { params: Promise<{ id: string }>, user: any }) {
    try {
        await dbConnect();
        const bodyParse = await parseRequestBody(request);

        if (!bodyParse.success || !bodyParse.data) {
            return apiError(bodyParse.error || 'Invalid request', 400);
        }

        const { id } = await params;
        const existing = await findFactCheckByIdOrSlug(id);
        if (!existing) return apiError('Not found', 404);

        const factCheck = await FactCheck.findByIdAndUpdate(
            existing._id,
            { $set: bodyParse.data },
            { new: true, runValidators: true }
        );

        if (!factCheck) return apiError('Not found', 404);

        await ActivityLog.create({
            adminId: user.userId,
            action: 'update',
            entityType: 'FactCheck',
            entityId: factCheck._id.toString(),
            description: `Updated fact check: ${factCheck.claim.substring(0, 50)}...`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ factCheck });
    } catch (error) {
        return apiError('Error updating fact check', 500);
    }
}

// DELETE
async function deleteFactCheck(request: NextRequest, { params, user }: { params: Promise<{ id: string }>, user: any }) {
    try {
        await dbConnect();
        const { id } = await params;
        const existing = await findFactCheckByIdOrSlug(id);
        if (!existing) return apiError('Not found', 404);
        const factCheck = await FactCheck.findByIdAndDelete(existing._id);

        if (!factCheck) return apiError('Not found', 404);

        await ActivityLog.create({
            adminId: user.userId,
            action: 'delete',
            entityType: 'FactCheck',
            entityId: factCheck._id.toString(),
            description: `Deleted fact check: ${factCheck.claim.substring(0, 50)}...`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ success: true });
    } catch (error) {
        return apiError('Error deleting fact check', 500);
    }
}

export const GET = withAuth(getFactCheck);
export const PUT = withAuth(updateFactCheck);
export const DELETE = withAuth(deleteFactCheck);

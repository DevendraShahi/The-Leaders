import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { ColumnArticle } from '@/models/ElectionContent';
import ActivityLog from '@/models/ActivityLog';
import { withAuth, apiResponse, apiError, parseRequestBody } from '@/lib/middleware';
import { invalidatePublicContent } from '@/lib/cache-invalidation';

// --- Helper Functions ---

function safeDecode(value: string) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function normalizeSlug(value: string) {
    if (typeof value !== 'string') return '';
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Robust fallback search matching frontend logic
async function fallbackSearch(target: string) {
    try {
        // Fetch recent articles to support fuzzy matching like the frontend
        const articles = await ColumnArticle.find({}).sort({ createdAt: -1 }).limit(100);
        const normalizedTarget = normalizeSlug(target);

        // 1) Ends-with match
        let match = articles.find((a) => a.slug && normalizeSlug(a.slug).endsWith(normalizedTarget));
        if (match) return match;

        // 2) Contains match
        match = articles.find((a) => a.slug && normalizeSlug(a.slug).includes(normalizedTarget));
        if (match) return match;

        // 3) Match against title
        match = articles.find((a) => a.title_en && normalizeSlug(a.title_en) === normalizedTarget);
        return match || null;
    } catch (error) {
        console.error('Error in fallbackSearch:', error);
        return null; // Return null instead of crashing if something goes wrong
    }
}

// Primary internal search function
async function findArticleInternal(id: string) {
    const decoded = safeDecode(id);
    const normalized = normalizeSlug(decoded);

    // 1. Try ID lookup
    if (mongoose.Types.ObjectId.isValid(decoded)) {
        const byId = await ColumnArticle.findById(decoded);
        if (byId) return byId;
    }

    // 2. Try Exact Slug lookup
    if (decoded) {
        const bySlug = await ColumnArticle.findOne({ slug: decoded });
        if (bySlug) return bySlug;
    }

    // 3. Try Normalized/Regex and Fallback
    if (normalized) {
        const byNormalized = await ColumnArticle.findOne({ slug: normalized });
        if (byNormalized) return byNormalized;

        const byRegex = await ColumnArticle.findOne({ slug: { $regex: normalized, $options: 'i' } });
        if (byRegex) return byRegex;

        // Fallback strategy
        return await fallbackSearch(normalized);
    }

    return null;
}

// --- Route Handlers ---

// GET: Single column article
async function getColumnArticle(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const article = await findArticleInternal(id);

        if (!article) {
            return apiError('Column article not found', 404);
        }

        return apiResponse({ columnArticle: article });
    } catch (error) {
        console.error('Error fetching column article:', error);
        return apiError('Failed to fetch column article', 500);
    }
}

// PUT: Update column article
async function updateColumnArticle(
    request: NextRequest,
    { params, user }: { params: Promise<{ id: string }>, user: any }
) {
    try {
        await dbConnect();
        // Debug logging
        console.log('Update Request - User:', JSON.stringify(user, null, 2));

        const bodyParse = await parseRequestBody(request);

        if (bodyParse.success) {
            console.log('Update Request - Body:', JSON.stringify(bodyParse.data, null, 2));
        }

        if (!bodyParse.success || !bodyParse.data) {
            return apiError(bodyParse.error || 'Invalid request', 400);
        }

        const { id } = await params;
        const existing = await findArticleInternal(id);
        if (!existing) {
            return apiError('Column article not found', 404);
        }

        const article = await ColumnArticle.findByIdAndUpdate(
            existing._id,
            { $set: bodyParse.data },
            { new: true, runValidators: true }
        );

        if (!article) {
            return apiError('Column article not found', 404);
        }

        await ActivityLog.create({
            adminId: user.userId,
            action: 'update',
            entityType: 'ColumnArticle',
            entityId: article._id.toString(),
            description: `Updated column article: ${article.title_en}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });
        invalidatePublicContent('column-article', article.slug);

        return apiResponse({ columnArticle: article });
    } catch (error) {
        console.error('Error updating column article:', error);
        return apiError('Failed to update column article', 500, error instanceof Error ? error.message : 'Unknown error');
    }
}

// DELETE: Delete column article
async function deleteColumnArticle(
    request: NextRequest,
    { params, user }: { params: Promise<{ id: string }>, user: any }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const existing = await findArticleInternal(id);
        if (!existing) {
            return apiError('Column article not found', 404);
        }
        const article = await ColumnArticle.findByIdAndDelete(existing._id);

        if (!article) {
            return apiError('Column article not found', 404);
        }

        await ActivityLog.create({
            adminId: user.userId,
            action: 'delete',
            entityType: 'ColumnArticle',
            entityId: article._id.toString(),
            description: `Deleted column article: ${article.title_en}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });
        invalidatePublicContent('column-article', article.slug);

        return apiResponse({ success: true });
    } catch (error) {
        console.error('Error deleting column article:', error);
        return apiError('Failed to delete column article', 500);
    }
}

export const GET = withAuth(getColumnArticle);
export const PUT = withAuth(updateColumnArticle);
export const DELETE = withAuth(deleteColumnArticle);

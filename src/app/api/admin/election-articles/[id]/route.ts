import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { ElectionArticle } from '@/models/ElectionContent';
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
        const articles = await ElectionArticle.find({}).sort({ createdAt: -1 }).limit(100);
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
        const byId = await ElectionArticle.findById(decoded);
        if (byId) return byId;
    }

    // 2. Try Exact Slug lookup
    if (decoded) {
        const bySlug = await ElectionArticle.findOne({ slug: decoded });
        if (bySlug) return bySlug;
    }

    // 3. Try Normalized/Regex and Fallback
    if (normalized) {
        const byNormalized = await ElectionArticle.findOne({ slug: normalized });
        if (byNormalized) return byNormalized;

        const byRegex = await ElectionArticle.findOne({ slug: { $regex: normalized, $options: 'i' } });
        if (byRegex) return byRegex;

        // Fallback strategy
        return await fallbackSearch(normalized);
    }

    return null;
}

// --- Route Handlers ---

// GET: Single election article
async function getElectionArticle(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const article = await findArticleInternal(id);

        if (!article) {
            return apiError('Election article not found', 404);
        }

        return apiResponse({ electionArticle: article });
    } catch (error) {
        console.error('Error fetching election article:', error);
        return apiError('Failed to fetch election article', 500);
    }
}

// PUT: Update election article
async function updateElectionArticle(
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
            return apiError('Election article not found', 404);
        }

        const article = await ElectionArticle.findByIdAndUpdate(
            existing._id,
            { $set: bodyParse.data },
            { new: true, runValidators: true }
        );

        if (!article) {
            return apiError('Election article not found', 404);
        }

        await ActivityLog.create({
            adminId: user.userId,
            action: 'update',
            entityType: 'ElectionArticle',
            entityId: article._id.toString(),
            description: `Updated election article: ${article.title_en}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });
        invalidatePublicContent('election-article', article.slug);

        return apiResponse({ electionArticle: article });
    } catch (error) {
        console.error('Error updating election article:', error);
        return apiError('Failed to update election article', 500, error instanceof Error ? error.message : 'Unknown error');
    }
}

// DELETE: Delete election article
async function deleteElectionArticle(
    request: NextRequest,
    { params, user }: { params: Promise<{ id: string }>, user: any }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const existing = await findArticleInternal(id);
        if (!existing) {
            return apiError('Election article not found', 404);
        }
        const article = await ElectionArticle.findByIdAndDelete(existing._id);

        if (!article) {
            return apiError('Election article not found', 404);
        }

        await ActivityLog.create({
            adminId: user.userId,
            action: 'delete',
            entityType: 'ElectionArticle',
            entityId: article._id.toString(),
            description: `Deleted election article: ${article.title_en}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });
        invalidatePublicContent('election-article', article.slug);

        return apiResponse({ success: true });
    } catch (error) {
        console.error('Error deleting election article:', error);
        return apiError('Failed to delete election article', 500);
    }
}

export const GET = withAuth(getElectionArticle);
export const PUT = withAuth(updateElectionArticle);
export const DELETE = withAuth(deleteElectionArticle);

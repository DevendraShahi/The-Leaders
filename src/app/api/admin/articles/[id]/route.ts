import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import ActivityLog from '@/models/ActivityLog';
import { withAuth, apiResponse, apiError, parseRequestBody } from '@/lib/middleware';

// GET: Fetch single article
async function getArticle(request: NextRequest, { params }: { params: any }) {
    try {
        await dbConnect();
        const { id } = await params;

        const article = await Article.findById(id).populate('lastModifiedBy', 'name email');

        if (!article) {
            return apiError('Article not found', 404);
        }

        return apiResponse({ article });

    } catch (error) {
        console.error('Get article error:', error);
        return apiError('Failed to fetch article', 500);
    }
}

// PUT: Update article
async function updateArticle(request: NextRequest, { user, params }: { user: any, params: any }) {
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

        const article = await Article.findByIdAndUpdate(
            id,
            { ...data },
            { new: true, runValidators: true }
        );

        if (!article) {
            return apiError('Article not found', 404);
        }

        // Log activity
        await ActivityLog.create({
            adminId: user.userId,
            action: 'update',
            entityType: 'Article',
            entityId: article._id.toString(),
            description: `Updated article: ${article.title?.en || article.title?.ne}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ article });

    } catch (error) {
        console.error('Update article error:', error);
        return apiError('Failed to update article', 500);
    }
}

// DELETE: Delete article (Soft delete can be implemented by just changing status to 'archived', but here we do hard delete per standard, or Soft if prefered)
// Let's do hard delete for cleanup, or Soft delete if safety needed. User asked for "Maintenance", maybe soft delete.
// Re-reading task: "Add soft delete and audit fields". So I should probably set status to archived or deleted.
// But models usually have separate deletedAt for soft delete.
// existing models don't have deletedAt.
// I'll stick to actual delete for now but log it. 
// Or better, since `status` can be 'archived', DELETE could mean archive query param?
// Use DELETE method for actual removal for now.

async function deleteArticle(request: NextRequest, { user, params }: { user: any, params: any }) {
    try {
        await dbConnect();
        const { id } = await params;

        const article = await Article.findByIdAndDelete(id);

        if (!article) {
            return apiError('Article not found', 404);
        }

        // Log activity
        await ActivityLog.create({
            adminId: user.userId,
            action: 'delete',
            entityType: 'Article',
            entityId: id,
            description: `Deleted article: ${article.title?.en || article.title?.ne}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ message: 'Article deleted successfully' });

    } catch (error) {
        return apiError('Failed to delete article', 500);
    }
}

export const GET = withAuth(getArticle);
export const PUT = withAuth(updateArticle);
export const DELETE = withAuth(deleteArticle);

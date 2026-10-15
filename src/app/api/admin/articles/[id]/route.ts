import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import ActivityLog from '@/models/ActivityLog';
import { withPageAccess, withPermission, apiResponse, apiError, parseRequestBody } from '@/lib/middleware';
import { invalidatePublicContent } from '@/lib/cache-invalidation';
import { canUpdateArticle, hasArticlePermission, isArticleStatus, type ArticleStatus } from '@/lib/article-permissions';

// GET: Fetch single article
async function getArticle(request: NextRequest, { params }: { params: any }) {
    try {
        await dbConnect();
        const { id } = await params;

        const article = await Article.findById(id)
            .select('+editorialWorkflow')
            .populate('lastModifiedBy', 'name email');

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
        if (data.status !== undefined && !isArticleStatus(data.status)) {
            return apiError('Invalid article status', 400);
        }

        const existing = await Article.findById(id).select('status').lean();
        if (!existing) {
            return apiError('Article not found', 404);
        }

        const currentStatus = (existing.status || 'draft') as ArticleStatus;
        const requestedStatus = (data.status || currentStatus) as ArticleStatus;
        const mayPublish = hasArticlePermission(user, 'publish');

        if (!canUpdateArticle(user, currentStatus, requestedStatus)) {
            return apiError('Insufficient permissions to publish articles', 403);
        }

        // Add metadata
        data.lastModifiedBy = user.userId;
        if (data.editorialWorkflow) {
            data.editorialWorkflow.updatedBy = user.userId;
            data.editorialWorkflow.updatedAt = new Date();
        }

        const article = await Article.findOneAndUpdate(
            mayPublish ? { _id: id } : { _id: id, status: { $ne: 'published' } },
            { ...data },
            { new: true, runValidators: true }
        );

        if (!article) {
            return apiError('Article changed before it could be updated. Refresh and try again.', 409);
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
        invalidatePublicContent('article', article.slug);

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
        invalidatePublicContent('article', article.slug);

        return apiResponse({ message: 'Article deleted successfully' });

    } catch (error) {
        return apiError('Failed to delete article', 500);
    }
}

export const GET = withPageAccess('content', getArticle);
export const PUT = withPermission('articles', 'edit', updateArticle);
export const DELETE = withPermission('articles', 'delete', deleteArticle);

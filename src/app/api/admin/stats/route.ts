import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Leader from '@/models/Leader';
import History from '@/models/History';
import Media from '@/models/Media';
import ActivityLog from '@/models/ActivityLog';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';

async function getStats(request: NextRequest, { user }: { user: any }) {
    try {
        await dbConnect();

        // 1. Total counts
        const [
            articlesTotal,
            articlesPublished,
            leadersTotal,
            historyTotal,
            mediaTotal,
            logs
        ] = await Promise.all([
            Article.countDocuments(),
            Article.countDocuments({ status: 'published' }),
            Leader.countDocuments(),
            History.countDocuments(),
            Media.countDocuments(),
            ActivityLog.find().sort({ createdAt: -1 }).limit(10).populate('adminId', 'name')
        ]);

        // 2. Growth metrics (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newArticles = await Article.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

        // 3. Most viewed content (if views tracked)
        const popularArticles = await Article.find().sort({ views: -1 }).limit(5).select('title views slug');

        return apiResponse({
            counts: {
                articles: articlesTotal,
                articlesPublished,
                leaders: leadersTotal,
                history: historyTotal,
                media: mediaTotal
            },
            growth: {
                newArticlesIn30Days: newArticles
            },
            popularContent: {
                articles: popularArticles
            },
            recentActivity: logs.map(log => ({
                id: log._id,
                action: log.action,
                entityType: log.entityType,
                description: log.description,
                user: (log.adminId as any)?.name || 'Unknown',
                timestamp: log.createdAt
            }))
        });

    } catch (error) {
        console.error('Get stats error:', error);
        return apiError('Failed to fetch statistics', 500);
    }
}

export const GET = withAuth(getStats);

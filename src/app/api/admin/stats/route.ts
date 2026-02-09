import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Leader from '@/models/Leader';
import History from '@/models/History';
import Media from '@/models/Media';
import ActivityLog from '@/models/ActivityLog';
import Subscriber from '@/models/Subscriber';
import Contact from '@/models/Contact';
import { DailyBrief, FactCheck, ElectionArticle } from '@/models/ElectionContent';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';

async function getStats(request: NextRequest, { user }: { user: any }) {
    try {
        await dbConnect();

        // 1) Core totals
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
            ActivityLog.find().sort({ createdAt: -1 }).limit(10).populate('adminId', 'name username email')
        ]);

        // 2) Growth metrics (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [newArticles, newLeaders, newHistory, newMedia] = await Promise.all([
            Article.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Leader.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            History.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Media.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        ]);

        // 2.5) CMO funnel and content pipeline
        const [
            subscribersTotal,
            subscribersActive,
            subscribersIn30Days,
            contactsTotal,
            contactsNew,
            contactsReplied,
            articleDraft,
            articleArchived,
            briefPublished,
            briefDraft,
            factCheckPublished,
            factCheckDraft,
            electionArticlePublished,
            electionArticleDraft
        ] = await Promise.all([
            Subscriber.countDocuments(),
            Subscriber.countDocuments({ isActive: true }),
            Subscriber.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Contact.countDocuments(),
            Contact.countDocuments({ status: 'new' }),
            Contact.countDocuments({ status: 'replied' }),
            Article.countDocuments({ status: 'draft' }),
            Article.countDocuments({ status: 'archived' }),
            DailyBrief.countDocuments({ status: 'published' }),
            DailyBrief.countDocuments({ status: 'draft' }),
            FactCheck.countDocuments({ status: 'published' }),
            FactCheck.countDocuments({ status: 'draft' }),
            ElectionArticle.countDocuments({ status: 'published' }),
            ElectionArticle.countDocuments({ status: 'draft' }),
        ]);

        // 3) Article status breakdown
        const articleStatusAgg = await Article.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        const articleStatus = articleStatusAgg.reduce<Record<string, number>>((acc, item) => {
            const key = item._id || 'draft';
            acc[key] = item.count;
            return acc;
        }, { draft: 0, published: 0, archived: 0 });

        // 4) Most viewed content
        const popularArticles = await Article.find().sort({ views: -1 }).limit(5).select('title views slug');

        // 5) Activity breakdown in last 30 days
        const activityAgg = await ActivityLog.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        const activityByAction = activityAgg.map((item) => ({
            action: item._id || 'unknown',
            count: item.count,
        }));

        const activityEntityAgg = await ActivityLog.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: '$entityType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
        ]);
        const activityByEntity = activityEntityAgg.map((item) => ({
            entity: item._id || 'Unknown',
            count: item.count,
        }));

        // 6) 14-day content creation trend
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
        const startDate = new Date(fourteenDaysAgo.getFullYear(), fourteenDaysAgo.getMonth(), fourteenDaysAgo.getDate());

        const [articleAgg, leaderAgg, historyAgg, mediaAgg] = await Promise.all([
            Article.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }
            ]),
            Leader.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }
            ]),
            History.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }
            ]),
            Media.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }
            ]),
        ]);

        const toMap = (arr: Array<{ _id: string; count: number }>) =>
            arr.reduce<Record<string, number>>((acc, cur) => {
                acc[cur._id] = cur.count;
                return acc;
            }, {});

        const articleMap = toMap(articleAgg as any);
        const leaderMap = toMap(leaderAgg as any);
        const historyMap = toMap(historyAgg as any);
        const mediaMap = toMap(mediaAgg as any);

        const contentTrend: Array<{
            date: string;
            articles: number;
            leaders: number;
            history: number;
            media: number;
            total: number;
        }> = [];
        for (let i = 0; i < 14; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            const dayArticles = articleMap[key] || 0;
            const dayLeaders = leaderMap[key] || 0;
            const dayHistory = historyMap[key] || 0;
            const dayMedia = mediaMap[key] || 0;
            contentTrend.push({
                date: key,
                articles: dayArticles,
                leaders: dayLeaders,
                history: dayHistory,
                media: dayMedia,
                total: dayArticles + dayLeaders + dayHistory + dayMedia,
            });
        }

        // 7) Category performance for published articles
        const categoryPerformanceAgg = await Article.aggregate([
            { $match: { status: 'published' } },
            {
                $group: {
                    _id: '$category.en',
                    count: { $sum: 1 },
                    views: { $sum: { $ifNull: ['$views', 0] } },
                }
            },
            { $sort: { views: -1, count: -1 } },
            { $limit: 8 },
        ]);
        const categoryPerformance = categoryPerformanceAgg.map((item) => ({
            category: item._id || 'Uncategorized',
            count: item.count || 0,
            views: item.views || 0,
        }));

        // 8) Media distribution and storage profile
        const mediaByCategoryAgg = await Media.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    sizeBytes: { $sum: { $ifNull: ['$size', 0] } },
                }
            },
            { $sort: { count: -1 } },
        ]);
        const mediaByCategory = mediaByCategoryAgg.map((item) => ({
            category: item._id || 'general',
            count: item.count || 0,
            sizeMB: Number(((item.sizeBytes || 0) / (1024 * 1024)).toFixed(2)),
        }));

        // 9) 14-day acquisition trend (subscribers + contacts)
        const [subscriberTrendAgg, contactTrendAgg] = await Promise.all([
            Subscriber.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }
            ]),
            Contact.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }
            ]),
        ]);
        const subscriberMap = toMap(subscriberTrendAgg as any);
        const contactMap = toMap(contactTrendAgg as any);
        const acquisitionTrend: Array<{ date: string; subscribers: number; contacts: number }> = [];
        for (let i = 0; i < 14; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            acquisitionTrend.push({
                date: key,
                subscribers: subscriberMap[key] || 0,
                contacts: contactMap[key] || 0,
            });
        }

        const totalPublishable = articlesPublished + articleDraft + briefPublished + briefDraft + factCheckPublished + factCheckDraft + electionArticlePublished + electionArticleDraft;
        const totalPublished = articlesPublished + briefPublished + factCheckPublished + electionArticlePublished;
        const publishEfficiency = totalPublishable > 0 ? Number(((totalPublished / totalPublishable) * 100).toFixed(1)) : 0;
        const contactReplyRate = contactsTotal > 0 ? Number(((contactsReplied / contactsTotal) * 100).toFixed(1)) : 0;

        return apiResponse({
            counts: {
                articles: articlesTotal,
                articlesPublished,
                leaders: leadersTotal,
                history: historyTotal,
                media: mediaTotal
            },
            kpis: {
                subscribersTotal,
                subscribersActive,
                subscribersIn30Days,
                contactsTotal,
                contactsNew,
                contactsReplied,
                contactReplyRate,
                publishEfficiency,
            },
            pipeline: {
                articles: { published: articlesPublished, draft: articleDraft, archived: articleArchived },
                dailyBriefs: { published: briefPublished, draft: briefDraft },
                factChecks: { published: factCheckPublished, draft: factCheckDraft },
                electionArticles: { published: electionArticlePublished, draft: electionArticleDraft },
            },
            growth: {
                newArticlesIn30Days: newArticles,
                newLeadersIn30Days: newLeaders,
                newHistoryIn30Days: newHistory,
                newMediaIn30Days: newMedia,
            },
            articleStatus,
            analytics: {
                activityByAction,
                activityByEntity,
                contentTrend,
                categoryPerformance,
                mediaByCategory,
                acquisitionTrend,
            },
            popularContent: {
                articles: popularArticles
            },
            recentActivity: logs.map(log => ({
                id: log._id,
                action: log.action,
                entityType: log.entityType,
                description: log.description,
                user: (log.adminId as any)?.username || (log.adminId as any)?.email || (log.adminId as any)?.name || 'unknown',
                timestamp: log.createdAt
            }))
        });

    } catch (error) {
        console.error('Get stats error:', error);
        return apiError('Failed to fetch statistics', 500);
    }
}

export const GET = withAuth(getStats);

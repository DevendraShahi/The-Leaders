import { NextRequest } from "next/server";
import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import Leader from "@/models/Leader";
import History from "@/models/History";
import Media from "@/models/Media";
import ActivityLog from "@/models/ActivityLog";
import Subscriber from "@/models/Subscriber";
import Contact from "@/models/Contact";
import { DailyBrief, ElectionArticle, FactCheck } from "@/models/ElectionContent";
import Admin from "@/models/Admin";
import { withAuth, apiResponse, apiError } from "@/lib/middleware";

async function buildDashboardStats() {
    await dbConnect();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
        articlesTotal,
        articlesPublished,
        leadersTotal,
        historyTotal,
        mediaTotal,
        briefsTotal,
        factChecksTotal,
        electionArticlesTotal,
        newArticles,
        newLeaders,
        newHistory,
        newMedia,
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
        electionArticleDraft,
        logs,
    ] = await Promise.all([
        Article.countDocuments(),
        Article.countDocuments({ status: "published" }),
        Leader.countDocuments(),
        History.countDocuments(),
        Media.countDocuments(),
        DailyBrief.countDocuments(),
        FactCheck.countDocuments(),
        ElectionArticle.countDocuments(),
        Article.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        Leader.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        History.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        Media.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        Subscriber.countDocuments({ $or: [{ isVerified: true }, { isVerified: { $exists: false } }] }),
        Subscriber.countDocuments({ isActive: true, $or: [{ isVerified: true }, { isVerified: { $exists: false } }] }),
        Subscriber.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, $or: [{ isVerified: true }, { isVerified: { $exists: false } }] }),
        Contact.countDocuments(),
        Contact.countDocuments({ status: "new" }),
        Contact.countDocuments({ status: "replied" }),
        Article.countDocuments({ status: "draft" }),
        Article.countDocuments({ status: "archived" }),
        DailyBrief.countDocuments({ status: "published" }),
        DailyBrief.countDocuments({ status: "draft" }),
        FactCheck.countDocuments({ status: "published" }),
        FactCheck.countDocuments({ status: "draft" }),
        ElectionArticle.countDocuments({ status: "published" }),
        ElectionArticle.countDocuments({ status: "draft" }),
        ActivityLog.find().sort({ createdAt: -1 }).limit(10).populate("adminId", "name username email").lean(),
    ]);

    const totalPublishable = articlesPublished + articleDraft + briefPublished + briefDraft + factCheckPublished + factCheckDraft + electionArticlePublished + electionArticleDraft;
    const totalPublished = articlesPublished + briefPublished + factCheckPublished + electionArticlePublished;
    const publishEfficiency = totalPublishable > 0 ? Number(((totalPublished / totalPublishable) * 100).toFixed(1)) : 0;
    const contactReplyRate = contactsTotal > 0 ? Number(((contactsReplied / contactsTotal) * 100).toFixed(1)) : 0;

    return {
        counts: {
            articles: articlesTotal,
            articlesPublished,
            leaders: leadersTotal,
            history: historyTotal,
            media: mediaTotal,
            dailyBriefs: briefsTotal,
            factChecks: factChecksTotal,
            electionArticles: electionArticlesTotal,
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
        recentActivity: logs.map((log: any) => ({
            id: log._id,
            action: log.action,
            entityType: log.entityType,
            description: log.description,
            user: log.adminId?.username || log.adminId?.email || log.adminId?.name || "unknown",
            timestamp: log.createdAt,
        })),
    };
}

const getCachedDashboardStats = unstable_cache(
    buildDashboardStats,
    ["admin-dashboard-stats"],
    { revalidate: 1800, tags: ["admin-stats"] }
);

async function getStats(request: NextRequest, { user }: { user: any }) {
    try {
        await dbConnect();
        const admin = await Admin.findById(user.userId).select("role isActive permissions").lean();
        if (!admin || !admin.isActive) {
            return apiError("Unauthorized", 403);
        }
        const canViewDashboard = admin.role === "superadmin"
            || Boolean((admin as any)?.permissions?.analytics?.view)
            || Boolean((admin as any)?.permissions?.pageAccess?.dashboard);
        if (!canViewDashboard) {
            return apiError("Dashboard access denied", 403);
        }

        return apiResponse(await getCachedDashboardStats());
    } catch (error) {
        console.error("Get dashboard stats error:", error);
        return apiError("Failed to fetch dashboard statistics", 500);
    }
}

export const GET = withAuth(getStats);

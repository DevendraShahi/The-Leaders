import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { ElectionArticle } from '@/models/ElectionContent';
import ActivityLog from '@/models/ActivityLog';
import { withAuth, apiResponse, apiError, parseRequestBody } from '@/lib/middleware';
import { invalidatePublicContent } from '@/lib/cache-invalidation';

function parseDateRange(searchParams: URLSearchParams) {
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const range: any = {};
    if (from) {
        const start = new Date(`${from}T00:00:00.000Z`);
        if (!Number.isNaN(start.getTime())) range.$gte = start;
    }
    if (to) {
        const end = new Date(`${to}T23:59:59.999Z`);
        if (!Number.isNaN(end.getTime())) range.$lte = end;
    }
    return Object.keys(range).length > 0 ? range : null;
}

// GET: List election articles with pagination and filtering
async function getElectionArticles(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');
        const createdAtRange = parseDateRange(searchParams);

        const query: any = {};
        if (search) {
            query.$or = [
                { title_en: { $regex: search, $options: 'i' } },
                { excerpt_en: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }
        if (createdAtRange) {
            query.createdAt = createdAtRange;
        }
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const [articlesRaw, total] = await Promise.all([
            ElectionArticle.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ElectionArticle.countDocuments(query)
        ]);

        const articles = articlesRaw.map((article: any) => ({
            ...article,
            id: article._id?.toString?.() || String(article._id),
            _id: article._id?.toString?.() || String(article._id),
        }));

        return apiResponse({
            electionArticles: articles,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get election articles error:', error);
        return apiError('Failed to fetch election articles', 500);
    }
}

// POST: Create election article (optional)
async function createElectionArticle(request: NextRequest, { user }: { user: any }) {
    try {
        await dbConnect();

        const bodyParse = await parseRequestBody(request);
        if (!bodyParse.success || !bodyParse.data) {
            return apiError(bodyParse.error || 'Invalid request', 400);
        }

        const data = bodyParse.data as any;
        if (!data.title_en || !data.slug) {
            return apiError('Title and slug are required', 400);
        }

        const existing = await ElectionArticle.findOne({ slug: data.slug });
        if (existing) {
            return apiError('Slug already exists', 409);
        }

        const article = await ElectionArticle.create(data);

        await ActivityLog.create({
            adminId: user.userId,
            action: 'create',
            entityType: 'ElectionArticle',
            entityId: article._id.toString(),
            description: `Created election article: ${data.title_en}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });
        invalidatePublicContent('election-article', article.slug);

        return apiResponse({ electionArticle: article }, 201);
    } catch (error) {
        console.error('Create election article error:', error);
        return apiError('Failed to create election article', 500);
    }
}

export const GET = withAuth(getElectionArticles);
export const POST = withAuth(createElectionArticle);

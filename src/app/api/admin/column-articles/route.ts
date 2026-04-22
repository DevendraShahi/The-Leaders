import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { ColumnArticle } from '@/models/ElectionContent';
import ActivityLog from '@/models/ActivityLog';
import { withAuth, apiResponse, apiError, parseRequestBody } from '@/lib/middleware';

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

// GET: List column articles with pagination and filtering
async function getColumnArticles(request: NextRequest) {
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
            ColumnArticle.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ColumnArticle.countDocuments(query)
        ]);

        const articles = articlesRaw.map((article: any) => ({
            ...article,
            id: article._id?.toString?.() || String(article._id),
            _id: article._id?.toString?.() || String(article._id),
        }));

        return apiResponse({
            columnArticles: articles,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get column articles error:', error);
        return apiError('Failed to fetch column articles', 500);
    }
}

// POST: Create column article (optional)
async function createColumnArticle(request: NextRequest, { user }: { user: any }) {
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

        const existing = await ColumnArticle.findOne({ slug: data.slug });
        if (existing) {
            return apiError('Slug already exists', 409);
        }

        const article = await ColumnArticle.create(data);

        await ActivityLog.create({
            adminId: user.userId,
            action: 'create',
            entityType: 'ColumnArticle',
            entityId: article._id.toString(),
            description: `Created column article: ${data.title_en}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ columnArticle: article }, 201);
    } catch (error) {
        console.error('Create column article error:', error);
        return apiError('Failed to create column article', 500);
    }
}

export const GET = withAuth(getColumnArticles);
export const POST = withAuth(createColumnArticle);

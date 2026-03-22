import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
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

// GET: List articles with pagination and filtering
async function getArticles(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const createdAtRange = parseDateRange(searchParams);

        const query: any = {};

        if (search) {
            query.$or = [
                { 'title.en': { $regex: search, $options: 'i' } },
                { 'title.ne': { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            query.status = status;
        }

        if (category) {
            query['category.en'] = category;
        }

        if (createdAtRange) {
            query.createdAt = createdAtRange;
        }

        const skip = (page - 1) * limit;

        const [articlesRaw, total] = await Promise.all([
            Article.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('lastModifiedBy', 'name email'),
            Article.countDocuments(query)
        ]);

        const articles = articlesRaw.map((article: any) => {
            const plain = article.toObject ? article.toObject() : article;
            return {
                ...plain,
                status: plain.status || 'draft',
            };
        });

        return apiResponse({
            articles,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get articles error:', error);
        return apiError('Failed to fetch articles', 500);
    }
}

// POST: Create new article
async function createArticle(request: NextRequest, { user }: { user: any }) {
    try {
        await dbConnect();

        const bodyParse = await parseRequestBody(request);
        if (!bodyParse.success || !bodyParse.data) {
            return apiError(bodyParse.error || 'Invalid request', 400);
        }

        const data = bodyParse.data as any;

        // Basic validation - at least one title and one author
        if ((!data.title?.en && !data.title?.ne) || !data.slug) {
            return apiError('At least one title (EN or NE) and Slug are required', 400);
        }

        if (!data.author?.en && !data.author?.ne) {
            return apiError('At least one author (EN or NE) is required', 400);
        }

        // Check slug uniqueness
        const existing = await Article.findOne({ slug: data.slug });
        if (existing) {
            return apiError('Slug already exists', 409);
        }

        if (!data.status) {
            data.status = 'draft';
        }

        // Add metadata
        data.lastModifiedBy = user.userId;

        if (data.eventDate) {
            // Check if today matches event date (Day/Month match)
            const today = new Date();
            const eventDate = new Date(data.eventDate);
            if (today.getDate() === eventDate.getDate() &&
                today.getMonth() === eventDate.getMonth()) {
                data.isSpecialDay = true;
            }
        }

        const article = await Article.create(data);

        // Log activity
        await ActivityLog.create({
            adminId: user.userId,
            action: 'create',
            entityType: 'Article',
            entityId: article._id.toString(),
            description: `Created article: ${data.title?.en || data.title?.ne}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ article }, 201);

    } catch (error) {
        console.error('Create article error:', error);
        return apiError('Failed to create article', 500);
    }
}

export const GET = withAuth(getArticles);
export const POST = withAuth(createArticle);

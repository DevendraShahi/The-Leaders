import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { DailyBrief } from '@/models/ElectionContent';
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

function toLogText(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
        const localized = value as { en?: string; ne?: string };
        return localized.en || localized.ne || '';
    }
    return '';
}

// GET: List briefs with pagination and filtering
async function getBriefs(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');
        const dateRange = parseDateRange(searchParams);

        const query: any = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'title.en': { $regex: search, $options: 'i' } },
                { 'title.ne': { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { 'content.en': { $regex: search, $options: 'i' } },
                { 'content.ne': { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        if (dateRange) {
            query.date = dateRange;
        }
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const [briefsRaw, total] = await Promise.all([
            DailyBrief.find(query)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            DailyBrief.countDocuments(query)
        ]);

        const briefs = briefsRaw.map((brief: any) => ({
            ...brief,
            id: brief._id?.toString?.() || String(brief._id),
            _id: brief._id?.toString?.() || String(brief._id),
            status: brief.status || (brief.isPublished ? 'published' : 'draft'),
        }));

        return apiResponse({
            briefs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get briefs error:', error);
        return apiError('Failed to fetch briefs', 500);
    }
}

// POST: Create new brief
async function createBrief(request: NextRequest, { user }: { user: any }) {
    try {
        await dbConnect();

        const bodyParse = await parseRequestBody(request);
        if (!bodyParse.success || !bodyParse.data) {
            return apiError(bodyParse.error || 'Invalid request', 400);
        }

        const data = bodyParse.data as any;

        // Validation
        if (!data.title || !data.slug) {
            return apiError('Title and Slug are required', 400);
        }

        // Check slug uniqueness
        const existing = await DailyBrief.findOne({ slug: data.slug });
        if (existing) {
            return apiError('Slug already exists', 409);
        }

        // Add default date if missing
        if (!data.date) {
            data.date = new Date();
        }
        if (!data.status) {
            data.status = data.isPublished ? 'published' : 'draft';
        }
        data.isPublished = data.status === 'published';

        const brief = await DailyBrief.create(data);

        // Log activity
        await ActivityLog.create({
            adminId: user.userId,
            action: 'create',
            entityType: 'DailyBrief',
            entityId: brief._id.toString(),
            description: `Created brief: ${toLogText(data.title)}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ brief }, 201);

    } catch (error) {
        console.error('Create brief error:', error);
        return apiError('Failed to create brief', 500);
    }
}

export const GET = withAuth(getBriefs);
export const POST = withAuth(createBrief);

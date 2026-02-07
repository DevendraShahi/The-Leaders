import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { DailyBrief } from '@/models/ElectionContent';
import ActivityLog from '@/models/ActivityLog';
import { withAuth, apiResponse, apiError, parseRequestBody } from '@/lib/middleware';

// GET: List briefs with pagination and filtering
async function getBriefs(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        const query: any = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
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

        const brief = await DailyBrief.create(data);

        // Log activity
        await ActivityLog.create({
            adminId: user.userId,
            action: 'create',
            entityType: 'DailyBrief',
            entityId: brief._id.toString(),
            description: `Created brief: ${data.title}`,
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

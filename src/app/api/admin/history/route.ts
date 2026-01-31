import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import History from '@/models/History';
import ActivityLog from '@/models/ActivityLog';
import { withAuth, apiResponse, apiError, parseRequestBody } from '@/lib/middleware';

// GET: List history
async function getHistory(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');

        const query: any = {};

        if (search) {
            query.$or = [
                { 'title.en': { $regex: search, $options: 'i' } },
                { 'title.ne': { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const [history, total] = await Promise.all([
            History.find(query)
                .sort({ date: 1, order: 1 })
                .skip(skip)
                .limit(limit)
                .populate('lastModifiedBy', 'name email'),
            History.countDocuments(query)
        ]);

        return apiResponse({
            history,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get history error:', error);
        return apiError('Failed to fetch history', 500);
    }
}

// POST: Create new history
async function createHistory(request: NextRequest, { user }: { user: any }) {
    try {
        await dbConnect();

        const bodyParse = await parseRequestBody(request);
        if (!bodyParse.success || !bodyParse.data) {
            return apiError(bodyParse.error || 'Invalid request', 400);
        }

        const data = bodyParse.data as any;

        // Basic validation
        if ((!data.title?.en && !data.title?.ne) || !data.date) {
            return apiError('At least one title (EN or NE) and Date are required', 400);
        }

        // Add metadata
        data.lastModifiedBy = user.userId;

        const history = await History.create(data);

        // Log activity
        await ActivityLog.create({
            adminId: user.userId,
            action: 'create',
            entityType: 'History',
            entityId: history._id.toString(),
            description: `Created history: ${data.title.en}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ history }, 201);

    } catch (error) {
        console.error('Create history error:', error);
        return apiError('Failed to create history', 500);
    }
}

export const GET = withAuth(getHistory);
export const POST = withAuth(createHistory);

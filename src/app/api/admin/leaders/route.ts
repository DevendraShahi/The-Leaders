import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Leader from '@/models/Leader';
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

// GET: List leaders
async function getLeaders(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');
        const party = searchParams.get('party');
        const createdAtRange = parseDateRange(searchParams);

        const query: any = {};

        if (search) {
            query.$or = [
                { 'name.en': { $regex: search, $options: 'i' } },
                { 'name.ne': { $regex: search, $options: 'i' } },
                { 'party.en': { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            query.status = status;
        }

        if (party) {
            query['party.en'] = party;
        }

        if (createdAtRange) {
            query.createdAt = createdAtRange;
        }

        const skip = (page - 1) * limit;

        const [leaders, total] = await Promise.all([
            Leader.find(query)
                .sort({ order: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('lastModifiedBy', 'name email'),
            Leader.countDocuments(query)
        ]);

        return apiResponse({
            leaders,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get leaders error:', error);
        return apiError('Failed to fetch leaders', 500);
    }
}

// POST: Create new leader
async function createLeader(request: NextRequest, { user }: { user: any }) {
    try {
        await dbConnect();

        const bodyParse = await parseRequestBody(request);
        if (!bodyParse.success || !bodyParse.data) {
            return apiError(bodyParse.error || 'Invalid request', 400);
        }

        const data = bodyParse.data as any;

        // Basic validation
        if (!data.name?.en && !data.name?.ne) {
            return apiError('At least one name (EN or NE) is required', 400);
        }

        // Add metadata
        data.lastModifiedBy = user.userId;

        const leader = await Leader.create(data);

        // Log activity
        await ActivityLog.create({
            adminId: user.userId,
            action: 'create',
            entityType: 'Leader',
            entityId: leader._id.toString(),
            description: `Created leader: ${data.name.en}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ leader }, 201);

    } catch (error) {
        console.error('Create leader error:', error);
        return apiError('Failed to create leader', 500);
    }
}

export const GET = withAuth(getLeaders);
export const POST = withAuth(createLeader);

import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { FactCheck } from '@/models/ElectionContent';
import ActivityLog from '@/models/ActivityLog';
import { withAuth, apiResponse, apiError, parseRequestBody } from '@/lib/middleware';
import { slugify } from '@/lib/slug';

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

function normalizeSlug(value: string) {
    return slugify(value, 60);
}

function toLogText(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
        const localized = value as { en?: string; ne?: string };
        return localized.en || localized.ne || '';
    }
    return '';
}

// GET: List fact checks
async function getFactChecks(request: NextRequest) {
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
                { claim: { $regex: search, $options: 'i' } },
                { 'claim.en': { $regex: search, $options: 'i' } },
                { 'claim.ne': { $regex: search, $options: 'i' } },
                { analysis: { $regex: search, $options: 'i' } },
                { 'analysis.en': { $regex: search, $options: 'i' } },
                { 'analysis.ne': { $regex: search, $options: 'i' } },
                { claimBy: { $regex: search, $options: 'i' } },
                { 'claimBy.en': { $regex: search, $options: 'i' } },
                { 'claimBy.ne': { $regex: search, $options: 'i' } }
            ];
        }

        if (dateRange) {
            query.date = dateRange;
        }
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const [factChecksRaw, total] = await Promise.all([
            FactCheck.find(query)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            FactCheck.countDocuments(query)
        ]);

        const factChecks = factChecksRaw.map((fc: any) => ({
            ...fc,
            id: fc._id?.toString?.() || String(fc._id),
            _id: fc._id?.toString?.() || String(fc._id),
            slug: fc.slug || (toLogText(fc.claim) ? normalizeSlug(toLogText(fc.claim)) : undefined),
            status: fc.status || 'published',
        }));

        return apiResponse({
            factChecks,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        return apiError('Failed to fetch fact checks', 500);
    }
}

// POST: Create fact check
async function createFactCheck(request: NextRequest, { user }: { user: any }) {
    try {
        await dbConnect();

        const bodyParse = await parseRequestBody(request);
        if (!bodyParse.success || !bodyParse.data) {
            return apiError(bodyParse.error || 'Invalid request', 400);
        }

        const data = bodyParse.data as any;

        // Validation
        if (!data.claim || !data.verdict) {
            return apiError('Claim and Verdict are required', 400);
        }

        if (!data.date) {
            data.date = new Date();
        }
        if (!data.status) {
            data.status = 'draft';
        }
        if (!data.slug && data.claim) {
            data.slug = slugify(toLogText(data.claim), 60);
        }

        const factCheck = await FactCheck.create(data);

        await ActivityLog.create({
            adminId: user.userId,
            action: 'create',
            entityType: 'FactCheck',
            entityId: factCheck._id.toString(),
            description: `Created fact check: ${toLogText(data.claim).substring(0, 50)}...`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ factCheck }, 201);

    } catch (error) {
        return apiError('Failed to create fact check', 500);
    }
}

export const GET = withAuth(getFactChecks);
export const POST = withAuth(createFactCheck);

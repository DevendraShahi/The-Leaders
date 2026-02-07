import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { FactCheck } from '@/models/ElectionContent';
import ActivityLog from '@/models/ActivityLog';
import { withAuth, apiResponse, apiError, parseRequestBody } from '@/lib/middleware';
import { slugify } from '@/lib/slug';

function normalizeSlug(value: string) {
    return slugify(value, 60);
}

// GET: List fact checks
async function getFactChecks(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        const query: any = {};

        if (search) {
            query.$or = [
                { claim: { $regex: search, $options: 'i' } },
                { analysis: { $regex: search, $options: 'i' } },
                { claimBy: { $regex: search, $options: 'i' } }
            ];
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
            slug: fc.slug || (fc.claim ? normalizeSlug(fc.claim) : undefined),
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
        if (!data.slug && data.claim) {
            data.slug = slugify(data.claim, 60);
        }

        const factCheck = await FactCheck.create(data);

        await ActivityLog.create({
            adminId: user.userId,
            action: 'create',
            entityType: 'FactCheck',
            entityId: factCheck._id.toString(),
            description: `Created fact check: ${data.claim.substring(0, 50)}...`,
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

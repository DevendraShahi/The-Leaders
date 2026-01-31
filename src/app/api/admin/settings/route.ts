import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import ActivityLog from '@/models/ActivityLog';
import { withAuth, apiResponse, apiError, parseRequestBody } from '@/lib/middleware';

// GET: Fetch settings
async function getSettings(request: NextRequest) {
    try {
        await dbConnect();

        let settings = await Settings.findOne();

        // Return defaults if not exists, but don't create yet
        if (!settings) {
            settings = {
                siteName: { en: 'The Leaders', ne: 'द लीडर्स' },
                features: { enableComments: false, enableRegistration: false }
            } as any;
        }

        return apiResponse({ settings });

    } catch (error) {
        return apiError('Failed to fetch settings', 500);
    }
}

// PUT: Update settings
async function updateSettings(request: NextRequest, { user }: { user: any }) {
    try {
        await dbConnect();

        const bodyParse = await parseRequestBody(request);
        if (!bodyParse.success || !bodyParse.data) {
            return apiError(bodyParse.error || 'Invalid request', 400);
        }

        const data = bodyParse.data as any;

        // Upsert settings
        let settings = await Settings.findOne();

        if (settings) {
            settings = await Settings.findByIdAndUpdate(
                settings._id,
                { ...data },
                { new: true, runValidators: true }
            );
        } else {
            settings = await Settings.create(data);
        }

        // Log activity
        await ActivityLog.create({
            adminId: user.userId,
            action: 'update',
            entityType: 'Settings',
            description: 'Updated site settings',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ settings });

    } catch (error) {
        console.error('Update settings error:', error);
        return apiError('Failed to update settings', 500);
    }
}

export const GET = withAuth(getSettings);
export const PUT = withAuth(updateSettings);

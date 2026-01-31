import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Media from '@/models/Media';
import ActivityLog from '@/models/ActivityLog';
import { deleteMultipleImages } from '@/lib/cloudinary';
import { withAuth, apiResponse, apiError, parseRequestBody } from '@/lib/middleware';

// GET: List media
async function getMedia(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20'); // Bigger limit for grid
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        const query: any = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { originalFilename: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [media, total] = await Promise.all([
            Media.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('uploadedBy', 'name'),
            Media.countDocuments(query)
        ]);

        return apiResponse({
            media,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        return apiError('Failed to fetch media', 500);
    }
}

// DELETE: Bulk delete media
async function deleteMedia(request: NextRequest, { user }: { user: any }) {
    try {
        await dbConnect();

        const bodyParse = await parseRequestBody(request);
        if (!bodyParse.success || !bodyParse.data) {
            return apiError(bodyParse.error || 'Invalid request', 400);
        }

        const { ids } = bodyParse.data as { ids: string[] };

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return apiError('No media IDs provided', 400);
        }

        // Find media to get publicIds
        const mediaItems = await Media.find({ _id: { $in: ids } });

        if (mediaItems.length === 0) {
            return apiError('Media not found', 404);
        }

        const publicIds = mediaItems.map(m => m.publicId);

        // Delete from Cloudinary
        await deleteMultipleImages(publicIds);

        // Delete from DB
        await Media.deleteMany({ _id: { $in: ids } });

        // Log activity
        await ActivityLog.create({
            adminId: user.userId,
            action: 'delete',
            entityType: 'Media',
            entityId: ids.join(','), // Might strictly be too long but ok for now
            description: `Deleted ${ids.length} media items`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ message: `Successfully deleted ${ids.length} items` });

    } catch (error) {
        console.error('Delete media error:', error);
        return apiError('Failed to delete media', 500);
    }
}

export const GET = withAuth(getMedia);
export const DELETE = withAuth(deleteMedia);

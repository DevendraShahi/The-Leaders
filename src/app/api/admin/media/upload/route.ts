import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Media from '@/models/Media';
import ActivityLog from '@/models/ActivityLog';
import { uploadImage, MediaCategory } from '@/lib/cloudinary';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';

async function uploadMedia(request: NextRequest, { user }: { user: any }) {
    try {
        await dbConnect();

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const category = (formData.get('category') as MediaCategory) || 'general';
        const altTextEn = formData.get('altTextEn') as string;
        const altTextNe = formData.get('altTextNe') as string;
        const tagsStr = formData.get('tags') as string;

        if (!file) {
            return apiError('No file provided', 400);
        }

        // Convert file to array buffer for upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary
        const uploadResult = await uploadImage(buffer, category, file.name.split('.')[0]);

        // Save to Database
        const media = await Media.create({
            publicId: uploadResult.publicId,
            secureUrl: uploadResult.secureUrl,
            originalFilename: file.name,
            format: uploadResult.format,
            size: uploadResult.bytes,
            width: uploadResult.width,
            height: uploadResult.height,
            category,
            tags: tagsStr ? tagsStr.split(',').map(t => t.trim()) : [],
            altText: {
                en: altTextEn || '',
                ne: altTextNe || ''
            },
            uploadedBy: user.userId
        });

        // Log activity
        await ActivityLog.create({
            adminId: user.userId,
            action: 'create',
            entityType: 'Media',
            entityId: media._id.toString(),
            description: `Uploaded media: ${file.name}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        return apiResponse({ media }, 201);

    } catch (error) {
        console.error('Media upload error:', error);
        return apiError('Failed to upload media', 500);
    }
}

export const POST = withAuth(uploadMedia);

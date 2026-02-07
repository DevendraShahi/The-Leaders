import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type MediaCategory = 'article' | 'leader' | 'history' | 'general';

/**
 * Get the folder path for a media category
 */
export function getFolderPath(category: MediaCategory): string {
    const folderMap: Record<MediaCategory, string> = {
        article: 'the-leaders/articles',
        leader: 'the-leaders/leaders',
        history: 'the-leaders/history',
        general: 'the-leaders/general',
    };
    return folderMap[category];
}

/**
 * Upload image to Cloudinary
 * @param file - File buffer or base64 string
 * @param category - Media category for organization
 * @param filename - Optional custom filename
 * @returns Upload result with public_id and secure_url
 */
export async function uploadImage(
    file: string | Buffer,
    category: MediaCategory = 'general',
    filename?: string,
    mimeType?: string
) {
    try {
        const folder = getFolderPath(category);

        const uploadOptions: any = {
            folder,
            resource_type: 'image',
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
            ],
        };

        if (filename) {
            // Add timestamp to ensure uniqueness
            const timestamp = Date.now();
            uploadOptions.public_id = `${filename}-${timestamp}`;
        }

        const payload =
            typeof file === 'string'
                ? file
                : `data:${mimeType || 'image/jpeg'};base64,${file.toString('base64')}`;

        const result = await cloudinary.uploader.upload(payload, uploadOptions);

        return {
            publicId: result.public_id,
            secureUrl: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
}

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 * @returns Deletion result
 */
export async function deleteImage(publicId: string) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete image from Cloudinary');
    }
}

/**
 * Delete multiple images from Cloudinary
 * @param publicIds - Array of Cloudinary public IDs
 * @returns Deletion results
 */
export async function deleteMultipleImages(publicIds: string[]) {
    try {
        const result = await cloudinary.api.delete_resources(publicIds);
        return result;
    } catch (error) {
        console.error('Cloudinary bulk delete error:', error);
        throw new Error('Failed to delete images from Cloudinary');
    }
}

/**
 * Get optimized image URL with transformations
 * @param publicId - Cloudinary public ID
 * @param width - Target width
 * @param height - Target height
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
    publicId: string,
    width?: number,
    height?: number
): string {
    const transformations: any = {
        quality: 'auto:good',
        fetch_format: 'auto',
    };

    if (width) transformations.width = width;
    if (height) transformations.height = height;
    if (width && height) transformations.crop = 'fill';

    return cloudinary.url(publicId, transformations);
}

export default cloudinary;

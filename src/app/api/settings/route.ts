import { NextResponse } from 'next/server';
export const revalidate = 3600;
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import { unstable_cache } from 'next/cache';

const getCachedPublicSettings = unstable_cache(
    async () => {
        await dbConnect();
        return Settings.findOne({}, 'tickerHeadlines siteName siteDescription socialLinks').lean();
    },
    ['public-settings'],
    { tags: ['settings'] }
);

export async function GET() {
    try {
        const settings = await getCachedPublicSettings();

        return NextResponse.json({
            success: true,
            data: settings || { tickerHeadlines: [] }
        }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400" } });
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
    }
}

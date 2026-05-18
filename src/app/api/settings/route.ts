import { NextResponse } from 'next/server';
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
        });
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
    }
}

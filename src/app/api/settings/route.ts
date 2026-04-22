import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

// export const revalidate = false; // API caches indefinitely until on-demand revalidation

export async function GET() {
    try {
        await dbConnect();

        const settings = await Settings.findOne({}, 'tickerHeadlines siteName siteDescription socialLinks').lean();

        return NextResponse.json({
            success: true,
            data: settings || { tickerHeadlines: [] }
        });
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
    }
}

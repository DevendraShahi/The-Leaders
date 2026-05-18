import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import { unstable_cache } from 'next/cache';

const getCachedMaintenanceStatus = unstable_cache(
    async () => {
        await dbConnect();
        const settings = await Settings.findOne().select('maintenance').lean();
        return settings?.maintenance || null;
    },
    ['maintenance-status'],
    { tags: ['settings'] }
);

export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            data: await getCachedMaintenanceStatus()
        });
    } catch (error) {
        console.error("Failed to load maintenance status:", error);
        return NextResponse.json({
            success: true,
            data: null,
            degraded: true
        });
    }
}

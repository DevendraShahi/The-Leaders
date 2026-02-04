import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        noStore();
        await dbConnect();
        const settings = await Settings.findOne().select('maintenance').lean();
        return NextResponse.json({
            success: true,
            data: settings?.maintenance || null
        });
    } catch (error) {
        return NextResponse.json({ success: false, data: null }, { status: 500 });
    }
}

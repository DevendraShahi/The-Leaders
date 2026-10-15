import { NextResponse } from 'next/server';
import { getMobileAdmin, mobileAuthHeaders, mobileAuthResponse } from '@/lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const admin = await getMobileAdmin(request);
        if (!admin) return mobileAuthResponse(request, { error: 'Your session has expired. Please sign in again.' }, 401);
        return mobileAuthResponse(request, { isAdmin: true, studioScope: String(admin._id), profile: { name: admin.name ?? admin.username, role: admin.role } });
    } catch { return mobileAuthResponse(request, { error: 'Unable to verify admin access. Please try again.' }, 503); }
}
export function OPTIONS(request: Request) {
    return new NextResponse(null, { status: 204, headers: mobileAuthHeaders(request) });
}

import { NextResponse } from 'next/server';
import { dailyReviewPatch, editionStatus, reviewChanges } from '@/lib/daily-social-review';
import { getMobileAdmin, mobileAuthHeaders, mobileAuthResponse } from '@/lib/mobile-auth';
import DailySocialEdition from '@/models/DailySocialEdition';
export async function GET(request: Request) {
    try {
        if (!await getMobileAdmin(request)) return mobileAuthResponse(request, { error: 'Admin sign in required.' }, 401);
        const editions = await DailySocialEdition.find().sort({ date: -1, edition: 1 }).limit(14).lean();
        return mobileAuthResponse(request, { editions: editions.map(item => ({ ...item, status: editionStatus(item.status), id: String(item._id), _id: undefined, reviewedBy: undefined, __v: undefined })) });
    } catch { return mobileAuthResponse(request, { error: 'Daily social drafts could not be loaded.' }, 503); }
}
export async function PATCH(request: Request) {
    try {
        const admin = await getMobileAdmin(request);
        if (!admin) return mobileAuthResponse(request, { error: 'Admin sign in required.' }, 401);
        let body: unknown;
        try { body = await request.json(); } catch { return mobileAuthResponse(request, { error: 'Request body must be valid JSON.' }, 400); }
        const input = dailyReviewPatch.safeParse(body);
        if (!input.success) return mobileAuthResponse(request, { error: 'Invalid edition changes.' }, 400);
        const current = await DailySocialEdition.findById(input.data.id).lean();
        if (!current) return mobileAuthResponse(request, { error: 'Edition unavailable.' }, 404);
        if (new Date(current.updatedAt).toISOString() !== input.data.updatedAt) return mobileAuthResponse(request, { error: 'This edition changed. Reload it before saving.' }, 409);
        let changes;
        try { changes = reviewChanges(current, input.data, String(admin._id)); }
        catch (failure) { return mobileAuthResponse(request, { error: failure instanceof Error ? failure.message : 'Invalid review transition.' }, 409); }
        if (!changes) return mobileAuthResponse(request, { success: true, unchanged: true });
        const item = await DailySocialEdition.findOneAndUpdate({ _id: input.data.id, updatedAt: new Date(input.data.updatedAt) }, { $set: changes }, { runValidators: true });
        if (!item) return mobileAuthResponse(request, { error: 'Another editor changed this edition. Reload it before saving.' }, 409);
        return mobileAuthResponse(request, item ? { success: true } : { error: 'Edition unavailable.' }, item ? 200 : 404);
    } catch { return mobileAuthResponse(request, { error: 'The review status could not be saved.' }, 503); }
}
export function OPTIONS(request: Request) { return new NextResponse(null, { status: 204, headers: mobileAuthHeaders(request) }); }

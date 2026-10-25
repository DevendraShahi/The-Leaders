import { NextRequest, NextResponse } from 'next/server';
import { withPageAccess } from '@/lib/middleware';
import { dailyReviewPatch, editionStatus, reviewChanges } from '@/lib/daily-social-review';
import { hasSocialPostPermission } from '@/lib/social-access';
import DailySocialEdition from '@/models/DailySocialEdition';

// Web cookies are verified by withPageAccess; native bearer routes remain separate.
export const GET = withPageAccess('content', async () => {
    try {
        const editions = await DailySocialEdition.find().sort({ date: -1, edition: 1 }).limit(14).lean();
        return NextResponse.json({ editions: editions.map(item => ({ ...item, status: editionStatus(item.status), id: String(item._id), _id: undefined, reviewedBy: undefined, __v: undefined })) });
    } catch { return NextResponse.json({ error: 'Daily social drafts could not be loaded.' }, { status: 503 }); }
});

export const PATCH = withPageAccess('content', async (request: NextRequest, { user }) => {
    try {
        let body: unknown;
        try { body = await request.json(); } catch { return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 }); }
        const input = dailyReviewPatch.safeParse(body);
        if (!input.success) return NextResponse.json({ error: 'Invalid edition changes.' }, { status: 400 });
        const permission = input.data.caption ? 'edit' : input.data.status === 'ready' ? 'approve' : 'submit';
        if (!hasSocialPostPermission(user, permission)) return NextResponse.json({ error: 'You do not have permission to make this change.' }, { status: 403 });
        const current = await DailySocialEdition.findById(input.data.id).lean();
        if (!current) return NextResponse.json({ error: 'Edition unavailable.' }, { status: 404 });
        if (new Date(current.updatedAt).toISOString() !== input.data.updatedAt) return NextResponse.json({ error: 'This edition changed. Reload it before saving.' }, { status: 409 });
        let changes;
        try { changes = reviewChanges(current, input.data, user.userId); }
        catch (failure) { return NextResponse.json({ error: failure instanceof Error ? failure.message : 'Invalid review transition.' }, { status: 409 }); }
        if (!changes) return NextResponse.json({ success: true, unchanged: true });
        const item = await DailySocialEdition.findOneAndUpdate({ _id: input.data.id, updatedAt: new Date(input.data.updatedAt) }, { $set: changes }, { runValidators: true });
        return NextResponse.json(item ? { success: true } : { error: 'Another editor changed this edition. Reload it before saving.' }, { status: item ? 200 : 409 });
    } catch { return NextResponse.json({ error: 'The review changes could not be saved.' }, { status: 503 }); }
});

import { timingSafeEqual } from 'node:crypto';
import dbConnect from '@/lib/db';
import DailySocialEdition from '@/models/DailySocialEdition';
import { dailySocialInput, dueEdition, nepalDay } from '@/lib/daily-social';
import { mobileAuthResponse } from '@/lib/mobile-auth';
function authorized(request: Request) {
    const secret = process.env.STUDIO_ATTENTION_AUTOMATION_SECRET;
    const token = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? '';
    return Boolean(secret && Buffer.byteLength(secret) === Buffer.byteLength(token) && timingSafeEqual(Buffer.from(secret), Buffer.from(token)));
}
export async function GET(request: Request) {
    if (!authorized(request)) return mobileAuthResponse(request, { error: 'Unauthorized' }, 401);
    try {
        const date = nepalDay(); const edition = dueEdition();
        if (!edition) return mobileAuthResponse(request, { due: false, date, timezone: 'Asia/Kathmandu' });
        await dbConnect();
        const exists = Boolean(await DailySocialEdition.exists({ date, edition }));
        return mobileAuthResponse(request, { due: !exists, date, edition, timezone: 'Asia/Kathmandu', exists });
    } catch { return mobileAuthResponse(request, { error: 'Schedule check failed.' }, 503); }
}
export async function POST(request: Request) {
    if (!authorized(request)) return mobileAuthResponse(request, { error: 'Unauthorized' }, 401);
    let body: unknown;
    try { body = await request.json(); }
    catch { return mobileAuthResponse(request, { error: 'Request body must be valid JSON.' }, 400); }
    try {
        const input = dailySocialInput.safeParse(body);
        if (!input.success) return mobileAuthResponse(request, { error: 'Unsupported daily edition', details: input.error.flatten() }, 400);
        if (input.data.edition !== dueEdition()) return mobileAuthResponse(request, { error: 'Prepare the edition in its Nepal-time schedule window.' }, 409);
        await dbConnect();
        // A daily slot is immutable to automation after creation; it cannot
        // rewrite an admin's reviewed content or regenerate duplicate drafts.
        const result = await DailySocialEdition.updateOne({ date: input.data.date, edition: input.data.edition }, { $setOnInsert: { ...input.data, status: 'draft' } }, { upsert: true });
        return mobileAuthResponse(request, { created: Boolean(result.upsertedCount), date: input.data.date, edition: input.data.edition });
    } catch { return mobileAuthResponse(request, { error: 'Daily edition could not be saved.' }, 503); }
}

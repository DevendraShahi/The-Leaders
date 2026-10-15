import { z } from 'zod';
const caption = z.object({ en: z.string().trim().min(1).max(1800), ne: z.string().trim().min(1).max(1800) }).strict();
export const dailyReviewPatch = z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i), updatedAt: z.string().datetime(),
    status: z.enum(['draft', 'in_review', 'ready']).optional(), caption: caption.optional(),
}).strict().refine(value => Boolean(value.status) !== Boolean(value.caption), 'Change either captions or status in one request.');
export function editionStatus(status: string): 'draft' | 'in_review' | 'ready' {
    return status === 'reviewed' || status === 'ready' ? 'ready' : status === 'in_review' ? 'in_review' : 'draft';
}
export function reviewChanges(current: { status: string; caption: { en: string; ne: string } }, patch: z.infer<typeof dailyReviewPatch>, adminId: string, now = new Date()) {
    const status = editionStatus(current.status);
    if (patch.caption) {
        if (patch.caption.en === current.caption.en && patch.caption.ne === current.caption.ne) return null;
        return { caption: patch.caption, status: 'draft', reviewedBy: null, reviewedAt: null,
            ...(status !== 'draft' ? { reviewInvalidatedAt: now } : {}) };
    }
    if (patch.status === status) return null;
    if (patch.status === 'ready' && status !== 'in_review') throw new Error('Send this edition to review before marking it ready.');
    return { status: patch.status, reviewedBy: patch.status === 'ready' ? adminId : null, reviewedAt: patch.status === 'ready' ? now : null,
        ...(patch.status === 'ready' ? { reviewInvalidatedAt: null } : {}) };
}

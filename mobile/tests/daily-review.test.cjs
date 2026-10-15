const { test } = require('node:test');
const assert = require('node:assert/strict');
const loader = require('./load-ts.cjs');
const rules = loader()('../src/lib/daily-social-review.ts');
const id = 'a'.repeat(24), updatedAt = '2026-10-14T04:00:00.000Z';
const caption = { en: 'Verified English copy', ne: 'प्रमाणित नेपाली सामग्री' };
test('review requires both languages and a version, and forbids ambiguous edits', () => {
    assert.equal(rules.dailyReviewPatch.safeParse({ id, updatedAt, caption }).success, true);
    assert.equal(rules.dailyReviewPatch.safeParse({ id, caption }).success, false);
    assert.equal(rules.dailyReviewPatch.safeParse({ id, updatedAt, caption: { en: 'Only English' } }).success, false);
    assert.equal(rules.dailyReviewPatch.safeParse({ id, updatedAt, caption, status: 'ready' }).success, false);
});
test('changed copy invalidates approval; identical copy preserves it', () => {
    const current = { status: 'ready', caption };
    assert.equal(rules.reviewChanges(current, { id, updatedAt, caption }, 'admin'), null);
    const patch = rules.reviewChanges(current, { id, updatedAt, caption: { ...caption, en: 'Corrected English' } }, 'admin');
    assert.equal(patch.status, 'draft'); assert.equal(patch.reviewedBy, null); assert.equal(patch.reviewedAt, null);
    assert.ok(patch.reviewInvalidatedAt instanceof Date);
    assert.throws(() => rules.reviewChanges({ status: 'draft', caption }, { id, updatedAt, status: 'ready' }, 'admin'));
    assert.equal(rules.reviewChanges({ status: 'in_review', caption }, { id, updatedAt, status: 'ready' }, 'admin').reviewedBy, 'admin');
    assert.equal(rules.editionStatus('reviewed'), 'ready');
});
test('admin API fails closed, rejects stale saves, and uses an atomic version filter', async () => {
    let authenticated = false, patch, filter, conflict = false;
    const route = loader({
        '@/lib/daily-social-review': rules,
        'next/server': { NextResponse: Response },
        '@/lib/mobile-auth': { getMobileAdmin: async () => authenticated ? { _id: 'admin' } : null, mobileAuthHeaders: () => ({}), mobileAuthResponse: (_request, data, status = 200) => Response.json(data, { status }) },
        '@/models/DailySocialEdition': { findById: () => ({ lean: async () => ({ status: 'ready', caption, updatedAt: new Date(updatedAt) }) }), findOneAndUpdate: async (f, p) => { filter = f; patch = p; return conflict ? null : { _id: id }; } },
    })('../src/app/api/v1/auth/daily-social/route.ts');
    const request = body => new Request('https://example.test', { method: 'PATCH', body: JSON.stringify(body) });
    assert.equal((await route.PATCH(request({ id, updatedAt, status: 'draft' }))).status, 401);
    authenticated = true;
    assert.equal((await route.PATCH(request({ id, updatedAt: '2026-10-14T03:00:00.000Z', status: 'draft' }))).status, 409);
    assert.equal(patch, undefined);
    assert.equal((await route.PATCH(request({ id, updatedAt, caption: { ...caption, en: 'A correction' } }))).status, 200);
    assert.equal(filter.updatedAt.toISOString(), updatedAt); assert.equal(filter._id, id);
    assert.equal(patch.$set.status, 'draft');
    conflict = true;
    assert.equal((await route.PATCH(request({ id, updatedAt, status: 'draft' }))).status, 409);
});

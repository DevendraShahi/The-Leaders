import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ admin: vi.fn(), list: vi.fn(), find: vi.fn(), update: vi.fn() }));
vi.mock('@/lib/website-auth', () => ({ getWebsiteAdmin: mocks.admin }));
vi.mock('@/models/DailySocialEdition', () => ({ default: {
    find: () => ({ sort: () => ({ limit: () => ({ lean: mocks.list }) }) }),
    findById: () => ({ lean: mocks.find }), findOneAndUpdate: mocks.update,
} }));
import { NextRequest } from 'next/server';
import { GET, PATCH } from '@/app/api/admin/studio/editions/route';
const id = 'a'.repeat(24), updatedAt = '2026-10-25T00:00:00.000Z';
const request = (body?: object) => new NextRequest('https://example.com/api/admin/studio/editions', { method: body ? 'PATCH' : 'GET', headers: { origin: 'https://example.com', 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
beforeEach(() => { vi.resetAllMocks(); mocks.admin.mockResolvedValue({ _id: id, role: 'superadmin', permissions: {} }); });
it('rejects signed-out and content-restricted admins without querying editions', async () => {
    mocks.admin.mockResolvedValueOnce(null);
    expect((await GET(request())).status).toBe(401);
    mocks.admin.mockResolvedValueOnce({ _id: id, role: 'editorial', permissions: { pageAccess: { content: false } } });
    expect((await GET(request())).status).toBe(403);
    expect(mocks.list).not.toHaveBeenCalled();
});
it('returns private uncacheable editions without exposing reviewer identity', async () => {
    mocks.list.mockResolvedValue([{ _id: id, status: 'reviewed', reviewedBy: 'private-id' }]);
    const response = await GET(request());
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect((await response.json()).editions).toEqual([{ id, status: 'ready' }]);
});
it('requires approval permission before marking an edition ready', async () => {
    mocks.admin.mockResolvedValue({ _id: id, role: 'editorial', permissions: { pageAccess: { content: true }, socialPosts: { edit: true, approve: false } } });
    expect((await PATCH(request({ id, updatedAt, status: 'ready' }))).status).toBe(403);
    expect(mocks.find).not.toHaveBeenCalled(); expect(mocks.update).not.toHaveBeenCalled();
});
it('rejects stale captions without overwriting the current version', async () => {
    mocks.find.mockResolvedValue({ updatedAt: '2026-10-25T01:00:00.000Z' });
    expect((await PATCH(request({ id, updatedAt, caption: { en: 'Updated', ne: 'समाचार' } }))).status).toBe(409);
    expect(mocks.update).not.toHaveBeenCalled();
});
it('returns changed ready captions to draft through an optimistic update', async () => {
    mocks.find.mockResolvedValue({ updatedAt, status: 'ready', caption: { en: 'Old', ne: 'पुरानो' } });
    mocks.update.mockResolvedValue({ _id: id });
    const response = await PATCH(request({ id, updatedAt, caption: { en: 'Updated', ne: 'समाचार' } }));
    expect(response.status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith({ _id: id, updatedAt: new Date(updatedAt) }, { $set: expect.objectContaining({ status: 'draft', reviewedBy: null, reviewedAt: null }) }, { runValidators: true });
});

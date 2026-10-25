import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse, type NextFetchEvent } from 'next/server';
const mocks = vi.hoisted(() => ({ configured: vi.fn(), middleware: vi.fn() }));
vi.mock('@/lib/clerk-config', () => ({ isClerkConfigured: mocks.configured }));
vi.mock('@clerk/nextjs/server', () => ({ clerkMiddleware: () => mocks.middleware }));
import proxy from '@/proxy';
const event = {} as NextFetchEvent;
beforeEach(() => { vi.clearAllMocks(); mocks.configured.mockReturnValue(true); mocks.middleware.mockResolvedValue(new NextResponse(null, { status: 203 })); });
it('does not execute Clerk middleware when keys are unavailable', async () => {
    mocks.configured.mockReturnValue(false);
    expect((await proxy(new NextRequest('https://example.com/admin'), event))?.status).toBe(200);
    expect(mocks.middleware).not.toHaveBeenCalled();
});
it.each(['/api/auth/login', '/api/auth/logout', '/api/auth/login/'])('keeps %s independent of Clerk', async path => {
    expect((await proxy(new NextRequest(`https://example.com${path}`), event))?.status).toBe(200);
    expect(mocks.middleware).not.toHaveBeenCalled();
});
it('leaves native bearer verification to the existing API authorization layer', async () => {
    await proxy(new NextRequest('https://example.com/api/admin/articles', { headers: { authorization: 'Bearer native-session' } }), event);
    expect(mocks.middleware).not.toHaveBeenCalled();
});
it('still executes configured Clerk authentication for browser admin requests', async () => {
    const request = new NextRequest('https://example.com/api/auth/me');
    expect((await proxy(request, event))?.status).toBe(203);
    expect(mocks.middleware).toHaveBeenCalledWith(request, event);
});

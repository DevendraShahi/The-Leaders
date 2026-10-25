import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
    mobileAdmin: vi.fn(), auth: vi.fn(), currentUser: vi.fn(),
    connect: vi.fn(), findOne: vi.fn(), link: vi.fn(), passwordLogin: vi.fn(),
}));
vi.mock('@/app/api/v1/auth/login/route', () => ({ POST: mocks.passwordLogin }));
vi.mock('@clerk/nextjs/server', () => ({ auth: mocks.auth, currentUser: mocks.currentUser }));
vi.mock('@/lib/db', () => ({ default: mocks.connect }));
vi.mock('@/models/Admin', () => ({ default: { findOne: mocks.findOne, findOneAndUpdate: mocks.link } }));
vi.mock('@/lib/mobile-auth', () => ({ getMobileAdmin: mocks.mobileAdmin }));

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { getWebsiteAdmin } from '@/lib/website-auth';
import { POST as login } from '@/app/api/auth/login/route';
import { POST as logout } from '@/app/api/auth/logout/route';
const origin = 'https://news.example.com';
afterEach(() => vi.unstubAllEnvs());
const admin = { _id: 'admin-1', email: 'editor@example.com', role: 'editorial', permissions: {}, isActive: true };
const request = (method = 'GET', source: string | undefined = origin) => {
    const headers = new Headers();
    if (source) headers.set('origin', source);
    return new Request(`${origin}/api/admin/articles`, { method, headers });
};
beforeEach(() => {
    vi.resetAllMocks();
    mocks.auth.mockResolvedValue({ userId: 'user_clerk' });
    mocks.findOne.mockResolvedValue(null);
    mocks.link.mockResolvedValue(null);
    mocks.currentUser.mockResolvedValue({
        id: 'user_clerk', primaryEmailAddressId: 'email_primary',
        emailAddresses: [{ id: 'email_primary', emailAddress: 'Editor@Example.com', verification: { status: 'verified' } }],
    });
});

describe('Clerk website authorization boundary', () => {
    it('rejects an invalid password cookie when Clerk is also signed out', async () => {
        mocks.auth.mockResolvedValue({ userId: null });
        const legacy = new Request(`${origin}/api/admin/articles`, { headers: { cookie: 'leaders_admin_session=old-password-session' } });
        expect(await getWebsiteAdmin(legacy)).toBeNull();
        expect(mocks.connect).not.toHaveBeenCalled();
        expect(mocks.mobileAdmin).toHaveBeenCalled();
    });
    it('accepts a linked active admin and preserves database permissions', async () => {
        mocks.findOne.mockResolvedValue(admin);
        expect(await getWebsiteAdmin(request())).toEqual(admin);
        expect(mocks.findOne).toHaveBeenCalledWith({ clerkId: 'user_clerk' });
        expect(mocks.currentUser).not.toHaveBeenCalled();
    });
    it('denies a disabled linked admin without attempting email linking', async () => {
        mocks.findOne.mockResolvedValue({ ...admin, isActive: false });
        expect(await getWebsiteAdmin(request())).toBeNull();
        expect(mocks.currentUser).not.toHaveBeenCalled();
        expect(mocks.link).not.toHaveBeenCalled();
    });
    it('atomically links only an existing active admin with the verified primary email', async () => {
        mocks.link.mockResolvedValue(admin);
        expect(await getWebsiteAdmin(request())).toEqual(admin);
        expect(mocks.link).toHaveBeenCalledWith({
            email: 'editor@example.com', isActive: true,
            $or: [{ clerkId: { $exists: false } }, { clerkId: null }, { clerkId: 'user_clerk' }],
        }, { $set: { clerkId: 'user_clerk' } }, { new: true });
    });
    it('grants no admin access to a Clerk account without a matching active admin', async () => {
        expect(await getWebsiteAdmin(request())).toBeNull();
    });
    it.each(['unverified', undefined])('does not link a primary email with verification %s', async status => {
        mocks.currentUser.mockResolvedValue({
            id: 'user_clerk', primaryEmailAddressId: 'primary',
            emailAddresses: [{ id: 'primary', emailAddress: 'editor@example.com', verification: { status } }],
        });
        expect(await getWebsiteAdmin(request())).toBeNull();
        expect(mocks.link).not.toHaveBeenCalled();
    });
    it('does not link using a verified secondary email when the primary is unverified', async () => {
        mocks.currentUser.mockResolvedValue({
            id: 'user_clerk', primaryEmailAddressId: 'primary',
            emailAddresses: [
                { id: 'primary', emailAddress: 'other@example.com', verification: { status: 'unverified' } },
                { id: 'secondary', emailAddress: 'editor@example.com', verification: { status: 'verified' } },
            ],
        });
        expect(await getWebsiteAdmin(request())).toBeNull();
        expect(mocks.link).not.toHaveBeenCalled();
    });
    it('rejects a mismatched current Clerk identity before account linking', async () => {
        mocks.currentUser.mockResolvedValue({ id: 'user_other' });
        expect(await getWebsiteAdmin(request())).toBeNull();
        expect(mocks.link).not.toHaveBeenCalled();
    });
    it.each(['', 'https://attacker.example.com'])('rejects browser writes from %s before checking Clerk', async source => {
        expect(await getWebsiteAdmin(request('POST', source))).toBeNull();
        expect(mocks.auth).not.toHaveBeenCalled();
        expect(mocks.connect).not.toHaveBeenCalled();
    });
    it('accepts same-origin browser writes after verifying the current admin', async () => {
        mocks.findOne.mockResolvedValue(admin);
        expect(await getWebsiteAdmin(request('POST'))).toEqual(admin);
    });
    it('keeps native bearer sessions separate from Clerk and browser CSRF checks', async () => {
        mocks.mobileAdmin.mockResolvedValue(admin);
        const native = new Request(`${origin}/api/admin/articles`, {
            method: 'POST', headers: { authorization: 'Bearer native-session' },
        });
        expect(await getWebsiteAdmin(native)).toEqual(admin);
        expect(mocks.mobileAdmin).toHaveBeenCalledWith(native);
        expect(mocks.auth).not.toHaveBeenCalled();
    });
    it('never falls back to a browser identity for an invalid explicit bearer', async () => {
        mocks.mobileAdmin.mockResolvedValue(null);
        expect(await getWebsiteAdmin(new Request(`${origin}/api/admin/articles`, {
            headers: { authorization: 'Bearer invalid' },
        }))).toBeNull();
        expect(mocks.auth).not.toHaveBeenCalled();
    });
    it('marks accepted and rejected authenticated API responses private and uncacheable', async () => {
        const handler = withAuth(async () => NextResponse.json({ success: true }));
        mocks.auth.mockResolvedValue({ userId: null });
        const rejected = await handler(new NextRequest(`${origin}/api/admin/articles`));
        expect(rejected.status).toBe(401);
        expect(rejected.headers.get('cache-control')).toBe('private, no-store');
        mocks.auth.mockResolvedValue({ userId: 'user_clerk' });
        mocks.findOne.mockResolvedValue(admin);
        const accepted = await handler(new NextRequest(`${origin}/api/admin/articles`));
        expect(accepted.status).toBe(200);
        expect(accepted.headers.get('cache-control')).toBe('private, no-store');
    });
    it('fails closed with an uncacheable 503 when the admin database is unavailable', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        mocks.connect.mockRejectedValue(new Error('database unavailable'));
        const handler = withAuth(async () => NextResponse.json({ success: true }));
        const response = await handler(new NextRequest(`${origin}/api/admin/articles`));
        expect(response.status).toBe(503);
        expect(response.headers.get('cache-control')).toBe('private, no-store');
        consoleError.mockRestore();
    });
    it('accepts a valid password cookie before Clerk, even when Clerk is unavailable', async () => {
        mocks.mobileAdmin.mockResolvedValue(admin);
        mocks.auth.mockRejectedValue(new Error('Clerk unavailable'));
        const legacy = new Request(`${origin}/api/admin/articles`, { headers: { cookie: 'other=value; leaders_admin_session=database-session' } });
        expect(await getWebsiteAdmin(legacy)).toEqual(admin);
        expect(mocks.mobileAdmin.mock.calls[0][0].headers.get('authorization')).toBe('Bearer database-session');
        expect(mocks.auth).not.toHaveBeenCalled();
    });
    it('falls back to Clerk when a password cookie has expired', async () => {
        mocks.mobileAdmin.mockResolvedValue(null);
        mocks.findOne.mockResolvedValue(admin);
        const legacy = new Request(`${origin}/api/admin/articles`, { headers: { cookie: 'leaders_admin_session=expired' } });
        expect(await getWebsiteAdmin(legacy)).toEqual(admin);
        expect(mocks.auth).toHaveBeenCalled();
    });
    it.each(['', 'https://attacker.example.com'])('rejects password cookie writes from %s', async source => {
        const headers = new Headers({ cookie: 'leaders_admin_session=database-session' });
        if (source) headers.set('origin', source);
        expect(await getWebsiteAdmin(new Request(`${origin}/api/admin/articles`, { method: 'POST', headers }))).toBeNull();
        expect(mocks.mobileAdmin).not.toHaveBeenCalled();
    });
    it('puts a successful password session in an HttpOnly cookie without exposing its token in JSON', async () => {
        mocks.passwordLogin.mockResolvedValue(Response.json({ token: 'private-session' }));
        const response = await login(new Request(`${origin}/api/auth/login`, { method: 'POST', headers: { origin } }));
        expect(await response.json()).toEqual({ success: true });
        expect(response.headers.get('set-cookie')).toContain('HttpOnly');
        expect(response.headers.get('set-cookie')).toContain('SameSite=strict');
        expect(response.headers.get('set-cookie')).toContain('Max-Age=43200');
        expect(response.headers.get('cache-control')).toBe('private, no-store');
    });
    it('uses Secure cookies for production password login and logout', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        mocks.passwordLogin.mockResolvedValue(Response.json({ token: 'private-session' }));
        for (const handler of [login, logout]) {
            const response = await handler(new Request(`${origin}/api/auth/login`, { method: 'POST', headers: { origin } }));
            expect(response.headers.get('set-cookie')).toContain('Secure');
        }
    });
    it.each([401, 403, 429, 503])('never issues a cookie for password backend status %s', async status => {
        mocks.passwordLogin.mockResolvedValue(Response.json({ error: 'Sign-in failed' }, { status }));
        const response = await login(new Request(`${origin}/api/auth/login`, { method: 'POST', headers: { origin } }));
        expect(response.status).toBe(status);
        expect(response.headers.get('set-cookie')).toBeNull();
    });
    it('requires same-origin login/logout and clears the password cookie', async () => {
        const external = () => new Request(`${origin}/api/auth/login`, { method: 'POST', headers: { origin: 'https://attacker.example.com' } });
        expect((await login(external())).status).toBe(403);
        expect((await logout(external())).status).toBe(403);
        expect(mocks.passwordLogin).not.toHaveBeenCalled();
        const response = await logout(new Request(`${origin}/api/auth/logout`, { method: 'POST', headers: { origin } }));
        expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
    });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ admin: vi.fn(), login: vi.fn() }));
vi.mock('@/lib/mobile-auth', () => ({ getMobileAdmin: mocks.admin }));
vi.mock('@/app/api/v1/auth/login/route', () => ({ POST: mocks.login }));
import { getWebsiteAdmin, websiteSessionCookie } from '@/lib/website-auth';
import { POST as login } from '@/app/api/auth/login/route';
import { POST as logout } from '@/app/api/auth/logout/route';
const origin = 'https://news.example.com';
beforeEach(() => vi.clearAllMocks());
describe('website password session boundary', () => {
    it('uses the same current-admin verifier as native login for bearer requests', async () => {
        mocks.admin.mockResolvedValue({ role: 'editorial' });
        const request = new Request(`${origin}/api/admin/articles`, { headers: { authorization: 'Bearer native-session' } });
        expect(await getWebsiteAdmin(request)).toEqual({ role: 'editorial' });
        expect(mocks.admin).toHaveBeenCalledWith(request);
    });
    it('accepts the HttpOnly cookie for reads and same-origin writes', async () => {
        mocks.admin.mockImplementation(async request => ({ authorization: request.headers.get('authorization') }));
        const headers = { cookie: `${websiteSessionCookie}=test-session`, origin };
        expect(await getWebsiteAdmin(new Request(`${origin}/api/admin/articles`, { headers }))).toEqual({ authorization: 'Bearer test-session' });
        expect(await getWebsiteAdmin(new Request(`${origin}/api/admin/articles`, { method: 'POST', headers }))).toEqual({ authorization: 'Bearer test-session' });
    });
    it.each([undefined, 'https://attacker.example.com'])('rejects cookie writes from %s before session verification', async source => {
        const headers = new Headers({ cookie: `${websiteSessionCookie}=test-session` });
        if (source) headers.set('origin', source);
        expect(await getWebsiteAdmin(new Request(`${origin}/api/admin/articles`, { method: 'POST', headers }))).toBeNull();
        expect(mocks.admin).not.toHaveBeenCalled();
    });
    it('puts a successful password session in an HttpOnly cookie without exposing its token in JSON', async () => {
        mocks.login.mockResolvedValue(Response.json({ token: 'private-session' }));
        const response = await login(new Request(`${origin}/api/auth/login`, { method: 'POST', headers: { origin } }));
        expect(await response.json()).toEqual({ success: true });
        expect(response.headers.get('set-cookie')).toContain('HttpOnly');
        expect(response.headers.get('set-cookie')).toContain('SameSite=strict');
        expect(response.headers.get('cache-control')).toBe('private, no-store');
    });
    it('never issues a cookie for invalid credentials', async () => {
        mocks.login.mockResolvedValue(Response.json({ error: 'Invalid email or password.' }, { status: 401 }));
        const response = await login(new Request(`${origin}/api/auth/login`, { method: 'POST', headers: { origin } }));
        expect(response.status).toBe(401); expect(response.headers.get('set-cookie')).toBeNull();
    });
    it('requires same-origin login and logout and clears the browser cookie', async () => {
        const external = () => new Request(`${origin}/api/auth/login`, { method: 'POST', headers: { origin: 'https://attacker.example.com' } });
        expect((await login(external())).status).toBe(403);
        expect((await logout(external())).status).toBe(403);
        expect(mocks.login).not.toHaveBeenCalled();
        const response = await logout(new Request(`${origin}/api/auth/logout`, { method: 'POST', headers: { origin } }));
        expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
    });
});

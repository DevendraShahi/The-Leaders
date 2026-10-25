import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ connect: vi.fn(), account: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: mocks.connect }));
vi.mock('@/models/Admin', () => ({ default: { findById: () => ({ select: mocks.account }) } }));
import { getMobileAdmin, issueMobileSession } from '@/lib/mobile-auth';
const hash = '$2b$12$session-test-password-hash';
const request = () => new Request('https://example.com/api/auth/me', { headers: { authorization: `Bearer ${issueMobileSession('a'.repeat(24), hash).token}` } });
beforeEach(() => vi.resetAllMocks());
it('checks the current active account and password version for a valid session', async () => {
    const admin = { isActive: true, passwordHash: hash };
    mocks.account.mockResolvedValue(admin);
    expect(await getMobileAdmin(request())).toEqual(admin);
});
it.each([undefined, null, '', 123])('rejects accounts with an invalid password hash (%s) without throwing', async passwordHash => {
    mocks.account.mockResolvedValue({ isActive: true, passwordHash });
    expect(await getMobileAdmin(request())).toBeNull();
});
it('rejects disabled accounts and changed credentials', async () => {
    mocks.account.mockResolvedValueOnce({ isActive: false, passwordHash: hash });
    expect(await getMobileAdmin(request())).toBeNull();
    mocks.account.mockResolvedValueOnce({ isActive: true, passwordHash: 'changed' });
    expect(await getMobileAdmin(request())).toBeNull();
});
it('distinguishes connectivity failures from account query failures without disclosing raw errors', async () => {
    mocks.connect.mockRejectedValueOnce(new Error('private database host'));
    await expect(getMobileAdmin(request())).rejects.toMatchObject({ code: 'AUTH_DATABASE_CONNECTION', message: 'Account database connection unavailable. Please retry.' });
    mocks.account.mockRejectedValueOnce(new Error('private query details'));
    await expect(getMobileAdmin(request())).rejects.toMatchObject({ code: 'AUTH_ACCOUNT_LOOKUP', message: 'Could not load your admin account. Please retry.' });
});
it('does not query the database for invalid tokens', async () => {
    expect(await getMobileAdmin(new Request('https://example.com', { headers: { authorization: 'Bearer invalid' } }))).toBeNull();
    expect(mocks.connect).not.toHaveBeenCalled();
});

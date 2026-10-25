import { afterEach, expect, it, vi } from 'vitest';
import { isClerkConfigured } from '@/lib/clerk-config';
const pk = (mode = 'test', host = 'example.clerk.accounts.dev$') => `pk_${mode}_${btoa(host)}`;
afterEach(() => vi.unstubAllEnvs());
it.each([
    ['', ''], [pk(), ''], ['', 'sk_test_example'], ['not-a-key', 'sk_test_example'],
    ['pk_test_invalid-base64', 'sk_test_example'], [pk('test', 'not-a-host$'), 'sk_test_example'],
    [pk('test', 'example.clerk.accounts.dev'), 'sk_test_example'],
    [pk('test', 'example.com/path$'), 'sk_test_example'],
    [pk('test'), 'sk_live_example'], [` ${pk()}`, 'sk_test_example'],
])('treats missing, malformed or mismatched Clerk keys as unconfigured (%#)', (publishable, secret) => {
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', publishable);
    vi.stubEnv('CLERK_SECRET_KEY', secret);
    expect(isClerkConfigured()).toBe(false);
});
it.each(['test', 'live'])('enables a complete matching %s Clerk configuration', mode => {
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', pk(mode));
    vi.stubEnv('CLERK_SECRET_KEY', `sk_${mode}_example`);
    expect(isClerkConfigured()).toBe(true);
});

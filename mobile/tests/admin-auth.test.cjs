const { test } = require('node:test');
const assert = require('node:assert/strict');
const loader = require('./load-ts.cjs');
const secret = 'test-only-mobile-session-secret-that-is-long-enough';

function backendHarness(rateLimit = () => ({ limited: false })) {
    const bcrypt = require('../../node_modules/bcryptjs');
    let admin = { _id: 'a'.repeat(24), email: 'editor@example.test', username: 'editor', name: 'Editor', role: 'editorial', isActive: true, passwordHash: bcrypt.hashSync('test-password-only', 4), save: async () => {} };
    const overrides = {
        '@/lib/db': async () => {},
        '@/models/Admin': { findOne: () => ({ select: async () => admin }), findById: () => ({ select: async () => admin }) },
        '@/lib/auth-config': { getJwtSecret: () => secret },
        '@/lib/auth': { verifyPassword: (password, hash) => bcrypt.compare(password, hash) },
        '@/lib/rate-limit': { enforceRateLimit: rateLimit, getClientIp: () => 'test' },
    };
    const auth = loader(overrides)('../src/lib/mobile-auth.ts');
    overrides['@/lib/mobile-auth'] = auth;
    const load = loader(overrides);
    return { auth, login: load('../src/app/api/v1/auth/login/route.ts'), me: load('../src/app/api/v1/auth/me/route.ts'), getAdmin: () => admin, setAdmin: value => { admin = value; } };
}

test('backend password login issues a scoped session and verifies the active database admin', async () => {
    const h = backendHarness();
    const request = password => new Request('https://api.example.test/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: 'http://localhost:8081' }, body: JSON.stringify({ email: ' EDITOR@example.test ', password }) });
    const wrong = await h.login.POST(request('wrong-password'));
    assert.equal(wrong.status, 401);
    assert.equal((await wrong.json()).token, undefined);
    const response = await h.login.POST(request('test-password-only'));
    assert.equal(response.status, 200);
    const session = await response.json();
    assert.ok(session.token);
    assert.equal(session.passwordHash, undefined);
    const accountRequest = new Request('https://api.example.test/api/v1/auth/me', { headers: { Authorization: `Bearer ${session.token}` } });
    const account = await h.me.GET(accountRequest);
    assert.deepEqual(await account.json(), { isAdmin: true, studioScope: 'a'.repeat(24), profile: { name: 'Editor', role: 'editorial' } });
    assert.equal(account.headers.get('Cache-Control'), 'private, no-store');
    h.getAdmin().isActive = false;
    assert.equal((await h.me.GET(accountRequest)).status, 401);
    assert.equal((await h.login.POST(request('test-password-only'))).status, 403);
    h.getAdmin().isActive = true;
    h.getAdmin().passwordHash = 'changed-hash';
    assert.equal((await h.me.GET(accountRequest)).status, 401);
});

test('mobile session rejects tampering, expired tokens, other audiences and missing admins', async () => {
    const h = backendHarness();
    const jwt = require('../../node_modules/jsonwebtoken');
    const session = h.auth.issueMobileSession('a'.repeat(24), h.getAdmin().passwordHash);
    const request = token => new Request('https://api.example.test/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    const payload = jwt.decode(session.token);
    const { iat, exp, ...claims } = payload;
    for (const token of [session.token + 'tampered', jwt.sign(claims, secret, { expiresIn: -1 }), jwt.sign({ ...claims, aud: 'other-app' }, secret)]) {
        assert.equal((await h.me.GET(request(token))).status, 401);
    }
    h.setAdmin(null);
    assert.equal((await h.me.GET(request(session.token))).status, 401);
    assert.equal((await h.me.GET(new Request('https://api.example.test/api/v1/auth/me'))).status, 401);
    assert.equal(h.auth.mobileAuthHeaders(new Request('https://api.example.test', { headers: { origin: 'https://untrusted.test' } }))['Access-Control-Allow-Origin'], undefined);
});

test('mobile sends credentials to its backend and surfaces backend rejection without storing a session', async () => {
    const auth = loader({ './admin-account': { accountApiBase: () => 'https://api.example.test' } })('src/services/admin-session.ts');
    const original = global.fetch;
    try {
        let sent;
        global.fetch = async (url, options) => { sent = { url, options }; return Response.json({ token: 'session-token', sessionId: 'd9c78a27-c3e8-40d6-9f84-2c4e9c56129b', expiresAt: Date.now() + 60000 }); };
        const session = await auth.signInAdmin(' editor@example.test ', 'test-password-only');
        assert.equal(session.token, 'session-token');
        assert.equal(sent.url, 'https://api.example.test/api/v1/auth/login');
        assert.deepEqual(JSON.parse(sent.options.body), { email: 'editor@example.test', password: 'test-password-only' });
        global.fetch = async () => Response.json({ error: 'Invalid email or password.' }, { status: 401 });
        await assert.rejects(() => auth.signInAdmin('editor@example.test', 'wrong'), /Invalid email or password/);
        assert.equal(auth.parseAdminSession({ ...session, expiresAt: Date.now() - 1 }), null);
    } finally { global.fetch = original; }
});

test('admin verification sends the backend bearer token and rejects invalid admin scopes', async () => {
    const account = loader({ '@/api/config': { apiBase: () => 'https://api.example.test' }, 'react-native': { Platform: { OS: 'ios' } } })('src/services/admin-account.ts');
    const previousFetch = global.fetch;
    try {
        let request;
        global.fetch = async (url, options) => { request = { url, options }; return Response.json({ isAdmin: true, studioScope: 'approved-account', profile: { name: 'Editor', role: 'admin' } }); };
        assert.equal((await account.fetchAdminAccount('test-session-token')).isAdmin, true);
        assert.equal(request.url, 'https://api.example.test/api/v1/auth/me');
        assert.equal(request.options.headers.Authorization, 'Bearer test-session-token');
        global.fetch = async () => Response.json({ isAdmin: true, studioScope: null });
        await assert.rejects(() => account.fetchAdminAccount('test-session-token'));
        global.fetch = async () => new Response('', { status: 503 });
        await assert.rejects(() => account.fetchAdminAccount('test-session-token'), /Unable to verify/);
    } finally { global.fetch = previousFetch; }
});

test('sign-out hides cached admin access and missing or rejected sessions never grant access', async () => {
    let session = { ready: true, signedIn: false, sessionId: null, getToken: async () => null, signOut: async () => { session.signedIn = false; } };
    let options, apiCalls = 0;
    class AdminAccountError extends Error { constructor(status) { super(); this.status = status; } }
    const hook = loader({
        '@tanstack/react-query': { useQuery: input => { options = input; return { data: { isAdmin: true, studioScope: 'previous-account' }, isError: false }; } },
        './AuthProvider': { useSessionAuth: () => session },
        './admin-account': { AdminAccountError, fetchAdminAccount: async () => { apiCalls++; throw new AdminAccountError(401); } },
    })('src/services/useAdminAccount.ts');
    assert.equal(hook.useAdminAccount().isAdmin, false);
    assert.equal((await options.queryFn()).isAdmin, false);
    assert.equal(apiCalls, 0);
    session = { ...session, signedIn: true, sessionId: 'new-session' };
    hook.useAdminAccount();
    assert.deepEqual(options.queryKey, ['admin-account', 'new-session']);
    await assert.rejects(options.queryFn, /session could not be verified/);
    session.getToken = async () => 'rejected-token';
    hook.useAdminAccount();
    await assert.rejects(options.queryFn);
    assert.equal(session.signedIn, false);
    assert.equal(hook.useAdminAccount().isAdmin, false);
});


test('login enforces throttling and rejects malformed or nonexistent accounts', async () => {
    const limited = backendHarness(() => ({ limited: true, retryAfterSeconds: 90 }));
    const request = () => new Request('https://api.example.test/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email: 'editor@example.test', password: 'test-password-only' }) });
    const response = await limited.login.POST(request());
    assert.equal(response.status, 429);
    assert.equal(response.headers.get('Retry-After'), '90');
    const h = backendHarness();
    h.setAdmin(null);
    assert.equal((await h.login.POST(request())).status, 401);
    const malformed = new Request('https://api.example.test/api/v1/auth/login', { method: 'POST', body: '{invalid' });
    assert.equal((await h.login.POST(malformed)).status, 400);
});

test('native session storage persists only sessions, isolates API origins and clears on sign-out', async () => {
    const values = new Map();
    let origin = 'https://api.example.test';
    const storage = loader({
        'expo-secure-store': { getItemAsync: async key => values.get(key) ?? null, setItemAsync: async (key, value) => { values.set(key, value); }, deleteItemAsync: async key => { values.delete(key); } },
        '@/api/config': { apiBase: () => origin },
        './admin-session': { parseAdminSession: value => value.expiresAt > Date.now() ? value : null },
    })('src/services/session-storage.ts');
    const session = { token: 'test-session-token', sessionId: 'test-id', expiresAt: Date.now() + 60000 };
    await storage.saveSession(session);
    assert.deepEqual(await storage.readSession(), session);
    origin = 'https://other.example.test';
    assert.equal(await storage.readSession(), null);
    origin = 'https://api.example.test';
    await storage.clearSession();
    assert.equal(await storage.readSession(), null);
    await storage.saveSession({ ...session, expiresAt: Date.now() - 1 });
    assert.equal(await storage.readSession(), null);
});

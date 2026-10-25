import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import AuthProvider, { useAuth } from '@/components/admin/AuthProvider';

const mocks = vi.hoisted(() => ({
    identity: { isLoaded: true, isSignedIn: true, user: { id: 'user_clerk' } as { id: string } | null },
    signOut: vi.fn(), push: vi.fn(), replace: vi.fn(), fetch: vi.fn(),
    hooksDisabled: false,
}));
vi.mock('@clerk/nextjs', () => ({
    useUser: () => { if (mocks.hooksDisabled) throw new Error('Clerk provider is unavailable'); return mocks.identity; },
    useClerk: () => { if (mocks.hooksDisabled) throw new Error('Clerk provider is unavailable'); return { signOut: mocks.signOut }; },
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push, replace: mocks.replace }) }));

function Consumer() {
    const auth = useAuth();
    return <>
        <p>{auth.isLoading ? 'loading' : auth.user?.email || 'signed out'}</p>
        {auth.authorizationError && <p role="alert">{auth.authorizationError}</p>}
        <button onClick={auth.retryAuthorization}>Retry</button>
        <button onClick={auth.logout}>Sign out</button>
        <button onClick={() => auth.signIn('editor@example.com', 'existing-password')}>Password login</button>
    </>;
}
const profile = () => Response.json({ data: { user: { id: 'admin-1', email: 'editor@example.com', role: 'editorial' } } });
beforeEach(() => {
    vi.resetAllMocks();
    mocks.hooksDisabled = false;
    mocks.identity = { isLoaded: true, isSignedIn: true, user: { id: 'user_clerk' } };
    mocks.fetch.mockResolvedValue(profile());
    mocks.signOut.mockResolvedValue(undefined);
    vi.stubGlobal('fetch', mocks.fetch);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Clerk admin client session', () => {
    it('restores password login without mounting or calling Clerk hooks', async () => {
        mocks.hooksDisabled = true;
        render(<AuthProvider clerkEnabled={false}><Consumer /></AuthProvider>);
        expect(await screen.findByText('editor@example.com')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Sign out'));
        expect(await screen.findByText('signed out')).toBeInTheDocument();
        expect(mocks.signOut).not.toHaveBeenCalled();
    });
    it('restores a database session even before Clerk has loaded', async () => {
        mocks.identity = { isLoaded: false, isSignedIn: false, user: null };
        render(<AuthProvider><Consumer /></AuthProvider>);
        expect(await screen.findByText('editor@example.com')).toBeInTheDocument();
    });
    it('treats a signed-out 401 as anonymous without showing an access error', async () => {
        mocks.identity = { isLoaded: true, isSignedIn: false, user: null };
        mocks.fetch.mockResolvedValue(Response.json({ error: 'Sign in required' }, { status: 401 }));
        render(<AuthProvider><Consumer /></AuthProvider>);
        expect(await screen.findByText('signed out')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    it('signs in through the password endpoint and reloads the current admin', async () => {
        mocks.identity = { isLoaded: true, isSignedIn: false, user: null };
        mocks.fetch.mockResolvedValueOnce(Response.json({ error: 'Sign in required' }, { status: 401 }))
            .mockResolvedValueOnce(Response.json({ success: true }));
        render(<AuthProvider><Consumer /></AuthProvider>);
        await screen.findByText('signed out');
        fireEvent.click(screen.getByText('Password login'));
        expect(await screen.findByText('editor@example.com')).toBeInTheDocument();
        expect(mocks.fetch).toHaveBeenCalledWith('/api/auth/login', {
            method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'editor@example.com', password: 'existing-password' }),
        });
    });
    it('loads the authorized admin using cookies without a legacy bearer', async () => {
        render(<AuthProvider><Consumer /></AuthProvider>);
        expect(await screen.findByText('editor@example.com')).toBeInTheDocument();
        expect(mocks.fetch).toHaveBeenCalledWith('/api/auth/me', {
            credentials: 'same-origin', cache: 'no-store', signal: expect.any(AbortSignal),
        });
    });
    it('can retry a failed database authorization check without repeating Clerk sign-in', async () => {
        mocks.fetch.mockResolvedValueOnce(Response.json({ error: 'Authentication service unavailable' }, { status: 503 }));
        render(<AuthProvider><Consumer /></AuthProvider>);
        expect(await screen.findByRole('alert')).toHaveTextContent('Authentication service unavailable');
        fireEvent.click(screen.getByText('Retry'));
        expect(await screen.findByText('editor@example.com')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    it('uses Clerk signOut to revoke the session and redirects to the web login', async () => {
        render(<AuthProvider><Consumer /></AuthProvider>);
        await screen.findByText('editor@example.com');
        fireEvent.click(screen.getByText('Sign out'));
        await waitFor(() => expect(mocks.signOut).toHaveBeenCalledWith({ redirectUrl: '/admin/login' }));
        expect(await screen.findByText('signed out')).toBeInTheDocument();
        expect(mocks.fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    });
    it('clears a database-only session without calling Clerk signOut', async () => {
        mocks.identity = { isLoaded: true, isSignedIn: false, user: null };
        render(<AuthProvider><Consumer /></AuthProvider>);
        await screen.findByText('editor@example.com');
        fireEvent.click(screen.getByText('Sign out'));
        expect(await screen.findByText('signed out')).toBeInTheDocument();
        expect(mocks.signOut).not.toHaveBeenCalled();
        expect(mocks.replace).toHaveBeenCalledWith('/admin/login');
    });
    it('does not report sign-out success when clearing the password cookie fails', async () => {
        mocks.fetch.mockResolvedValueOnce(profile()).mockResolvedValueOnce(Response.json({ error: 'Unavailable' }, { status: 503 }));
        render(<AuthProvider><Consumer /></AuthProvider>);
        await screen.findByText('editor@example.com');
        fireEvent.click(screen.getByText('Sign out'));
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not sign out');
        expect(mocks.signOut).not.toHaveBeenCalled();
        expect(screen.getByText('editor@example.com')).toBeInTheDocument();
    });
    it('ignores an in-flight admin response after the Clerk identity signs out', async () => {
        let finish!: (response: Response) => void;
        mocks.fetch.mockImplementationOnce(() => new Promise<Response>(resolve => { finish = resolve; }));
        const view = render(<AuthProvider><Consumer /></AuthProvider>);
        mocks.identity = { isLoaded: true, isSignedIn: false, user: null };
        mocks.fetch.mockResolvedValue(Response.json({ error: 'Sign in required' }, { status: 401 }));
        view.rerender(<AuthProvider><Consumer /></AuthProvider>);
        await act(async () => { finish(profile()); });
        expect(await screen.findByText('signed out')).toBeInTheDocument();
        expect(screen.queryByText('editor@example.com')).not.toBeInTheDocument();
    });
});

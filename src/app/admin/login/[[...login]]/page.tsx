"use client";

import { SignIn, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/admin/AuthProvider';

export default function AdminLogin() {
    const { isSignedIn } = useUser();
    const { isLoading, isAuthenticated, authorizationError, signIn } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isLoading) return;
        if (isAuthenticated) router.replace('/admin');
        else if (isSignedIn && authorizationError) router.replace('/admin/unauthorized');
    }, [isSignedIn, isLoading, isAuthenticated, authorizationError, router]);

    return <main className="grid min-h-screen place-items-center bg-background p-6">
        <section className="w-full max-w-4xl space-y-6">
            <div className="space-y-2 text-center">
                <p className="text-xs font-bold tracking-widest text-primary">THE LEADERS</p>
                <h1 className="text-3xl font-semibold">Admin sign in</h1>
                <p className="text-sm text-muted-foreground">Use your newsroom email and password, or continue with Clerk.</p>
            </div>
            <div className="grid items-start gap-6 md:grid-cols-2">
                <form className="space-y-5 rounded-xl border border-border bg-card p-8"
                    onSubmit={async event => {
                        event.preventDefault();
                        setBusy(true);
                        setError('');
                        try { await signIn(email, password); setPassword(''); }
                        catch (error) { setError(error instanceof Error ? error.message : 'Could not sign in'); }
                        finally { setBusy(false); }
                    }}>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold">Email and password</h2>
                        <p className="text-sm text-muted-foreground">Use your existing newsroom account.</p>
                    </div>
                    <label className="block text-sm">Email
                        <input className="mt-2 w-full rounded-md border border-border bg-background p-3" type="email"
                            autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} />
                    </label>
                    <label className="block text-sm">Password
                        <input className="mt-2 w-full rounded-md border border-border bg-background p-3" type="password"
                            autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} />
                    </label>
                    {(error || authorizationError) && <p role="alert" className="text-sm text-destructive">{error || authorizationError}</p>}
                    <button disabled={busy} className="w-full rounded-md bg-primary p-3 font-semibold text-primary-foreground disabled:opacity-50">
                        {busy ? 'Signing in…' : 'Sign in with email'}
                    </button>
                </form>
                <div className="flex justify-center">
                    {isSignedIn ? <p role="status">Checking newsroom access…</p> :
                        <SignIn routing="path" path="/admin/login" withSignUp={false}
                            appearance={{ elements: { footerAction: { display: 'none' } } }} />}
                </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">Accounts are managed by your newsroom administrator.</p>
        </section>
    </main>;
}

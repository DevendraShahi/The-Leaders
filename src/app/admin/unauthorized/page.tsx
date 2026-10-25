"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/admin/AuthProvider';
import { firstAllowedAdminPage } from '@/lib/admin-page-access';

export default function Unauthorized() {
    const { user, logout, authorizationError, retryAuthorization, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (isLoading || !isAuthenticated || authorizationError) return;
        const target = user?.role === 'superadmin' ? '/admin' : firstAllowedAdminPage(user?.permissions as any);
        if (target) router.replace(target);
    }, [user, isLoading, isAuthenticated, authorizationError, router]);
    return <main className="grid min-h-screen place-items-center p-6">
        <section className="max-w-md space-y-5">
            <h1 className="text-3xl font-semibold">Admin access required</h1>
            <p>{authorizationError || 'Contact your newsroom administrator to check your account permissions.'}</p>
            <button onClick={retryAuthorization} disabled={isLoading} className="rounded border border-border p-3 disabled:opacity-50">{isLoading ? 'Checking…' : 'Retry access check'}</button>{' '}
            <button onClick={logout} className="rounded bg-primary p-3 text-primary-foreground">Sign out</button>{' '}
            <Link href="/">Return home</Link>
        </section>
    </main>;
}

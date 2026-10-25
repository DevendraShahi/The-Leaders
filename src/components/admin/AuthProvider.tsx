"use client";

import { useClerk, useUser } from '@clerk/nextjs';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    permissions?: { pageAccess?: Record<string, boolean>; [key: string]: any };
}
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    authorizationError: string | null;
    login: () => void;
    signIn: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    retryAuthorization: () => void;
    clerkEnabled: boolean;
    clerkSignedIn: boolean;
}
const AuthContext = createContext<AuthContextType>({
    user: null, isAuthenticated: false, isLoading: true, authorizationError: null,
    login: () => {}, signIn: async () => {}, logout: async () => {}, retryAuthorization: () => {},
    clerkEnabled: false, clerkSignedIn: false,
});
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children, clerkEnabled = true }: { children: React.ReactNode; clerkEnabled?: boolean }) {
    return clerkEnabled ? <ClerkSessionProvider>{children}</ClerkSessionProvider> :
        <SessionProvider clerkEnabled={false} isLoaded isSignedIn={false}>{children}</SessionProvider>;
}

function ClerkSessionProvider({ children }: { children: React.ReactNode }) {
    const { isLoaded, isSignedIn, user: identity } = useUser();
    const { signOut } = useClerk();
    const revokeClerk = useCallback(() => signOut({ redirectUrl: '/admin/login' }), [signOut]);
    return <SessionProvider clerkEnabled isLoaded={isLoaded} isSignedIn={Boolean(isSignedIn)} identityId={identity?.id} revokeClerk={revokeClerk}>{children}</SessionProvider>;
}

function SessionProvider({ children, clerkEnabled, isLoaded, isSignedIn, identityId, revokeClerk }: {
    children: React.ReactNode; clerkEnabled: boolean; isLoaded: boolean; isSignedIn: boolean;
    identityId?: string; revokeClerk?: () => Promise<unknown>;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [authorizationError, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);
    const router = useRouter();

    useEffect(() => {
        setUser(null);
        setError(null);
        const controller = new AbortController();
        setLoading(true);
        void (async () => {
            try {
                const response = await fetch('/api/auth/me', {
                    credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
                });
                const data = await response.json();
                if (response.status === 401 && !isSignedIn) return;
                if (!response.ok) throw new Error(data.error || 'Could not verify admin access');
                if (!controller.signal.aborted) setUser(data.data.user);
            } catch (error) {
                if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Could not verify admin access');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        })();
        return () => controller.abort();
    }, [isLoaded, isSignedIn, identityId, attempt]);

    async function signIn(email: string, password: string) {
        const response = await fetch('/api/auth/login', {
            method: 'POST', credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not sign in');
        setAttempt(value => value + 1);
    }

    const logout = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
            if (!response.ok) throw new Error('Could not clear password session');
            if (isSignedIn && revokeClerk) await revokeClerk();
            setUser(null);
            setError(null);
            router.replace('/admin/login');
        } catch {
            setError('Could not sign out. Please retry.');
        }
    }, [isSignedIn, revokeClerk, router]);

    return <AuthContext.Provider value={{
        user, isAuthenticated: Boolean(user), isLoading,
        authorizationError, login: () => router.push('/admin/login'), signIn, logout,
        retryAuthorization: () => setAttempt(value => value + 1),
        clerkEnabled, clerkSignedIn: isSignedIn,
    }}>{children}</AuthContext.Provider>;
}

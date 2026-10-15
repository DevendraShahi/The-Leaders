"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
interface User { id: string; email: string; name: string; role: string; avatar?: string; permissions?: { pageAccess?: Record<string, boolean>; [key: string]: any } }
interface AuthContextType { user: User | null; isAuthenticated: boolean; isLoading: boolean; authorizationError: string | null; login: () => void; signIn: (email: string, password: string) => Promise<void>; logout: () => Promise<void> }
const AuthContext = createContext<AuthContextType>({ user: null, isAuthenticated: false, isLoading: true, authorizationError: null, login: () => {}, signIn: async () => {}, logout: async () => {} });
export const useAuth = () => useContext(AuthContext);
export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [authorizationError, setError] = useState<string | null>(null);
    const router = useRouter();
    async function loadUser() {
        const response = await fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) { setUser(null); if (response.status !== 401) throw new Error(data.error || 'Could not verify admin access'); return; }
        setUser(data.data.user); setError(null);
    }
    useEffect(() => { let active = true; void loadUser().catch(error => { if (active) setError(error.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
    async function signIn(email: string, password: string) {
        const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not sign in');
        await loadUser(); router.replace('/admin');
    }
    async function logout() {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        if (!response.ok) { setError('Could not sign out. Please retry.'); return; }
        setUser(null); router.replace('/admin/login');
    }
    return <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), isLoading, authorizationError, login: () => router.push('/admin/login'), signIn, logout }}>{children}</AuthContext.Provider>;
}

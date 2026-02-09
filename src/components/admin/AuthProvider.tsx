'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    permissions?: {
        pageAccess?: Record<string, boolean>;
        [key: string]: any;
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    login: () => { },
    logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('adminToken');

            if (!storedToken) {
                setIsLoading(false);
                // Redirect to login if trying to access admin routes (except login itself)
                if (pathname?.startsWith('/admin') && pathname !== '/admin/login') {
                    router.push('/admin/login');
                }
                return;
            }

            try {
                // Verify token with backend
                const res = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setToken(storedToken);
                    setUser(data.data.user);
                } else {
                    // Invalid token
                    localStorage.removeItem('adminToken');
                    setToken(null);
                    setUser(null);
                    if (pathname?.startsWith('/admin') && pathname !== '/admin/login') {
                        router.push('/admin/login');
                    }
                }
            } catch (error) {
                console.error('Auth check error:', error);
                localStorage.removeItem('adminToken');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [pathname, router]);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('adminToken', newToken);
        setToken(newToken);
        setUser(newUser);
        toast.success('Welcome back!');
        router.push('/admin');
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setToken(null);
        setUser(null);
        toast.info('Logged out successfully');
        router.push('/admin/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

"use client";

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/admin/AuthProvider';
import StudioEditor from './social-studio/StudioEditor';
import type { StudioApi } from './social-studio/session';

export default function SocialStudio() {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();
    const api: StudioApi = useCallback(async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
        const headers = new Headers(options.headers);

        if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
        const response = await fetch(path, { ...options, headers, credentials: 'include', cache: 'no-store' });
        if (response.ok && response.headers.get('content-type')?.startsWith('image/')) return await response.blob() as T;
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || 'Request failed. Please retry.');
        return result.data as T;
    }, [isAuthenticated]);
    if (!user) return null;
    return <StudioEditor api={api} user={{ id: user.id, role: user.role, permissions: { socialPosts: user.permissions?.socialPosts } }} onExit={() => router.push('/admin')} />;
}

"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/admin/AuthProvider';
import OverlayStudio from '@/components/admin/post-studio/OverlayStudio';

export default function OverlayStudioPage() {
    const { user } = useAuth();
    const router = useRouter();
    if (!user?.id) return null;
    return <OverlayStudio onBack={() => router.push('/admin/social')} />;
}

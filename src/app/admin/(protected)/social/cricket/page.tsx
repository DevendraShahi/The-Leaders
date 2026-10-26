"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/admin/AuthProvider';
import CricketStudio from '@/components/admin/post-studio/CricketStudio';

export default function CricketStudioPage() {
    const { user } = useAuth();
    const router = useRouter();
    if (!user?.id) return null;
    return <CricketStudio scope={user.id} onBack={() => router.push('/admin/social')} onOpenDraft={draft => router.push(`/admin/social?draft=${encodeURIComponent(draft.id)}&from=cricket`)} />;
}

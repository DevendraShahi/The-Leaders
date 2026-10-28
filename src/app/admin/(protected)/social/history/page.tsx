"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/admin/AuthProvider';
import HistoryStudio from '@/components/admin/post-studio/HistoryStudio';

export default function HistoryStudioPage() {
    const { user } = useAuth();
    const router = useRouter();
    if (!user?.id) return null;
    return <HistoryStudio scope={user.id} onBack={() => router.push('/admin/social')} onOpenDraft={draft => router.push(`/admin/social?draft=${encodeURIComponent(draft.id)}&from=history`)} />;
}

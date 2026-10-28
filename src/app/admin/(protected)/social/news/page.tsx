"use client";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/admin/AuthProvider';
import NewsStudio from '@/components/admin/post-studio/NewsStudio';
export default function NewsStudioPage() {
    const { user } = useAuth(); const router = useRouter();
    if (!user?.id) return null;
    return <NewsStudio scope={user.id} onBack={() => router.push('/admin/social')} onOpenDraft={draft => router.push(`/admin/social?draft=${encodeURIComponent(draft.id)}&from=news`)} />;
}

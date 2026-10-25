import { Suspense } from 'react';
import PostStudio from '@/components/admin/post-studio/PostStudio';

export default function SocialPage() {
    return <Suspense fallback={<p className="p-6">Loading Studio…</p>}><PostStudio /></Suspense>;
}

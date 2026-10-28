import { Suspense } from 'react';
import StudioPreview from '@/components/admin/post-studio/StudioPreview';
export default function PreviewPage() {
    return <Suspense fallback={<p className="p-6">Loading preview…</p>}><StudioPreview /></Suspense>;
}

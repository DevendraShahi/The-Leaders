"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/admin/AuthProvider';
import { listDrafts, type PostDraft } from '@/lib/post-studio/drafts';
import { findCarouselSiblings } from '@/lib/post-studio/carousel';
import InstagramPreviewPage from './InstagramPreviewPage';
import styles from './PostStudio.module.css';

export default function StudioPreview() {
    const { user } = useAuth(), router = useRouter(), params = useSearchParams();
    const scope = user?.id, id = params.get('draft');
    const [library, setLibrary] = useState<{ scope: string; drafts: PostDraft[] } | null>(null);
    const [error, setError] = useState(''), [retry, setRetry] = useState(0);
    useEffect(() => {
        if (!scope) return;
        let active = true; setError(''); setLibrary(null);
        void listDrafts(scope).then(drafts => { if (active) setLibrary({ scope, drafts }); }).catch(failure => { if (active) setError(failure instanceof Error ? failure.message : 'Could not load the preview.'); });
        return () => { active = false; };
    }, [scope, retry]);
    if (!scope) return null;
    const frame = (content: React.ReactNode) => <div className={styles.studio}><main style={{ maxWidth: 640, margin: 'auto', padding: 24 }}>{content}</main></div>;
    if (error) return frame(<><h1>Preview unavailable</h1><p role="alert">{error}</p><div className={styles.row}><button className={styles.button} onClick={() => setRetry(value => value + 1)}>Retry preview</button><button className={styles.button} onClick={() => router.push('/admin/social')}>Back to Studio</button></div></>);
    if (!library || library.scope !== scope) return frame(<p role="status">Loading your preview…</p>);
    const draft = library.drafts.find(item => item.id === id && !item.trashedAt);
    if (!draft) return frame(<><h1>Post unavailable</h1><p>This draft may have been moved to Trash or belongs to another browser profile.</p><button className={styles.button} onClick={() => router.push('/admin/social')}>Back to Studio</button></>);
    const slides = findCarouselSiblings(draft, library.drafts);
    const currentIndex = Math.max(0, slides.findIndex(item => item.id === draft.id));
    const origin = params.get('from');
    const query = (draftId: string) => { const next = new URLSearchParams({ draft: draftId }); if (origin && ['cricket', 'history', 'news'].includes(origin)) next.set('from', origin); return next.toString(); };
    const edit = (index: number) => router.replace(`/admin/social?${query(slides[index].id)}`);
    return <InstagramPreviewPage slides={slides} activeSlideIndex={currentIndex} onSelectSlide={index => router.replace(`/admin/social/preview?${query(slides[index].id)}`, { scroll: false })} onBack={() => edit(currentIndex)} onEdit={edit} />;
}

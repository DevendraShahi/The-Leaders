import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import InstagramPreviewPage from '@/components/admin/post-studio/InstagramPreviewPage';
import { newsSample } from '@/lib/post-studio/news-design';
import type { PostDraft } from '@/lib/post-studio/drafts';
import type { PostFormat } from '@/lib/post-studio/types';
const slides: PostDraft[] = (['square','portrait','story','landscape'] as PostFormat[]).flatMap((format, i) => (['en','ne'] as const).map(language => {
    const design = newsSample(i % 2 ? 'report' : 'daily', format, language); design.imageUri = '/studio/cricket/backgrounds/stadium-01.jpg';
    return { id: `${format}-${language}`, name: `${format} ${language}`, createdAt: '', updatedAt: '', trashedAt: null, design };
}));
function Preview() {
    const [active, setActive] = useState(0);
    return <InstagramPreviewPage slides={slides} activeSlideIndex={active} onSelectSlide={setActive} onBack={() => document.body.dataset.returned = 'true'} onEdit={index => { document.body.dataset.editPage = String(index); }} />;
}
createRoot(document.getElementById('root')!).render(<Preview />);

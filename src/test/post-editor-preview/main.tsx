import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@/app/globals.css';
import PostEditor from '@/components/admin/post-studio/PostEditor';
import CricketStudio from '@/components/admin/post-studio/CricketStudio';
import { createDraftCollection, listDrafts, type PostDraft } from '@/lib/post-studio/drafts';
import { defaultPostDesign, type PostFormat } from '@/lib/post-studio/types';
import { cricketTemplateIds, type CricketTemplateId } from '@/lib/post-studio/cricket-catalog';
import { createCricketDesign } from '@/lib/post-studio/cricket-design';
import { artworkFitIssues } from '@/lib/post-studio/artwork-fit';
const scope = 'studio-responsive-preview';
(window as typeof window & { checkCricketArtwork: () => unknown }).checkCricketArtwork = () => Array.from(document.querySelectorAll<HTMLElement>('[data-cricket-template]')).map(node => ({
    template: node.dataset.cricketTemplate,
    issues: artworkFitIssues(node).map(element => ({ text: element.textContent?.slice(0, 90), className: element.className, width: element.clientWidth, scrollWidth: element.scrollWidth, height: element.clientHeight, scrollHeight: element.scrollHeight })),
}));
function CricketPreview({ initial }: { initial?: PostDraft }) {
    const [draft, setDraft] = useState(initial);
    if (draft) return <PostEditor key={draft.id} scope="studio-cricket-preview" draft={draft} onClose={() => { const url = new URL(location.href); url.searchParams.delete('draft'); history.replaceState(null, '', url); setDraft(undefined); }} />;
    return <CricketStudio scope="studio-cricket-preview" onBack={() => location.assign('/')} onOpenDraft={item => { const url = new URL(location.href); url.searchParams.set('draft', item.id); history.replaceState(null, '', url); setDraft(item); }} />;
}
async function mount() {
    const params = new URLSearchParams(location.search);
    document.documentElement.dataset.theme = params.get('theme') || 'light';
    const cricket = params.get('cricket') || (location.pathname === '/admin/social/cricket' ? 'gallery' : null);
    if (cricket) {
        let draft: PostDraft | undefined;
        if (params.get('draft')) draft = (await listDrafts('studio-cricket-preview')).find(item => item.id === params.get('draft'));
        else if (cricketTemplateIds.includes(cricket as CricketTemplateId)) {
            const format = (params.get('format') || 'portrait') as PostFormat;
            const language = params.get('language') === 'ne' ? 'ne' : 'en';
            const id = `preview-cricket-${cricket}-${format}-${language}`;
            const saved = await createDraftCollection('studio-cricket-preview', [{ id, carouselId: id, carouselOrder: 0, name: `${cricket} · NPL preview`, design: createCricketDesign(cricket as CricketTemplateId, 'janakpur', 'kathmandu', format, language) }]);
            draft = saved[0];
        }
        createRoot(document.getElementById('root')!).render(<CricketPreview initial={draft} />); return;
    }
    await createDraftCollection(scope, [
        { id: 'preview-editor-1', name: 'The democratic promise · 1/3', design: { ...defaultPostDesign, format: 'portrait', category: 'THE LEADERS / IDEAS', eyebrow: 'THE DEMOCRATIC PROMISE', headline: 'A republic is built one institution at a time.', summary: 'Why the strength of our institutions matters more than the promises of any single leader.', author: 'The Leaders Editorial' } },
        { id: 'preview-editor-2', name: 'The democratic promise · 2/3', design: { ...defaultPostDesign, format: 'portrait', headline: 'Accountability begins with public trust.', summary: 'Independent institutions give citizens a voice between elections.', eyebrow: 'THE INSTITUTIONAL TEST' } },
        { id: 'preview-editor-3', name: 'The democratic promise · 3/3', design: { ...defaultPostDesign, format: 'portrait', headline: 'लोकतन्त्रको आधार बलियो संस्था हो।', summary: 'जवाफदेहिता र नागरिक सहभागिताले लोकतन्त्रलाई बलियो बनाउँछ।', eyebrow: 'नेपालको लोकतन्त्र' } },
    ]);
    const all = await listDrafts(scope);
    const draft = all.find(item => item.id === (params.get('draft') || 'preview-editor-1'))!;
    createRoot(document.getElementById('root')!).render(<PostEditor scope={scope} draft={draft} onClose={() => location.reload()} />);
}
void mount();

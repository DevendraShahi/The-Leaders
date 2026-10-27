import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@/app/globals.css';
import PostEditor from '@/components/admin/post-studio/PostEditor';
import CricketStudio from '@/components/admin/post-studio/CricketStudio';
import { createDraftCollection, listDrafts, type PostDraft } from '@/lib/post-studio/drafts';
import { defaultPostDesign, type PostDesign, type PostFormat, type CricketStyle } from '@/lib/post-studio/types';
import { Artwork } from '@/components/admin/post-studio/Artwork';
import { findPlayers, playerPhotoCredit } from '@/lib/post-studio/cricket-players';
import { artworkBytes } from '@/lib/post-studio/export';
import { cricketTemplateIds, type CricketTemplateId, type NplTeamId } from '@/lib/post-studio/cricket-catalog';
import type { CricketData } from '@/lib/post-studio/cricket-data';
import { createCricketDesign } from '@/lib/post-studio/cricket-design';
import { artworkFitIssues } from '@/lib/post-studio/artwork-fit';
const scope = 'studio-responsive-preview';
type AuditCase = { template: CricketTemplateId; format: PostFormat; language: 'en' | 'ne'; style: CricketStyle; photo?: boolean; long?: boolean; overrides?: Partial<PostDesign>; teamId?: NplTeamId; opponentId?: NplTeamId; cricket?: Partial<CricketData> };
declare global { interface Window { renderCricketAudit?: (value: AuditCase) => void; exportCricketAudit?: () => Promise<number[]> } }
function CricketAudit() {
    const [config, setConfig] = useState<AuditCase>({ template: 'matchday', format: 'portrait', language: 'en', style: 'stadium' });
    useEffect(() => { window.renderCricketAudit = value => flushSync(() => setConfig(value)); return () => { delete window.renderCricketAudit; }; }, []);
    const design = createCricketDesign(config.template, config.teamId ?? 'lumbini', config.opponentId ?? 'sudurpaschim', config.format, config.language, config.style);
    design.cricket!.matchDate = '2026-10-27'; design.cricket!.startTime = '16:30'; design.cricket!.matchLabel = 'MATCH 03';
    const player = findPlayers('lumbini')[0];
    if (config.photo && player?.photo?.url) { design.imageUri = player.photo.url; design.imageCredit = playerPhotoCredit(player); design.cricket!.batter.name = player.name; design.cricket!.bowler.name = player.name; }
    if (config.long) {
        design.cricket!.batter.name = config.language === 'ne' ? 'खेलाडीको लामो नाम उदाहरण' : 'A batter with a longer full name';
        design.cricket!.lineup = Array.from({ length: 11 }, (_, i) => config.language === 'ne' ? `खेलाडीको नाम ${i + 1}` : `Player ${i + 1} Full Name${i === 0 ? ' (c)' : i === 1 ? ' (wk)' : ''}`);
    }
    Object.assign(design, config.overrides);
    Object.assign(design.cricket!, config.cricket);
    useEffect(() => { window.exportCricketAudit = async () => Array.from(await artworkBytes(document.querySelector('[data-testid="post-artwork"]') as HTMLElement, config.format)); return () => { delete window.exportCricketAudit; }; }, [config]);
    return <div style={{ padding: 32, background: '#e8e5dd', minHeight: '100vh', display: 'grid', justifyContent: 'center', alignContent: 'start', gap: 16 }}><p style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#4b5355' }}>Template preview · illustrative data</p><Artwork design={design} /></div>;
}
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
    if (params.has('visual-audit')) { createRoot(document.getElementById('root')!).render(<CricketAudit />); return; }
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

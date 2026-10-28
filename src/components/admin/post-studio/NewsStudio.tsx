"use client";
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Newspaper } from 'lucide-react';
import { createDraft, type PostDraft } from '@/lib/post-studio/drafts';
import { createNewsDesign, newsSample, newsStyles, type NewsStyle } from '@/lib/post-studio/news-design';
import { postOutputDimensions, type PostFormat } from '@/lib/post-studio/types';
import { Artwork } from './Artwork';
import PromptCreationModal from './PromptCreationModal';
import s from './PostStudio.module.css';
import css from './NewsStudio.module.css';
export default function NewsStudio({ scope, onBack, onOpenDraft }: { scope: string; onBack: () => void; onOpenDraft: (draft: PostDraft) => void }) {
    const [language, setLanguage] = useState<'en' | 'ne'>('ne'), [format, setFormat] = useState<PostFormat>('portrait');
    const [selected, setSelected] = useState<NewsStyle | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
    const preview = useRef<HTMLDivElement>(null), lock = useRef(false);
    const [previewWidth, setPreviewWidth] = useState(280);
    useEffect(() => { if (!preview.current) return; const observer = new ResizeObserver(([entry]) => setPreviewWidth(entry.contentRect.width)); observer.observe(preview.current); return () => observer.disconnect(); }, []);
    const [w, h] = postOutputDimensions[format];
    const create = async (style: NewsStyle) => {
        if (lock.current) return; lock.current = true; setBusy(true); setError('');
        try { onOpenDraft(await createDraft(scope, `Untitled ${newsStyles.find(item => item.id === style)!.title}`, createNewsDesign(style, format, language))); }
        catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not create the draft.'); }
        finally { lock.current = false; setBusy(false); }
    };
    return <div className={s.studio}><main className={css.desk}>
        <header className={css.header}><button className={s.button} disabled={busy} onClick={onBack}><ArrowLeft size={16} />Studio</button><p className={css.eyebrow}>THE LEADERS / NEWS DESK</p><h1>The story comes first.</h1><p>Three formats for clear, credible reporting. Add your photo and confirmed facts in the editor.</p></header>
        <div className={css.setup}><Newspaper size={24} /><label className={s.field}><span>Language</span><select className={s.input} value={language} onChange={event => setLanguage(event.target.value as 'en' | 'ne')}><option value="ne">नेपाली</option><option value="en">English</option></select></label><label className={s.field}><span>Canvas size</span><select className={s.input} value={format} onChange={event => setFormat(event.target.value as PostFormat)}>{Object.entries(postOutputDimensions).map(([id, size]) => <option value={id} key={id}>{id} · {size.join(' × ')}</option>)}</select></label></div>
        {error && <p className={s.error} role="alert">{error}</p>}
        <section className={css.grid} aria-label="News templates">{newsStyles.map((item, index) => <article key={item.id} className={css.card}>
            <div className={css.preview} ref={index === 0 ? preview : undefined} style={{ aspectRatio: `${w}/${h}` }} inert aria-hidden="true"><div style={{ width: 360, height: 360 * h / w, transform: `scale(${previewWidth / 360})`, transformOrigin: 'top left' }}><Artwork design={newsSample(item.id, format, language)} /></div></div>
            <div className={css.caption}><span className={css.eyebrow}>0{index + 1} / THE LEADERS</span><h2>{item.title}</h2><p>{item.description}</p><div className={css.actions}><button className={s.primary} disabled={busy} onClick={() => void create(item.id)}>Start blank post</button><button className={s.button} disabled={busy} onClick={() => setSelected(item.id)}>Create with AI prompt</button></div></div>
        </article>)}</section><p className={s.subtle}>Examples show field placement. New drafts start with empty headlines and context. Add photographs you have permission to publish; keep source URLs with the draft.</p>
        {selected && <PromptCreationModal scope={scope} initialKind="news" initialOptions={{ newsStyle: selected, template: 'breaking', language, format }} onClose={() => setSelected(null)} onOpen={draft => { setSelected(null); onOpenDraft(draft); }} />}
    </main></div>;
}

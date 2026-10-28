"use client";

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Files } from 'lucide-react';
import { type HistoryLanguage } from '@/lib/post-studio/history-catalog';
import { createHistoryDesign, createHistoryDraftDesign, createHistoryParagraphDesign } from '@/lib/post-studio/history-design';
import { createDraft, type PostDraft } from '@/lib/post-studio/drafts';
import { postOutputDimensions, type PostFormat } from '@/lib/post-studio/types';
import { nepalDate } from '@/lib/post-studio/cricket-fixtures';
import { Artwork } from './Artwork';
import PromptCreationModal from './PromptCreationModal';
import styles from './PostStudio.module.css';
import css from './HistoryStudio.module.css';

export default function HistoryStudio({ scope, onBack, onOpenDraft }: { scope: string; onBack: () => void; onOpenDraft: (draft: PostDraft) => void }) {
    const [date, setDate] = useState(() => nepalDate());
    const [language, setLanguage] = useState<HistoryLanguage>('en');
    const [format, setFormat] = useState<PostFormat>('portrait');
    const [promptOpen, setPromptOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
    const lock = useRef(false), previews = useRef<HTMLDivElement>(null);
    const [previewWidth, setPreviewWidth] = useState(240);
    useEffect(() => {
        const preview = previews.current?.querySelector<HTMLElement>('[data-history-preview]');
        if (!preview) return;
        const observer = new ResizeObserver(([entry]) => { if (entry.contentRect.width > 0) setPreviewWidth(entry.contentRect.width); });
        observer.observe(preview);
        return () => observer.disconnect();
    }, []);
    const create = async () => {
        if (lock.current) return;
        lock.current = true; setBusy(true); setError('');
        try { onOpenDraft(await createDraft(scope, 'Today in History', createHistoryDraftDesign('on-this-day', format, language))); }
        catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not save the draft. Retry.'); }
        finally { lock.current = false; setBusy(false); }
    };
    const [width, height] = postOutputDimensions[format];
    const cover = createHistoryDesign('on-this-day', format, language);
    const paragraph = createHistoryParagraphDesign(cover, language === 'ne'
        ? 'यस पृष्ठमा घटनाको पृष्ठभूमि, त्यसबेला के भयो र त्यसको महत्त्व स्पष्ट रूपमा लेख्नुहोस्। तथ्यहरूलाई सन्दर्भसहित प्रस्तुत गर्नुहोस्।\n\nकथा लामो भए अर्को पृष्ठ थप्न सकिन्छ। प्रत्येक पृष्ठले पाठकलाई बुझ्न सजिलो हुने गरी घटनाको एउटा पक्ष प्रस्तुत गर्छ।'
        : 'Use this page to explain the background, what happened, and why the event matters. Present the facts in clear paragraphs with enough context for the reader.\n\nIf the story needs more space, add another page. Each continuation keeps the same design and gives the next part of the story room to breathe.');
    return <div className={styles.studio}><main className={css.desk}>
        <header className={css.header}>
            <button className={css.back} onClick={onBack}><ArrowLeft size={15} />Back to Studio</button>
            <span className={css.eyebrow}>THE LEADERS / HISTORY DESK</span>
            <h1>Today in History<span>इतिहासमा आजको दिन</span></h1>
            <p>One Nepal event and one international event, each in Nepali and English.</p>
        </header>
        <section className={css.setup} aria-label="History post setup">
            <div className={css.setupIntro}><Files size={22} /><div><h2>Prepare your story</h2><p>Four editions: National नेपाली, National English, International English, International नेपाली.</p></div></div>
            <div className={css.fields}>
                <label className={styles.field}><span>Publication date · Nepal</span><input className={styles.input} type="date" value={date} onChange={event => setDate(event.target.value)} /></label>
                <label className={styles.field}><span>Language</span><select className={styles.input} value={language} onChange={event => setLanguage(event.target.value as HistoryLanguage)}><option value="en">English</option><option value="ne">नेपाली</option></select></label>
                <label className={styles.field}><span>Canvas size</span><select className={styles.input} value={format} onChange={event => setFormat(event.target.value as PostFormat)}>{Object.entries(postOutputDimensions).map(([id, dimensions]) => <option key={id} value={id}>{id} · {dimensions.join(' × ')}</option>)}</select></label>
            </div>
            <div className={css.actions}><p>Nepal: Nepali calendar anniversaries. International: Gregorian anniversaries. Web research required.</p><div className={css.buttons}><button className={styles.button} disabled={busy} onClick={() => void create()}>Start blank story</button><button className={styles.primary} disabled={busy || !date} onClick={() => setPromptOpen(true)}>New history post<ArrowUpRight size={16} /></button></div></div>
        </section>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <section aria-label="History story preview" className={css.library}>
            <div className={css.libraryHeading}><div><span className={css.eyebrow}>ONE DESIGN / A CONTINUOUS STORY</span><h2>Cover first. Context follows.</h2></div></div>
            <p className={css.note}>These examples show the two page roles. A new story starts with one blank cover; add paragraph pages in the editor or let the prompt prepare them.</p>
            <div className={css.grid} ref={previews}>{[{ design: cover, title: '1. Main page', description: 'Date, year, headline and a short introduction.' }, { design: paragraph, title: '2. Paragraph page · optional', description: 'The full explanation. Add more pages only when required.' }].map(({ design, title, description }) => <article className={css.card} key={title}>
                <div data-history-preview className={css.preview} style={{ aspectRatio: `${width} / ${height}` }} aria-hidden="true" inert><div style={{ width: 360, height: 360 * height / width, transform: `scale(${previewWidth / 360})` }}><Artwork design={design} /></div></div>
                <div className={css.caption}><h3>{title}</h3><p>{description}</p></div>
            </article>)}</div>
        </section>
        {promptOpen && <PromptCreationModal scope={scope} initialKind="history" initialOptions={{ template: 'on-this-day', language, format, historyDate: date }} onClose={() => setPromptOpen(false)} onOpen={draft => { setPromptOpen(false); onOpenDraft(draft); }} />}
    </main></div>;
}

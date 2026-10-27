"use client";

import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { z } from 'zod';
import { dailyEdition, type DailyEdition } from '@/lib/post-studio/daily';
import { editionCaption, editionDrafts } from '@/lib/post-studio/carousel';
import { createDraftCollection, type PostDraft } from '@/lib/post-studio/drafts';
import { carouselEntries, packageCarousel } from '@/lib/post-studio/package';
import { artworkBytes, download } from '@/lib/post-studio/export';
import { Artwork } from './Artwork';
import { Modal } from './Controls';
import styles from './PostStudio.module.css';

export default function DailyEditions({ scope, onOpen, canExport, canEdit, canSubmit, canApprove }: {
    scope: string; onOpen: (draft: PostDraft) => void; canExport: boolean; canEdit: boolean; canSubmit: boolean; canApprove: boolean;
}) {
    const [editions, setEditions] = useState<DailyEdition[] | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [language, setLanguage] = useState<'ne' | 'en'>('ne');
    const [captions, setCaptions] = useState<DailyEdition['caption'] | null>(null);
    const [busy, setBusy] = useState(false), [loading, setLoading] = useState(false);
    const [error, setError] = useState(''), [progress, setProgress] = useState('');
    const lock = useRef(false);
    const edition = editions?.find(item => item.id === selected);
    const refresh = async () => {
        setLoading(true); setError('');
        try {
            const response = await fetch('/api/admin/studio/editions', { credentials: 'same-origin', cache: 'no-store' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Could not load editions.');
            setEditions(z.object({ editions: z.array(dailyEdition) }).parse(data).editions);
        } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not load editions.'); }
        finally { setLoading(false); }
    };
    const run = async (operation: () => Promise<void>) => {
        if (lock.current) return; lock.current = true; setBusy(true); setError(''); setProgress('');
        try { await operation(); } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to prepare edition.'); }
        finally { lock.current = false; setBusy(false); }
    };
    const openSlide = (item: DailyEdition, index: number) => run(async () => {
        const collection = await createDraftCollection(scope, editionDrafts(item));
        const chosen = collection.find(draft => draft.id === `daily-${item.id}-${language}-${index}`);
        if (!chosen) throw new Error('Slide unavailable.');
        setSelected(null); onOpen(chosen);
    });
    const patch = (changes: { caption?: DailyEdition['caption']; status?: 'draft' | 'in_review' | 'ready' }) => run(async () => {
        if (!edition) return;
        const response = await fetch('/api/admin/studio/editions', { method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: edition.id, updatedAt: edition.updatedAt, ...changes }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not save edition.');
        setCaptions(null); await refresh();
    });
    const exportCarousel = (item: DailyEdition, languages: 'ne' | 'en' | 'both') => run(async () => {
        const entries = await carouselEntries(scope, item, languages);
        const images: Record<string, Uint8Array> = {};
        const host = document.createElement('div');
        host.className = `${styles.studio} ${styles.offscreen}`; host.setAttribute('aria-hidden', 'true');
        document.body.appendChild(host);
        const root = createRoot(host);
        try {
            for (const [index, entry] of entries.entries()) {
                setProgress(`Rendering ${index + 1} / ${entries.length} · ${entry.path}`);
                flushSync(() => root.render(<Artwork design={entry.draft.design} />));
                await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
                const node = host.firstElementChild as HTMLElement;
                images[entry.path] = await artworkBytes(node, entry.draft.design.format);
            }
            download(packageCarousel(item, images, languages), `the-leaders-${item.date}-${item.edition}-${languages}.zip`, 'application/zip');
            setProgress('Carousel ZIP downloaded.');
        } finally { root.unmount(); host.remove(); }
    });

    return <section className={styles.editionList}>
        <div className={styles.between}><h2>Daily social editions</h2><button className={styles.button} disabled={busy || loading || Boolean(captions)} onClick={() => { void refresh(); }}>{loading ? 'Loading…' : editions ? 'Refresh' : 'Load editions'}</button></div>
        <p className={styles.subtle}>7 AM morning brief · 9 PM day in review · Nepal time</p>
        <p className={styles.subtle}>English + Nepali captions and portrait carousel copy. Source-linked drafts for your review.</p>
        {editions?.length === 0 && <p className={styles.subtle}>The first researched edition will appear here. Sections without verified sources are omitted.</p>}
        {error && !edition && <p role="alert" className={styles.error}>{error}</p>}
        {editions?.slice(0, 4).map(item => <button key={item.id} className={styles.choice} style={{ textAlign: 'left', justifyContent: 'flex-start' }} onClick={() => { setSelected(item.id); setError(''); setProgress(''); }}><span>{item.edition === 'morning' ? '☀' : '☾'}</span><span>{item.title.en}<small className={styles.subtle} style={{ display: 'block' }}>{item.date} · {item.slides.length + 1} slides / language · EN / नेपाली · {item.status.replace('_', ' ')}</small></span></button>)}
        {edition && <Modal labelledBy="daily-title" blocked={busy || Boolean(captions)} onClose={() => setSelected(null)}>
            <div className={styles.between}><h2 id="daily-title">{edition.title[language]}</h2><button className={styles.button} disabled={busy || Boolean(captions)} onClick={() => setSelected(null)}>Close</button></div>
            <p className={styles.subtle}>{edition.date} · {edition.status.replace('_', ' ')}</p>
            <div className={styles.row}>{(['ne', 'en'] as const).map(lang => <button key={lang} className={`${styles.choice} ${lang === language ? styles.active : ''}`} onClick={() => setLanguage(lang)}>{lang === 'ne' ? 'नेपाली' : 'English'}</button>)}</div>
            <button className={styles.primary} disabled={busy || Boolean(captions)} onClick={() => { void openSlide(edition, 0); }}>Prepare both carousels</button>
            <p className={styles.subtle}>Creates 1080 × 1350 drafts in both languages. Finish slides in the editor, then export the complete set.</p>
            {canExport && <div className={styles.field}><strong>Export carousel</strong><p className={styles.subtle}>Numbered PNGs and captions in one ZIP. Uses your saved edits.</p><div className={styles.row}>{(['ne', 'en', 'both'] as const).map(lang => <button key={lang} className={styles.button} disabled={busy || Boolean(captions)} onClick={() => { void exportCarousel(edition, lang); }}>{lang === 'ne' ? 'नेपाली ZIP' : lang === 'en' ? 'English ZIP' : 'Both languages ZIP'}</button>)}</div></div>}
            {edition.slides.map((slide, index) => <div className={styles.edition} key={index}><small className={styles.subtle}>{index + 2} / {edition.slides.length + 1} · {slide.section}</small><strong>{slide.headline[language]}</strong><p>{slide.body[language]}</p>{slide.sourceIds.map(id => { const source = edition.sources.find(value => value.id === id); return source && /^https:\/\//i.test(source.url) ? <a className={styles.source} key={id} href={source.url} target="_blank" rel="noreferrer">{source.name} ↗</a> : null; })}<button className={styles.button} disabled={busy || Boolean(captions)} onClick={() => { void openSlide(edition, index + 1); }}>Open this slide in editor</button></div>)}
            <h2>Caption</h2><p style={{ whiteSpace: 'pre-wrap' }}>{edition.caption[language]}</p>
            <button className={styles.button} onClick={() => { void run(async () => { await navigator.clipboard.writeText(editionCaption(edition)); setProgress('Bilingual captions copied.'); }); }} disabled={busy || Boolean(captions)}>Copy bilingual captions</button>
            {canEdit && !captions && <button className={styles.button} disabled={busy} onClick={() => setCaptions(edition.caption)}>Edit bilingual captions</button>}
            {captions && <><p className={styles.subtle}>Changing captions returns this edition to Draft for another review. Slide designs remain in the editor.</p>{(['ne', 'en'] as const).map(lang => <label className={styles.field} key={lang}><span>{lang === 'ne' ? 'नेपाली क्याप्सन' : 'English caption'}</span><textarea className={styles.input} rows={5} maxLength={1800} value={captions[lang]} disabled={busy} onChange={event => setCaptions({ ...captions, [lang]: event.target.value })} /><small>{captions[lang].length} / 1800</small></label>)}<button className={styles.primary} disabled={busy || !captions.en.trim() || !captions.ne.trim()} onClick={() => { void patch({ caption: captions }); }}>Save captions</button><button className={styles.button} disabled={busy} onClick={() => setCaptions(null)}>Cancel edits</button></>}
            {!captions && <div className={styles.row}>{edition.status === 'draft' && canSubmit && <button className={styles.button} disabled={busy} onClick={() => { void patch({ status: 'in_review' }); }}>Send to review</button>}{edition.status === 'in_review' && canApprove && <button className={styles.primary} disabled={busy} onClick={() => { void patch({ status: 'ready' }); }}>Mark ready</button>}{edition.status !== 'draft' && canSubmit && <button className={styles.button} disabled={busy} onClick={() => { void patch({ status: 'draft' }); }}>Return to draft</button>}</div>}
            {edition.omissions.map((omission, index) => <p key={index} className={styles.subtle}>{omission[language]}</p>)}
            {error && <p role="alert" className={styles.error}>{error}</p>}{progress && <p role="status" className={styles.subtle}>{progress}</p>}
        </Modal>}
    </section>;
}

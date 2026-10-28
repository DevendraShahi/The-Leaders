"use client";
import PublicationChecklist from './PublicationChecklist';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Bookmark, ChevronLeft, ChevronRight, Copy, Download, Heart, Instagram, MessageCircle, Pencil, Send } from 'lucide-react';
import type { PostDraft } from '@/lib/post-studio/drafts';
import { postOutputDimensions } from '@/lib/post-studio/types';
import { exportCarouselZip, generateInstagramCaption } from '@/lib/post-studio/carousel';
import { artworkBytes, download } from '@/lib/post-studio/export';
import { Artwork } from './Artwork';
import styles from './PostStudio.module.css';
import css from './InstagramPreviewPage.module.css';

type Props = { slides: PostDraft[]; activeSlideIndex: number; onSelectSlide: (index: number) => void; onBack: () => void; onEdit: (index: number) => void };
export default function InstagramPreviewPage({ slides, activeSlideIndex, onSelectSlide, onBack, onEdit }: Props) {
    const currentIndex = Math.max(0, Math.min(activeSlideIndex, slides.length - 1));
    const current = slides[currentIndex], hasCurrent = Boolean(current);
    const media = useRef<HTMLDivElement>(null), nodes = useRef(new Map<string, HTMLDivElement>()), lock = useRef(false);
    const touch = useRef<{ x: number; y: number } | null>(null), previousIndex = useRef(currentIndex);
    const [width, setWidth] = useState(0), [expanded, setExpanded] = useState(false), [busy, setBusy] = useState(false);
    const [status, setStatus] = useState(''), [error, setError] = useState('');
    useEffect(() => {
        const element = media.current; if (!element) return;
        const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
        observer.observe(element); return () => observer.disconnect();
    }, [hasCurrent]);
    useEffect(() => {
        if (previousIndex.current !== currentIndex) { setExpanded(false); setStatus(''); setError(''); media.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
        previousIndex.current = currentIndex;
    }, [currentIndex]);
    useEffect(() => {
        const keyboard = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (busy || target.isContentEditable || target.closest('input,textarea,select')) return;
            if (event.key === 'ArrowLeft' && currentIndex > 0) { event.preventDefault(); onSelectSlide(currentIndex - 1); }
            if (event.key === 'ArrowRight' && currentIndex < slides.length - 1) { event.preventDefault(); onSelectSlide(currentIndex + 1); }
            if (event.key === 'Escape') onBack();
        };
        window.addEventListener('keydown', keyboard); return () => window.removeEventListener('keydown', keyboard);
    }, [busy, currentIndex, slides.length, onBack, onSelectSlide]);
    if (!current) return <div className={styles.studio}><main className={css.empty}><h1>No pages to preview</h1><button className={styles.button} onClick={onBack}>Back to Studio</button></main></div>;
    const [w, h] = postOutputDimensions[current.design.format];
    const caption = generateInstagramCaption([current]);
    const exportFiles = async (all = false) => {
        if (lock.current) return; lock.current = true; setBusy(true); setError(''); setStatus('Preparing images…');
        try {
            if (all) {
                const elements = slides.map(slide => nodes.current.get(slide.id));
                if (elements.some(node => !node)) throw new Error('The pages are still loading. Wait a moment and retry.');
                await exportCarouselZip(elements as HTMLDivElement[], slides, 'the-leaders-carousel.zip', setStatus);
                setStatus('All pages downloaded in order, with the caption.');
            } else {
                const node = nodes.current.get(current.id); if (!node) throw new Error('The artwork is still loading. Wait a moment and retry.');
                const bytes = await artworkBytes(node, current.design.format, setStatus);
                download(bytes, `the-leaders-page-${currentIndex + 1}.png`); setStatus(`Page ${currentIndex + 1} downloaded.`);
            }
        } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not export the artwork.'); setStatus(''); }
        finally { lock.current = false; setBusy(false); }
    };
    return <div className={`${styles.studio} ${css.page}`}>
        <header className={css.toolbar}>
            <div className={css.heading}><button className={styles.button} disabled={busy} onClick={onBack}><ArrowLeft size={16} /><span>Back to editor</span></button><h1><Instagram size={18} />Instagram preview</h1></div>
            <nav className={css.navigation} aria-label="Preview page navigation">
                <button className={styles.iconButton} disabled={busy || currentIndex === 0} aria-label="Previous preview page" onClick={() => onSelectSlide(currentIndex - 1)}><ChevronLeft size={19} /></button>
                <label className={css.picker}><span>Page {currentIndex + 1} of {slides.length}</span><select className={styles.input} aria-label="Preview page" disabled={busy} value={currentIndex} onChange={event => onSelectSlide(Number(event.target.value))}>{slides.map((slide, index) => <option key={slide.id} value={index}>{index + 1}. {slide.design.headline || slide.name}</option>)}</select></label>
                <button className={styles.iconButton} disabled={busy || currentIndex === slides.length - 1} aria-label="Next preview page" onClick={() => onSelectSlide(currentIndex + 1)}><ChevronRight size={19} /></button>
            </nav>
        </header>
        <main className={css.layout}>
            <section className={css.feed} aria-label="Instagram post preview">
                <div className={css.profile}><img src="/studio/leaders.png" alt="The Leaders" /><div><strong>theleaders.press</strong><small>The Leaders</small></div><span>{current.design.format}</span></div>
                <div ref={media} data-testid="instagram-preview-media" className={css.media} style={{ aspectRatio: `${w}/${h}` }} role="img" aria-label={current.design.headline || `Post page ${currentIndex + 1}`}
                    onTouchStart={event => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
                    onTouchEnd={event => { const start = touch.current; touch.current = null; if (!start || busy) return; const dx = start.x - event.changedTouches[0].clientX, dy = start.y - event.changedTouches[0].clientY; if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy) * 1.25) return; const next = currentIndex + (dx > 0 ? 1 : -1); if (next >= 0 && next < slides.length) onSelectSlide(next); }}>
                    <div className={css.artwork} inert aria-hidden="true" style={{ width: 360, height: 360 * h / w, transform: `scale(${width / 360})`, visibility: width ? 'visible' : 'hidden' }}><Artwork design={current.design} /></div>
                    {slides.length > 1 && <span className={css.counter}>{currentIndex + 1}/{slides.length}</span>}
                </div>
                <div className={css.feedIcons} aria-hidden="true"><Heart size={23} /><MessageCircle size={23} /><Send size={22} /><Bookmark size={22} /></div>
                <div className={css.feedCaption}><strong>theleaders.press</strong><p>{expanded || caption.length <= 180 ? caption : `${caption.slice(0, 180)}…`}</p>{caption.length > 180 && <button aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? 'Show less' : 'Read full caption'}</button>}</div>
            </section>
            <aside className={css.details} aria-label="Preview actions">
                <div className={css.meta}><span>PAGE {currentIndex + 1} / {slides.length}</span><h2>{current.design.headline || current.name}</h2><p>{w} × {h} px · {current.design.format}</p></div>
                <button className={styles.primary} disabled={busy} onClick={() => onEdit(currentIndex)}><Pencil size={16} />Edit this page</button>
                <PublicationChecklist slides={slides} />
                <button className={styles.button} disabled={busy} onClick={() => void exportFiles()}><Download size={16} />Download current PNG</button>
                {slides.length > 1 && <button className={styles.button} disabled={busy} onClick={() => void exportFiles(true)}><Download size={16} />Download all as ZIP</button>}
                <label className={styles.field}><span>Caption for this post</span><textarea className={styles.input} readOnly rows={5} value={caption} /></label>
                <button className={styles.button} onClick={async () => { try { await navigator.clipboard.writeText(caption); setStatus('Caption copied.'); } catch { setError('Clipboard unavailable. Select and copy the caption above.'); } }}><Copy size={16} />Copy caption</button>
                {busy && <progress aria-label="Preparing preview export" />}{status && <p className={css.status} role="status">{status}</p>}{error && <p className={styles.error} role="alert">{error}</p>}
            </aside>
        </main>
        <div className={styles.offscreen} inert aria-hidden="true">{slides.map(slide => <Artwork key={slide.id} design={slide.design} ref={node => { if (node) nodes.current.set(slide.id, node); else nodes.current.delete(slide.id); }} />)}</div>
    </div>;
}

"use client";
import { Copy, Download, Layers3, X } from 'lucide-react';
import type { PostDraft } from '@/lib/post-studio/drafts';
import { postOutputDimensions } from '@/lib/post-studio/types';
import { Modal } from './Controls';
import styles from './PostStudio.module.css';
import css from './ExportOptionsModal.module.css';

export default function ExportOptionsModal({ slides, activeIndex, disabled, onClose, onCurrent, onAll, onCopyCaption }: {
    slides: PostDraft[]; activeIndex: number; disabled: boolean; onClose: () => void;
    onCurrent: () => void; onAll: () => void; onCopyCaption: () => void;
}) {
    const current = slides[activeIndex];
    if (!current) return null;
    return <Modal labelledBy="export-options-title" blocked={disabled} onClose={onClose}>
        <div className={css.heading}><div><span>THE LEADERS / EXPORT</span><h2 id="export-options-title">Download your artwork</h2><p>Full-resolution files with the background, photos, logos and ad banner included.</p></div><button className={styles.iconButton} disabled={disabled} aria-label="Close export options" onClick={onClose}><X size={18} /></button></div>
        <div className={css.options}>
            <section className={css.option}><Download size={21} /><h3>Current page</h3><p className={css.story}>{current.design.headline || current.name}</p><small>Page {activeIndex + 1} · PNG · {postOutputDimensions[current.design.format].join(' × ')} px</small><button className={styles.primary} disabled={disabled} onClick={onCurrent}>Download this PNG</button></section>
            {slides.length > 1 && <section className={css.option}><Layers3 size={21} /><h3>All pages</h3><p>Numbered PNGs in page order, plus a caption.txt file.</p><small>{slides.length} pages · ZIP archive</small><button className={styles.button} disabled={disabled} onClick={onAll}>Download all as ZIP</button></section>}
        </div>
        <div className={css.caption}><div><strong>Post caption</strong><p>Copy the caption for the current page.</p></div><button className={styles.button} disabled={disabled} onClick={onCopyCaption}><Copy size={15} />Copy caption</button></div>
        <p className={css.note}>Images are checked and embedded before rendering. An unavailable image stops the download so you can fix it.</p>
    </Modal>;
}

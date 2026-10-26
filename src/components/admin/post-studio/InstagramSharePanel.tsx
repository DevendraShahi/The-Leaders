"use client";

import { useRef, useState } from 'react';
import { Copy, Download, ExternalLink, Instagram, X } from 'lucide-react';
import { strToU8, zipSync } from 'fflate';
import type { PostDraft } from '@/lib/post-studio/drafts';
import { artworkBytes, download } from '@/lib/post-studio/export';
import { generateInstagramCaption } from '@/lib/post-studio/carousel';
import styles from './PostStudio.module.css';

type Prepared = { signature: string; files: File[]; caption: string };
export default function InstagramSharePanel({ slides, activeIndex, getNode, persist, disabled, setPreparing, onClose }: {
    slides: PostDraft[]; activeIndex: number; getNode: (id: string) => HTMLElement | undefined;
    persist: () => Promise<boolean>; disabled: boolean; setPreparing: (value: boolean) => void; onClose: () => void;
}) {
    const [all, setAll] = useState(false);
    const [prepared, setPrepared] = useState<Prepared | null>(null);
    const [status, setStatus] = useState('');
    const [working, setWorking] = useState(false);
    const lock = useRef(false);
    const chosen = all ? slides : [slides[activeIndex]];
    // Changes to content, format, page order, or selection invalidate prepared images.
    const signature = JSON.stringify(chosen.map(page => ({ id: page.id, design: page.design })));
    const current = prepared?.signature === signature ? prepared : null;
    const canShare = Boolean(current && typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: current.files }));

    async function prepare() {
        if (disabled || lock.current) return;
        lock.current = true; setWorking(true); setPreparing(true); setStatus('Preparing full-resolution images…'); setPrepared(null);
        try {
            if (!await persist()) { setStatus('Save the draft successfully before sharing.'); return; }
            const files: File[] = [];
            for (const [index, page] of chosen.entries()) {
                const node = getNode(page.id);
                if (!node) throw new Error('Pages are still loading. Try again.');
                const bytes = await artworkBytes(node, page.design.format);
                files.push(new File([bytes as BlobPart], `the-leaders-${String(index + 1).padStart(2, '0')}.png`, { type: 'image/png' }));
            }
            setPrepared({ signature, files, caption: generateInstagramCaption(chosen) });
            setStatus('Images ready. Copy the caption, then share or download.');
        } catch (error) { setStatus(error instanceof Error ? error.message : 'Could not prepare images. Please try again.'); }
        finally { lock.current = false; setWorking(false); setPreparing(false); }
    }
    async function share() {
        if (!current || disabled || lock.current) return;
        lock.current = true; setWorking(true);
        try {
            // Called directly from a second click: rendering must not consume user activation.
            await navigator.share({ files: current.files });
            setStatus('Images handed to your device. Finish posting in Instagram.');
        } catch (error) {
            setStatus(error && typeof error === 'object' && 'name' in error && error.name === 'AbortError'
                ? 'Sharing cancelled. Your images are still ready.'
                : 'Sharing is unavailable here. Download the images below and upload them in Instagram.');
        } finally { lock.current = false; setWorking(false); }
    }
    async function saveImages() {
        if (!current || lock.current || disabled) return;
        lock.current = true; setWorking(true);
        try {
            if (current.files.length === 1) download(new Uint8Array(await current.files[0].arrayBuffer()), current.files[0].name);
            else {
                const entries: Record<string, Uint8Array> = { 'caption.txt': strToU8(current.caption) };
                for (const file of current.files) entries[file.name] = new Uint8Array(await file.arrayBuffer());
                download(zipSync(entries), 'the-leaders-instagram.zip', 'application/zip');
            }
            setStatus(current.files.length > 1 ? 'ZIP downloaded. Extract it and select the numbered PNGs in Instagram.' : 'PNG downloaded. Upload it in Instagram.');
        } catch { setStatus('Download failed. Please try again.'); }
        finally { lock.current = false; setWorking(false); }
    }
    async function copy() {
        if (!current) return;
        try { await navigator.clipboard.writeText(current.caption); setStatus('Caption copied. Paste it in Instagram after selecting your images.'); }
        catch { setStatus('Select and copy the caption below. Clipboard access is unavailable.'); }
    }
    return <section className={styles.instagramShare} aria-labelledby="instagram-share-title">
        <div className={styles.instagramShareHeading}>
            <div><h2 id="instagram-share-title"><Instagram size={18} />Share to Instagram</h2><p>Choose Instagram in your device’s share sheet, then finish your post there.</p></div>
            <button className={styles.iconButton} aria-label="Close Instagram sharing" disabled={working} onClick={onClose}><X size={18} /></button>
        </div>
        <div className={styles.instagramShareActions}>
            <label className={styles.field}><span>Images to share</span><select className={styles.input} value={all ? 'all' : 'current'} disabled={disabled || working} onChange={event => { setAll(event.target.value === 'all'); setStatus(''); }}>
                <option value="current">Current page ({activeIndex + 1})</option>
                {slides.length > 1 && <option value="all">All {slides.length} pages in order</option>}
            </select></label>
            {!current && <button className={styles.primary} disabled={disabled || working} onClick={() => void prepare()}>{working ? 'Preparing…' : 'Prepare images'}</button>}
            {current && <>
                <button className={styles.button} disabled={disabled || working} onClick={() => void copy()}><Copy size={15} />Copy caption</button>
                {canShare && <button className={styles.primary} disabled={disabled || working} onClick={() => void share()}><Instagram size={16} />Share images</button>}
                <button className={styles.button} disabled={disabled || working} onClick={() => void saveImages()}><Download size={15} />Download {current.files.length > 1 ? 'ZIP' : 'PNG'}</button>
                <a className={styles.button} href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"><ExternalLink size={15} />Open Instagram</a>
            </>}
        </div>
        {current && !canShare && <p className={styles.helpText}>This browser cannot share these image files directly. Download {current.files.length > 1 ? 'and extract the ZIP' : 'the PNG'}, then upload in Instagram.</p>}
        {current && canShare && <p className={styles.helpText}>Instagram appears only if your device offers it for image sharing. Copy the caption separately; Instagram may ignore shared text.</p>}
        {current && <label className={styles.field}><span>Instagram caption</span><textarea className={styles.input} readOnly rows={3} value={current.caption} /></label>}
        {status && <p role="status" className={styles.helpText}>{status}</p>}
    </section>;
}

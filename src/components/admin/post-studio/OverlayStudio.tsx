"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, ImagePlus, Layers, Upload } from 'lucide-react';
import { defaultOverlaySettings, drawMediaOverlay, overlayDimensions, overlayTemplates, type OverlaySettings } from '@/lib/post-studio/media-overlay';
import { canvasPng, downloadOverlay, exportOverlayVideo, overlayFontsReady } from '@/lib/post-studio/media-overlay-export';
import { postOutputDimensions } from '@/lib/post-studio/types';
import { StudioDisclosure } from './StudioDisclosure';
import s from './PostStudio.module.css';
import css from './OverlayStudio.module.css';

type Media = { url: string; name: string; kind: 'image' | 'video'; width: number; height: number; image?: HTMLImageElement };
export default function OverlayStudio({ onBack }: { onBack: () => void }) {
    const [settings, setSettings] = useState<OverlaySettings>({ ...defaultOverlaySettings });
    const [media, setMedia] = useState<Media | null>(null), [logo, setLogo] = useState<HTMLImageElement | null>(null);
    const [ready, setReady] = useState(false), [loading, setLoading] = useState(false), [busy, setBusy] = useState(false);
    const [error, setError] = useState(''), [progress, setProgress] = useState(0), [notice, setNotice] = useState('');
    const canvas = useRef<HTMLCanvasElement>(null), video = useRef<HTMLVideoElement>(null), input = useRef<HTMLInputElement>(null);
    const abort = useRef<AbortController | null>(null), lock = useRef(false), generation = useRef(0);
    const patch = <K extends keyof OverlaySettings>(key: K, value: OverlaySettings[K]) => setSettings(previous => ({ ...previous, [key]: value }));
    useEffect(() => {
        let active = true;
        const image = new Image();
        image.onload = () => { if (active) setLogo(image); };
        image.onerror = () => { if (active) setError('The Leaders logo could not be loaded. Refresh to retry.'); };
        image.src = '/studio/leaders.png';
        void overlayFontsReady().then(() => { if (active) setReady(true); }).catch(() => { if (active) setError('Brand fonts could not be loaded. Refresh to retry.'); });
        return () => { active = false; generation.current++; abort.current?.abort(); };
    }, []);
    useEffect(() => () => { if (media) URL.revokeObjectURL(media.url); }, [media]);
    const dimensions = overlayDimensions(settings.format, media?.width || 1080, media?.height || 1350);
    const draw = useCallback(() => {
        if (!canvas.current || !logo || !ready) return;
        const source = media?.kind === 'image' ? media.image : media?.kind === 'video' && video.current && video.current.readyState >= 2 ? video.current : undefined;
        drawMediaOverlay(canvas.current, settings, logo, source && media ? { source, width: media.width, height: media.height } : undefined);
    }, [logo, media, ready, settings]);
    useEffect(() => {
        draw();
        if (media?.kind !== 'video') return;
        let frame = 0;
        const tick = () => { if (video.current && !video.current.paused) draw(); frame = requestAnimationFrame(tick); }; frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [draw, media?.kind]);
    const upload = async (file?: File) => {
        if (!file || lock.current) return;
        const token = ++generation.current;
        setLoading(true); setError(''); setNotice('');
        let url = '';
        try {
            const kind = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') && !file.type.includes('svg') ? 'image' : null;
            if (!kind) throw new Error('Choose a photo (JPG, PNG, WebP, AVIF) or a video (MP4, WebM, MOV). SVG files are not supported.');
            url = URL.createObjectURL(file);
            let width: number, height: number, image: HTMLImageElement | undefined;
            if (kind === 'image') {
                image = new Image(); image.src = url; await image.decode(); width = image.naturalWidth; height = image.naturalHeight;
            } else {
                const probe = document.createElement('video'); probe.preload = 'metadata';
                try {
                    await new Promise<void>((resolve, reject) => {
                        const timeout = setTimeout(() => { probe.onloadedmetadata = null; probe.onerror = null; reject(new Error('Video metadata could not be read. Try an MP4 or WebM file.')); }, 15000);
                        probe.onloadedmetadata = () => { clearTimeout(timeout); resolve(); };
                        probe.onerror = () => { clearTimeout(timeout); reject(new Error('This video cannot be opened by your browser. Try an MP4 or WebM file.')); };
                        probe.src = url;
                    });
                    width = probe.videoWidth; height = probe.videoHeight;
                } finally { probe.removeAttribute('src'); probe.load(); }
            }
            if (!width || !height) throw new Error('The file has no readable picture dimensions.');
            if (token !== generation.current) { URL.revokeObjectURL(url); return; }
            video.current?.pause(); setMedia({ url, name: file.name, kind, width, height, image });
        } catch (failure) {
            if (url) URL.revokeObjectURL(url);
            if (token === generation.current) setError(failure instanceof Error ? failure.message : 'Could not open that file.');
        } finally { if (token === generation.current) setLoading(false); if (input.current) input.current.value = ''; }
    };
    const exportFile = async (transparent = false) => {
        if (lock.current || !logo || !ready || (!media && !transparent)) return;
        lock.current = true; setBusy(true); setProgress(0); setError(''); setNotice(''); video.current?.pause();
        const controller = new AbortController(); abort.current = controller;
        try {
            await overlayFontsReady();
            const base = (media?.name.replace(/\.[^.]+$/, '') || 'the-leaders').replace(/[^\p{L}\p{N}_-]/gu, '-');
            if (media?.kind === 'video' && !transparent) {
                const blob = await exportOverlayVideo(media.url, settings, logo, controller.signal, setProgress);
                if (!controller.signal.aborted) { downloadOverlay(blob, `${base}-leaders.${blob.type.includes('mp4') ? 'mp4' : 'webm'}`); setNotice('Branded video downloaded.'); }
            } else {
                const output = document.createElement('canvas'); [output.width, output.height] = dimensions;
                const source = media?.image;
                drawMediaOverlay(output, settings, logo, source && media ? { source, width: media.width, height: media.height } : undefined, transparent);
                const blob = await canvasPng(output);
                if (!controller.signal.aborted) { downloadOverlay(blob, `${base}-${transparent ? 'overlay' : 'leaders'}.png`); setNotice(transparent ? 'Transparent overlay downloaded for your video editor.' : 'Branded photo downloaded.'); }
            }
        } catch (failure) {
            if (controller.signal.aborted) setNotice('Export cancelled. Your media and settings are still here.');
            else setError(failure instanceof Error ? failure.message : 'Export failed. Please retry.');
        } finally { lock.current = false; abort.current = null; setBusy(false); }
    };
    const range = (key: 'logoSize' | 'watermark' | 'shade' | 'focusX' | 'focusY', title: string, min: number, max: number) => <label className={s.field}><span>{title}<output className={css.value}>{settings[key]}%</output></span><input aria-label={title} type="range" min={min} max={max} value={settings[key]} onChange={event => patch(key, Number(event.target.value))} /></label>;
    return <div className={s.studio}><main className={css.desk}>
        <header className={css.header}><div><button className={s.button} disabled={busy} onClick={onBack}><ArrowLeft size={16} />Studio</button><p className={css.eyebrow}>THE LEADERS / VISUAL DESK</p><h1>Your footage.<br /><span>Our signature.</span></h1><p className={s.subtle}>Branded overlays for photos and videos.</p></div><div className={css.brand}><img src="/studio/leaders.png" alt="The Leaders" /><span>PHOTO + VIDEO<br />OVERLAY STUDIO</span></div></header>
        <div className={css.workspace}>
            <section className={css.stage} aria-label="Overlay preview">
                <div className={css.meta}><span>{media ? media.kind === 'video' ? 'VIDEO PREVIEW' : 'PHOTO PREVIEW' : 'DESIGN PREVIEW'}</span><span>{dimensions.join(' × ')}</span></div>
                <div className={css.frame}><canvas ref={canvas} width={dimensions[0]} height={dimensions[1]} aria-label="The Leaders branded media preview" />{!media && <div className={css.empty}><ImagePlus size={32} /><h2>Start with your photo or video</h2><p>The logo and overlay stay in place as your video plays.</p><button className={s.primary} disabled={busy || loading} onClick={() => input.current?.click()}><Upload size={16} />Upload media</button></div>}</div>
                {media?.kind === 'video' && <div className={css.playback}><span>Playback · muted preview; export retains source audio</span><video key={media.url} ref={video} src={media.url} controls muted playsInline preload="auto" onLoadedData={draw} onSeeked={draw} onError={() => setError('This video could not be decoded. Try an MP4 or WebM file.')} aria-label="Source video playback" /></div>}
                <p className={css.filename}>{media?.name || 'No media selected'} · {settings.format === 'original' ? 'Original proportions · up to 1920 px' : settings.format}</p>
            </section>
            <aside className={css.inspector} aria-label="Overlay settings"><fieldset disabled={busy}>
                <div className={css.upload}><button className={s.button} disabled={loading} onClick={() => input.current?.click()}><Upload size={16} />{loading ? 'Opening media…' : media ? 'Replace media' : 'Upload photo or video'}</button><input ref={input} className={css.file} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/*" aria-label="Upload photo or video" onChange={event => void upload(event.target.files?.[0])} /><p>Files stay in this browser session. Download your result before leaving.</p></div>
                <div className={css.templates}><h2><Layers size={16} />Choose an overlay</h2>{overlayTemplates.map(item => <button key={item.id} className={css.template} aria-pressed={settings.template === item.id} onClick={() => patch('template', item.id)}><span>{item.title}</span><small>{item.description}</small></button>)}</div>
                <StudioDisclosure title="Text & attribution" defaultOpen><div className={css.fields}>{settings.template !== 'signature' && <><label className={s.field}><span>Headline · optional</span><textarea className={s.input} rows={3} maxLength={140} value={settings.headline} placeholder="Write the story in English or नेपाली" onChange={event => patch('headline', event.target.value)} /></label><label className={s.field}><span>Label · optional</span><input className={s.input} maxLength={28} value={settings.label} placeholder="e.g. काठमाडौं / ON THE GROUND" onChange={event => patch('label', event.target.value)} /></label></>}<label className={s.field}><span>Photo / video credit · optional</span><input className={s.input} maxLength={90} value={settings.credit} placeholder="e.g. Video: Reporter name" onChange={event => patch('credit', event.target.value)} /></label></div></StudioDisclosure>
                <StudioDisclosure title="Logo & readability" defaultOpen><div className={css.fields}><label className={s.field}><span>Logo position</span><select className={s.input} value={settings.logoPosition} onChange={event => patch('logoPosition', event.target.value as OverlaySettings['logoPosition'])}><option value="top-left">Top left</option><option value="top-right">Top right</option></select></label>{range('logoSize', 'Logo size', 5, 16)}{range('watermark', 'Watermark opacity', 0, 30)}{range('shade', 'Text backdrop', 0, 95)}</div></StudioDisclosure>
                <StudioDisclosure title="Canvas & crop"><div className={css.fields}><label className={s.field}><span>Output format</span><select className={s.input} value={settings.format} onChange={event => patch('format', event.target.value as OverlaySettings['format'])}><option value="original">Keep original proportions</option>{Object.entries(postOutputDimensions).map(([id, size]) => <option value={id} key={id}>{id} · {size.join(' × ')}</option>)}</select></label><label className={s.field}><span>Media fit</span><select className={s.input} value={settings.fit} onChange={event => patch('fit', event.target.value as OverlaySettings['fit'])}><option value="cover">Fill canvas · crop edges</option><option value="contain">Show full frame · letterbox</option></select></label>{range('focusX', 'Horizontal framing', 0, 100)}{range('focusY', 'Vertical framing', 0, 100)}</div></StudioDisclosure>
            </fieldset>
            <div className={css.export}><button className={s.primary} disabled={busy || loading || !media || !logo || !ready} onClick={() => void exportFile()}><Download size={17} />{busy ? `Exporting · ${Math.round(progress)}%` : media?.kind === 'video' ? 'Export branded video' : 'Export branded photo'}</button><button className={s.button} disabled={busy || loading || !logo || !ready} onClick={() => void exportFile(true)}>Download transparent overlay PNG</button>{busy && <><progress aria-label="Export progress" value={progress} max={100} /><button className={s.button} onClick={() => abort.current?.abort()}>Cancel export</button></>}<p>Video export runs for the length of the clip. Keep this tab open. MP4 when supported; otherwise WebM. Transparent PNG works in your video editor too.</p></div>
            </aside>
        </div>
        {error && <p className={s.error} role="alert">{error}</p>}{notice && <p role="status" className={s.notice}>{notice}</p>}
    </main></div>;
}

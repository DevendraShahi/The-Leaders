"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, Download, Eye, EyeOff, ImagePlus, Layers3, LayoutTemplate, Lock, LockOpen, Redo2, Type, Undo2, X } from 'lucide-react';
import { updateDraft, type PostDraft } from '@/lib/post-studio/drafts';
import { postOutputDimensions, postTemplates, type PostDesign, type PostLayer } from '@/lib/post-studio/types';
import { getStudioCraft } from '@/lib/post-studio/studio-craft';
import { commitInteraction } from '@/lib/post-studio/history';
import { positionText, snapTextPosition } from '@/lib/post-studio/positioning';
import { setTextColor } from '@/lib/post-studio/text-colors';
import { setTextTypography } from '@/lib/post-studio/typography';
import { imageEffectControls, setImageEffect } from '@/lib/post-studio/image-effects';
import { moveImage, replaceImage, resetImageAdjustments, setImageFit, wheelMovement } from '@/lib/post-studio/image-positioning';
import { artworkBytes, download } from '@/lib/post-studio/export';
import { Artwork } from './Artwork';
import { ColorPicker, Section, Slider } from './Controls';
import BookReviewModal from './BookReviewModal';
import styles from './PostStudio.module.css';

type Tool = 'text' | 'layout' | 'media' | 'layers';
type Change = PostDesign | ((current: PostDesign) => PostDesign);
const layers: { key: PostLayer; label: string }[] = [{ key: 'visual', label: 'Visual' }, { key: 'kicker', label: 'Kicker' }, { key: 'headline', label: 'Headline' }, { key: 'supporting', label: 'Supporting' }, { key: 'footer', label: 'Byline' }];
const fields = [{ layer: 'headline', key: 'headline', label: 'Headline' }, { layer: 'supporting', key: 'summary', label: 'Summary' }, { layer: 'kicker', key: 'eyebrow', label: 'Kicker' }, { layer: 'footer', key: 'author', label: 'Byline' }] as const;

export default function PostEditor({ scope, draft, onClose, canExport = true }: { scope: string; draft: PostDraft; onClose: () => void; canExport?: boolean }) {
    const [design, setDesign] = useState(draft.design);
    const designRef = useRef(design);
    const [bookModalOpen, setBookModalOpen] = useState(false);
    const [tool, setTool] = useState<Tool>('text');
    const [selected, setSelected] = useState<PostLayer>('headline');
    const [reposition, setReposition] = useState(false);
    const [snap, setSnap] = useState(true);
    const [keepAdjustments, setKeepAdjustments] = useState(true);
    const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');
    const [issue, setIssue] = useState('');
    const [notice, setNotice] = useState('');
    const [imageIssue, setImageIssue] = useState('');
    const [overflow, setOverflow] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [history, setHistory] = useState({ undo: 0, redo: 0 });
    const undoRef = useRef<PostDesign[]>([]), redoRef = useRef<PostDesign[]>([]), interaction = useRef<PostDesign | null>(null);
    const stageRef = useRef<HTMLDivElement>(null), exportRef = useRef<HTMLDivElement>(null), previewRef = useRef<HTMLDivElement>(null), fileRef = useRef<HTMLInputElement>(null);
    const [stageSize, setStageSize] = useState({ width: 360, height: 480 });
    const mounted = useRef(true), dirty = useRef(false);
    const drag = useRef<{ x: number; y: number; design: PostDesign } | null>(null);
    const ballDrag = useRef<{ x: number; y: number } | null>(null);
    const ballRef = useRef<HTMLDivElement>(null);
    const wheelTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const updateHistory = () => setHistory({ undo: undoRef.current.length, redo: redoRef.current.length });
    const apply = useCallback((change: Change, record = true) => {
        const previous = designRef.current;
        const next = typeof change === 'function' ? change(previous) : change;
        if (JSON.stringify(previous) === JSON.stringify(next)) return;
        if (record) { undoRef.current = [...undoRef.current.slice(-39), previous]; redoRef.current = []; }
        designRef.current = next; dirty.current = true;
        setDesign(next); setSaveState('saving'); setIssue(''); setNotice('');
        setHistory({ undo: undoRef.current.length, redo: redoRef.current.length });
    }, []);
    const begin = useCallback(() => { if (!interaction.current) interaction.current = designRef.current; }, []);
    const end = useCallback(() => {
        const next = commitInteraction(interaction.current, designRef.current, undoRef.current);
        if (next !== undoRef.current) { undoRef.current = next; redoRef.current = []; }
        interaction.current = null; setHistory({ undo: undoRef.current.length, redo: redoRef.current.length });
    }, []);
    const live = useCallback((change: Change) => apply(change, !interaction.current), [apply]);
    const persist = useCallback(async () => {
        if (!dirty.current) return true;
        const snapshot = designRef.current;
        try {
            await updateDraft(scope, draft.id, { design: snapshot });
            if (snapshot === designRef.current) { dirty.current = false; if (mounted.current) setSaveState('saved'); }
            return true;
        } catch (error) {
            if (mounted.current) { setSaveState('error'); setIssue(error instanceof Error ? error.message : 'Keep the editor open and retry saving.'); }
            return false;
        }
    }, [scope, draft.id]);
    useEffect(() => { const timer = setTimeout(() => { void persist(); }, 380); return () => clearTimeout(timer); }, [design, persist]);
    useEffect(() => {
        mounted.current = true;
        const unload = (event: BeforeUnloadEvent) => { if (dirty.current) { event.preventDefault(); event.returnValue = ''; void persist(); } };
        window.addEventListener('beforeunload', unload);
        return () => { mounted.current = false; clearTimeout(wheelTimer.current); window.removeEventListener('beforeunload', unload); void persist(); };
    }, [persist]);
    useEffect(() => {
        const node = stageRef.current;
        if (!node) return;
        const observer = new ResizeObserver(entries => { const { width, height } = entries[0].contentRect; setStageSize({ width, height }); });
        observer.observe(node); return () => observer.disconnect();
    }, []);
    useEffect(() => {
        setImageIssue('');
        if (!design.imageUri) return;
        let active = true;
        const image = new Image();
        image.onerror = () => { if (active) setImageIssue('Photo unavailable. Replace it in Media before exporting.'); };
        image.src = design.imageUri;
        return () => { active = false; };
    }, [design.imageUri]);
    useEffect(() => {
        let active = true;
        void document.fonts.ready.then(() => {
            requestAnimationFrame(() => {
                if (!active) return;
                const nodes = exportRef.current?.querySelectorAll<HTMLElement>('[data-line-limit]');
                setOverflow(Array.from(nodes || []).some(node => node.scrollHeight > parseFloat(getComputedStyle(node).lineHeight) * Number(node.dataset.lineLimit) + 1));
            });
        });
        return () => { active = false; };
    }, [design]);

    const [outputW, outputH] = postOutputDimensions[design.format];
    const referenceH = 360 * outputH / outputW;
    const scale = Math.max(.1, Math.min((stageSize.width - 32) / 360, (stageSize.height - 64) / referenceH, 1.25));
    const select = (layer: PostLayer) => { setSelected(layer); setTool(layer === 'visual' ? 'media' : 'text'); setReposition(false); };
    const locked = design.lockedLayers.includes(selected);
    const mediaDisabled = !design.imageUri || design.lockedLayers.includes('visual') || design.hiddenLayers.includes('visual');
    useEffect(() => {
        const node = ballRef.current;
        if (!node) return;
        const wheel = (event: WheelEvent) => {
            if (mediaDisabled) return;
            event.preventDefault(); begin();
            const movement = wheelMovement(event.deltaX, event.deltaY, event.deltaMode, event.shiftKey);
            live(current => moveImage(current, movement.x, movement.y));
            clearTimeout(wheelTimer.current); wheelTimer.current = setTimeout(end, 180);
        };
        node.addEventListener('wheel', wheel, { passive: false });
        return () => node.removeEventListener('wheel', wheel);
    }, [tool, mediaDisabled, begin, end, live]);
    const update = <K extends keyof PostDesign>(key: K, value: PostDesign[K]) => apply(current => ({ ...current, [key]: value }));
    const toggle = (key: 'hiddenLayers' | 'lockedLayers', layer: PostLayer) => apply(current => ({ ...current, [key]: current[key].includes(layer) ? current[key].filter(item => item !== layer) : [...current[key], layer] }));
    const undo = (redo = false) => {
        end();
        const from = redo ? redoRef.current : undoRef.current, to = redo ? undoRef.current : redoRef.current;
        const next = from.pop();
        if (next) { to.push(designRef.current); apply(next, false); updateHistory(); }
    };
    const canvasDown = (event: PointerEvent<HTMLDivElement>) => {
        if (!(reposition || tool === 'media') || locked || design.hiddenLayers.includes(selected) || (selected === 'visual' && !design.imageUri)) return;
        if (event.target instanceof HTMLElement && event.target.closest('button')) return;
        event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
        begin(); drag.current = { x: event.clientX, y: event.clientY, design: designRef.current };
    };
    const canvasMove = (event: PointerEvent) => {
        const origin = drag.current; if (!origin) return;
        const dx = (event.clientX - origin.x) / scale, dy = (event.clientY - origin.y) / scale;
        if (selected === 'visual') live(() => moveImage(origin.design, dx, dy));
        else {
            const point = origin.design.textPositions[selected];
            live(current => positionText(current, selected, { x: snapTextPosition(point.x + dx / 360 * 100, snap), y: snapTextPosition(point.y + dy / referenceH * 100, snap) }));
        }
    };
    const canvasEnd = () => { if (drag.current) { drag.current = null; end(); } };
    const chooseFile = async (file?: File) => {
        if (!file || designRef.current.lockedLayers.includes('visual')) return;
        try {
            if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') throw new Error('Choose a PNG, JPEG, WebP or another raster photo.');
            if (file.size > 25 * 1024 * 1024) throw new Error('Choose an image smaller than 25 MB.');
            const uri = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Could not read photo.')); reader.readAsDataURL(file);
            });
            const image = new Image(); image.src = uri; await image.decode();
            apply(current => replaceImage(current, uri, keepAdjustments));
        } catch (error) { setIssue(error instanceof Error ? error.message : 'Could not add photo.'); }
    };
    const exportPost = async () => {
        if (!exportRef.current || exporting || !canExport) return;
        setExporting(true); setIssue(''); setNotice('');
        try {
            if (imageIssue && !design.hiddenLayers.includes('visual')) throw new Error(imageIssue);
            const bytes = await artworkBytes(exportRef.current, design.format);
            download(bytes, `${design.headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 42) || 'the-leaders-post'}.png`);
            setNotice('PNG downloaded');
        } catch (error) { setIssue(error instanceof Error ? error.message : 'Export failed.'); }
        finally { setExporting(false); }
    };
    const field = fields.find(item => item.layer === selected) || fields[0];
    const textLocked = design.lockedLayers.includes(field.layer);
    const slider = (label: string, value: number, min: number, max: number, change: (value: number) => Change, disabled = false, vertical = false) => <Slider label={label} value={value} min={min} max={max} disabled={disabled} vertical={vertical} onStart={begin} onChange={value => live(change(value))} onEnd={end} />;
    const choice = (label: string, active: boolean, action: () => void, disabled = false) => <button type="button" key={label} className={`${styles.choice} ${active ? styles.active : ''}`} aria-pressed={active} disabled={disabled} onClick={action}>{label}</button>;

    const isBookTemplate = design.template.startsWith('book-');
    const currentCraft = getStudioCraft(design.template);

    return <div className={`${styles.studio} ${styles.editor}`}>
        <header className={styles.header}>
            <div className={styles.row}><button className={styles.iconButton} aria-label="Close editor" onClick={async () => { if (await persist()) onClose(); }}><X /></button><h1 className={styles.grow}>{draft.name}</h1><button className={styles.primary} disabled={exporting || !canExport || Boolean(imageIssue && !design.hiddenLayers.includes('visual'))} onClick={() => { void exportPost(); }}><Download />{exporting ? 'Exporting…' : 'Export'}</button></div>
            <div className={styles.between}><button className={styles.saveState} onClick={() => { void persist(); }}><span className={`${styles.saveDot} ${saveState === 'saving' ? styles.saving : saveState === 'error' ? styles.failed : ''}`} />{saveState === 'saved' ? 'All changes saved' : saveState === 'saving' ? 'Saving changes…' : 'Save failed · click to retry'}</button><div className={styles.row}><button className={styles.iconButton} aria-label="Undo" disabled={!history.undo} onClick={() => undo()}><Undo2 /></button><button className={styles.iconButton} aria-label="Redo" disabled={!history.redo} onClick={() => undo(true)}><Redo2 /></button></div></div>
            {(issue || imageIssue || overflow) && <p className={styles.error} role="alert">{issue || imageIssue || 'Text exceeds this format’s line limit. Shorten it or reduce size/spacing before export.'}</p>}
            {notice && <p className={styles.notice} role="status">{notice}</p>}
        </header>
        <div className={styles.body}>
            <div ref={stageRef} className={styles.stage}>
                <div className={styles.canvasMeta}><span>{reposition ? 'Drag selected text' : design.format[0].toUpperCase() + design.format.slice(1)}</span><span>{outputW} × {outputH}</span></div>
                <div className={styles.canvasShell} style={{ width: 360 * scale, height: referenceH * scale }} onPointerDown={canvasDown} onPointerMove={canvasMove} onPointerUp={canvasEnd} onPointerCancel={canvasEnd}>
                    <div className={styles.scaledArtwork} style={{ transform: `scale(${scale})` }}><Artwork ref={previewRef} design={design} selected={selected} guides={reposition} onSelect={reposition ? undefined : select} onChooseImage={() => fileRef.current?.click()} /></div>
                </div>
            </div>
            <aside className={styles.inspector}>
                <div className={styles.tabs} role="tablist" aria-label="Editor tools">{([{ key: 'text', label: 'Text', Icon: Type }, { key: 'layout', label: 'Layout', Icon: LayoutTemplate }, { key: 'media', label: 'Media', Icon: ImagePlus }, { key: 'layers', label: 'Layers', Icon: Layers3 }] as const).map(({ key, label, Icon }) => <button key={key} role="tab" aria-selected={tool === key} className={styles.tab} onClick={() => { setTool(key); setReposition(false); if (key === 'media') setSelected('visual'); else if (key === 'text' && selected === 'visual') setSelected('headline'); }}><Icon />{label}</button>)}</div>
                <div className={styles.panel} role="tabpanel" aria-label={`${tool} controls`} key={tool}>
                    {tool === 'text' && <>
                        <div className={styles.row}>{fields.map(item => {
                            const cl = currentCraft.layers.find(l => l.key === item.layer);
                            return choice(cl ? cl.label : item.label, selected === item.layer, () => select(item.layer));
                        })}</div>
                        <label className={styles.field}><span>{(currentCraft.layers.find(l => l.key === field.layer)?.label || field.label)}{textLocked ? ' · locked' : ''}</span><textarea className={styles.input} aria-label={`Edit ${field.label.toLowerCase()}`} rows={4} disabled={textLocked} value={design[field.key]} onChange={event => update(field.key, field.key === 'eyebrow' ? event.target.value.toUpperCase() : event.target.value)} /></label>
                        {field.layer === 'kicker' && <label className={styles.field}><span>Category / Tag</span><input className={styles.input} aria-label="Edit category" disabled={textLocked} value={design.category} onChange={event => update('category', event.target.value.toUpperCase())} /></label>}
                        <Section title="Typography"><div className={styles.row}>{(['auto', 'onest', 'hind'] as const).map(font => choice(font === 'auto' ? 'Auto' : font === 'onest' ? 'Onest' : 'Hind', design.textTypography[field.layer].font === font, () => apply(current => setTextTypography(current, field.layer, { font })), textLocked))}</div><p className={styles.subtle}>Nepali uses Hind to keep vowel marks and joined letters intact.</p>
                            {([{ key: 'size', label: 'size', min: 60, max: 160 }, { key: 'lineSpacing', label: 'line spacing', min: 90, max: 180 }, { key: 'shadow', label: 'shadow', min: 0, max: 100 }] as const).map(setting => <div key={setting.key}>{slider(`${field.label} ${setting.label}`, setting.key === 'size' && field.layer === 'headline' ? design.headlineScale * 100 : design.textTypography[field.layer][setting.key], setting.min, setting.max, value => current => setTextTypography(current, field.layer, { [setting.key]: value }), textLocked)}</div>)}
                        </Section>
                        <Section title="Font color"><ColorPicker key={`${field.layer}-${design.textColors[field.layer]}`} label={field.label} color={design.textColors[field.layer]} disabled={textLocked} onChange={color => apply(current => setTextColor(current, field.layer, color))} /></Section>
                        <Section title="Position"><button className={styles.button} disabled={textLocked} onClick={() => apply(current => positionText(current, field.layer, { x: 0, y: 0 }))}>Reset position</button><label className={styles.row}><input type="checkbox" checked={snap} onChange={event => setSnap(event.target.checked)} />Snap to template position</label><button className={styles.button} disabled={textLocked || design.hiddenLayers.includes(field.layer)} aria-pressed={reposition} onClick={() => setReposition(!reposition)}>{reposition ? 'Done repositioning' : 'Reposition on canvas'}</button>
                            {(['x', 'y'] as const).map(axis => <div key={axis}>{slider(`${field.label} ${axis === 'x' ? 'horizontal' : 'vertical'} position`, design.textPositions[field.layer][axis], -50, 50, value => current => positionText(current, field.layer, { [axis]: value }), textLocked, axis === 'y')}</div>)}
                        </Section>
                        <div className={styles.field}><span>Alignment</span><div className={styles.row}>{(['left', 'center'] as const).map(alignment => choice(alignment === 'left' ? 'Align left' : 'Align center', design.textAlign === alignment, () => update('textAlign', alignment), textLocked))}</div></div>
                    </>}
                    {tool === 'layout' && <>
                        <div className={styles.field}><span>Post format</span><div className={styles.row}>{(Object.keys(postOutputDimensions) as PostDesign['format'][]).map(format => choice(format[0].toUpperCase() + format.slice(1), design.format === format, () => update('format', format)))}</div><p className={styles.subtle}>{outputW} × {outputH} px</p></div>
                        <div className={styles.field}><span>Artwork accent</span><ColorPicker key={design.accent} label="Artwork accent" color={design.accent} reset="#B71C1C" onChange={color => update('accent', color || '#B71C1C')} /></div>
                        <div className={styles.field}><span>Template</span>{postTemplates.map(template => <button key={template.key} className={`${styles.choice} ${design.template === template.key ? styles.active : ''}`} aria-pressed={design.template === template.key} onClick={() => apply(current => ({ ...current, template: template.key, ...template.patch }))}><span className={styles.grow}>{template.title}<small className={styles.subtle}> · {template.subtitle}</small></span></button>)}</div>
                    </>}
                    {tool === 'media' && <>
                        <div className={styles.field}><strong>{design.imageUri ? 'Background image' : 'Add a background'}</strong><p className={styles.subtle}>{design.imageUri ? 'Drag the image on the canvas to position it.' : 'Choose a photo from your device for this post.'}</p><button className={styles.primary} disabled={design.lockedLayers.includes('visual')} onClick={() => fileRef.current?.click()}><ImagePlus />{design.imageUri ? 'Replace image' : 'Choose image'}</button></div>
                        <label className={styles.row}><input type="checkbox" checked={keepAdjustments} onChange={event => setKeepAdjustments(event.target.checked)} />Keep adjustments on replace</label>
                        <div className={styles.field}><span>Image crop</span><div className={styles.row}>{choice('Fill canvas', design.imageFit === 'cover', () => apply(current => setImageFit(current, 'cover')), mediaDisabled)}{choice('Fit whole photo', design.imageFit === 'contain', () => apply(current => setImageFit(current, 'contain')), mediaDisabled)}</div></div>
                        <div className={styles.field}><span>Image position</span><div ref={ballRef} role="group" aria-label="Image scroll ball" aria-disabled={mediaDisabled} className={styles.ball}
                            onPointerDown={event => { if (mediaDisabled) return; event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); begin(); ballDrag.current = { x: event.clientX, y: event.clientY }; }}
                            onPointerMove={event => { const previous = ballDrag.current; if (!previous) return; live(current => moveImage(current, event.clientX - previous.x, event.clientY - previous.y)); ballDrag.current = { x: event.clientX, y: event.clientY }; }}
                            onPointerUp={() => { ballDrag.current = null; end(); }} onPointerCancel={() => { ballDrag.current = null; end(); }}><i style={{ transform: `rotate(${design.imageOffsetX * 2}deg) translate(${design.imageOffsetX / 12}px, ${design.imageOffsetY / 12}px)` }} /></div>
                            <div className={styles.row} style={{ justifyContent: 'center' }}>{([{ label: 'Move image left', dx: -1, dy: 0, Icon: ArrowLeft }, { label: 'Move image up', dx: 0, dy: -1, Icon: ArrowUp }, { label: 'Move image down', dx: 0, dy: 1, Icon: ArrowDown }, { label: 'Move image right', dx: 1, dy: 0, Icon: ArrowRight }]).map(({ label, dx, dy, Icon }) => <button key={label} className={styles.iconButton} aria-label={label} disabled={mediaDisabled} onClick={() => apply(current => moveImage(current, dx, dy))}><Icon /></button>)}</div>
                        </div>
                        {slider('Image zoom', design.imageZoom * 100, 100, 300, value => current => ({ ...current, imageZoom: value / 100 }), mediaDisabled)}
                        <Section title="Image effects"><button className={styles.button} disabled={mediaDisabled} onClick={() => apply(current => imageEffectControls.reduce((next, effect) => setImageEffect(next, effect.key, 0), current))}>Reset image effects</button>{imageEffectControls.map(effect => <div key={effect.key}>{slider(effect.label, design[effect.key], 0, 100, value => current => setImageEffect(current, effect.key, value), mediaDisabled)}</div>)}</Section>
                        <div className={styles.field}><span>Image tone</span><div className={styles.row}>{(['ink', 'clear', 'warm'] as const).map(tone => choice(tone[0].toUpperCase() + tone.slice(1), design.imageTone === tone, () => update('imageTone', tone), mediaDisabled))}</div></div>
                        <button className={styles.button} disabled={mediaDisabled} onClick={() => apply(resetImageAdjustments)}>Reset all image adjustments</button>
                        <div className={styles.row}><button className={styles.button} disabled={mediaDisabled} onClick={() => apply(current => ({ ...current, imageOffsetX: 0, imageOffsetY: 0 }))}>Reset position</button><button className={styles.button} disabled={!design.imageUri || design.lockedLayers.includes('visual')} onClick={() => update('imageUri', null)}>Remove image</button></div>
                    </>}
                    {tool === 'layers' && (
                        <div className={styles.craftContainer}>
                            <div className={styles.craftHeader}>
                                <div className={styles.between}>
                                    <span className={styles.craftBadge}>{currentCraft.badge}</span>
                                    <span className={styles.subtle} style={{ fontSize: 11, textTransform: 'uppercase' }}>
                                        {design.format} · {outputW} × {outputH}
                                    </span>
                                </div>
                                <h3 className={styles.craftTitle}>{currentCraft.name}</h3>
                                <p className={styles.subtle} style={{ fontSize: 12 }}>{currentCraft.description}</p>
                            </div>

                            {currentCraft.archetypes && (
                                <div className={styles.craftArchetypes}>
                                    <span className={styles.subtle} style={{ fontSize: 11, fontWeight: 600 }}>CRAFT SLIDE / ARCHETYPE:</span>
                                    <div className={styles.row}>
                                        {currentCraft.archetypes.map(arch => (
                                            <button
                                                key={arch.key}
                                                type="button"
                                                className={`${styles.craftArchetypePill} ${design.template === arch.key ? styles.active : ''}`}
                                                onClick={() => {
                                                    const matched = postTemplates.find(t => t.key === arch.key);
                                                    if (matched) {
                                                        apply(current => ({
                                                            ...current,
                                                            template: arch.key,
                                                            category: matched.patch.category ?? current.category,
                                                            eyebrow: matched.patch.eyebrow ?? current.eyebrow,
                                                            accent: matched.patch.accent ?? current.accent,
                                                            summary: matched.patch.summary ?? current.summary,
                                                            author: matched.patch.author ?? current.author,
                                                        }));
                                                    }
                                                }}
                                            >
                                                {arch.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={styles.craftLayerList}>
                                <div className={styles.between} style={{ padding: '4px 0' }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--studio-secondary)' }}>STUDIO CRAFT LAYERS</span>
                                    <span style={{ fontSize: 11, color: 'var(--studio-secondary)' }}>{currentCraft.layers.length} layers</span>
                                </div>

                                {currentCraft.layers.map(layer => {
                                    const isSelected = selected === layer.key;
                                    const isHidden = design.hiddenLayers.includes(layer.key);
                                    const isLocked = design.lockedLayers.includes(layer.key);
                                    const previewText = layer.getPreview(design);

                                    return (
                                        <div
                                            key={layer.key}
                                            className={`${styles.craftLayerCard} ${isSelected ? styles.craftLayerSelected : ''}`}
                                        >
                                            <div className={styles.craftLayerHeader}>
                                                <button
                                                    type="button"
                                                    className={styles.craftLayerSelectBtn}
                                                    onClick={() => {
                                                        select(layer.key);
                                                        if (layer.key === 'visual') setTool('media');
                                                        else setTool('text');
                                                    }}
                                                >
                                                    <div className={styles.row} style={{ gap: 6 }}>
                                                        <span className={styles.craftRoleBadge}>{layer.role}</span>
                                                        <strong style={{ fontSize: 13 }}>{layer.label}</strong>
                                                    </div>
                                                    <span className={styles.craftLayerSubtle}>{layer.description}</span>
                                                </button>

                                                <div className={styles.craftLayerActions}>
                                                    <button
                                                        type="button"
                                                        className={styles.iconButton}
                                                        style={{ width: 34, height: 34, padding: 6 }}
                                                        aria-label={`${isHidden ? 'Show' : 'Hide'} ${layer.label}`}
                                                        title={isHidden ? 'Show layer' : 'Hide layer'}
                                                        onClick={() => toggle('hiddenLayers', layer.key)}
                                                    >
                                                        {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={styles.iconButton}
                                                        style={{ width: 34, height: 34, padding: 6 }}
                                                        aria-label={`${isLocked ? 'Unlock' : 'Lock'} ${layer.label}`}
                                                        title={isLocked ? 'Unlock layer' : 'Lock layer'}
                                                        onClick={() => toggle('lockedLayers', layer.key)}
                                                    >
                                                        {isLocked ? <Lock size={16} /> : <LockOpen size={16} />}
                                                    </button>
                                                </div>
                                            </div>

                                            {previewText && (
                                                <div
                                                    className={styles.craftLayerPreview}
                                                    onClick={() => {
                                                        select(layer.key);
                                                        setTool(layer.key === 'visual' ? 'media' : 'text');
                                                    }}
                                                >
                                                    <code>{previewText}</code>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {isBookTemplate && (
                                <div className={styles.craftFooterActions}>
                                    <button
                                        type="button"
                                        className={styles.button}
                                        style={{ width: '100%', borderColor: 'var(--studio-red)', color: 'var(--studio-red)' }}
                                        onClick={() => setBookModalOpen(true)}
                                    >
                                        <BookOpen size={16} />
                                        Book Review Data Craft (12 Fields)
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        </div>
        <input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" hidden ref={fileRef} aria-label="Upload studio photo" onChange={event => { void chooseFile(event.target.files?.[0]); event.target.value = ''; }} />
        <div className={styles.offscreen} aria-hidden="true"><Artwork ref={exportRef} design={design} /></div>
        {bookModalOpen && (
            <BookReviewModal
                scope={scope}
                onClose={() => setBookModalOpen(false)}
                onOpenDraft={(item) => {
                    setBookModalOpen(false);
                    apply(item.design);
                }}
            />
        )}
    </div>;
}

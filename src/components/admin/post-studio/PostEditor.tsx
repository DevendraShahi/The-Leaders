"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, Copy, Download, Eye, EyeOff, Globe, ImagePlus, Instagram, Layers3, LayoutTemplate, Lock, LockOpen, Maximize2, Minimize2, Plus, Redo2, Share2, Trash2, Trophy, Type, Undo2, Upload, X } from 'lucide-react';
import { createDraft, listDrafts, saveDraftCollection, setDraftTrashed, type PostDraft } from '@/lib/post-studio/drafts';
import { postOutputDimensions, postTemplates, type PostDesign, type PostLayer, type PostTextLayer } from '@/lib/post-studio/types';
import { getStudioCraft } from '@/lib/post-studio/studio-craft';
import { shareStyles, sharedStyleOptions, type SharedStyle } from '@/lib/post-studio/shared-styles';
import { positionText, snapTextPosition } from '@/lib/post-studio/positioning';
import { setTextColor } from '@/lib/post-studio/text-colors';
import { setTextTypography } from '@/lib/post-studio/typography';
import { imageEffectControls, setImageEffect } from '@/lib/post-studio/image-effects';
import { moveImage, replaceImage, resetImageAdjustments, setImageFit, wheelMovement } from '@/lib/post-studio/image-positioning';
import { artworkBytes, download } from '@/lib/post-studio/export';
import { findCarouselSiblings, getCarouselBaseTitle, exportCarouselZip, generateInstagramCaption } from '@/lib/post-studio/carousel';
import { storyGradients, storyColors } from '@/lib/post-studio/story-backgrounds';
import { Artwork } from './Artwork';
import { ColorPicker, Modal, Section, Slider } from './Controls';
import StudioMediaModal from './StudioMediaModal';
import InstagramPreviewModal from './InstagramPreviewModal';
import InstagramSharePanel from './InstagramSharePanel';
import styles from './PostStudio.module.css';
import CricketInspector from './CricketInspector';
import CricketPlayerLibrary from './CricketPlayerLibrary';
import { playerPhotoCredit, type NplPlayer } from '@/lib/post-studio/cricket-players';
import { blankCricketData } from '@/lib/post-studio/cricket-data';
import { artworkFitIssues } from '@/lib/post-studio/artwork-fit';

type Tool = 'text' | 'layout' | 'media' | 'pages' | 'cricket';
type Change = PostDesign | ((current: PostDesign) => PostDesign);
type Snapshot = { slides: PostDraft[]; activeId: string };
const fields: { layer: PostTextLayer; key: 'headline' | 'summary' | 'eyebrow' | 'author'; label: string }[] = [
    { layer: 'headline', key: 'headline', label: 'Headline' }, { layer: 'supporting', key: 'summary', label: 'Summary' },
    { layer: 'kicker', key: 'eyebrow', label: 'Kicker' }, { layer: 'footer', key: 'author', label: 'Byline' },
];
const baseTools = [{ key: 'text', label: 'Text', Icon: Type }, { key: 'layout', label: 'Design', Icon: LayoutTemplate }, { key: 'media', label: 'Image', Icon: ImagePlus }, { key: 'pages', label: 'Pages', Icon: Layers3 }] as const;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export default function PostEditor({ scope, draft, onClose, canExport = true }: { scope: string; draft: PostDraft; onClose: () => void; canExport?: boolean }) {
    const [slides, setSlides] = useState<PostDraft[]>([draft]);
    const [activeId, setActiveId] = useState(draft.id);
    const slidesRef = useRef(slides), activeIdRef = useRef(activeId);
    const [ready, setReady] = useState(false), [busy, setBusy] = useState(false);
    const [loadAttempt, setLoadAttempt] = useState(0);
    const [tool, setTool] = useState<Tool>(draft.design.template === 'cricket' ? 'cricket' : 'text');
    const [selected, setSelected] = useState<PostLayer>('headline');
    const [editAll, setEditAll] = useState(false);
    const [sharedGroups, setSharedGroups] = useState<SharedStyle[]>(['typography', 'alignment']);
    const [scopeDetails, setScopeDetails] = useState(false);
    const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');
    const [issue, setIssue] = useState(''), [notice, setNotice] = useState(''), [imageIssue, setImageIssue] = useState('');
    const [overflow, setOverflow] = useState(false), [exporting, setExporting] = useState(false);
    const [mediaModalOpen, setMediaModalOpen] = useState(false), [previewOpen, setPreviewOpen] = useState(false);
    const [mediaSearchQuery, setMediaSearchQuery] = useState('');
    const [instagramShareOpen, setInstagramShareOpen] = useState(false);
    const [canvasFocused, setCanvasFocused] = useState(false);
    const [quickUrl, setQuickUrl] = useState(''), [urlLoading, setUrlLoading] = useState(false);
    const [keepAdjustments, setKeepAdjustments] = useState(true), [reposition, setReposition] = useState(false), [snap, setSnap] = useState(true);
    const [backgroundTab, setBackgroundTab] = useState<'photo' | 'color' | 'players'>('photo');
    const [history, setHistory] = useState({ undo: 0, redo: 0 });
    const undoRef = useRef<Snapshot[]>([]), redoRef = useRef<Snapshot[]>([]), interaction = useRef<Snapshot | null>(null);
    const dirty = useRef(false), revision = useRef(0), mounted = useRef(true), operation = useRef(false);
    const stageRef = useRef<HTMLDivElement>(null), exportRef = useRef<HTMLDivElement>(null), fileRef = useRef<HTMLInputElement>(null);
    const exportNodes = useRef(new Map<string, HTMLDivElement>());
    const [stageSize, setStageSize] = useState({ width: 600, height: 600 });
    const drag = useRef<{ x: number; y: number; design: PostDesign } | null>(null);
    const wheelTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const ballDrag = useRef<{ x: number; y: number } | null>(null);
    const activeSlideIndex = Math.max(0, slides.findIndex(item => item.id === activeId));
    const activeSlide = slides[activeSlideIndex], design = activeSlide.design;
    const tools = design.template === 'cricket' ? [{ key: 'cricket' as const, label: 'Match', Icon: Trophy }, ...baseTools] : baseTools;
    const field = fields.find(item => item.layer === selected) ?? fields[0];
    const craft = getStudioCraft(design.template);
    const locked = design.lockedLayers.includes(selected);
    const textLocked = design.lockedLayers.includes(field.layer);
    const mediaLocked = design.lockedLayers.includes('visual');
    const mediaDisabled = mediaLocked || !design.imageUri || design.hiddenLayers.includes('visual');
    const [outputW, outputH] = postOutputDimensions[design.format];
    const referenceH = 360 * outputH / outputW;
    const scale = Math.max(.05, Math.min((stageSize.width - 16) / 360, (stageSize.height - 16) / referenceH, 3));

    useEffect(() => {
        let active = true;
        void listDrafts(scope).then(all => {
            if (!active) return;
            const current = all.find(item => item.id === draft.id && !item.trashedAt);
            if (!current) throw new Error('This page is unavailable. Return to the library to restore it from Trash.');
            const found = findCarouselSiblings(current, all);
            const carouselId = current.carouselId ?? `carousel:${draft.id}`;
            const loaded = found.map((item, index) => ({ ...item, carouselId, carouselOrder: index }));
            slidesRef.current = loaded; setSlides(loaded); setReady(true);
        }).catch(error => { if (active) setIssue(error instanceof Error ? error.message : 'Could not load pages.'); });
        return () => { active = false; };
    }, [scope, draft.id, loadAttempt]);

    const snapshot = (): Snapshot => ({ slides: slidesRef.current, activeId: activeIdRef.current });
    const currentDesign = () => slidesRef.current.find(item => item.id === activeIdRef.current)!.design;
    const updateHistory = () => setHistory({ undo: undoRef.current.length, redo: redoRef.current.length });
    const install = (next: PostDraft[], nextActive = activeIdRef.current) => {
        slidesRef.current = next; activeIdRef.current = nextActive;
        setSlides(next); setActiveId(nextActive);
    };
    const markDirty = () => { revision.current++; dirty.current = true; setSaveState('saving'); setIssue(''); };
    const commit = (next: PostDraft[], record = true, nextActive = activeIdRef.current) => {
        if (same(next, slidesRef.current)) return;
        if (record) { undoRef.current = [...undoRef.current.slice(-39), snapshot()]; redoRef.current = []; }
        install(next, nextActive); markDirty(); updateHistory();
    };
    const apply = (change: Change, record = !interaction.current) => {
        const previous = currentDesign();
        const next = typeof change === 'function' ? change(previous) : change;
        if (same(previous, next)) return;
        commit(slidesRef.current.map(item => item.id === activeIdRef.current ? { ...item, design: next }
            : editAll ? { ...item, design: shareStyles(item.design, next, sharedGroups, previous) } : item), record);
    };
    const begin = () => { if (!interaction.current) interaction.current = snapshot(); };
    const end = () => {
        if (interaction.current && !same(interaction.current.slides, slidesRef.current)) {
            undoRef.current = [...undoRef.current.slice(-39), interaction.current]; redoRef.current = [];
        }
        interaction.current = null; updateHistory();
    };
    const persist = useCallback(async () => {
        if (!dirty.current) return true;
        const version = revision.current;
        const entries = slidesRef.current;
        try {
            await saveDraftCollection(scope, entries);
            if (version === revision.current) { dirty.current = false; if (mounted.current) setSaveState('saved'); }
            return true;
        } catch (error) {
            if (mounted.current) { setSaveState('error'); setIssue(error instanceof Error ? error.message : 'Save failed. Keep this editor open and retry.'); }
            return false;
        }
    }, [scope]);
    useEffect(() => {
        if (!ready) return;
        const timer = setTimeout(() => { void persist(); }, 400);
        return () => clearTimeout(timer);
    }, [slides, ready, persist]);
    useEffect(() => {
        mounted.current = true;
        const unload = (event: BeforeUnloadEvent) => { if (dirty.current) { event.preventDefault(); event.returnValue = ''; void persist(); } };
        window.addEventListener('beforeunload', unload);
        return () => { mounted.current = false; window.removeEventListener('beforeunload', unload); clearTimeout(wheelTimer.current); void persist(); };
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
        image.onerror = () => { if (active) setImageIssue('Photo unavailable. Replace it in Image before exporting.'); };
        image.src = design.imageUri;
        return () => { active = false; };
    }, [design.imageUri]);
    useEffect(() => {
        let active = true;
        void document.fonts.ready.then(() => requestAnimationFrame(() => {
            if (!active) return;
            setOverflow(Boolean(exportRef.current && artworkFitIssues(exportRef.current).length));
        }));
        return () => { active = false; };
    }, [design]);
    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setNotice(''), 4000);
        return () => clearTimeout(timer);
    }, [notice]);
    const undo = (redo = false) => {
        end();
        const from = redo ? redoRef.current : undoRef.current, to = redo ? undoRef.current : redoRef.current;
        const previous = from.pop();
        if (!previous) return;
        to.push(snapshot()); install(previous.slides, previous.activeId); markDirty(); updateHistory();
    };
    useEffect(() => {
        const keyboard = (event: KeyboardEvent) => {
            if (!ready || busy || exporting) return;
            if (event.target instanceof HTMLElement && event.target.closest('input,textarea,select,[contenteditable=true],dialog')) return;
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); undo(event.shiftKey); }
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'y') { event.preventDefault(); undo(true); }
        };
        window.addEventListener('keydown', keyboard);
        return () => window.removeEventListener('keydown', keyboard);
    });

    const select = (layer: PostLayer) => { setSelected(layer); setTool(layer === 'visual' ? 'media' : 'text'); setReposition(false); };
    const switchSlide = (index: number) => {
        const target = slidesRef.current[index];
        if (!target || busy || exporting) return;
        end(); install(slidesRef.current, target.id); setReposition(false);
        if (tool === 'cricket' && target.design.template !== 'cricket') setTool('text');
    };
    const update = <K extends keyof PostDesign>(key: K, value: PostDesign[K]) => apply(current => ({ ...current, [key]: value }));
    const toggleLayer = (key: 'hiddenLayers' | 'lockedLayers', layer: PostLayer) => apply(current => ({ ...current, [key]: current[key].includes(layer) ? current[key].filter(item => item !== layer) : [...current[key], layer] }));
    const applyToAll = () => {
        const source = currentDesign();
        commit(slidesRef.current.map(item => item.id === activeIdRef.current ? item : { ...item, design: shareStyles(item.design, source, sharedGroups) }));
        setNotice('Selected styles applied to all pages. Locked layers kept their settings.');
    };
    const runPageOperation = async (action: () => Promise<void>) => {
        if (operation.current) return;
        operation.current = true; setBusy(true); end();
        try { if (await persist()) await action(); }
        catch (error) { setIssue(error instanceof Error ? error.message : 'Could not update pages.'); }
        finally { operation.current = false; setBusy(false); }
    };
    const addPage = (duplicate = false) => runPageOperation(async () => {
        const current = currentDesign(), list = slidesRef.current;
        const carouselId = list[0].carouselId ?? `carousel:${draft.id}`;
        // Persist the original page's group before adding its first sibling.
        const grouped = list.map((item, index) => ({ ...item, carouselId, carouselOrder: index }));
        await saveDraftCollection(scope, grouped);
        const title = getCarouselBaseTitle(draft.name).slice(0, 72);
        const item = await createDraft(scope, `${title} · ${list.length + 1}/${list.length + 1}${duplicate ? ' (copy)' : ''}`, duplicate ? current : { ...current, headline: '', summary: '' }, { carouselId, carouselOrder: list.length });
        undoRef.current = []; redoRef.current = [];
        install([...grouped, item], item.id); updateHistory(); setSaveState('saved'); setTool('text');
        setNotice(duplicate ? 'Page duplicated.' : 'New page added. Write its headline and summary.');
    });
    const deletePage = (id: string) => runPageOperation(async () => {
        const list = slidesRef.current;
        if (list.length < 2) return;
        await setDraftTrashed(scope, id, true);
        const index = list.findIndex(item => item.id === id);
        const remaining = list.filter(item => item.id !== id).map((item, order) => ({ ...item, carouselOrder: order }));
        install(remaining, activeIdRef.current === id ? remaining[Math.min(index, remaining.length - 1)].id : activeIdRef.current);
        undoRef.current = []; redoRef.current = []; updateHistory(); markDirty();
        setNotice('Page moved to Trash. Restore it from the draft library.');
    });
    const movePage = (index: number, direction: -1 | 1) => {
        const list = [...slidesRef.current], target = index + direction;
        if (target < 0 || target >= list.length) return;
        end();[list[index], list[target]] = [list[target], list[index]];
        commit(list.map((item, order) => ({ ...item, carouselOrder: order })));
    };
    const chooseFile = async (file?: File) => {
        if (!file || mediaLocked || !ready || busy || exporting || operation.current) return;
        operation.current = true; setBusy(true);
        try {
            if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') throw new Error('Choose a raster image such as PNG, JPEG or WebP.');
            if (file.size > 25 * 1024 * 1024) throw new Error('Choose an image smaller than 25 MB.');
            const uri = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Could not read photo.')); reader.readAsDataURL(file);
            });
            apply(current => replaceImage(current, uri, keepAdjustments)); setBackgroundTab('photo');
        } catch (error) { setIssue(error instanceof Error ? error.message : 'Could not add photo.'); }
        finally { operation.current = false; setBusy(false); }
    };
    const applyUrl = async () => {
        if (!quickUrl.trim() || mediaLocked || urlLoading || operation.current) return;
        operation.current = true; setBusy(true); setUrlLoading(true);
        try {
            const response = await fetch('/api/admin/studio/media-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: quickUrl.trim() }) });
            const data = await response.json();
            if (!response.ok || !data.dataUri) throw new Error(data.error || 'Could not load image.');
            apply(current => replaceImage(current, data.dataUri, keepAdjustments)); setQuickUrl('');
        } catch (error) { setIssue(error instanceof Error ? error.message : 'Could not load image.'); }
        finally { operation.current = false; setBusy(false); setUrlLoading(false); }
    };
    const selectPlayerPhoto = async (player: NplPlayer) => {
        if (!player.photo?.url || mediaLocked || !ready || busy || exporting || operation.current) return;
        operation.current = true; setBusy(true); setIssue('');
        try {
            const response = await fetch(player.photo.url);
            if (!response.ok) throw new Error('Could not load this player photo. Try again.');
            const blob = await response.blob();
            if (!blob.type.startsWith('image/') || blob.size > 25 * 1024 * 1024) throw new Error('This photo could not be inserted. Choose another photo.');
            const uri = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Could not read player photo.')); reader.readAsDataURL(blob);
            });
            apply(current => ({ ...replaceImage(current, uri, keepAdjustments), imageCredit: playerPhotoCredit(player) }));
            setBackgroundTab('photo'); setNotice(`${player.name} photo inserted.`);
        } catch (error) { setIssue(error instanceof Error ? error.message : 'Could not insert player photo.'); }
        finally { operation.current = false; setBusy(false); }
    };
    const exportPost = async (index = activeSlideIndex) => {
        const item = slides[index], node = item?.id === activeId ? exportRef.current : exportNodes.current.get(item?.id);
        if (!item || !node || exporting || !canExport) return;
        setExporting(true); setIssue('');
        try {
            if (!await persist()) return;
            const bytes = await artworkBytes(node, item.design.format);
            download(bytes, `the-leaders-page-${index + 1}.png`); setNotice(`Page ${index + 1} downloaded.`);
        } catch (error) { setIssue(error instanceof Error ? error.message : 'Export failed.'); }
        finally { setExporting(false); }
    };
    const exportAll = async () => {
        if (exporting || !canExport) return;
        setExporting(true); setIssue('');
        try {
            if (!await persist()) return;
            const nodes = slides.map(item => exportNodes.current.get(item.id));
            if (nodes.some(node => !node)) throw new Error('Pages are still preparing. Retry export.');
            await exportCarouselZip(nodes as HTMLDivElement[], slides, 'the-leaders-carousel.zip'); setNotice('Carousel ZIP downloaded.');
        } catch (error) { setIssue(error instanceof Error ? error.message : 'Carousel export failed.'); }
        finally { setExporting(false); }
    };
    const copyCaption = async () => {
        try { await navigator.clipboard.writeText(generateInstagramCaption(slidesRef.current)); setNotice('Caption copied.'); }
        catch { setIssue('Could not copy caption.'); }
    };
    const slider = (label: string, value: number, min: number, max: number, change: (value: number) => (current: PostDesign) => PostDesign, disabled = false) =>
        <Slider label={label} value={value} min={min} max={max} disabled={disabled} onStart={begin} onEnd={end} onChange={value => apply(change(value))} />;
    const choice = (label: string, active: boolean, action: () => void, disabled = false) =>
        <button type="button" key={label} className={`${styles.choice} ${active ? styles.active : ''}`} aria-pressed={active} disabled={disabled} onClick={action}>{label}</button>;
    const canvasDown = (event: PointerEvent<HTMLDivElement>) => {
        if (!ready || exporting || busy || (!reposition && tool !== 'media') || locked || design.hiddenLayers.includes(selected) || (selected === 'visual' && !design.imageUri)) return;
        if (event.target instanceof HTMLElement && event.target.closest('button')) return;
        event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); begin();
        drag.current = { x: event.clientX, y: event.clientY, design: currentDesign() };
    };
    const canvasMove = (event: PointerEvent) => {
        const origin = drag.current; if (!origin) return;
        const dx = (event.clientX - origin.x) / scale, dy = (event.clientY - origin.y) / scale;
        if (selected === 'visual') apply(() => moveImage(origin.design, dx, dy));
        else apply(current => positionText(current, selected, { x: snapTextPosition(origin.design.textPositions[selected].x + dx / 360 * 100, snap), y: snapTextPosition(origin.design.textPositions[selected].y + dy / referenceH * 100, snap) }));
    };
    const canvasEnd = () => { if (drag.current) { drag.current = null; end(); } };
    const changeTool = (next: Tool) => { end(); setTool(next); setReposition(false); if (next === 'media') setSelected('visual'); else if (next === 'text' && selected === 'visual') setSelected('headline'); };
    const lockedLabel = textLocked ? ' · Locked' : '';
    const fitText = () => {
        const nodes = exportRef.current?.querySelectorAll<HTMLElement>('[data-line-limit]');
        if (!nodes) return;
        apply(current => {
            let next = current;
            for (const node of nodes) {
                const available = parseFloat(getComputedStyle(node).lineHeight) * Number(node.dataset.lineLimit);
                if (node.scrollHeight <= available + 1) continue;
                const layer = node.dataset.testid === 'artwork-headline' ? 'headline' : 'supporting';
                const size = Math.max(60, Math.floor(current.textTypography[layer].size * available / node.scrollHeight * .96));
                next = setTextTypography(next, layer, { size });
            }
            return next;
        });
    };

    return <div className={`${styles.studio} ${styles.editor} ${styles.organizedEditor} ${canvasFocused ? styles.canvasFocused : ''}`}>
        <header className={styles.workspaceHeader}>
            <div className={styles.documentHeading}>
                <button className={styles.iconButton} aria-label="Close editor" disabled={busy || exporting} onClick={async () => { if (await persist()) onClose(); }}>
                    <ChevronLeft size={20} />
                </button>
                <div className={styles.documentName}>
                    <span className={styles.workspaceEyebrow}>THE LEADERS / STUDIO</span>
                    <h1 title={draft.name}>{getCarouselBaseTitle(draft.name)}</h1>
                </div>
                <button className={styles.saveState} aria-label={saveState === 'error' ? 'Retry saving' : 'Save changes'} onClick={() => void persist()}>
                    <span className={`${styles.saveDot} ${saveState === 'saving' ? styles.saving : saveState === 'error' ? styles.failed : ''}`} />{saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving…' : 'Retry save'}</button>
            </div>
            <div className={styles.workspaceActions}>
                <div className={styles.historyGroup}>
                    <button className={styles.toolbarIconBtn} aria-label="Undo" title="Undo (⌘/Ctrl+Z)" disabled={!history.undo || busy || exporting} onClick={() => undo()}>
                        <Undo2 size={16} />
                    </button>
                    <button className={styles.toolbarIconBtn} aria-label="Redo" disabled={!history.redo || busy || exporting} onClick={() => undo(true)}>
                        <Redo2 size={16} />
                    </button>
                </div>
                <button className={styles.button} aria-label="Preview Instagram post" onClick={() => setPreviewOpen(true)}>
                    <Instagram size={16} />
                    <span className={styles.actionLabel}>Preview</span>
                </button>
                {slides.length > 1 && <button className={styles.button} aria-label="Export carousel ZIP" disabled={!ready || busy || exporting || !canExport} onClick={() => void exportAll()}>
                    <Layers3 size={16} />
                    <span>Export all</span>
                </button>}
                <button className={styles.button} aria-label="Share to Instagram" title="Share to Instagram" aria-expanded={instagramShareOpen} disabled={!ready || busy || exporting || !canExport} onClick={() => setInstagramShareOpen(value => !value)}>
                    <Share2 size={16} /><span className={styles.actionLabel}>Share</span>
                </button>
                <button className={styles.primary} aria-label="Export current page PNG" disabled={!ready || busy || exporting || !canExport || Boolean(imageIssue) || overflow} onClick={() => void exportPost()}>
                    <Download size={16} />
                    <span>{exporting ? 'Exporting…' : 'Export PNG'}</span>
                </button>
            </div>
        </header>
        {instagramShareOpen && <InstagramSharePanel slides={slides} activeIndex={activeSlideIndex}
            getNode={id => exportNodes.current.get(id)} persist={persist}
            disabled={!ready || busy || exporting || !canExport} setPreparing={setExporting} onClose={() => setInstagramShareOpen(false)} />}
        {(issue || imageIssue || overflow) && <div className={styles.alertBanner} role="alert">
            <span>{issue || imageIssue || 'Content does not fit. Shorten the text, reduce the rows, or choose a taller format.'}</span>{overflow && <button className={styles.button} disabled={!ready || busy || exporting} onClick={fitText}>Auto-fit text</button>}{issue && <button className={styles.button} onClick={() => { if (!ready) { setIssue(''); setLoadAttempt(value => value + 1); } else void persist(); }}>{ready ? 'Retry save' : 'Retry loading pages'}</button>}</div>}
        {notice && <div className={styles.workspaceNotice} role="status">
            <Check size={14} />
            <span>{notice}</span>
            <button className={styles.bannerCloseBtn} aria-label="Dismiss notification" onClick={() => setNotice('')}>
                <X size={14} />
            </button>
        </div>}
        <div className={styles.body}>
            <main className={styles.stage} aria-label="Artwork workspace">
                <div className={styles.canvasHeading}>
                    <span>{design.format} <span aria-hidden="true">/</span> {outputW} × {outputH}</span>
                    <div className={styles.canvasViewActions}><span>Page {activeSlideIndex + 1} of {slides.length}</span>
                        <button className={styles.canvasFocusButton} aria-label={canvasFocused ? 'Show editing controls' : 'Expand canvas'} aria-pressed={canvasFocused} onClick={() => setCanvasFocused(value => !value)}>
                            {canvasFocused ? <Minimize2 size={15} /> : <Maximize2 size={15} />}<span>{canvasFocused ? 'Show controls' : 'Expand'}</span>
                        </button>
                    </div>
                </div>
                <div ref={stageRef} className={styles.stageSurface}>
                    <div className={styles.canvasShell} style={{ width: 360 * scale, height: referenceH * scale }} onPointerDown={canvasDown} onPointerMove={canvasMove} onPointerUp={canvasEnd} onPointerCancel={canvasEnd}>
                        <div className={styles.scaledArtwork} style={{ transform: `scale(${scale})` }}>
                            <Artwork design={design} selected={selected} guides={reposition} onSelect={select} onChooseImage={() => { select('visual'); fileRef.current?.click(); }} />
                        </div>
                    </div>
                </div>
                <nav className={`${styles.pageRail} ${slides.length === 1 ? styles.singlePageRail : ''}`} aria-label="Carousel pages">
                    <button className={styles.railArrow} aria-label="Previous page" disabled={activeSlideIndex === 0 || busy || exporting} onClick={() => switchSlide(activeSlideIndex - 1)}>
                        <ChevronLeft size={16} />
                    </button>
                    <div className={styles.pageRailList}>{slides.map((item, index) => <button key={item.id} className={`${styles.pageThumbnail} ${item.id === activeId ? styles.pageThumbnailActive : ''}`} aria-label={`Page ${index + 1}: ${item.design.headline || 'Untitled'}`} aria-current={item.id === activeId ? 'page' : undefined} disabled={busy || exporting} onClick={() => switchSlide(index)}>
                        <span className={styles.thumbnailVisual} aria-hidden="true">
                            <span className={styles.thumbnailCanvas} style={{ width: 360, height: 360 * postOutputDimensions[item.design.format][1] / postOutputDimensions[item.design.format][0], transform: `scale(${Math.min(48 / 360, 54 / (360 * postOutputDimensions[item.design.format][1] / postOutputDimensions[item.design.format][0]))})` }}>
                                <Artwork design={item.design} />
                            </span>
                            <span className={styles.thumbnailNumber}>{index + 1}</span>
                        </span>
                    </button>)}</div>
                    <button className={styles.railAdd} aria-label="Add page" disabled={!ready || busy || exporting} onClick={() => void addPage()}>
                        <Plus size={18} />
                        <span>Add page</span>
                    </button>
                    <button className={styles.railArrow} aria-label="Next page" disabled={activeSlideIndex === slides.length - 1 || busy || exporting} onClick={() => switchSlide(activeSlideIndex + 1)}>
                        <ChevronRight size={16} />
                    </button>
                </nav>
            </main>
            <aside className={styles.inspector} aria-label="Page tools" hidden={canvasFocused}>
                <div className={styles.tabs} role="tablist" aria-label="Editor tools">{tools.map(({ key, label, Icon }, index) => <button key={key} id={`studio-tab-${key}`} role="tab" aria-selected={tool === key} aria-controls={`studio-panel-${key}`} tabIndex={tool === key ? 0 : -1} className={styles.tab} onClick={() => changeTool(key)} onKeyDown={event => {
                    const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
                    const target = event.key === 'Home' ? 0 : event.key === 'End' ? tools.length - 1 : direction ? (index + direction + tools.length) % tools.length : -1;
                    if (target >= 0) { event.preventDefault(); changeTool(tools[target].key); document.getElementById(`studio-tab-${tools[target].key}`)?.focus(); }
                }}>
                    <Icon size={18} />
                    <span>{label}{key === 'pages' ? ` · ${slides.length}` : ''}</span>
                </button>)}</div>
                <fieldset className={styles.inspectorBody} disabled={!ready || busy || exporting}>
                    {!ready && <p role="status" className={styles.subtle}>Loading your pages…</p>}
                    {slides.length > 1 && <section className={`${styles.editScope} ${styles.scopeBar} ${editAll ? styles.scopeBarGlobal : ''}`} aria-label="Carousel style scope">
                        <span className={styles.scopeBarLabel}>Apply to</span>
                        <div className={styles.segmented} role="group" aria-label="Editing scope">{choice(`This page`, !editAll, () => setEditAll(false))}{choice(`All ${slides.length} pages`, editAll, () => setEditAll(true))}</div>
                        <button className={styles.scopeBarOptions} aria-label="Choose styles to share" title={`${sharedGroups.length} styles selected · Sharing options`} aria-expanded={scopeDetails} aria-controls="shared-style-settings" onClick={() => setScopeDetails(!scopeDetails)}><Globe size={15} /></button>
                    </section>}
                    <div className={styles.panel} id={`studio-panel-${tool}`} role="tabpanel" aria-labelledby={`studio-tab-${tool}`} tabIndex={0} key={tool}>
                        <div className={styles.panelHeading}>
                            <span className={styles.workspaceEyebrow}>{tool === 'pages' ? 'CAROUSEL' : `PAGE ${activeSlideIndex + 1}`}</span>
                            <h2>{tool === 'cricket' ? 'The cricket desk' : tool === 'text' ? 'Words & typography' : tool === 'layout' ? 'Canvas & design' : tool === 'media' ? 'Image & background' : 'Arrange your story'}</h2>
                            <p>{tool === 'cricket' ? 'Teams, match data and every big moment.' : tool === 'text' ? 'Edit the copy, then refine its style.' : tool === 'layout' ? 'Set the format and visual identity.' : tool === 'media' ? 'Choose a visual and make it yours.' : 'Add, duplicate and reorder pages.'}</p>
                        </div>
                        {tool === 'cricket' && <CricketInspector key={activeId} design={design} onChange={apply} />}
                        {tool === 'text' && <>
                            <div className={styles.layerGrid} role="group" aria-label="Text layers">{fields.map(item => <button key={item.layer} className={`${styles.choice} ${selected === item.layer ? styles.active : ''}`} aria-pressed={selected === item.layer} onClick={() => select(item.layer)}>{item.label}</button>)}</div>
                            <label className={styles.field}>
                                <span>{craft.layers.find(layer => layer.key === field.layer)?.label ?? field.label}{lockedLabel}</span>
                                <textarea className={styles.input} aria-label={`Edit ${field.label.toLowerCase()}`} rows={4} disabled={textLocked} value={design[field.key]} onChange={event => update(field.key, event.target.value)} />
                                <small className={styles.helpText}>Copy is always specific to this page.</small>
                            </label>
                            {field.layer === 'kicker' && <label className={styles.field}>
                                <span>Category / tag</span>
                                <input className={styles.input} aria-label="Edit category" disabled={textLocked} value={design.category} onChange={event => update('category', event.target.value)} />
                            </label>}
                            <div className={styles.toolSection}>
                                <h3>Typography</h3>
                                <div className={styles.row}>{(['auto', 'onest', 'hind'] as const).map(font => choice(font === 'auto' ? 'Auto font' : font === 'onest' ? 'Onest' : 'Hind', design.textTypography[field.layer].font === font, () => apply(current => setTextTypography(current, field.layer, { font })), textLocked))}</div>
                                {slider('Type size', design.textTypography[field.layer].size, 60, 160, value => current => setTextTypography(current, field.layer, { size: value }), textLocked)}
                                {slider('Line spacing', design.textTypography[field.layer].lineSpacing, 90, 180, value => current => setTextTypography(current, field.layer, { lineSpacing: value }), textLocked)}
                                <div className={styles.row}>{(['left', 'center'] as const).map(value => choice(value === 'left' ? 'Align left' : 'Align center', design.textAlign === value, () => update('textAlign', value), textLocked))}</div>
                            </div>
                            <Section title="Text color & shadow">
                                <ColorPicker key={`${activeId}:${field.layer}:${design.textColors[field.layer]}`} label={`${field.label} color`} color={design.textColors[field.layer]} disabled={textLocked} onChange={color => apply(current => setTextColor(current, field.layer, color))} />{slider('Text shadow', design.textTypography[field.layer].shadow, 0, 100, value => current => setTextTypography(current, field.layer, { shadow: value }), textLocked)}</Section>
                            <Section title="Position & visibility">
                                <label className={styles.row}>
                                    <input type="checkbox" checked={snap} onChange={event => setSnap(event.target.checked)} />Snap to template</label>
                                <button className={styles.button} disabled={textLocked} aria-pressed={reposition} onClick={() => setReposition(!reposition)}>{reposition ? 'Finish positioning' : 'Position on canvas'}</button>{(['x', 'y'] as const).map(axis => <div key={axis}>{slider(`${field.label} ${axis === 'x' ? 'horizontal' : 'vertical'} position`, design.textPositions[field.layer][axis], -50, 50, value => current => positionText(current, field.layer, { [axis]: value }), textLocked)}</div>)}<button className={styles.button} disabled={textLocked} onClick={() => apply(current => positionText(current, field.layer, { x: 0, y: 0 }))}>Reset position</button>
                                <div className={styles.row}>
                                    <button className={styles.button} aria-pressed={design.hiddenLayers.includes(field.layer)} disabled={textLocked} onClick={() => toggleLayer('hiddenLayers', field.layer)}>{design.hiddenLayers.includes(field.layer) ? <Eye /> : <EyeOff />}{design.hiddenLayers.includes(field.layer) ? 'Show layer' : 'Hide layer'}</button>
                                    <button className={styles.button} aria-pressed={textLocked} onClick={() => toggleLayer('lockedLayers', field.layer)}>{textLocked ? <Lock /> : <LockOpen />}{textLocked ? 'Unlock layer' : 'Lock layer'}</button>
                                </div>
                            </Section>
                        </>}
                        {tool === 'layout' && <>
                            <div className={styles.toolSection}>
                                <h3>Canvas size</h3>
                                <div className={styles.formatGrid}>{(Object.keys(postOutputDimensions) as PostDesign['format'][]).map(format => <button key={format} className={`${styles.formatOption} ${design.format === format ? styles.active : ''}`} aria-pressed={design.format === format} onClick={() => update('format', format)}>
                                    <span className={styles.formatShape} style={{ aspectRatio: `${postOutputDimensions[format][0]} / ${postOutputDimensions[format][1]}` }} />
                                    <strong>{format[0].toUpperCase() + format.slice(1)}</strong>
                                    <small>{postOutputDimensions[format].join(' × ')}</small>
                                </button>)}</div>
                            </div>
                            <Section title="Artwork accent">
                                <ColorPicker key={design.accent} label="Artwork accent" color={design.accent} reset="#B71C1C" onChange={color => update('accent', color || '#B71C1C')} />
                            </Section>
                            <Section title="Page template">
                                <p className={styles.helpText}>Change the page’s role. Your written copy stays in place.</p>
                                <div className={styles.templateList}>{postTemplates.map(template => <button key={template.key} className={`${styles.choice} ${design.template === template.key ? styles.active : ''}`} aria-pressed={design.template === template.key} onClick={() => { apply(current => ({ ...current, template: template.key, ...(template.key === 'cricket' && !current.cricket ? { cricket: blankCricketData() } : {}) })); if (template.key === 'cricket') setTool('cricket'); }}>
                                    <span>{template.title}<small>{template.subtitle}</small>
                                    </span>{design.template === template.key && <Check size={15} />}</button>)}</div>
                            </Section>
                        </>}
                        {tool === 'media' && <>
                            <div className={styles.segmented} role="group" aria-label="Background type">{choice('Photo', backgroundTab === 'photo', () => setBackgroundTab('photo'))}{design.template === 'cricket' && choice('Player photos', backgroundTab === 'players', () => setBackgroundTab('players'))}{choice('Color & gradient', backgroundTab === 'color', () => setBackgroundTab('color'))}</div>
                            {mediaLocked && <p className={styles.helpText}>This visual is locked. Unlock it below to make changes.</p>}
                            {backgroundTab === 'players' ? <CricketPlayerLibrary key={`${activeId}-${design.cricket?.teamId}`} initialTeam={design.cricket?.teamId || 'janakpur'} disabled={mediaLocked || !ready || busy || exporting} onSelect={selectPlayerPhoto}
                                onSearch={name => { setMediaSearchQuery(`${name} cricket`); setMediaModalOpen(true); }} /> : backgroundTab === 'photo' ? <>
                                <div className={styles.imageWell}>{design.imageUri ? <img src={design.imageUri} alt="Current page photo" /> : <>
                                    <ImagePlus size={30} />
                                    <span>Add a photo to this page</span>
                                </>}</div>
                                <div className={styles.row}>
                                    <button className={styles.button} disabled={mediaLocked} onClick={() => fileRef.current?.click()}>
                                        <Upload size={15} />{design.imageUri ? 'Replace photo' : 'Upload photo'}</button>
                                    <button className={styles.button} disabled={mediaLocked} onClick={() => { setMediaSearchQuery(''); setMediaModalOpen(true); }}>Search library / web</button>
                                </div>
                                <Section title="Use an image URL">
                                    <label className={styles.field}>
                                        <span>Direct image URL</span>
                                        <input className={styles.input} type="url" aria-label="Image URL" placeholder="https://…" value={quickUrl} disabled={mediaLocked || urlLoading} onChange={event => setQuickUrl(event.target.value)} />
                                    </label>
                                    <button className={styles.button} disabled={mediaLocked || urlLoading || !quickUrl.trim()} onClick={() => void applyUrl()}>{urlLoading ? 'Loading image…' : 'Use image'}</button>
                                </Section>
                                <label className={styles.checkRow}>
                                    <input type="checkbox" checked={keepAdjustments} onChange={event => setKeepAdjustments(event.target.checked)} />Keep adjustments when replacing</label>
                                <div className={styles.toolSection}>
                                    <h3>Fit & crop</h3>
                                    <div className={styles.row}>{choice('Fill frame', design.imageFit === 'cover', () => apply(current => setImageFit(current, 'cover')), mediaDisabled)}{choice('Fit image', design.imageFit === 'contain', () => apply(current => setImageFit(current, 'contain')), mediaDisabled)}</div>
                                    {slider('Image zoom', design.imageZoom * 100, 100, 300, value => current => ({ ...current, imageZoom: value / 100 }), mediaDisabled)}
                                    <div className={styles.field}><span>Image position</span>
                                        <div className={styles.ball} role="group" aria-label="Image scroll ball" aria-describedby="image-ball-help" aria-disabled={mediaDisabled} tabIndex={mediaDisabled ? -1 : 0}
                                            onPointerDown={event => { if (mediaDisabled) return; event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); begin(); ballDrag.current = { x: event.clientX, y: event.clientY }; }}
                                            onPointerMove={event => { const previous = ballDrag.current; if (!previous || mediaDisabled) return; apply(current => moveImage(current, event.clientX - previous.x, event.clientY - previous.y)); ballDrag.current = { x: event.clientX, y: event.clientY }; }}
                                            onPointerUp={() => { ballDrag.current = null; end(); }} onPointerCancel={() => { ballDrag.current = null; end(); }} onLostPointerCapture={() => { ballDrag.current = null; end(); }}
                                            onKeyDown={event => {
                                                if (mediaDisabled || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
                                                event.preventDefault(); begin(); const step = event.shiftKey ? 10 : 2;
                                                apply(current => event.key === 'Home' ? { ...current, imageOffsetX: 0, imageOffsetY: 0 } : moveImage(current, event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0, event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0));
                                            }} onKeyUp={end} onBlur={() => { ballDrag.current = null; end(); }}
                                            onWheel={event => {
                                                if (mediaDisabled) return; begin(); const movement = wheelMovement(event.deltaX, event.deltaY, event.deltaMode, event.shiftKey); apply(current => moveImage(current, movement.x, movement.y)); clearTimeout(wheelTimer.current); wheelTimer.current = setTimeout(end, 180);
                                            }}>
                                            <i aria-hidden="true" style={{ transform: `rotate(${design.imageOffsetX * 2}deg) translate(${Math.max(-12, Math.min(12, design.imageOffsetX / 12))}px, ${Math.max(-12, Math.min(12, design.imageOffsetY / 12))}px)` }} />
                                        </div>
                                        <p id="image-ball-help" className={styles.helpText}>Drag or scroll the ball to pan the full photo. Arrow keys fine-tune; Shift moves faster. Home centers it. You can also drag directly on the canvas.</p>
                                        <button className={styles.button} disabled={mediaDisabled} onClick={() => apply(current => ({ ...current, imageOffsetX: 0, imageOffsetY: 0 }))}>Center photo</button>
                                    </div>
                                </div>
                                <Section title="Image effects">
                                    <div className={styles.row}>{(['ink', 'clear', 'warm'] as const).map(tone => choice(tone[0].toUpperCase() + tone.slice(1), design.imageTone === tone, () => update('imageTone', tone), mediaDisabled))}</div>{imageEffectControls.map(effect => <div key={effect.key}>{slider(effect.label, design[effect.key], 0, 100, value => current => setImageEffect(current, effect.key, value), mediaDisabled)}</div>)}<button className={styles.button} disabled={mediaDisabled} onClick={() => apply(resetImageAdjustments)}>Reset image adjustments</button>
                                </Section>
                                {design.imageUri && <button className={styles.button} disabled={mediaLocked} onClick={() => update('imageUri', null)}>
                                    <Trash2 size={14} />Remove photo</button>}
                            </> : <div className={styles.toolSection}>
                                <h3>Background presets</h3>
                                <div className={styles.backgroundGrid}>{[...storyColors, ...storyGradients].map(preset => <button key={preset.id} className={styles.backgroundPreset} disabled={mediaLocked} aria-label={preset.label} aria-pressed={design.backgroundColor === preset.value || design.backgroundGradient === preset.value} style={{ background: preset.value }} title={preset.label} onClick={() => apply(current => ({ ...current, imageUri: null, backgroundColor: preset.type === 'color' ? preset.value : null, backgroundGradient: preset.type === 'gradient' ? preset.value : null }))}>
                                    <span>{preset.label}</span>
                                </button>)}</div>
                                <label className={styles.field}>
                                    <span>Custom background color</span>
                                    <input type="color" aria-label="Custom background color" disabled={mediaLocked} value={design.backgroundColor || '#111318'} onChange={event => apply(current => ({ ...current, imageUri: null, backgroundGradient: null, backgroundColor: event.target.value }))} />
                                </label>
                            </div>}
                            <div className={styles.row}>
                                <button className={styles.button} aria-pressed={mediaLocked} onClick={() => toggleLayer('lockedLayers', 'visual')}>{mediaLocked ? <Lock /> : <LockOpen />}{mediaLocked ? 'Unlock visual' : 'Lock visual'}</button>
                                <button className={styles.button} disabled={mediaLocked} aria-pressed={design.hiddenLayers.includes('visual')} onClick={() => toggleLayer('hiddenLayers', 'visual')}>{design.hiddenLayers.includes('visual') ? <Eye /> : <EyeOff />}{design.hiddenLayers.includes('visual') ? 'Show photo' : 'Hide photo'}</button>
                            </div>
                        </>}
                        {tool === 'pages' && <>
                            <div className={styles.row}>
                                <button className={styles.primary} onClick={() => void addPage()}>
                                    <Plus size={15} />Add page</button>
                                <button className={styles.button} onClick={() => void addPage(true)}>
                                    <Copy size={15} />Duplicate page</button>
                            </div>
                            <ol className={styles.orderedPages}>{slides.map((item, index) => <li key={item.id} className={item.id === activeId ? styles.currentPageRow : undefined}>
                                <button className={styles.pageRowTitle} aria-label={`Edit page ${index + 1}`} aria-current={item.id === activeId ? 'page' : undefined} onClick={() => switchSlide(index)}>
                                    <span>{index + 1}</span>
                                    <strong>{item.design.headline || 'Untitled page'}<small>{getStudioCraft(item.design.template).badge}</small>
                                    </strong>
                                </button>
                                <div className={styles.pageRowActions}>
                                    <button aria-label={`Move page ${index + 1} earlier`} disabled={index === 0} onClick={() => movePage(index, -1)}>
                                        <ArrowUp size={15} />
                                    </button>
                                    <button aria-label={`Move page ${index + 1} later`} disabled={index === slides.length - 1} onClick={() => movePage(index, 1)}>
                                        <ArrowDown size={15} />
                                    </button>
                                    <button aria-label={`Delete page ${index + 1}`} disabled={slides.length === 1} onClick={() => void deletePage(item.id)}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </li>)}</ol>
                            <p className={styles.helpText}>Page order saves with your carousel. Removed pages stay in recoverable Trash.</p>
                            <Section title="Caption & export">
                                <button className={styles.button} onClick={() => void copyCaption()}>
                                    <Copy size={14} />Copy carousel caption</button>
                                <p className={styles.captionPreviewBox}>{generateInstagramCaption(slides)}</p>
                                <button className={styles.primary} disabled={!canExport} onClick={() => void exportAll()}>
                                    <Download size={15} />Download carousel ZIP</button>
                            </Section>
                        </>}
                    </div>
                </fieldset>
                <footer className={styles.inspectorFooter}>
                    <span>{editAll && slides.length > 1 ? `Sharing ${sharedGroups.length} style groups across ${slides.length} pages` : `Editing page ${activeSlideIndex + 1} only`}</span>
                    <span>Browser-local drafts</span>
                </footer>
            </aside>
        </div>
        <input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" hidden ref={fileRef} aria-label="Upload studio photo" onChange={event => { void chooseFile(event.target.files?.[0]); event.target.value = ''; }} />
        <div className={styles.offscreen} aria-hidden="true">
            <Artwork ref={exportRef} design={design} />{slides.map(item => <Artwork key={item.id} ref={node => { if (node) exportNodes.current.set(item.id, node); else exportNodes.current.delete(item.id); }} design={item.design} />)}</div>
        {scopeDetails && <Modal labelledBy="shared-style-title" onClose={() => setScopeDetails(false)}>
            <div className={styles.shareDialogHeading}>
                <span className={styles.workspaceEyebrow}>CAROUSEL STYLES</span>
                <h2 id="shared-style-title">Choose what stays consistent</h2>
                <p className={styles.helpText}>Select the styles you want to share across all {slides.length} pages.</p>
            </div>
            <div id="shared-style-settings" className={styles.shareDialogOptions}>
                <p className={styles.helpText}>Each page keeps its own copy, template and locked layers.</p>
                {sharedStyleOptions.filter(option => option.key !== 'cricket' || design.template === 'cricket').map(option => <label key={option.key} className={styles.scopeOption}>
                    <input type="checkbox" checked={sharedGroups.includes(option.key)} onChange={event => setSharedGroups(current => event.target.checked ? [...current, option.key] : current.filter(key => key !== option.key))} />
                    <span>
                        <strong>{option.label}</strong>
                        <small>{option.description}</small>
                    </span>
                </label>)}
                <button className={styles.button} disabled={!sharedGroups.length} onClick={() => { applyToAll(); setScopeDetails(false); }}>
                    <Copy size={14} />Apply selected styles now</button>
                <button className={styles.scopeSettings} onClick={() => setScopeDetails(false)}>Done choosing styles<Check size={14} />
                </button>
                <p className={styles.helpText}>{editAll ? 'New changes to selected styles update every page. Undo restores the whole carousel.' : 'Apply once above, or choose All pages to keep editing together.'}</p>
            </div>
        </Modal>}
        {mediaModalOpen && <StudioMediaModal onClose={() => setMediaModalOpen(false)} onApplyImage={uri => { apply(current => replaceImage(current, uri, keepAdjustments)); setMediaModalOpen(false); setBackgroundTab('photo'); }} initialQuery={mediaSearchQuery || design.headline.slice(0, 40) || design.category} />}
        {previewOpen && <InstagramPreviewModal slides={slides} activeSlideIndex={activeSlideIndex} onSelectSlide={switchSlide} onClose={() => setPreviewOpen(false)} onExportCurrent={exportPost} onExportAll={slides.length > 1 ? exportAll : undefined} />}
    </div>;
}

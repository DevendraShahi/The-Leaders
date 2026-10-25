"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { 
    AlertCircle,
    ArrowDown, 
    ArrowLeft, 
    ArrowRight, 
    ArrowUp, 
    BookOpen, 
    Check, 
    ChevronLeft, 
    ChevronRight, 
    Copy, 
    Download, 
    Eye, 
    EyeOff, 
    Globe, 
    ImagePlus, 
    Instagram, 
    Layers3, 
    LayoutTemplate, 
    Link2, 
    Lock, 
    LockOpen, 
    MoveLeft, 
    MoveRight, 
    Plus, 
    Redo2, 
    Sparkles,
    Trash2, 
    Type, 
    Undo2, 
    Upload, 
    X 
} from 'lucide-react';
import { createDraft, listDrafts, setDraftTrashed, updateDraft, type PostDraft } from '@/lib/post-studio/drafts';
import { postOutputDimensions, postTemplates, type PostDesign, type PostLayer } from '@/lib/post-studio/types';
import { getStudioCraft } from '@/lib/post-studio/studio-craft';
import { commitInteraction } from '@/lib/post-studio/history';
import { positionText, snapTextPosition } from '@/lib/post-studio/positioning';
import { setTextColor } from '@/lib/post-studio/text-colors';
import { setTextTypography } from '@/lib/post-studio/typography';
import { imageEffectControls, setImageEffect } from '@/lib/post-studio/image-effects';
import { moveImage, replaceImage, resetImageAdjustments, setImageFit, wheelMovement } from '@/lib/post-studio/image-positioning';
import { artworkBytes, download } from '@/lib/post-studio/export';
import { findCarouselSiblings, getCarouselBaseTitle, exportCarouselZip, generateInstagramCaption } from '@/lib/post-studio/carousel';
import { Artwork } from './Artwork';
import { ColorPicker, Section, Slider } from './Controls';
import BookReviewModal from './BookReviewModal';
import StudioMediaModal from './StudioMediaModal';
import InstagramPreviewModal from './InstagramPreviewModal';
import styles from './PostStudio.module.css';

type Tool = 'text' | 'layout' | 'media' | 'carousel';
type Change = PostDesign | ((current: PostDesign) => PostDesign);
const fields = [{ layer: 'headline', key: 'headline', label: 'Headline' }, { layer: 'supporting', key: 'summary', label: 'Summary' }, { layer: 'kicker', key: 'eyebrow', label: 'Kicker' }, { layer: 'footer', key: 'author', label: 'Byline' }] as const;

export default function PostEditor({ scope, draft, onClose, canExport = true }: { scope: string; draft: PostDraft; onClose: () => void; canExport?: boolean }) {
    // Carousel state
    const [slides, setSlides] = useState<PostDraft[]>([draft]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [instagramPreviewOpen, setInstagramPreviewOpen] = useState(false);

    // Active design state
    const [design, setDesign] = useState(draft.design);
    const designRef = useRef(design);

    // Media & Modals state
    const [bookModalOpen, setBookModalOpen] = useState(false);
    const [mediaModalOpen, setMediaModalOpen] = useState(false);
    const [quickImageUrl, setQuickImageUrl] = useState('');
    const [quickUrlLoading, setQuickUrlLoading] = useState(false);
    const [mediaCopied, setMediaCopied] = useState(false);
    const [captionCopied, setCaptionCopied] = useState(false);

    // Editor tools & UI state
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
    const carouselExportRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [stageSize, setStageSize] = useState({ width: 360, height: 480 });
    const mounted = useRef(true), dirty = useRef(false);
    const drag = useRef<{ x: number; y: number; design: PostDesign } | null>(null);
    const ballDrag = useRef<{ x: number; y: number } | null>(null);
    const ballRef = useRef<HTMLDivElement>(null);
    const wheelTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Discover sibling drafts in the same carousel pack
    useEffect(() => {
        let active = true;
        void (async () => {
            try {
                const allDrafts = await listDrafts(scope);
                if (!active) return;
                const found = findCarouselSiblings(draft, allDrafts);
                if (found.length > 0) {
                    setSlides(found);
                    const currentIdx = found.findIndex(s => s.id === draft.id);
                    if (currentIdx >= 0) setActiveSlideIndex(currentIdx);
                }
            } catch {
                // Keep default single slide
            }
        })();
        return () => { active = false; };
    }, [scope, draft.id]);

    const activeSlide = slides[activeSlideIndex] || draft;

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
        const targetId = slides[activeSlideIndex]?.id || draft.id;
        try {
            await updateDraft(scope, targetId, { design: snapshot });
            if (snapshot === designRef.current) { dirty.current = false; if (mounted.current) setSaveState('saved'); }
            return true;
        } catch (error) {
            if (mounted.current) { setSaveState('error'); setIssue(error instanceof Error ? error.message : 'Keep the editor open and retry saving.'); }
            return false;
        }
    }, [scope, draft.id, slides, activeSlideIndex]);

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

    // Carousel Slide Switcher
    const switchSlide = async (targetIndex: number) => {
        if (targetIndex < 0 || targetIndex >= slides.length || targetIndex === activeSlideIndex) return;
        const currentSlide = slides[activeSlideIndex];
        if (currentSlide && dirty.current) {
            try {
                await updateDraft(scope, currentSlide.id, { design: designRef.current });
            } catch {
                // ignore
            }
        }
        const updated = [...slides];
        if (updated[activeSlideIndex]) {
            updated[activeSlideIndex] = {
                ...updated[activeSlideIndex],
                design: designRef.current,
            };
            setSlides(updated);
        }
        const nextSlide = updated[targetIndex];
        if (!nextSlide) return;
        dirty.current = false;
        undoRef.current = [];
        redoRef.current = [];
        interaction.current = null;
        setActiveSlideIndex(targetIndex);
        designRef.current = nextSlide.design;
        setDesign(nextSlide.design);
        setHistory({ undo: 0, redo: 0 });
        setSaveState('saved');
    };

    // Carousel Slide Actions
    const handleAddSlide = async () => {
        try {
            const baseTitle = getCarouselBaseTitle(slides[0]?.name || draft.name);
            const newIndex = slides.length + 1;
            const newDesign: PostDesign = {
                ...designRef.current,
                headline: `Key Point ${newIndex}`,
                summary: `Add context, analysis, or quote for slide ${newIndex}.`,
            };
            const created = await createDraft(scope, `${baseTitle} · ${newIndex}/${newIndex}`, newDesign);
            const nextSlides = [...slides, created];
            setSlides(nextSlides);
            await switchSlide(nextSlides.length - 1);
            setNotice(`Slide ${newIndex} added to carousel`);
        } catch (err) {
            setIssue(err instanceof Error ? err.message : 'Could not add slide.');
        }
    };

    const handleDuplicateSlide = async () => {
        try {
            const baseTitle = getCarouselBaseTitle(slides[0]?.name || draft.name);
            const newIndex = slides.length + 1;
            const duplicatedDesign = { ...designRef.current };
            const created = await createDraft(scope, `${baseTitle} · ${newIndex}/${newIndex} (Copy)`, duplicatedDesign);
            const nextSlides = [...slides, created];
            setSlides(nextSlides);
            await switchSlide(nextSlides.length - 1);
            setNotice('Slide duplicated');
        } catch (err) {
            setIssue(err instanceof Error ? err.message : 'Could not duplicate slide.');
        }
    };

    const handleDeleteSlide = async (targetIndex = activeSlideIndex) => {
        if (slides.length <= 1) return;
        const toDelete = slides[targetIndex];
        if (!toDelete) return;
        try {
            await setDraftTrashed(scope, toDelete.id, true);
            const remaining = slides.filter((_, idx) => idx !== targetIndex);
            setSlides(remaining);
            const nextIdx = Math.min(targetIndex, remaining.length - 1);
            setActiveSlideIndex(nextIdx);
            designRef.current = remaining[nextIdx].design;
            setDesign(remaining[nextIdx].design);
            dirty.current = false;
            setNotice('Slide removed from carousel');
        } catch (err) {
            setIssue(err instanceof Error ? err.message : 'Could not delete slide.');
        }
    };

    const handleMoveSlide = (fromIdx: number, direction: -1 | 1) => {
        const targetIdx = fromIdx + direction;
        if (targetIdx < 0 || targetIdx >= slides.length) return;
        const reordered = [...slides];
        const temp = reordered[fromIdx];
        reordered[fromIdx] = reordered[targetIdx];
        reordered[targetIdx] = temp;
        setSlides(reordered);
        if (activeSlideIndex === fromIdx) {
            setActiveSlideIndex(targetIdx);
        } else if (activeSlideIndex === targetIdx) {
            setActiveSlideIndex(fromIdx);
        }
        setNotice(`Slide moved to position ${targetIdx + 1}`);
    };

    const handleCopyCaption = async () => {
        try {
            const caption = generateInstagramCaption(slides);
            await navigator.clipboard.writeText(caption);
            setCaptionCopied(true);
            setTimeout(() => setCaptionCopied(false), 2500);
            setNotice('Instagram caption copied to clipboard!');
        } catch {
            setIssue('Could not copy caption to clipboard.');
        }
    };

    const [outputW, outputH] = postOutputDimensions[design.format];
    const referenceH = 360 * outputH / outputW;
    const availableW = Math.max(260, stageSize.width - (slides.length > 1 ? 120 : 48));
    const availableH = Math.max(260, stageSize.height - 84);
    const scale = Math.max(.2, Math.min(availableW / 360, availableH / referenceH, 1.85));
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

    // Quick Paste URL handler
    const handleApplyQuickUrl = async () => {
        if (!quickImageUrl.trim() || designRef.current.lockedLayers.includes('visual')) return;
        setQuickUrlLoading(true);
        setIssue('');
        try {
            const res = await fetch('/api/admin/studio/media-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: quickImageUrl.trim() }),
            });
            const data = await res.json();
            if (!res.ok || !data.dataUri) {
                throw new Error(data.error || 'Failed to fetch and process image URL.');
            }
            apply(current => replaceImage(current, data.dataUri, keepAdjustments));
            setQuickImageUrl('');
            setNotice('Web image applied to canvas');
        } catch (err) {
            setIssue(err instanceof Error ? err.message : 'Could not load image from URL.');
        } finally {
            setQuickUrlLoading(false);
        }
    };

    // Copy visual URL or Data URI
    const handleCopyActiveVisual = async () => {
        if (!design.imageUri) return;
        try {
            await navigator.clipboard.writeText(design.imageUri);
            setMediaCopied(true);
            setTimeout(() => setMediaCopied(false), 2500);
        } catch {
            setIssue('Could not copy image to clipboard.');
        }
    };

    // Download visual image file
    const handleDownloadActiveVisual = () => {
        if (!design.imageUri) return;
        const link = document.createElement('a');
        link.href = design.imageUri;
        link.download = `${design.headline.slice(0, 24).toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'visual'}.png`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    // Export single slide
    const exportPost = async (slideIdx = activeSlideIndex) => {
        const targetNode = slideIdx === activeSlideIndex ? exportRef.current : carouselExportRefs.current[slideIdx];
        if (!targetNode || exporting || !canExport) return;
        setExporting(true); setIssue(''); setNotice('');
        try {
            if (imageIssue && !design.hiddenLayers.includes('visual')) throw new Error(imageIssue);
            const targetDesign = slides[slideIdx]?.design || design;
            const bytes = await artworkBytes(targetNode, targetDesign.format);
            const cleanName = (targetDesign.headline || activeSlide.name)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
                .slice(0, 42) || 'the-leaders-post';
            download(bytes, `${cleanName}.png`);
            setNotice(`Slide ${slideIdx + 1} downloaded (PNG)`);
        } catch (error) { setIssue(error instanceof Error ? error.message : 'Export failed.'); }
        finally { setExporting(false); }
    };

    // Export all carousel slides as ZIP
    const exportAllCarousel = async () => {
        if (exporting || !canExport) return;
        setExporting(true); setIssue(''); setNotice('');
        try {
            const validNodes = carouselExportRefs.current.filter((n): n is HTMLDivElement => Boolean(n));
            if (validNodes.length !== slides.length) {
                throw new Error('Some slides are still preparing for export.');
            }
            const baseTitle = getCarouselBaseTitle(slides[0]?.name || draft.name)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .slice(0, 32) || 'carousel';
            await exportCarouselZip(validNodes, slides, `${baseTitle}-pack.zip`);
            setNotice(`All ${slides.length} slides exported in ZIP!`);
        } catch (err) {
            setIssue(err instanceof Error ? err.message : 'Carousel ZIP export failed.');
        } finally {
            setExporting(false);
        }
    };

    // Auto-fit overflowing text to slide line limit
    const handleAutoFitText = () => {
        const nodes = exportRef.current?.querySelectorAll<HTMLElement>('[data-line-limit]');
        if (!nodes) return;

        let hasHeadlineOverflow = false;
        let hasSupportingOverflow = false;

        for (const node of Array.from(nodes)) {
            const limit = Number(node.dataset.lineLimit);
            const lh = parseFloat(getComputedStyle(node).lineHeight);
            if (node.scrollHeight > lh * limit + 1) {
                if (node.dataset.testid === 'artwork-headline') {
                    hasHeadlineOverflow = true;
                } else {
                    hasSupportingOverflow = true;
                }
            }
        }

        if (hasHeadlineOverflow) {
            apply(current => ({
                ...current,
                headlineScale: Math.max(0.6, Number((current.headlineScale * 0.9).toFixed(2))),
            }));
            setNotice('Headline scaled down to fit within line limit.');
        } else if (hasSupportingOverflow) {
            apply(current => {
                const currentSize = current.textTypography?.supporting?.size ?? 100;
                const currentSpacing = current.textTypography?.supporting?.lineSpacing ?? 100;
                return setTextTypography(current, 'supporting', {
                    size: Math.max(60, Math.round(currentSize * 0.9)),
                    lineSpacing: Math.max(90, Math.round(currentSpacing * 0.96)),
                });
            });
            setNotice('Summary text size and line spacing adjusted to fit.');
        } else {
            apply(current => {
                const currentSize = current.textTypography?.supporting?.size ?? 100;
                return setTextTypography(current, 'supporting', {
                    size: Math.max(60, Math.round(currentSize * 0.9)),
                });
            });
            setNotice('Text size auto-fitted.');
        }
    };

    // Keyboard navigation shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeEl = document.activeElement;
            const isTyping = activeEl && (
                activeEl.tagName === 'INPUT' ||
                activeEl.tagName === 'TEXTAREA' ||
                activeEl.tagName === 'SELECT' ||
                (activeEl as HTMLElement).isContentEditable
            );
            if (isTyping) return;

            if (e.key === 'ArrowLeft' || e.key === '[') {
                if (slides.length > 1 && activeSlideIndex > 0) {
                    e.preventDefault();
                    void switchSlide(activeSlideIndex - 1);
                }
            } else if (e.key === 'ArrowRight' || e.key === ']') {
                if (slides.length > 1 && activeSlideIndex < slides.length - 1) {
                    e.preventDefault();
                    void switchSlide(activeSlideIndex + 1);
                }
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    if (history.redo) undo(true);
                } else {
                    if (history.undo) undo();
                }
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
                e.preventDefault();
                if (history.redo) undo(true);
            } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                void persist();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [slides.length, activeSlideIndex, history, undo, persist]);

    const field = fields.find(item => item.layer === selected) || fields[0];
    const textLocked = design.lockedLayers.includes(field.layer);
    const slider = (label: string, value: number, min: number, max: number, change: (value: number) => Change, disabled = false, vertical = false) => <Slider label={label} value={value} min={min} max={max} disabled={disabled} vertical={vertical} onStart={begin} onChange={value => live(change(value))} onEnd={end} />;
    const choice = (label: string, active: boolean, action: () => void, disabled = false) => <button type="button" key={label} className={`${styles.choice} ${active ? styles.active : ''}`} aria-pressed={active} disabled={disabled} onClick={action}>{label}</button>;

    const isBookTemplate = design.template.startsWith('book-');
    const currentCraft = getStudioCraft(design.template);

    return <div className={`${styles.studio} ${styles.editor}`}>
        {/* Top Professional Toolbar */}
        <header className={styles.topToolbar}>
            <div className={styles.toolbarLeft}>
                <button
                    type="button"
                    className={styles.toolbarCloseBtn}
                    aria-label="Close editor"
                    onClick={async () => { if (await persist()) onClose(); }}
                    title="Close editor and return to drafts"
                >
                    <X size={18} />
                </button>
                <div className={styles.toolbarTitleGroup}>
                    <h1 className={styles.toolbarTitle} title={activeSlide.name}>
                        {getCarouselBaseTitle(activeSlide.name)}
                    </h1>
                    {slides.length > 1 && (
                        <span className={styles.toolbarSlideBadge}>
                            Slide {activeSlideIndex + 1} of {slides.length}
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    className={styles.toolbarSaveBtn}
                    onClick={() => { void persist(); }}
                    title="Click to save changes now"
                >
                    <span className={`${styles.saveDot} ${saveState === 'saving' ? styles.saving : saveState === 'error' ? styles.failed : ''}`} />
                    <span className={styles.saveStatusText}>
                        {saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving…' : 'Save failed'}
                    </span>
                </button>
            </div>

            <div className={styles.toolbarCenter}>
                <button
                    type="button"
                    className={styles.instagramPreviewBtn}
                    onClick={() => setInstagramPreviewOpen(true)}
                    title="Open live Instagram feed simulator"
                >
                    <Instagram size={15} />
                    <span>Instagram Preview</span>
                </button>
            </div>

            <div className={styles.toolbarRight}>
                <div className={styles.historyGroup}>
                    <button
                        type="button"
                        className={styles.toolbarIconBtn}
                        aria-label="Undo"
                        title="Undo (Ctrl+Z)"
                        disabled={!history.undo}
                        onClick={() => undo()}
                    >
                        <Undo2 size={16} />
                    </button>
                    <button
                        type="button"
                        className={styles.toolbarIconBtn}
                        aria-label="Redo"
                        title="Redo (Ctrl+Y)"
                        disabled={!history.redo}
                        onClick={() => undo(true)}
                    >
                        <Redo2 size={16} />
                    </button>
                </div>

                {slides.length > 1 && (
                    <button
                        type="button"
                        className={styles.toolbarSecondaryBtn}
                        disabled={exporting || !canExport}
                        onClick={exportAllCarousel}
                        title="Export all carousel slides as a ZIP file"
                    >
                        <Download size={15} />
                        <span>Export ZIP ({slides.length})</span>
                    </button>
                )}

                <button
                    type="button"
                    className={styles.toolbarPrimaryBtn}
                    disabled={exporting || !canExport || Boolean(imageIssue && !design.hiddenLayers.includes('visual'))}
                    onClick={() => { void exportPost(activeSlideIndex); }}
                    title="Export current slide as high-res PNG"
                >
                    <Download size={15} />
                    <span>{exporting ? 'Exporting…' : slides.length > 1 ? `Export Slide ${activeSlideIndex + 1}` : 'Export PNG'}</span>
                </button>
            </div>
        </header>

        {/* Global Warning / Notification Banner */}
        {(issue || imageIssue || overflow) && (
            <div className={styles.alertBanner} role="alert">
                <div className={styles.alertMessage}>
                    <AlertCircle size={15} />
                    <span>{issue || imageIssue || 'Text exceeds this format’s line limit. It may be clipped on export.'}</span>
                </div>
                {overflow && (
                    <button
                        type="button"
                        className={styles.autoFitBtn}
                        onClick={handleAutoFitText}
                        title="Automatically adjust font size and line spacing to fit"
                    >
                        <Sparkles size={13} />
                        Auto-fit Text Size
                    </button>
                )}
            </div>
        )}

        {notice && (
            <div className={styles.noticeBanner} role="status">
                <div className={styles.alertMessage}>
                    <Check size={14} />
                    <span>{notice}</span>
                </div>
                <button type="button" className={styles.bannerCloseBtn} onClick={() => setNotice('')}>
                    <X size={12} />
                </button>
            </div>
        )}

        <div className={styles.body}>
            <div ref={stageRef} className={styles.stage}>
                <div className={styles.stageMetaPill}>
                    <span className={styles.stageMetaDimension}>{outputW} × {outputH}</span>
                    <span className={styles.stageMetaDivider}>•</span>
                    <span className={styles.stageMetaFormat}>{reposition ? 'Drag to Reposition' : design.format.toUpperCase()}</span>
                    {slides.length > 1 && (
                        <>
                            <span className={styles.stageMetaDivider}>•</span>
                            <span className={styles.stageMetaSlide}>Slide {activeSlideIndex + 1} of {slides.length}</span>
                        </>
                    )}
                </div>

                {/* Stage Canvas Wrap with Navigation Chevrons Outside the Artwork */}
                <div className={styles.stageCanvasWrap}>
                    {slides.length > 1 && (
                        <button
                            type="button"
                            className={styles.stageNavBtn}
                            disabled={activeSlideIndex === 0}
                            onClick={() => switchSlide(activeSlideIndex - 1)}
                            aria-label="Previous Slide"
                            title="Previous Slide (← or [)"
                        >
                            <ChevronLeft size={22} />
                        </button>
                    )}

                    <div 
                        className={styles.canvasShell} 
                        style={{ width: 360 * scale, height: referenceH * scale, position: 'relative' }} 
                        onPointerDown={canvasDown} 
                        onPointerMove={canvasMove} 
                        onPointerUp={canvasEnd} 
                        onPointerCancel={canvasEnd}
                    >
                        <div className={styles.scaledArtwork} style={{ transform: `scale(${scale})` }}>
                            <Artwork 
                                ref={previewRef} 
                                design={design} 
                                selected={selected} 
                                guides={reposition} 
                                onSelect={reposition ? undefined : select} 
                                onChooseImage={() => setMediaModalOpen(true)} 
                            />
                        </div>

                        {/* Clean Instagram Carousel Counter Badge on Canvas */}
                        {slides.length > 1 && (
                            <div className={styles.carouselCanvasCounter}>
                                {activeSlideIndex + 1}/{slides.length}
                            </div>
                        )}
                    </div>

                    {slides.length > 1 && (
                        <button
                            type="button"
                            className={styles.stageNavBtn}
                            disabled={activeSlideIndex === slides.length - 1}
                            onClick={() => switchSlide(activeSlideIndex + 1)}
                            aria-label="Next Slide"
                            title="Next Slide (→ or ])"
                        >
                            <ChevronRight size={22} />
                        </button>
                    )}
                </div>

                {/* Pagination Dots below Canvas */}
                {slides.length > 1 && (
                    <div className={styles.stageDotsRow} role="tablist" aria-label="Slides pagination">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                className={`${styles.stageDot} ${idx === activeSlideIndex ? styles.stageDotActive : ''}`}
                                onClick={() => switchSlide(idx)}
                                aria-label={`Jump to slide ${idx + 1}`}
                                title={`Slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <aside className={styles.inspector}>
                <div className={styles.tabs} role="tablist" aria-label="Editor tools">
                    {([{ key: 'text', label: 'Text', Icon: Type }, { key: 'layout', label: 'Layout', Icon: LayoutTemplate }, { key: 'media', label: 'Media', Icon: ImagePlus }, { key: 'carousel', label: 'Carousel', Icon: Layers3 }] as const).map(({ key, label, Icon }) => (
                        <button key={key} role="tab" aria-selected={tool === key} className={styles.tab} onClick={() => { setTool(key); setReposition(false); if (key === 'media') setSelected('visual'); else if (key === 'text' && selected === 'visual') setSelected('headline'); }}>
                            <div className={styles.tabIconWrap}>
                                <Icon size={18} />
                                {key === 'carousel' && slides.length > 1 && (
                                    <span className={styles.tabCountBadge}>{slides.length}</span>
                                )}
                            </div>
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                <div className={styles.panel} role="tabpanel" aria-label={`${tool} controls`} key={tool}>
                    {tool === 'text' && <>
                        <div className={styles.layerGrid}>{fields.map(item => {
                            const cl = currentCraft.layers.find(l => l.key === item.layer);
                            const isSelected = selected === item.layer;
                            const label = cl ? cl.label : item.label;
                            const role = cl ? cl.role : item.layer.toUpperCase();
                            return (
                                <button
                                    key={item.layer}
                                    type="button"
                                    className={`${styles.layerChoiceCard} ${isSelected ? styles.layerChoiceCardActive : ''}`}
                                    onClick={() => select(item.layer)}
                                >
                                    <span className={styles.layerChoiceRole}>{role}</span>
                                    <span className={styles.layerChoiceLabel} title={label}>{label}</span>
                                </button>
                            );
                        })}</div>
                        <label className={styles.field}>
                            <div className={styles.between}>
                                <span>{(currentCraft.layers.find(l => l.key === field.layer)?.label || field.label)}{textLocked ? ' · locked' : ''}</span>
                                <span className={styles.subtle} style={{ fontSize: 11 }}>
                                    {design[field.key].length} chars · {design[field.key].split('\n').filter(Boolean).length} paras
                                </span>
                            </div>
                            <textarea className={styles.input} aria-label={`Edit ${field.label.toLowerCase()}`} rows={5} disabled={textLocked} value={design[field.key]} onChange={event => update(field.key, field.key === 'eyebrow' ? event.target.value.toUpperCase() : event.target.value)} />
                        </label>
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
                        <div className={styles.field}>
                            <strong>{design.imageUri ? 'Background Visual' : 'Add Post Visual'}</strong>
                            <p className={styles.subtle}>
                                {design.imageUri
                                    ? 'Reposition, zoom, style or replace with web archives & Google search.'
                                    : 'Search web archives, paste any Google image URL, or upload from your device.'}
                            </p>
                            <div className={styles.row}>
                                <button
                                    type="button"
                                    className={styles.primary}
                                    style={{ flex: 1 }}
                                    disabled={design.lockedLayers.includes('visual')}
                                    onClick={() => setMediaModalOpen(true)}
                                >
                                    <Globe size={16} />
                                    {design.imageUri ? 'Browse / Replace Web Media' : 'Browse & Search Web Media'}
                                </button>
                                <button
                                    type="button"
                                    className={styles.button}
                                    disabled={design.lockedLayers.includes('visual')}
                                    onClick={() => fileRef.current?.click()}
                                    title="Upload file from device"
                                >
                                    <Upload size={16} />
                                    Upload
                                </button>
                            </div>
                        </div>

                        <div className={styles.field}>
                            <span>Quick Paste Web or Google Image URL</span>
                            <div className={styles.quickUrlBar}>
                                <input
                                    type="url"
                                    className={styles.quickUrlInput}
                                    placeholder="Paste Google or web image URL…"
                                    value={quickImageUrl}
                                    onChange={e => setQuickImageUrl(e.target.value)}
                                    disabled={design.lockedLayers.includes('visual') || quickUrlLoading}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            void handleApplyQuickUrl();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className={styles.quickUrlSubmitBtn}
                                    disabled={!quickImageUrl.trim() || design.lockedLayers.includes('visual') || quickUrlLoading}
                                    onClick={() => { void handleApplyQuickUrl(); }}
                                >
                                    {quickUrlLoading ? 'Loading…' : 'Load URL'}
                                </button>
                            </div>
                        </div>

                        {design.imageUri && (
                            <div className={styles.row}>
                                <button
                                    type="button"
                                    className={styles.button}
                                    style={{ flex: 1 }}
                                    onClick={handleCopyActiveVisual}
                                    title="Copy image URL or Data URI"
                                >
                                    {mediaCopied ? <Check size={15} color="var(--studio-green)" /> : <Copy size={15} />}
                                    {mediaCopied ? 'Copied' : 'Copy Image'}
                                </button>
                                <button
                                    type="button"
                                    className={styles.button}
                                    style={{ flex: 1 }}
                                    onClick={handleDownloadActiveVisual}
                                    title="Download current artwork image"
                                >
                                    <Download size={15} />
                                    Download Image
                                </button>
                            </div>
                        )}

                        <label className={styles.row}>
                            <input type="checkbox" checked={keepAdjustments} onChange={event => setKeepAdjustments(event.target.checked)} />
                            Keep adjustments on replace
                        </label>

                        <div className={styles.field}><span>Image crop</span><div className={styles.row}>{choice('Fill canvas', design.imageFit === 'cover', () => apply(current => setImageFit(current, 'cover')), mediaDisabled)}{choice('Fit whole photo', design.imageFit === 'contain', () => apply(current => setImageFit(current, 'contain')), mediaDisabled)}</div></div>
                        <div className={styles.field}><span>Image position</span><div ref={ballRef} role="group" aria-label="Image scroll ball" aria-disabled={mediaDisabled} className={styles.ball}
                            onPointerDown={event => { if (mediaDisabled) return; event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); begin(); ballDrag.current = { x: event.clientX, y: event.clientY }; }}
                            onPointerMove={event => { const previous = ballDrag.current; if (!previous) return; live(current => moveImage(current, event.clientX - previous.x, event.clientY - previous.y)); ballDrag.current = { x: event.clientX, y: event.clientY }; }}
                            onPointerUp={() => { ballDrag.current = null; end(); }} onPointerCancel={() => { ballDrag.current = null; end(); }}><i style={{ transform: `rotate(${design.imageOffsetX * 2}deg) translate(${design.imageOffsetX / 12}px, ${design.imageOffsetY / 12}px)` }} /></div>
                            <div className={styles.dPadRow}>
                                {([{ label: 'Move image left', dx: -2, dy: 0, Icon: ArrowLeft }, { label: 'Move image up', dx: 0, dy: -2, Icon: ArrowUp }, { label: 'Move image down', dx: 0, dy: 2, Icon: ArrowDown }, { label: 'Move image right', dx: 2, dy: 0, Icon: ArrowRight }]).map(({ label, dx, dy, Icon }) => (
                                    <button
                                        key={label}
                                        type="button"
                                        className={styles.dPadBtn}
                                        aria-label={label}
                                        title={label}
                                        disabled={mediaDisabled}
                                        onClick={() => apply(current => moveImage(current, dx, dy))}
                                    >
                                        <Icon size={16} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        {slider('Image zoom', design.imageZoom * 100, 100, 300, value => current => ({ ...current, imageZoom: value / 100 }), mediaDisabled)}
                        <Section title="Image effects"><button className={styles.button} disabled={mediaDisabled} onClick={() => apply(current => imageEffectControls.reduce((next, effect) => setImageEffect(next, effect.key, 0), current))}>Reset image effects</button>{imageEffectControls.map(effect => <div key={effect.key}>{slider(effect.label, design[effect.key], 0, 100, value => current => setImageEffect(current, effect.key, value), mediaDisabled)}</div>)}</Section>
                        <div className={styles.field}><span>Image tone</span><div className={styles.row}>{(['ink', 'clear', 'warm'] as const).map(tone => choice(tone[0].toUpperCase() + tone.slice(1), design.imageTone === tone, () => update('imageTone', tone), mediaDisabled))}</div></div>
                        <button className={styles.button} disabled={mediaDisabled} onClick={() => apply(resetImageAdjustments)}>Reset all image adjustments</button>
                        <div className={styles.row}><button className={styles.button} disabled={mediaDisabled} onClick={() => apply(current => ({ ...current, imageOffsetX: 0, imageOffsetY: 0 }))}>Reset position</button><button className={styles.button} disabled={!design.imageUri || design.lockedLayers.includes('visual')} onClick={() => update('imageUri', null)}>Remove image</button></div>
                    </>}

                    {tool === 'carousel' && (
                        <div className={styles.carouselInspector}>
                            {/* Deck Header & Quick Actions */}
                            <div className={styles.carouselDeckCard}>
                                <div className={styles.between}>
                                    <div className={styles.carouselDeckInfo}>
                                        <span className={styles.carouselDeckBadge}>
                                            <Layers3 size={13} />
                                            CAROUSEL DECK
                                        </span>
                                        <strong className={styles.carouselDeckTitle}>
                                            {slides.length} {slides.length === 1 ? 'Slide' : 'Slides'} Total
                                        </strong>
                                    </div>
                                    <div className={styles.carouselTopActions}>
                                        <button
                                            type="button"
                                            className={styles.carouselAddBtn}
                                            onClick={handleAddSlide}
                                            title="Add a new blank slide"
                                        >
                                            <Plus size={14} />
                                            <span>Add Slide</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.carouselDuplicateBtn}
                                            onClick={handleDuplicateSlide}
                                            title="Duplicate current slide"
                                        >
                                            <Copy size={13} />
                                            <span>Duplicate</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Vertical Slide Sequence List */}
                            <div className={styles.carouselSlideSection}>
                                <div className={styles.between} style={{ marginBottom: 4 }}>
                                    <span className={styles.inspectorSectionLabel}>SLIDES SEQUENCE</span>
                                    <span className={styles.subtle} style={{ fontSize: 11 }}>
                                        Active: Slide {activeSlideIndex + 1}
                                    </span>
                                </div>

                                <div className={styles.carouselSlideList}>
                                    {slides.map((s, idx) => {
                                        const isCurrent = idx === activeSlideIndex;
                                        const title = s.design.headline || s.name || `Slide ${idx + 1}`;
                                        const archetypeLabel = s.design.template === 'book-review' ? 'Cover / Thesis'
                                            : s.design.template === 'book-analysis' ? 'Analysis & Proof'
                                            : s.design.template === 'book-takeaways' ? 'Key Takeaways'
                                            : s.design.template === 'book-verdict' ? 'Verdict & Quote'
                                            : s.design.template.replace(/^book-/, '');

                                        return (
                                            <div
                                                key={s.id}
                                                className={`${styles.carouselSlideItem} ${isCurrent ? styles.carouselSlideItemActive : ''}`}
                                            >
                                                <button
                                                    type="button"
                                                    className={styles.carouselSlideMainBtn}
                                                    onClick={() => switchSlide(idx)}
                                                    title={`Switch to Slide ${idx + 1}: ${title}`}
                                                >
                                                    <div className={styles.carouselSlideNumber}>
                                                        {idx + 1}
                                                    </div>
                                                    <div className={styles.carouselSlideMeta}>
                                                        <span className={styles.carouselSlideArchetypeTag}>{archetypeLabel}</span>
                                                        <strong className={styles.carouselSlideHeadline}>{title}</strong>
                                                    </div>
                                                </button>

                                                <div className={styles.carouselSlideItemActions}>
                                                    <button
                                                        type="button"
                                                        className={styles.carouselMiniActionBtn}
                                                        disabled={idx === 0}
                                                        onClick={(e) => { e.stopPropagation(); handleMoveSlide(idx, -1); }}
                                                        title="Move slide up"
                                                        aria-label="Move slide up"
                                                    >
                                                        <ArrowUp size={13} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={styles.carouselMiniActionBtn}
                                                        disabled={idx === slides.length - 1}
                                                        onClick={(e) => { e.stopPropagation(); handleMoveSlide(idx, 1); }}
                                                        title="Move slide down"
                                                        aria-label="Move slide down"
                                                    >
                                                        <ArrowDown size={13} />
                                                    </button>
                                                    {slides.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className={`${styles.carouselMiniActionBtn} ${styles.carouselDeleteBtn}`}
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteSlide(idx); }}
                                                            title="Delete this slide"
                                                            aria-label="Delete this slide"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Current Slide Archetype Switcher */}
                            {currentCraft.archetypes && (
                                <div className={styles.archetypeBox}>
                                    <div className={styles.between}>
                                        <span className={styles.inspectorSectionLabel}>
                                            SLIDE {activeSlideIndex + 1} ARCHETYPE
                                        </span>
                                        <span className={styles.subtle} style={{ fontSize: 11 }}>
                                            {design.template}
                                        </span>
                                    </div>
                                    <div className={styles.archetypeGrid}>
                                        {currentCraft.archetypes.map(arch => {
                                            const isActive = design.template === arch.key;
                                            return (
                                                <button
                                                    key={arch.key}
                                                    type="button"
                                                    className={`${styles.archetypePill} ${isActive ? styles.archetypePillActive : ''}`}
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
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Instagram Caption Section with 1-Click Copy */}
                            <div className={styles.carouselCaptionCard}>
                                <div className={styles.between}>
                                    <span className={styles.inspectorSectionLabel}>INSTAGRAM CAPTION</span>
                                    <button
                                        type="button"
                                        className={styles.captionCopyBtn}
                                        onClick={handleCopyCaption}
                                        title="Copy Instagram caption to clipboard"
                                    >
                                        {captionCopied ? (
                                            <>
                                                <Check size={13} color="#10B981" />
                                                <span style={{ color: '#10B981' }}>Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={13} />
                                                <span>Copy Caption</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className={styles.captionPreviewBox}>
                                    {generateInstagramCaption(slides)}
                                </div>
                            </div>

                            {/* Footer Actions: Book Review Master Generator, Instagram Simulator, ZIP Export */}
                            <div className={styles.carouselFooterActions}>
                                {isBookTemplate && (
                                    <button
                                        type="button"
                                        className={styles.button}
                                        style={{ width: '100%', borderColor: 'var(--studio-red)', color: 'var(--studio-red)' }}
                                        onClick={() => setBookModalOpen(true)}
                                    >
                                        <BookOpen size={16} />
                                        AI Prompt & Data Generator
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className={styles.button}
                                    style={{ width: '100%' }}
                                    onClick={() => setInstagramPreviewOpen(true)}
                                >
                                    <Instagram size={16} color="#E1306C" />
                                    Open Instagram Simulator
                                </button>
                                <button
                                    type="button"
                                    className={styles.primary}
                                    style={{ width: '100%' }}
                                    disabled={exporting || !canExport}
                                    onClick={exportAllCarousel}
                                >
                                    <Download size={16} />
                                    {exporting ? 'Exporting Carousel...' : `Download All ${slides.length} Slides (ZIP)`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </div>

        <input 
            type="file" 
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif" 
            hidden 
            ref={fileRef} 
            aria-label="Upload studio photo" 
            onChange={event => { void chooseFile(event.target.files?.[0]); event.target.value = ''; }} 
        />

        {/* Offscreen artwork nodes for single export and carousel batch zip */}
        <div className={styles.offscreen} aria-hidden="true">
            <Artwork ref={exportRef} design={design} />
            {slides.map((s, idx) => (
                <div key={s.id} ref={el => { carouselExportRefs.current[idx] = el; }}>
                    <Artwork design={s.design} />
                </div>
            ))}
        </div>

        {/* Book Review Modal */}
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

        {/* Web Media Search & Direct URL Modal */}
        {mediaModalOpen && (
            <StudioMediaModal
                onClose={() => setMediaModalOpen(false)}
                onApplyImage={(uri) => {
                    apply(current => replaceImage(current, uri, keepAdjustments));
                    setMediaModalOpen(false);
                    setNotice('Web image applied to canvas');
                }}
                initialQuery={design.headline ? design.headline.slice(0, 40) : (design.category || "Nepal politics")}
            />
        )}

        {/* Instagram Mobile Feed Simulator Modal */}
        {instagramPreviewOpen && (
            <InstagramPreviewModal
                slides={slides}
                activeSlideIndex={activeSlideIndex}
                onSelectSlide={(index) => {
                    void switchSlide(index);
                }}
                onClose={() => setInstagramPreviewOpen(false)}
                onExportCurrent={(index) => exportPost(index)}
                onExportAll={slides.length > 1 ? exportAllCarousel : undefined}
            />
        )}
    </div>;
}

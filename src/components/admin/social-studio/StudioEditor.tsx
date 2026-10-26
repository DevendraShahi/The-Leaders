"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, ArrowLeft, FolderOpen, Undo2, Redo2, Crop, TextCursorInput, Images, PanelsTopLeft, NotebookPen, ClipboardCheck, Plus, Expand, Shrink, ArrowUpFromLine, Loader2, Sparkles, Download } from 'lucide-react';
import { createSocialPostSvg, socialPostPreflight } from '@/lib/social-artboard';
import { socialPostDimensions, outputFilename } from '@/lib/social-post';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Field, IconButton, StudioButton, StudioSelect } from './StudioControls';
import { applySuggestion, changesSince, cropValue, currentArtifact, fingerprint, idOf, type Artifact, type Asset, type Source, type Suggestion, type StudioApi, type StudioPost, type StudioUser } from './session';
import s from './StudioEditor.module.css';

type Tool = 'crop' | 'text' | 'media' | 'templates' | 'captions' | 'review';
const tools = [
    { id: 'crop', label: 'Crop', icon: Crop }, { id: 'text', label: 'Text', icon: TextCursorInput },
    { id: 'media', label: 'Media', icon: Images }, { id: 'templates', label: 'Templates', icon: PanelsTopLeft },
    { id: 'captions', label: 'Captions', icon: NotebookPen }, { id: 'review', label: 'Review', icon: ClipboardCheck },
] as const;
const statusLabel = { draft: 'Draft', in_review: 'In review', changes_requested: 'Changes requested', approved: 'Approved', exported: 'Exported' };
const templateNames = { news: 'Standard news', breaking: 'Breaking / developing', quote: 'Quote', data: 'Data / election result' };
const message = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Try again.';
const artboard = (post: StudioPost, image: string, size?: { width?: number; height?: number }) => createSocialPostSvg(post as unknown as Parameters<typeof createSocialPostSvg>[0], image, size);
const check = (post: StudioPost, verified = true) => socialPostPreflight(post as unknown as Parameters<typeof socialPostPreflight>[0], verified);

/** This surface is service-driven, enabling UI tests without authentication bypass routes. */
export default function StudioEditor({ api, user, onExit }: { api: StudioApi; user: StudioUser; onExit: () => void }) {
    const [post, setPost] = useState<StudioPost | null>(null);
    const [baseline, setBaseline] = useState<StudioPost | null>(null);
    const [posts, setPosts] = useState<StudioPost[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [reviewers, setReviewers] = useState<{ _id: string; name?: string; username?: string }[]>([]);
    const [inbox, setInbox] = useState<Source[]>([]);
    const [tool, setTool] = useState<Tool | null>(null);
    const [library, setLibrary] = useState(false);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [offline, setOffline] = useState(false);
    const [sourceUrl, setSourceUrl] = useState('');
    const [sourceExcerpt, setSourceExcerpt] = useState('');
    const [brief, setBrief] = useState('');
    const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
    const [fullPreview, setFullPreview] = useState(false);
    const [readyArtifact, setReadyArtifact] = useState('');
    const [history, setHistory] = useState<{ past: StudioPost[]; future: StudioPost[] }>({ past: [], future: [] });
    const canvasRef = useRef<HTMLDivElement>(null);
    const draftSearchRef = useRef<HTMLInputElement>(null);
    const currentRef = useRef(post); currentRef.current = post;
    const savedRef = useRef(baseline); savedRef.current = baseline;
    const lock = useRef(false);
    const [canvasSize, setCanvasSize] = useState({ width: 400, height: 500 });
    const can = (permission: 'create' | 'edit' | 'submit' | 'approve' | 'export') => permission === 'export' || user.role === 'superadmin' || Boolean(user.permissions?.socialPosts?.[permission]);
    const dirty = Boolean(post && baseline && fingerprint(post) !== fingerprint(baseline));
    const copy = post?.copy[post.outputLanguage] || {};
    const mediaId = idOf(post?.media?.mediaId);
    const asset = assets.find(item => item._id === mediaId) || (typeof post?.media?.mediaId === 'object' ? post.media.mediaId : null);
    const picture = asset?.secureUrl || '';
    const svg = useMemo(() => post ? artboard(post, picture, asset || undefined) : '', [post, picture, asset]);
    const preflight = useMemo(() => post ? check(post) : [], [post]);
    const artifact = post ? currentArtifact(post, dirty) : undefined;
    const artifactReady = Boolean(artifact && readyArtifact === `${post?._id}:${artifact.url}:${artifact.revision}:${artifact.locale}:${artifact.format}`);
    const assignedReviewer = Boolean(post && idOf(post.reviewerId) === user.id && idOf(post.ownerId) !== user.id && can('approve'));
    const locked = Boolean(busy) || loading || offline;

    const install = useCallback((value: StudioPost, clearHistory = false) => {
        currentRef.current = value; savedRef.current = value;
        setPost(value); setBaseline(value);
        setPosts(all => [value, ...all.filter(item => item._id !== value._id)]);
        if (clearHistory) { setHistory({ past: [], future: [] }); setSuggestion(null); }
    }, []);
    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const list = await api<{ posts: StudioPost[] }>('/api/admin/social-posts');
            setPosts(list.posts || []);
            const results = await Promise.allSettled([
                api<{ media: Asset[] }>('/api/admin/media?limit=80'),
                api<{ reviewers: { _id: string; name?: string; username?: string }[] }>('/api/admin/social-posts/reviewers'),
                api<{ items: Source[] }>('/api/admin/social-sources/inbox'),
            ]);
            if (results[0].status === 'fulfilled') setAssets(results[0].value.media || []);
            if (results[1].status === 'fulfilled') setReviewers(results[1].value.reviewers || []);
            if (results[2].status === 'fulfilled') setInbox(results[2].value.items || []);
            if (results.some(result => result.status === 'rejected')) setError('Some library or source services are unavailable. Retry to reload them.');
            if (!currentRef.current && list.posts?.length) {
                const selected = await api<{ post: StudioPost }>(`/api/admin/social-posts/${list.posts[0]._id}`);
                install(selected.post, true);
            }
        } catch (problem) { setError(message(problem)); }
        finally { setLoading(false); }
    }, [api, install]);
    useEffect(() => { void load(); }, [load]);
    useEffect(() => {
        const previous = document.body.style.overflow; document.body.style.overflow = 'hidden';
        const connection = () => setOffline(!navigator.onLine); connection();
        window.addEventListener('online', connection); window.addEventListener('offline', connection);
        return () => { document.body.style.overflow = previous; window.removeEventListener('online', connection); window.removeEventListener('offline', connection); };
    }, []);
    useEffect(() => {
        const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
        window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const measure = () => { const rect = canvas.getBoundingClientRect(); setCanvasSize({ width: Math.max(1, rect.width - 48), height: Math.max(1, rect.height - 24) }); };
        const observer = new ResizeObserver(measure); observer.observe(canvas); measure(); return () => observer.disconnect();
    }, [loading, post?._id]);

    const edit = (update: (current: StudioPost) => StudioPost) => {
        const current = currentRef.current; if (!current || !can('edit') || lock.current) return;
        const next = update(current); if (fingerprint(current) === fingerprint(next)) return;
        setHistory(value => ({ past: [...value.past.slice(-49), current], future: [] })); currentRef.current = next; setPost(next);
    };
    const patch = (fields: Partial<StudioPost>) => edit(current => ({ ...current, ...fields }));
    const setCopy = (key: string, value: string | string[]) => edit(current => ({ ...current, copy: { ...current.copy, [current.outputLanguage]: { ...current.copy[current.outputLanguage], [key]: value } }, verification: ['headline', 'deck', 'quoteSpeaker', 'quoteContext', 'statisticValue', 'statisticLabel', 'statisticAsOf'].includes(key) ? { ...current.verification, claimsConfirmed: false } : current.verification }));
    const undo = (redo = false) => {
        if (!post || locked || !can('edit')) return;
        const target = (redo ? history.future : history.past).at(-1); if (!target) return;
        const next = { ...target, revision: post.revision, status: post.status, approval: post.approval, renderArtifacts: post.renderArtifacts };
        setHistory(redo ? { past: [...history.past, post], future: history.future.slice(0, -1) } : { past: history.past.slice(0, -1), future: [...history.future, post] });
        currentRef.current = next; setPost(next);
    };
    const run = async (name: string, operation: () => Promise<void>) => {
        if (lock.current || offline) return;
        lock.current = true; setBusy(name); setError('');
        try { await operation(); } catch (problem) { setError(message(problem)); }
        finally { lock.current = false; setBusy(''); }
    };
    const save = async (): Promise<StudioPost | null> => {
        const current = currentRef.current; const saved = savedRef.current;
        if (!current || !saved || fingerprint(current) === fingerprint(saved)) return current;
        const data = await api<{ post: StudioPost }>(`/api/admin/social-posts/${current._id}`, { method: 'PATCH', body: JSON.stringify({ revision: current.revision, ...changesSince(current, saved) }) });
        install(data.post); return data.post;
    };
    const openPost = (id: string) => run('open', async () => { await save(); const data = await api<{ post: StudioPost }>(`/api/admin/social-posts/${id}`); install(data.post, true); setLibrary(false); setTool(null); });
    const create = () => run('create', async () => { await save(); const data = await api<{ post: StudioPost }>('/api/admin/social-posts', { method: 'POST', body: '{}' }); install(data.post, true); setLibrary(false); setTool('text'); });
    const action = (name: string, sourceIndex?: number) => run(name, async () => {
        const current = await save(); if (!current) return;
        if (name === 'render') {
            const data = await api<{ artifact: Artifact }>(`/api/admin/social-posts/${current._id}/render`, { method: 'POST', body: JSON.stringify({ revision: current.revision }) });
            install({ ...current, renderArtifacts: [...(current.renderArtifacts || []).filter(item => item.revision !== data.artifact.revision || item.locale !== data.artifact.locale || item.format !== data.artifact.format), data.artifact] });
        } else {
            const data = await api<{ post: StudioPost }>(`/api/admin/social-posts/${current._id}/actions`, { method: 'POST', body: JSON.stringify({ action: name, revision: current.revision, sourceIndex }) }); install(data.post);
        }
    });
    const attach = (source: Partial<Source>) => {
        if (!post || !source.url) return;
        let url: URL;
        try { url = new URL(source.url); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); }
        catch { setError('Enter a valid HTTP or HTTPS source link.'); return; }
        if (post.sources.length >= 12) { setError('A post can have up to 12 sources.'); return; }
        if (post.sources.some(item => item.url === url.href)) { setError('This source is already attached.'); return; }
        edit(current => ({ ...current, sources: [...current.sources, { url: url.href, title: source.title || url.hostname, publisher: source.publisher || url.hostname, excerpt: source.excerpt || '', trusted: Boolean(source.trusted) }], verification: { claimsConfirmed: false, sourcesConfirmed: false } }));
        setSourceUrl(''); setSourceExcerpt('');
    };
    const generate = (mode: 'draft' | 'translate') => run('ai', async () => {
        const current = await save(); if (!current) return;
        const data = await api<{ suggestion: Suggestion }>(`/api/admin/social-posts/${current._id}/ai`, { method: 'POST', body: JSON.stringify({ mode, brief }) }); setSuggestion(data.suggestion);
    });
    const upload = (file?: File) => run('upload', async () => {
        if (!file || !post) return;
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) || file.size > 12 * 1024 * 1024) throw new Error('Use a JPG, PNG, WebP or AVIF image up to 12 MB.');
        const form = new FormData(); form.append('file', file); form.append('category', 'social'); form.append('credit', post.media.credit); form.append('rightsStatus', post.media.rightsStatus);
        form.append('altTextEn', String(post.copy.en?.altText || '')); form.append('altTextNe', String(post.copy.ne?.altText || ''));
        const data = await api<{ media: Asset }>('/api/admin/media/upload', { method: 'POST', body: form }); setAssets(all => [data.media, ...all]);
        const next = { ...post, media: { ...post.media, mediaId: data.media, focalX: .5, focalY: .5, zoom: 1 } };
        setHistory(value => ({ past: [...value.past.slice(-49), post], future: [] })); currentRef.current = next; setPost(next);
    });
    const download = () => run('download', async () => {
        if (!post || dirty || !artifact || !artifactReady || post.status !== 'approved' || !can('export')) throw new Error('Load and approve the current rendered revision before exporting.');
        const file = await api<Blob>(`/api/admin/social-posts/${post._id}/download`);
        const url = URL.createObjectURL(file); const link = document.createElement('a'); link.href = url; link.download = outputFilename(post.title, post.outputLanguage, post.format, post.revision); document.body.appendChild(link); link.click(); link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    const exit = () => run('save', async () => { await save(); onExit(); });
    const saveShortcut = useRef(() => {}); saveShortcut.current = () => { void run('save', async () => { await save(); }); };
    useEffect(() => {
        const keyboard = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); saveShortcut.current(); } if (event.key === 'Escape' && !event.defaultPrevented) { setTool(null); setFullPreview(false); } };
        window.addEventListener('keydown', keyboard); return () => window.removeEventListener('keydown', keyboard);
    }, []);
    const textField = (key: string, label: string, max: number, multiline = false) => <Field label={label}>{multiline ? <Textarea value={String(copy[key] || '')} onChange={event => setCopy(key, event.target.value)} maxLength={max} rows={key === 'headline' ? 3 : 2} /> : <Input value={String(copy[key] || '')} onChange={event => setCopy(key, event.target.value)} maxLength={max} />}</Field>;
    const renderTool = () => {
        if (!post) return null;
        if (tool === 'crop') return <div className={s.fields}>
            <p className={s.muted}>Move the focal point and zoom the image. The news layout stays locked.</p>
            {(['zoom', 'focalX', 'focalY'] as const).map(key => <Field key={key} label={key === 'zoom' ? `Scale · ${post.media.zoom.toFixed(2)}×` : `${key === 'focalX' ? 'Horizontal' : 'Vertical'} position · ${Math.round(post.media[key] * 100)}%`}><Slider className={s.slider} thumbLabel={key === 'zoom' ? 'Image scale' : key === 'focalX' ? 'Horizontal focal point' : 'Vertical focal point'} min={key === 'zoom' ? 1 : 0} max={key === 'zoom' ? 2.5 : 1} step={0.01} value={[post.media[key]]} disabled={!picture || locked || !can('edit')} onValueChange={([value]) => patch({ media: { ...post.media, [key]: cropValue(key, value) } })} /></Field>)}
            <StudioButton variant="outline" className={s.button} onClick={() => patch({ media: { ...post.media, focalX: .5, focalY: .5, zoom: 1 } })}>Reset crop</StudioButton>
        </div>;
        if (tool === 'text') return <div className={s.fields}>
            <Field label="Draft name"><Input value={post.title} maxLength={160} onChange={event => patch({ title: event.target.value })} /></Field>
            <Field label="Artwork language"><StudioSelect label="Artwork language" value={post.outputLanguage} disabled={locked || !can('edit')} onValueChange={value => { patch({ outputLanguage: value as StudioPost['outputLanguage'] }); setSuggestion(null); }} options={[{ value: 'ne', label: 'नेपाली' }, { value: 'en', label: 'English' }]} /><small>Each language keeps its own copy.</small></Field>
            {textField('headline', 'Headline', 180, true)}{textField('deck', 'Supporting text', 2000, true)}
            <div className={s.split}>{textField('category', 'Category', 48)}{textField('eyebrow', 'Eyebrow', 72)}</div>
            {post.templateId === 'quote' && <>{textField('quoteSpeaker', 'Speaker', 120)}{textField('quoteContext', 'Speaker context', 180)}</>}
            {post.templateId === 'data' && <>{textField('statisticValue', 'Data value', 48)}{textField('statisticLabel', 'Data label', 120)}{textField('statisticAsOf', 'As of', 80)}</>}
        </div>;
        if (tool === 'templates') return <div className={s.fields}>{Object.entries(templateNames).map(([id, name]) => <StudioButton variant={post.templateId === id ? "default" : "outline"} className={`${s.button} ${post.templateId === id ? s.primary : ''}`} key={id} aria-pressed={post.templateId === id} onClick={() => patch({ templateId: id as StudioPost['templateId'] })}><PanelsTopLeft aria-hidden="true" />{name}</StudioButton>)}<p className={s.muted}>Changing the template keeps both languages and captions. Brand elements and safe areas are locked.</p></div>;
        if (tool === 'media') return <div className={s.fields}>
            <div className={s.mediaGrid}>{assets.map(item => <StudioButton key={item._id} aria-label={`Use image ${item.originalFilename || item.credit || item._id}`} aria-pressed={mediaId === item._id} onClick={() => edit(current => ({ ...current, media: { ...current.media, mediaId: item, credit: item.credit || '', rightsStatus: item.rightsStatus || 'unknown', focalX: .5, focalY: .5, zoom: 1 }, copy: { ...current.copy, [current.outputLanguage]: { ...current.copy[current.outputLanguage], altText: item.altText?.[current.outputLanguage] || '' } } }))}><img src={item.secureUrl} alt={item.altText?.[post.outputLanguage] || item.originalFilename || 'Library image'} loading="lazy" /></StudioButton>)}</div>
            {!assets.length && <p className={s.muted}>No images in the library yet. Upload one below.</p>}
            <Field label="Upload image"><Input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={event => { void upload(event.target.files?.[0]); event.target.value = ''; }} /><small>Uploaded images are stored in your shared library.</small></Field>
            <Field label="Photo credit"><Input value={post.media.credit} maxLength={200} onChange={event => patch({ media: { ...post.media, credit: event.target.value } })} /></Field>
            <Field label="Image rights"><StudioSelect label="Image rights" value={post.media.rightsStatus} disabled={locked || !can('edit')} onValueChange={value => patch({ media: { ...post.media, rightsStatus: value } })} options={['unknown', 'owned', 'licensed', 'permission_granted', 'public_domain'].map(value => ({ value, label: value.replaceAll('_', ' ') }))} /></Field>
            {textField('altText', 'Alt text', 500, true)}
        </div>;
        if (tool === 'captions') return <div className={s.fields}>
            {textField('captionInstagram', 'Instagram caption', 2200, true)}{textField('captionFacebook', 'Facebook caption', 5000, true)}
            <Field label="Hashtags"><Input value={Array.isArray(copy.hashtags) ? copy.hashtags.join(' ') : ''} onChange={event => setCopy('hashtags', event.target.value.split(/\s+/).filter(Boolean).slice(0, 20))} /></Field>
            {textField('linkText', 'Artwork link text', 120)}{textField('altText', 'Alt text', 500, true)}
            <StudioButton variant="outline" className={s.button} onClick={() => void run('copy', async () => { await navigator.clipboard.writeText([copy.captionInstagram || '', Array.isArray(copy.hashtags) ? copy.hashtags.join(' ') : ''].filter(Boolean).join('\n\n')); })}>Copy Instagram caption</StudioButton>
        </div>;
        return <div className={s.fields}>
            <div className={s.row}><ClipboardCheck size={18} aria-hidden="true" /><Badge variant="outline" className={s.statusBadge}>{dirty ? 'Unsaved changes' : statusLabel[post.status]}</Badge><span className={s.muted}>r{post.revision}</span></div>
            <Field label="Assigned editor"><StudioSelect label="Assigned editor" disabled={locked || !can('edit')} value={idOf(post.reviewerId) || 'unassigned'} onValueChange={value => patch({ reviewerId: value === 'unassigned' ? null : value })} options={[{ value: 'unassigned', label: 'Choose an editor' }, ...reviewers.filter(item => item._id !== idOf(post.ownerId)).map(item => ({ value: item._id, label: item.name || item.username || 'Editor' }))]} /></Field>
            <p className={s.sectionLabel}>Sources · {post.sources.length}/12</p>
            {post.sources.map((source, index) => <div className={s.source} key={source.url}><small>{source.trusted ? 'Trusted feed' : source.verifiedAt ? 'Verified by editor' : 'Verification pending'}</small><a href={source.url} target="_blank" rel="noreferrer">{source.title || source.url}</a>{source.publisher && <p className={s.muted}>{source.publisher}</p>}{source.excerpt && <p className={s.muted}>{source.excerpt}</p>}
                {can('edit') && <StudioButton className={s.textButton} onClick={() => patch({ sources: post.sources.filter((_, item) => item !== index), verification: { claimsConfirmed: false, sourcesConfirmed: false } })}>Remove source</StudioButton>}
                {!source.trusted && !source.verifiedAt && assignedReviewer && post.status === 'in_review' && <StudioButton variant="outline" className={s.button} onClick={() => void action('verify_source', index)}>Verify this source</StudioButton>}
            </div>)}
            {can('edit') && <>
                {inbox.length > 0 && <Field label="Trusted source inbox"><StudioSelect label="Trusted source inbox" value="" placeholder="Attach a feed story…" disabled={locked} onValueChange={value => { const source = inbox.find(item => item.url === value); if (source) attach(source); }} options={inbox.filter(item => !post.sources.some(source => source.url === item.url)).map(item => ({ value: item.url, label: item.title || item.url }))} /></Field>}
                <Field label="Add source link"><Input type="url" placeholder="https://…" value={sourceUrl} onChange={event => setSourceUrl(event.target.value)} /></Field>
                <Field label="Source excerpt"><Textarea placeholder="Paste the relevant reporting for AI grounding" value={sourceExcerpt} onChange={event => setSourceExcerpt(event.target.value)} maxLength={5000} rows={2} /></Field>
                <StudioButton variant="outline" className={s.button} disabled={!sourceUrl} onClick={() => attach({ url: sourceUrl, excerpt: sourceExcerpt })}><Plus />Attach source</StudioButton>
                <p className={s.sectionLabel}>AI assistant</p><Field label="Story brief"><Textarea value={brief} onChange={event => setBrief(event.target.value)} maxLength={2000} rows={2} /></Field>
                <div className={s.split}><StudioButton variant="outline" className={s.button} disabled={!post.sources.length} onClick={() => void generate('draft')}><Sparkles />Draft copy</StudioButton><StudioButton variant="outline" className={s.button} disabled={!post.sources.length} onClick={() => void generate('translate')}>Translate</StudioButton></div>
                {suggestion && <div className={s.suggestion}><strong>{String(suggestion.headline || '')}</strong><p>{String(suggestion.deck || '')}</p><small className={s.muted}>Suggested claims reference sources: {suggestion.claimSourceIndexes?.map(index => post.sources[index]?.title || `Source ${index + 1}`).join(', ') || 'No references returned — check every claim.'}</small><StudioButton className={s.textButton} onClick={() => { edit(current => applySuggestion(current, suggestion)); setSuggestion(null); }}>Apply to {post.outputLanguage === 'ne' ? 'Nepali' : 'English'} copy</StudioButton></div>}
                <Label className={s.check}><Checkbox checked={post.verification.claimsConfirmed} disabled={locked} onCheckedChange={value => patch({ verification: { ...post.verification, claimsConfirmed: value === true } })} />I confirmed the claims against the sources.</Label>
                <Label className={s.check}><Checkbox checked={post.verification.sourcesConfirmed} disabled={locked} onCheckedChange={value => patch({ verification: { ...post.verification, sourcesConfirmed: value === true } })} />I checked the sources and attribution.</Label>
                <Field label="Internal notes"><Textarea value={post.internalNotes || ''} onChange={event => patch({ internalNotes: event.target.value })} maxLength={4000} rows={2} /></Field>
            </>}
            <p className={s.sectionLabel}>Preflight</p>{preflight.length ? <ul className={s.issues}>{preflight.map(issue => <li key={issue}>{issue}</li>)}</ul> : <p className={s.ready}>Ready to render</p>}
            {can('edit') && <StudioButton variant="outline" className={s.button} disabled={preflight.length > 0} onClick={() => void action('render')}>{artifact ? 'Render is up to date' : 'Render current revision'}</StudioButton>}
            {can('submit') && (dirty || post.status === 'draft' || post.status === 'changes_requested') && <StudioButton variant="default" className={`${s.button} ${s.primary}`} disabled={check(post, false).length > 0 || !idOf(post.reviewerId)} onClick={() => void action('submit')}>Submit to editor</StudioButton>}
            {assignedReviewer && !dirty && post.status === 'in_review' && <><StudioButton variant="default" className={`${s.button} ${s.primary}`} disabled={!artifactReady || preflight.length > 0} onClick={() => void action('approve')}>Approve this render</StudioButton><StudioButton variant="outline" className={s.button} onClick={() => void action('request_changes')}>Request changes</StudioButton></>}
            {artifact && <p className={s.muted}>Showing the stored PNG for revision {artifact.revision}. Approval and export use this exact file.</p>}
            {post.status === 'approved' && !dirty && can('export') && <StudioButton variant="default" className={`${s.button} ${s.primary}`} disabled={!artifactReady} onClick={() => void download()}><Download />Download PNG</StudioButton>}
        </div>;
    };
    const [width, height] = socialPostDimensions[post?.format || 'portrait'];
    const scale = Math.min(canvasSize.width / width, canvasSize.height / height);
    const shownTool = fullPreview ? null : tool;
    const activeTool = tools.find(item => item.id === shownTool);
    const InspectorIcon = activeTool?.icon;
    const saveStatus = offline ? 'Offline · changes stay in this session' : busy === 'save' ? 'Saving…' : dirty ? 'Save changes' : post ? `${artifact ? 'Rendered PNG' : 'Saved'} · r${post.revision}` : 'Social Studio';
    return <TooltipProvider delayDuration={350}><Dialog open={library} onOpenChange={setLibrary}><div className={`${s.theme} ${s.app}`} aria-label="The Leaders Social Studio" data-testid="studio-app">
        <header className={s.header}>
            <div className={s.headerLeft}><IconButton label="Save and close studio" onClick={() => void exit()} disabled={locked}><ArrowLeft aria-hidden="true" /></IconButton><DialogTrigger asChild><StudioButton variant="ghost" size="icon" className={s.iconButton} aria-label="Open drafts" title="Open drafts" disabled={locked}><FolderOpen aria-hidden="true" /></StudioButton></DialogTrigger><div className={s.brand}><b />The Leaders<span>Social Studio</span></div></div>
            <div className={s.history}><IconButton label="Undo" disabled={!history.past.length || locked} onClick={() => undo()}><Undo2 /></IconButton><IconButton label="Redo" disabled={!history.future.length || locked} onClick={() => undo(true)}><Redo2 /></IconButton></div>
            <div className={s.headerRight}>{dirty && <StudioButton variant="outline" className={s.secondary} disabled={locked} onClick={() => void run('save', async () => { await save(); })}>Save changes</StudioButton>}<StudioSelect className={s.format} label="Artwork format" value={post?.format || 'portrait'} disabled={!post || !can('edit') || locked} onValueChange={value => patch({ format: value as StudioPost['format'] })} options={[{ value: 'square', label: '1:1 · Square', detail: '1080 × 1080' }, { value: 'portrait', label: '4:5 · Portrait', detail: '1080 × 1350' }, { value: 'story', label: '9:16 · Story', detail: '1080 × 1920' }]} /><StudioButton variant="default" className={s.export} disabled={!post || locked || (post.status === 'approved' && !dirty && !artifactReady)} onClick={() => { setFullPreview(false); if (post?.status === 'approved' && !dirty && artifactReady && can('export')) void download(); else setTool('review'); }}>{busy ? <Loader2 size={19} className={s.spinner} aria-label="Working" /> : <><ArrowUpFromLine aria-hidden="true" /><span>Export</span></>}</StudioButton></div>
        </header>
        <div className={s.workspace} data-panel={Boolean(shownTool)}>
            <nav className={s.dock} aria-label="Studio tools">{tools.map(item => <StudioButton className={s.tool} key={item.id} aria-label={item.label} title={item.label} aria-pressed={shownTool === item.id} disabled={!post || locked} onClick={() => { setFullPreview(false); setTool(tool === item.id ? null : item.id); }}><item.icon aria-hidden="true" /><span>{item.label}</span></StudioButton>)}</nav>
            <main className={s.stage} data-focus={fullPreview}>
                <div className={s.stageTitle}>{post && <><strong>{post.title}</strong><span>{width} × {height} · {post.outputLanguage === 'ne' ? 'नेपाली' : 'English'}</span></>}</div>
                <div className={s.canvas} ref={canvasRef}>{loading ? <Loader2 className={s.spinner} aria-label="Loading studio" /> : post ? <div className={s.artboard} style={{ width: width * scale, height: height * scale }}>
                    {artifact ? <img key={`${artifact.url}:${artifact.revision}`} src={artifact.url} alt={`Rendered approval preview, revision ${artifact.revision}`} onLoad={event => { if (event.currentTarget.naturalWidth !== width || event.currentTarget.naturalHeight !== height) { setReadyArtifact(''); setError('The stored render has incorrect dimensions. Render it again before approval.'); } else setReadyArtifact(`${post._id}:${artifact.url}:${artifact.revision}:${artifact.locale}:${artifact.format}`); }} onError={() => { setReadyArtifact(''); setError('The stored artwork could not load. Retry before approving or exporting.'); }} /> : <div style={{ width: '100%', height: '100%' }} role="img" aria-label="Live social artwork preview" dangerouslySetInnerHTML={{ __html: svg }} />}
                    {shownTool === 'crop' && !artifact && <div className={s.cropGuides} />}
                </div> : <div className={s.empty}><PanelsTopLeft aria-hidden="true" /><h1>Your next story starts here.</h1><p>Create a post, add your sources, and shape the artwork.</p>{can('create') && <StudioButton variant="default" className={`${s.button} ${s.primary}`} disabled={locked} onClick={() => void create()}><Plus size={16} />New post</StudioButton>}{error && <StudioButton variant="outline" className={s.button} onClick={() => void load()}>Retry loading studio</StudioButton>}</div>}</div>
                <div className={s.controls}><IconButton label={fullPreview ? 'Exit focus view' : 'Focus artwork'} onClick={() => setFullPreview(value => !value)}>{fullPreview ? <Shrink aria-hidden="true" /> : <Expand aria-hidden="true" />}</IconButton>{dirty ? <StudioButton className={s.saveState} data-dirty="true" aria-label="Save draft" disabled={locked} onClick={() => void run('save', async () => { await save(); })}>{saveStatus}</StudioButton> : <span className={s.saveState} role="status">{saveStatus}</span>}<div className={s.mobileHistory}><IconButton label="Undo mobile" disabled={!history.past.length || locked} onClick={() => undo()}><Undo2 /></IconButton><IconButton label="Redo mobile" disabled={!history.future.length || locked} onClick={() => undo(true)}><Redo2 /></IconButton></div></div>
                <div className={s.strip}>{post && <><StudioButton className={s.layer} aria-pressed={shownTool === 'media'} onClick={() => { setFullPreview(false); setTool('media'); }}>{picture ? <img src={picture} alt="" /> : <Images aria-hidden="true" />}<span>Photo<small>{picture ? 'Library image' : 'Choose an image'}</small></span></StudioButton><StudioButton className={s.layer} aria-pressed={shownTool === 'text'} onClick={() => { setFullPreview(false); setTool('text'); }}><TextCursorInput aria-hidden="true" /><span>Headline<small>{templateNames[post.templateId]}</small></span></StudioButton></>}</div>
            </main>
            {shownTool && post && <aside className={s.inspector} aria-label={`${activeTool?.label} inspector`}><div className={s.panelHeader}><h2>{InspectorIcon && <InspectorIcon aria-hidden="true" />}{activeTool?.label}</h2><IconButton label="Close inspector" onClick={() => setTool(null)}><X aria-hidden="true" /></IconButton></div><ScrollArea className={s.inspectorScroll}><div className={s.panelBody}><fieldset disabled={locked || (shownTool !== 'review' && !can('edit'))} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>{renderTool()}</fieldset></div></ScrollArea></aside>}
        </div>
        {error && <div className={s.error} role="alert"><span>{error}</span><StudioButton onClick={() => void load()} disabled={locked}>Retry</StudioButton><StudioButton onClick={() => setError('')} aria-label="Dismiss error">Dismiss</StudioButton></div>}
        <DialogContent className={`${s.theme} ${s.library}`} showCloseButton={false} overlayClassName={s.overlay} onOpenAutoFocus={event => { event.preventDefault(); draftSearchRef.current?.focus(); }}><div className={s.panelHeader}><DialogTitle><FolderOpen aria-hidden="true" />Team drafts</DialogTitle><div className={s.row}>{can('create') && <StudioButton variant="default" className={s.button} onClick={() => void create()} disabled={locked}><Plus />New post</StudioButton>}<IconButton label="Close drafts" onClick={() => setLibrary(false)}><X aria-hidden="true" /></IconButton></div></div><DialogDescription className="sr-only">Search your team's saved social posts or create a new post.</DialogDescription><div className={s.librarySearch}><Input ref={draftSearchRef} className={s.search} placeholder="Search drafts…" aria-label="Search drafts" value={search} onChange={event => setSearch(event.target.value)} /></div><ScrollArea className={s.draftsScroll}><div className={s.drafts}>{posts.filter(item => item.title.toLowerCase().includes(search.toLowerCase())).map(item => <StudioButton className={s.draft} key={item._id} onClick={() => void openPost(item._id)} disabled={locked}><div className={s.draftPreview} dangerouslySetInnerHTML={{ __html: artboard(item, assets.find(media => media._id === idOf(item.media?.mediaId))?.secureUrl || '') }} /><span>{item.title}</span><small>{statusLabel[item.status]} · r{item.revision}</small></StudioButton>)}{!posts.filter(item => item.title.toLowerCase().includes(search.toLowerCase())).length && <p className={s.muted}>{posts.length ? 'No matching drafts.' : 'No drafts yet.'}</p>}</div></ScrollArea></DialogContent>
    </div></Dialog></TooltipProvider>;
}

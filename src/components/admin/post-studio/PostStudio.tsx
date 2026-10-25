"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Copy, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useAuth } from '@/components/admin/AuthProvider';
import { createDraft, duplicateDraft, listDrafts, readDraft, readPreviousLocalDesign, setDraftTrashed, updateDraft, type PostDraft } from '@/lib/post-studio/drafts';
import { defaultPostDesign, postTemplates, type PostDesign, type PostTemplate } from '@/lib/post-studio/types';
import PostEditor from './PostEditor';
import DailyEditions from './DailyEditions';
import { Modal } from './Controls';
import styles from './PostStudio.module.css';

export default function PostStudio() {
    const { user } = useAuth();
    const scope = user?.id;
    const router = useRouter(), params = useSearchParams();
    const draftId = params.get('draft');
    const [drafts, setDrafts] = useState<PostDraft[]>([]), [draft, setDraft] = useState<PostDraft | null>(null);
    const [template, setTemplate] = useState<PostTemplate>('breaking');
    const [search, setSearch] = useState(''), [trash, setTrash] = useState(false);
    const [error, setError] = useState(''), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
    const [renaming, setRenaming] = useState<PostDraft | null>(null), [name, setName] = useState('');
    const [previous, setPrevious] = useState<PostDesign | null>(null);
    const lock = useRef(false);
    const permission = (key: string) => user?.role === 'superadmin' || Boolean(user?.permissions?.socialPosts?.[key]);
    const refresh = useCallback(async () => {
        if (!scope) return;
        setDrafts(await listDrafts(scope));
    }, [scope]);
    useEffect(() => {
        if (!scope) return;
        let active = true;
        setLoading(true); setError(''); setDraft(null);
        void (async () => {
            try {
                const records = await listDrafts(scope);
                const opened = draftId ? await readDraft(scope, draftId) : null;
                if (active) { setDrafts(records); setDraft(opened); }
            } catch (failure) { if (active) setError(failure instanceof Error ? failure.message : 'Could not open drafts.'); }
            finally { if (active) setLoading(false); }
        })();
        return () => { active = false; };
    }, [scope, draftId]);
    useEffect(() => {
        try { void readPreviousLocalDesign().then(setPrevious).catch(() => {}); } catch { /* Original legacy data remains untouched. */ }
    }, []);
    const run = async (operation: () => Promise<unknown>) => {
        if (lock.current) return; lock.current = true; setBusy(true); setError('');
        try { await operation(); await refresh(); }
        catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to save changes. Retry.'); }
        finally { lock.current = false; setBusy(false); }
    };
    const open = (item: PostDraft) => router.push(`/admin/social?draft=${encodeURIComponent(item.id)}`);
    if (!scope) return null;
    if (draft && draft.id === draftId && !loading) return <PostEditor key={`${scope}:${draft.id}`} scope={scope} draft={draft} canExport={permission('export')} onClose={() => router.replace('/admin/social')} />;
    const active = drafts.filter(item => !item.trashedAt), discarded = drafts.filter(item => item.trashedAt);
    const visible = (trash ? discarded : active).filter(item => `${item.name} ${item.design.headline}`.toLowerCase().includes(search.toLowerCase().trim()));
    return <div className={styles.studio}><div className={styles.library}>
        <header className={styles.between}><h1>Studio</h1><Link href="/admin" prefetch={false} className={styles.button}>Back to dashboard</Link></header>
        <DailyEditions scope={scope} onOpen={open} canExport={permission('export')} canEdit={permission('edit')} canSubmit={permission('submit')} canApprove={permission('approve')} />
        <div><h2>Your post drafts</h2><p className={styles.subtle}>Design, save and export. Drafts stay in this browser for your admin account.</p></div>
        <div className={styles.templates}>{postTemplates.map(item => <button className={`${styles.choice} ${template === item.key ? styles.active : ''}`} key={item.key} aria-pressed={template === item.key} onClick={() => setTemplate(item.key)}>{item.title}<small>{item.subtitle}</small></button>)}</div>
        <button className={styles.primary} disabled={busy || loading || Boolean(error)} onClick={() => { void run(async () => { const selected = postTemplates.find(item => item.key === template)!; open(await createDraft(scope, `Untitled ${selected.title.toLowerCase()}`, { ...defaultPostDesign, ...selected.patch, template })); }); }}><Plus />New post</button>
        {previous && <button className={styles.button} disabled={busy || loading} onClick={() => { void run(async () => { open(await createDraft(scope, 'Previous local design', previous)); }); }}>Import previous local design</button>}
        <div className={styles.row}><button className={`${styles.button} ${!trash ? styles.active : ''}`} onClick={() => setTrash(false)}>Drafts · {active.length}</button><button className={`${styles.button} ${trash ? styles.active : ''}`} onClick={() => setTrash(true)}>Trash · {discarded.length}</button></div>
        <input className={styles.input} aria-label="Search drafts" placeholder="Search drafts" value={search} onChange={event => setSearch(event.target.value)} />
        {loading && <p role="status">Loading drafts…</p>}
        {error && <div role="alert" className={styles.error}>{error}<div className={styles.row}><button className={styles.button} onClick={() => { void run(refresh); }}>Retry</button>{draftId && <button className={styles.button} onClick={() => router.replace('/admin/social')}>Return to drafts</button>}</div></div>}
        {!loading && !error && !visible.length && <p className={styles.subtle}>{search ? 'No matching drafts.' : trash ? 'Trash is empty. Removed drafts can be restored here.' : 'Create your first post using a template above.'}</p>}
        {visible.map(item => <article key={item.id} className={styles.draft}>
            <button className={styles.draftOpen} disabled={trash || busy} aria-label={`Open ${item.name}`} onClick={() => open(item)}><div className={styles.thumb}>{item.design.imageUri ? <img src={item.design.imageUri} alt="" /> : <Pencil size={20} color={item.design.accent} />}</div><div className={styles.grow}><div className={styles.draftName}>{item.name}</div><div className={`${styles.draftHeadline} ${styles.subtle}`}>{item.design.headline}</div><small className={styles.subtle}>{item.design.format} · {new Date(item.updatedAt).toLocaleDateString('en-GB')}</small></div></button>
            <div className={styles.row}>{trash ? <button className={styles.button} disabled={busy} onClick={() => { void run(() => setDraftTrashed(scope, item.id, false)); }}><RotateCcw />Restore</button> : <><button className={styles.button} disabled={busy} aria-label={`Rename ${item.name}`} onClick={() => { setRenaming(item); setName(item.name); }}><Pencil />Rename</button><button className={styles.button} disabled={busy} aria-label={`Duplicate ${item.name}`} onClick={() => { void run(() => duplicateDraft(scope, item.id)); }}><Copy />Duplicate</button><button className={styles.iconButton} disabled={busy} aria-label={`Move ${item.name} to Trash`} onClick={() => { void run(() => setDraftTrashed(scope, item.id, true)); }}><Trash2 /></button></>}</div>
        </article>)}
        <p className={styles.storageNote}>Drafts are local to this browser, not cloud-synced. Use your own browser profile on shared computers.</p>
        {renaming && <Modal labelledBy="rename-title" blocked={busy} onClose={() => setRenaming(null)}><form className={styles.field} onSubmit={event => { event.preventDefault(); void run(async () => { await updateDraft(scope, renaming.id, { name: name.trim() }); setRenaming(null); }); }}><h2 id="rename-title">Rename draft</h2><label className={styles.field}><span>Draft name</span><input className={styles.input} autoFocus maxLength={100} required value={name} onChange={event => setName(event.target.value)} /></label><button className={styles.primary} disabled={busy || !name.trim()}>Save name</button><button type="button" className={styles.button} disabled={busy} onClick={() => setRenaming(null)}>Cancel</button></form></Modal>}
    </div></div>;
}

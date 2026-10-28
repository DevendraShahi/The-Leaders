"use client";

import { StudioDisclosure } from './StudioDisclosure';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Copy, Pencil, Plus, RotateCcw, Trash2, Trophy, Landmark, ArrowUpRight, ImagePlus, Newspaper, Search, FolderOpen } from 'lucide-react';
import { useAuth } from '@/components/admin/AuthProvider';
import { createDraft, duplicateDraft, listDrafts, readDraft, readPreviousLocalDesign, setDraftTrashed, updateDraft, type PostDraft } from '@/lib/post-studio/drafts';
import { defaultPostDesign, postTemplates, type PostDesign, type PostTemplate } from '@/lib/post-studio/types';
import PostEditor from './PostEditor';
import { createNewsDesign, newsStyles, isFactStyle, type NewsStyle } from '@/lib/post-studio/news-design';
import DailyEditions from './DailyEditions';
import StudioBackup from './StudioBackup';
import BookReviewModal from './BookReviewModal';
import PromptCreationModal from './PromptCreationModal';
import { Modal } from './Controls';
import styles from './PostStudio.module.css';
import home from './StudioHome.module.css';

const desks = [
    { title: 'News desk', description: 'Daily headlines, reports and perspectives.', href: '/admin/social/news', icon: Newspaper, label: '01 / REPORT' },
    { title: 'Cricket desk', description: 'Fixtures, match moments and coverage packs.', href: '/admin/social/cricket', icon: Trophy, label: '02 / SPORT' },
    { title: 'Today in History', description: 'Stories from the past, told page by page.', href: '/admin/social/history', icon: Landmark, label: '03 / ARCHIVE' },
    { title: 'Photo & video', description: 'Brand your photographs and footage.', href: '/admin/social/overlays', icon: ImagePlus, label: '04 / MEDIA' },
];

export default function PostStudio() {
    const { user } = useAuth();
    const scope = user?.id;
    const router = useRouter(), params = useSearchParams();
    const draftId = params.get('draft');
    const [drafts, setDrafts] = useState<PostDraft[]>([]), [draft, setDraft] = useState<PostDraft | null>(null);
    const [template, setTemplate] = useState<PostTemplate>('breaking');
    const [sort, setSort] = useState('newest');
    const [search, setSearch] = useState(''), [trash, setTrash] = useState(false);
    const [error, setError] = useState(''), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
    const [renaming, setRenaming] = useState<PostDraft | null>(null), [name, setName] = useState('');
    const [previous, setPrevious] = useState<PostDesign | null>(null);
    const [bookModalOpen, setBookModalOpen] = useState(false);
    const [promptModalOpen, setPromptModalOpen] = useState(false);
    const [factPrompt, setFactPrompt] = useState<NewsStyle | null>(null);
    const lock = useRef(false);
    // Allow all accounts (superadmin, editors, and admins) to export social posts
    const permission = (key: string) => key === 'export' || user?.role === 'superadmin' || Boolean(user?.permissions?.socialPosts?.[key]);
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
    if (draft && draft.id === draftId && !loading) return <PostEditor key={`${scope}:${draft.id}`} scope={scope} draft={draft} canExport={true} onPreviewDraft={item => { const next = new URLSearchParams({ draft: item.id }); const origin = params.get('from'); if (origin && ['cricket', 'history', 'news'].includes(origin)) next.set('from', origin); router.push(`/admin/social/preview?${next.toString()}`); }} onClose={() => router.replace(params.get('from') === 'cricket' ? '/admin/social/cricket' : params.get('from') === 'history' ? '/admin/social/history' : params.get('from') === 'news' ? '/admin/social/news' : '/admin/social')} />;
    const active = drafts.filter(item => !item.trashedAt), discarded = drafts.filter(item => item.trashedAt);
    const visible = (trash ? discarded : active).filter(item => `${item.name} ${item.design.headline}`.toLowerCase().includes(search.toLowerCase().trim())).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'oldest' ? Date.parse(a.updatedAt) - Date.parse(b.updatedAt) : Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    return <div className={`${styles.studio} ${home.home}`}><main className={home.workspace}>
        <header className={home.header}>
            <div><p className={home.eyebrow}>THE LEADERS / CREATIVE WORKSPACE</p><h1>Make a story worth sharing.</h1><p className={home.intro}>Your stories, your templates, your next great post.</p></div>
            <div className={home.headerActions}><Link href="/admin" prefetch={false} className={home.back}>Dashboard <ArrowUpRight size={14} /></Link><button className={styles.primary} disabled={busy || loading} onClick={() => setPromptModalOpen(true)}><Plus size={18} />New post</button></div>
        </header>
        <nav className={home.nav} aria-label="Studio sections"><a href="#create">Create a post</a><a href="#drafts">Your drafts <span>{active.length}</span></a><a href="#editions">Daily editions</a><a href="/studio/template-guide/index.html" target="_blank" rel="noopener noreferrer" className={home.guide}>Field guide <ArrowUpRight size={13} /></a></nav>
        <section id="create" className={home.section} aria-labelledby="create-title">
            <div className={home.sectionHeading}><div><p className={home.eyebrow}>START SOMETHING NEW</p><h2 id="create-title">Choose your desk</h2></div><span className={home.hint}>A format for every story.</span></div>
            <div className={home.desks}>{desks.map(({ title, description, href, icon: Icon, label }) => <Link href={href} prefetch={false} key={href} className={home.desk}><div className={home.deskTop}><Icon size={22} strokeWidth={1.5} /><ArrowUpRight size={17} /></div><small>{label}</small><h3>{title}</h3><p>{description}</p></Link>)}</div>
            <div className={home.features}>
                {newsStyles.filter(item => isFactStyle(item.id)).map(item => <article key={item.id} className={home.feature}>
                    <div className={home.paper} aria-hidden="true"><span>THE LEADERS / KNOWLEDGE</span><strong>{item.title}</strong><i /><i /><i /><b>{item.id === 'do-you-know' ? '?' : 'Aa'}</b></div>
                    <div className={home.featureBody}><p className={home.eyebrow}>FACTS &amp; CURIOSITY</p><h3>{item.title}</h3><p>{item.id === 'do-you-know' ? 'Ask a good question. Share a clear answer.' : 'Give a remarkable fact the space it deserves.'}</p><div className={home.featureActions}><button className={styles.button} disabled={busy || loading} aria-label={`Create ${item.title}`} onClick={() => { void run(async () => open(await createDraft(scope, `Untitled ${item.title}`, createNewsDesign(item.id)))); }}>Create post <ArrowUpRight size={14} /></button><button className={home.textButton} disabled={busy || loading} onClick={() => setFactPrompt(item.id)} aria-label={`AI prompt · ${item.title}`}>AI prompt</button></div></div>
                </article>)}
                <article className={`${home.feature} ${home.book}`}><div className={home.bookArt} aria-hidden="true"><BookOpen size={44} strokeWidth={1} /><span>THE READING ROOM</span></div><div className={home.featureBody}><p className={home.eyebrow}>BOOKS &amp; IDEAS</p><h3>From the bookshelf</h3><p>Reviews, key takeaways and a verdict worth reading.</p><div className={home.featureActions}><button className={styles.button} disabled={busy || loading} onClick={() => setBookModalOpen(true)}>New book review <ArrowUpRight size={14} /></button></div></div></article>
            </div>
        </section>
        <section id="drafts" className={home.section} aria-labelledby="drafts-title">
        <div className={home.sectionHeading}><div><p className={home.eyebrow}>PICK UP WHERE YOU LEFT OFF</p><h2 id="drafts-title">Your drafts</h2></div><span className={home.hint}>Saved in this browser</span></div>
        <div className={home.draftToolbar}>
        <div className={styles.row}><button className={`${styles.button} ${!trash ? styles.active : ''}`} aria-pressed={!trash} onClick={() => setTrash(false)}>Drafts · {active.length}</button><button className={`${styles.button} ${trash ? styles.active : ''}`} aria-pressed={trash} onClick={() => setTrash(true)}>Trash · {discarded.length}</button></div>
        <label className={home.search}><Search size={16} /><input aria-label="Search drafts" placeholder="Search drafts…" value={search} onChange={event => setSearch(event.target.value)} /></label><select className={home.sort} aria-label="Sort drafts" value={sort} onChange={event => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name A–Z</option></select></div>
        {loading && <p role="status">Loading drafts…</p>}
        {error && <div role="alert" className={styles.error}>{error}<div className={styles.row}><button className={styles.button} onClick={() => { void run(refresh); }}>Retry</button>{draftId && <button className={styles.button} onClick={() => router.replace('/admin/social')}>Return to drafts</button>}</div></div>}
        {!loading && !error && !visible.length && <div className={home.empty}><FolderOpen size={30} strokeWidth={1.2} /><p>{search ? 'No matching drafts.' : trash ? 'Trash is empty. Removed drafts can be restored here.' : 'Your next story starts here. Choose a desk above or create a new post.'}</p>{!search && !trash && <button className={styles.button} onClick={() => setPromptModalOpen(true)}>Create your first post <Plus size={15} /></button>}</div>}
        {visible.map(item => <article key={item.id} className={styles.draft}>
            <button className={styles.draftOpen} disabled={trash || busy} aria-label={`Open ${item.name}`} onClick={() => open(item)}><div className={styles.thumb}>{item.design.imageUri ? <img src={item.design.imageUri} alt="" /> : <Pencil size={20} color={item.design.accent} />}</div><div className={styles.grow}><div className={styles.draftName}>{item.name}</div><div className={`${styles.draftHeadline} ${styles.subtle}`}>{item.design.headline}</div><small className={styles.subtle}>{item.design.format} · {new Date(item.updatedAt).toLocaleDateString('en-GB')}</small></div></button>
            <div className={styles.row}>{trash ? <button className={styles.button} disabled={busy} onClick={() => { void run(() => setDraftTrashed(scope, item.id, false)); }}><RotateCcw />Restore</button> : <><button className={styles.button} disabled={busy} aria-label={`Rename ${item.name}`} onClick={() => { setRenaming(item); setName(item.name); }}><Pencil />Rename</button><button className={styles.button} disabled={busy} aria-label={`Duplicate ${item.name}`} onClick={() => { void run(() => duplicateDraft(scope, item.id)); }}><Copy />Duplicate</button><button className={styles.iconButton} disabled={busy} aria-label={`Move ${item.name} to Trash`} onClick={() => { void run(() => setDraftTrashed(scope, item.id, true)); }}><Trash2 /></button></>}</div>
        </article>)}
        </section>
        <StudioDisclosure title="Blank templates & imports" variant="feature" description="Start from a basic layout or bring in a previous design." icon={<Plus size={18} />}><div className={styles.sectionContent}>
        <p className={styles.subtle}>Start with a blank template when you already have your content.</p>
        <div className={styles.templates}>{postTemplates.filter(item => item.key !== 'cricket').map(item => <button className={`${styles.choice} ${template === item.key ? styles.active : ''}`} key={item.key} aria-pressed={template === item.key} onClick={() => setTemplate(item.key)}>{item.title}<small>{item.subtitle}</small></button>)}</div>
        <div className={styles.row}>
            <button className={styles.button} disabled={busy || loading || Boolean(error)} onClick={() => { void run(async () => { const selected = postTemplates.find(item => item.key === template)!; open(await createDraft(scope, `Untitled ${selected.title.toLowerCase()}`, { ...defaultPostDesign, ...selected.patch, template })); }); }}><Plus />Start blank draft</button>
            <button className={styles.button} style={{ borderColor: 'var(--studio-red)', color: 'var(--studio-red)' }} disabled={busy || loading} onClick={() => setBookModalOpen(true)}><BookOpen size={18} />New book review</button>
        </div>
        {previous && <button className={styles.button} disabled={busy || loading} onClick={() => { void run(async () => { open(await createDraft(scope, 'Previous local design', previous)); }); }}>Import previous local design</button>}
        </div></StudioDisclosure>
        <StudioBackup scope={scope} drafts={drafts} onRestored={refresh} />
        <section id="editions" className={home.section} aria-label="Daily editions"><StudioDisclosure title="Daily social editions" variant="feature" description="Load, review and prepare your daily collection of posts." icon={<BookOpen size={18} />}><div className={styles.sectionContent}><DailyEditions scope={scope} onOpen={open} canExport={true} canEdit={permission('edit')} canSubmit={permission('submit')} canApprove={permission('approve')} /></div></StudioDisclosure></section>
        <p className={styles.storageNote}>Drafts are local to this browser, not cloud-synced. Use your own browser profile on shared computers.</p>
        {renaming && <Modal labelledBy="rename-title" blocked={busy} onClose={() => setRenaming(null)}><form className={styles.field} onSubmit={event => { event.preventDefault(); void run(async () => { await updateDraft(scope, renaming.id, { name: name.trim() }); setRenaming(null); }); }}><h2 id="rename-title">Rename draft</h2><label className={styles.field}><span>Draft name</span><input className={styles.input} autoFocus maxLength={100} required value={name} onChange={event => setName(event.target.value)} /></label><button className={styles.primary} disabled={busy || !name.trim()}>Save name</button><button type="button" className={styles.button} disabled={busy} onClick={() => setRenaming(null)}>Cancel</button></form></Modal>}
        {promptModalOpen && <PromptCreationModal scope={scope} onClose={() => setPromptModalOpen(false)} onOpen={item => { setPromptModalOpen(false); open(item); }} />}
        {factPrompt && <PromptCreationModal scope={scope} initialKind="news" initialOptions={{ newsStyle: factPrompt, template: 'breaking' }} onClose={() => setFactPrompt(null)} onOpen={item => { setFactPrompt(null); open(item); }} />}
        {bookModalOpen && (
            <BookReviewModal
                scope={scope}
                onClose={() => setBookModalOpen(false)}
                onOpenDraft={(item) => {
                    setBookModalOpen(false);
                    open(item);
                }}
            />
        )}
    </main></div>;
}

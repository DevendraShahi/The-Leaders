"use client";
import { useRef, useState } from 'react';
import { backupLimit, prepareDraftRestore, serializeDraftBackup } from '@/lib/post-studio/backup';
import { restoreDraftCopies, type PostDraft } from '@/lib/post-studio/drafts';
import { download } from '@/lib/post-studio/export';
import { StudioDisclosure } from './StudioDisclosure';
import s from './PostStudio.module.css';
export default function StudioBackup({ scope, drafts, onRestored }: { scope: string; drafts: PostDraft[]; onRestored: () => Promise<void> }) {
    const [prepared, setPrepared] = useState<ReturnType<typeof prepareDraftRestore> | null>(null);
    const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState('');
    const [includeTrash, setIncludeTrash] = useState(false), [limit, setLimit] = useState('all');
    const file = useRef<HTMLInputElement>(null), lock = useRef(false);
    const selected = drafts.filter(draft => includeTrash || !draft.trashedAt).slice(0, limit === 'all' ? 500 : Number(limit));
    const run = async (operation: () => Promise<void>) => {
        if (lock.current) return; lock.current = true; setBusy(true); setError(''); setMessage('');
        try { await operation(); } catch (failure) { setError(failure instanceof Error ? failure.message : 'Backup failed.'); }
        finally { lock.current = false; setBusy(false); }
    };
    return <StudioDisclosure title="Back up & restore" variant="feature" description="Take your drafts, images and sources to another browser.">
        <div className={s.sectionContent}>
            <p className={s.subtle}>A portable JSON file includes your artwork, photos, carousel order, sources and review notes. Keep it somewhere private.</p>
            <label className={s.field}><span>Draft selection</span><select className={s.input} disabled={busy} value={limit} onChange={event => setLimit(event.target.value)}><option value="all">Up to 500 most recent drafts</option><option value="20">20 most recent drafts</option><option value="5">5 most recent drafts</option><option value="1">Most recent draft</option></select></label>
            <label><input type="checkbox" disabled={busy} checked={includeTrash} onChange={event => setIncludeTrash(event.target.checked)} /> Include drafts in Trash</label>
            <div className={s.row}><button className={s.button} disabled={busy || !selected.length} onClick={() => void run(async () => { const text = await serializeDraftBackup(selected); download(new TextEncoder().encode(text), `leaders-studio-${new Date().toISOString().slice(0, 10)}.json`, 'application/json'); setMessage(`${selected.length} draft${selected.length === 1 ? '' : 's'} backed up with their images.`); })}>{busy ? 'Working…' : `Download backup · ${selected.length} draft${selected.length === 1 ? '' : 's'}`}</button><button className={s.button} disabled={busy} onClick={() => file.current?.click()}>Choose backup to restore</button></div>
            <input ref={file} type="file" accept=".json,application/json" hidden onChange={event => { const chosen = event.target.files?.[0]; event.target.value = ''; if (!chosen) return; setPrepared(null); void run(async () => { if (chosen.size > backupLimit) throw new Error('Choose a backup smaller than 60 MB.'); setPrepared(prepareDraftRestore(await chosen.text())); }); }} />
            {prepared && <section className={s.edition} aria-label="Backup restore preview"><h3>Restore preview</h3><p>{prepared.active} active draft{prepared.active === 1 ? '' : 's'} · {prepared.trashed} in Trash. Existing drafts stay in place. Imported drafts get new IDs.</p><ul>{prepared.drafts.slice(0, 8).map(draft => <li key={draft.id}>{draft.name}</li>)}</ul>{prepared.drafts.length > 8 && <p>And {prepared.drafts.length - 8} more.</p>}<div className={s.row}><button className={s.primary} disabled={busy} onClick={() => void run(async () => { const count = await restoreDraftCopies(scope, prepared.drafts); await onRestored(); setPrepared(null); setMessage(`${count} draft${count === 1 ? '' : 's'} restored as ${count === 1 ? 'a separate copy' : 'separate copies'}.`); })}>Restore {prepared.drafts.length} draft{prepared.drafts.length === 1 ? ' as a copy' : 's as copies'}</button><button className={s.button} disabled={busy} onClick={() => setPrepared(null)}>Cancel restore</button></div></section>}
            {message && <p role="status">{message}</p>}{error && <p className={s.error} role="alert">{error}</p>}
        </div>
    </StudioDisclosure>;
}

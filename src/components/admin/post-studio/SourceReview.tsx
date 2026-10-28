"use client";
import { useState } from 'react';
import { currentReview, designSources, type EditorialReview } from '@/lib/post-studio/editorial';
import type { PostDesign } from '@/lib/post-studio/types';
import { StudioDisclosure } from './StudioDisclosure';
import s from './PostStudio.module.css';
export default function SourceReview({ design, onChange }: { design: PostDesign; onChange: (design: PostDesign) => void }) {
    const review = currentReview(design), sources = designSources(design);
    const stale = Boolean(design.editorialReview && design.editorialReview.fingerprint !== review.fingerprint);
    const setReview = (value: EditorialReview) => onChange({ ...design, editorialReview: value });
    const patchClaim = (index: number, patch: Partial<EditorialReview['claims'][number]>) => setReview({ ...review, claims: review.claims.map((claim, i) => i === index ? { ...claim, ...patch } : claim) });
    return <StudioDisclosure title="Sources & fact check" description="Review the exact copy against your evidence. This is your editorial assessment." badge={`${review.claims.filter(claim => claim.status === 'verified').length}/${review.claims.length} reviewed`}>
        <div className={s.sectionContent}>
            {stale && <p role="status">The copy or sources changed. Review these sections again.</p>}
            <SourceUrls key={design.sourceUrls?.join('\n') ?? ''} value={design.sourceUrls ?? []} onSave={sourceUrls => onChange({ ...design, sourceUrls })} />
            {sources.map((url, index) => <a className={s.source} key={url} href={url} target="_blank" rel="noopener noreferrer">{index + 1}. {url}</a>)}
            {!review.claims.length && <p>Add your headline and context before reviewing.</p>}
            {review.claims.map((claim, index) => <section className={s.edition} key={`${review.fingerprint}-${index}`} aria-label={`Copy review ${index + 1}`}>
                <strong>Copy section {index + 1}</strong><p>{claim.text}</p>
                <fieldset><legend>Supporting sources</legend>{!sources.length && <p className={s.subtle}>Add a source link or describe your supplied evidence in the note below. A link does not verify the claim automatically.</p>}{sources.map((url, sourceIndex) => <label className={s.row} key={url}><input type="checkbox" checked={claim.sources.includes(url)} onChange={event => patchClaim(index, { sources: event.target.checked ? [...claim.sources, url] : claim.sources.filter(value => value !== url), status: 'needs-checking' })} />Source {sourceIndex + 1}</label>)}</fieldset>
                <label className={s.field}><span>Review status</span><select className={s.input} value={claim.status} onChange={event => patchClaim(index, { status: event.target.value as typeof claim.status })}><option value="needs-checking">Needs checking</option><option value="verified" disabled={!claim.sources.some(url => sources.includes(url)) && claim.note.trim().length < 10}>Verified against source / supplied evidence</option><option value="unsupported">Unsupported</option></select></label>
                <label className={s.field}><span>Evidence / correction note</span><textarea className={s.input} rows={2} maxLength={2000} value={claim.note} onChange={event => patchClaim(index, { note: event.target.value })} placeholder="Which passage supports this? Record a date, qualification or correction." /></label>
            </section>)}
            <label className={s.row}><input type="checkbox" checked={review.languageChecked} onChange={event => setReview({ ...review, languageChecked: event.target.checked })} />I checked language, names, dates and units.</label>
        </div>
    </StudioDisclosure>;
}


function SourceUrls({ value, onSave }: { value: string[]; onSave: (urls: string[]) => void }) {
    const [text, setText] = useState(value.join('\n'));
    return <label className={s.field}><span>Source URLs · one per line</span><textarea className={s.input} rows={3} value={text} onChange={event => { setText(event.target.value); event.currentTarget.setCustomValidity(''); }} onBlur={event => {
        const urls = [...new Set(text.split(/\s+/).filter(Boolean))];
        const valid = urls.length <= 10 && urls.every(url => { try { return ['https:', 'http:'].includes(new URL(url).protocol); } catch { return false; } });
        if (!valid) { event.target.setCustomValidity('Use up to 10 complete HTTP or HTTPS URLs.'); event.target.reportValidity(); return; }
        if (urls.join('\n') !== value.join('\n')) onSave(urls);
    }} /><small>Changes save when you leave this field.</small></label>;
}

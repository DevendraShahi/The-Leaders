"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Copy, FileText, X } from 'lucide-react';
import { cricketTemplates, nplTeam, nplTeams, type CricketTemplateId, type NplTeamId } from '@/lib/post-studio/cricket-catalog';
import { digestCreationResponse, generateCreationPrompt, generateCreationRepairPrompt, type PreparedImport, type PromptOptions } from '@/lib/post-studio/prompt-engine';
import { creationGaps, postLabel, suggestPostTemplates, templateId, updateCreationValue, type CreationGap } from '@/lib/post-studio/creation-workflow';
import { createDraftCollection, postDesignSchema, type PostDraft } from '@/lib/post-studio/drafts';
import { cricketStyles, postOutputDimensions, type CricketStyle } from '@/lib/post-studio/types';
import { Artwork } from './Artwork';
import CreationGapFields from './CreationGapFields';
import { Modal } from './Controls';
import css from './PromptCreationModal.module.css';
import { fixtureLabel } from '@/lib/post-studio/cricket-fixtures';
import { cricketTeamIssues, hasPostTeam, postTeamLabel } from '@/lib/post-studio/cricket-team-context';

type Step = 0 | 1 | 2;
export default function PromptCreationModal({ scope, onClose, onOpen, initialKind = 'cricket', initialOptions }: {
    scope: string; onClose: () => void; onOpen: (draft: PostDraft) => void; initialKind?: PromptOptions['kind'];
    initialOptions?: Partial<Pick<PromptOptions, 'language' | 'format' | 'brief' | 'teams' | 'fixture' | 'cricketStyle'>> & { template?: CricketTemplateId };
}) {
    const [step, setStep] = useState<Step>(0);
    const [settings, setSettings] = useState({ kind: initialKind, language: initialOptions?.language ?? 'en', format: initialOptions?.format ?? 'portrait', brief: initialOptions?.brief ?? '' });
    const [selection, setSelection] = useState(initialOptions?.template ?? (initialKind === 'cricket' ? 'matchday' : 'auto'));
    const [teamId, setTeamId] = useState<NplTeamId | ''>(initialOptions?.teams?.teamId ?? '');
    const [opponentId, setOpponentId] = useState<NplTeamId | ''>(initialOptions?.teams?.opponentId ?? '');
    const [fixture, setFixture] = useState(initialOptions?.fixture);
    const [cricketStyle, setCricketStyle] = useState<CricketStyle>(initialOptions?.cricketStyle ?? 'stadium');
    const [raw, setRaw] = useState(''), [prepared, setPrepared] = useState<PreparedImport | null>(null);
    const [fields, setFields] = useState<CreationGap[]>([]), [page, setPage] = useState(0);
    const [error, setError] = useState(''), [status, setStatus] = useState(''), [busy, setBusy] = useState(false);
    const [fallbackPrompt, setFallbackPrompt] = useState('');
    const [promptCopied, setPromptCopied] = useState(false);
    const lock = useRef(false), importId = useRef(''), contentRef = useRef<HTMLDivElement>(null), headingRef = useRef<HTMLHeadingElement>(null);
    const options: PromptOptions = useMemo(() => ({ ...settings, cricketStyle, templates: selection === 'auto' ? suggestPostTemplates(settings.kind, settings.brief) : [selection], ...(settings.kind === 'cricket' && teamId && opponentId ? { teams: { teamId, opponentId } } : {}), ...(settings.kind === 'cricket' && fixture ? { fixture } : {}) }), [settings, selection, teamId, opponentId, fixture, cricketStyle]);
    const canProceed = settings.kind === 'cricket' ? Boolean(teamId && opponentId && teamId !== opponentId) : Boolean(settings.brief.trim());
    const masterPromptText = useMemo(() => (canProceed ? generateCreationPrompt(options) : ''), [canProceed, options]);
    useEffect(() => { if (contentRef.current) contentRef.current.scrollTop = 0; headingRef.current?.focus(); }, [step]);
    const configure = (patch: Partial<typeof settings>, template = selection) => {
        setSettings(current => ({ ...current, ...patch })); setSelection(template);
        setRaw(''); setPrepared(null); setFields([]); setError(''); setStatus(''); setFallbackPrompt(''); setPromptCopied(false);
    };
    const copyPromptOnly = async (repair = false) => {
        const value = repair ? generateCreationRepairPrompt(options, raw, error) : generateCreationPrompt(options);
        try {
            await navigator.clipboard.writeText(value);
            setPromptCopied(true);
            setFallbackPrompt('');
            setStatus(repair ? 'Repair request copied. Paste it into your AI chat.' : 'Prompt copied to clipboard. Paste it into your AI chat, then bring the response back here.');
            setTimeout(() => setPromptCopied(false), 2500);
        } catch {
            setFallbackPrompt(value);
            setStatus(repair ? 'Copy the repair request below, then ask your AI.' : 'Clipboard blocked. Copy the prompt manually from the preview below.');
        }
    };
    const copy = async (repair = false) => {
        await copyPromptOnly(repair);
    };
    const validate = () => {
        setError(''); setStatus(''); setFallbackPrompt('');
        try {
            const result = digestCreationResponse(raw, options);
            setPrepared(result); setFields(creationGaps(result.designs)); setPage(0);
            importId.current = `prompt-${crypto.randomUUID()}`; setStep(2);
        } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not read response.'); }
    };
    const create = async () => {
        if (!prepared || lock.current) return;
        lock.current = true; setBusy(true); setError('');
        try {
            const id = importId.current;
            const drafts = await createDraftCollection(scope, prepared.designs.map((design, index) => ({
                id: `${id}-${index + 1}`, carouselId: id, carouselOrder: index,
                name: `${prepared.title.slice(0, 75)} · ${index + 1}/${prepared.designs.length}`, design: postDesignSchema.parse(design),
            })));
            onOpen(drafts[0]);
        } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not save drafts. Retry.'); }
        finally { lock.current = false; setBusy(false); }
    };
    const updateField = (field: CreationGap, value: unknown) => {
        if (!prepared) return;
        const next = updateCreationValue(prepared, field.page, field.path, value);
        setPrepared(next);
        setFields(current => [...current, ...creationGaps(next.designs).filter(gap => !current.some(existing => existing.key === gap.key))]);
        setError('');
    };
    const gaps = prepared ? creationGaps(prepared.designs) : [];
    const reviewFields = [...fields, ...gaps.filter(gap => !fields.some(field => field.key === gap.key))].filter(field => {
        const data = prepared?.designs[field.page ?? 0]?.cricket;
        return field.path !== 'cricket.target' || data?.template !== 'score' || data.scoreInnings === 'chase';
    });
    const active = prepared?.designs[page];
    const count = prepared?.designs.length ?? options.templates.length;
    const title = ['What would you like to post?', 'Bring back the response', 'Review your post'][step];
    const sources = prepared ? [...new Set(prepared.designs.flatMap(design => [...(design.sourceUrls ?? []), ...(design.cricket?.sourceUrl ? [design.cricket.sourceUrl] : [])]))] : [];
    const names = active?.cricket ? `${nplTeam(active.cricket.teamId).name} vs ${nplTeam(active.cricket.opponentId).name}` : prepared?.title;
    return <Modal labelledBy="prompt-create-title" blocked={busy} onClose={onClose} dialogClassName={css.dialog} contentClassName={css.shell}>
        <header className={css.header}><div><span className={css.eyebrow}>STUDIO / NEW POST</span><h2 id="prompt-create-title" ref={headingRef} tabIndex={-1}>{title}</h2></div><button className={css.close} aria-label="Close creation" disabled={busy} onClick={onClose}><X size={20} /></button></header>
        <ol className={css.steps} aria-label="Creation steps">{['Request', 'Response', 'Review'].map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} data-complete={step > index}><span>{step > index ? <Check size={13} /> : index + 1}</span>{label}</li>)}</ol>
        <div className={css.content} ref={contentRef}><fieldset className={css.stage} disabled={busy}>
            {step === 0 && <>
                <div className={css.kindSwitch} aria-label="Post category">{(['cricket', 'news'] as const).map(kind => <button key={kind} type="button" aria-pressed={settings.kind === kind} onClick={() => configure({ kind }, kind === 'cricket' ? 'matchday' : 'auto')}>{kind === 'cricket' ? 'Cricket' : 'News & perspectives'}</button>)}</div>
                {settings.kind === 'cricket' && <div className={css.cricketSetup}>
                    {fixture && <p className={css.fixtureSummary}>{fixture.matchDate} · {fixtureLabel(fixture)}<br />{fixture.venue}</p>}
                    <label className={css.field}><span>Post content type</span><select value={selection} onChange={event => configure({}, event.target.value)}>{[...new Set(cricketTemplates.map(item => item.category))].map(category => <optgroup label={category} key={category}>{cricketTemplates.filter(item => item.category === category).map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</optgroup>)}</select></label>
                    <label className={css.field}><span>Featured team</span><select value={teamId} onChange={event => { const next = event.target.value as NplTeamId | ''; setTeamId(next); if (next === opponentId) setOpponentId(teamId); if (fixture && next !== fixture.teamId && next !== fixture.opponentId) setFixture(undefined); configure({}); }}><option value="">Choose team</option>{nplTeams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
                    <label className={css.field}><span>Opponent</span><select value={opponentId} onChange={event => { const next = event.target.value as NplTeamId | ''; setOpponentId(next); if (fixture && next !== fixture.teamId && next !== fixture.opponentId) setFixture(undefined); configure({}); }}><option value="">Choose opponent</option>{nplTeams.filter(team => team.id !== teamId).map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
                </div>}
                <label className={css.field}><span>{settings.kind === 'cricket' ? 'Additional information (optional)' : 'Your request'}</span><textarea rows={settings.kind === 'cricket' ? 3 : 5} maxLength={20000} value={settings.brief} onChange={event => configure({ brief: event.target.value })} placeholder={settings.kind === 'cricket' ? 'Add any confirmed scores, player details or source material you already have.' : 'Describe the story you want to post. Include any confirmed facts, quotes or source material.'} /></label>
                <p className={css.hint}>{settings.kind === 'cricket' ? 'Your post type and teams are included automatically in the prompt.' : 'Write naturally. Include facts you already have. Studio prepares the instructions and required fields for you.'}</p>
                <div className={css.plan}><FileText size={22} /><div><span>We’ll prepare</span><strong>{options.templates.map(postLabel).join(' + ')}</strong><small>{options.templates.length} {options.templates.length === 1 ? 'post' : 'posts'} · {settings.language === 'ne' ? 'नेपाली' : 'English'} · {settings.format}</small></div></div>
                <details className={css.options}><summary>{settings.kind === 'cricket' ? 'Style, language & size' : 'Change post type, language or size'}</summary><div className={css.settings}>
                    {settings.kind === 'cricket' && <label className={css.field}><span>Visual style</span><select value={cricketStyle} onChange={event => { setCricketStyle(event.target.value as CricketStyle); configure({}); }}>{cricketStyles.map(style => <option key={style.id} value={style.id}>{style.label}</option>)}</select></label>}
                    {settings.kind === 'news' && <label className={css.field}><span>Post type</span><select value={selection} onChange={event => configure({}, event.target.value)}><option value="auto">Suggest from my request</option>{['breaking', 'explainer', 'quote'].map(id => <option key={id} value={id}>{postLabel(id)}</option>)}</select></label>}
                    <label className={css.field}><span>Language</span><select value={settings.language} onChange={event => configure({ language: event.target.value as PromptOptions['language'] })}><option value="en">English</option><option value="ne">नेपाली</option></select></label>
                    <label className={css.field}><span>Size</span><select value={settings.format} onChange={event => configure({ format: event.target.value as PromptOptions['format'] })}>{Object.entries(postOutputDimensions).map(([format, size]) => <option key={format} value={format}>{format} · {size.join(' × ')}</option>)}</select></label>
                </div></details>
                {canProceed && masterPromptText && (
                    <div className={css.masterPromptCard}>
                        <div className={css.promptPreviewHeader}>
                            <span className={css.promptPreviewTitle}>
                                PREPARED MASTER PROMPT (READY FOR CLAUDE / CHATGPT / GEMINI):
                            </span>
                            <button
                                type="button"
                                className={css.secondary}
                                style={{ fontSize: 11, padding: '4px 10px', minHeight: 30, borderColor: 'var(--studio-red)', color: 'var(--studio-red)' }}
                                onClick={() => void copyPromptOnly()}
                            >
                                {promptCopied ? <Check size={13} color="var(--studio-green, #10b981)" /> : <Copy size={13} />}
                                {promptCopied ? 'Prompt Copied to Clipboard!' : 'Copy Master Prompt'}
                            </button>
                        </div>
                        <div className={css.promptPreviewArea} tabIndex={0} role="region" aria-label="Generated master prompt preview">
                            {masterPromptText}
                        </div>
                    </div>
                )}
            </>}
            {step === 1 && <>
                <p className={css.intro}>Paste the prompt into your AI chat. If you have an image or photo of the current stats or scorecard, attach it to the chat. When it replies, copy its complete response and paste it below.</p>
                <label className={css.field}><span>AI response</span><textarea rows={10} maxLength={250000} value={raw} onChange={event => { setRaw(event.target.value); setPrepared(null); setError(''); }} placeholder="Paste the response here. Studio will read it and organize the post for you." spellCheck={false} /></label>
                <button className={css.textButton} onClick={() => void copy()}><Copy size={15} />Copy prompt again</button>
            </>}
            {step === 2 && prepared && active && <>
                {count > 1 && <div className={css.pages} aria-label="Posts to review">{prepared.designs.map((design, index) => <button key={index} aria-pressed={index === page} onClick={() => setPage(index)}>{index + 1}. {postLabel(templateId(design))}{gaps.some(gap => gap.page === index) && <span aria-label="Missing details">•</span>}</button>)}</div>}
                <div className={css.review}>
                    <div className={css.previewColumn}><div className={css.preview} style={{ height: 216 * postOutputDimensions[active.format][1] / postOutputDimensions[active.format][0] }}><div><Artwork design={active} /></div></div><small>{active.format} · {postOutputDimensions[active.format].join(' × ')}</small></div>
                    <div className={css.reviewContent}><p className={css.matchName}>{names}</p>
                        {active.cricket && hasPostTeam(active.cricket.template) && <label className={css.field}><span>{postTeamLabel(active.cricket)}</span><select aria-label={postTeamLabel(active.cricket)} value={active.cricket.teamId} onChange={event => updateField({ key: 'post-team', page, path: 'cricket.teamId', label: 'Post team', type: 'select' }, event.target.value)}>{[active.cricket.teamId, active.cricket.opponentId].map(id => <option key={id} value={id}>{nplTeam(id).name}</option>)}</select><small>{active.cricket.template === 'wicket' ? 'This is the dismissed batter’s team. The credited bowler belongs to the other side.' : 'Choose the side whose score or player performance this post describes.'}</small></label>}
                        {active.cricket && cricketTeamIssues(active.cricket).map(issue => <p key={issue} role="alert">{issue}</p>)}
                        {prepared.warnings.length > 0 && <details className={css.options}><summary>Import notes ({prepared.warnings.length})</summary><ul>{prepared.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul></details>}
                        <label className={css.field}><span>Headline</span><textarea rows={2} maxLength={180} value={active.headline} onChange={event => updateField({ key: 'headline', page, path: 'headline', label: 'Headline', type: 'text' }, event.target.value)} /></label>
                        <label className={css.field}><span>Supporting text</span><textarea rows={3} maxLength={700} value={active.summary} onChange={event => updateField({ key: 'summary', page, path: 'summary', label: 'Summary', type: 'text' }, event.target.value)} /></label>
                        <details className={css.options}><summary>{sources.length ? `${sources.length} source ${sources.length === 1 ? 'link' : 'links'}` : 'No source links supplied'}</summary>{sources.length ? <ul>{sources.map(url => <li key={url}><a href={url} target="_blank" rel="noreferrer">{url}</a></li>)}</ul> : <p>Check the facts against your source before exporting.</p>}</details>
                    </div>
                </div>
                {reviewFields.some(field => field.page === null || field.page === page) && <section className={css.missing}><div><h3>{gaps.length ? 'Complete the missing details' : 'Details completed'}</h3><p>Only information missing from the response appears here. Shared match details apply to every post.</p></div><CreationGapFields fields={reviewFields.filter(field => field.path !== 'headline' && (field.page === null || field.page === page))} designs={prepared.designs} onChange={updateField} /></section>}
            </>}
            {status && <p className={css.status} role="status">{status}</p>}
            {fallbackPrompt && <label className={css.field}><span>Copy this prompt</span><textarea aria-label="Generated creation prompt" readOnly rows={5} value={fallbackPrompt} onFocus={event => event.target.select()} autoFocus /></label>}
            {error && <div className={css.error} role="alert"><strong>{step === 1 ? 'The response needs a correction.' : 'Your draft could not be saved.'}</strong><p>{step === 1 ? 'Ask your AI chat to fix its response using the repair request below. Your pasted response is kept here.' : 'Your work is still here. Check the details below and retry.'}</p><details><summary>View details</summary><pre>{error}</pre></details>{step === 1 && <button className={css.secondary} onClick={() => void copy(true)}>Copy repair request</button>}</div>}
        </fieldset></div>
        <footer className={css.footer}>
            <div>{step > 0 ? <button className={css.back} disabled={busy} onClick={() => { setStep((step - 1) as Step); setError(''); setStatus(''); setFallbackPrompt(''); }}><ArrowLeft size={16} />Back</button> : <small>Use with your preferred AI chat.</small>}</div>
            {step === 0 && (
                <div className={css.footerActions}>
                    <button
                        type="button"
                        className={css.secondary}
                        disabled={!canProceed || busy}
                        onClick={() => void copyPromptOnly()}
                    >
                        {promptCopied ? <Check size={15} color="var(--studio-green, #10b981)" /> : <Copy size={15} />}
                        {promptCopied ? 'Copied!' : '1-Click Copy Prompt'}
                    </button>
                    {fallbackPrompt && (
                        <button
                            type="button"
                            className={css.secondary}
                            onClick={() => { setStep(1); setFallbackPrompt(''); }}
                        >
                            I copied it <ArrowRight size={16} />
                        </button>
                    )}
                    <button
                        type="button"
                        className={css.primary}
                        disabled={!canProceed || busy}
                        onClick={() => { setStep(1); setError(''); setStatus(''); setFallbackPrompt(''); }}
                    >
                        Next: Paste AI Output
                        <ArrowRight size={15} />
                    </button>
                </div>
            )}
            {step === 1 && <button className={css.primary} disabled={!raw.trim() || busy} onClick={validate}>Review {count === 1 ? 'post' : 'posts'}<ArrowRight size={16} /></button>}
            {step === 2 && <><small className={css.reviewNote}>{gaps.length ? `${gaps.length} missing ${gaps.length === 1 ? 'detail' : 'details'} · saved as unfinished` : 'Check the facts before continuing.'}</small><button className={css.primary} disabled={busy} onClick={() => void create()}>{busy ? 'Saving…' : gaps.length ? 'Save unfinished draft' : `Create ${count === 1 ? 'post' : `${count} posts`}`}<ArrowRight size={16} /></button></>}
        </footer>
    </Modal>;
}

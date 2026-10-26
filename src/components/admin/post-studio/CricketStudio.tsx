"use client";

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, Layers3, Search, SlidersHorizontal } from 'lucide-react';
import { cricketTemplates, nplTeams, type CricketCategory, type CricketLanguage, type CricketTemplateId, type NplTeamId } from '@/lib/post-studio/cricket-catalog';
import { createCricketDesign, createCricketDraftDesign } from '@/lib/post-studio/cricket-design';
import { createDraftCollection, type PostDraft } from '@/lib/post-studio/drafts';
import { postOutputDimensions, type PostFormat } from '@/lib/post-studio/types';
import { Artwork } from './Artwork';
import css from './CricketStudio.module.css';
import styles from './PostStudio.module.css';

export const cricketPacks: { id: string; title: string; templates: CricketTemplateId[] }[] = [
    { id: 'match', title: 'Match coverage · 10 pages', templates: ['matchday', 'playing-xi', 'toss', 'score', 'four', 'six', 'wicket', 'innings', 'result', 'player-of-match'] },
    { id: 'prematch', title: 'Before the match · 6 pages', templates: ['matchday', 'fixtures', 'head-to-head', 'toss', 'playing-xi', 'team'] },
    { id: 'players', title: 'Player performances · 7 pages', templates: ['fifty', 'century', 'batting', 'bowling', 'five-for', 'hat-trick', 'player-of-match'] },
    { id: 'tournament', title: 'Tournament desk · 5 pages', templates: ['result', 'scorecard', 'points-table', 'qualified', 'champions'] },
];
export default function CricketStudio({ scope, onBack, onOpenDraft }: { scope: string; onBack: () => void; onOpenDraft: (draft: PostDraft) => void }) {
    const [setupExpanded, setSetupExpanded] = useState(false);
    const creationLock = useRef(false), mounted = useRef(true);
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    const [teamId, setTeamId] = useState<NplTeamId>('lumbini'), [opponentId, setOpponentId] = useState<NplTeamId>('sudurpaschim');
    const [language, setLanguage] = useState<CricketLanguage>('en'), [format, setFormat] = useState<PostFormat>('portrait');
    const [category, setCategory] = useState<CricketCategory | 'All'>('All'), [query, setQuery] = useState('');
    const [pack, setPack] = useState('match'), [busy, setBusy] = useState(false), [error, setError] = useState('');
    const gridRef = useRef<HTMLDivElement>(null);
    const [previewSize, setPreviewSize] = useState({ width: 160, height: 200 });
    const visible = cricketTemplates.filter(item => (category === 'All' || item.category === category) && `${item.title} ${item.titleNe} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase()));
    useEffect(() => {
        const node = gridRef.current?.querySelector<HTMLElement>('[data-template-preview]');
        if (!node) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) setPreviewSize({ width, height });
        });
        observer.observe(node);
        return () => observer.disconnect();
    }, [visible.length]);
    const create = async (ids: CricketTemplateId[]) => {
        if (creationLock.current) return; creationLock.current = true; setBusy(true); setError('');
        try {
            const carouselId = `cricket-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
            const saved = await createDraftCollection(scope, ids.map((id, index) => ({
                id: `${carouselId}-${index + 1}`, carouselId, carouselOrder: index,
                name: `${nplTeams.find(item => item.id === teamId)!.short} v ${nplTeams.find(item => item.id === opponentId)!.short} · ${index + 1}/${ids.length} (${cricketTemplates.find(item => item.id === id)!.title})`,
                design: createCricketDraftDesign(id, teamId, opponentId, format, language),
            })));
            if (mounted.current) onOpenDraft(saved[0]);
        } catch (failure) { if (mounted.current) { setError(failure instanceof Error ? failure.message : 'Could not create the cricket drafts.'); setBusy(false); } }
        finally { creationLock.current = false; }
    };
    const featured = nplTeams.find(team => team.id === teamId)!;
    const opponent = nplTeams.find(team => team.id === opponentId)!;
    const categories = ['All', 'Before the match', 'Match moments', 'Player performances', 'Results & tournament'] as const;
    return <div className={`${styles.studio} ${css.cricketPage}`}>
        <header className={css.pageHeader}>
            <button className={css.backLink} onClick={onBack} disabled={busy}>
                <ArrowLeft size={16} />Back to Studio</button>
            <div className={css.pageTitleRow}>
                <div>
                    <span className={css.kitEyebrow}>THE LEADERS / CRICKET DESK</span>
                    <h1>Cricket templates</h1>
                    <p>Choose your teams. Find the moment. Make it yours.</p>
                </div>
                <div className={css.pageSummary}>
                    <strong>28</strong>
                    <span>templates for every<br />part of the match</span>
                </div>
            </div>
        </header>
        <fieldset className={css.pageWorkspace} disabled={busy}>
            <aside className={css.setupPanel} aria-label="Match setup">
                <div className={css.setupHeading}>
                    <div>
                        <span className={css.kitEyebrow}>01 / MATCH SETUP</span>
                        <h2>Your match</h2>
                    </div>
                    <SlidersHorizontal size={18} />
                </div>
                <button className={css.mobileSetupToggle} aria-expanded={setupExpanded} aria-controls="cricket-setup-fields" onClick={() => setSetupExpanded(!setupExpanded)}>
                    <span>
                        <strong>{featured.short} vs {opponent.short}</strong>
                        <small>{format} · {language === 'ne' ? 'नेपाली' : 'English'}</small>
                    </span>
                    <span>{setupExpanded ? 'Hide setup' : 'Edit setup'}<ChevronDown size={16} />
                    </span>
                </button>
                <div id="cricket-setup-fields" className={`${css.setupFields} ${setupExpanded ? css.setupOpen : ''}`}>
                    <label className={css.kitLabel}>
                        <span>Featured team</span>
                        <div className={css.teamSelect}>
                            <img src={`/studio/cricket/${teamId}.png`} alt="" />
                            <select aria-label="Kit featured team" value={teamId} onChange={event => { const id = event.target.value as NplTeamId; setTeamId(id); if (id === opponentId) setOpponentId(teamId); }}>{nplTeams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select>
                        </div>
                    </label>
                    <label className={css.kitLabel}>
                        <span>Opponent</span>
                        <div className={css.teamSelect}>
                            <img src={`/studio/cricket/${opponentId}.png`} alt="" />
                            <select aria-label="Kit opponent" value={opponentId} onChange={event => setOpponentId(event.target.value as NplTeamId)}>{nplTeams.filter(team => team.id !== teamId).map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select>
                        </div>
                    </label>
                    <div className={css.setupDivider} />
                    <label className={css.kitLabel}>
                        <span>Canvas format</span>
                        <select aria-label="Kit format" value={format} onChange={event => setFormat(event.target.value as PostFormat)}>{(Object.keys(postOutputDimensions) as PostFormat[]).map(size => <option key={size} value={size}>{size[0].toUpperCase() + size.slice(1)} · {postOutputDimensions[size].join(' × ')}</option>)}</select>
                    </label>
                    <label className={css.kitLabel}>
                        <span>Language</span>
                        <select aria-label="Kit language" value={language} onChange={event => setLanguage(event.target.value as CricketLanguage)}>
                            <option value="en">English</option>
                            <option value="ne">नेपाली</option>
                        </select>
                    </label>
                    <div className={css.setupDivider} />
                    <div className={css.packHeading}>
                        <Layers3 size={17} />
                        <h3>Start with a carousel</h3>
                    </div>
                    <label className={css.kitLabel}>
                        <span>Coverage pack</span>
                        <select aria-label="Cricket coverage pack" value={pack} onChange={event => setPack(event.target.value)}>{cricketPacks.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
                    </label>
                    <button className={`${styles.primary} ${css.packCreate}`} onClick={() => void create(cricketPacks.find(item => item.id === pack)!.templates)}>
                        <Layers3 size={15} />{busy ? 'Creating…' : 'Create pack'}</button>
                    <p className={css.fieldHint}>Coordinated pages with your selected teams, format and language.</p>
                </div>
            </aside>
            <section className={css.galleryPanel} aria-label="Cricket template library">
                <div className={css.libraryHeading}>
                    <div>
                        <span className={css.kitEyebrow}>02 / PICK A TEMPLATE</span>
                        <h2>Built for the moment.</h2>
                    </div>
                    <label className={css.searchField}>
                        <Search size={16} />
                        <input aria-label="Search cricket templates" placeholder="Search templates…" value={query} onChange={event => setQuery(event.target.value)} />
                    </label>
                </div>
                <div className={css.pageCategories} role="group" aria-label="Cricket template categories">{categories.map(item => <button key={item} aria-label={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}<span aria-hidden="true">{item === 'All' ? cricketTemplates.length : cricketTemplates.filter(template => template.category === item).length}</span>
                </button>)}</div>
                <div className={css.galleryMeta}>
                    <span>{visible.length} {visible.length === 1 ? 'template' : 'templates'}</span>
                    <span>
                        <Check size={12} />{featured.short} vs {opponent.short} · {postOutputDimensions[format].join(' × ')}</span>
                </div>
                {error && <p role="alert" className={styles.error}>{error}</p>}
                <div ref={gridRef} className={css.pageTemplateGrid}>{visible.map(template => {
                    const preview = createCricketDesign(template.id, teamId, opponentId, format, language);
                    const height = 360 * postOutputDimensions[format][1] / postOutputDimensions[format][0];
                    return <article key={template.id} className={css.pageTemplateCard}>
                        <div className={css.templatePreview} aria-hidden="true" data-template-preview>
                            <div className={css.previewCanvas} style={{ width: 360, height, transform: `scale(${Math.min((previewSize.width - 24) / 360, (previewSize.height - 24) / height)})` }}>
                                <Artwork design={preview} />
                            </div>
                        </div>
                        <div className={css.templateDescription}>
                            <h3>{language === 'ne' ? template.titleNe : template.title}</h3>
                            <p>{template.description}</p>
                            <button aria-label={`Create ${template.title}`} onClick={() => void create([template.id])}>{busy ? 'Creating…' : 'Use template'}<ArrowUpRight size={16} />
                            </button>
                        </div>
                    </article>;
                })}</div>
                {!visible.length && <div className={css.emptyGallery}>
                    <Search size={25} />
                    <h3>No matching templates</h3>
                    <p>Try another name or browse all categories.</p>
                    <button className={styles.button} onClick={() => { setQuery(''); setCategory('All'); }}>Show all templates</button>
                </div>}
            </section>
        </fieldset>
    </div>;
}

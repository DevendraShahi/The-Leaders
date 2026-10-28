"use client";

import { StudioDisclosure } from './StudioDisclosure';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, Layers3, Search, SlidersHorizontal } from 'lucide-react';
import { cricketTemplateOptionGroups, cricketTemplates, matchMomentGroups, nplTeams, type CricketCategory, type CricketLanguage, type CricketTemplateId, type MatchMomentGroupId, type NplTeamId } from '@/lib/post-studio/cricket-catalog';
import { createCricketDesign, createCricketDraftDesign } from '@/lib/post-studio/cricket-design';
import { createDraftCollection, type PostDraft } from '@/lib/post-studio/drafts';
import { cricketStyles, postOutputDimensions, type PostFormat, type CricketStyle } from '@/lib/post-studio/types';
import { findPlayers, playerPhotoCredit } from '@/lib/post-studio/cricket-players';
import { lineupProblems } from '@/lib/post-studio/prematch-posts';
import { resolveResponseTeam } from '@/lib/post-studio/cricket-team-context';
import { Artwork } from './Artwork';
import PromptCreationModal from './PromptCreationModal';
import { applyCricketFixture, cricketFixtures, cricketPlayoffs, cricketRestDays, fixtureLabel, fixtureScheduleSource, fixtureTimingSource, fixturesForDate, nepalDate, playoffFixture } from '@/lib/post-studio/cricket-fixtures';
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
    const [promptOpen, setPromptOpen] = useState(false);
    const [contentType, setContentType] = useState<CricketTemplateId>('matchday');
    const [pastedLineup, setPastedLineup] = useState({ context: '', value: '' });
    const [visualStyle, setVisualStyle] = useState<CricketStyle>('stadium');
    const [fixtureDate, setFixtureDate] = useState(() => nepalDate());
    const [fixtureChoice, setFixtureChoice] = useState(() => { const games = fixturesForDate(fixtureDate); return games.length === 1 ? games[0].id : ''; });
    const selectedFixture = cricketFixtures.find(item => item.id === fixtureChoice);
    const dayGames = fixturesForDate(fixtureDate);
    const playoff = cricketPlayoffs.find(item => item.matchDate === fixtureDate);
    const restDay = cricketRestDays.includes(fixtureDate);
    const creationLock = useRef(false), mounted = useRef(true);
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    const [teamId, setTeamId] = useState<NplTeamId>(selectedFixture?.teamId ?? 'lumbini'), [opponentId, setOpponentId] = useState<NplTeamId>(selectedFixture?.opponentId ?? 'sudurpaschim');
    const [timeOverride, setTimeOverride] = useState<string | undefined>();
    const baseFixture = selectedFixture ?? (fixtureChoice === 'custom' ? playoffFixture(fixtureDate, teamId, opponentId) : undefined);
    const fixture = baseFixture ? { ...baseFixture, startTime: timeOverride ?? baseFixture.startTime } : undefined;
    const promptFixture = contentType === 'fixtures' ? fixture ?? dayGames[0] : fixture;
    const [language, setLanguage] = useState<CricketLanguage>('en'), [format, setFormat] = useState<PostFormat>('portrait');
    const [category, setCategory] = useState<CricketCategory | 'All'>('All'), [query, setQuery] = useState('');
    const [momentGroup, setMomentGroup] = useState<MatchMomentGroupId | 'All'>('All');
    const [pack, setPack] = useState('match'), [busy, setBusy] = useState(false), [error, setError] = useState('');
    const lineupContext = `${fixtureDate}:${fixtureChoice}:${teamId}:${opponentId}`;
    const lineupText = pastedLineup.context === lineupContext ? pastedLineup.value : '';
    const lineup = lineupText.split('\n').map(name => name.trim()).filter(Boolean);
    const lineupErrors = lineup.length ? [...lineupProblems(lineup), ...(lineup.some(name => name.length > 90) ? ['Keep each player name under 90 characters.'] : [])] : [];
    const gridRef = useRef<HTMLDivElement>(null);
    const [previewSize, setPreviewSize] = useState({ width: 160, height: 200 });
    const chooseFixture = (id: string) => {
        setFixtureChoice(id);
        setTimeOverride(undefined);
        const match = cricketFixtures.find(item => item.id === id);
        if (match) { setTeamId(match.teamId); setOpponentId(match.opponentId); }
    };
    const chooseDate = (date: string) => {
        setFixtureDate(date);
        const games = fixturesForDate(date);
        chooseFixture(games.length === 1 ? games[0].id : '');
    };
    const visible = cricketTemplates.filter(item => (category === 'All' || item.category === category) && (category !== 'Match moments' || momentGroup === 'All' || matchMomentGroups.find(group => group.id === momentGroup)!.templates.includes(item.id)) && `${item.title} ${item.titleNe} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase()));
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
        if (ids.includes('playing-xi') && lineupErrors.length) { setError(lineupErrors.join(' ')); return; }
        if (creationLock.current) return; creationLock.current = true; setBusy(true); setError('');
        try {
            const carouselId = `cricket-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
            const saved = await createDraftCollection(scope, ids.map((id, index) => ({
                id: `${carouselId}-${index + 1}`, carouselId, carouselOrder: index,
                name: id === 'fixtures' ? `${fixtureDate} · Daily fixtures` : `${nplTeams.find(item => item.id === teamId)!.short} v ${nplTeams.find(item => item.id === opponentId)!.short} · ${index + 1}/${ids.length} (${cricketTemplates.find(item => item.id === id)!.title})`,
                design: (() => {
                    const chosen = fixture ?? (id === 'fixtures' ? dayGames[0] : undefined);
                    const draft = createCricketDraftDesign(id, id === 'fixtures' && chosen ? chosen.teamId : teamId, id === 'fixtures' && chosen ? chosen.opponentId : opponentId, format, language, visualStyle);
                    if (id === 'playing-xi' && lineup.length) {
                        const matched = chosen ? applyCricketFixture(draft, chosen) : draft;
                        const resolved = resolveResponseTeam({ ...matched.cricket!, matchDate: fixtureDate, lineup }).data;
                        const resolvedTeam = nplTeams.find(team => team.id === resolved.teamId)!;
                        return { ...matched, accent: resolvedTeam.primary, backgroundColor: resolvedTeam.dark, cricket: resolved };
                    }
                    if (chosen) return applyCricketFixture(draft, chosen);
                    return id === 'fixtures' ? { ...draft, cricket: { ...draft.cricket!, matchDate: fixtureDate } } : draft;
                })(),
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
                    <h1>Cricket desk</h1>
                    <p>Select the post type and teams. Studio prepares the prompt for you.</p>
                    <a href="/studio/template-guide/index.html" target="_blank" rel="noopener noreferrer" className={css.backLink}>Editor field guide · examples for every template <ArrowUpRight size={14} /></a>
                </div>
            </div>
        </header>
        <section className={css.quickCreate} aria-label="Create a cricket post">
            <div className={css.fixtureFields}>
                <label className={css.kitLabel}><span>Match date · Nepal time</span><input type="date" value={fixtureDate} disabled={busy} onChange={event => chooseDate(event.target.value)} /></label>
                <label className={css.kitLabel}><span>Scheduled game</span><select value={fixtureChoice} disabled={busy} onChange={event => chooseFixture(event.target.value)}><option value="">{dayGames.length ? `Choose game · ${dayGames.length} ${dayGames.length === 1 ? 'match' : 'matches'} on this date` : playoff ? `${playoff.label} · teams to confirm` : restDay ? 'Rest day' : 'No scheduled games on this date'}</option>{dayGames.map((match, index) => <option key={match.id} value={match.id}>{fixtureLabel(match, index)}</option>)}<option value="custom">{playoff ? `Choose confirmed teams · ${playoff.label}` : 'Custom match'}</option></select></label>
            </div>
            <label className={css.kitLabel}><span>Post content type</span><select value={contentType} disabled={busy} onChange={event => setContentType(event.target.value as CricketTemplateId)}>{cricketTemplateOptionGroups.map(group => <optgroup key={group.label} label={group.label}>{group.items.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</optgroup>)}</select></label>
            <label className={css.kitLabel}><span>Featured team</span><select value={teamId} disabled={busy || !fixtureChoice} onChange={event => { const next = event.target.value as NplTeamId; setTeamId(next); if (next === opponentId) setOpponentId(teamId); }}>{nplTeams.filter(team => !selectedFixture || [selectedFixture.teamId, selectedFixture.opponentId].includes(team.id)).map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
            <label className={css.kitLabel}><span>Opponent</span><select value={opponentId} disabled={busy || !fixtureChoice || Boolean(selectedFixture)} onChange={event => setOpponentId(event.target.value as NplTeamId)}>{nplTeams.filter(team => team.id !== teamId && (!selectedFixture || [selectedFixture.teamId, selectedFixture.opponentId].includes(team.id))).map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
            {contentType === 'playing-xi' && <label className={css.kitLabel} style={{ gridColumn: '1 / -1' }}><span id="playing-xi-label">Playing XI names (optional)</span><textarea aria-labelledby="playing-xi-label" rows={6} maxLength={2000} value={lineupText} disabled={busy} aria-describedby="playing-xi-hint" onChange={event => { setPastedLineup({ context: lineupContext, value: event.target.value }); setError(''); }} placeholder="Paste eleven names, one per line" /><small id="playing-xi-hint">One player per line. Add (c) and (wk) if confirmed. Paste all eleven to create the post directly, or leave blank to use the prompt.</small>{lineupErrors.length > 0 && <small role="alert">{lineupErrors.join(' ')}</small>}</label>}
            <button className={styles.primary} disabled={busy || (contentType === 'playing-xi' && lineupErrors.length > 0) || (contentType === 'fixtures' ? !dayGames.length && !restDay && fixtureChoice !== 'custom' : !fixtureChoice)} onClick={() => contentType === 'fixtures' || (contentType === 'playing-xi' && lineup.length) ? void create([contentType]) : setPromptOpen(true)}>{contentType === 'fixtures' ? 'Create fixtures post' : contentType === 'playing-xi' && lineup.length ? 'Create Playing XI post' : 'New cricket post'}</button>
            {contentType === 'fixtures' && <button className={styles.button} disabled={busy || !promptFixture} onClick={() => setPromptOpen(true)}>Use prompt instead</button>}
            <div className={css.fixtureNote}>{fixture ? <><strong>{fixture.label ?? `Match ${fixture.matchNumber}`} · {fixture.startTime ? `${fixture.startTime} NPT` : 'Start time to confirm'}</strong><span>{fixture.venue}</span></> : <span>{playoff ? `${playoff.label} · ${playoff.participants}. Select the confirmed participants; teams are not inferred from standings.` : restDay ? 'Rest day on your fixture sheet. No match is scheduled.' : fixtureChoice === 'custom' ? 'Choose the teams for your custom match.' : dayGames.length > 1 ? 'Two games today. Select the specific game before creating a post.' : 'Choose a scheduled game or use Custom match.'}</span>}
                <StudioDisclosure title="Schedule source and start time"><a href={fixtureScheduleSource} target="_blank" rel="noreferrer">Your Season III fixture sheet</a><p>The sheet lists 12:30 and 16:30. A <a href={fixtureTimingSource} target="_blank" rel="noreferrer">reported revision</a> lists evening games at 17:00. Confirm or adjust the selected game's time here.</p>{fixture && <label className={css.kitLabel}><span>Start time · Nepal</span><input type="time" value={fixture.startTime} disabled={busy} onChange={event => setTimeOverride(event.target.value)} /></label>}</StudioDisclosure>
            </div>
        </section>
        {promptOpen && <PromptCreationModal scope={scope} initialOptions={{ language, format, template: contentType, teams: contentType === 'fixtures' && promptFixture ? { teamId: promptFixture.teamId, opponentId: promptFixture.opponentId } : { teamId, opponentId }, fixture: promptFixture, cricketStyle: visualStyle }} onClose={() => setPromptOpen(false)} onOpen={onOpenDraft} />}
        <StudioDisclosure title="Browse templates manually" variant="feature" description="Choose a template, adjust the match, and start with a filled example." icon={<Layers3 size={18} />} badge={`${cricketTemplates.length} templates`} style={{ margin: '0 24px 24px' }}>
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
                            <select aria-label="Kit featured team" value={teamId} onChange={event => { const id = event.target.value as NplTeamId; setFixtureChoice('custom'); setTeamId(id); if (id === opponentId) setOpponentId(teamId); }}>{nplTeams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select>
                        </div>
                    </label>
                    <label className={css.kitLabel}>
                        <span>Opponent</span>
                        <div className={css.teamSelect}>
                            <img src={`/studio/cricket/${opponentId}.png`} alt="" />
                            <select aria-label="Kit opponent" value={opponentId} onChange={event => { setFixtureChoice('custom'); setOpponentId(event.target.value as NplTeamId); }}>{nplTeams.filter(team => team.id !== teamId).map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select>
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
                <div className={css.pageCategories} role="group" aria-label="Cricket template categories">{categories.map(item => <button key={item} aria-label={item} aria-pressed={category === item} onClick={() => { setCategory(item); if (item !== 'Match moments') setMomentGroup('All'); }}>{item}<span aria-hidden="true">{item === 'All' ? cricketTemplates.length : cricketTemplates.filter(template => template.category === item).length}</span>
                </button>)}</div>
                {category === 'Match moments' && <div className={css.pageMomentGroups} role="group" aria-label="Match moment sub-groups">{[{ id: 'All' as const, title: 'All moments', count: cricketTemplates.filter(template => template.category === 'Match moments').length }, ...matchMomentGroups.map(group => ({ id: group.id, title: group.title, count: group.templates.length }))].map(item => <button key={item.id} aria-label={item.title} aria-pressed={momentGroup === item.id} onClick={() => setMomentGroup(item.id)}>{item.title}<span aria-hidden="true">{item.count}</span></button>)}</div>}
                <label className={css.kitLabel} style={{ maxWidth: 320 }}><span>Preview style</span><select aria-label="Template preview style" value={visualStyle} onChange={event => setVisualStyle(event.target.value as CricketStyle)}>{cricketStyles.map(style => <option key={style.id} value={style.id}>{style.label}</option>)}</select></label>
                <div className={css.galleryMeta}>
                    <span>{visible.length} {visible.length === 1 ? 'template' : 'templates'} · illustrative previews</span>
                    <span>
                        <Check size={12} />{featured.short} vs {opponent.short} · {postOutputDimensions[format].join(' × ')}</span>
                </div>
                {error && <p role="alert" className={styles.error}>{error}</p>}
                <div ref={gridRef}>{(() => {
                    const card = (template: typeof visible[number]) => {
                    const preview = createCricketDesign(template.id, teamId, opponentId, format, language, visualStyle);
                    const player = findPlayers(teamId)[0];
                    if (visualStyle !== 'classic' && player?.photo?.url && ['batter', 'bowler'].includes(template.layout)) {
                        preview.imageUri = player.photo.url; preview.imageCredit = playerPhotoCredit(player);
                        preview.cricket!.batter.name = player.name; preview.cricket!.bowler.name = player.name;
                    }
                    if (['four', 'six', 'wicket'].includes(template.id)) {
                        const pictured = findPlayers(template.id === 'wicket' ? opponentId : teamId)[0];
                        preview.cricket!.batter.notOut = false;
                        if (template.id === 'wicket') { preview.cricket!.wicketType = 'caught'; preview.cricket!.batter.name = player?.name || preview.cricket!.batter.name; preview.cricket!.bowler.name = pictured?.name || preview.cricket!.bowler.name; }
                        else if (pictured) preview.cricket!.batter.name = pictured.name;
                        if (pictured?.photo?.url) { preview.imageUri = pictured.photo.url; preview.imageCredit = playerPhotoCredit(pictured); preview.playerPhotoId = pictured.id; preview.imageFit = 'contain'; }
                    }
                    if (template.id === 'partnership') {
                        const players = findPlayers(teamId);
                        if (players[0]?.photo?.url) { preview.cricket!.batter.name = players[0].name; preview.imageUri = players[0].photo.url; preview.imageCredit = playerPhotoCredit(players[0]); preview.playerPhotoId = players[0].id; preview.imageFit = 'contain'; }
                        if (players[1]) preview.cricket!.secondBatter.name = players[1].name;
                    }
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
                    };
                    if (category === 'Match moments' && momentGroup === 'All') return matchMomentGroups.map(group => {
                        const items = visible.filter(template => group.templates.includes(template.id));
                        if (!items.length) return null;
                        return <section key={group.id} className={css.momentSection} aria-label={group.title}>
                            <div className={css.momentSectionHeading}><h3>{group.title}</h3><p>{group.description}</p></div>
                            <div className={css.pageTemplateGrid}>{items.map(card)}</div>
                        </section>;
                    });
                    return <div className={css.pageTemplateGrid}>{visible.map(card)}</div>;
                })()}
                </div>
                {!visible.length && <div className={css.emptyGallery}>
                    <Search size={25} />
                    <h3>No matching templates</h3>
                    <p>Try another name or browse all categories.</p>
                    <button className={styles.button} onClick={() => { setQuery(''); setCategory('All'); setMomentGroup('All'); }}>Show all templates</button>
                </div>}
            </section>
        </fieldset></StudioDisclosure>
    </div>;
}

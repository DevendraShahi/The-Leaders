"use client";

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { cricketTemplates, cricketTemplate, nplTeams, nplTeam, teamLogo, type NplTeamId, type CricketTemplateId } from '@/lib/post-studio/cricket-catalog';
import { blankCricketData, oversToBalls, type CricketData } from '@/lib/post-studio/cricket-data';
import type { PostDesign } from '@/lib/post-studio/types';
import { Section } from './Controls';
import css from './CricketStudio.module.css';
import styles from './PostStudio.module.css';

type Edit = (change: (current: PostDesign) => PostDesign) => void;
function TextField({ label, value, onChange, validate, hint, multiline = false, maxLength = 120, type = 'text' }: {
    label: string; value: string; onChange: (value: string) => void; validate?: (value: string) => string | null; hint?: string; multiline?: boolean; maxLength?: number; type?: string;
}) {
    const [text, setText] = useState(value), [error, setError] = useState<string | null>(null);
    useEffect(() => { setText(value); setError(null); }, [value]);
    const input = {
        'aria-label': label, 'aria-invalid': Boolean(error), value: text, maxLength, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const next = event.target.value, failure = validate?.(next) ?? null;
            setText(next); setError(failure); if (!failure) onChange(next);
        }
    };
    return <label className={css.kitLabel}>
        <span>{label}</span>{multiline ? <textarea {...input} rows={5} /> : <input {...input} type={type} />}{hint && <small className={css.fieldHint}>{hint}</small>}{error && <span role="alert" className={css.fieldError}>{error}</span>}</label>;
}
function NumberField({ label, value, onChange, max = 9999 }: { label: string; value: number | null; onChange: (value: number | null) => void; max?: number }) {
    return <label className={css.kitLabel}>
        <span>{label}</span>
        <input aria-label={label} type="number" inputMode="numeric" min={0} max={max} step={1} value={value ?? ''} onChange={event => {
            const raw = event.target.value;
            onChange(raw === '' ? null : Math.max(0, Math.min(max, Math.trunc(Number(raw)))));
        }} />
    </label>;
}
function TeamSelect({ label, value, onChange, exclude }: { label: string; value: NplTeamId; onChange: (id: NplTeamId) => void; exclude?: NplTeamId }) {
    return <label className={css.kitLabel}>
        <span>{label}</span>
        <select aria-label={label} value={value} onChange={event => onChange(event.target.value as NplTeamId)}>{nplTeams.filter(team => team.id !== exclude).map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select>
    </label>;
}
const validOvers = (value: string) => value === '' || oversToBalls(value) !== null ? null : 'Use overs such as 14.2. The last digit must be 0–5.';

export default function CricketInspector({ design, onChange }: { design: PostDesign; onChange: Edit }) {
    const data = design.cricket ?? blankCricketData(), baseSpec = cricketTemplate(data.template), team = nplTeam(data.teamId);
    const spec = data.template === 'player-of-match' && data.awardPerformance === 'bowling' ? { ...baseSpec, layout: 'bowler' as const } : baseSpec;
    const [logoError, setLogoError] = useState('');
    const mounted = useRef(true);
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    const edit = (change: Partial<CricketData> | ((current: CricketData) => CricketData)) => onChange(current => {
        const before = current.cricket ?? blankCricketData();
        return { ...current, cricket: typeof change === 'function' ? change(before) : { ...before, ...change } };
    });
    const field = <K extends keyof CricketData>(key: K, value: CricketData[K]) => edit({ [key]: value });
    const changeTeam = (id: NplTeamId) => onChange(current => {
        const before = current.cricket ?? blankCricketData(), next = nplTeam(id);
        return {
            ...current, accent: next.primary, backgroundColor: before.theme === 'midnight' ? '#081321' : next.dark, backgroundGradient: null,
            cricket: { ...before, teamId: id, opponentId: id === before.opponentId ? before.teamId : before.opponentId, teamLogoUri: null, opponentLogoUri: id === before.opponentId ? null : before.opponentLogoUri }
        };
    });
    const changePreset = (id: CricketTemplateId) => onChange(current => {
        const before = current.cricket ?? blankCricketData(), previous = cricketTemplate(before.template), next = cricketTemplate(id);
        const defaultHeadline = current.headline === previous.headline || current.headline === previous.headlineNe;
        return { ...current, headline: defaultHeadline ? before.language === 'ne' ? next.headlineNe : next.headline : current.headline, cricket: { ...before, template: id } };
    });
    const uploadLogo = async (file: File | undefined, key: 'teamLogoUri' | 'opponentLogoUri') => {
        if (!file || design.lockedLayers.includes('visual')) return;
        try {
            if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) throw new Error('Choose a PNG, JPEG or WebP logo smaller than 2 MB.');
            const uri = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Could not read logo.')); reader.readAsDataURL(file); });
            if (!mounted.current) return;
            field(key, uri); setLogoError('');
        } catch (error) { if (mounted.current) setLogoError(error instanceof Error ? error.message : 'Could not add logo.'); }
    };
    const batterFields = (key: 'batter' | 'secondBatter', label: string) => <div className={css.cricketFields}>
        <TextField label={`${label} name`} value={data[key].name} maxLength={90} onChange={name => edit(current => ({ ...current, [key]: { ...current[key], name } }))} />
        <div className={css.dataGrid}>
            <NumberField label={`${label} runs`} value={data[key].runs} onChange={runs => edit(current => ({ ...current, [key]: { ...current[key], runs } }))} />
            <NumberField label={`${label} balls`} value={data[key].balls} onChange={balls => edit(current => ({ ...current, [key]: { ...current[key], balls } }))} />
            <NumberField label={`${label} fours`} value={data[key].fours} onChange={fours => edit(current => ({ ...current, [key]: { ...current[key], fours } }))} />
            <NumberField label={`${label} sixes`} value={data[key].sixes} onChange={sixes => edit(current => ({ ...current, [key]: { ...current[key], sixes } }))} />
        </div>
        <label className={css.checkLabel}>
            <input type="checkbox" checked={data[key].notOut} onChange={event => edit(current => ({ ...current, [key]: { ...current[key], notOut: event.target.checked } }))} />{label} not out</label>
    </div>;
    const bowlFields = <div className={css.cricketFields}>
        <TextField label="Bowler name" value={data.bowler.name} maxLength={90} onChange={name => edit(current => ({ ...current, bowler: { ...current.bowler, name } }))} />
        <div className={css.dataGrid}>
            <NumberField label="Bowler wickets" value={data.bowler.wickets} max={10} onChange={wickets => edit(current => ({ ...current, bowler: { ...current.bowler, wickets } }))} />
            <NumberField label="Runs conceded" value={data.bowler.runs} onChange={runs => edit(current => ({ ...current, bowler: { ...current.bowler, runs } }))} />
            <TextField label="Bowler overs" value={data.bowler.overs} validate={validOvers} onChange={overs => edit(current => ({ ...current, bowler: { ...current.bowler, overs } }))} />
            <NumberField label="Maidens" value={data.bowler.maidens} onChange={maidens => edit(current => ({ ...current, bowler: { ...current.bowler, maidens } }))} />
        </div>
    </div>;
    const withScore = ['score', 'event', 'batter', 'result', 'table'].includes(spec.layout) && data.template !== 'points-table';
    return <div className={css.cricketFields}>
        <label className={css.kitLabel}>
            <span>Cricket template</span>
            <select aria-label="Cricket template" value={data.template} onChange={event => changePreset(event.target.value as CricketTemplateId)}>{cricketTemplates.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
        </label>

        <div className={css.dataGrid}>
            <TeamSelect label="Featured team" value={data.teamId} onChange={changeTeam} />
            <TeamSelect label="Opponent" value={data.opponentId} exclude={data.teamId} onChange={id => edit({ opponentId: id, opponentLogoUri: null })} />
        </div>
        <div className={css.teamChoice}>
            <img src={data.teamLogoUri || teamLogo(data.teamId)} alt={team.name} />
            <div>
                <strong>{team.name}</strong>
                <div className={css.teamPalette}>
                    <i style={{ background: team.primary }} />
                    <i style={{ background: team.secondary }} />
                    <i style={{ background: team.dark }} />
                </div>
            </div>
        </div>
        <div className={css.dataGrid}>
            <label className={css.kitLabel}>
                <span>Team theme</span>
                <select aria-label="Team theme" value={data.theme} onChange={event => { const theme = event.target.value as CricketData['theme']; onChange(current => ({ ...current, accent: team.primary, backgroundColor: theme === 'midnight' ? '#081321' : team.dark, backgroundGradient: null, cricket: { ...(current.cricket ?? blankCricketData()), theme } })); }}>
                    <option value="team">Team colors</option>
                    <option value="midnight">Stadium night</option>
                    <option value="split">Two-team split</option>
                </select>
            </label>
            <label className={css.kitLabel}>
                <span>Labels & numbers</span>
                <select aria-label="Cricket language" value={data.language} onChange={event => { const language = event.target.value as 'en' | 'ne'; onChange(current => { const before = current.cricket ?? blankCricketData(), preset = cricketTemplate(before.template); return { ...current, headline: current.headline === preset.headline || current.headline === preset.headlineNe ? language === 'ne' ? preset.headlineNe : preset.headline : current.headline, cricket: { ...before, language } }; }); }}>
                    <option value="en">English</option>
                    <option value="ne">नेपाली</option>
                </select>
            </label>
        </div>
        <p className={css.fieldHint}>Use Text for your own headline and match note. Player names and written copy keep the language you enter.</p>
        {data.template === 'player-of-match' && <label className={css.kitLabel}>
            <span>Award performance</span>
            <select aria-label="Award performance" value={data.awardPerformance} onChange={event => field('awardPerformance', event.target.value as CricketData['awardPerformance'])}>
                <option value="batting">Batting</option>
                <option value="bowling">Bowling</option>
                <option value="all-round">All-round performance</option>
            </select>
        </label>}
        {spec.layout === 'bowler' && <>
            <h3 className={css.sectionHeading}>Opposition innings</h3>
            <div className={css.dataGridThree}>
                <NumberField label="Opposition runs" value={data.opponentRuns} onChange={value => field('opponentRuns', value)} />
                <NumberField label="Opposition wickets" value={data.opponentWickets} max={10} onChange={value => field('opponentWickets', value)} />
                <TextField label="Opposition overs" value={data.opponentOvers} validate={validOvers} onChange={value => field('opponentOvers', value)} />
            </div>
        </>}
        {withScore && <>
            <h3 className={css.sectionHeading}>Innings score</h3>
            <div className={css.dataGridThree}>
                <NumberField label="Team runs" value={data.runs} onChange={value => field('runs', value)} />
                <NumberField label="Wickets down" value={data.wickets} max={10} onChange={value => field('wickets', value)} />
                <TextField label="Overs bowled" value={data.overs} validate={value => validOvers(value) || (value && (oversToBalls(value) ?? 0) > data.oversLimit * 6 ? 'Overs exceed the innings limit.' : null)} onChange={value => field('overs', value)} />
            </div>
        </>}
        {(spec.layout === 'score' || ['target', 'dls'].includes(data.template)) && <>
            <div className={css.dataGrid}>
                <NumberField label="Target runs" value={data.target} onChange={value => field('target', value)} />
                <TextField label="Innings overs limit" type="number" value={String(data.oversLimit)} validate={value => !/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 50 ? 'Use a whole number from 1 to 50.' : Number(value) * 6 < (oversToBalls(data.overs) ?? 0) ? 'The limit cannot be below the overs already bowled.' : null} onChange={value => field('oversLimit', Number(value))} />
            </div>
            <p className={css.fieldHint}>{data.template === 'dls' ? 'Enter the revised target announced by the scorers. This tool does not calculate DLS targets.' : 'Run rate and the chase equation use legal balls, so 14.2 means 86 balls.'}</p>
        </>}
        {(spec.layout === 'batter' || ['four', 'six', 'wicket', 'partnership'].includes(data.template)) && <>
            <h3 className={css.sectionHeading}>Batter performance</h3>{batterFields('batter', 'Batter')}</>}
        {data.template === 'partnership' && <>
            <div className={css.dataGrid}>
                <NumberField label="Partnership runs" value={data.partnershipRuns} onChange={value => field('partnershipRuns', value)} />
                <NumberField label="Partnership balls" value={data.partnershipBalls} onChange={value => field('partnershipBalls', value)} />
            </div>{batterFields('secondBatter', 'Second batter')}</>}
        {(spec.layout === 'bowler' || data.template === 'wicket' || (data.template === 'player-of-match' && data.awardPerformance === 'all-round')) && <>
            <h3 className={css.sectionHeading}>Bowler performance</h3>{bowlFields}</>}
        {data.template === 'wicket' && <TextField label="Dismissal" value={data.dismissal} maxLength={240} onChange={value => field('dismissal', value)} />}
        {spec.layout === 'score' && <>
            <Section title="Batters at the crease">{batterFields('batter', 'Batter')}{batterFields('secondBatter', 'Second batter')}</Section>
        </>}
        {(spec.layout === 'team' || spec.layout === 'result') && <TextField label={data.template === 'toss' ? 'Toss decision' : data.template === 'rain' ? 'Interruption update' : 'Result / announcement'} value={data.result} maxLength={240} onChange={value => field('result', value)} multiline />}
        {spec.layout === 'result' && <Section title="Opponent innings">
            <div className={css.dataGridThree}>
                <NumberField label="Opponent runs" value={data.opponentRuns} onChange={value => field('opponentRuns', value)} />
                <NumberField label="Opponent wickets" value={data.opponentWickets} max={10} onChange={value => field('opponentWickets', value)} />
                <TextField label="Opponent overs" value={data.opponentOvers} validate={validOvers} onChange={value => field('opponentOvers', value)} />
            </div>
        </Section>}
        {data.template === 'playing-xi' && <TextField label="Playing XI names" value={data.lineup.join('\n')} maxLength={1000} multiline hint="One player per line, up to eleven. Add (c) and (wk) where needed." validate={value => value.split('\n').filter(line => line.trim()).length > 11 ? 'A playing XI can contain at most eleven players.' : value.split('\n').some(line => line.length > 90) ? 'Keep each player name under 90 characters.' : null} onChange={value => field('lineup', value.split('\n').map(line => line.trim()).filter(Boolean))} />}
        {(data.template === 'head-to-head' || data.template === 'team') && <div className={css.tableEditor}>
            <h3 className={css.sectionHeading}>Team statistics</h3>{data.statRows.map((row, index) => <div key={index} className={css.dataGrid}>
                <TextField label={`Statistic ${index + 1} label`} value={row.label} maxLength={40} onChange={value => edit(current => ({ ...current, statRows: current.statRows.map((item, i) => i === index ? { ...item, label: value } : item) }))} />
                <TextField label={`Statistic ${index + 1} value`} value={row.value} maxLength={60} onChange={value => edit(current => ({ ...current, statRows: current.statRows.map((item, i) => i === index ? { ...item, value } : item) }))} />
            </div>)}</div>}
        {data.template === 'fixtures' && <div className={css.tableEditor}>{data.fixtures.map((fixture, index) => <div className={css.editableRow} key={index}>
            <div className={css.rowHeading}>Fixture {index + 1}<button aria-label={`Remove fixture ${index + 1}`} onClick={() => edit(current => ({ ...current, fixtures: current.fixtures.filter((_, i) => i !== index) }))}>
                <Trash2 size={14} />
            </button>
            </div>
            <TeamSelect label={`Fixture ${index + 1} team`} value={fixture.teamId} onChange={value => edit(current => ({ ...current, fixtures: current.fixtures.map((item, i) => i === index ? { ...item, teamId: value } : item) }))} />
            <TeamSelect label={`Fixture ${index + 1} opponent`} value={fixture.opponentId} exclude={fixture.teamId} onChange={value => edit(current => ({ ...current, fixtures: current.fixtures.map((item, i) => i === index ? { ...item, opponentId: value } : item) }))} />
            <TextField label={`Fixture ${index + 1} date and time`} value={fixture.when} maxLength={60} onChange={value => edit(current => ({ ...current, fixtures: current.fixtures.map((item, i) => i === index ? { ...item, when: value } : item) }))} />
            <TextField label={`Fixture ${index + 1} venue`} value={fixture.venue} maxLength={80} onChange={value => edit(current => ({ ...current, fixtures: current.fixtures.map((item, i) => i === index ? { ...item, venue: value } : item) }))} />
        </div>)}<button className={styles.button} disabled={data.fixtures.length >= 6} onClick={() => edit(current => ({ ...current, fixtures: [...current.fixtures, { teamId: data.teamId, opponentId: data.opponentId, when: '', venue: '' }] }))}>
                <Plus size={14} />Add fixture</button>
        </div>}
        {data.template === 'points-table' && <div className={css.tableEditor}>
            <p className={css.fieldHint}>Enter the published standings and NRR. Use the arrows to arrange the table in rank order.</p>{data.standings.map((row, index) => <div key={row.teamId} className={css.editableRow}>
                <div className={css.rowHeading}>
                    <strong>{index + 1}. {nplTeam(row.teamId).name}</strong>
                    <div>
                        <button disabled={index === 0} aria-label={`Move ${nplTeam(row.teamId).name} up`} onClick={() => edit(current => { const next = [...current.standings];[next[index - 1], next[index]] = [next[index], next[index - 1]]; return { ...current, standings: next }; })}>
                            <ArrowUp size={14} />
                        </button>
                        <button disabled={index === data.standings.length - 1} aria-label={`Move ${nplTeam(row.teamId).name} down`} onClick={() => edit(current => { const next = [...current.standings];[next[index + 1], next[index]] = [next[index], next[index + 1]]; return { ...current, standings: next }; })}>
                            <ArrowDown size={14} />
                        </button>
                    </div>
                </div>
                <div className={css.dataGridThree}>{(['played', 'won', 'lost', 'points'] as const).map(key => <NumberField key={key} label={`${nplTeam(row.teamId).short} ${key}`} value={row[key]} onChange={value => edit(current => ({ ...current, standings: current.standings.map((item, i) => i === index ? { ...item, [key]: value } : item) }))} />)}<TextField label={`${nplTeam(row.teamId).short} NRR`} value={row.nrr} maxLength={10} validate={value => /^(?:[+-]?\d+(?:\.\d{1,3})?|—|)$/.test(value) ? null : 'Use a rate such as +0.725.'} onChange={value => edit(current => ({ ...current, standings: current.standings.map((item, i) => i === index ? { ...item, nrr: value } : item) }))} />
                </div>
            </div>)}</div>}
        {data.template === 'scorecard' && <>
            <p className={css.fieldHint}>Choose the performances to feature. For a complete innings, use separate pages for batting and bowling.</p>
            <Section title={`Batting rows · ${data.batting.length}`}>
                <div className={css.tableEditor}>{data.batting.map((row, index) => <div key={index} className={css.editableRow}>
                    <div className={css.rowHeading}>Batter {index + 1}<button aria-label={`Remove batter row ${index + 1}`} onClick={() => edit(current => ({ ...current, batting: current.batting.filter((_, i) => i !== index) }))}>
                        <Trash2 size={14} />
                    </button>
                    </div>
                    <TextField label={`Scorecard batter ${index + 1} name`} value={row.name} maxLength={90} onChange={value => edit(current => ({ ...current, batting: current.batting.map((item, i) => i === index ? { ...item, name: value } : item) }))} />
                    <div className={css.dataGrid}>{(['runs', 'balls'] as const).map(key => <NumberField key={key} label={`Scorecard batter ${index + 1} ${key}`} value={row[key]} onChange={value => edit(current => ({ ...current, batting: current.batting.map((item, i) => i === index ? { ...item, [key]: value } : item) }))} />)}</div>
                    <label className={css.checkLabel}>
                        <input type="checkbox" checked={row.notOut} onChange={event => edit(current => ({ ...current, batting: current.batting.map((item, i) => i === index ? { ...item, notOut: event.target.checked } : item) }))} />Not out</label>
                </div>)}<button className={styles.button} disabled={data.batting.length >= 11} onClick={() => edit(current => ({ ...current, batting: [...current.batting, { name: '', runs: null, balls: null, fours: null, sixes: null, notOut: false }] }))}>
                        <Plus size={14} />Add batter row</button>
                </div>
            </Section>
            <Section title={`Bowling rows · ${data.bowling.length}`}>
                <div className={css.tableEditor}>{data.bowling.map((row, index) => <div key={index} className={css.editableRow}>
                    <div className={css.rowHeading}>Bowler {index + 1}<button aria-label={`Remove bowler row ${index + 1}`} onClick={() => edit(current => ({ ...current, bowling: current.bowling.filter((_, i) => i !== index) }))}>
                        <Trash2 size={14} />
                    </button>
                    </div>
                    <TextField label={`Scorecard bowler ${index + 1} name`} value={row.name} maxLength={90} onChange={value => edit(current => ({ ...current, bowling: current.bowling.map((item, i) => i === index ? { ...item, name: value } : item) }))} />
                    <div className={css.dataGridThree}>
                        <TextField label={`Scorecard bowler ${index + 1} overs`} value={row.overs} validate={validOvers} onChange={value => edit(current => ({ ...current, bowling: current.bowling.map((item, i) => i === index ? { ...item, overs: value } : item) }))} />{(['runs', 'wickets'] as const).map(key => <NumberField key={key} label={`Scorecard bowler ${index + 1} ${key}`} max={key === 'wickets' ? 10 : 9999} value={row[key]} onChange={value => edit(current => ({ ...current, bowling: current.bowling.map((item, i) => i === index ? { ...item, [key]: value } : item) }))} />)}</div>
                </div>)}<button className={styles.button} disabled={data.bowling.length >= 11} onClick={() => edit(current => ({ ...current, bowling: [...current.bowling, { name: '', overs: '', maidens: null, runs: null, wickets: null }] }))}>
                        <Plus size={14} />Add bowler row</button>
                </div>
            </Section>
        </>}
        <Section title="Match details">
            <div className={css.cricketFields}>
                <TextField label="Competition" value={data.competition} maxLength={60} onChange={value => field('competition', value)} />
                <TextField label="Match label" value={data.matchLabel} maxLength={60} onChange={value => field('matchLabel', value)} />
                <TextField label="Venue" value={data.venue} onChange={value => field('venue', value)} />
                <TextField label="Match date" value={data.matchDate} type="date" onChange={value => field('matchDate', value)} />
                <TextField label="Start time in Nepal" value={data.startTime} maxLength={40} hint="Use the confirmed local start time; the artwork labels it NPT." onChange={value => field('startTime', value)} />
            </div>
        </Section>
        <Section title="Source & update time">
            <div className={css.cricketFields}>
                <TextField label="Score source URL" value={data.sourceUrl} maxLength={500} type="url" validate={value => value === '' || /^https?:\/\/[^\s]+$/.test(value) ? null : 'Enter a complete http or https URL.'} onChange={value => field('sourceUrl', value)} />
                <p className={css.fieldHint}>The artwork shows the source domain and update time when supplied.</p>
                <label className={css.kitLabel}>
                    <span>Last update · Nepal time</span>
                    <input aria-label="Last update in Nepal time" type="datetime-local" value={data.updatedAt ? new Date(new Date(data.updatedAt).getTime() + 345 * 60000).toISOString().slice(0, 16) : ''} onChange={event => field('updatedAt', event.target.value ? new Date(event.target.value + '+05:45').toISOString() : '')} />
                </label>
                <button className={styles.button} onClick={() => field('updatedAt', new Date().toISOString())}>Mark updated now</button>
            </div>
        </Section>
        <Section title="Team logos">
            <p className={css.fieldHint}>The eight franchise logos are bundled for export. Upload a newer or approved variant if needed.</p>{(['teamLogoUri', 'opponentLogoUri'] as const).map(key => <div className={css.logoUpload} key={key}>
                <label className={css.kitLabel}>
                    <span>{key === 'teamLogoUri' ? 'Featured team logo' : 'Opponent logo'}</span>
                    <input type="file" aria-label={key === 'teamLogoUri' ? 'Upload featured team logo' : 'Upload opponent logo'} accept="image/png,image/jpeg,image/webp" disabled={design.lockedLayers.includes('visual')} onChange={event => { void uploadLogo(event.target.files?.[0], key); event.target.value = ''; }} />
                </label>
                <button className={styles.button} disabled={design.lockedLayers.includes('visual') || !data[key]} onClick={() => field(key, null)}>Reset logo</button>
            </div>)}{logoError && <p role="alert" className={css.fieldError}>{logoError}</p>}</Section>
    </div>;
}

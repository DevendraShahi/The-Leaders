"use client";

import { forwardRef, type CSSProperties, type ReactNode } from 'react';
import { hasDevanagari } from '@/lib/post-studio/typography';
import { artworkTextStyle } from '@/lib/post-studio/artwork-text';
import { cricketTemplate, nplTeam, teamLogo, teamName, type NplTeamId } from '@/lib/post-studio/cricket-catalog';
import { chaseEquation, cricketNumber, cricketScore, blankCricketData, runRate, strikeRate } from '@/lib/post-studio/cricket-data';
import { postOutputDimensions, type PostDesign, type PostLayer, type PostTextLayer } from '@/lib/post-studio/types';
import { ArtworkPhoto } from './ArtworkPhoto';
import css from './CricketStudio.module.css';

export const CricketArtwork = forwardRef<HTMLDivElement, {
    design: PostDesign; selected?: PostLayer; guides?: boolean;
    onSelect?: (layer: PostLayer) => void; onChooseImage?: () => void;
}>(({ design, selected, guides, onSelect, onChooseImage }, ref) => {
    const data = design.cricket ?? blankCricketData(), baseSpec = cricketTemplate(data.template);
    const spec = data.template === 'player-of-match' && data.awardPerformance === 'bowling' ? { ...baseSpec, layout: 'bowler' as const } : baseSpec;
    const team = nplTeam(data.teamId), opponent = nplTeam(data.opponentId);
    const [width, outputHeight] = postOutputDimensions[design.format], height = 360 * outputHeight / width;
    const landscape = design.format === 'landscape', compact = design.format === 'square';
    const t = (en: string, ne: string) => data.language === 'ne' ? ne : en;
    const n = (value: number | string | null) => cricketNumber(value, data.language);
    const hidden = (layer: PostLayer) => design.hiddenLayers.includes(layer);
    const textStyle = (layer: PostTextLayer, size: number, content?: string): CSSProperties => {
        const base = artworkTextStyle(design, layer, content ?? (data.language === 'ne' ? 'नेपाली' : undefined));
        const scale = layer === 'headline' ? design.headlineScale : design.textTypography[layer].size / 100;
        const nepali = design.textTypography[layer].font === 'hind' || hasDevanagari(content ?? (data.language === 'ne' ? 'नेपाली' : ''));
        const fontSize = size * scale * (nepali && size > 40 ? .8 : nepali && layer === 'headline' ? .9 : 1);
        return { ...base, fontSize, lineHeight: `${fontSize * (nepali ? 1.65 : 1.25) * design.textTypography[layer].lineSpacing / 100}px` };
    };
    const select = (layer: PostLayer) => onSelect && !design.lockedLayers.includes(layer) ? {
        role: 'button', tabIndex: 0, 'aria-label': `Select ${layer === 'supporting' ? 'summary' : layer}`,
        onClick: () => onSelect(layer), onKeyDown: (event: React.KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(layer); } },
    } : {};
    const selectedClass = (layer: PostLayer) => onSelect && selected === layer ? css.selected : '';
    const logo = (id: NplTeamId, size = 56) => <img className={css.teamLogo} src={id === data.teamId ? data.teamLogoUri || teamLogo(id) : id === data.opponentId ? data.opponentLogoUri || teamLogo(id) : teamLogo(id)} alt={nplTeam(id).name} width={size} height={size} style={{ '--logo-size': `${size}px` } as CSSProperties} />;
    const teamBadge = (id: NplTeamId, size = 64) => <div className={css.teamBadge}>{logo(id, size)}<strong data-export-fit>{teamName(nplTeam(id), data.language)}</strong>
    </div>;
    const score = n(cricketScore(data.runs, data.wickets));
    const otherScore = n(cricketScore(data.opponentRuns, data.opponentWickets));
    const equation = chaseEquation(data);
    const title = !hidden('headline') && <div {...select('headline')} className={`${css.headline} ${selectedClass('headline')}`} data-line-limit={landscape ? 2 : 3} data-testid="artwork-headline" style={textStyle('headline', landscape ? 17 : compact ? 23 : 25, design.headline)}>{design.headline}</div>;
    const stat = (label: string, value: ReactNode) => <div className={css.stat}>
        <strong data-export-fit>{value}</strong>
        <span>{label}</span>
    </div>;
    const stats = (items: [string, ReactNode][]) => <div className={css.stats}>{items.map(([label, value]) => <div key={label}>{stat(label, value)}</div>)}</div>;
    const scoreStrip = () => <div className={css.scoreStrip}>
        <span className={css.inlineTeam}>{logo(spec.layout === 'bowler' ? data.opponentId : data.teamId, 25)}<b>{spec.layout === 'bowler' ? opponent.short : team.short}</b>
        </span>
        <strong>{spec.layout === 'bowler' ? otherScore : score}</strong>
        <span>{n((spec.layout === 'bowler' ? data.opponentOvers : data.overs) || '—')} {t('OV', 'ओभर')}</span>
        <span className={css.scoreStripDivider} />
        <span>{t('vs', 'विरुद्ध')}</span>
        <span className={css.inlineTeam}>{logo(spec.layout === 'bowler' ? data.teamId : data.opponentId, 22)}<b>{spec.layout === 'bowler' ? team.short : opponent.short}</b>
        </span>
    </div>;
    const playerName = (name: string) => <div className={css.playerName} data-export-fit style={textStyle('supporting', landscape ? 13 : 19, name)}>{name || t('Add player name', 'खेलाडीको नाम')}</div>;
    const eventValue = data.template === 'four' ? '4' : data.template === 'six' ? '6' : data.template === 'wicket' ? 'W' : data.template === 'partnership' ? data.partnershipRuns : data.target;
    const renderBody = () => {
        switch (spec.layout) {
            case 'versus': return <>{title}<div className={css.matchup}>{teamBadge(data.teamId, landscape ? 48 : 84)}<span className={css.versus}>VS</span>{teamBadge(data.opponentId, landscape ? 48 : 84)}</div>{data.template === 'head-to-head' ? stats(data.statRows.map(row => [row.label, row.value])) : <div className={css.matchWhen}>
                <strong>{data.matchDate || t('MATCH DATE', 'खेल मिति')}</strong>
                <span>{data.startTime ? `${data.startTime} NPT` : t('Add confirmed start time · NPT', 'पुष्टि भएको समय राख्नुहोस् · नेपाल समय')}</span>
                <small>{data.venue}</small>
            </div>}</>;
            case 'fixtures': return <>{title}<div className={css.fixtures}>{data.fixtures.map((fixture, index) => <div className={css.fixture} key={index}>
                <span className={css.fixtureDate}>{fixture.when}</span>
                <div>{logo(fixture.teamId, 32)}<strong>{nplTeam(fixture.teamId).short}<small>{teamName(nplTeam(fixture.teamId), data.language)}</small>
                </strong>
                    <span className={css.versus}>VS</span>
                    <strong>{nplTeam(fixture.opponentId).short}<small>{teamName(nplTeam(fixture.opponentId), data.language)}</small>
                    </strong>{logo(fixture.opponentId, 32)}</div>
                <small>{fixture.venue}</small>
            </div>)}</div>
            </>;
            case 'lineup': return <>{title}<div className={css.lineupTeam}>{logo(data.teamId, 34)}<strong>{teamName(team, data.language)}</strong>
            </div>
                <ol className={css.lineup}>{data.lineup.map((name, index) => <li key={index}>
                    <span>{n(index + 1).padStart(2, data.language === 'ne' ? '०' : '0')}</span>
                    <strong data-export-fit>{name}</strong>
                </li>)}</ol>
            </>;
            case 'event': return <>
                <div className={css.eventHero}>
                    <div className={css.heroValue} data-export-fit style={textStyle('headline', landscape ? 52 : compact ? 84 : 116, String(eventValue))}>{n(eventValue)}</div>
                    <div className={css.eventCopy}>{title}{data.template === 'four' || data.template === 'six' ? <>{playerName(data.batter.name)}<span className={css.smallLine}>{n(data.batter.runs)}{data.batter.notOut ? '*' : ''} ({n(data.batter.balls)})</span>
                    </> : data.template === 'wicket' ? <>{playerName(data.batter.name)}<span className={css.smallLine} data-export-fit>{data.dismissal}</span>
                        <small>{t('Bowler', 'बलर')}: {data.bowler.name}</small>
                    </> : data.template === 'partnership' ? <>
                        <div className={css.smallLine}>{data.batter.name} × {data.secondBatter.name}</div>
                        <span>{n(data.partnershipBalls)} {t('balls', 'बल')}</span>
                    </> : <>
                        <span className={css.smallLine}>{n(data.oversLimit)} {t('overs', 'ओभर')}</span>{data.template === 'dls' && <span className={css.dls}>DLS · {t('Official revised target', 'आधिकारिक संशोधित लक्ष्य')}</span>}</>}</div>
                </div>{scoreStrip()}</>;
            case 'score': return <>{title}<div className={css.scoreHero}>
                <div>{logo(data.teamId, landscape ? 40 : 58)}<span>{teamName(team, data.language)}</span>
                </div>
                <strong className={css.bigScore} data-export-fit style={textStyle('headline', landscape ? 42 : compact ? 56 : 64, score)}>{score}</strong>
                <span>{n(data.overs || '—')} {t('overs', 'ओभर')} / {n(data.oversLimit)} · {t('RR', 'रन रेट')} {n(runRate(data.runs, data.overs))}</span>
            </div>
                <div className={css.scorePlayers}>
                    <div>
                        <span>{data.batter.name}</span>
                        <strong>{n(data.batter.runs)}{data.batter.notOut ? '*' : ''} <small>({n(data.batter.balls)})</small>
                        </strong>
                    </div>
                    <div>
                        <span>{data.secondBatter.name}</span>
                        <strong>{n(data.secondBatter.runs)}{data.secondBatter.notOut ? '*' : ''} <small>({n(data.secondBatter.balls)})</small>
                        </strong>
                    </div>
                </div>{equation && data.template !== 'innings' && <div className={css.chase}>
                    <strong>{n(equation.runs)}</strong> {t('needed from', 'रन आवश्यक, बाँकी')} <strong>{n(equation.balls)}</strong> {t('balls', 'बल')}<span>{t('REQ', 'आवश्यक दर')} {n(equation.rate)}</span>
                </div>}{data.template === 'innings' && data.target !== null && <div className={css.chase}>{t('TARGET', 'लक्ष्य')} <strong>{n(data.target)}</strong>
                </div>}</>;
            case 'batter': return <>
                <div className={css.playerHero}>
                    <div className={css.playerIdentity}>{logo(data.teamId, landscape ? 40 : 60)}{title}{playerName(data.batter.name)}</div>
                    <div className={css.heroValue} data-export-fit style={textStyle('headline', landscape ? 40 : compact ? 68 : design.format === 'story' ? 116 : 84, n(data.batter.runs))}>{n(data.batter.runs)}{data.batter.notOut && <span className={css.notOut} aria-label="Not out">*</span>}
                    </div>
                </div>{stats(data.template === 'player-of-match' && data.awardPerformance === 'all-round' ? [[t('BALLS', 'बल'), n(data.batter.balls)], [t('STRIKE RATE', 'स्ट्राइक रेट'), n(strikeRate(data.batter.runs, data.batter.balls))], [t('WICKETS', 'विकेट'), n(data.bowler.wickets)], [t('ECONOMY', 'इकोनोमी'), n(runRate(data.bowler.runs, data.bowler.overs))]] : [[t('BALLS', 'बल'), n(data.batter.balls)], [t('FOURS', 'चौका'), n(data.batter.fours)], [t('SIXES', 'छक्का'), n(data.batter.sixes)], [t('STRIKE RATE', 'स्ट्राइक रेट'), n(strikeRate(data.batter.runs, data.batter.balls))]])}{scoreStrip()}</>;
            case 'bowler': return <>
                <div className={css.playerHero}>
                    <div className={css.playerIdentity}>{logo(data.teamId, landscape ? 40 : 60)}{title}{playerName(data.bowler.name)}</div>
                    <div className={css.heroValue} data-export-fit style={textStyle('headline', landscape ? 38 : compact ? 60 : design.format === 'story' ? 100 : 80, `${data.bowler.wickets}/${data.bowler.runs}`)}>{n(data.bowler.wickets)}<i>/</i>{n(data.bowler.runs)}</div>
                </div>{stats([[t('OVERS', 'ओभर'), n(data.bowler.overs || '—')], [t('MAIDENS', 'मेडन'), n(data.bowler.maidens)], [t('ECONOMY', 'इकोनोमी'), n(runRate(data.bowler.runs, data.bowler.overs))]])}{scoreStrip()}</>;
            case 'table': return <>{title}{data.template === 'points-table' ? <table className={css.pointsTable}>
                <thead>
                    <tr>
                        <th>{t('TEAM', 'टोली')}</th>
                        <th>P</th>
                        <th>W</th>
                        <th>L</th>
                        <th>PTS</th>
                        <th>NRR</th>
                    </tr>
                </thead>
                <tbody>{data.standings.map((row, index) => <tr key={row.teamId}>
                    <td>
                        <span>{n(index + 1)}</span>{logo(row.teamId, 20)}<b>{nplTeam(row.teamId).short}</b>
                    </td>
                    <td>{n(row.played)}</td>
                    <td>{n(row.won)}</td>
                    <td>{n(row.lost)}</td>
                    <td>
                        <strong>{n(row.points)}</strong>
                    </td>
                    <td>{n(row.nrr)}</td>
                </tr>)}</tbody>
            </table> : <>
                <div className={css.scorecardCaption}>{team.short} {score} <span>{n(data.overs)} {t('OV', 'ओभर')}</span>
                </div>
                <div className={css.scorecardTables}>
                    <div>
                        <h4>{t('BATTING', 'ब्याटिङ')}</h4>
                        <table className={css.performanceTable}>
                            <thead>
                                <tr>
                                    <th>{t('BATTER', 'ब्याटर')}</th>
                                    <th>R</th>
                                    <th>B</th>
                                    <th>SR</th>
                                </tr>
                            </thead>
                            <tbody>{data.batting.map((row, index) => <tr key={index}>
                                <td>
                                    <span data-export-fit>{row.name}</span>
                                </td>
                                <td>{n(row.runs)}{row.notOut ? '*' : ''}</td>
                                <td>{n(row.balls)}</td>
                                <td>{n(strikeRate(row.runs, row.balls))}</td>
                            </tr>)}</tbody>
                        </table>
                    </div>
                    <div>
                        <h4>{t('BOWLING', 'बलिङ')}</h4>
                        <table className={css.performanceTable}>
                            <thead>
                                <tr>
                                    <th>{t('BOWLER', 'बलर')}</th>
                                    <th>O</th>
                                    <th>R</th>
                                    <th>W</th>
                                </tr>
                            </thead>
                            <tbody>{data.bowling.map((row, index) => <tr key={index}>
                                <td>
                                    <span data-export-fit>{row.name}</span>
                                </td>
                                <td>{n(row.overs)}</td>
                                <td>{n(row.runs)}</td>
                                <td>{n(row.wickets)}</td>
                            </tr>)}</tbody>
                        </table>
                    </div>
                </div>
            </>}</>;
            case 'result': return <>
                <div className={css.resultHero}>{teamBadge(data.teamId, landscape ? 66 : compact ? 60 : 88)}<div>{title}<div className={css.resultMargin} data-export-fit style={textStyle('supporting', landscape ? 13 : 19, data.result)}>{data.result}</div>
                </div>
                </div>
                <div className={css.resultScores}>
                    <span>{team.short}<strong>{score}</strong>
                        <small>{n(data.overs)} {t('OV', 'ओभर')}</small>
                    </span>
                    <span>{opponent.short}<strong>{otherScore}</strong>
                        <small>{n(data.opponentOvers)} {t('OV', 'ओभर')}</small>
                    </span>
                </div>
            </>;
            case 'team': return <>
                <div className={css.teamHero}>{teamBadge(data.teamId, landscape ? 60 : 110)}<div>{title}{data.result && <div className={css.resultMargin} data-export-fit style={textStyle('supporting', landscape ? 12 : 17, data.result)}>{data.result}</div>}</div>
                </div>{data.template === 'team' && stats(data.statRows.map(row => [row.label, row.value]))}</>;
        }
    };
    const sourceHost = (() => { try { return data.sourceUrl ? new URL(data.sourceUrl).hostname.replace(/^www\./, '') : ''; } catch { return ''; } })();
    const updateTime = data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString(data.language === 'ne' ? 'ne-NP' : 'en-GB', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', hour12: false }) : '';
    return <div ref={ref} data-testid="post-artwork" data-cricket-template={data.template} className={`${css.artwork} ${landscape ? css.landscape : ''} ${compact ? css.square : ''} ${design.format === 'story' ? css.story : ''}`} style={{ width: 360, height, background: design.backgroundGradient || design.backgroundColor || team.dark, '--cricket-accent': design.accent, '--cricket-secondary': team.secondary, textAlign: design.textAlign, fontFamily: data.language === 'ne' ? 'Hind_400Regular,sans-serif' : 'Onest_400Regular,sans-serif' } as CSSProperties}>
        <ArtworkPhoto design={design} height={height} />
        <div className={css.atmosphere} style={data.theme === 'split' ? { background: `linear-gradient(125deg,${team.dark}b0 45%,${opponent.dark}d9 45%)` } : undefined} />
        {design.imageUri && !hidden('visual') && <div className={css.photoShade} style={{ background: design.imageTone === 'clear' ? 'linear-gradient(0deg,#030713dd,transparent 85%)' : design.imageTone === 'warm' ? 'linear-gradient(0deg,#251408ee,#25140855)' : 'linear-gradient(0deg,#030713f5,#03071366)' }} />}
        <div className={css.pitchLines} aria-hidden="true">
            <i />
            <i />
            <i />
        </div>
        <div className={css.inner}>
            <header className={css.masthead}>
                <img src="/studio/leaders.png" width={landscape ? 24 : 30} height={landscape ? 24 : 30} alt="The Leaders" />
                <div>
                    <b>{data.competition}</b>{!hidden('kicker') && <span {...select('kicker')} className={selectedClass('kicker')} style={textStyle('kicker', landscape ? 6 : 7, design.eyebrow)}>{design.eyebrow}</span>}</div>
                <span className={css.status}>{t('CRICKET', 'क्रिकेट')}</span>
            </header>
            <div className={css.matchMeta}>
                <span>{data.matchLabel}</span>
                <span>{team.short} <i>×</i> {opponent.short}</span>
            </div>
            <div className={`${css.body} ${css['layout' + spec.layout]}`} data-export-fit>{renderBody()}{!hidden('supporting') && design.summary && <div {...select('supporting')} className={`${css.note} ${selectedClass('supporting')}`} style={textStyle('supporting', landscape ? 8 : 10, design.summary)} data-line-limit={landscape ? 2 : 3}>{design.summary}</div>}</div>
            {!hidden('footer') && <footer {...select('footer')} className={`${css.footer} ${selectedClass('footer')}`} style={textStyle('footer', landscape ? 5 : 6, design.author)}>
                <span>{design.author}</span>
                <span>{updateTime ? `${updateTime} NPT` : data.matchDate || 'NPL'}{sourceHost ? ` · ${sourceHost}` : ''}</span>
            </footer>}
        </div>
        {guides && <div className={css.safeGuides} aria-hidden="true" />}
        {onChooseImage && !design.imageUri && <button className={css.photoButton} onClick={onChooseImage} aria-label="Add cricket photo">＋ {t('PHOTO', 'फोटो')}</button>}
    </div>;
});
CricketArtwork.displayName = 'CricketArtwork';

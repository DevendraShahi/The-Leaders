"use client";

import { CricketTournamentMark } from './CricketTournamentMark';

import { Echo11Credit, echo11FrameClass } from './Echo11Credit';

import { forwardRef, type CSSProperties, type ReactNode } from 'react';
import { nplTeam, teamLogo, teamName, type NplTeamId } from '@/lib/post-studio/cricket-catalog';
import { blankCricketData, chaseEquation, cricketNumber, cricketScore, runRate, strikeRate } from '@/lib/post-studio/cricket-data';
import { coverageIssues, isBowlingCoverage, isPlayerCoverage } from '@/lib/post-studio/coverage-posts';
import { playerPhotoSubject, portraitIsCurrent } from '@/lib/post-studio/player-portraits';
import { matchdayBackgrounds } from '@/lib/post-studio/matchday';
import { postOutputDimensions, type PostLayer, type PostTextLayer } from '@/lib/post-studio/types';
import { hasDevanagari } from '@/lib/post-studio/typography';
import { FittedArtworkText } from './FittedArtworkText';
import { ArtworkPhoto } from './ArtworkPhoto';
import { ArtworkPlacedImages } from './ArtworkPlacedImages';
import type { CricketArtworkProps } from './CricketArtwork';
import base from './FixturesArtwork.module.css';
import s from './CoverageArtwork.module.css';

/** Every visible figure has one owner and one reserved slot, shared by preview and export. */
export const CoverageArtwork = forwardRef<HTMLDivElement, CricketArtworkProps>(({ design, onSelect, selected, guides, selectedPlacedImageId, onSelectPlacedImage }, ref) => {
    const data = design.cricket ?? blankCricketData('innings');
    const wide = design.format === 'landscape', paper = design.cricketStyle === 'editorial';
    const [width, outputHeight] = postOutputDimensions[design.format], height = 360 * outputHeight / width;
    const t = (en: string, ne: string) => data.language === 'ne' ? ne : en;
    const n = (value: number | string | null) => cricketNumber(value, data.language);
    const text = (value: string, className: string, max = 12, min = 5, group?: string, layer?: PostTextLayer, rowLineHeight?: number) => {
        const typography = layer ? design.textTypography[layer] : undefined;
        const nepali = hasDevanagari(value) || typography?.font === 'hind';
        return <FittedArtworkText text={value} className={className} max={max * (typography ? typography.size / 100 : 1) * (layer === 'headline' ? design.headlineScale : 1)} min={min} fitGroup={group} lineHeight={rowLineHeight ?? (nepali ? 1.6 : 1.2)} style={{ fontFamily: nepali ? 'Hind_700Bold' : 'Onest_700Bold', color: layer ? design.textColors[layer] ?? undefined : undefined }} />;
    };
    const select = (layer: PostLayer) => onSelect && !design.lockedLayers.includes(layer) ? { role: 'button', tabIndex: 0, 'aria-label': `Select ${layer}`, 'data-selected': selected === layer || undefined, onClick: () => onSelect(layer), onKeyDown: (event: React.KeyboardEvent) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); onSelect(layer); } } } : {};
    const team = nplTeam(data.teamId), opponent = nplTeam(data.opponentId);
    const bowling = isBowlingCoverage(data), player = isPlayerCoverage(data.template), allRound = data.template === 'player-of-match' && data.awardPerformance === 'all-round';
    const family = player ? 'player' : ['result', 'champions'].includes(data.template) ? 'result' : ['target', 'dls'].includes(data.template) ? 'target' : ['rain', 'qualified'].includes(data.template) ? 'status' : ['scorecard', 'points-table'].includes(data.template) ? 'table' : 'innings';
    const subject = playerPhotoSubject(design), currentPortrait = portraitIsCurrent(design);
    const showPortrait = player && data.showPlayerPhoto !== false && !design.hiddenLayers.includes('visual') && Boolean(design.imageUri) && currentPortrait;
    const background = matchdayBackgrounds.find(item => item.id === data.matchdayBackground) ?? matchdayBackgrounds[wide ? 0 : 4];
    const issues = [...coverageIssues(design), ...(player && design.imageUri && !currentPortrait && data.showPlayerPhoto !== false && !design.hiddenLayers.includes('visual') ? ['Choose a portrait matching the named player and team.'] : [])];
    const logo = (id: NplTeamId) => <img src={(id === data.teamId ? data.teamLogoUri : id === data.opponentId ? data.opponentLogoUri : null) || teamLogo(id)} alt={teamName(nplTeam(id), data.language)} />;
    const teamText = (id: NplTeamId, value: string, className: string, max: number, min: number) => <div className={s.teamText} data-team-badge={id}>{logo(id)}{text(value, className, max, min)}</div>;
    const identity = (id: NplTeamId, label = '') => <div className={s.identity} data-guide-section="identity"><div className={s.crest}>{logo(id)}</div><div className={s.identityCopy} style={label ? undefined : { gridTemplateRows: '100%' }}>{text(teamName(nplTeam(id), data.language), s.identityName, wide ? 9 : 13, 5, 'coverage-teams')}{label && text(label, s.smallLabel, wide ? 4 : 5.5, 3)}</div></div>;
    const metric = (label: string, value: string, key: string) => <div className={s.metric} key={key}>{text(value, s.metricValue, wide ? 11 : 17, 5, 'coverage-metrics')}{text(label, s.metricLabel, wide ? 3.5 : 5, 2.8)}</div>;
    const snapshot = (opposition = false) => <div className={s.snapshot} data-guide-section="snapshot">{teamText(opposition ? data.opponentId : data.teamId, `${opposition ? opponent.short : team.short} ${n(cricketScore(opposition ? data.opponentRuns : data.runs, opposition ? data.opponentWickets : data.wickets))}`, s.snapshotScore, wide ? 11 : 18, 6)}{text(`${n(opposition ? data.opponentOvers : data.overs)} ${t('OVERS', 'ओभर')} · ${opposition ? t('OPPOSITION INNINGS', 'प्रतिपक्षको इनिङ्स') : t('BATTING TEAM', 'ब्याटिङ टोली')}`, s.snapshotLabel, wide ? 4.5 : 6.5, 3.5)}</div>;
    const playerName = bowling ? data.bowler.name : data.batter.name;
    const battingFigures = [metric(t('BALLS', 'बल'), n(data.batter.balls), 'balls'), metric(t('FOURS', 'चौका'), n(data.batter.fours), 'fours'), metric(t('SIXES', 'छक्का'), n(data.batter.sixes), 'sixes'), metric(t('STRIKE RATE', 'स्ट्राइक रेट'), n(strikeRate(data.batter.runs, data.batter.balls)), 'sr')];
    const bowlingFigures = [metric(t('OVERS', 'ओभर'), n(data.bowler.overs), 'overs'), metric(t('ECONOMY', 'इकोनोमी'), n(runRate(data.bowler.runs, data.bowler.overs)), 'economy'), metric(t('MAIDENS', 'मेडन'), n(data.bowler.maidens), 'maidens')];
    const resultScore = (id: NplTeamId, opposite: boolean) => <div className={s.resultScore}>{identity(id)}{text(n(cricketScore(opposite ? data.opponentRuns : data.runs, opposite ? data.opponentWickets : data.wickets)), s.resultNumber, wide ? 22 : 34, 10, 'result-scores')}{text(`${n(opposite ? data.opponentOvers : data.overs)} ${t('OVERS', 'ओभर')}`, s.smallLabel, wide ? 5 : 7, 3.5)}</div>;
    const table = (title: string, labels: string[], rows: (string | ReactNode)[][], name: string, teamId?: NplTeamId) => <section className={s.tableBlock} data-dense={rows.length > 7 || undefined} data-guide-section={name} aria-label={title}><div className={s.tableTitle}>{teamId ? teamText(teamId, title, s.fill, wide ? 6 : 8, 4) : text(title, s.fill, wide ? 6 : 8, 4)}</div><div className={s.table} role="table" style={{ gridTemplateRows: `minmax(0, .8fr) repeat(${Math.max(1, rows.length)}, minmax(0, 1fr))` }}><div role="row" className={s.tableRow} style={{ '--columns': labels.length } as CSSProperties}>{labels.map(label => <div role="columnheader" className={s.cell} key={label}>{text(label, s.fill, wide ? 4 : 5.5, 2.8)}</div>)}</div>{rows.length ? rows.map((row, index) => <div role="row" className={s.tableRow} key={index} style={{ '--columns': labels.length } as CSSProperties}>{row.map((value, column) => <div role="cell" className={s.cell} key={column}>{typeof value === 'string' ? text(value, s.fill, wide ? 6 : 8.5, 3, `${name}-${column}`, undefined, 1.35) : value}</div>)}</div>) : <div className={s.emptyTable}>{text('—', s.fill, 10, 5)}</div>}</div></section>;
    let body: ReactNode;
    if (family === 'player') body = <div className={s.playerBody}>
        <div className={s.playerMain}>
            <div className={s.portrait} {...select('visual')} data-guide-section="portrait">{showPortrait ? <img src={design.imageUri!} alt={subject?.name || playerName} style={{ objectFit: design.imageFit, transform: `translate(${design.imageOffsetX}px, ${design.imageOffsetY}px) scale(${design.imageZoom})`, filter: `blur(${design.imageBlur * .16}px) sepia(${design.imageVintage * .6}%)` }} /> : logo(data.teamId)}</div>
            <div className={s.performance} data-guide-section="hero">{text(bowling ? `${n(data.bowler.wickets)}/${n(data.bowler.runs)}` : `${n(data.batter.runs)}${data.batter.notOut ? '*' : ''}`, s.performanceValue, wide ? 40 : 72, wide ? 15 : 24)}{text(bowling ? t('WICKETS / RUNS', 'विकेट / रन') : t('INNINGS RUNS', 'इनिङ्स रन'), s.smallLabel, wide ? 4.5 : 7, 3.5)}</div>
            <div className={s.playerName} data-guide-section="player-name">{text(playerName || t('Player to confirm', 'खेलाडी पुष्टि हुन बाँकी'), s.fill, wide ? 13 : 21, wide ? 7 : 10, undefined, 'supporting')}</div>
            <div className={s.metrics} data-guide-section="metrics">{bowling ? bowlingFigures : allRound ? [...battingFigures.slice(0, 2), metric(t('WICKETS', 'विकेट'), n(data.bowler.wickets), 'wickets'), metric(t('RUNS CONCEDED', 'दिएको रन'), n(data.bowler.runs), 'conceded')] : battingFigures}</div>
        </div>{snapshot(bowling)}</div>;
    else if (family === 'innings') body = <div className={s.inningsBody}>{identity(data.teamId, t('COMPLETED INNINGS', 'समाप्त इनिङ्स'))}<div className={s.bigScore} data-guide-section="hero">{text(n(cricketScore(data.runs, data.wickets)), s.fill, wide ? 43 : 78, 24)}</div><div className={s.metrics} data-guide-section="metrics">{metric(t('OVERS', 'ओभर'), n(data.overs), 'overs')}{metric(t('RUN RATE', 'रन रेट'), n(runRate(data.runs, data.overs)), 'rr')}{metric(t('TARGET', 'लक्ष्य'), n(data.target), 'target')}</div><div className={s.inningsBatters} data-guide-section="batters">{[data.batter, data.secondBatter].filter(batter => batter.name.trim()).map((batter, index) => <div key={index}>{text(batter.name, s.batterName, wide ? 6 : 9, 4, 'innings-names')}{text(`${n(batter.runs)}${batter.notOut ? '*' : ''} (${n(batter.balls)})`, s.batterFigures, wide ? 8 : 12, 5, 'innings-figures')}</div>)}</div></div>;
    else if (family === 'target') {
        const equation = chaseEquation(data);
        body = <div className={s.targetBody}>{identity(data.teamId, data.template === 'dls' ? t('OFFICIAL REVISED TARGET', 'आधिकारिक संशोधित लक्ष्य') : t('CHASING TEAM', 'लक्ष्य पछ्याउने टोली'))}<div className={s.targetHero} data-guide-section="hero">{text(n(data.target), s.targetValue, wide ? 59 : 104, 28)}{text(t('RUNS TO WIN', 'जितका लागि रन'), s.smallLabel, wide ? 5 : 8, 4)}</div><div className={s.metrics} data-guide-section="metrics">{metric(t('ALLOTTED OVERS', 'निर्धारित ओभर'), n(data.oversLimit), 'limit')}{metric(t('NEEDED', 'आवश्यक रन'), equation ? n(equation.runs) : '—', 'needed')}{metric(t('BALLS LEFT', 'बाँकी बल'), equation ? n(equation.balls) : '—', 'balls')}{metric(t('REQ. RATE', 'आवश्यक दर'), equation ? n(equation.rate) : '—', 'rate')}</div><div className={s.targetSnapshot}>{snapshot()}</div></div>;
    } else if (family === 'status') body = <div className={s.statusBody}>{identity(data.teamId, `${teamName(opponent, data.language)} · ${data.matchDate}`)}<div className={s.statusMark} aria-hidden="true">{data.template === 'rain' ? '//' : '↗'}</div><div className={s.statusText} data-guide-section="status">{text(data.result || t('Status to confirm', 'अवस्था पुष्टि हुन बाँकी'), s.fill, wide ? 18 : 31, wide ? 8 : 13)}</div>{text(data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString(data.language === 'ne' ? 'ne-NP' : 'en-GB', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', hour12: false }) + ' NPT' : data.matchDate, s.statusTime, wide ? 5 : 8, 4)}</div>;
    else if (family === 'result') body = <div className={s.resultBody}><div className={s.resultMark} data-guide-section="identity"><div className={s.winnerCrest}>{logo(data.teamId)}</div>{text(teamName(team, data.language), s.winnerName, wide ? 12 : 20, 8)}</div><div className={s.resultStatus} data-guide-section="status">{text(data.result || t('Result to confirm', 'नतिजा पुष्टि हुन बाँकी'), s.fill, wide ? 11 : 19, 7)}</div><div className={s.resultScores} data-guide-section="snapshot">{resultScore(data.teamId, false)}{resultScore(data.opponentId, true)}</div></div>;
    else if (data.template === 'points-table') body = table(t('STANDINGS', 'अङ्क तालिका'), [t('TEAM', 'टोली'), 'P', 'W', 'L', 'PTS', 'NRR'], data.standings.map((row, index) => [<span className={s.tableTeam} data-team-badge={row.teamId} key={row.teamId}><span>{n(index + 1)}</span>{logo(row.teamId)}<b>{nplTeam(row.teamId).short}</b></span>, n(row.played), n(row.won), n(row.lost), n(row.points), n(row.nrr)]), 'standings');
    else body = <div className={s.scorecardBody}><div className={s.scorecardTop} data-guide-section="snapshot">{teamText(data.teamId, `${team.short} ${n(cricketScore(data.runs, data.wickets))}`, s.fill, wide ? 12 : 19, 7)}{text(`${n(data.overs)} ${t('OVERS', 'ओभर')}`, s.fill, wide ? 5 : 7, 4)}</div><div className={s.scoreTables} style={{ gridTemplateRows: wide ? '100%' : `minmax(0, ${Math.max(1, data.batting.length) + 2}fr) minmax(0, ${Math.max(1, data.bowling.length) + 2}fr)` }}>{table(`${team.short} · ${t('BATTING', 'ब्याटिङ')}`, [t('BATTER', 'ब्याटर'), 'R', 'B', 'SR'], data.batting.map(row => [row.name + (row.notOut ? '*' : ''), n(row.runs), n(row.balls), n(strikeRate(row.runs, row.balls))]), 'batting-table', data.teamId)}{table(`${opponent.short} · ${t('BOWLING', 'बलिङ')}`, [t('BOWLER', 'बलर'), 'O', 'R', 'W'], data.bowling.map(row => [row.name, n(row.overs), n(row.runs), n(row.wickets)]), 'bowling-table', data.opponentId)}</div></div>;
    return <div ref={ref} className={`${echo11FrameClass} ${base.artwork} ${s.artwork} ${paper ? base.paper : ''}`} style={{ width: 360, height, '--accent': design.accent } as CSSProperties} data-testid="post-artwork" data-echo11-credit="true" data-cricket-template={data.template} data-format={design.format} data-language={data.language} data-style={paper ? 'editorial' : 'stadium'} data-has-summary={Boolean(design.summary.trim() && !design.hiddenLayers.includes('supporting'))} data-coverage-family={family} data-managed-layout="true" data-export-error={issues.join(' ')}>
        <img className={base.background} src={paper ? '/studio/cricket/backgrounds/paper-001.jpg' : background.src} alt="" />
        {!player && design.imageUri && !design.hiddenLayers.includes('visual') && <div className={base.photo}><ArtworkPhoto design={design} height={height} /></div>}
        <div className={base.overlays}>{(['back', 'middle', 'front'] as const).map(layer => <ArtworkPlacedImages key={layer} layerFilter={layer} images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />)}</div><div className={base.scrim} />
        <div className={s.content} data-credit-content>
            <header className={base.header} data-guide-section="brand"><div className={base.brand}><img src="/studio/leaders.png" alt="The Leaders" /><span>THE LEADERS<small>{t('SPORTS DESK', 'खेलकुद डेस्क')}</small></span></div><CricketTournamentMark paper={paper} /></header>
            <div className={s.title} {...select('headline')} data-guide-section="headline">{text([data.matchLabel, data.matchDate].filter(Boolean).join(' · '), s.kicker, wide ? 4.5 : 6, 3.5)}{!design.hiddenLayers.includes('headline') && text(design.headline, s.headline, wide ? 22 : 32, wide ? 8 : 12, undefined, 'headline')}</div>
            <main className={s.body}>{body}</main>
            <div className={s.summary} {...select('supporting')} data-guide-section="summary">{design.summary.trim() && !design.hiddenLayers.includes('supporting') && text(design.summary, s.fill, wide ? 5.5 : 8, 4, undefined, 'supporting')}</div>

        </div>{guides && <div className={base.guides} aria-hidden="true" />}
    <Echo11Credit variant={design.echo11Variant} seed={design.headline} language={data.language} />
        </div>;
});
CoverageArtwork.displayName = 'CoverageArtwork';

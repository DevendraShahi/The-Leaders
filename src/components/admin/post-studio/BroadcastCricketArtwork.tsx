"use client";

import { cricketTeamIssues } from '@/lib/post-studio/cricket-team-context';
import { forwardRef, type CSSProperties, type ReactNode } from 'react';
import { blankCricketData, chaseEquation, cricketNumber, cricketScore, runRate, strikeRate } from '@/lib/post-studio/cricket-data';
import { cricketTemplate, nplTeam, teamLogo, teamName, type NplTeamId } from '@/lib/post-studio/cricket-catalog';
import { artworkTextStyle } from '@/lib/post-studio/artwork-text';
import { hasDevanagari } from '@/lib/post-studio/typography';
import { postOutputDimensions, type PostLayer, type PostTextLayer } from '@/lib/post-studio/types';
import type { CricketArtworkProps } from './CricketArtwork';
import { ArtworkPhoto } from './ArtworkPhoto';
import { ArtworkPlacedImages } from './ArtworkPlacedImages';
import s from './BroadcastCricketArtwork.module.css';

export const BroadcastCricketArtwork = forwardRef<HTMLDivElement, CricketArtworkProps>(({ design, selected, guides, onSelect, onChooseImage, selectedPlacedImageId, onSelectPlacedImage }, ref) => {
    const data = design.cricket ?? blankCricketData(), team = nplTeam(data.teamId), opponent = nplTeam(data.opponentId);
    const spec = cricketTemplate(data.template), layout = data.template === 'player-of-match' && data.awardPerformance === 'bowling' ? 'bowler' : spec.layout;
    const [w, h] = postOutputDimensions[design.format], height = 360 * h / w;
    const landscape = design.format === 'landscape', story = design.format === 'story', square = design.format === 'square';
    const paper = design.cricketStyle === 'editorial';
    const t = (en: string, ne: string) => data.language === 'ne' ? ne : en;
    const n = (value: number | string | null) => cricketNumber(value, data.language);
    const hide = (layer: PostLayer) => design.hiddenLayers.includes(layer);
    const photo = Boolean(design.imageUri && !hide('visual'));
    const score = n(cricketScore(data.runs, data.wickets)), opponentScore = n(cricketScore(data.opponentRuns, data.opponentWickets));
    const equation = chaseEquation(data);
    const select = (layer: PostLayer) => onSelect && !design.lockedLayers.includes(layer) ? {
        role: 'button', tabIndex: 0, 'aria-label': `Select ${layer === 'supporting' ? 'summary' : layer}`,
        onClick: () => onSelect(layer), onKeyDown: (event: React.KeyboardEvent) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); onSelect(layer); } },
        'data-selected': selected === layer || undefined,
    } : {};
    const type = (layer: PostTextLayer, size: number, content: string): CSSProperties => {
        const settings = design.textTypography[layer];
        const nepali = settings.font === 'hind' || hasDevanagari(content);
        const fontSize = size * (layer === 'headline' ? design.headlineScale : settings.size / 100);
        return { ...artworkTextStyle(design, layer, content), fontSize, fontFamily: nepali ? 'Hind_700Bold' : layer === 'headline' ? 'Onest_700Bold' : 'Onest_500Medium',
            lineHeight: `${fontSize * (nepali ? 1.7 : 1.3) * settings.lineSpacing / 100}px`, letterSpacing: nepali ? 0 : layer === 'headline' ? '-.04em' : undefined };
    };
    const logo = (id: NplTeamId, size: number) => {
        const uri = id === data.teamId ? data.teamLogoUri || teamLogo(id) : id === data.opponentId ? data.opponentLogoUri || teamLogo(id) : teamLogo(id);
        return <img className={s.crest} src={uri} alt={nplTeam(id).name} width={size} height={size} style={{ width: size * (data.logoScale ?? 100) / 100, height: size * (data.logoScale ?? 100) / 100 }} />;
    };
    const badge = (id: NplTeamId, size: number) => <div className={s.badge}>{logo(id, size)}{data.showTeamNameUnderLogo !== false && <strong data-export-fit>{teamName(nplTeam(id), data.language)}</strong>}</div>;
    const headline = !hide('headline') && <h2 {...select('headline')} className={s.headline} data-testid="artwork-headline" data-export-fit style={type('headline', landscape ? 20 : square ? 27 : 33, design.headline)}>{design.headline}</h2>;
    const hero = (value: ReactNode, content: string, size = 96) => !hide('headline') && <div {...select('headline')} data-export-fit className={s.hero} style={type('headline', (landscape ? size * .6 : square ? size * .8 : story ? size * 1.15 : size) * (data.heroScale ?? 100) / 100, content)}>{value}</div>;
    const stats = (values: [string, ReactNode][]) => <div className={s.stats}>{values.map(([label, value]) => <div key={label}><strong data-export-fit>{value}</strong><span>{label}</span></div>)}</div>;
    const scoreStrip = () => <div className={s.scoreStrip}><span>{layout === 'bowler' ? opponent.short : team.short}<strong>{layout === 'bowler' ? opponentScore : score}</strong><small>{n(layout === 'bowler' ? data.opponentOvers : data.overs)} {t('OV', 'ओभर')}</small></span><span className={s.opponent}>vs {layout === 'bowler' ? team.short : opponent.short}</span></div>;
    const player = (name: string) => !hide('supporting') && <h3 className={s.playerName} data-export-fit style={type('supporting', landscape ? 15 : 23, name)}>{name || t('Player name', 'खेलाडीको नाम')}</h3>;
    const date = data.matchDate ? new Intl.DateTimeFormat(data.language === 'ne' ? 'ne-NP' : 'en-GB', { timeZone: 'UTC', day: '2-digit', month: 'short' }).format(new Date(`${data.matchDate}T12:00:00Z`)) : t('Date to confirm', 'मिति पुष्टि हुन बाँकी');
    const when = <div className={s.when}><strong>{date}</strong><span>{data.startTime ? `${n(data.startTime)} NPT` : t('Time to confirm', 'समय पुष्टि हुन बाँकी')}</span><small>{data.venue}</small></div>;
    const renderBody = () => {
        switch (layout) {
            case 'versus': return <>{headline}<div className={s.matchup} data-export-fit><div className={s.teamHalf} style={{ '--side': team.primary } as CSSProperties}>{badge(data.teamId, landscape ? 62 : square ? 80 : 98)}</div><span className={s.versus}>VS</span><div className={s.teamHalf} style={{ '--side': opponent.primary } as CSSProperties}>{badge(data.opponentId, landscape ? 62 : square ? 80 : 98)}</div></div>{data.template === 'head-to-head' ? stats(data.statRows.map(row => [row.label, row.value])) : when}</>;
            case 'fixtures': return <>{headline}<div className={s.fixtures}>{data.fixtures.map((fixture, index) => <article key={index} className={s.fixture} data-export-fit><div className={s.fixtureTop}><b>{t('GAME', 'खेल')} {n(index + 1)}</b><span>{n(fixture.when)}</span></div><div className={s.fixturePair}>{badge(fixture.teamId, 40)}<i>VS</i>{badge(fixture.opponentId, 40)}</div><small>{fixture.venue}</small></article>)}</div></>;
            case 'lineup': return <>{headline}<div className={s.lineupIdentity}>{logo(data.teamId, landscape ? 24 : 36)}<strong>{teamName(team, data.language)}</strong><span>{n(data.lineup.length)} / {n(11)}</span></div><ol className={s.lineup}>{data.lineup.map((name, index) => <li key={index}><span>{n(String(index + 1).padStart(2, '0'))}</span><strong data-export-fit>{name}</strong></li>)}</ol></>;
            case 'score': return <>{headline}<div className={s.scoreMain}><div className={s.scoreTeam}>{logo(data.teamId, landscape ? 30 : 48)}<span>{teamName(team, data.language)}</span></div>{hero(score, score, 84)}<div className={s.inningsMeta}><span>{n(data.overs)} / {n(data.oversLimit)} {t('OVERS', 'ओभर')}</span><b>{t('RR', 'रन रेट')} {n(runRate(data.runs, data.overs))}</b></div></div><div className={s.batters}>{[data.batter, data.secondBatter].map((batter, index) => <div key={index}><span data-export-fit>{batter.name || '—'}</span><strong>{n(batter.runs)}{batter.notOut ? '*' : ''}<small> ({n(batter.balls)})</small></strong></div>)}</div>{equation && data.template !== 'innings' && <div className={s.chase}><strong>{n(equation.runs)}</strong><span>{t('NEEDED FROM', 'रन आवश्यक, बाँकी')}</span><strong>{n(equation.balls)}</strong><span>{t('BALLS', 'बल')}</span><small>{t('REQ', 'आवश्यक दर')} {n(equation.rate)}</small></div>}{data.template === 'innings' && data.target !== null && <div className={s.chase}>{t('TARGET', 'लक्ष्य')} <strong>{n(data.target)}</strong></div>}</>;
            case 'batter':
            case 'bowler': {
                const bowling = layout === 'bowler';
                const value = bowling ? `${n(data.bowler.wickets)}/${n(data.bowler.runs)}` : n(data.batter.runs);
                return <><div className={s.performanceTop}>{headline}{logo(data.teamId, landscape ? 28 : 42)}</div><div className={s.performanceHero}>{hero(<>{value}{!bowling && data.batter.notOut && <sup>*</sup>}</>, value, bowling ? 76 : 108)}{player(bowling ? data.bowler.name : data.batter.name)}</div>{bowling ? stats([[t('OVERS', 'ओभर'), n(data.bowler.overs)], [t('ECONOMY', 'इकोनोमी'), n(runRate(data.bowler.runs, data.bowler.overs))], [t('MAIDENS', 'मेडन'), n(data.bowler.maidens)]]) : stats([[t('BALLS', 'बल'), n(data.batter.balls)], [t('FOURS', 'चौका'), n(data.batter.fours)], [t('SIXES', 'छक्का'), n(data.batter.sixes)], [t('SR', 'स्ट्राइक रेट'), n(strikeRate(data.batter.runs, data.batter.balls))]])}{data.template === 'player-of-match' && data.awardPerformance === 'all-round' && stats([[t('WICKETS', 'विकेट'), n(data.bowler.wickets)], [t('RUNS CONCEDED', 'दिएको रन'), n(data.bowler.runs)]])}{scoreStrip()}</>;
            }
            case 'event': {
                const value = data.template === 'four' ? '4' : data.template === 'six' ? '6' : data.template === 'wicket' ? 'W' : data.template === 'partnership' ? n(data.partnershipRuns) : n(data.target);
                return <><div className={s.eventHeader}>{logo(data.teamId, landscape ? 26 : 40)}<span>{teamName(team, data.language)}</span></div><div className={s.eventHero}>{hero(value, value, 126)}{headline}</div><div className={s.eventDetail}>{['four', 'six', 'wicket', 'partnership'].includes(data.template) ? player(data.batter.name) : <span>{n(data.oversLimit)} {t('OVERS', 'ओभर')}{data.template === 'dls' ? ' · DLS' : ''}</span>}{data.template === 'wicket' && <p>{data.dismissal}<br />{t('Bowler', 'बलर')}: {data.bowler.name}</p>}{data.template === 'partnership' && <p>{data.secondBatter.name} · {n(data.partnershipBalls)} {t('balls', 'बल')}</p>}</div>{scoreStrip()}</>;
            }
            case 'result': return <>{headline}<div className={s.victory}>{badge(data.teamId, landscape ? 62 : square ? 70 : 100)}<div className={s.resultText} data-export-fit style={type('supporting', landscape ? 15 : square ? 21 : 27, data.result)}>{data.result || t('Result to confirm', 'नतिजा पुष्टि हुन बाँकी')}</div></div><div className={s.resultScores}>{[[team.short, score, data.overs], [opponent.short, opponentScore, data.opponentOvers]].map(([name, value, overs], index) => <div key={index}><span>{name}</span><strong data-export-fit>{value}</strong><small>{n(overs)} {t('OV', 'ओभर')}</small></div>)}</div></>;
            case 'team': return <>{headline}<div className={s.teamSpotlight}>{badge(data.teamId, landscape ? 70 : square ? 100 : 132)}{data.result && <div data-export-fit className={s.resultText} style={type('supporting', landscape ? 14 : 24, data.result)}>{data.result}</div>}</div>{data.template === 'team' && stats(data.statRows.map(row => [row.label, row.value]))}</>;
            case 'table': return <>{headline}{data.template === 'points-table' ? <table className={s.table}><thead><tr>{[t('TEAM', 'टोली'), 'P', 'W', 'L', 'PTS', 'NRR'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{data.standings.map((row, index) => <tr key={row.teamId} data-featured={row.teamId === data.teamId}><td><span>{n(index + 1)}</span>{logo(row.teamId, 18)}<b>{nplTeam(row.teamId).short}</b></td><td>{n(row.played)}</td><td>{n(row.won)}</td><td>{n(row.lost)}</td><td><b>{n(row.points)}</b></td><td>{n(row.nrr)}</td></tr>)}</tbody></table> : <><div className={s.cardScore}>{team.short} <strong>{score}</strong><span>{n(data.overs)} {t('OV', 'ओभर')}</span></div><div className={s.scoreTables}><section><h3>{t('BATTING', 'ब्याटिङ')}</h3><table className={s.table}><thead><tr><th>{t('PLAYER', 'खेलाडी')}</th><th>R</th><th>B</th><th>SR</th></tr></thead><tbody>{data.batting.map((row, index) => <tr key={index}><td><span data-export-fit>{row.name}</span></td><td>{n(row.runs)}{row.notOut ? '*' : ''}</td><td>{n(row.balls)}</td><td>{n(strikeRate(row.runs, row.balls))}</td></tr>)}</tbody></table></section><section><h3>{t('BOWLING', 'बलिङ')}</h3><table className={s.table}><thead><tr><th>{t('PLAYER', 'खेलाडी')}</th><th>O</th><th>R</th><th>W</th></tr></thead><tbody>{data.bowling.map((row, index) => <tr key={index}><td><span data-export-fit>{row.name}</span></td><td>{n(row.overs)}</td><td>{n(row.runs)}</td><td>{n(row.wickets)}</td></tr>)}</tbody></table></section></div></>}</>;
        }
    };
    const updated = data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString(data.language === 'ne' ? 'ne-NP' : 'en-GB', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', hour12: false }) : '';
    return <div ref={ref} className={`${s.artwork} ${paper ? s.paper : ''}`} data-testid="post-artwork" data-cricket-template={data.template} data-export-error={cricketTeamIssues(data).join(' ')} data-style={design.cricketStyle} data-format={design.format} data-layout={layout} data-language={data.language} data-photo={photo} style={{ width: 360, height, '--accent': design.accent, '--team': team.primary, '--opponent': opponent.primary, '--secondary': team.secondary, '--team-dark': team.dark, '--opponent-dark': opponent.dark, '--hero-scale': (data.heroScale ?? 100) / 100, textAlign: design.textAlign, ...(design.backgroundGradient ? { background: design.backgroundGradient } : {}), fontFamily: data.language === 'ne' ? 'Hind_400Regular' : 'Onest_400Regular' } as CSSProperties}>
        <img className={s.base} src={paper ? '/studio/cricket/backgrounds/paper-001.jpg' : '/studio/cricket/backgrounds/stadium-01.jpg'} alt="" aria-hidden="true" />
        <div className={s.photo}><ArtworkPhoto design={design} height={height} /></div>
        <div className={s.shade} />
        <ArtworkPlacedImages layerFilter="back" images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />
        <ArtworkPlacedImages layerFilter="middle" images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />
        <div className={s.inner}>
            <header className={s.masthead}><img src="/studio/leaders.png" alt="The Leaders" width={25} height={25} /><div><b>{data.competition}</b>{!hide('kicker') && <span {...select('kicker')} style={type('kicker', landscape ? 5 : 6, design.eyebrow)}>{design.eyebrow}</span>}</div><span className={s.edition}>{data.matchLabel || 'NPL'}</span></header>
            <main className={s.body} data-export-fit>{renderBody()}{!hide('supporting') && design.summary && <p {...select('supporting')} className={s.note} data-export-fit style={type('supporting', landscape ? 7 : 9, design.summary)}>{design.summary}</p>}</main>
            {!hide('footer') && <footer className={s.footer} {...select('footer')} style={type('footer', landscape ? 4.5 : 5.5, design.author)}><strong>{design.author}</strong><span>{updated ? `${updated} NPT` : data.matchDate || 'CRICKET'}</span></footer>}
        </div>
        <ArtworkPlacedImages layerFilter="front" images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />
        {guides && <div className={s.guides} aria-hidden="true" />}
        {onChooseImage && !photo && <button className={s.addPhoto} onClick={onChooseImage} aria-label="Add cricket photo">+ {t('PHOTO', 'फोटो')}</button>}
    </div>;
});
BroadcastCricketArtwork.displayName = 'BroadcastCricketArtwork';

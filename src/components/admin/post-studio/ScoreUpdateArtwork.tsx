"use client";

import { forwardRef, type CSSProperties } from 'react';
import { nplTeam, nplTournamentLogo, teamLogo, teamName, type NplTeamId } from '@/lib/post-studio/cricket-catalog';
import { blankCricketData, cricketNumber, cricketScore, runRate } from '@/lib/post-studio/cricket-data';
import { hasBatter, scoreState, scoreChase, scoreUpdateIssues } from '@/lib/post-studio/score-update';
import { matchdayBackgrounds } from '@/lib/post-studio/matchday';
import { postOutputDimensions, type PostLayer } from '@/lib/post-studio/types';
import { hasDevanagari } from '@/lib/post-studio/typography';
import type { CricketArtworkProps } from './CricketArtwork';
import { FittedArtworkText } from './FittedArtworkText';
import { ArtworkPhoto } from './ArtworkPhoto';
import { ArtworkPlacedImages } from './ArtworkPlacedImages';
import base from './FixturesArtwork.module.css';
import s from './ScoreUpdateArtwork.module.css';

export const ScoreUpdateArtwork = forwardRef<HTMLDivElement, CricketArtworkProps>(({ design, onSelect, selected, guides, selectedPlacedImageId, onSelectPlacedImage }, ref) => {
    const data = design.cricket ?? blankCricketData('score'), ne = data.language === 'ne';
    const wide = design.format === 'landscape', paper = design.cricketStyle === 'editorial';
    const [w, h] = postOutputDimensions[design.format], height = 360 * h / w;
    const t = (en: string, np: string) => ne ? np : en;
    const n = (value: string | number | null) => cricketNumber(value, data.language);
    const state = scoreState(data), equation = scoreChase(data);
    const batters = [data.batter, data.secondBatter].filter(hasBatter);
    const text = (value: string, className: string, max: number, min: number, group?: string, testId?: string) => <FittedArtworkText text={value} className={className} max={max} min={min} fitGroup={group} testId={testId} lineHeight={hasDevanagari(value) ? 1.65 : 1.3} style={{ fontFamily: hasDevanagari(value) ? 'Hind_700Bold' : 'Onest_700Bold' }} />;
    const select = (layer: PostLayer) => onSelect && !design.lockedLayers.includes(layer) ? {
        role: 'button', tabIndex: 0, 'aria-label': `Select ${layer}`, 'data-selected': selected === layer || undefined,
        onClick: () => onSelect(layer), onKeyDown: (event: React.KeyboardEvent) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); onSelect(layer); } },
    } : {};
    const background = matchdayBackgrounds.find(item => item.id === data.matchdayBackground) ?? matchdayBackgrounds[wide ? 0 : 4];
    const photo = Boolean(design.imageUri && !design.hiddenLayers.includes('visual'));
    const credit = [photo ? design.imageCredit : '', ...(design.placedImages ?? []).filter(image => !image.hidden).map(image => image.credit)].filter(Boolean).join(' · ');
    const source = data.sourceUrl || design.sourceUrls?.[0] || '';
    let host = ''; try { host = source ? new URL(source).hostname.replace(/^www\./, '') : ''; } catch { /* Preflight requests a source. */ }
    const updated = data.updatedAt && !Number.isNaN(Date.parse(data.updatedAt)) ? new Intl.DateTimeFormat(ne ? 'ne-NP' : 'en-GB', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(data.updatedAt)) : '';
    const badge = (id: NplTeamId, batting: boolean) => <div className={s.team}>
        <div className={s.crest}><img src={(batting ? data.teamLogoUri : data.opponentLogoUri) || teamLogo(id)} alt={nplTeam(id).name} style={{ transform: `scale(${Math.min(100, Math.max(60, data.logoScale ?? 100)) / 100})` }} /></div>
        <div className={s.teamIdentity}>{text(teamName(nplTeam(id), data.language), s.teamName, wide ? 9 : 12, wide ? 6 : 8, 'score-teams')}<span>{batting ? t('BATTING', 'ब्याटिङ') : t('OPPOSITION', 'प्रतिद्वन्द्वी')}</span></div>
    </div>;
    const status = state === 'target-reached' ? t('TARGET REACHED', 'लक्ष्य पूरा') : state === 'all-out' ? t('ALL OUT', 'अलआउट') : state === 'overs-complete' ? t('OVERS COMPLETE', 'ओभर पूरा') : data.scoreInnings === 'first' ? t('FIRST INNINGS', 'पहिलो इनिङ्स') : data.scoreInnings === 'chase' ? t('TARGET TO CONFIRM', 'लक्ष्य पुष्टि हुन बाँकी') : t('INNINGS TO CONFIRM', 'इनिङ्स पुष्टि हुन बाँकी');
    return <div ref={ref} className={`${base.artwork} ${s.artwork} ${paper ? base.paper : ''}`} style={{ width: 360, height, '--accent': design.accent } as CSSProperties} data-testid="post-artwork" data-cricket-template="score" data-format={design.format} data-language={data.language} data-layout="score-update" data-managed-layout="true" data-export-error={scoreUpdateIssues(design).join(' ')}>
        <img className={base.background} src={paper ? '/studio/cricket/backgrounds/paper-001.jpg' : background.src} alt="" />
        {photo && <div className={base.photo}><ArtworkPhoto design={design} height={height} /></div>}
        <div className={base.overlays}>{(['back', 'middle', 'front'] as const).map(layer => <ArtworkPlacedImages key={layer} layerFilter={layer} images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />)}</div><div className={base.scrim} />
        <div className={s.content}>
            <header className={base.header}><div className={base.brand}><img src="/studio/leaders.png" alt="The Leaders" /><span>THE LEADERS<small>{t('SPORTS DESK', 'खेलकुद डेस्क')}</small></span></div><img className={base.npl} src={nplTournamentLogo} alt="Nepal Premier League" /></header>
            <div className={s.title} {...select('headline')}>{text([data.matchLabel, data.matchDate].filter(Boolean).join(' · '), s.matchLabel, wide ? 5 : 6, 4)}{!design.hiddenLayers.includes('headline') && text(design.headline, s.headline, wide ? 22 : 29, wide ? 11 : 16, undefined, 'artwork-headline')}</div>
            <div className={s.teams} {...select('visual')}>{badge(data.teamId, true)}{badge(data.opponentId, false)}</div>
            <main className={s.scoreBlock} data-export-fit>{text(n(cricketScore(data.runs, data.wickets)), s.hero, wide ? 55 : 90, wide ? 25 : 35, undefined, 'score-value')}<div className={s.metrics}>{text(`${t('OVERS', 'ओभर')} ${n(data.overs)} / ${n(data.oversLimit)}`, s.metric, wide ? 7 : 10, wide ? 5.5 : 7)}{text(`${t('RUN RATE', 'रन रेट')} ${n(runRate(data.runs, data.overs))}`, s.metricRight, wide ? 7 : 10, wide ? 5.5 : 7)}</div></main>
            <div className={s.batters}>{batters.map((batter, index) => <div key={index} className={s.batter}>{text(batter.name || t('Batter to confirm', 'ब्याटर पुष्टि हुन बाँकी'), s.batterName, wide ? 8 : 10, wide ? 5 : 6, 'score-batters')}{text(`${n(batter.runs)}${batter.notOut ? '*' : ''} (${n(batter.balls)})`, s.batterScore, wide ? 12 : 17, wide ? 7 : design.format === 'square' ? 8 : 11, 'score-batter-values')}</div>)}{!batters.length && <span className={s.optionalNote}>{t('TEAM SCORE SNAPSHOT', 'टोलीको स्कोर अपडेट')}</span>}</div>
            <div className={s.chase}>{equation ? <>{text(`${n(equation.runs)} ${t('NEEDED FROM', 'रन आवश्यक, बाँकी')} ${n(equation.balls)} ${t('BALLS', 'बल')}`, s.chaseMain, wide ? 12 : 17, wide ? 7 : 10)}{text(`${t('TARGET', 'लक्ष्य')} ${n(data.target)} · ${t('REQ. RATE', 'आवश्यक रन रेट')} ${n(equation.rate)}`, s.chaseMeta, wide ? 5 : 7, wide ? 4 : 5)}</> : text(status, s.status, wide ? 13 : 20, wide ? 8 : 12)}</div>
            <div className={s.source}>{text([host ? `${t('SOURCE', 'स्रोत')} · ${host}` : t('SOURCE TO CONFIRM', 'स्रोत पुष्टि हुन बाँकी'), updated ? `${updated} NPT` : ''].filter(Boolean).join(' · '), s.sourceText, wide ? 5 : 6, wide ? 4 : 5)}</div>
            <div className={s.summary} {...select('supporting')}>{!design.hiddenLayers.includes('supporting') && design.summary && text(design.summary, s.summaryText, wide ? 6 : 8, wide ? 4 : 6)}</div>
            <footer className={base.footer} {...select('footer')}>{text(design.hiddenLayers.includes('footer') ? '' : design.author, base.author, wide ? 4.5 : 6, 3.5)}{text('NPL 2026 | Cricket', base.footerLabel, wide ? 4.5 : 6, 3.5)}{credit && text(credit, base.credit, 4, 3)}</footer>
        </div>{guides && <div className={base.guides} aria-hidden="true" />}
    </div>;
});
ScoreUpdateArtwork.displayName = 'ScoreUpdateArtwork';

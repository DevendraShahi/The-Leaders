"use client";

import { CricketTournamentMark } from './CricketTournamentMark';

import { Echo11Credit, echo11FrameClass } from './Echo11Credit';

import { forwardRef, type CSSProperties } from 'react';
import { blankCricketData, cricketNumber, cricketScore } from '@/lib/post-studio/cricket-data';
import { nplTeam, teamLogo, teamName, type NplTeamId } from '@/lib/post-studio/cricket-catalog';
import { coverageIssues } from '@/lib/post-studio/coverage-posts';
import { matchdayBackgrounds } from '@/lib/post-studio/matchday';
import { postOutputDimensions, type PostLayer, type PostTextLayer } from '@/lib/post-studio/types';
import { hasDevanagari } from '@/lib/post-studio/typography';
import { ArtworkPhoto } from './ArtworkPhoto';
import { ArtworkPlacedImages } from './ArtworkPlacedImages';
import { FittedArtworkText } from './FittedArtworkText';
import type { CricketArtworkProps } from './CricketArtwork';
import base from './FixturesArtwork.module.css';
import s from './VictoryArtwork.module.css';

export const VictoryArtwork = forwardRef<HTMLDivElement, CricketArtworkProps>(({ design, onSelect, selected, guides, selectedPlacedImageId, onSelectPlacedImage }, ref) => {
    const data = design.cricket ?? blankCricketData('result');
    const wide = design.format === 'landscape', paper = design.cricketStyle === 'editorial', ne = data.language === 'ne';
    const [width, outputHeight] = postOutputDimensions[design.format], height = 360 * outputHeight / width;
    const ink = paper ? '#12282e' : '#fff9ed';
    const t = (en: string, np: string) => ne ? np : en;
    const n = (value: number | string | null) => cricketNumber(value, data.language);
    const text = (value: string, className: string, max: number, min: number, group?: string, layer?: PostTextLayer) => {
        const typography = layer ? design.textTypography[layer] : undefined;
        const devanagari = hasDevanagari(value) || typography?.font === 'hind';
        return <FittedArtworkText text={value} className={className} max={max * (typography ? typography.size / 100 : 1)} min={min} fitGroup={group} lineHeight={devanagari ? 1.6 : 1.2} style={{ fontFamily: devanagari ? 'Hind_700Bold' : 'Onest_700Bold', color: layer ? design.textColors[layer] ?? undefined : undefined }} />;
    };
    const select = (layer: PostLayer) => onSelect && !design.lockedLayers.includes(layer) ? { role: 'button', tabIndex: 0, 'aria-label': `Select ${layer}`, 'data-selected': selected === layer || undefined, onClick: () => onSelect(layer), onKeyDown: (event: React.KeyboardEvent) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); onSelect(layer); } } } : {};
    const logo = (id: NplTeamId) => <img src={(id === data.teamId ? data.teamLogoUri : id === data.opponentId ? data.opponentLogoUri : null) || teamLogo(id)} alt={teamName(nplTeam(id), data.language)} />;
    const background = matchdayBackgrounds.find(item => item.id === data.matchdayBackground) ?? matchdayBackgrounds[wide ? 0 : 4];
    const score = (id: NplTeamId, opposition: boolean) => <section className={s.innings} data-featured={!opposition || undefined} aria-label={teamName(nplTeam(id), data.language)}>
        <div className={s.scoreIdentity} data-team-badge={id}>{logo(id)}{text(teamName(nplTeam(id), data.language), s.scoreTeam, wide ? 6 : 9, 3.5, 'victory-score-teams')}</div>
        {text(n(cricketScore(opposition ? data.opponentRuns : data.runs, opposition ? data.opponentWickets : data.wickets)), s.scoreValue, wide ? 24 : 35, wide ? 10 : 14, 'victory-scores')}
        {text(`${n(opposition ? data.opponentOvers : data.overs)} ${t('OVERS', 'ओभर')}`, s.scoreOvers, wide ? 4.5 : 6, 3.5)}
    </section>;
    return <div ref={ref} className={`${echo11FrameClass} ${base.artwork} ${s.artwork} ${paper ? base.paper : ''}`} style={{ width: 360, height, '--accent': design.accent } as CSSProperties} data-testid="post-artwork" data-echo11-credit="true" data-cricket-template="result" data-format={design.format} data-language={data.language} data-style={paper ? 'editorial' : 'stadium'} data-managed-layout="true" data-coverage-family="result" data-has-summary={Boolean(design.summary.trim() && !design.hiddenLayers.includes('supporting'))} data-export-error={coverageIssues(design).join(' ')}>
        <img className={base.background} src={paper ? '/studio/cricket/backgrounds/paper-001.jpg' : background.src} alt="" />
        {design.imageUri && !design.hiddenLayers.includes('visual') && <div className={base.photo}><ArtworkPhoto design={design} height={height} /></div>}
        <div className={base.overlays}>{(['back', 'middle', 'front'] as const).map(layer => <ArtworkPlacedImages key={layer} layerFilter={layer} images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />)}</div>
        <div className={base.scrim} /><div className={s.atmosphere} aria-hidden="true" />
        <div className={s.content} data-credit-content>
            <header className={base.header} data-guide-section="brand"><div className={base.brand}><img src="/studio/leaders.png" alt="The Leaders" /><span>THE LEADERS<small>{t('SPORTS DESK', 'खेलकुद डेस्क')}</small></span></div><CricketTournamentMark paper={paper} /></header>
            <div className={s.context}>{text([data.matchLabel, data.matchDate, data.venue].filter(Boolean).join(' · '), s.fill, wide ? 4.5 : 6, 3.5)}</div>
            <main className={s.hero} data-guide-section="identity">
                {!design.hiddenLayers.includes('headline') && <div className={s.headline} {...select('headline')} data-guide-section="headline">
                    <svg viewBox="0 0 420 180" role="img" aria-label={design.headline} data-testid="artwork-headline">
                        {[2, 1].map(step => <text key={step} x={5 + step * 3} y={145 - step * 16} fontFamily={hasDevanagari(design.headline) ? 'Hind_700Bold' : 'Onest_700Bold'} fontSize="105" fontWeight="700" textLength="410" lengthAdjust="spacingAndGlyphs" fill="none" stroke={ink} strokeWidth=".8" opacity={step === 2 ? .18 : .32} aria-hidden="true">{design.headline}</text>)}
                        <text x="5" y="145" fontFamily={hasDevanagari(design.headline) ? 'Hind_700Bold' : 'Onest_700Bold'} fontSize="105" fontWeight="700" textLength="410" lengthAdjust="spacingAndGlyphs" fill={ink} opacity=".9" aria-hidden="true">{design.headline}</text>
                    </svg>
                </div>}
                <div className={s.crest} {...select('visual')}>{logo(data.teamId)}</div>
                <div className={s.winnerCopy}>
                    {text(teamName(nplTeam(data.teamId), data.language), s.winnerName, wide ? 17 : 26, wide ? 8 : 11, undefined, 'supporting')}
                    <section className={s.result} data-guide-section="status" aria-label={t('Match result', 'खेलको नतिजा')}>{text(data.result, s.resultText, wide ? 11 : 19, wide ? 5 : 8)}</section>
                </div>
            </main>
            <div className={s.scores} data-guide-section="snapshot" data-export-fit>{score(data.teamId, false)}{score(data.opponentId, true)}</div>
            <div className={s.summary} {...select('supporting')} data-guide-section="summary">{design.summary.trim() && !design.hiddenLayers.includes('supporting') && text(design.summary, s.fill, wide ? 5 : 7, 3.5, undefined, 'supporting')}</div>

        </div>{guides && <div className={base.guides} aria-hidden="true" />}
    <Echo11Credit variant={design.echo11Variant} seed={design.headline} language={data.language} />
        </div>;
});
VictoryArtwork.displayName = 'VictoryArtwork';

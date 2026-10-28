"use client";

import { CricketTournamentMark } from './CricketTournamentMark';

import { Echo11Credit, echo11FrameClass } from './Echo11Credit';

import { forwardRef, type CSSProperties } from 'react';
import { nplTeam, teamLogo, teamName } from '@/lib/post-studio/cricket-catalog';
import { blankCricketData, cricketNumber, cricketScore } from '@/lib/post-studio/cricket-data';
import { bowlerCreditedTypes, momentIssues } from '@/lib/post-studio/moment-posts';
import { matchingPortraitFor, playerPhotoSubject, portraitIsCurrent } from '@/lib/post-studio/player-portraits';
import { matchdayBackgrounds } from '@/lib/post-studio/matchday';
import { postOutputDimensions, type PostLayer } from '@/lib/post-studio/types';
import { hasDevanagari } from '@/lib/post-studio/typography';
import { FittedArtworkText } from './FittedArtworkText';
import { EventTypography } from './EventTypography';
import { ArtworkPlacedImages } from './ArtworkPlacedImages';
import type { CricketArtworkProps } from './CricketArtwork';
import base from './FixturesArtwork.module.css';
import s from './MomentArtwork.module.css';

export const MomentArtwork = forwardRef<HTMLDivElement, CricketArtworkProps>(({ design, onSelect, selected, guides, selectedPlacedImageId, onSelectPlacedImage }, ref) => {
    const data = design.cricket ?? blankCricketData('four'), ne = data.language === 'ne', wide = design.format === 'landscape';
    const wicket = data.template === 'wicket', paper = design.cricketStyle === 'editorial';
    const [w, h] = postOutputDimensions[design.format], height = 360 * h / w;
    const t = (en: string, np: string) => ne ? np : en;
    const n = (value: string | number | null) => cricketNumber(value, data.language);
    const text = (value: string, className: string, max: number, min: number, group?: string, testId?: string, captionLineHeight?: number) => <FittedArtworkText text={value} className={className} max={max} min={min} fitGroup={group} testId={testId} lineHeight={captionLineHeight ?? (hasDevanagari(value) ? 1.65 : 1.3)} style={{ fontFamily: hasDevanagari(value) ? 'Hind_700Bold' : 'Onest_700Bold' }} />;
    const select = (layer: PostLayer) => onSelect && !design.lockedLayers.includes(layer) ? { role: 'button', tabIndex: 0, 'aria-label': `Select ${layer}`, 'data-selected': selected === layer || undefined, onClick: () => onSelect(layer), onKeyDown: (event: React.KeyboardEvent) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); onSelect(layer); } } } : {};
    const subject = playerPhotoSubject(design), currentPhoto = portraitIsCurrent(design);
    const photo = Boolean(design.imageUri && data.showPlayerPhoto !== false && !design.hiddenLayers.includes('visual') && currentPhoto);
    const background = matchdayBackgrounds.find(item => item.id === data.matchdayBackground) ?? matchdayBackgrounds[wide ? 0 : 4];
    const credited = wicket && data.wicketType && bowlerCreditedTypes.includes(data.wicketType);
    const portraitsVisible = data.showPlayerPhoto !== false && !design.hiddenLayers.includes('visual');
    const batterFigures = wicket && data.batter.runs !== null && data.batter.balls !== null ? ` ${n(data.batter.runs)} (${n(data.batter.balls)})` : '';
    const wicketPhoto = (role: 'bowler' | 'batter') => {
        if (!portraitsVisible || (role === 'bowler' && !credited)) return null;
        if (subject?.role === role && design.imageUri && currentPhoto) return design.imageUri;
        return matchingPortraitFor(data[role].name, role === 'bowler' ? data.opponentId : data.teamId)?.photo?.url ?? null;
    };
    const wicketPlayer = (role: 'bowler' | 'batter') => {
        const uri = wicketPhoto(role), id = role === 'bowler' ? data.opponentId : data.teamId;
        const custom = uri && uri === design.imageUri && subject?.role === role && currentPhoto;
        return <section className={s.wicketPlayer} data-testid={role === 'bowler' ? 'moment-featured-player' : 'wicket-dismissed-player'} data-player-role={role === 'bowler' && !credited ? 'fielding' : role} aria-label={role === 'batter' ? `${t('OUT', 'आउट')} · ${data.batter.name}` : credited ? `${t('BOWLER', 'बलर')} · ${data.bowler.name}` : teamName(nplTeam(id), data.language)}>
            <div className={s.wicketImage}>
                <img data-testid={uri ? `wicket-${role}-photo` : undefined} src={uri || teamLogo(id)} alt={uri ? data[role].name : teamName(nplTeam(id), data.language)} style={custom ? { objectFit: design.imageFit, transform: `translate(${design.imageOffsetX}px,${design.imageOffsetY}px) scale(${design.imageZoom})`, filter: `blur(${design.imageBlur * .16}px) sepia(${design.imageVintage * .6}%)${role === 'batter' ? ' grayscale(1)' : ''}` } : { objectFit: 'contain', ...(role === 'batter' ? { filter: 'grayscale(1)' } : {}) }} />
            </div>
            <div className={s.wicketCaption}>
            {text(role === 'batter' ? `${t('OUT', 'आउट')} ` : credited ? `${t('BOWLER', 'बलर')} ` : t('FIELDING TEAM', 'फिल्डिङ टोली'), s.wicketRole, wide ? 4 : 5.5, 3)}
            {text(role === 'batter' ? data.batter.name.trim() : credited ? data.bowler.name.trim() : teamName(nplTeam(id), data.language), s.wicketName, wide ? role === 'bowler' ? 9.5 : 8 : role === 'bowler' ? 16 : 12, wide ? 5 : role === 'bowler' ? 7 : 6, `wicket-${role}-name`, undefined, hasDevanagari(data[role].name) ? 1.5 : 1.15)}
            {text(role === 'batter' ? batterFigures : credited ? teamName(nplTeam(id), data.language) : '', s.wicketFact, wide ? role === 'batter' ? 10 : 5 : role === 'batter' ? 20 : 8, wide ? 3.5 : 4.5, undefined, undefined, ne ? 1.5 : 1.15)}
            </div>
        </section>;
    };
    const issues = [...momentIssues(design), ...(!currentPhoto && design.imageUri && data.showPlayerPhoto !== false && !design.hiddenLayers.includes('visual') ? ['The selected portrait no longer matches this player and team. Choose a matching player photo or clear it.'] : [])];
    return <div ref={ref} className={`${echo11FrameClass} ${base.artwork} ${s.artwork} ${paper ? base.paper : ''}`} style={{ width: 360, height, '--accent': design.accent } as CSSProperties} data-testid="post-artwork" data-echo11-credit="true" data-cricket-template={data.template} data-format={design.format} data-language={data.language} data-layout="match-moment" data-style={paper ? 'editorial' : 'stadium'} data-photo={photo} data-has-summary={Boolean(design.summary.trim() && !design.hiddenLayers.includes('supporting'))} data-featured-role={subject?.role} data-managed-layout="true" data-export-error={issues.join(' ')}>
        <img className={base.background} src={paper ? '/studio/cricket/backgrounds/paper-001.jpg' : background.src} alt="" />
        <div className={base.overlays}>{(['back', 'middle', 'front'] as const).map(layer => <ArtworkPlacedImages key={layer} layerFilter={layer} images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />)}</div><div className={base.scrim} />
        <div className={s.content} data-credit-content>
            <header className={base.header}><div className={base.brand}><img src="/studio/leaders.png" alt="The Leaders" /><span>THE LEADERS<small>{t('SPORTS DESK', 'खेलकुद डेस्क')}</small></span></div><CricketTournamentMark paper={paper} /></header>
            <div className={s.title} {...select('headline')}>{text([data.matchLabel, data.matchDate, wicket ? data.venue : ''].filter(Boolean).join(' · '), s.matchLabel, wide ? 5 : 6, 4)}{!wicket && !design.hiddenLayers.includes('headline') && text(design.headline, s.headline, wide ? 26 : 39, wide ? 9 : 16, undefined, 'artwork-headline')}</div>
            {wicket ? <main className={s.wicketPlayers} {...select('visual')}>
                {!design.hiddenLayers.includes('headline') && <div className={s.wicketWatermark} {...select('headline')}>
                    <svg viewBox="0 0 420 170" role="img" aria-label={design.headline} data-testid="artwork-headline" className={s.wicketWord}>
                        {[2, 1].map(step => <text key={step} x={5 + step * 3} y={145 - step * 16} fontFamily={hasDevanagari(design.headline) ? 'Hind_700Bold' : 'Onest_700Bold'} fontWeight="700" fontSize="105" textLength="410" lengthAdjust="spacingAndGlyphs" fill="none" stroke={paper ? '#12282e' : '#fff9ed'} strokeWidth=".8" opacity={step === 2 ? .3 : .5} aria-hidden="true">{design.headline}</text>)}
                        <text x="5" y="145" fontFamily={hasDevanagari(design.headline) ? 'Hind_700Bold' : 'Onest_700Bold'} fontWeight="700" fontSize="105" textLength="410" lengthAdjust="spacingAndGlyphs" fill={paper ? '#12282e' : '#fff9ed'} aria-hidden="true">{design.headline}</text>
                    </svg>
                </div>}
                {wicketPlayer('bowler')}
                {wicketPlayer('batter')}
            </main> : <main className={s.feature} data-export-fit>
                <div className={s.event} aria-label={wicket ? t('Wicket', 'विकेट') : t('Boundary runs', 'बाउन्ड्री रन')}>
                    <EventTypography value={wicket ? 'W' : n(data.template === 'six' ? 6 : 4)} wicket={wicket} nepali={ne} paper={paper} accent={design.accent} className={s.eventGlyph} />
                    {text(wicket ? t('WICKET', 'विकेट') : t('RUNS', 'रन'), s.markerLabel, wide ? 4 : 6, 3)}
                </div>
                <div className={s.portrait} {...select('visual')}>{photo ? <img data-testid="moment-player-photo" src={design.imageUri!} alt={subject?.name || 'Player portrait'} style={{ objectFit: design.imageFit, transform: `translate(${design.imageOffsetX}px,${design.imageOffsetY}px) scale(${design.imageZoom})`, filter: `blur(${design.imageBlur * .16}px) sepia(${design.imageVintage * .6}%)` }} /> : <div className={s.fallback}><img src={teamLogo(subject?.teamId ?? data.teamId)} alt={nplTeam(subject?.teamId ?? data.teamId).name} /></div>}</div>
                <div className={s.details} data-testid="moment-featured-player">
                    {text(data.batter.name.trim(), s.playerName, wide ? 9 : 16, wide ? 5 : 8)}
                    {text(teamName(nplTeam(data.teamId), data.language), s.detailText, wide ? 5 : 8, wide ? 3.5 : 4.5)}
                </div>
            </main>}
            <div className={s.score} data-export-fit>
                <div className={s.scoreTeam} data-team-badge={data.teamId}>
                    <img src={data.teamLogoUri || teamLogo(data.teamId)} alt={teamName(nplTeam(data.teamId), data.language)} />
                    {text(`${nplTeam(data.teamId).short} ${n(cricketScore(data.runs, data.wickets))}`, s.scoreValue, wide ? 16 : wicket ? 33 : 25, wide ? 8 : 12)}
                </div>
                {wicket ? <section className={s.wicketScoreMeta} aria-label={t('Dismissal details', 'विकेटको विवरण')}>
                    {text(`${n(data.overs)} ${t('OVERS', 'ओभर')}`, s.overs, wide ? 5 : 7, wide ? 4 : 5)}
                    {text(data.dismissal.trim(), s.dismissalText, wide ? 5 : 7, wide ? 3.5 : 4)}
                </section> : text(`${n(data.overs)} ${t('OVERS', 'ओभर')}`, s.overs, wide ? 5 : 7, wide ? 4 : 5)}
            </div>
            {wicket && <div className={s.dismissalSpacer} />}
            <div className={s.summary} {...select('supporting')}>{!design.hiddenLayers.includes('supporting') && design.summary.trim() && text(design.summary, s.summaryText, wide ? 5 : 7, wide ? 4 : 5)}</div>

        </div>{guides && <div className={base.guides} aria-hidden="true" />}
    <Echo11Credit variant={design.echo11Variant} seed={design.headline} language={data.language} />
        </div>;
});
MomentArtwork.displayName = 'MomentArtwork';

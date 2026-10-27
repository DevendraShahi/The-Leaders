"use client";

import { forwardRef, type CSSProperties } from 'react';
import { nplTeam, nplTournamentLogo, teamLogo, teamName } from '@/lib/post-studio/cricket-catalog';
import { blankCricketData, cricketNumber, cricketScore } from '@/lib/post-studio/cricket-data';
import { bowlerCreditedTypes, momentIssues } from '@/lib/post-studio/moment-posts';
import { playerPhotoSubject, portraitIsCurrent } from '@/lib/post-studio/player-portraits';
import { matchdayBackgrounds } from '@/lib/post-studio/matchday';
import { postOutputDimensions, type PostLayer } from '@/lib/post-studio/types';
import { hasDevanagari } from '@/lib/post-studio/typography';
import { FittedArtworkText } from './FittedArtworkText';
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
    const text = (value: string, className: string, max: number, min: number, group?: string, testId?: string) => <FittedArtworkText text={value} className={className} max={max} min={min} fitGroup={group} testId={testId} lineHeight={hasDevanagari(value) ? 1.65 : 1.3} style={{ fontFamily: hasDevanagari(value) ? 'Hind_700Bold' : 'Onest_700Bold' }} />;
    const select = (layer: PostLayer) => onSelect && !design.lockedLayers.includes(layer) ? { role: 'button', tabIndex: 0, 'aria-label': `Select ${layer}`, 'data-selected': selected === layer || undefined, onClick: () => onSelect(layer), onKeyDown: (event: React.KeyboardEvent) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); onSelect(layer); } } } : {};
    const subject = playerPhotoSubject(design), currentPhoto = portraitIsCurrent(design);
    const photo = Boolean(design.imageUri && data.showPlayerPhoto !== false && !design.hiddenLayers.includes('visual') && currentPhoto);
    const background = matchdayBackgrounds.find(item => item.id === data.matchdayBackground) ?? matchdayBackgrounds[wide ? 0 : 4];
    const credited = wicket && data.wicketType && bowlerCreditedTypes.includes(data.wicketType);
    const credit = [photo ? design.imageCredit : '', ...(design.placedImages ?? []).filter(image => !image.hidden).map(image => image.credit)].filter(Boolean).join(' · ');
    const source = data.sourceUrl || design.sourceUrls?.[0] || '';
    let host = ''; try { host = source ? new URL(source).hostname.replace(/^www\./, '') : ''; } catch { /* Preflight requests a source. */ }
    const issues = [...momentIssues(design), ...(!currentPhoto && design.imageUri && data.showPlayerPhoto !== false ? ['The selected portrait no longer matches this player and team. Choose a matching player photo or clear it.'] : [])];
    return <div ref={ref} className={`${base.artwork} ${s.artwork} ${paper ? base.paper : ''}`} style={{ width: 360, height, '--accent': design.accent } as CSSProperties} data-testid="post-artwork" data-cricket-template={data.template} data-format={design.format} data-language={data.language} data-layout="match-moment" data-photo={photo} data-managed-layout="true" data-export-error={issues.join(' ')}>
        <img className={base.background} src={paper ? '/studio/cricket/backgrounds/paper-001.jpg' : background.src} alt="" />
        <div className={base.overlays}>{(['back', 'middle', 'front'] as const).map(layer => <ArtworkPlacedImages key={layer} layerFilter={layer} images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />)}</div><div className={base.scrim} />
        <div className={s.content}>
            <header className={base.header}><div className={base.brand}><img src="/studio/leaders.png" alt="The Leaders" /><span>THE LEADERS<small>{t('SPORTS DESK', 'खेलकुद डेस्क')}</small></span></div><img className={base.npl} src={nplTournamentLogo} alt="Nepal Premier League" /></header>
            <div className={s.title} {...select('headline')}>{text([data.matchLabel, data.matchDate].filter(Boolean).join(' · '), s.matchLabel, wide ? 5 : 6, 4)}{!design.hiddenLayers.includes('headline') && text(design.headline, s.headline, wide ? 26 : 39, wide ? 9 : 16, undefined, 'artwork-headline')}</div>
            <main className={s.feature} data-export-fit>
                <div className={s.event}>{text(wicket ? 'W' : n(data.template === 'six' ? 6 : 4), s.hero, wide ? 86 : 145, wide ? 40 : 50)}{text(wicket ? t('WICKET FALLS', 'विकेट पतन') : t('OFF THE BAT', 'ब्याटबाट'), s.eventLabel, wide ? 5 : 7, wide ? 4 : 5)}</div>
                <div className={s.portrait} {...select('visual')}>{photo ? <img data-testid="moment-player-photo" src={design.imageUri!} alt={subject?.name || 'Player portrait'} style={{ objectFit: design.imageFit, transform: `translate(${design.imageOffsetX}px,${design.imageOffsetY}px) scale(${design.imageZoom})`, filter: `blur(${design.imageBlur * .16}px) sepia(${design.imageVintage * .6}%)` }} /> : <div className={s.fallback}><img src={teamLogo(subject?.teamId ?? data.teamId)} alt={nplTeam(subject?.teamId ?? data.teamId).name} />{text(t('TEAM MOMENT', 'टोलीको क्षण'), s.fallbackLabel, wide ? 5 : 7, 4)}</div>}</div>
            </main>
            <div className={s.details}>
                {text(wicket ? `${t('OUT', 'आउट')} · ${data.batter.name || t('Batter to confirm', 'ब्याटर पुष्टि हुन बाँकी')}` : data.batter.name || t('Batter to confirm', 'ब्याटर पुष्टि हुन बाँकी'), s.playerName, wide ? 9 : 16, wide ? 8 : 11)}
                {text(wicket ? [data.dismissal, credited && data.bowler.name ? `${t('BOWLER', 'बलर')} · ${data.bowler.name}` : ''].filter(Boolean).join(' · ') : `${teamName(nplTeam(data.teamId), data.language)} vs ${teamName(nplTeam(data.opponentId), data.language)}`, s.detailText, wide ? 6 : 9, wide ? 5 : 6)}
                {photo && wicket && subject?.role === 'bowler' && text(`${t('PICTURED', 'तस्बिरमा')} · ${subject.name}`, s.photoLabel, wide ? 4.5 : 6, wide ? 4 : 5)}
            </div>
            <div className={s.score}>{text(`${nplTeam(data.teamId).short} ${n(cricketScore(data.runs, data.wickets))}`, s.scoreValue, wide ? 16 : 25, wide ? 10 : 15)}{text(`${n(data.overs)} ${t('OVERS', 'ओभर')} · ${t('AFTER THE EVENT', 'घटनापछिको स्कोर')}`, s.overs, wide ? 5 : 7, wide ? 4 : 5)}</div>
            <div className={s.source}>{text(host ? `${t('SOURCE', 'स्रोत')} · ${host}` : t('SOURCE TO CONFIRM', 'स्रोत पुष्टि हुन बाँकी'), s.sourceText, wide ? 4.5 : 6, wide ? 3.5 : 4.5)}</div>
            <div className={s.summary} {...select('supporting')}>{!design.hiddenLayers.includes('supporting') && design.summary && text(design.summary, s.summaryText, wide ? 5 : 7, wide ? 4 : 5)}</div>
            <div className={s.credit}>{credit && text(credit, s.creditText, wide ? 3.5 : 4.5, wide ? 2.8 : 3)}</div>
            <footer className={base.footer} {...select('footer')}>{text(design.hiddenLayers.includes('footer') ? '' : design.author, base.author, wide ? 4.5 : 6, 3.5)}{text('NPL 2026 | Cricket', base.footerLabel, wide ? 4.5 : 6, 3.5)}</footer>
        </div>{guides && <div className={base.guides} aria-hidden="true" />}
    </div>;
});
MomentArtwork.displayName = 'MomentArtwork';

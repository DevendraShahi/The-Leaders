"use client";

import { forwardRef, type CSSProperties } from 'react';
import { nplTeam, teamLogo, teamName, nplTournamentLogo } from '@/lib/post-studio/cricket-catalog';
import { cricketNumber, blankCricketData } from '@/lib/post-studio/cricket-data';
import { matchdayIssues, matchdayBackgrounds } from '@/lib/post-studio/matchday';
import { postOutputDimensions, type PostLayer, type PostTextLayer } from '@/lib/post-studio/types';
import { hasDevanagari } from '@/lib/post-studio/typography';
import type { CricketArtworkProps } from './CricketArtwork';
import { ArtworkPhoto } from './ArtworkPhoto';
import { ArtworkPlacedImages } from './ArtworkPlacedImages';
import { FittedArtworkText } from './FittedArtworkText';
import s from './MatchdayArtwork.module.css';

/** Managed Matchday composition: facts have their own slots, independent of headline length. */
export const MatchdayArtwork = forwardRef<HTMLDivElement, CricketArtworkProps>(({ design, onSelect, selected, guides, selectedPlacedImageId, onSelectPlacedImage }, ref) => {
    const data = design.cricket ?? blankCricketData(), ne = data.language === 'ne';
    const team = nplTeam(data.teamId), opponent = nplTeam(data.opponentId);
    const [width, outputHeight] = postOutputDimensions[design.format], height = 360 * outputHeight / width;
    const wide = design.format === 'landscape', story = design.format === 'story';
    const paper = design.cricketStyle === 'editorial';
    const issues = matchdayIssues(design);
    const t = (en: string, np: string) => ne ? np : en;
    const n = (value: string) => cricketNumber(value, data.language);
    const select = (layer: PostLayer) => onSelect && !design.lockedLayers.includes(layer) ? {
        role: 'button', tabIndex: 0, 'aria-label': `Select ${layer}`, 'data-selected': selected === layer || undefined,
        onClick: () => onSelect(layer), onKeyDown: (event: React.KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(layer); } },
    } : {};
    const text = (value: string, className: string, max: number, min: number, layer?: PostTextLayer, testId?: string) => {
        const settings = layer ? design.textTypography[layer] : undefined;
        const nepali = hasDevanagari(value) || settings?.font === 'hind';
        const scale = layer === 'headline' ? design.headlineScale : (settings?.size ?? 100) / 100;
        return <FittedArtworkText text={value} className={className} fitGroup={className === s.teamName ? 'team-names' : undefined} max={max * Math.min(1.5, Math.max(.7, scale))} min={min} lineHeight={(nepali ? 1.65 : 1.3) * Math.max(1, Math.min(1.4, (settings?.lineSpacing ?? 100) / 100))} testId={testId}
            style={{ fontFamily: nepali ? 'Hind_700Bold' : settings?.font === 'hind' ? 'Hind_700Bold' : 'Onest_700Bold', ...(layer && design.textColors[layer] ? { color: design.textColors[layer]! } : {}) }} />;
    };
    const dateObject = /^\d{4}-\d{2}-\d{2}$/.test(data.matchDate) ? new Date(`${data.matchDate}T12:00:00Z`) : null;
    const validDate = dateObject && !Number.isNaN(dateObject.getTime()) ? dateObject : null;
    const date = validDate ? `${n(String(validDate.getUTCDate()).padStart(2, '0'))} ${new Intl.DateTimeFormat(ne ? 'ne-NP' : 'en-GB', { timeZone: 'UTC', month: 'short' }).format(validDate)}` : t('DATE TBC', 'मिति बाँकी');
    const weekday = validDate ? `${new Intl.DateTimeFormat(ne ? 'ne-NP' : 'en-GB', { timeZone: 'UTC', weekday: 'long' }).format(validDate)} · ${n(String(validDate.getUTCFullYear()))}` : t('Awaiting confirmation', 'पुष्टि हुन बाँकी');
    const photo = Boolean(design.imageUri && !design.hiddenLayers.includes('visual'));
    const background = matchdayBackgrounds.find(item => item.id === data.matchdayBackground) ?? matchdayBackgrounds[wide ? 0 : 4];
    const credit = [photo ? design.imageCredit : '', ...(design.placedImages ?? []).filter(image => !image.hidden).map(image => image.credit)].filter(Boolean).join(' · ');
    const badge = (opposition: boolean) => {
        const identity = opposition ? opponent : team;
        const uri = opposition ? data.opponentLogoUri : data.teamLogoUri;
        return <section className={s.team} aria-label={identity.name} style={{ '--team-color': identity.primary } as CSSProperties}>
            <div className={s.crestSlot}><img src={uri || teamLogo(identity.id)} alt={identity.name} style={{ maxWidth: `${Math.min(100, Math.max(60, data.logoScale ?? 100))}%`, maxHeight: `${Math.min(100, Math.max(60, data.logoScale ?? 100))}%` }} /></div>
            {text(teamName(identity, data.language), s.teamName, wide ? 12 : story ? 19 : 16, wide ? 8 : 10)}
        </section>;
    };
    return <div ref={ref} className={`${s.artwork} ${paper ? s.paper : ''}`} style={{ width: 360, height, '--accent': design.accent } as CSSProperties} data-testid="post-artwork" data-cricket-template="matchday" data-layout="matchday" data-format={design.format} data-language={data.language} data-export-error={issues.join(' ')} data-managed-layout="true">
        <img className={s.background} src={paper ? '/studio/cricket/backgrounds/paper-001.jpg' : background.src} alt="" />
        {photo && <div className={s.photo}><ArtworkPhoto design={design} height={height} /></div>}
        <div className={s.overlays}>{(['back', 'middle', 'front'] as const).map(layer => <ArtworkPlacedImages key={layer} layerFilter={layer} images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />)}</div>
        <div className={s.scrim} />
        <div className={s.content}>
            <header className={s.header}>
                <div className={s.brand}><img src="/studio/leaders.png" alt="The Leaders" /><span>THE LEADERS<span>{t('SPORTS DESK', 'खेलकुद डेस्क')}</span></span></div>
                <div className={s.tournamentLogo}><img src={nplTournamentLogo} alt="Nepal Premier League" /></div>
            </header>
            <div className={s.titleBlock} {...select('headline')}>
                {!design.hiddenLayers.includes('kicker') && <div className={s.kicker} {...select('kicker')}>{text(data.matchLabel || t('MATCH PREVIEW', 'खेलको पूर्वावलोकन'), s.matchLabel, wide ? 7 : 8, wide ? 5 : 6)}</div>}
                {!design.hiddenLayers.includes('headline') && text(design.headline || t('MATCHDAY', 'खेलको दिन'), s.headline, wide ? 27 : story ? 47 : 40, wide ? 10 : 16, 'headline', 'artwork-headline')}
            </div>
            <div className={s.teams} {...select('visual')}>{badge(false)}<span className={s.versus}>{t('VS', 'विरुद्ध')}</span>{badge(true)}</div>
            <div className={s.details}>
                <div className={s.dateBlock}>{text(date.toUpperCase(), s.date, wide ? 21 : 30, wide ? 13 : 19)}{text(weekday, s.weekday, wide ? 6 : 8, 5.5)}</div>
                <div className={s.timeBlock}>{text(data.startTime ? n(data.startTime) : t('TIME TBC', 'समय बाँकी'), s.time, wide ? 23 : 32, wide ? 11 : 16)}<span>{t('NEPAL TIME · NPT', 'नेपाल समय')}</span></div>
            </div>
            <div className={s.venueBlock}><span>{t('VENUE', 'मैदान')}</span>{text(data.venue || t('Venue to be confirmed', 'मैदान पुष्टि हुन बाँकी'), s.venue, wide ? 8 : 11, wide ? 6 : 8)}</div>
            <div className={s.summaryBlock} {...select('supporting')}>{!design.hiddenLayers.includes('supporting') && design.summary && text(design.summary, s.summary, wide ? 7 : 10, wide ? 5.5 : 8, 'supporting')}</div>
            <footer className={s.footer} {...select('footer')}>
                {text(design.hiddenLayers.includes('footer') ? '' : design.author, s.author, wide ? 5 : 6.5, 4.5, 'footer')}
                {text('NPL 2026 | Cricket', s.footerLabel, wide ? 5 : 6.5, 4.5)}
                {credit && text(credit, s.credit, wide ? 4 : 5, 3.5)}
            </footer>
        </div>
        {guides && <div className={s.guides} aria-hidden="true" />}
    </div>;
});
MatchdayArtwork.displayName = 'MatchdayArtwork';

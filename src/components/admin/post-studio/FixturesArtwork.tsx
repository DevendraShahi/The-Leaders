"use client";

import { forwardRef, type CSSProperties } from 'react';
import { nplTeam, teamLogo, teamName, nplTournamentLogo, type NplTeamId } from '@/lib/post-studio/cricket-catalog';
import { blankCricketData, cricketNumber } from '@/lib/post-studio/cricket-data';
import { fixtureSlot, fixturesPostIssues } from '@/lib/post-studio/fixtures-post';
import { matchdayBackgrounds } from '@/lib/post-studio/matchday';
import { postOutputDimensions, type PostLayer } from '@/lib/post-studio/types';
import { hasDevanagari } from '@/lib/post-studio/typography';
import { cricketRestDays } from '@/lib/post-studio/cricket-fixtures';
import type { CricketArtworkProps } from './CricketArtwork';
import { FittedArtworkText } from './FittedArtworkText';
import { ArtworkPhoto } from './ArtworkPhoto';
import { ArtworkPlacedImages } from './ArtworkPlacedImages';
import s from './FixturesArtwork.module.css';

export const FixturesArtwork = forwardRef<HTMLDivElement, CricketArtworkProps>(({ design, onSelect, selected, guides, selectedPlacedImageId, onSelectPlacedImage }, ref) => {
    const data = design.cricket ?? blankCricketData('fixtures'), ne = data.language === 'ne';
    const wide = design.format === 'landscape', paper = design.cricketStyle === 'editorial';
    const [w, h] = postOutputDimensions[design.format], height = 360 * h / w;
    const t = (en: string, np: string) => ne ? np : en;
    const n = (value: string | number) => cricketNumber(value, data.language);
    const select = (layer: PostLayer) => onSelect && !design.lockedLayers.includes(layer) ? {
        role: 'button', tabIndex: 0, 'aria-label': `Select ${layer}`, 'data-selected': selected === layer || undefined,
        onClick: () => onSelect(layer), onKeyDown: (event: React.KeyboardEvent) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); onSelect(layer); } },
    } : {};
    const text = (value: string, className: string, max: number, min: number, group?: string, testId?: string) => <FittedArtworkText text={value} className={className} max={max} min={min} fitGroup={group} testId={testId} lineHeight={hasDevanagari(value) ? 1.65 : 1.3} style={{ fontFamily: hasDevanagari(value) ? 'Hind_700Bold' : 'Onest_700Bold' }} />;
    const dateObject = new Date(`${data.matchDate}T12:00:00Z`);
    const date = data.matchDate && !Number.isNaN(dateObject.getTime()) ? new Intl.DateTimeFormat(ne ? 'ne-NP' : 'en-GB', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' }).format(dateObject) : t('Date to confirm', 'मिति पुष्टि हुन बाँकी');
    const background = matchdayBackgrounds.find(item => item.id === data.matchdayBackground) ?? matchdayBackgrounds[wide ? 0 : 4];
    const photo = Boolean(design.imageUri && !design.hiddenLayers.includes('visual'));
    const rows = data.fixtures;
    const rest = !rows.length && cricketRestDays.includes(data.matchDate);
    const badge = (id: NplTeamId) => <div className={s.team}><div className={s.crest}><img src={teamLogo(id)} alt={nplTeam(id).name} /></div>{text(teamName(nplTeam(id), data.language), s.teamName, wide ? 9 : 12, wide ? 6 : 7, 'fixture-teams')}</div>;
    return <div ref={ref} className={`${s.artwork} ${paper ? s.paper : ''}`} style={{ width: 360, height, '--accent': design.accent } as CSSProperties} data-testid="post-artwork" data-cricket-template="fixtures" data-format={design.format} data-language={data.language} data-layout="daily-fixtures" data-managed-layout="true" data-export-error={fixturesPostIssues(design).join(' ')}>
        <img className={s.background} src={paper ? '/studio/cricket/backgrounds/paper-001.jpg' : background.src} alt="" />
        {photo && <div className={s.photo}><ArtworkPhoto design={design} height={height} /></div>}
        <div className={s.overlays}>{(['back', 'middle', 'front'] as const).map(layer => <ArtworkPlacedImages key={layer} layerFilter={layer} images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />)}</div>
        <div className={s.scrim} />
        <div className={s.content}>
            <header className={s.header}><div className={s.brand}><img src="/studio/leaders.png" alt="The Leaders" /><span>THE LEADERS<small>{t('SPORTS DESK', 'खेलकुद डेस्क')}</small></span></div><img className={s.npl} src={nplTournamentLogo} alt="Nepal Premier League" /></header>
            <div className={s.title} {...select('headline')}><span className={s.kicker}>{rest ? t('A DAY TO RESET', 'विश्रामको दिन') : rows.length === 2 ? t('TODAY’S MATCHES', 'आजका खेलहरू') : t('ON THE SCHEDULE', 'आजको तालिका')}</span>{!design.hiddenLayers.includes('headline') && text(design.headline, s.headline, wide ? 25 : 33, wide ? 10 : 16, undefined, 'artwork-headline')}{text(date, s.date, wide ? 8 : 10, 6)}</div>
            <main className={s.schedule} data-count={rows.length} data-export-fit>
                {rows.map((row, index) => { const slot = fixtureSlot(row.when); return <article className={s.game} key={index} data-export-fit aria-label={`Game ${index + 1}`}>
                    <div className={s.gameHeader}><span>{t('GAME', 'खेल')} {n(index + 1)}</span>{text(slot ? `${n(slot.time)} NPT` : t('TIME TO CONFIRM', 'समय पुष्टि हुन बाँकी'), s.time, wide ? 11 : 15, wide ? 7 : 9)}</div>
                    <div className={s.pair}>{badge(row.teamId)}<span className={s.vs}>{t('VS', 'विरुद्ध')}</span>{badge(row.opponentId)}</div>
                    <div className={s.venueBlock}><span>{t('VENUE', 'मैदान')}</span>{text(row.venue || t('Venue to confirm', 'मैदान पुष्टि हुन बाँकी'), s.venue, wide ? 6 : 7.5, wide ? 4.5 : 6)}</div>
                </article>; })}
                {!rows.length && <div className={s.empty}>{text(rest ? t('REST DAY', 'विश्राम दिन') : t('FIXTURES TO CONFIRM', 'खेल तालिका पुष्टि हुन बाँकी'), s.emptyTitle, wide ? 22 : 32, 14)}<span>{rest ? t('No league games scheduled.', 'लिगका खेल निर्धारित छैनन्।') : t('Add the confirmed games in Match.', 'पुष्टि भएका खेल थप्नुहोस्।')}</span></div>}
            </main>
            <div className={s.summary} {...select('supporting')}>{!design.hiddenLayers.includes('supporting') && design.summary && text(design.summary, s.summaryText, wide ? 6.5 : 8, wide ? 5 : 6)}</div>
            <footer className={s.footer} {...select('footer')}>{text(design.hiddenLayers.includes('footer') ? '' : design.author, s.author, wide ? 4.5 : 6, 3.5)}{text('NPL 2026 | Cricket', s.footerLabel, wide ? 4.5 : 6, 3.5)}</footer>
        </div>
        {guides && <div className={s.guides} aria-hidden="true" />}
    </div>;
});
FixturesArtwork.displayName = 'FixturesArtwork';

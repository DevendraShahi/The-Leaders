"use client";

import { forwardRef, type CSSProperties } from 'react';
import { nplTeam, nplTournamentLogo, teamLogo, teamName, type NplTeamId } from '@/lib/post-studio/cricket-catalog';
import { blankCricketData, cricketNumber } from '@/lib/post-studio/cricket-data';
import { headToHeadIssues } from '@/lib/post-studio/head-to-head';
import { matchdayBackgrounds } from '@/lib/post-studio/matchday';
import { postOutputDimensions, type PostLayer } from '@/lib/post-studio/types';
import { hasDevanagari } from '@/lib/post-studio/typography';
import { FittedArtworkText } from './FittedArtworkText';
import { ArtworkPhoto } from './ArtworkPhoto';
import { ArtworkPlacedImages } from './ArtworkPlacedImages';
import type { CricketArtworkProps } from './CricketArtwork';
import base from './FixturesArtwork.module.css';
import s from './HeadToHeadArtwork.module.css';

export const HeadToHeadArtwork = forwardRef<HTMLDivElement, CricketArtworkProps>(({ design, onSelect, selected, guides, selectedPlacedImageId, onSelectPlacedImage }, ref) => {
    const data = design.cricket ?? blankCricketData('head-to-head'), record = data.headToHead;
    const ne = data.language === 'ne', wide = design.format === 'landscape', paper = design.cricketStyle === 'editorial';
    const [w, h] = postOutputDimensions[design.format], height = 360 * h / w;
    const t = (en: string, np: string) => ne ? np : en;
    const n = (value: number | null | undefined) => cricketNumber(value ?? null, data.language);
    const text = (value: string, className: string, max: number, min: number, group?: string, testId?: string) => <FittedArtworkText text={value} className={className} max={max} min={min} fitGroup={group} testId={testId} lineHeight={hasDevanagari(value) ? 1.65 : 1.3} style={{ fontFamily: hasDevanagari(value) ? 'Hind_700Bold' : 'Onest_700Bold' }} />;
    const select = (layer: PostLayer) => onSelect && !design.lockedLayers.includes(layer) ? {
        role: 'button', tabIndex: 0, 'aria-label': `Select ${layer}`, 'data-selected': selected === layer || undefined,
        onClick: () => onSelect(layer), onKeyDown: (event: React.KeyboardEvent) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); onSelect(layer); } },
    } : {};
    const cutoff = record?.asOf ? new Date(`${record.asOf}T12:00:00Z`) : null;
    const date = cutoff && !Number.isNaN(cutoff.getTime()) ? new Intl.DateTimeFormat(ne ? 'ne-NP' : 'en-GB', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' }).format(cutoff) : t('Cutoff to confirm', 'मिति पुष्टि हुन बाँकी');
    const background = matchdayBackgrounds.find(item => item.id === data.matchdayBackground) ?? matchdayBackgrounds[wide ? 0 : 4];
    const photo = Boolean(design.imageUri && !design.hiddenLayers.includes('visual'));
    const identity = (id: NplTeamId, wins: number | null | undefined, customLogo: string | null) => <section className={s.team} aria-label={nplTeam(id).name}>
        <div className={s.crest}><img src={customLogo || teamLogo(id)} alt={nplTeam(id).name} /></div>
        {text(teamName(nplTeam(id), data.language), s.teamName, wide ? 11 : 15, wide ? 7 : 9, 'h2h-teams')}
        <div className={s.wins}>{text(n(wins), s.winCount, wide ? 32 : 46, wide ? 16 : design.format === 'square' ? 17 : 21, 'h2h-wins')}<span>{t('WINS', 'जित')}</span></div>
    </section>;
    const statistic = (label: string, value: number | null | undefined) => <div className={s.stat}>{text(n(value), s.statNumber, wide ? 15 : 22, wide ? 10 : 14, 'h2h-stats')}{text(label, s.statLabel, wide ? 5 : 7, wide ? 4 : 5)}</div>;
    return <div ref={ref} className={`${base.artwork} ${s.artwork} ${paper ? base.paper : ''}`} data-testid="post-artwork" data-cricket-template="head-to-head" data-format={design.format} data-language={data.language} data-layout="head-to-head" data-managed-layout="true" data-export-error={headToHeadIssues(design).join(' ')} style={{ width: 360, height, '--accent': design.accent } as CSSProperties}>
        <img className={base.background} src={paper ? '/studio/cricket/backgrounds/paper-001.jpg' : background.src} alt="" />
        {photo && <div className={base.photo}><ArtworkPhoto design={design} height={height} /></div>}
        <div className={base.overlays}>{(['back', 'middle', 'front'] as const).map(layer => <ArtworkPlacedImages key={layer} layerFilter={layer} images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />)}</div><div className={base.scrim} />
        <div className={s.content}>
            <header className={base.header}><div className={base.brand}><img src="/studio/leaders.png" alt="The Leaders" /><span>THE LEADERS<small>{t('SPORTS DESK', 'खेलकुद डेस्क')}</small></span></div><img className={base.npl} src={nplTournamentLogo} alt="Nepal Premier League" /></header>
            <div className={s.title} {...select('headline')}><span>{t('ALL NPL MEETINGS', 'एनपीएलका सबै भेट')}</span>{!design.hiddenLayers.includes('headline') && text(design.headline, s.headline, wide ? 25 : 33, wide ? 12 : 17, undefined, 'artwork-headline')}</div>
            <main className={s.comparison} {...select('visual')} data-export-fit>{identity(data.teamId, record?.teamWins, data.teamLogoUri)}<span className={s.vs}>VS</span>{identity(data.opponentId, record?.opponentWins, data.opponentLogoUri)}</main>
            <div className={s.facts}>{statistic(t('MATCHES PLAYED', 'खेलिएका खेल'), record?.played)}{statistic(t('TIED · NO WINNER', 'बराबरी · विजेता छैन'), record?.ties)}{statistic(t('NO RESULT', 'नतिजाविहीन'), record?.noResults)}</div>
            <div className={s.metadata}>{text(`${t('RECORD AS OF', 'तथ्याङ्क मिति')} ${date}`, s.cutoff, wide ? 5.5 : 7.5, wide ? 4.5 : 6)}</div>
            <div className={s.summary} {...select('supporting')}>{!design.hiddenLayers.includes('supporting') && design.summary && text(design.summary, s.summaryText, wide ? 6 : 8, wide ? 5 : 6)}</div>
            <footer className={base.footer} {...select('footer')}>{text(design.hiddenLayers.includes('footer') ? '' : design.author, base.author, wide ? 4.5 : 6, 3.5)}{text('NPL 2026 | Cricket', base.footerLabel, wide ? 4.5 : 6, 3.5)}</footer>
        </div>
        {guides && <div className={base.guides} aria-hidden="true" />}
    </div>;
});
HeadToHeadArtwork.displayName = 'HeadToHeadArtwork';

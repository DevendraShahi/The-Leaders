"use client";

import { forwardRef, type CSSProperties } from 'react';
import { nplTeam, nplTournamentLogo, teamLogo, teamName } from '@/lib/post-studio/cricket-catalog';
import { blankCricketData, cricketNumber, cricketScore, strikeRate } from '@/lib/post-studio/cricket-data';
import { phaseIssues } from '@/lib/post-studio/phase-posts';
import { matchingPortraitFor, portraitIsCurrent } from '@/lib/post-studio/player-portraits';
import { matchdayBackgrounds } from '@/lib/post-studio/matchday';
import { postOutputDimensions, type PostLayer, type PostTextLayer } from '@/lib/post-studio/types';
import { hasDevanagari } from '@/lib/post-studio/typography';
import { FittedArtworkText } from './FittedArtworkText';
import { ArtworkPlacedImages } from './ArtworkPlacedImages';
import { ArtworkPhoto } from './ArtworkPhoto';
import type { CricketArtworkProps } from './CricketArtwork';
import s from './PartnershipArtwork.module.css';

/**
 * Rebuilt Partnership Artwork:
 * Benchmark: Head to Head & Matchday visual architecture.
 * Dual-batter arena, grounded player portraits with bottom fade,
 * 3-column stand fact bar, no dashboard boxes or card clutter.
 */
export const PartnershipArtwork = forwardRef<HTMLDivElement, CricketArtworkProps>(({ design, onSelect, selected, guides, selectedPlacedImageId, onSelectPlacedImage }, ref) => {
    const data = design.cricket ?? blankCricketData('partnership');
    const ne = data.language === 'ne';
    const wide = design.format === 'landscape';
    const story = design.format === 'story';
    const paper = design.cricketStyle === 'editorial';

    const [w, h] = postOutputDimensions[design.format];
    const height = 360 * h / w;

    const team = nplTeam(data.teamId);
    const opponent = nplTeam(data.opponentId);

    const t = (en: string, np: string) => ne ? np : en;
    const n = (value: string | number | null | undefined) => cricketNumber(value ?? null, data.language);

    const select = (layer: PostLayer) => onSelect && !design.lockedLayers.includes(layer) ? {
        role: 'button',
        tabIndex: 0,
        'aria-label': `Select ${layer}`,
        'data-selected': selected === layer || undefined,
        onClick: () => onSelect(layer),
        onKeyDown: (event: React.KeyboardEvent) => {
            if (['Enter', ' '].includes(event.key)) {
                event.preventDefault();
                onSelect(layer);
            }
        },
    } : {};

    const text = (value: string, className: string, max: number, min: number, group?: string, testId?: string, layer?: PostTextLayer) => {
        const settings = layer ? design.textTypography[layer] : undefined;
        const nepali = hasDevanagari(value) || settings?.font === 'hind';
        const scale = layer === 'headline' ? design.headlineScale : (settings?.size ?? 100) / 100;
        return (
            <FittedArtworkText
                text={value}
                className={className}
                max={max * Math.min(1.5, Math.max(0.7, scale))}
                min={min}
                fitGroup={group}
                testId={testId}
                lineHeight={(nepali ? 1.65 : 1.3) * Math.max(1, Math.min(1.4, (settings?.lineSpacing ?? 100) / 100))}
                style={{
                    fontFamily: nepali ? 'Hind_700Bold' : settings?.font === 'hind' ? 'Hind_700Bold' : 'Onest_700Bold',
                    ...(layer && design.textColors[layer] ? { color: design.textColors[layer]! } : {}),
                }}
            />
        );
    };

    const visible = data.showPlayerPhoto !== false && !design.hiddenLayers.includes('visual');
    const current = portraitIsCurrent(design);
    const primary = matchingPortraitFor(data.batter.name, data.teamId);
    const secondary = matchingPortraitFor(data.secondBatter.name, data.teamId);

    const photos = [
        visible ? (design.imageUri && current ? design.imageUri : (primary?.photo?.url ?? null)) : null,
        visible ? secondary?.photo?.url : null,
    ];

    const background = matchdayBackgrounds.find(item => item.id === data.matchdayBackground) ?? matchdayBackgrounds[wide ? 0 : 4];
    const backgroundPhoto = Boolean(design.imageUri && !design.hiddenLayers.includes('visual') && data.showPlayerPhoto === false);

    const issues = [
        ...phaseIssues(design),
        ...(visible && design.imageUri && !current ? ['Choose a portrait matching the first batter.'] : []),
    ];

    const detailed = [data.batter, data.secondBatter].some(batter => batter.runs !== null || batter.balls !== null);
    const partnershipRate = data.partnershipRuns !== null && data.partnershipBalls !== null && data.partnershipBalls > 0
        ? (data.partnershipRuns * 6 / data.partnershipBalls).toFixed(2)
        : '—';

    const renderBatterStats = (batter: typeof data.batter, partner: typeof data.secondBatter) => {
        const hasRuns = batter.runs !== null;
        const partnerHasRuns = partner.runs !== null;
        const rate = hasRuns && batter.balls && batter.balls > 0 ? strikeRate(batter.runs, batter.balls) : null;

        if (!detailed && !hasRuns) return null;

        if (hasRuns) {
            return (
                <div className={s.playerInnings}>
                    <div className={s.inningsScore}>
                        <span className={s.scoreRuns}>{n(batter.runs)}{batter.notOut ? '*' : ''}</span>
                        <span className={s.scoreBalls}>({n(batter.balls)})</span>
                    </div>
                    {(batter.fours !== null || batter.sixes !== null || rate !== null) && (
                        <div className={s.statRow} aria-label={t('Boundary and strike rate statistics', 'चौका, छक्का र स्ट्राइक रेट तथ्याङ्क')}>
                            {batter.fours !== null && (
                                <span className={s.fourItem}>
                                    <span className={s.metricLabel}>4<sup>s</sup></span>
                                    <span className={s.metricVal}>{n(batter.fours)}</span>
                                </span>
                            )}
                            {batter.sixes !== null && (
                                <span className={s.sixItem}>
                                    <span className={s.metricLabel}>6<sup>s</sup></span>
                                    <span className={s.metricVal}>{n(batter.sixes)}</span>
                                </span>
                            )}
                            {rate !== null && (
                                <span className={s.srItem}>
                                    <span className={s.metricLabel}>SR</span>
                                    <span className={s.metricVal}>{n(rate)}</span>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        if (partnerHasRuns) {
            return (
                <div className={s.playerInnings}>
                    <div className={s.playerCrease}>
                        {t('At the crease', 'क्रिजमा')}
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div
            ref={ref}
            className={`${s.artwork} ${paper ? s.paper : ''}`}
            style={{ width: 360, height, '--accent': design.accent } as CSSProperties}
            data-testid="post-artwork"
            data-cricket-template="partnership"
            data-format={design.format}
            data-language={data.language}
            data-detailed={detailed}
            data-managed-layout="true"
            data-export-error={issues.join(' ')}
        >
            <img className={s.background} src={paper ? '/studio/cricket/backgrounds/paper-001.jpg' : background.src} alt="" />
            {backgroundPhoto && <div className={s.photo}><ArtworkPhoto design={design} height={height} /></div>}
            <div className={s.overlays}>
                {(['back', 'middle', 'front'] as const).map(layer => (
                    <ArtworkPlacedImages
                        key={layer}
                        layerFilter={layer}
                        images={design.placedImages}
                        canvasWidth={360}
                        canvasHeight={height}
                        selectedId={selectedPlacedImageId}
                        onSelectImage={onSelectPlacedImage}
                        isInteractive={Boolean(onSelectPlacedImage)}
                    />
                ))}
            </div>
            <div className={s.scrim} />

            <div className={s.content}>
                {/* 1. Masthead Header */}
                <header className={s.header}>
                    <div className={s.brand}>
                        <img src="/studio/leaders.png" alt="The Leaders" />
                        <span>THE LEADERS<small>{t('SPORTS DESK', 'खेलकुद डेस्क')}</small></span>
                    </div>
                    <div className={s.tournamentLogo}>
                        <img src={nplTournamentLogo} alt="Nepal Premier League" />
                    </div>
                </header>

                {/* 2. Context & Title Block */}
                <div className={s.title} {...select('headline')}>
                    <div className={s.kickerRow}>
                        <span className={s.kicker}>
                            {data.matchLabel || `${teamName(team, data.language)} vs ${teamName(opponent, data.language)}`}
                        </span>
                        {data.overs && (
                            <span className={s.overBadge}>
                                {t('OVER', 'ओभर')} {n(data.overs)}
                            </span>
                        )}
                    </div>
                    {!design.hiddenLayers.includes('headline') && (
                        text(design.headline || t('THE PARTNERSHIP', 'साझेदारी'), s.headline, wide ? 25 : story ? 38 : 32, wide ? 12 : 16, undefined, 'artwork-headline', 'headline')
                    )}
                </div>

                {/* 3. Dual Batters Arena (Hero comparison with grounded portraits and bespoke stat chips) */}
                <main className={s.arena} {...select('visual')}>
                    {/* Batter 1 */}
                    <div className={s.playerCol} aria-label={data.batter.name || 'Batter 1'}>
                        <div className={s.portraitWrapper}>
                            <img
                                data-testid={photos[0] ? 'partnership-photo-0' : undefined}
                                src={photos[0] || teamLogo(data.teamId)}
                                alt={photos[0] ? data.batter.name : team.name}
                                style={photos[0] && design.imageUri && current ? {
                                    objectFit: design.imageFit,
                                    transform: `translate(${design.imageOffsetX}px, ${design.imageOffsetY}px) scale(${design.imageZoom})`,
                                } : undefined}
                            />
                        </div>
                        <div className={s.playerName}>
                            {text(data.batter.name || t('Batter to confirm', 'ब्याटर पुष्टि हुन बाँकी'), s.playerName, wide ? 10 : 15, wide ? 7 : 9, 'partnership-names')}
                        </div>
                        {renderBatterStats(data.batter, data.secondBatter)}
                    </div>

                    {/* Ampersand Center Divider */}
                    <div className={s.standCenter}>
                        <span className={s.amp}>&</span>
                    </div>

                    {/* Batter 2 */}
                    <div className={s.playerCol} aria-label={data.secondBatter.name || 'Batter 2'}>
                        <div className={s.portraitWrapper}>
                            <img
                                data-testid={photos[1] ? 'partnership-photo-1' : undefined}
                                src={photos[1] || teamLogo(data.teamId)}
                                alt={photos[1] ? data.secondBatter.name : team.name}
                            />
                        </div>
                        <div className={s.playerName}>
                            {text(data.secondBatter.name || t('Batter to confirm', 'ब्याटर पुष्टि हुन बाँकी'), s.playerName, wide ? 10 : 15, wide ? 7 : 9, 'partnership-names')}
                        </div>
                        {renderBatterStats(data.secondBatter, data.batter)}
                    </div>
                </main>

                {/* 4. Three-Column Stand Fact Bar (Modelled directly on Head to Head .facts) */}
                <div
                    className={s.facts}
                    role="group"
                    aria-label={t('Shared partnership figures for both batters', 'दुवै ब्याटरको संयुक्त साझेदारी')}
                    data-testid="partnership-shared-stat"
                >
                    <div className={s.stat}>
                        {text(n(data.partnershipRuns), s.statNumber, wide ? 28 : 42, wide ? 10 : 14)}
                        {text(t('RUN PARTNERSHIP', 'रनको साझेदारी'), s.statLabel, wide ? 5 : 6.5, 3.8)}
                    </div>
                    <div className={s.stat}>
                        {text(n(data.partnershipBalls), s.statNumber, wide ? 28 : 42, wide ? 10 : 14)}
                        {text(t('BALLS FACED', 'कुल बल'), s.statLabel, wide ? 5 : 6.5, 3.8)}
                    </div>
                    <div className={s.stat}>
                        {text(n(partnershipRate), s.statNumber, wide ? 28 : 42, wide ? 10 : 14)}
                        {text(t('RUN RATE', 'रन रेट'), s.statLabel, wide ? 5 : 6.5, 3.8)}
                    </div>
                </div>

                {/* 5. Scoreboard Status Strip */}
                <div className={s.scoreboard}>
                    <div className={s.scoreLeft}>
                        <img src={teamLogo(data.teamId)} alt="" className={s.miniCrest} />
                        {text(`${team.short} ${n(cricketScore(data.runs, data.wickets))}`, s.scoreTotal, wide ? 11 : 15, wide ? 7 : 9)}
                        {data.overs && <span className={s.scoreOvers}>({n(data.overs)} {t('OV', 'ओभर')})</span>}
                    </div>
                    <div className={s.scoreRight}>
                        {data.matchDate ? text(data.matchDate, s.sourceHost, wide ? 5 : 6.5, wide ? 4 : 5) : null}
                    </div>
                </div>

                {/* 6. Summary Note */}
                <div className={s.summary} {...select('supporting')}>
                    {!design.hiddenLayers.includes('supporting') && design.summary && (
                        text(design.summary, s.summaryText, wide ? 6 : 8, wide ? 4.5 : 5.5, undefined, undefined, 'supporting')
                    )}
                </div>

                {/* 7. Footer */}
                <footer className={s.footer} {...select('footer')}>
                    {text(design.hiddenLayers.includes('footer') ? '' : design.author, s.author, wide ? 4.5 : 6, 3.5, undefined, undefined, 'footer')}
                    {text('NPL 2026 | Cricket', s.footerLabel, wide ? 4.5 : 6, 3.5)}
                </footer>
            </div>

            {guides && <div className={s.guides} aria-hidden="true" />}
        </div>
    );
});

PartnershipArtwork.displayName = 'PartnershipArtwork';

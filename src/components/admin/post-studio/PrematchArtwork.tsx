"use client";

import { forwardRef, type CSSProperties } from 'react';
import { nplTeam, nplTournamentLogo, teamLogo, teamName, type NplTeamId } from '@/lib/post-studio/cricket-catalog';
import { blankCricketData, cricketNumber } from '@/lib/post-studio/cricket-data';
import { prematchIssues } from '@/lib/post-studio/prematch-posts';
import { matchdayBackgrounds } from '@/lib/post-studio/matchday';
import { postOutputDimensions, type PostLayer } from '@/lib/post-studio/types';
import { hasDevanagari } from '@/lib/post-studio/typography';
import type { CricketArtworkProps } from './CricketArtwork';
import { FittedArtworkText } from './FittedArtworkText';
import { ArtworkPhoto } from './ArtworkPhoto';
import { ArtworkPlacedImages } from './ArtworkPlacedImages';
import base from './FixturesArtwork.module.css';
import s from './PrematchArtwork.module.css';

export const PrematchArtwork = forwardRef<HTMLDivElement, CricketArtworkProps>(({ design, onSelect, selected, guides, selectedPlacedImageId, onSelectPlacedImage }, ref) => {
    const data = design.cricket ?? blankCricketData('toss'), ne = data.language === 'ne', wide = design.format === 'landscape';
    const paper = design.cricketStyle === 'editorial', xi = data.template === 'playing-xi', toss = data.template === 'toss';
    const [w, h] = postOutputDimensions[design.format], height = 360 * h / w;
    const t = (en: string, np: string) => ne ? np : en;
    const n = (value: number) => cricketNumber(value, data.language);
    const text = (value: string, className: string, max: number, min: number, group?: string, testId?: string) => <FittedArtworkText text={value} className={className} max={max} min={min} fitGroup={group} testId={testId} lineHeight={hasDevanagari(value) ? 1.65 : 1.3} style={{ fontFamily: hasDevanagari(value) ? 'Hind_700Bold' : 'Onest_700Bold' }} />;
    const select = (layer: PostLayer) => onSelect && !design.lockedLayers.includes(layer) ? {
        role: 'button', tabIndex: 0, 'aria-label': `Select ${layer}`, 'data-selected': selected === layer || undefined,
        onClick: () => onSelect(layer), onKeyDown: (event: React.KeyboardEvent) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); onSelect(layer); } },
    } : {};
    const winner = data.toss?.winnerId && [data.teamId, data.opponentId].includes(data.toss.winnerId) ? data.toss.winnerId : null;
    const identityId: NplTeamId | null = toss ? winner : data.teamId;
    const customLogo = identityId === data.teamId ? data.teamLogoUri : identityId === data.opponentId ? data.opponentLogoUri : null;
    const source = data.sourceUrl || design.sourceUrls?.[0] || '';
    let host = ''; try { host = source ? new URL(source).hostname.replace(/^www\./, '') : ''; } catch { /* Preflight requests a source. */ }
    const background = matchdayBackgrounds.find(item => item.id === data.matchdayBackground) ?? matchdayBackgrounds[wide ? 0 : 4];
    const photo = Boolean(design.imageUri && !design.hiddenLayers.includes('visual'));
    const credit = [photo ? design.imageCredit : '', ...(design.placedImages ?? []).filter(image => !image.hidden).map(image => image.credit)].filter(Boolean).join(' · ');
    const dateObject = new Date(`${data.matchDate}T12:00:00Z`);
    const date = data.matchDate && !Number.isNaN(dateObject.getTime()) ? new Intl.DateTimeFormat(ne ? 'ne-NP' : 'en-GB', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' }).format(dateObject) : '';
    const context = toss ? `${teamName(nplTeam(data.teamId), data.language)} vs ${teamName(nplTeam(data.opponentId), data.language)}${date ? ` · ${date}` : ''}` : xi ? `vs ${teamName(nplTeam(data.opponentId), data.language)}${date ? ` · ${date}` : ''}` : t('NPL 2026 · FRANCHISE PROFILE', 'एनपीएल २०२६ · टोली परिचय');
    const profile = data.teamProfile;
    const facts = [[t('CAPTAIN', 'कप्तान'), profile?.captain], [t('HEAD COACH', 'मुख्य प्रशिक्षक'), profile?.headCoach], [t('HOME CITY', 'गृह सहर'), profile?.homeCity]].filter((row): row is [string, string] => Boolean(row[1]?.trim()));
    return <div ref={ref} className={`${base.artwork} ${s.artwork} ${paper ? base.paper : ''}`} style={{ width: 360, height, '--accent': design.accent } as CSSProperties} data-testid="post-artwork" data-cricket-template={data.template} data-format={design.format} data-language={data.language} data-layout={xi ? 'confirmed-xi' : toss ? 'confirmed-toss' : 'franchise-profile'} data-managed-layout="true" data-export-error={prematchIssues(design).join(' ')}>
        <img className={base.background} src={paper ? '/studio/cricket/backgrounds/paper-001.jpg' : background.src} alt="" />
        {photo && <div className={base.photo}><ArtworkPhoto design={design} height={height} /></div>}
        <div className={base.overlays}>{(['back', 'middle', 'front'] as const).map(layer => <ArtworkPlacedImages key={layer} layerFilter={layer} images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />)}</div><div className={base.scrim} />
        <div className={s.content}>
            <header className={base.header}><div className={base.brand}><img src="/studio/leaders.png" alt="The Leaders" /><span>THE LEADERS<small>{t('SPORTS DESK', 'खेलकुद डेस्क')}</small></span></div><img className={base.npl} src={nplTournamentLogo} alt="Nepal Premier League" /></header>
            <div className={s.title} {...select('headline')}><span>{toss ? t('AT THE TOSS', 'टसको निर्णय') : xi ? t('MATCH LINEUP', 'खेलका खेलाडी') : t('THE FRANCHISE', 'फ्रेन्चाइज')}</span>{!design.hiddenLayers.includes('headline') && text(design.headline, s.headline, wide ? 25 : 32, wide ? 11 : 16, undefined, 'artwork-headline')}</div>
            <main className={s.body} data-export-fit>
                <div className={s.identity} {...select('visual')}><div className={s.crest}>{identityId && <img src={customLogo || teamLogo(identityId)} alt={nplTeam(identityId).name} style={{ transform: `scale(${Math.min(100, Math.max(60, data.logoScale ?? 100)) / 100})` }} />}</div>{text(identityId ? teamName(nplTeam(identityId), data.language) : t('Winner to confirm', 'विजेता पुष्टि हुन बाँकी'), s.teamName, wide ? 15 : 23, wide ? 9 : 12)}{text(context, s.context, wide ? 6 : 8, wide ? 5 : 6)}</div>
                {toss && <div className={s.decision}><span>{winner ? t('WON THE TOSS · ELECTED TO', 'टस जितेर रोजेको') : t('AWAITING THE TOSS', 'टसको प्रतीक्षामा')}</span>{text(data.toss?.decision === 'bat' ? t('BAT FIRST', 'पहिले ब्याटिङ') : data.toss?.decision === 'bowl' ? t('BOWL FIRST', 'पहिले बलिङ') : t('DECISION TO CONFIRM', 'निर्णय पुष्टि हुन बाँकी'), s.decisionText, wide ? 24 : 34, wide ? 12 : 18)}</div>}
                {xi && <ol className={s.lineup}>{(data.lineup.length ? data.lineup : Array.from({ length: 11 }, () => '')).map((name, index) => <li key={index}><span>{n(index + 1)}</span>{text(name || t('Name to confirm', 'नाम पुष्टि हुन बाँकी'), s.playerName, wide ? 7 : 11.5, wide ? 5.5 : 7, 'xi-players')}</li>)}</ol>}
                {!xi && !toss && <div className={s.profile}>{facts.length ? facts.map(([label, value]) => <div className={s.fact} key={label}><span>{label}</span>{text(value, s.factValue, wide ? 12 : 18, wide ? 7 : 10, 'team-facts')}</div>) : text(t('Team details to confirm', 'टोलीको विवरण पुष्टि हुन बाँकी'), s.factValue, wide ? 13 : 19, 9)}</div>}
            </main>
            <div className={s.source}>{text(host ? `${t('SOURCE', 'स्रोत')} · ${host}` : t('SOURCE TO CONFIRM', 'स्रोत पुष्टि हुन बाँकी'), s.sourceText, wide ? 5 : 6.5, wide ? 4 : 5)}</div>
            <div className={s.summary} {...select('supporting')}>{!design.hiddenLayers.includes('supporting') && design.summary && text(design.summary, s.summaryText, wide ? 6 : 8, wide ? 5 : 6)}</div>
            <footer className={base.footer} {...select('footer')}>{text(design.hiddenLayers.includes('footer') ? '' : design.author, base.author, wide ? 4.5 : 6, 3.5)}{text('NPL 2026 | Cricket', base.footerLabel, wide ? 4.5 : 6, 3.5)}{credit && text(credit, base.credit, 4, 3)}</footer>
        </div>
        {guides && <div className={base.guides} aria-hidden="true" />}
    </div>;
});
PrematchArtwork.displayName = 'PrematchArtwork';

"use client";

import { forwardRef, useId, type CSSProperties } from 'react';
import { blankHistoryData, historyNumber } from '@/lib/post-studio/history-data';
import { historyIssues } from '@/lib/post-studio/history-design';
import { postOutputDimensions, type PostLayer } from '@/lib/post-studio/types';
import { hasDevanagari } from '@/lib/post-studio/typography';
import { FittedArtworkText } from './FittedArtworkText';
import { ArtworkPhoto } from './ArtworkPhoto';
import { ArtworkPlacedImages } from './ArtworkPlacedImages';
import type { CricketArtworkProps } from './CricketArtwork';
import s from './HistoryArtwork.module.css';
import { Echo11Promotion } from './Echo11Promotion';

export const HistoryArtwork = forwardRef<HTMLDivElement, CricketArtworkProps>(({ design, onSelect, selected, guides, selectedPlacedImageId, onSelectPlacedImage }, ref) => {
    const data = design.history ?? blankHistoryData(), ne = data.language === 'ne', paragraph = data.pageKind === 'paragraph';
    const filterId = `history-watermark-${useId().replace(/:/g, '')}`;
    const [w, h] = postOutputDimensions[design.format], height = 360 * h / w;
    const wide = design.format === 'landscape', story = design.format === 'story';
    const hidden = (layer: PostLayer) => design.hiddenLayers.includes(layer);
    const t = (en: string, np: string) => ne ? np : en;
    const inset = wide ? 5 : 6;
    const select = (layer: PostLayer) => onSelect && !design.lockedLayers.includes(layer) ? {
        role: 'button', tabIndex: 0, 'aria-label': `Select ${layer === 'supporting' ? 'summary' : layer}`,
        'data-selected': selected === layer || undefined,
        onClick: () => onSelect(layer), onKeyDown: (event: React.KeyboardEvent) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); onSelect(layer); } },
    } : {};
    const fitted = (value: string, className: string, max: number, min: number, kind: 'display' | 'body' | 'label' = 'display', testId?: string) => <FittedArtworkText text={value} className={className} max={max} min={min} testId={testId}
        lineHeight={kind === 'body' ? (hasDevanagari(value) ? 1.7 : 1.5) : hasDevanagari(value) ? 1.55 : 1.25}
        style={{ fontFamily: hasDevanagari(value) ? (kind === 'body' ? 'Hind_400Regular' : 'Hind_700Bold') : kind === 'label' ? 'Onest_600SemiBold' : kind === 'body' ? 'Lora_400Regular' : 'Lora_700Bold' }} />;
    const year = historyNumber(data.year, data.language);
    const context = data.fact.trim() || design.summary.trim();
    const issues = historyIssues(design);
    return <div ref={ref} data-testid="post-artwork" data-history-template="on-this-day" data-history-page={paragraph ? 'paragraph' : 'cover'} data-format={design.format} data-language={data.language} data-managed-layout="true" data-export-error={issues.join(' ')} className={s.artwork}
        style={{ width: 360, height, backgroundColor: design.backgroundColor || '#F4EDE0', backgroundImage: design.backgroundGradient || undefined, '--accent': design.accent, '--pad': `${inset}%` } as CSSProperties}>
        <span className={s.grain} aria-hidden="true" />
        {!paragraph && design.imageUri && !hidden('visual') && <div className={s.photo}><ArtworkPhoto design={design} height={height} /></div>}
        <svg className={s.watermark} viewBox="0 0 1080 1080" aria-hidden="true" data-testid="history-watermark">
            <defs><filter id={filterId} x="0" y="0" width="100%" height="100%"><feColorMatrix type="matrix" values="0 0 0 0 .11  0 0 0 0 .09  0 0 0 0 .07  1 1 1 0 -1.5" /></filter></defs>
            <image href="/studio/leaders.png" width="1080" height="1080" filter={`url(#${filterId})`} />
        </svg>
        <div className={s.overlays}>{(['back', 'middle', 'front'] as const).map(layer => <ArtworkPlacedImages key={layer} layerFilter={layer} images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />)}</div>
        <div className={s.content}>
            <header className={s.header}><div className={s.brand}><img src="/studio/leaders.png" alt="The Leaders" /><span>THE LEADERS<small>{t('HISTORY DESK', 'इतिहास डेस्क')}</small></span></div>{fitted(t('TODAY IN HISTORY', 'इतिहासमा आज'), s.stamp, wide ? 6 : 7.5, 4.5, 'label')}</header>
            <div className={s.kicker} {...select('kicker')}>{fitted(hidden('kicker') ? '' : data.subject, s.subject, 7.5, 4.5, 'label')}{fitted([data.dateLabel, paragraph ? year : ''].filter(Boolean).join(' · '), s.date, 7, 4.5, 'label')}</div>
            {paragraph ? <main className={s.paragraph}>
                <div className={s.paragraphHeading} {...select('headline')}>{!hidden('headline') && fitted(design.headline, s.headline, (story ? 30 : wide ? 20 : 26) * design.headlineScale, 9, 'display', 'artwork-headline')}</div>
                <div className={s.paragraphBody} {...select('supporting')}>{!hidden('supporting') && fitted(data.body, s.prose, story ? 17 : wide ? 11 : 13, wide ? 4.5 : 8, 'body', 'artwork-paragraph')}</div>
            </main> : <main className={s.cover}>
                <div className={s.yearHero}>{fitted(year, s.year, story ? 120 : wide ? 66 : 100, wide ? 26 : 32, 'display', 'artwork-year')}<span className={s.timeline} aria-hidden="true"><i /></span></div>
                <div className={s.coverCopy}><div className={s.coverHeading} {...select('headline')}>{!hidden('headline') && fitted(design.headline, s.headline, (story ? 32 : wide ? 20 : 28) * design.headlineScale, wide ? 6.5 : 10, 'display', 'artwork-headline')}</div><div className={s.context} {...select('supporting')}>{!hidden('supporting') && fitted(context, s.prose, story ? 13 : wide ? 9 : 11, wide ? 5 : 6, 'body', 'artwork-deck')}</div></div>
            </main>}
            <footer className={s.footer} {...select('footer')}>{fitted(hidden('footer') ? '' : design.author, s.byline, 6, 4, 'label')}{fitted(t('TODAY IN HISTORY', 'इतिहासमा आज'), s.footerLabel, 6, 4, 'label')}</footer>
        </div>
        <Echo11Promotion variant={design.echo11Variant} seed={design.headline} language={data.language} />
        {guides && <div className={s.guides} aria-hidden="true" />}
    </div>;
});
HistoryArtwork.displayName = 'HistoryArtwork';

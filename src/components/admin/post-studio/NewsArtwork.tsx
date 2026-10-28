"use client";
import { forwardRef, type CSSProperties } from 'react';
import type { CricketArtworkProps } from './CricketArtwork';
import { postOutputDimensions, type PostLayer } from '@/lib/post-studio/types';
import { hasDevanagari } from '@/lib/post-studio/typography';
import { ArtworkPlacedImages } from './ArtworkPlacedImages';
import { Echo11Promotion } from './Echo11Promotion';
import { FittedArtworkText } from './FittedArtworkText';
import css from './NewsArtwork.module.css';

export const NewsArtwork = forwardRef<HTMLDivElement, CricketArtworkProps>(({ design, onSelect, onChooseImage, selected, guides, selectedPlacedImageId, onSelectPlacedImage }, ref) => {
    const [w, h] = postOutputDimensions[design.format], height = 360 * h / w;
    const fact = design.newsStyle === 'do-you-know' || design.newsStyle === 'interesting-facts';
    const wide = design.format === 'landscape', daily = design.newsStyle === 'daily';
    const editorialHeight = height - (wide ? 40 : 56);
    const hidden = (layer: PostLayer) => design.hiddenLayers.includes(layer);
    const select = (layer: PostLayer) => onSelect && !design.lockedLayers.includes(layer) ? { role: 'button', tabIndex: 0, 'aria-label': `Select ${layer}`, 'data-selected': selected === layer || undefined, onClick: () => onSelect(layer), onKeyDown: (event: React.KeyboardEvent) => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); onSelect(layer); } } } : {};
    const fitted = (value: string, kind: 'headline' | 'summary' | 'label' | 'credit', className: string) => <FittedArtworkText text={value} className={className}
        max={kind === 'headline' ? wide ? 25 : design.newsStyle === 'hot' ? 44 : daily ? 35 : 30 : kind === 'summary' ? wide ? 9 : 12 : kind === 'label' ? 11 : 7}
        min={kind === 'headline' ? wide ? 7 : 10 : kind === 'summary' ? wide ? 3.5 : 5 : 4}
        lineHeight={hasDevanagari(value) ? 1.55 : kind === 'headline' ? 1.1 : 1.45}
        style={{ color: design.textColors[kind === 'summary' ? 'supporting' : kind === 'label' ? 'kicker' : kind === 'credit' ? 'footer' : 'headline'] || undefined,
            fontFamily: hasDevanagari(value) ? kind === 'summary' ? 'Hind_400Regular' : 'Hind_700Bold' : (daily || design.newsStyle === 'do-you-know') && kind === 'headline' ? 'Lora_700Bold' : kind === 'summary' ? 'Onest_400Regular' : 'Onest_700Bold' }} />;
    return <div ref={ref} data-testid="post-artwork" className={css.artwork} data-news-style={design.newsStyle} data-has-photo={Boolean(design.imageUri) && !hidden('visual')} data-format={design.format} data-managed-layout="true" style={{ width: 360, height, '--accent': design.accent, background: design.backgroundGradient || (design.backgroundColor === '#0c1820' ? '#f4efe5' : design.backgroundColor) || undefined } as CSSProperties}>
        <div className={css.editorial} data-testid="news-editorial-frame">
        <div className={css.photo} {...select('visual')}>{design.imageUri && !hidden('visual') && <img src={design.imageUri} alt="" className={css.newsPhoto} style={{ objectFit: design.imageFit, transform: `translate(${design.imageOffsetX}px,${design.imageOffsetY}px) scale(${design.imageZoom})`, filter: `blur(${design.imageBlur * .1}px) sepia(${design.imageVintage}%)` }} />}{!design.imageUri && !hidden('visual') && <div className={css.photoPlaceholder}><span>{fact ? '?' : <>THE<br />LEADERS</>}</span>{onChooseImage && <button onClick={event => { event.stopPropagation(); onChooseImage(); }}>＋ Add photo</button>}</div>}</div>
        <ArtworkPlacedImages layerFilter="back" images={design.placedImages} canvasWidth={360} canvasHeight={editorialHeight} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />
        <div className={css.shade} aria-hidden="true" />
        {design.newsStyle === 'hot' && !hidden('kicker') && <div className={css.typeEcho} aria-hidden="true" style={hasDevanagari(design.headline + design.author) ? { fontFamily: 'Hind_700Bold', fontSize: wide ? 58 : 70, lineHeight: 1.15, letterSpacing: -3 } : undefined}><span>{hasDevanagari(design.headline + design.author) ? 'समाचार' : 'NEWS'}</span><span>{hasDevanagari(design.headline + design.author) ? 'समाचार' : 'NEWS'}</span></div>}
        <header className={css.masthead}><img src="/studio/leaders.png" alt="The Leaders" /><span>THE LEADERS<small>{fact ? hasDevanagari(design.headline + design.author) ? 'ज्ञान र जिज्ञासा' : 'KNOWLEDGE & CURIOSITY' : hasDevanagari(design.headline + design.author) ? 'समाचार डेस्क' : 'NEWS DESK'}</small></span>{!hidden('kicker') && <div className={css.category} {...select('kicker')}>{fitted([design.series?.topic || design.category, design.series?.issue ? `#${design.series.issue}` : ''].filter(Boolean).join(' · '), 'label', css.label)}</div>}</header>
        <ArtworkPlacedImages layerFilter="middle" images={design.placedImages} canvasWidth={360} canvasHeight={editorialHeight} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />
        <section className={css.copy}>
            {!hidden('kicker') && <div className={css.kicker} {...select('kicker')}>{fitted(design.eyebrow, 'label', css.label)}</div>}
            {!hidden('headline') && <div className={css.headlineSlot} {...select('headline')}>{fitted(design.headline, 'headline', css.headline)}</div>}
            {!hidden('supporting') && <div className={css.summarySlot} {...select('supporting')}>{fitted(design.summary, 'summary', css.summary)}</div>}
        </section>
        {!hidden('footer') && <footer className={css.footer} {...select('footer')}>{fitted(design.author, 'credit', css.byline)}{fitted(design.imageCredit, 'credit', css.credit)}</footer>}
        <ArtworkPlacedImages layerFilter="front" images={design.placedImages} canvasWidth={360} canvasHeight={editorialHeight} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />
        {guides && <div className={css.guides} aria-hidden="true" />}
        </div>
        <Echo11Promotion variant={design.echo11Variant} seed={design.headline} language={hasDevanagari(design.headline + design.author) ? 'ne' : 'en'} />
    </div>;
});
NewsArtwork.displayName = 'NewsArtwork';

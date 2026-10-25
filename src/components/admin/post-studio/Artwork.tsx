"use client";

import { forwardRef, useId, type CSSProperties } from 'react';
import { vintageMatrix } from '@/lib/post-studio/image-effects';
import { textTypographyStyle } from '@/lib/post-studio/typography';
import { textLineLimit } from '@/lib/post-studio/text-overflow';
import { postOutputDimensions, type PostDesign, type PostLayer, type PostTextLayer } from '@/lib/post-studio/types';
import styles from './PostStudio.module.css';

export function artworkTextStyle(design: PostDesign, layer: PostTextLayer, content?: string): CSSProperties {
    const type = textTypographyStyle(design, layer, content);
    const position = design.textPositions[layer];
    const [, height] = postOutputDimensions[design.format];
    const [width] = postOutputDimensions[design.format];
    return {
        fontFamily: type.fontFamily, fontSize: type.fontSize, lineHeight: `${type.lineHeight}px`,
        fontWeight: 400, ...(type.letterSpacing === undefined ? {} : { letterSpacing: type.letterSpacing }),
        color: design.textColors[layer] || undefined,
        textShadow: `0 ${type.textShadowOffset.height}px ${type.textShadowRadius}px ${type.textShadowColor}`,
        transform: `translate(${position.x * 3.6}px, ${position.y * 3.6 * height / width}px)`,
    };
}

function Photo({ design, height }: { design: PostDesign; height: number }) {
    const id = useId().replace(/[^a-z0-9]/gi, '');
    if (!design.imageUri || design.hiddenLayers.includes('visual')) return null;
    const feather = design.imageFeather * .0045;
    const filtered = design.imageBlur > 0 || design.imageVintage > 0;
    return <svg className={styles.photo} width={360} height={height} viewBox={`0 0 360 ${height}`} aria-hidden="true">
        <defs>
            <filter id={`${id}filter`} x="-25%" y="-25%" width="150%" height="150%">
                {design.imageVintage > 0 && <feColorMatrix type="matrix" values={vintageMatrix(design.imageVintage).join(' ')} />}
                {design.imageBlur > 0 && <feGaussianBlur stdDeviation={design.imageBlur * .16} />}
            </filter>
            {(['horizontal', 'vertical'] as const).map(axis => <linearGradient key={axis} id={`${id}${axis}`} x1="0%" y1="0%" x2={axis === 'horizontal' ? '100%' : '0%'} y2={axis === 'vertical' ? '100%' : '0%'}>
                <stop offset="0" stopColor="white" stopOpacity="0" /><stop offset={feather} stopColor="white" />
                <stop offset={1 - feather} stopColor="white" /><stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>)}
            <mask id={`${id}maskX`} x={0} y={0} width={360} height={height} maskUnits="userSpaceOnUse"><rect width={360} height={height} fill={`url(#${id}horizontal)`} /></mask>
            <mask id={`${id}maskY`} x={0} y={0} width={360} height={height} maskUnits="userSpaceOnUse"><rect width={360} height={height} fill={`url(#${id}vertical)`} /></mask>
        </defs>
        <g transform={`translate(${design.imageOffsetX + 180} ${design.imageOffsetY + height / 2}) scale(${design.imageZoom}) translate(-180 ${-height / 2})`}>
            <g mask={feather > 0 ? `url(#${id}maskX)` : undefined}><g mask={feather > 0 ? `url(#${id}maskY)` : undefined}>
                <image href={design.imageUri} width={360} height={height} preserveAspectRatio={design.imageFit === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice'} filter={filtered ? `url(#${id}filter)` : undefined} />
            </g></g>
        </g>
    </svg>;
}

export const Artwork = forwardRef<HTMLDivElement, {
    design: PostDesign; selected?: PostLayer; guides?: boolean;
    onSelect?: (layer: PostLayer) => void; onChooseImage?: () => void;
}>(({ design, selected, guides, onSelect, onChooseImage }, ref) => {
    const [w, h] = postOutputDimensions[design.format];
    const height = 360 * h / w;
    const hidden = (layer: PostLayer) => design.hiddenLayers.includes(layer);
    const select = (layer: PostLayer) => onSelect && !design.lockedLayers.includes(layer) ? {
        role: 'button', tabIndex: 0, 'aria-label': `Select ${layer === 'supporting' ? 'summary' : layer}`,
        onClick: () => onSelect(layer), onKeyDown: (event: React.KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(layer); } },
    } : {};
    const selectedClass = (layer: PostLayer) => onSelect && selected === layer ? styles.selected : '';
    return <div ref={ref} className={styles.artwork} style={{ width: 360, height }} data-testid="post-artwork">
        <Photo design={design} height={height} />
        {!hidden('visual') && <div className={styles.tint} style={{ background: design.imageTone === 'clear' ? 'rgba(7,9,13,.18)' : design.imageTone === 'warm' ? 'rgba(61,28,14,.38)' : 'rgba(5,7,10,.52)' }} />}
        {onSelect && <div className={styles.visualHit} {...select('visual')} />}
        {!design.imageUri && !hidden('visual') && onChooseImage && <button className={styles.addPhoto} onClick={onChooseImage}>＋ ADD VISUAL</button>}
        <div className={styles.artworkAccent} style={{ background: design.accent }} />
        <div className={styles.artworkContent}>
            <div className={styles.artworkTop}>
                <img src="/studio/leaders.png" alt="The Leaders" width={design.format === 'landscape' ? 32 : 40} height={design.format === 'landscape' ? 32 : 40} />
                {!hidden('kicker') && <div {...select('kicker')} className={`${styles.category} ${selectedClass('kicker')}`} style={{ ...artworkTextStyle(design, 'kicker', design.category), transform: 'none' }}>{design.category || 'NEWS'}</div>}
            </div>
            <div className={styles.artworkCopy} style={{ textAlign: design.textAlign, alignItems: design.textAlign === 'center' ? 'center' : 'flex-start' }}>
                {!hidden('kicker') && <div {...select('kicker')} className={`${styles.kicker} ${selectedClass('kicker')}`} style={artworkTextStyle(design, 'kicker')}>{design.eyebrow || 'THE LEADERS'}</div>}
                {!hidden('headline') && <div {...select('headline')} data-line-limit={textLineLimit(design.format, 'headline')} data-testid="artwork-headline" className={`${styles.headline} ${selectedClass('headline')}`} style={{ ...artworkTextStyle(design, 'headline'), WebkitLineClamp: textLineLimit(design.format, 'headline') }}>{design.headline || 'Your headline belongs here.'}</div>}
                {!hidden('supporting') && <div {...select('supporting')} data-line-limit={textLineLimit(design.format, 'supporting')} className={`${styles.summary} ${selectedClass('supporting')}`} style={{ ...artworkTextStyle(design, 'supporting'), marginTop: design.format === 'landscape' ? 6 : 10, WebkitLineClamp: textLineLimit(design.format, 'supporting') }}>{design.summary}</div>}
            </div>
            {!hidden('footer') && <div {...select('footer')} className={`${styles.artworkFooter} ${selectedClass('footer')}`} style={artworkTextStyle(design, 'footer')}><span>{design.author || 'THE LEADERS DESK'}</span><span>TODAY</span></div>}
        </div>
        {guides && <div className={styles.guides} aria-hidden="true"><div /><i /><b /></div>}
    </div>;
});
Artwork.displayName = 'Artwork';

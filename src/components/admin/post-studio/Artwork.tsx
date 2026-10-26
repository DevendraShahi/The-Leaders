"use client";

import { forwardRef } from 'react';
import { textLineLimit } from '@/lib/post-studio/text-overflow';
import { postOutputDimensions, type PostDesign, type PostLayer } from '@/lib/post-studio/types';
import styles from './PostStudio.module.css';
import { artworkTextStyle } from '@/lib/post-studio/artwork-text';
import { ArtworkPhoto } from './ArtworkPhoto';
import { ArtworkPlacedImages } from './ArtworkPlacedImages';
import { CricketArtwork } from './CricketArtwork';
export { artworkTextStyle } from '@/lib/post-studio/artwork-text';


export const Artwork = forwardRef<HTMLDivElement, {
    design: PostDesign; selected?: PostLayer; guides?: boolean;
    onSelect?: (layer: PostLayer) => void; onChooseImage?: () => void;
    selectedPlacedImageId?: string; onSelectPlacedImage?: (id: string) => void;
}>(({ design, selected, guides, onSelect, onChooseImage, selectedPlacedImageId, onSelectPlacedImage }, ref) => {
    if (design.template === 'cricket') return <CricketArtwork ref={ref} design={design} selected={selected} guides={guides} onSelect={onSelect} onChooseImage={onChooseImage} selectedPlacedImageId={selectedPlacedImageId} onSelectPlacedImage={onSelectPlacedImage} />;
    const [w, h] = postOutputDimensions[design.format];
    const height = 360 * h / w;
    const hidden = (layer: PostLayer) => design.hiddenLayers.includes(layer);
    const select = (layer: PostLayer) => onSelect && !design.lockedLayers.includes(layer) ? {
        role: 'button', tabIndex: 0, 'aria-label': `Select ${layer === 'supporting' ? 'summary' : layer}`,
        onClick: () => onSelect(layer), onKeyDown: (event: React.KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(layer); } },
    } : {};
    const selectedClass = (layer: PostLayer) => onSelect && selected === layer ? styles.selected : '';
    const backgroundStyle = design.backgroundGradient || design.backgroundColor || '#111318';
    return <div ref={ref} className={styles.artwork} style={{ width: 360, height, background: backgroundStyle }} data-testid="post-artwork">
        <ArtworkPhoto design={design} height={height} />
        <ArtworkPlacedImages layerFilter="back" images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />
        {!hidden('visual') && design.imageUri && <div className={styles.tint} style={{ background: design.imageTone === 'clear' ? 'rgba(7,9,13,.18)' : design.imageTone === 'warm' ? 'rgba(61,28,14,.38)' : 'rgba(5,7,10,.52)' }} />}
        {onSelect && <div className={styles.visualHit} {...select('visual')} />}
        {!design.imageUri && !design.backgroundGradient && !design.backgroundColor && !hidden('visual') && onChooseImage && <button className={styles.addPhoto} onClick={onChooseImage}>＋ ADD VISUAL</button>}
        <div className={styles.artworkAccent} style={{ background: design.accent }} />
        <ArtworkPlacedImages layerFilter="middle" images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />
        <div className={styles.artworkContent}>
            <div className={styles.artworkTop}>
                <img src="/studio/leaders.png" alt="The Leaders" width={design.format === 'landscape' ? 32 : 40} height={design.format === 'landscape' ? 32 : 40} />
                {!hidden('kicker') && <div {...select('kicker')} className={`${styles.category} ${selectedClass('kicker')}`} style={{ ...artworkTextStyle(design, 'kicker', design.category), transform: 'none' }}>{design.category || 'NEWS'}</div>}
            </div>
            <div className={styles.artworkCopy} style={{ textAlign: design.textAlign, alignItems: design.textAlign === 'center' ? 'center' : 'flex-start' }}>
                {!hidden('kicker') && <div {...select('kicker')} className={`${styles.kicker} ${selectedClass('kicker')}`} style={artworkTextStyle(design, 'kicker')}>{design.eyebrow || 'THE LEADERS'}</div>}
                {!hidden('headline') && <div {...select('headline')} data-line-limit={textLineLimit(design.format, 'headline', design.template)} data-testid="artwork-headline" className={`${styles.headline} ${selectedClass('headline')}`} style={{ ...artworkTextStyle(design, 'headline'), WebkitLineClamp: textLineLimit(design.format, 'headline', design.template) }}>{design.headline || 'Your headline belongs here.'}</div>}
                {!hidden('supporting') && <div {...select('supporting')} data-line-limit={textLineLimit(design.format, 'supporting', design.template)} className={`${styles.summary} ${selectedClass('supporting')}`} style={{ ...artworkTextStyle(design, 'supporting'), marginTop: design.format === 'landscape' ? 6 : 10, WebkitLineClamp: textLineLimit(design.format, 'supporting', design.template) }}>{design.summary}</div>}
            </div>
            {!hidden('footer') && <div {...select('footer')} className={`${styles.artworkFooter} ${selectedClass('footer')}`} style={artworkTextStyle(design, 'footer')}><span>{design.author || 'THE LEADERS DESK'}</span><span>TODAY</span></div>}
        </div>
        <ArtworkPlacedImages layerFilter="front" images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />
        {guides && <div className={styles.guides} aria-hidden="true"><div /><i /><b /></div>}
    </div>;
});
Artwork.displayName = 'Artwork';

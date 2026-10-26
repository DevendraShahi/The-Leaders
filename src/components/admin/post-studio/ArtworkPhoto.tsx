"use client";

import { useEffect, useId, useState } from 'react';
import { vintageMatrix } from '@/lib/post-studio/image-effects';
import type { PostDesign } from '@/lib/post-studio/types';
import styles from './PostStudio.module.css';

export function ArtworkPhoto({ design, height }: { design: PostDesign; height: number }) {
    const id = useId().replace(/[^a-z0-9]/gi, '');
    const [source, setSource] = useState<{ uri: string; width: number; height: number } | null>(null);
    const uri = design.imageUri;
    useEffect(() => {
        if (!uri) return;
        let active = true;
        const photo = new Image();
        photo.onload = () => { if (active && photo.naturalWidth && photo.naturalHeight) setSource({ uri, width: photo.naturalWidth, height: photo.naturalHeight }); };
        photo.src = uri;
        return () => { active = false; };
    }, [uri]);
    if (!design.imageUri || design.hiddenLayers.includes('visual')) return null;
    const ready = source?.uri === uri;
    const fit = ready ? (design.imageFit === 'contain' ? Math.min : Math.max)(360 / source.width, height / source.height) : 1;
    const photoWidth = ready ? source.width * fit : 360;
    const photoHeight = ready ? source.height * fit : height;
    const feather = design.imageFeather * .0045;
    const filtered = design.imageBlur > 0 || design.imageVintage > 0;
    return <svg className={styles.photo} data-photo-ready={ready} width={360} height={height} viewBox={`0 0 360 ${height}`} aria-hidden="true" style={{ overflow: 'hidden' }}>
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
        <g mask={feather > 0 ? `url(#${id}maskX)` : undefined}><g mask={feather > 0 ? `url(#${id}maskY)` : undefined}>
            <g transform={`translate(${design.imageOffsetX + 180} ${design.imageOffsetY + height / 2}) scale(${design.imageZoom}) translate(-180 ${-height / 2})`}>
                <image href={design.imageUri} x={(360 - photoWidth) / 2} y={(height - photoHeight) / 2} width={photoWidth} height={photoHeight} preserveAspectRatio="none" filter={filtered ? `url(#${id}filter)` : undefined} />
            </g>
        </g></g>
    </svg>;
}

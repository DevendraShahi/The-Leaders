"use client";

import type { CSSProperties } from 'react';
import type { PlacedImage } from '@/lib/post-studio/types';

interface ArtworkPlacedImagesProps {
    images?: PlacedImage[];
    canvasWidth?: number;
    canvasHeight: number;
    selectedId?: string;
    onSelectImage?: (id: string) => void;
    isInteractive?: boolean;
    layerFilter?: 'back' | 'middle' | 'front' | 'all';
}

export function ArtworkPlacedImages({
    images,
    canvasWidth = 360,
    canvasHeight,
    selectedId,
    onSelectImage,
    isInteractive = false,
    layerFilter = 'all',
}: ArtworkPlacedImagesProps) {
    if (!images || images.length === 0) return null;

    const filtered = images.filter((img) => {
        if (img.hidden) return false;
        if (layerFilter === 'all') return true;
        const imgLayer = img.layer || 'back';
        return imgLayer === layerFilter;
    });

    if (filtered.length === 0) return null;

    const containerZIndex = layerFilter === 'front' ? 10 : layerFilter === 'middle' ? 4 : 1;

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: isInteractive ? 'auto' : 'none',
                zIndex: containerZIndex,
                overflow: 'hidden',
            }}
            aria-hidden="true"
        >
            {filtered.map((img) => {
                const baseWidth = img.width ?? 140;
                const baseHeight = img.height ?? 140;
                const scale = img.scale ?? 1;
                const renderWidth = baseWidth * scale;
                const renderHeight = baseHeight * scale;

                let originX = (canvasWidth - renderWidth) / 2;
                let originY = (canvasHeight - renderHeight) / 2;

                switch (img.placement) {
                    case 'top-left':
                        originX = 16;
                        originY = 24;
                        break;
                    case 'top-right':
                        originX = canvasWidth - renderWidth - 16;
                        originY = 24;
                        break;
                    case 'bottom-left':
                        originX = 16;
                        originY = canvasHeight - renderHeight - 32;
                        break;
                    case 'bottom-right':
                        originX = canvasWidth - renderWidth - 16;
                        originY = canvasHeight - renderHeight - 32;
                        break;
                    case 'split-left':
                        originX = -renderWidth * 0.15;
                        originY = (canvasHeight - renderHeight) / 2;
                        break;
                    case 'split-right':
                        originX = canvasWidth - renderWidth * 0.85;
                        originY = (canvasHeight - renderHeight) / 2;
                        break;
                    case 'center':
                    case 'custom':
                    default:
                        originX = (canvasWidth - renderWidth) / 2;
                        originY = (canvasHeight - renderHeight) / 2;
                        break;
                }

                const posX = originX + (img.x || 0);
                const posY = originY + (img.y || 0);
                const isSelected = isInteractive && selectedId === img.id;

                const wrapperStyle: CSSProperties = {
                    position: 'absolute',
                    left: `${posX}px`,
                    top: `${posY}px`,
                    width: `${renderWidth}px`,
                    height: `${renderHeight}px`,
                    transform: img.rotation ? `rotate(${img.rotation}deg)` : undefined,
                    opacity: img.opacity ?? 1,
                    cursor: isInteractive ? 'pointer' : 'default',
                    outline: isSelected ? '1.5px solid #00e5ff' : 'none',
                    outlineOffset: isSelected ? '1px' : undefined,
                    borderRadius: `${img.borderRadius ?? 0}px`,
                    boxShadow: isSelected ? '0 0 10px rgba(0, 229, 255, 0.45)' : undefined,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: isInteractive ? 'auto' : 'none',
                    userSelect: 'none',
                };

                const imgStyle: CSSProperties = {
                    width: '100%',
                    height: '100%',
                    objectFit: img.fit ?? 'contain',
                    borderRadius: `${img.borderRadius ?? 0}px`,
                    display: 'block',
                    pointerEvents: 'none',
                };

                return (
                    <div
                        key={img.id}
                        style={wrapperStyle}
                        onClick={(e) => {
                            if (isInteractive && onSelectImage) {
                                e.stopPropagation();
                                onSelectImage(img.id);
                            }
                        }}
                    >
                        <img src={img.uri} alt="" style={imgStyle} />
                        {isSelected && (
                            <>
                                <span style={{ position: 'absolute', top: -4, left: -4, width: 7, height: 7, background: '#ffffff', border: '1.5px solid #00e5ff', borderRadius: 1.5, pointerEvents: 'none' }} />
                                <span style={{ position: 'absolute', top: -4, right: -4, width: 7, height: 7, background: '#ffffff', border: '1.5px solid #00e5ff', borderRadius: 1.5, pointerEvents: 'none' }} />
                                <span style={{ position: 'absolute', bottom: -4, left: -4, width: 7, height: 7, background: '#ffffff', border: '1.5px solid #00e5ff', borderRadius: 1.5, pointerEvents: 'none' }} />
                                <span style={{ position: 'absolute', bottom: -4, right: -4, width: 7, height: 7, background: '#ffffff', border: '1.5px solid #00e5ff', borderRadius: 1.5, pointerEvents: 'none' }} />
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

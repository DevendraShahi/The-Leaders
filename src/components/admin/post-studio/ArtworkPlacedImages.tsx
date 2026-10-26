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
}

export function ArtworkPlacedImages({
    images,
    canvasWidth = 360,
    canvasHeight,
    selectedId,
    onSelectImage,
    isInteractive = false,
}: ArtworkPlacedImagesProps) {
    if (!images || images.length === 0) return null;

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: isInteractive ? 'auto' : 'none',
                zIndex: 3,
                overflow: 'hidden',
            }}
            aria-hidden="true"
        >
            {images.map((img) => {
                const baseWidth = img.width ?? 120;
                const baseHeight = img.height ?? 120;
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
                        originX = 0;
                        originY = (canvasHeight - renderHeight) / 2;
                        break;
                    case 'split-right':
                        originX = canvasWidth - renderWidth;
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
                    outline: isSelected ? '2px solid #b71c1c' : undefined,
                    outlineOffset: isSelected ? '3px' : undefined,
                    borderRadius: `${img.borderRadius ?? 0}px`,
                    boxShadow: isSelected ? '0 0 12px rgba(183, 28, 28, 0.4)' : undefined,
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
                    </div>
                );
            })}
        </div>
    );
}

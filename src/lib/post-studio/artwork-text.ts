import type { CSSProperties } from 'react';
import { textTypographyStyle } from './typography';
import { postOutputDimensions, type PostDesign, type PostTextLayer } from './types';

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

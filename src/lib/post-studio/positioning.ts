// Ported from mobile/src/features/post-designer; keep artwork behavior in sync.
import { postExportReferenceWidth, postOutputDimensions, defaultTextPositions, type PostDesign, type PostTextLayer } from "./types";

export function textPositionStyle(design: PostDesign, layer: PostTextLayer) {
    const position = design.textPositions?.[layer] ?? { x: 0, y: 0 };
    const [width, height] = postOutputDimensions[design.format];
    return { transform: [{ translateX: position.x * postExportReferenceWidth / 100 }, { translateY: position.y * postExportReferenceWidth * height / width / 100 }] };
}
export function positionText(design: PostDesign, layer: PostTextLayer, patch: Partial<{ x: number; y: number }>): PostDesign {
    if (design.lockedLayers.includes(layer)) return design;
    const current = design.textPositions?.[layer] ?? { x: 0, y: 0 };
    const clamp = (value: number) => Number.isFinite(value) ? Math.max(-50, Math.min(50, value)) : 0;
    return { ...design, textPositions: { ...(design.textPositions ?? defaultTextPositions()), [layer]: { x: clamp(patch.x ?? current.x), y: clamp(patch.y ?? current.y) } } };
}

export function snapTextPosition(value: number, enabled: boolean) {
    return enabled && Math.abs(value) <= 1.5 ? 0 : value;
}

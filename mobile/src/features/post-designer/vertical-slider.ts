export const TRACK_HEIGHT = 168;
export const THUMB = 26;
export function valueFromVerticalPoint(y: number, min: number, max: number, step: number) {
    const progress = Math.max(0, Math.min(1, (y - THUMB / 2) / (TRACK_HEIGHT - THUMB)));
    return Math.max(min, Math.min(max, Math.round((min + progress * (max - min)) / step) * step));
}

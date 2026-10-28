import { describe, expect, it } from 'vitest';
import { mediaRect, overlayDimensions, overlayVideoMime, wrapOverlayText } from '@/lib/post-studio/media-overlay';

describe('media overlays', () => {
    it('preserves source proportions while limiting original video output to 1920 and even pixels', () => {
        expect(overlayDimensions('original', 3840, 2160)).toEqual([1920, 1080]);
        expect(overlayDimensions('original', 720, 1280)).toEqual([720, 1280]);
        const [w, h] = overlayDimensions('original', 4033, 3023);
        expect(w % 2).toBe(0); expect(h % 2).toBe(0); expect(w).toBeLessThanOrEqual(1920);
        expect(overlayDimensions('story', 500, 500)).toEqual([1080, 1920]);
    });
    it('crops the selected edge or contains the full frame without stretching', () => {
        expect(mediaRect(1920, 1080, 1080, 1080, 'cover', 0).x).toBeCloseTo(0);
        expect(mediaRect(1920, 1080, 1080, 1080, 'cover', 100).x).toBe(-840);
        expect(mediaRect(1920, 1080, 1080, 1080, 'contain')).toEqual({ x: 0, y: 236.25, width: 1080, height: 607.5 });
    });
    it('wraps words and explicit line breaks without losing content or Nepali graphemes', () => {
        const measure = (text: string) => Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)).length;
        expect(wrapOverlayText('A useful\nnews headline', 10, measure)).toEqual(['A useful', 'news', 'headline']);
        const text = 'काठमाडौंकासमाचारहरू';
        const lines = wrapOverlayText(text, 4, measure);
        expect(lines.join('')).toBe(text);
        lines.forEach(line => expect(measure(line)).toBeLessThanOrEqual(4));
    });
    it('selects only supported real recording formats', () => {
        expect(overlayVideoMime(mime => mime.startsWith('video/mp4'))).toContain('video/mp4');
        expect(overlayVideoMime(mime => mime === 'video/webm')).toBe('video/webm');
        expect(overlayVideoMime(() => false)).toBeUndefined();
    });
});

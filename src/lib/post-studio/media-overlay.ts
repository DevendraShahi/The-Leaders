import { postOutputDimensions, type PostFormat } from './types';

export const overlayTemplates = [
    { id: 'signature', title: 'Signature', description: 'Logo and a subtle watermark. Let the picture speak.' },
    { id: 'lower-third', title: 'News lower third', description: 'A compact headline anchored to the bottom.' },
    { id: 'editorial', title: 'Editorial', description: 'A bold headline with a red newsroom accent.' },
] as const;
export type OverlayTemplate = typeof overlayTemplates[number]['id'];
export type OverlaySettings = {
    template: OverlayTemplate; format: PostFormat | 'original'; headline: string; label: string; credit: string;
    logoPosition: 'top-left' | 'top-right'; logoSize: number; watermark: number;
    shade: number; fit: 'cover' | 'contain'; focusX: number; focusY: number;
};
export const defaultOverlaySettings: OverlaySettings = {
    template: 'lower-third', format: 'original', headline: '', label: '', credit: '',
    logoPosition: 'top-left', logoSize: 8, watermark: 8, shade: 70, fit: 'cover', focusX: 50, focusY: 50,
};
export function overlayDimensions(format: OverlaySettings['format'], width: number, height: number): readonly [number, number] {
    if (format !== 'original') return postOutputDimensions[format];
    const scale = Math.min(1, 1920 / Math.max(width, height));
    // Even dimensions also work with video encoders that require 4:2:0 frames.
    return [Math.max(2, Math.round(width * scale / 2) * 2), Math.max(2, Math.round(height * scale / 2) * 2)];
}
export function mediaRect(sw: number, sh: number, w: number, h: number, fit: 'cover' | 'contain', x = 50, y = 50) {
    const scale = fit === 'cover' ? Math.max(w / sw, h / sh) : Math.min(w / sw, h / sh);
    return { x: (w - sw * scale) * Math.max(0, Math.min(100, x)) / 100, y: (h - sh * scale) * Math.max(0, Math.min(100, y)) / 100, width: sw * scale, height: sh * scale };
}
export function wrapOverlayText(text: string, maxWidth: number, measure: (text: string) => number): string[] {
    const lines: string[] = [];
    for (const paragraph of text.trim().split(/\n/)) {
        let line = '';
        for (const word of paragraph.trim().split(/\s+/)) {
            if (!word) continue;
            if (line && measure(`${line} ${word}`) > maxWidth) { lines.push(line); line = ''; }
            if (measure(word) > maxWidth) {
                // Segment by grapheme so Nepali conjuncts and combining marks stay together.
                const segments = Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(word), item => item.segment);
                for (const part of segments) {
                    if (line && measure(line + part) > maxWidth) { lines.push(line); line = ''; }
                    line += part;
                }
            } else line = line ? `${line} ${word}` : word;
        }
        if (line) lines.push(line);
    }
    return lines;
}
function font(text: string, size: number, bold = false) {
    return `${size}px ${/[\u0900-\u097f]/.test(text) ? bold ? 'Hind_700Bold' : 'Hind_400Regular' : bold ? 'Onest_700Bold' : 'Onest_400Regular'}`;
}
function fittedText(ctx: CanvasRenderingContext2D, text: string, width: number, max: number, min: number, maxLines: number, bold = false) {
    let size = max, lines: string[] = [];
    do { ctx.font = font(text, size, bold); lines = wrapOverlayText(text, width, value => ctx.measureText(value).width); if (lines.length <= maxLines) break; size -= 1; } while (size >= min);
    ctx.font = font(text, Math.max(min, size), bold);
    return { size: Math.max(min, size), lines };
}
export type OverlayMedia = { source: CanvasImageSource; width: number; height: number };
/** One renderer for preview, photo export, transparent artwork, and every video frame. */
export function drawMediaOverlay(canvas: HTMLCanvasElement, settings: OverlaySettings, logo: HTMLImageElement, media?: OverlayMedia, transparent = false) {
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas rendering is unavailable in this browser.');
    const w = canvas.width, h = canvas.height, unit = Math.min(w, h), pad = unit * .055;
    ctx.clearRect(0, 0, w, h);
    if (!transparent) {
        ctx.fillStyle = '#091118'; ctx.fillRect(0, 0, w, h);
        if (media) { const r = mediaRect(media.width, media.height, w, h, settings.fit, settings.focusX, settings.focusY); ctx.drawImage(media.source, r.x, r.y, r.width, r.height); }
    }
    const logoSize = unit * settings.logoSize / 100;
    ctx.drawImage(logo, settings.logoPosition === 'top-right' ? w - pad - logoSize : pad, pad, logoSize, logoSize);
    if (settings.watermark > 0) {
        ctx.save(); ctx.globalAlpha = settings.watermark / 100;
        const size = unit * .14; ctx.drawImage(logo, w - pad - size, h * .49 - size / 2, size, size); ctx.restore();
    }
    ctx.textBaseline = 'top'; ctx.fillStyle = '#fff';
    const bottom = h - pad, credit = settings.credit.trim();
    const creditSize = unit * .02, creditHeight = credit ? creditSize * 2.8 : 0;
    const headline = settings.template === 'signature' ? '' : settings.headline.trim();
    const label = settings.template === 'signature' ? '' : settings.label.trim();
    const textWidth = w - pad * 2 - (settings.template === 'editorial' ? unit * .025 : 0);
    const title = fittedText(ctx, headline, textWidth, unit * (settings.template === 'editorial' ? .068 : .05), unit * .025, 4, true);
    const lineHeight = title.size * (/[\u0900-\u097f]/.test(headline) ? 1.5 : 1.22);
    const labelHeight = label ? unit * .055 : 0;
    const blockHeight = title.lines.length * lineHeight + labelHeight + creditHeight;
    const top = bottom - blockHeight;
    if (blockHeight > 0) {
        const gradient = ctx.createLinearGradient(0, Math.max(h * .3, top - unit * .14), 0, h);
        gradient.addColorStop(0, 'rgba(0,0,0,0)'); gradient.addColorStop(.6, `rgba(0,0,0,${settings.shade / 100 * .9})`); gradient.addColorStop(1, `rgba(0,0,0,${settings.shade / 100})`);
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
    }
    let textX = pad;
    if (settings.template === 'editorial' && headline) { ctx.fillStyle = '#bf171e'; ctx.fillRect(pad, top, unit * .008, blockHeight - creditHeight); textX += unit * .025; }
    if (label) {
        ctx.font = font(label, unit * .022, true);
        const badgeWidth = ctx.measureText(label).width + unit * .035;
        ctx.fillStyle = '#bf171e'; ctx.fillRect(textX, top, badgeWidth, unit * .037);
        ctx.fillStyle = '#fff'; ctx.fillText(label, textX + unit * .0175, top + unit * .005);
    }
    ctx.font = font(headline, title.size, true); ctx.fillStyle = '#fff';
    title.lines.forEach((line, i) => ctx.fillText(line, textX, top + labelHeight + i * lineHeight));
    if (credit) {
        const fitted = fittedText(ctx, credit, w - 2 * pad, creditSize, unit * .012, 2);
        ctx.fillStyle = '#e6e6e6'; fitted.lines.forEach((line, i) => ctx.fillText(line, pad, bottom - creditHeight + unit * .012 + i * fitted.size * 1.35));
    }
}
export function overlayVideoMime(isSupported: (mime: string) => boolean): string | undefined {
    return ['video/mp4;codecs=avc1.42001E,mp4a.40.2', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(isSupported);
}

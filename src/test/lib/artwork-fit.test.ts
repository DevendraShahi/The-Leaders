import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('html-to-image', () => ({ toCanvas: vi.fn() }));
import { artworkBytes } from '@/lib/post-studio/export';
import { artworkFitIssues } from '@/lib/post-studio/artwork-fit';
beforeEach(() => { Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } }); });
describe('Artwork export preflight', () => {
    it('blocks a Matchday with missing facts before attempting image rendering', async () => {
        const artwork = document.createElement('div');
        artwork.dataset.exportError = 'Start time is required for Matchday.';
        await expect(artworkBytes(artwork, 'portrait')).rejects.toThrow('Start time is required for Matchday.');
    });
    it('blocks a structured cricket card whose content exceeds its reserved body', async () => {
        const artwork = document.createElement('div'), body = document.createElement('div');
        body.setAttribute('data-export-fit', ''); body.textContent = 'An overfull scorecard';
        Object.defineProperties(body, { clientWidth: { value: 316 }, scrollWidth: { value: 316 }, clientHeight: { value: 240 }, scrollHeight: { value: 300 } });
        artwork.appendChild(body);
        expect(artworkFitIssues(artwork)).toEqual([body]);
        await expect(artworkBytes(artwork, 'square')).rejects.toThrow('Artwork content is clipped');
    });
    it('detects an overlong player name and accepts a fitting box', () => {
        const artwork = document.createElement('div'), name = document.createElement('span');
        name.setAttribute('data-export-fit', ''); artwork.appendChild(name);
        Object.defineProperties(name, { clientWidth: { value: 100 }, scrollWidth: { value: 180, configurable: true }, clientHeight: { value: 20 }, scrollHeight: { value: 20 } });
        expect(artworkFitIssues(artwork)).toHaveLength(1);
        Object.defineProperty(name, 'scrollWidth', { value: 100 });
        expect(artworkFitIssues(artwork)).toHaveLength(0);
    });
});

import { describe, expect, it } from 'vitest';
import { shareStyles } from '@/lib/post-studio/shared-styles';
import { defaultPostDesign, type PostDesign } from '@/lib/post-studio/types';
const design = (patch: Partial<PostDesign> = {}): PostDesign => structuredClone({ ...defaultPostDesign, ...patch });
describe('Shared carousel styles', () => {
    it('changes only the selected layer setting during live editing', () => {
        const previous = design(); const source = design(); source.textTypography.headline.font = 'hind';
        const target = design({ headline: 'Unique copy', template: 'book-verdict' });
        target.textTypography.headline.size = 140; target.textTypography.supporting.font = 'onest';
        const next = shareStyles(target, source, ['typography'], previous);
        expect(next.textTypography.headline.font).toBe('hind');
        expect(next.textTypography.headline.size).toBe(140); expect(next.textTypography.supporting.font).toBe('onest');
        expect(next.headline).toBe('Unique copy'); expect(next.template).toBe('book-verdict');
        expect(target.textTypography.headline.font).toBe('auto');
    });
    it('can share image effects without replacing another photo or crop', () => {
        const source = design({ imageUri: 'source', imageBlur: 30, imageTone: 'warm', imageZoom: 2 });
        const target = design({ imageUri: 'target', imageZoom: 1.5, imageOffsetX: 20, backgroundColor: '#123456' });
        expect(shareStyles(target, source, ['effects'])).toMatchObject({ imageUri: 'target', imageZoom: 1.5, imageOffsetX: 20, imageBlur: 30, imageTone: 'warm', backgroundColor: '#123456' });
    });
    it('replaces backgrounds with their full image treatment, including resets', () => {
        const previous = design({ imageUri: 'old' });
        const source = design({ imageUri: 'new', imageTone: 'clear', imageZoom: 1, backgroundColor: null, backgroundGradient: null });
        const target = design({ imageZoom: 2, imageBlur: 50, backgroundGradient: 'linear-gradient(red,black)' });
        expect(shareStyles(target, source, ['background'], previous)).toMatchObject({ imageUri: 'new', imageZoom: 1, imageBlur: 0, imageTone: 'clear', backgroundGradient: null });
    });
    it('preserves locked layers and every page’s copy', () => {
        const source = design({ headline: 'Cover', author: 'Another author', category: 'OTHER', textAlign: 'center', imageUri: 'photo' });
        source.textTypography.headline.font = 'hind'; source.textColors.headline = '#ffffff';
        const target = design({ headline: 'Locked page', author: 'Own author', category: 'OWN', lockedLayers: ['headline', 'visual'] });
        expect(shareStyles(target, source, ['typography', 'alignment', 'colors', 'background'])).toMatchObject({ headline: 'Locked page', author: 'Own author', category: 'OWN', imageUri: null, textAlign: 'left', textTypography: { headline: target.textTypography.headline }, textColors: { headline: null } });
    });
});

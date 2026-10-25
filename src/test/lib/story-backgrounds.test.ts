import { describe, it, expect } from 'vitest';
import { storyGradients, storyColors } from '@/lib/post-studio/story-backgrounds';
import { defaultPostDesign } from '@/lib/post-studio/types';
import { postDesignSchema } from '@/lib/post-studio/drafts';

describe('Instagram Story Backgrounds & Gradients', () => {
    it('has high-quality curated story gradients', () => {
        expect(storyGradients.length).toBeGreaterThanOrEqual(10);
        const sunset = storyGradients.find(g => g.id === 'insta-sunset');
        expect(sunset).toBeDefined();
        expect(sunset?.value).toContain('linear-gradient');
    });

    it('has curated story solid colors', () => {
        expect(storyColors.length).toBeGreaterThanOrEqual(8);
        const crimson = storyColors.find(c => c.id === 'color-crimson');
        expect(crimson).toBeDefined();
        expect(crimson?.value).toBe('#8B0000');
    });

    it('parses post design schema with optional backgroundGradient and backgroundColor', () => {
        const withGradient = {
            ...defaultPostDesign,
            backgroundGradient: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
            backgroundColor: null,
        };
        const parsed = postDesignSchema.safeParse(withGradient);
        expect(parsed.success).toBe(true);
        if (parsed.success) {
            expect(parsed.data.backgroundGradient).toContain('#833ab4');
        }
    });

    it('parses legacy post design without background properties seamlessly', () => {
        const legacy = { ...defaultPostDesign };
        delete (legacy as Record<string, unknown>).backgroundGradient;
        delete (legacy as Record<string, unknown>).backgroundColor;

        const parsed = postDesignSchema.safeParse(legacy);
        expect(parsed.success).toBe(true);
    });
});

import { describe, expect, it } from 'vitest';
import { defaultPostDesign, type PlacedImage } from '@/lib/post-studio/types';
import { defaultCricketData } from '@/lib/post-studio/cricket-data';
import { postDesignSchema, placedImageSchema } from '@/lib/post-studio/drafts';
import { textLineLimit } from '@/lib/post-studio/text-overflow';
import { setTextTypography } from '@/lib/post-studio/typography';
import SocialPost from '@/models/SocialPost';

describe('Studio Enhancements: Summary, Multiple Placed Images & Cricket Logos', () => {
    describe('Summary limitations & typography', () => {
        it('allows expanded text line limits for cricket and explainer formats without affecting breaking format', () => {
            // Standard breaking format maintains its compact lines
            expect(textLineLimit('portrait', 'supporting', 'breaking')).toBe(3);
            expect(textLineLimit('landscape', 'supporting', 'breaking')).toBe(2);
            expect(textLineLimit('story', 'supporting', 'breaking')).toBe(4);

            // Cricket format allows longer commentary and notes
            expect(textLineLimit('portrait', 'supporting', 'cricket')).toBe(12);
            expect(textLineLimit('landscape', 'supporting', 'cricket')).toBe(6);
            expect(textLineLimit('story', 'supporting', 'cricket')).toBe(18);

            // Explainer format supports in-depth explanatory summaries
            expect(textLineLimit('portrait', 'supporting', 'explainer')).toBe(8);
            expect(textLineLimit('landscape', 'supporting', 'explainer')).toBe(5);
            expect(textLineLimit('story', 'supporting', 'explainer')).toBe(12);
        });

        it('supports typography size scaling down to 40% for long summaries', () => {
            const shrunk = setTextTypography(defaultPostDesign, 'supporting', { size: 40 });
            expect(shrunk.textTypography.supporting.size).toBe(40);

            const enlarged = setTextTypography(defaultPostDesign, 'supporting', { size: 180 });
            expect(enlarged.textTypography.supporting.size).toBe(180);
        });

        it('SocialPost model allows long supporting deck copy up to 2000 characters', () => {
            const deckSchema = SocialPost.schema.path('copy.en.deck') as unknown as { options?: { maxlength?: number } };
            expect(deckSchema?.options?.maxlength).toBe(2000);
        });
    });

    describe('Multiple image overlays with placement & scaling support', () => {
        it('validates and parses placed overlay images with custom settings', () => {
            const overlay: PlacedImage = {
                id: 'overlay-1',
                uri: 'data:image/png;base64,sample',
                x: 10,
                y: -15,
                scale: 1.5,
                rotation: 12,
                opacity: 0.85,
                borderRadius: 12,
                fit: 'cover',
                width: 160,
                height: 160,
                placement: 'top-right',
                credit: 'Photo Credit',
            };

            const parsed = placedImageSchema.parse(overlay);
            expect(parsed).toEqual(overlay);
        });

        it('supports multiple placed images in postDesignSchema', () => {
            const images: PlacedImage[] = [
                {
                    id: 'logo-1',
                    uri: 'data:image/png;base64,logo1',
                    x: 0,
                    y: 0,
                    scale: 1,
                    placement: 'top-left',
                },
                {
                    id: 'badge-2',
                    uri: 'data:image/png;base64,badge2',
                    x: 20,
                    y: 40,
                    scale: 1.8,
                    rotation: -5,
                    placement: 'bottom-right',
                },
            ];

            const design = {
                ...defaultPostDesign,
                placedImages: images,
            };

            const validated = postDesignSchema.parse(design);
            expect(validated.placedImages).toHaveLength(2);
            expect(validated.placedImages?.[0].placement).toBe('top-left');
            expect(validated.placedImages?.[1].scale).toBe(1.8);
        });
    });

    describe('Cricket format logo scaling & team name under logo toggle', () => {
        it('initializes default cricket data with logoScale at 100 and showTeamNameUnderLogo as true', () => {
            const cricket = defaultCricketData();
            expect(cricket.logoScale).toBe(100);
            expect(cricket.showTeamNameUnderLogo).toBe(true);
        });

        it('supports customizable logo sizes and toggling team name under logo off', () => {
            const customCricket = defaultCricketData();
            customCricket.logoScale = 150;
            customCricket.showTeamNameUnderLogo = false;

            const design = {
                ...defaultPostDesign,
                template: 'cricket' as const,
                cricket: customCricket,
            };

            const validated = postDesignSchema.parse(design);
            expect(validated.cricket?.logoScale).toBe(150);
            expect(validated.cricket?.showTeamNameUnderLogo).toBe(false);
        });
    });
});

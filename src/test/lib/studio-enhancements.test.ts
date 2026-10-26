import { describe, expect, it } from 'vitest';
import { defaultPostDesign, type PlacedImage } from '@/lib/post-studio/types';
import { defaultCricketData } from '@/lib/post-studio/cricket-data';
import { postDesignSchema, placedImageSchema } from '@/lib/post-studio/drafts';
import { textLineLimit } from '@/lib/post-studio/text-overflow';
import { setTextTypography } from '@/lib/post-studio/typography';
import { isMobileDevice, canNativeShareFile, bytesToFile, download } from '@/lib/post-studio/export';
import { hasSocialPostPermission } from '@/lib/social-access';
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

        it('supports layer depth options (back, middle, front) and hidden/locked flags', () => {
            const overlay: PlacedImage = {
                id: 'player-cutout',
                uri: 'data:image/png;base64,sample',
                x: 0,
                y: 0,
                scale: 1.2,
                layer: 'middle',
                hidden: false,
                locked: true,
            };

            const parsed = placedImageSchema.parse(overlay);
            expect(parsed.layer).toBe('middle');
            expect(parsed.hidden).toBe(false);
            expect(parsed.locked).toBe(true);

            const frontParsed = placedImageSchema.parse({ ...overlay, layer: 'front' });
            expect(frontParsed.layer).toBe('front');

            const backParsed = placedImageSchema.parse({ ...overlay, layer: 'back' });
            expect(backParsed.layer).toBe('back');
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

    describe('Mobile export & error handling enhancements', () => {
        it('detects mobile devices based on User-Agent or touch screen capabilities', () => {
            const originalNavigator = globalThis.navigator;
            const originalWindow = globalThis.window;

            // Test Android UA
            Object.defineProperty(globalThis, 'navigator', {
                value: { userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36', maxTouchPoints: 5 },
                configurable: true,
            });
            expect(isMobileDevice()).toBe(true);

            // Test iPhone UA
            Object.defineProperty(globalThis, 'navigator', {
                value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)', maxTouchPoints: 5 },
                configurable: true,
            });
            expect(isMobileDevice()).toBe(true);

            // Test Desktop UA with 0 touch points and wide screen
            Object.defineProperty(globalThis, 'navigator', {
                value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', maxTouchPoints: 0 },
                configurable: true,
            });
            Object.defineProperty(globalThis, 'window', {
                value: { innerWidth: 1440 },
                configurable: true,
            });
            expect(isMobileDevice()).toBe(false);

            // Restore
            Object.defineProperty(globalThis, 'navigator', { value: originalNavigator, configurable: true });
            Object.defineProperty(globalThis, 'window', { value: originalWindow, configurable: true });
        });

        it('checks native share capability for files safely', () => {
            const file = bytesToFile(new Uint8Array([1, 2, 3]), 'test.png', 'image/png');
            expect(file).toBeInstanceOf(File);
            expect(file.name).toBe('test.png');
            expect(file.type).toBe('image/png');

            // When navigator has no share/canShare
            const originalNavigator = globalThis.navigator;
            Object.defineProperty(globalThis, 'navigator', {
                value: {},
                configurable: true,
            });
            expect(canNativeShareFile(file)).toBe(false);

            // When navigator.canShare returns true
            Object.defineProperty(globalThis, 'navigator', {
                value: {
                    share: () => Promise.resolve(),
                    canShare: ({ files }: { files?: File[] }) => Boolean(files && files.length > 0),
                },
                configurable: true,
            });
            expect(canNativeShareFile(file)).toBe(true);

            Object.defineProperty(globalThis, 'navigator', { value: originalNavigator, configurable: true });
        });

        it('download creates an anchor, clicks it, and revokes the URL without throwing', () => {
            const bytes = new Uint8Array([137, 80, 78, 71]);
            const url = download(bytes, 'output.png', 'image/png');
            expect(url).toMatch(/^blob:/);
        });

        it('allows all editor and user accounts to export social graphics regardless of role or permissions', () => {
            const editorUser: any = { userId: 'editor-1', role: 'editorial', permissions: { socialPosts: { export: false } } };
            const ctoUser: any = { userId: 'cto-1', role: 'cto', permissions: {} };
            const fallbackUser: any = { userId: 'unknown-1', role: 'writer' };

            expect(hasSocialPostPermission(editorUser, 'export')).toBe(true);
            expect(hasSocialPostPermission(ctoUser, 'export')).toBe(true);
            expect(hasSocialPostPermission(fallbackUser, 'export')).toBe(true);
        });
    });
});

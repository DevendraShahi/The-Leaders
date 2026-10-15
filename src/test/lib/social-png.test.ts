// @vitest-environment node
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { createSocialPostSvg } from '@/lib/social-artboard';
import { socialPostDimensions } from '@/lib/social-post';
import { samplePost } from '../studio-preview/fixture';

describe('Social Studio PNG geometry', () => {
    for (const format of ['square', 'portrait', 'story'] as const) for (const outputLanguage of ['en', 'ne'] as const) {
        it(`renders ${format} / ${outputLanguage} at its exact output dimensions`, async () => {
            const post = { ...samplePost(), format, outputLanguage };
            const photo = await readFile(new URL('../../../public/media/hero-election.png', import.meta.url));
            const svg = createSocialPostSvg(post as unknown as Parameters<typeof createSocialPostSvg>[0], `data:image/png;base64,${photo.toString('base64')}`, { width: 1536, height: 1024 });
            const png = await sharp(Buffer.from(svg)).png().toBuffer();
            const metadata = await sharp(png).metadata();
            expect([metadata.width, metadata.height]).toEqual(socialPostDimensions[format]);
            expect(metadata.format).toBe('png');
            expect(svg).toContain('THE LEADERS');
        });
    }
});

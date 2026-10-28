import { describe, expect, it } from 'vitest';
import { cssImageUrls } from '@/lib/post-studio/export-assets';
describe('Export background resource discovery', () => {
    it('finds all image layers while preserving complete signed/query URLs', () => {
        expect(cssImageUrls('linear-gradient(red,blue), url("https://example.org/image?w=100&token=abc"),url(/background.png)')).toEqual(['https://example.org/image?w=100&token=abc', '/background.png']);
    });
    it('keeps data images and local SVG references intact', () => {
        expect(cssImageUrls("url('data:image/png;base64,abcd'), url(#mask)")).toEqual(['data:image/png;base64,abcd', '#mask']);
        expect(cssImageUrls('none')).toEqual([]);
    });
});

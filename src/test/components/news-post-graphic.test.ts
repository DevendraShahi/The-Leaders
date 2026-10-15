import { describe, expect, it } from 'vitest';
import { postGraphicDimensions, wrapPostGraphicText } from '@/components/admin/news-post-graphic';

describe('news post graphic formats', () => {
    it('uses stable production dimensions for every supported format', () => {
        expect(postGraphicDimensions).toEqual({
            square: [1080, 1080],
            portrait: [1080, 1350],
            landscape: [1200, 750],
        });
    });

    it('keeps every word when wrapping copy, including an unbroken long word', () => {
        const measure = (value: string) => Array.from(value).length * 10;
        const lines = wrapPostGraphicText('A factual supercalifragilisticexpialidocious update', 80, measure);

        expect(lines).toEqual(['A', 'factual', 'supercal', 'ifragili', 'sticexpi', 'alidocio', 'us', 'update']);
        expect(lines.join(' ').replaceAll(' ', '')).toBe('Afactualsupercalifragilisticexpialidociousupdate');
        expect(lines.every((line) => measure(line) <= 80)).toBe(true);
    });
});

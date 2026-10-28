import { describe, expect, it, vi } from 'vitest';
import { echo11Lines, echo11Variant, randomEcho11Variant } from '@/lib/post-studio/echo11-copy';
import { postDesignSchema } from '@/lib/post-studio/drafts';
import { defaultPostDesign } from '@/lib/post-studio/types';
describe('echo11 bilingual rotations', () => {
    it('retains all eight approved pairs and selects every one across the random range', () => {
        expect(echo11Lines).toHaveLength(8);
        expect(echo11Lines[0].ne).toBe('तपाईंको व्यवसायको वेबसाइट छैन? हामी बनाउँछौँ।');
        expect(echo11Lines[7].en).toBe('Your business. Your website.');
        expect(echo11Lines[0].subtext.en).toBe("Let's discuss your project.");
        expect(echo11Lines[7].subtext.ne).toBe('केही सोध्न चाहनुहुन्छ? म्यासेज गर्नुहोस्।');
        for (let i = 0; i < 8; i++) {
            const random = vi.spyOn(Math, 'random').mockReturnValue((i + .5) / 8);
            expect(randomEcho11Variant()).toBe(i); random.mockRestore();
            const saved = postDesignSchema.parse({ ...defaultPostDesign, echo11Variant: i });
            expect(echo11Variant(saved.echo11Variant, 'changed headline')).toBe(i);
            expect(echo11Lines[i].en).toBeTruthy(); expect(echo11Lines[i].ne).toBeTruthy();
            expect(echo11Lines[i].subtext.en).toBeTruthy(); expect(echo11Lines[i].subtext.ne).toBeTruthy();
        }
    });
    it('provides deterministic old-draft choices and rejects invalid saved indices', () => {
        expect(echo11Variant(undefined, 'saved-draft-id')).toBe(echo11Variant(undefined, 'saved-draft-id'));
        expect(postDesignSchema.safeParse({ ...defaultPostDesign, echo11Variant: 8 }).success).toBe(false);
    });
});

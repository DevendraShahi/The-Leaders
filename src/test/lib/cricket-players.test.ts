import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { findPlayers, nplPlayers, playerPhotoCredit } from '@/lib/post-studio/cricket-players';
import { nplTeamIds } from '@/lib/post-studio/cricket-catalog';
import { createCricketDesign } from '@/lib/post-studio/cricket-design';
import { replaceImage } from '@/lib/post-studio/image-positioning';
import { shareStyles } from '@/lib/post-studio/shared-styles';
import { postDesignSchema } from '@/lib/post-studio/drafts';
import { generateCricketCaption } from '@/lib/post-studio/cricket-caption';
import type { PostDraft } from '@/lib/post-studio/drafts';
describe('Reviewed NPL player catalog', () => {
    it('has unique players, sourced roster entries, and local photos for every team', () => {
        expect(new Set(nplPlayers.map(player => player.id)).size).toBe(nplPlayers.length);
        for (const team of nplTeamIds) expect(findPlayers(team).length).toBeGreaterThan(0);
        for (const player of nplPlayers) {
            expect(nplTeamIds).toContain(player.teamId);
            expect(player.profileUrl).toMatch(/^https:\/\/nepalpremierleague.org\/players\//);
            if (!player.photo?.url) continue;
            expect(player.photo.sourceUrl).toMatch(/^https:\/\//);
            expect(player.photo.credit).toBeTruthy(); expect(player.photo.license).toBeTruthy();
            expect(existsSync(`public${player.photo.url}`)).toBe(true);
            expect(existsSync(`public${player.photo.thumbnailUrl}`)).toBe(true);
            expect(player.photo.width).toBeGreaterThan(100); expect(player.photo.height).toBeGreaterThan(100);
        }
        expect(findPlayers('lumbini', 'aasif').map(player => player.id)).toContain('aasif-sheikh');
        expect(findPlayers('janakpur', 'aasif', false)).toHaveLength(0);
    });
    it('persists credit, shares it with the image, includes it in captions, and clears it on replacement', () => {
        const player = findPlayers('kathmandu', 'karan')[0];
        const design = createCricketDesign('batting');
        const inserted = { ...design, imageUri: 'data:image/webp;base64,test', imageCredit: playerPhotoCredit(player) };
        expect(postDesignSchema.parse(inserted).imageCredit).toContain(player.photo!.license);
        expect(shareStyles(design, inserted, ['background']).imageCredit).toBe(inserted.imageCredit);
        expect(generateCricketCaption([{ design: inserted } as PostDraft])).toContain(player.photo!.sourceUrl);
        expect(replaceImage(inserted, 'different').imageCredit).toBe('');
        expect(generateCricketCaption([{ design: { ...inserted, imageUri: null } } as PostDraft])).not.toContain(player.photo!.sourceUrl);
    });
});

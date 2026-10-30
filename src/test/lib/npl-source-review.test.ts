import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import sharp from 'sharp';
import { getAllNplPlayers, getNplTeamsData } from '@/lib/npl-data';
import { getPlayerComputedMeta } from '@/lib/npl-player-meta';
import { findPlayers, nplPlayers } from '@/lib/post-studio/cricket-players';

describe('NPL source reconciliation', () => {
    it('keeps public and Studio player identities aligned and removes duplicate aliases', () => {
        const players = getAllNplPlayers();
        expect(new Set(players.map(player => player.id)).size).toBe(players.length);
        for (const player of players) {
            expect(nplPlayers.find(item => item.id === player.id)?.teamId).toBe(player.teamId);
            expect(player.sourceReview?.sourceUrl).toMatch(/^https:\/\/nplt20league.com\//);
            expect(existsSync(`public${player.image.local}`)).toBe(true);
            expect(existsSync(`public${player.image.thumbnail}`)).toBe(true);
        }
        for (const alias of ['k-s-bharat', 'bibek-magar', 'bipin-archarya']) expect(nplPlayers.some(player => player.id === alias)).toBe(false);
    });
    it('keeps unavailable career statistics unknown for new squad additions', () => {
        const players = getAllNplPlayers().filter(player => player.sourceReview?.statistics === 'unavailable');
        expect(players).toHaveLength(21);
        for (const player of players) {
            expect(player.stats.matches).toBeNull(); expect(player.stats.runs).toBeNull(); expect(player.stats.wickets).toBeNull();
            const team = getNplTeamsData().find(team => team.id === player.teamId)!;
            const meta = getPlayerComputedMeta(player, team);
            expect(meta.jerseyNumber).toBeNull(); expect(meta.records).toEqual([]); expect(meta.careerSpan).toBe('Not verified');
        }
    });
    it('provides a ready portrait for every canonical player without public placeholders', () => {
        const ready = findPlayers('all');
        expect(ready).toHaveLength(nplPlayers.length);
        for (const player of getAllNplPlayers()) expect(player.image.local).not.toContain('placeholder');
        expect(nplPlayers.find(player => player.id === 'sam-heazlett')?.photo?.kind).toBe('user-supplied');
    });
    it('finds the supplied portrait by the user’s Jisan spelling', () => {
        expect(findPlayers('biratnagar', 'Jisan Alam').map(player => player.id)).toContain('jishan-alam');
        const photo = nplPlayers.find(player => player.id === 'jishan-alam')!.photo!;
        expect(photo.kind).toBe('user-supplied');
        expect(photo.credit).not.toContain('ICC');
    });
    it('uses real transparent replacements, with matching public and Studio URLs', async () => {
        for (const id of ['scott-kuggeleijn', 'usama-mir', 'shamim-hossain', 'jishan-alam', 'hunain-shah', 'haider-ali', 'will-bosisto', 'sam-heazlett']) {
            const player = nplPlayers.find(player => player.id === id)!;
            const file = `public${player.photo!.url}`;
            const metadata = await sharp(file).metadata(), stats = await sharp(file).stats();
            expect(metadata.hasAlpha).toBe(true); expect(stats.channels[metadata.channels! - 1].min).toBeLessThan(255);
            expect(metadata.width).toBeGreaterThan(1000);
            expect(getAllNplPlayers().find(item => item.id === id)?.image.local).toBe(player.photo!.url);
        }
    });
});

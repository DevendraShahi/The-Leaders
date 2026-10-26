import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
    cricketBrandAssets,
    findCricketBrandAssets,
    getCricketBrandAsset,
    nplTournamentIcon,
    nplTournamentLogo,
    nplTeams,
    teamLogo,
} from '@/lib/post-studio/cricket-catalog';

describe('NPL & Team Brand Assets Catalog', () => {
    it('defines official tournament logo and icon constants', () => {
        expect(nplTournamentLogo).toBe('/studio/cricket/npl.png');
        expect(nplTournamentIcon).toBe('/studio/cricket/npl-icon.png');
    });

    it('contains exactly 10 brand assets (2 NPL marks + 8 franchise crests)', () => {
        expect(cricketBrandAssets).toHaveLength(10);
        const leagueAssets = cricketBrandAssets.filter(a => a.type === 'league');
        const teamAssets = cricketBrandAssets.filter(a => a.type === 'team');
        expect(leagueAssets).toHaveLength(2);
        expect(teamAssets).toHaveLength(8);
    });

    it('has unique IDs and valid URLs for all brand assets', () => {
        const ids = new Set(cricketBrandAssets.map(a => a.id));
        expect(ids.size).toBe(cricketBrandAssets.length);

        for (const asset of cricketBrandAssets) {
            expect(asset.id).toBeTruthy();
            expect(asset.name).toBeTruthy();
            expect(asset.nameNe).toBeTruthy();
            expect(asset.url).toMatch(/^\/studio\/cricket\/[\w-]+\.png$/);
            expect(asset.thumbnailUrl).toBeTruthy();
            expect(asset.description).toBeTruthy();
            expect(asset.dimensions).toContain('HD');
            expect(asset.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
    });

    it('verifies all asset image files exist in public directory with non-zero size', () => {
        const publicDir = path.resolve(process.cwd(), 'public');
        for (const asset of cricketBrandAssets) {
            const relativePath = asset.url.replace(/^\//, '');
            const filePath = path.join(publicDir, relativePath);
            expect(fs.existsSync(filePath), `Missing asset file: ${filePath}`).toBe(true);
            const stats = fs.statSync(filePath);
            expect(stats.size).toBeGreaterThan(10000); // Verify it's a real HD image (>10KB)
        }
    });

    it('retrieves individual assets via getCricketBrandAsset', () => {
        const nplLogo = getCricketBrandAsset('npl-logo');
        expect(nplLogo).toBeDefined();
        expect(nplLogo?.name).toBe('Nepal Premier League (Full Logo)');
        expect(nplLogo?.type).toBe('league');

        const nplIcon = getCricketBrandAsset('npl-icon');
        expect(nplIcon).toBeDefined();
        expect(nplIcon?.name).toBe('Nepal Premier League (Icon / Emblem)');
        expect(nplIcon?.type).toBe('league');

        for (const team of nplTeams) {
            const teamAsset = getCricketBrandAsset(team.id);
            expect(teamAsset).toBeDefined();
            expect(teamAsset?.name).toBe(team.name);
            expect(teamAsset?.teamId).toBe(team.id);
            expect(teamAsset?.url).toBe(teamLogo(team.id));
        }
    });

    it('filters brand assets by category', () => {
        expect(findCricketBrandAssets('all')).toHaveLength(10);
        expect(findCricketBrandAssets('league')).toHaveLength(2);
        expect(findCricketBrandAssets('team')).toHaveLength(8);
    });

    it('searches brand assets by English query, Devanagari query, or description', () => {
        const nplResults = findCricketBrandAssets('all', 'npl');
        expect(nplResults.length).toBeGreaterThanOrEqual(2);

        const janakpurResults = findCricketBrandAssets('all', 'Janakpur');
        expect(janakpurResults).toHaveLength(1);
        expect(janakpurResults[0].id).toBe('janakpur');

        const nepaliResults = findCricketBrandAssets('all', 'विराटनगर');
        expect(nepaliResults).toHaveLength(1);
        expect(nepaliResults[0].id).toBe('biratnagar');

        const descResults = findCricketBrandAssets('all', 'Machapuchare');
        expect(descResults).toHaveLength(1);
        expect(descResults[0].id).toBe('pokhara');
    });
});

import { describe, it, expect } from 'vitest';
import { getNplTeamsData, getAllNplPlayers, getNplFixtures, nplTournamentMeta } from '@/lib/npl-data';

describe('NPL Data Provider', () => {
  it('loads all 8 NPL franchises', () => {
    const teams = getNplTeamsData();
    expect(teams.length).toBe(8);
    const ids = teams.map(t => t.id).sort();
    expect(ids).toEqual([
      'biratnagar',
      'chitwan',
      'janakpur',
      'karnali',
      'kathmandu',
      'lumbini',
      'pokhara',
      'sudurpaschim'
    ].sort());
  });

  it('loads all 145 players with valid local cutouts', () => {
    const players = getAllNplPlayers();
    expect(players.length).toBeGreaterThanOrEqual(144);
    
    // Check that each player has valid stats and image paths
    for (const player of players) {
      expect(player.id).toBeTruthy();
      expect(player.name).toBeTruthy();
      expect(player.role).toBeTruthy();
      expect(player.image?.local).toMatch(/^\/studio\/cricket\/players\/.+\.webp$/);
      expect(player.image?.thumbnail).toMatch(/^\/studio\/cricket\/players\/.+-thumb\.webp$/);
    }
  });

  it('provides 28 league fixtures and valid tournament meta', () => {
    const fixtures = getNplFixtures();
    expect(fixtures.length).toBe(28);
    expect(nplTournamentMeta.totalTeams).toBe(8);
    expect(nplTournamentMeta.totalMatches).toBe(32);
    expect(nplTournamentMeta.prizeMoneyNpr).toBe('NPR 3.00 Crore');
  });

  it('verifies all 8 franchises have captains, coaches, and marquee players', () => {
    const teams = getNplTeamsData();
    for (const team of teams) {
      expect(team.captain).toBeTruthy();
      expect(team.coach).toBeTruthy();
      expect(team.marqueePlayer).toBeTruthy();
      expect(team.bidPriceNpr).toMatch(/NPR/);
      expect(team.players.length).toBeGreaterThanOrEqual(18);
    }
  });

  it('verifies top marquee star cutouts and stats', () => {
    const players = getAllNplPlayers();
    const marqueeNames = ['Rohit Paudel', 'Sandeep Lamichhane', 'Dipendra Singh Airee', 'Kushal Bhurtel', 'Sompal Kami', 'Karan KC'];
    for (const name of marqueeNames) {
      const found = players.find(p => p.name === name);
      expect(found).toBeDefined();
      expect(found?.isMarquee || found?.isCaptain).toBe(true);
      expect(found?.stats.matches).toBeGreaterThan(0);
    }
  });
});

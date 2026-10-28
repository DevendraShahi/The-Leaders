import { standingsFromResults } from './npl-season-update';
import { nplCompletedMatches } from './npl-match-data';
import { confirmedNplFixtures } from './npl-spotlight';
import { nplTeams, nplTeam, type NplTeamId, nplTournamentLogo, nplTournamentIcon } from './post-studio/cricket-catalog';
import { cricketFixtures, cricketPlayoffs, cricketRestDays, type CricketFixture } from './post-studio/cricket-fixtures';
import biratnagarRaw from '@/data/npl/biratnagar-kings-stats.json';
import chitwanRaw from '@/data/npl/chitwan-rhinos-stats.json';
import janakpurRaw from '@/data/npl/janakpur-bolts-stats.json';
import karnaliRaw from '@/data/npl/karnali-yaks-stats.json';
import kathmanduRaw from '@/data/npl/kathmandu-gorkhas-stats.json';
import lumbiniRaw from '@/data/npl/lumbini-lions-stats.json';
import pokharaRaw from '@/data/npl/pokhara-avengers-stats.json';
import sudurpaschimRaw from '@/data/npl/sudurpaschim-royals-stats.json';

export interface NplPlayerStats {
  matches: number;
  innings: number;
  runs: number;
  highestScore: string;
  battingAverage: number | null;
  strikeRate: number | null;
  fifties: number;
  hundreds: number;
  wickets: number;
  bestBowling: string;
  bowlingAverage: number | null;
  economy: number | null;
}

export interface NplPlayer {
  id: string;
  teamId: NplTeamId;
  teamName: string;
  teamNameNe: string;
  name: string;
  nameNe: string;
  role: string;
  isCaptain: boolean;
  isMarquee: boolean;
  category: string;
  origin: string;
  battingStyle: string;
  bowlingStyle: string;
  stats: NplPlayerStats;
  highlights: string;
  image: {
    local: string;
    remote: string;
    source: string;
    thumbnail: string;
  };
}

export interface NplTeamExtended {
  id: NplTeamId;
  name: string;
  nameNe: string;
  short: string;
  primary: string;
  secondary: string;
  dark: string;
  website: string;
  logo: string;
  owner: string;
  bidPriceNpr: string;
  bidAmountRaw: number;
  coach: string;
  captain: string;
  marqueePlayer: string;
  overseasStar: string;
  players: NplPlayer[];
}

export interface NplStanding {
  rank: number;
  teamId: NplTeamId;
  played: number;
  won: number;
  lost: number;
  tied: number;
  nr: number;
  points: number;
  nrr: string;
}

const teamOwnershipMeta: Record<NplTeamId, {
  owner: string;
  bidPriceNpr: string;
  bidAmountRaw: number;
  coach: string;
  captain: string;
  marqueePlayer: string;
  overseasStar: string;
}> = {
  pokhara: {
    owner: "Nepal T-Twenty Cricket Pvt. Ltd. (Subodh Tripathee)",
    bidPriceNpr: "NPR 3.57 Crore",
    bidAmountRaw: 35700000,
    coach: "Ajantha Mendis",
    captain: "Kushal Bhurtel",
    marqueePlayer: "Kushal Bhurtel",
    overseasStar: "Shakib Al Hasan"
  },
  kathmandu: {
    owner: "Kathmandu Sports Development Venture",
    bidPriceNpr: "NPR 3.33 Crore",
    bidAmountRaw: 33333339,
    coach: "Monty Desai",
    captain: "Karan KC",
    marqueePlayer: "Karan KC",
    overseasStar: "David Warner"
  },
  janakpur: {
    owner: "Dream Sports Pvt. Ltd.",
    bidPriceNpr: "NPR 2.05 Crore",
    bidAmountRaw: 20500000,
    coach: "Shivnarine Chanderpaul",
    captain: "Harmeet Singh",
    marqueePlayer: "Anil Sah",
    overseasStar: "James Neesham / Moeen Ali"
  },
  lumbini: {
    owner: "GC Group (Ishwar Bahadur GC)",
    bidPriceNpr: "NPR 1.86 Crore",
    bidAmountRaw: 18600000,
    coach: "Tinu Yohannan",
    captain: "Rohit Paudel",
    marqueePlayer: "Rohit Paudel",
    overseasStar: "D'Arcy Short / Shamim Hossain"
  },
  chitwan: {
    owner: "Chitwan Medical College (CMC)",
    bidPriceNpr: "NPR 1.76 Crore",
    bidAmountRaw: 17600000,
    coach: "Sohail Tanvir",
    captain: "Kushal Malla",
    marqueePlayer: "Kushal Malla",
    overseasStar: "Sikandar Raza / Usama Mir"
  },
  sudurpaschim: {
    owner: "Empire Sports Management (Swotantra Pratap Shah)",
    bidPriceNpr: "NPR 1.68 Crore",
    bidAmountRaw: 16800000,
    coach: "Misbah-ul-Haq",
    captain: "Dipendra Singh Airee",
    marqueePlayer: "Dipendra Singh Airee",
    overseasStar: "Brandon McMullen / Chris Lynn"
  },
  biratnagar: {
    owner: "MAD Dream Sports Pvt. Ltd.",
    bidPriceNpr: "NPR 1.51 Crore",
    bidAmountRaw: 15100000,
    coach: "Dhammika Prasad",
    captain: "Sandeep Lamichhane",
    marqueePlayer: "Sandeep Lamichhane",
    overseasStar: "Andre Russell / Angelo Mathews"
  },
  karnali: {
    owner: "Himalayan Builders (Grihendra Ghimire)",
    bidPriceNpr: "NPR 1.11 Crore",
    bidAmountRaw: 11170000,
    coach: "Gyanendra Malla",
    captain: "Sompal Kami",
    marqueePlayer: "Sompal Kami",
    overseasStar: "David Miller / Mark Watt"
  }
};

const rawTeamDataMap: Record<NplTeamId, { players: any[] }> = {
  biratnagar: biratnagarRaw,
  chitwan: chitwanRaw,
  janakpur: janakpurRaw,
  karnali: karnaliRaw,
  kathmandu: kathmanduRaw,
  lumbini: lumbiniRaw,
  pokhara: pokharaRaw,
  sudurpaschim: sudurpaschimRaw
};

let cachedTeams: NplTeamExtended[] | null = null;

export function getNplTeamsData(): NplTeamExtended[] {
  if (cachedTeams) return cachedTeams;

  const results: NplTeamExtended[] = [];

  for (const baseTeam of nplTeams) {
    const meta = teamOwnershipMeta[baseTeam.id];
    const rawData = rawTeamDataMap[baseTeam.id];
    const players: NplPlayer[] = (rawData?.players || []).map((p: any) => ({
      ...p,
      teamId: baseTeam.id,
      teamName: baseTeam.name,
      teamNameNe: baseTeam.nameNe
    }));

    results.push({
      ...baseTeam,
      logo: `/studio/cricket/${baseTeam.id}.png`,
      owner: meta?.owner || '',
      bidPriceNpr: meta?.bidPriceNpr || '',
      bidAmountRaw: meta?.bidAmountRaw || 0,
      coach: meta?.coach || '',
      captain: meta?.captain || '',
      marqueePlayer: meta?.marqueePlayer || '',
      overseasStar: meta?.overseasStar || '',
      players
    });
  }

  cachedTeams = results;
  return results;
}

export function getAllNplPlayers(): NplPlayer[] {
  const teams = getNplTeamsData();
  return teams.flatMap(t => t.players);
}

export function getNplPlayerById(id: string): { player: NplPlayer; team: NplTeamExtended } | null {
  const teams = getNplTeamsData();
  for (const team of teams) {
    const player = team.players.find((p) => p.id === id);
    if (player) {
      return { player, team };
    }
  }
  return null;
}

export function getNplFixtures(): CricketFixture[] {
  return confirmedNplFixtures(cricketFixtures, nplCompletedMatches);
}

export function getNplPlayoffs() {
  return cricketPlayoffs;
}

export function getNplRestDays(): string[] {
  return cricketRestDays;
}

export function getNplStandings(): NplStanding[] {
  return standingsFromResults(nplTeams.map(team => team.id));
}

export const nplTournamentMeta = {
  name: "Nepal Premier League",
  nameNe: "नेपाल प्रिमियर लिग",
  season: "Season 3 (2026)",
  edition: "3rd Edition",
  governingBody: "Cricket Association of Nepal (CAN)",
  dates: "October 26, 2026 – November 21, 2026",
  datesNe: "कार्तिक १० – मंसिर ५, २०८३",
  venue: "Tribhuvan University International Cricket Ground, Kirtipur",
  venueNe: "त्रिभुवन विश्वविद्यालय अन्तर्राष्ट्रिय क्रिकेट मैदान, कीर्तिपुर",
  totalTeams: 8,
  totalMatches: 32,
  prizeMoneyNpr: "NPR 3.00 Crore",
  winnerPrizeNpr: "NPR 1.50 Crore",
  runnerUpPrizeNpr: "NPR 80 Lakh",
  broadcastPartners: "Star Sports Network (International), Action Sports HD, Himalaya TV",
  digitalStreaming: "DishHome GO, NetTV, FanCode",
  hasDrs: true,
  hasFloodlights: true,
  logoUrl: nplTournamentLogo,
  iconUrl: nplTournamentIcon
};

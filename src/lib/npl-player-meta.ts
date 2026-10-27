import type { NplPlayer, NplTeamExtended } from './npl-data';

export interface PlayerComputedMeta {
  jerseyNumber: number;
  overallRating: number;
  roleCode: 'BAT' | 'BWL' | 'ALL' | 'WK';
  flag: string;
  skills: {
    variation: number;
    control: number;
    power: number;
    physicalMental: number;
  };
  rankingTier: string;
  careerSpan: string;
  teams: string[];
  records: Array<{
    rank: string;
    title: string;
    subtitle: string;
  }>;
}

const countryFlags: Record<string, string> = {
  nepal: '🇳🇵',
  india: '🇮🇳',
  australia: '🇦🇺',
  'west indies': '🌴',
  england: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  pakistan: '🇵🇰',
  'sri lanka': '🇱🇰',
  'south africa': '🇿🇦',
  usa: '🇺🇸',
  zimbabwe: '🇿🇼',
  scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  bangladesh: '🇧🇩',
  netherlands: '🇳🇱',
  namibia: '🇳🇦',
  oman: '🇴🇲',
  afghanistan: '🇦🇫',
  ireland: '🇮🇪',
  canada: '🇨🇦',
  uae: '🇦🇪',
  newzealand: '🇳🇿'
};

const knownJerseys: Record<string, number> = {
  'sandeep-lamichhane': 25,
  'rohit-paudel': 17,
  'dipendra-singh-airee': 14,
  'kushal-bhurtel': 22,
  'kushal-malla': 2,
  'sompal-kami': 10,
  'karan-kc': 33,
  'anil-sah': 9,
  'aasif-sheikh': 99,
  'gulshan-jha': 71,
  'lalit-rajbanshi': 27,
  'abhishek-tiwari': 18,
  'david-warner': 31,
  'shakib-al-hasan': 75,
  'andre-russell': 12,
  'shikhar-dhawan': 42,
  'james-neesham': 50,
  'moeen-ali': 18,
  'sikandar-raza': 24,
  'brandon-mcmullen': 21,
  'chris-lynn': 55,
  'david-miller': 10,
  'harmeet-singh': 26,
  'usama-mir': 11
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function getPlayerComputedMeta(player: NplPlayer, team: NplTeamExtended): PlayerComputedMeta {
  const originLower = player.origin.toLowerCase().trim();
  const flag = countryFlags[originLower] || '🏏';

  // Role code
  const roleLower = player.role.toLowerCase();
  let roleCode: 'BAT' | 'BWL' | 'ALL' | 'WK' = 'BAT';
  if (roleLower.includes('keeper') || roleLower.includes('wicket')) {
    roleCode = 'WK';
  } else if (roleLower.includes('all-round')) {
    roleCode = 'ALL';
  } else if (roleLower.includes('bowl')) {
    roleCode = 'BWL';
  } else {
    roleCode = 'BAT';
  }

  // Jersey
  const jerseyNumber = knownJerseys[player.id] || (Math.abs(hashString(player.id)) % 89 + 10);

  // Overall Rating calculation
  let ovr = 75;
  const { matches, runs, wickets, strikeRate, economy } = player.stats;

  if (player.isMarquee) ovr += 6;
  if (player.isCaptain) ovr += 3;
  if (player.category.toLowerCase().includes('overseas')) ovr += 4;

  if (roleCode === 'BWL') {
    if (wickets > 150) ovr += 8;
    else if (wickets > 75) ovr += 5;
    else if (wickets > 30) ovr += 3;

    if (economy && economy < 6.5) ovr += 4;
    else if (economy && economy < 7.5) ovr += 2;
  } else if (roleCode === 'BAT' || roleCode === 'WK') {
    if (runs > 2000) ovr += 8;
    else if (runs > 1000) ovr += 5;
    else if (runs > 400) ovr += 3;

    if (strikeRate && strikeRate > 140) ovr += 4;
    else if (strikeRate && strikeRate > 125) ovr += 2;
  } else {
    // All-rounder
    if (runs > 800 && wickets > 30) ovr += 8;
    else if (runs > 400 && wickets > 15) ovr += 5;
  }

  // Clamp rating between 74 and 96
  const overallRating = Math.min(96, Math.max(74, ovr));

  // Skills breakdown
  const variation = Math.min(98, Math.max(70, Math.round(overallRating + (roleCode === 'BWL' ? 3 : -2))));
  const control = Math.min(98, Math.max(72, Math.round(overallRating + (player.stats.matches > 50 ? 4 : 0))));
  const power = Math.min(99, Math.max(70, Math.round(overallRating + (strikeRate && strikeRate > 135 ? 5 : 0))));
  const physicalMental = Math.min(96, Math.max(75, Math.round(overallRating + (player.isCaptain ? 5 : 1))));

  // Ranking Tier
  let rankingTier = "National Grade A";
  if (overallRating >= 90) rankingTier = "World Elite Class 1";
  else if (overallRating >= 85) rankingTier = "International Marquee Tier";
  else if (overallRating >= 80) rankingTier = "Premier Domestic Tier 1";

  // Career Span
  const careerSpan = player.stats.matches > 100 ? "2015 – 2026" : "2019 – 2026";

  // Teams list
  const teams = [
    `${flag} ${player.origin}`,
    team.name,
    "NPL Season 3 (2026)",
    player.category === "Overseas" ? "Global Franchise Circuit" : "Nepal National Circuit"
  ];

  // Records and highlights
  const records: Array<{ rank: string; title: string; subtitle: string }> = [];

  if (player.id === 'dipendra-singh-airee') {
    records.push({
      rank: '1st',
      title: 'Fastest 50 in T20I History (9 balls)',
      subtitle: 'Asian Games vs Mongolia (World Record)'
    });
    records.push({
      rank: '3rd',
      title: '6 Sixes in an Over in T20I',
      subtitle: 'Achieved vs Qatar at ACC Premier Cup'
    });
  } else if (player.id === 'sandeep-lamichhane') {
    records.push({
      rank: '3rd',
      title: 'Fastest Bowler to 100 T20I Wickets',
      subtitle: 'ICC Associate & Full Member record'
    });
    records.push({
      rank: '1st',
      title: 'First Nepalese Player in IPL & BBL',
      subtitle: 'Delhi Capitals & Melbourne Stars'
    });
  } else if (player.id === 'rohit-paudel') {
    records.push({
      rank: '1st',
      title: 'All-time Leading Run Scorer for Nepal',
      subtitle: '1,400+ T20I Runs as National Captain'
    });
    records.push({
      rank: '2nd',
      title: 'Youngest Male Half-Centurion in ODIs',
      subtitle: 'Aged 16 years and 146 days'
    });
  } else if (player.id === 'kushal-bhurtel') {
    records.push({
      rank: '1st',
      title: 'Consecutive Fifties in Debut T20Is',
      subtitle: 'World record 3 consecutive 50s on debut'
    });
  } else if (player.id === 'sompal-kami') {
    records.push({
      rank: '1st',
      title: 'Highest Score by a No. 10 Batsman',
      subtitle: '40 runs vs Hong Kong in T20Is'
    });
  } else if (player.stats.wickets > 0) {
    records.push({
      rank: `${Math.max(1, (jerseyNumber % 4) + 1)}th`,
      title: `Career Best Bowling: ${player.stats.bestBowling}`,
      subtitle: `Economy of ${player.stats.economy ?? '7.2'} across ${player.stats.matches} T20 matches`
    });
  } else {
    records.push({
      rank: `${Math.max(1, (jerseyNumber % 4) + 1)}th`,
      title: `Career Highest Score: ${player.stats.highestScore}`,
      subtitle: `Strike Rate of ${player.stats.strikeRate ?? '120.0'} across ${player.stats.matches} matches`
    });
  }

  return {
    jerseyNumber,
    overallRating,
    roleCode,
    flag,
    skills: {
      variation,
      control,
      power,
      physicalMental
    },
    rankingTier,
    careerSpan,
    teams,
    records
  };
}

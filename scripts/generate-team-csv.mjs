import fs from 'node:fs';
import path from 'node:path';

const teamId = process.argv[2] || 'karnali-yaks';
const jsonPath = path.resolve(`docs/data/${teamId}-stats.json`);
const csvPath = path.resolve(`docs/data/${teamId}-stats.csv`);

if (!fs.existsSync(jsonPath)) {
  console.error(`File not found: ${jsonPath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const headers = [
  'id', 'name', 'nameNe', 'role', 'isCaptain', 'isMarquee', 'category', 'origin',
  'battingStyle', 'bowlingStyle', 'matches', 'runs', 'highestScore', 'battingAverage',
  'strikeRate', 'fifties', 'hundreds', 'wickets', 'bestBowling', 'bowlingAverage',
  'economy', 'localPhoto', 'thumbnailPhoto', 'remotePhoto', 'photoCredit'
];

function escapeCsv(val) {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const rows = [headers.join(',')];

for (const p of data.players) {
  const row = [
    escapeCsv(p.id),
    escapeCsv(p.name),
    escapeCsv(p.nameNe),
    escapeCsv(p.role),
    p.isCaptain ? 'TRUE' : 'FALSE',
    p.isMarquee ? 'TRUE' : 'FALSE',
    escapeCsv(p.category),
    escapeCsv(p.origin),
    escapeCsv(p.battingStyle || ''),
    escapeCsv(p.bowlingStyle || ''),
    escapeCsv(p.stats?.matches ?? ''),
    escapeCsv(p.stats?.runs ?? ''),
    escapeCsv(p.stats?.highestScore ?? ''),
    escapeCsv(p.stats?.battingAverage ?? ''),
    escapeCsv(p.stats?.strikeRate ?? ''),
    escapeCsv(p.stats?.fifties ?? ''),
    escapeCsv(p.stats?.hundreds ?? ''),
    escapeCsv(p.stats?.wickets ?? ''),
    escapeCsv(p.stats?.bestBowling ?? ''),
    escapeCsv(p.stats?.bowlingAverage ?? ''),
    escapeCsv(p.stats?.economy ?? ''),
    escapeCsv(p.image?.local ?? ''),
    escapeCsv(p.image?.thumbnail ?? ''),
    escapeCsv(p.image?.remote ?? ''),
    escapeCsv(p.image?.source ?? '')
  ];
  rows.push(row.join(','));
}

fs.writeFileSync(csvPath, rows.join('\n') + '\n', 'utf8');
console.log(`Generated ${csvPath} with ${data.players.length} player rows.`);

import { z } from 'zod';
import { cricketTemplateIds, nplTeamIds, nplTeams, type CricketTemplateId } from './cricket-catalog';

export function oversToBalls(overs: string): number | null {
    if (!/^(?:[0-9]|[1-4][0-9]|50)(?:\.[0-5])?$/.test(overs)) return null;
    const [whole, balls = '0'] = overs.split('.');
    const total = Number(whole) * 6 + Number(balls);
    return total <= 300 ? total : null;
}
const overs = z.string().refine(value => value === '' || oversToBalls(value) !== null, 'Use cricket overs such as 14.2; the last digit must be 0–5.');
const count = z.number().int().min(0).max(9999).nullable();
const name = z.string().max(90);
const line = z.string().max(240);
export const cricketBatterSchema = z.object({ name, runs: count, balls: count, fours: count, sixes: count, notOut: z.boolean() });
export const cricketBowlerSchema = z.object({ name, overs, maidens: count, runs: count, wickets: z.number().int().min(0).max(10).nullable() });
export const cricketDataSchema = z.object({
    template: z.enum(cricketTemplateIds), teamId: z.enum(nplTeamIds), opponentId: z.enum(nplTeamIds),
    language: z.enum(['en', 'ne']), awardPerformance: z.enum(['batting', 'bowling', 'all-round']).default('batting'), theme: z.enum(['team', 'midnight', 'split']), sample: z.boolean().default(false),
    competition: z.string().max(60), matchLabel: z.string().max(60), venue: z.string().max(120),
    matchDate: z.string().refine(value => value === '' || (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + 'T00:00:00Z')) && new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value), 'Use a valid date in YYYY-MM-DD format.'), startTime: z.string().max(40),
    runs: count, wickets: z.number().int().min(0).max(10).nullable(), overs,
    opponentRuns: count, opponentWickets: z.number().int().min(0).max(10).nullable(), opponentOvers: overs,
    oversLimit: z.number().int().min(1).max(50), target: count,
    batter: cricketBatterSchema, secondBatter: cricketBatterSchema, bowler: cricketBowlerSchema,
    partnershipRuns: count, partnershipBalls: count,
    result: line, dismissal: line,
    lineup: z.array(name).max(11),
    batting: z.array(cricketBatterSchema).max(11), bowling: z.array(cricketBowlerSchema).max(11),
    standings: z.array(z.object({ teamId: z.enum(nplTeamIds), played: count, won: count, lost: count, points: count, nrr: z.string().regex(/^(?:[+-]?\d+(?:\.\d{1,3})?|—|)$/) })).max(8),
    fixtures: z.array(z.object({ teamId: z.enum(nplTeamIds), opponentId: z.enum(nplTeamIds), when: z.string().max(60), venue: z.string().max(80) })).max(6),
    statRows: z.array(z.object({ label: z.string().max(40), value: z.string().max(60) })).max(6),
    sourceUrl: z.string().refine(value => value === '' || /^https?:\/\/[^\s]+$/.test(value), 'Use a source URL beginning with https://.'),
    updatedAt: z.string().refine(value => value === '' || !Number.isNaN(Date.parse(value)), 'Use a valid update timestamp.'),
    teamLogoUri: z.string().nullable(), opponentLogoUri: z.string().nullable(),
}).superRefine((data, context) => {
    if (data.teamId === data.opponentId) context.addIssue({ code: 'custom', path: ['opponentId'], message: 'Choose two different teams.' });
    if (new Set(data.standings.map(row => row.teamId)).size !== data.standings.length) context.addIssue({ code: 'custom', path: ['standings'], message: 'Each team can appear only once in the standings.' });
    data.fixtures.forEach((fixture, index) => { if (fixture.teamId === fixture.opponentId) context.addIssue({ code: 'custom', path: ['fixtures', index], message: 'Choose two different teams for a fixture.' }); });
    const balls = oversToBalls(data.overs);
    if (balls !== null && balls > data.oversLimit * 6) context.addIssue({ code: 'custom', path: ['overs'], message: 'Overs exceed the innings limit.' });
});
export type CricketData = z.infer<typeof cricketDataSchema>;
export function defaultCricketData(template: CricketTemplateId = 'matchday'): CricketData {
    const batter = { name: 'Batter name', runs: 68, balls: 42, fours: 6, sixes: 4, notOut: true };
    const secondBatter = { name: 'Batting partner', runs: 45, balls: 31, fours: 3, sixes: 2, notOut: true };
    const bowler = { name: 'Bowler name', overs: '3.2', maidens: 0, runs: 24, wickets: 3 };
    return cricketDataSchema.parse({
        template, teamId: 'lumbini', opponentId: 'sudurpaschim', language: 'en', theme: 'team', sample: false,
        competition: 'NPL 2026', matchLabel: 'MATCH 01', venue: 'TU International Cricket Ground, Kirtipur', matchDate: '', startTime: '',
        runs: 128, wickets: 3, overs: '14.2', opponentRuns: 179, opponentWickets: 8, opponentOvers: '20', oversLimit: 20, target: 180,
        batter, secondBatter, bowler, partnershipRuns: 76, partnershipBalls: 48,
        result: 'Won by 7 wickets', dismissal: 'c Fielder b Bowler name',
        lineup: Array.from({ length: 11 }, (_, index) => `Player ${index + 1}${index === 0 ? ' (c)' : index === 1 ? ' (wk)' : ''}`),
        batting: [batter, secondBatter, { name: 'Opening batter', runs: 28, balls: 20, fours: 3, sixes: 1, notOut: false }],
        bowling: [bowler, { name: 'Spin bowler', overs: '4', maidens: 0, runs: 26, wickets: 2 }],
        standings: nplTeams.map(team => ({ teamId: team.id, played: 0, won: 0, lost: 0, points: 0, nrr: '—' })),
        fixtures: [{ teamId: 'lumbini', opponentId: 'sudurpaschim', when: 'Add verified date · NPT', venue: 'Kirtipur' }, { teamId: 'biratnagar', opponentId: 'chitwan', when: 'Add verified date · NPT', venue: 'Kirtipur' }],
        statRows: [{ label: 'Matches', value: '—' }, { label: 'Wins', value: '—' }, { label: 'Recent form', value: '—' }],
        sourceUrl: '', updatedAt: '', teamLogoUri: null, opponentLogoUri: null,
    });
}
export const runRate = (runs: number | null, overs: string) => {
    const balls = oversToBalls(overs);
    return runs !== null && balls !== null && balls > 0 ? (runs * 6 / balls).toFixed(2) : '—';
};
export const strikeRate = (runs: number | null, balls: number | null) => runs !== null && balls !== null && balls > 0 ? (runs / balls * 100).toFixed(2) : '—';
export function chaseEquation(data: CricketData) {
    const used = oversToBalls(data.overs);
    if (data.target === null || data.runs === null || used === null) return null;
    const runs = Math.max(0, data.target - data.runs), balls = Math.max(0, data.oversLimit * 6 - used);
    return { runs, balls, rate: runs === 0 ? '0.00' : balls > 0 ? (runs * 6 / balls).toFixed(2) : '—' };
}
export const cricketScore = (runs: number | null, wickets: number | null) => `${runs ?? '—'}${wickets === null ? '' : `/${wickets}`}`;
export const cricketNumber = (value: number | string | null, language: 'en' | 'ne') => {
    const text = value === null || value === '' ? '—' : String(value);
    return language === 'ne' ? text.replace(/\d/g, digit => '०१२३४५६७८९'[Number(digit)]) : text;
};

/** Empty match fields for authored drafts; gallery examples are kept separate. */
export function blankCricketData(template: CricketTemplateId = 'matchday'): CricketData {
    const data = defaultCricketData(template);
    const batter = { name: '', runs: null, balls: null, fours: null, sixes: null, notOut: false };
    return {
        ...data, sample: false, matchLabel: '', runs: null, wickets: null, overs: '',
        opponentRuns: null, opponentWickets: null, opponentOvers: '', target: null,
        batter: { ...batter }, secondBatter: { ...batter },
        bowler: { name: '', overs: '', maidens: null, runs: null, wickets: null },
        partnershipRuns: null, partnershipBalls: null, result: '', dismissal: '',
        lineup: [], batting: [], bowling: [], fixtures: [],
        standings: data.standings.map(row => ({ ...row, played: null, won: null, lost: null, points: null, nrr: '—' })),
        statRows: data.statRows.map(row => ({ ...row, value: '—' })), sourceUrl: '', updatedAt: '',
    };
}

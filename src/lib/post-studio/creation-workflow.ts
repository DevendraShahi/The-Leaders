import { cricketTemplate, cricketTemplates, nplTeam, type CricketTemplateId } from './cricket-catalog';
import type { PreparedImport, PromptOptions } from './prompt-engine';
import type { PostDesign } from './types';
import { cricketRestDays } from './cricket-fixtures';
import { hasBatter } from './score-update';
import { applyPlayerPortrait } from './player-portraits';
import { bowlerCreditedTypes, rebindMoment } from './moment-posts';
import type { NplTeamId } from './cricket-catalog';
import { rebindPhase, setPowerplayDuration } from './phase-posts';
import { reconcileEditedPlayerTeams, setCricketPostTeam } from './cricket-team-context';
import { rebindCricketEvidence } from './prematch-posts';

/** Suggestions are explicit defaults; editors can override them before copying. */
export function suggestPostTemplates(kind: PromptOptions['kind'], brief: string): string[] {
    const rules: [string, RegExp][] = kind === 'news' ? [
        ['quote', /\b(quote|quotation)\b|भनाइ|उद्धरण/i], ['explainer', /\b(explainer|explain|analysis)\b|विश्लेषण/i],
    ] : [
        ['matchday', /\b(matchday|pre.?match|fixture preview)\b|खेलअघि/i],
        ['playing-xi', /\b(playing\s*(xi|11)|line.?up)\b/i], ['toss', /\btoss\b|टस/i],
        ['scorecard', /\bscorecard\b/i], ['points-table', /\b(points table|standings)\b/i],
        ['fifty', /\b(fifty|half.?century)\b|अर्धशतक/i], ['century', /(?<!half[ -])\bcentury\b|शतक/i],
        ['wicket', /\bwicket\b|विकेट/i], ['six', /\bsix\b|छक्का/i], ['four', /\bfour\b|चौका/i],
        ['player-of-match', /\b(player of (the )?match|man of (the )?match)\b/i],
        ['result', /\b(result|final score|won by|victory)\b|नतिजा/i],
        ['score', /\b(score update|live score|innings update)\b/i],
    ];
    const matches = rules.flatMap(([id, pattern]) => {
        const match = pattern.exec(brief);
        return match ? [{ id, position: match.index }] : [];
    }).sort((a, b) => a.position - b.position);
    // A fifty request must not also create a century from the same word.
    const ids = matches.map(match => match.id).filter(id => id !== 'century' || !/half[ -]?century/i.test(brief));
    return [...new Set(ids)].slice(0, 8).length ? [...new Set(ids)].slice(0, 8) : [kind === 'cricket' ? 'matchday' : 'breaking'];
}

export function postLabel(id: string) {
    return cricketTemplates.find(item => item.id === id)?.title ?? ({ breaking: 'News update', explainer: 'Explainer', quote: 'Quote' }[id] || id);
}

export type ReviewColumn = { key: string; label: string; type: 'text' | 'number' | 'team' | 'checkbox' };
export type CreationGap = { key: string; page: number | null; path: string; label: string; type: 'text' | 'number' | 'date' | 'time' | 'lines' | 'rows' | 'select' | 'profile'; columns?: ReviewColumn[]; options?: { value: string; label: string }[] };
const labels: Record<string, string> = {
    competition: 'Competition', matchDate: 'Match date', startTime: 'Start time (Nepal)', venue: 'Venue',
    powerplayOvers: 'Confirmed powerplay overs', runs: 'Team runs', wickets: 'Wickets lost', overs: 'Overs', target: 'Target', result: 'Result or announcement',
    opponentRuns: 'Opponent runs', opponentWickets: 'Opponent wickets', opponentOvers: 'Opponent overs',
    'batter.name': 'Batter name', 'batter.runs': 'Batter runs', 'batter.balls': 'Balls faced',
    'secondBatter.name': 'Partner name', 'bowler.name': 'Bowler name', 'bowler.wickets': 'Bowler wickets',
    'bowler.runs': 'Runs conceded', 'bowler.overs': 'Bowler overs', dismissal: 'Dismissal',
    partnershipRuns: 'Partnership runs', partnershipBalls: 'Partnership balls', lineup: 'Playing XI · one name per line',
    'headToHead.played': 'Head to Head matches played', 'headToHead.teamWins': 'Featured team wins', 'headToHead.opponentWins': 'Opponent wins', 'headToHead.ties': 'Ties without a winner', 'headToHead.noResults': 'No results', 'headToHead.asOf': 'Record cutoff date',
};
const col = (key: string, label: string, type: ReviewColumn['type'] = 'text'): ReviewColumn => ({ key, label, type });
const tables: Record<string, { label: string; columns: ReviewColumn[] }> = {
    fixtures: { label: 'Fixtures', columns: [col('teamId', 'Team', 'team'), col('opponentId', 'Opponent', 'team'), col('when', 'Date and time'), col('venue', 'Venue')] },
    batting: { label: 'Batting performances', columns: [col('name', 'Player'), col('runs', 'Runs', 'number'), col('balls', 'Balls', 'number'), col('fours', 'Fours', 'number'), col('sixes', 'Sixes', 'number'), col('notOut', 'Not out', 'checkbox')] },
    bowling: { label: 'Opposition bowling · this innings', columns: [col('name', 'Player'), col('overs', 'Overs'), col('maidens', 'Maidens', 'number'), col('runs', 'Runs', 'number'), col('wickets', 'Wickets', 'number')] },
    standings: { label: 'Standings', columns: [col('teamId', 'Team', 'team'), col('played', 'Played', 'number'), col('won', 'Won', 'number'), col('lost', 'Lost', 'number'), col('points', 'Points', 'number'), col('nrr', 'Net run rate')] },
    statRows: { label: 'Team statistics', columns: [col('label', 'Statistic'), col('value', 'Value')] },
};
export function creationValue(design: PostDesign, path: string): unknown {
    return path.split('.').reduce<unknown>((value, key) => value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined, design);
}
const empty = (value: unknown) => value === null || value === undefined || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && !value.length);
export function creationGaps(designs: PostDesign[]): CreationGap[] {
    const gaps: CreationGap[] = [];
    const add = (page: number | null, path: string, label: string, type: CreationGap['type'] = 'text', columns?: ReviewColumn[], options?: CreationGap['options']) => {
        const design = designs[page ?? 0];
        const value = creationValue(design, path);
        const incompleteRows = type === 'rows' && Array.isArray(value) && value.some(row => columns?.some(column => column.type !== 'checkbox' && empty(row[column.key])));
        if (empty(value) || incompleteRows || (type === 'lines' && path === 'cricket.lineup' && Array.isArray(value) && value.length !== 11)) gaps.push({ key: `${page ?? 'match'}:${path}`, page, path, label, type, columns, options });
    };
    if (designs.some(design => design.cricket)) {
        if (designs.some(design => design.cricket?.template === 'fixtures')) add(null, 'cricket.matchDate', labels.matchDate, 'date');
        if (designs.some(design => design.cricket?.template === 'matchday')) {
            add(null, 'cricket.matchDate', labels.matchDate, 'date'); add(null, 'cricket.startTime', labels.startTime, 'time'); add(null, 'cricket.venue', labels.venue);
        }
    }
    designs.forEach((design, page) => {
        add(page, 'headline', 'Headline');
        if (!design.cricket) return;
        const data = design.cricket, layout = data.template === 'player-of-match' && data.awardPerformance === 'bowling' ? 'bowler' : cricketTemplate(data.template).layout;
        const fields: string[] = [];
        if (['score', 'event', 'batter', 'result'].includes(layout)) fields.push('runs', 'wickets', 'overs');
        if (data.template === 'scorecard') fields.push('runs', 'wickets', 'overs');
        if (layout === 'batter') fields.push('batter.name', 'batter.runs', 'batter.balls');
        if (['four', 'six', 'wicket', 'partnership'].includes(data.template)) fields.push('batter.name');
        if (layout === 'bowler') fields.push('bowler.name', 'bowler.wickets', 'bowler.runs', 'bowler.overs');
        if (data.template === 'player-of-match' && data.awardPerformance === 'all-round') fields.push('bowler.wickets', 'bowler.runs');
        if (data.template === 'wicket' && data.wicketType && bowlerCreditedTypes.includes(data.wicketType)) fields.push('bowler.name');
        if (layout === 'bowler' || layout === 'result') fields.push('opponentRuns', 'opponentWickets', 'opponentOvers');
        if ((layout === 'team' && !['toss', 'team'].includes(data.template)) || layout === 'result') fields.push('result');
        if (['target', 'dls'].includes(data.template)) fields.push('target');
        if (data.template === 'wicket') fields.push('dismissal');
        if (data.template === 'partnership') fields.push('secondBatter.name', 'partnershipRuns', 'partnershipBalls');
        if (data.template === 'powerplay') fields.push('powerplayOvers');
        if (data.template === 'head-to-head') fields.push('headToHead.played', 'headToHead.teamWins', 'headToHead.opponentWins', 'headToHead.ties', 'headToHead.noResults', 'headToHead.asOf');
        for (const field of fields) {
            if (data.template === 'powerplay' && field === 'overs') continue;
            const value = creationValue(design, `cricket.${field}`);
            add(page, `cricket.${field}`, labels[field] ?? field, field === 'headToHead.asOf' ? 'date' : value === null || typeof value === 'number' ? 'number' : 'text');
        }
        if (data.template === 'playing-xi') add(page, 'cricket.lineup', labels.lineup, 'lines');
        if (data.template === 'toss') {
            add(page, 'cricket.toss.winnerId', 'Toss winner', 'select', undefined, [data.teamId, data.opponentId].map(id => ({ value: id, label: nplTeam(id).name })));
            add(page, 'cricket.toss.decision', 'Winner chose to', 'select', undefined, [{ value: 'bat', label: 'Bat first' }, { value: 'bowl', label: 'Bowl first' }]);
        }
        if (data.template === 'wicket') add(page, 'cricket.wicketType', 'Dismissal type', 'select', undefined, ['bowled', 'caught', 'lbw', 'stumped', 'hit-wicket', 'run-out', 'retired-out', 'other'].map(value => ({ value, label: value.replaceAll('-', ' ') })));
        if (data.template === 'team' && !Object.values(data.teamProfile ?? {}).some(value => value.trim())) gaps.push({ key: `${page}:profile`, page, path: 'cricket.teamProfile', label: 'Team profile · add at least one confirmed fact', type: 'profile' });
        if (data.template === 'partnership') for(const key of ['batter','secondBatter'] as const) if(data[key].runs!==null||data[key].balls!==null) {
            add(page,`cricket.${key}.runs`,key==='batter'?'First batter innings runs':'Second batter innings runs','number');
            add(page,`cricket.${key}.balls`,key==='batter'?'First batter innings balls':'Second batter innings balls','number');
        }
        if (data.template === 'score') {
            add(page, 'cricket.scoreInnings', 'Score innings', 'select', undefined, [{ value: 'first', label: 'First innings' }, { value: 'chase', label: 'Chase' }]);
            if (data.scoreInnings === 'chase') add(page, 'cricket.target', 'Confirmed target', 'number');
            for (const key of ['batter', 'secondBatter'] as const) if (hasBatter(data[key])) {
                add(page, `cricket.${key}.name`, key === 'batter' ? 'Batter name' : 'Second batter name');
                add(page, `cricket.${key}.runs`, key === 'batter' ? 'Batter runs' : 'Second batter runs', 'number');
                add(page, `cricket.${key}.balls`, key === 'batter' ? 'Batter balls' : 'Second batter balls', 'number');
            }
        }
        const tableKeys = data.template === 'scorecard' ? ['batting', 'bowling'] : data.template === 'points-table' ? ['standings'] : data.template === 'fixtures' ? ['fixtures'] : [];
        for (const key of tableKeys) {
            if (key === 'fixtures' && !data.fixtures.length && cricketRestDays.includes(data.matchDate)) continue;
            add(page, `cricket.${key}`, tables[key].label, 'rows', tables[key].columns);
        }
    });
    return gaps;
}

/** Shared fixture changes propagate, moment statistics remain page-specific. */
export function updateCreationValue(prepared: PreparedImport, page: number | null, path: string, value: unknown): PreparedImport {
    const designs = prepared.designs.map((design, index) => {
        if (page !== null && index !== page) return design;
        let next = structuredClone(design);
        if (next.cricket?.matchDate && path === 'cricket.matchDate') next = rebindPhase(next,next.cricket.teamId,next.cricket.opponentId,String(value));
        if (next.cricket && path === 'cricket.teamId') {
            const teamId = value as NplTeamId, before = next.cricket;
            const opponentId = teamId === before.opponentId ? before.teamId : before.opponentId;
            next = teamId === before.opponentId ? setCricketPostTeam(next, teamId) : rebindCricketEvidence(next, teamId, opponentId);
        }
        if (next.cricket && path === 'cricket.opponentId') next = rebindPhase(next,next.cricket.teamId,value as NplTeamId);
        if (next.cricket?.matchDate && path === 'cricket.matchDate') next = rebindMoment(next, next.cricket.teamId, next.cricket.opponentId, String(value));
        if (next.cricket && path === 'cricket.opponentId') next = rebindMoment(next, next.cricket.teamId, value as NplTeamId);
        const keys = path.split('.');
        let target = next as unknown as Record<string, unknown>;
        for (const key of keys.slice(0, -1)) target = target[key] as Record<string, unknown>;
        target[keys[keys.length - 1]] = value;
        if (path === 'cricket.scoreInnings' && value === 'first' && next.cricket?.template === 'score') next.cricket.target = null;
        if (path === 'cricket.wicketType' && next.cricket && (!value || !bowlerCreditedTypes.includes(String(value)))) { next.cricket.bowler = { name: '', overs: '', maidens: null, runs: null, wickets: null }; next.cricket.momentPhotoRole = 'batter'; }
        return applyPlayerPortrait(path === 'cricket.powerplayOvers' ? setPowerplayDuration(design, String(value)) : reconcileEditedPlayerTeams(design, next));
    });
    return { ...prepared, designs };
}

export function templateId(design: PostDesign): CricketTemplateId | string { return design.cricket?.template ?? design.template; }

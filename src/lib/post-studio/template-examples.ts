import { cricketTemplates, nplTeams, type CricketTemplateId } from './cricket-catalog';
import { blankCricketData, chaseEquation, runRate, strikeRate, type CricketData } from './cricket-data';
import { createCricketDraftDesign } from './cricket-design';
import { cricketPromptFields, digestCreationResponse, responseSchema, type PromptOptions } from './prompt-engine';
import { hasPostTeam } from './cricket-team-context';
import { findPlayers } from './cricket-players';
import { bookReviewPresets, generateBookReviewDrafts } from './book-review';
import { coverageIssues } from './coverage-posts';
import { postDesignSchema } from './drafts';
import type { PostDesign } from './types';

export type ExampleField = { path: string; label: string; value: unknown; section: string; help: string };
export type TemplateExample = { id: string; title: string; group: string; purpose: string; design: PostDesign; response: unknown; fields: ExampleField[]; notes: string[] };

const match = { teamId: 'lumbini' as const, opponentId: 'sudurpaschim' as const, competition: 'NPL 2026', matchLabel: 'TRAINING MATCH', venue: 'Kirtipur', matchDate: '2026-10-26', startTime: '16:30', oversLimit: 20, sourceUrl: '', updatedAt: '' };
const labels: Record<string, string> = { runs: 'Runs', wickets: 'Wickets lost / credited', overs: 'Overs bowled', balls: 'Balls faced', fours: 'Fours hit', sixes: 'Sixes hit', notOut: 'Not out', name: 'Player name', teamId: 'Team identifier', opponentId: 'Opponent identifier', target: 'Official target', oversLimit: 'Allotted innings overs', powerplayOvers: 'Confirmed powerplay duration', scoreInnings: 'First innings or chase', awardPerformance: 'Award performance mode', result: 'Result or announcement', dismissal: 'Dismissal description', wicketType: 'Dismissal type', partnershipRuns: 'Shared partnership runs', partnershipBalls: 'Shared partnership balls', lineup: 'Eleven starting players', maidens: 'Maiden overs', played: 'Matches played', won: 'Matches won', lost: 'Matches lost', points: 'Published points', nrr: 'Published net run rate', teamWins: 'First team wins', opponentWins: 'Second team wins', ties: 'Ties without winner', noResults: 'No results', asOf: 'Historical record cutoff', captain: 'Captain', headCoach: 'Head coach', homeCity: 'Home city', when: 'Game date and Nepal time', venue: 'Venue', matchDate: 'Match / table date', startTime: 'Nepal start time', matchLabel: 'Match label', competition: 'Competition', sourceUrl: 'Source URL', updatedAt: 'Actual verification time', headline: 'Headline', summary: 'Supporting line', title: 'Draft name', sources: 'Evidence URLs', version: 'Response version', template: 'Template identifier' };

function sectionFor(path: string, id: string, design: PostDesign): string {
    const data = design.cricket;
    const bowling = ['bowling', 'five-for', 'hat-trick'].includes(id) || (id.startsWith('player-of-match') && data?.awardPerformance === 'bowling');
    if (path.endsWith('.headline')) return 'Headline';
    if (path.endsWith('.summary')) return 'Supporting line';
    if (path.endsWith('.template') || ['title', 'version', 'sources'].includes(path)) return 'Setup / evidence only';
    if (path.startsWith('match.')) {
        if (path.endsWith('matchDate') || path.endsWith('matchLabel')) return ['team', 'head-to-head'].includes(id) ? 'Setup / evidence only' : 'Match label / date';
        if (id === 'matchday' && /startTime|venue/.test(path)) return 'Date, time & venue';
        if (path.endsWith('oversLimit') && ['target', 'dls'].includes(id)) return 'Metrics';
        if (path.endsWith('updatedAt') && ['score', 'rain', 'qualified'].includes(id)) return 'Update time';
        return 'Setup / evidence only';
    }
    if (/\.teamId$/.test(path) && !path.includes('.data.')) return 'Team identity';
    if (path.includes('.headToHead.')) return /teamWins|opponentWins/.test(path) ? 'Team win columns' : path.endsWith('asOf') ? 'Record cutoff' : 'Shared record statistics';
    if (path.includes('.teamProfile.')) return 'Team facts';
    if (path.includes('.toss.')) return path.endsWith('winnerId') ? 'Toss winner identity' : 'Toss decision';
    if (path.includes('.lineup')) return 'Starting XI list';
    if (path.includes('.fixtures.')) return 'Game cards';
    if (path.includes('.standings.')) return 'Standings table';
    if (path.includes('.batting.')) return 'Batting table';
    if (path.includes('.bowling.')) return 'Opposition bowling table';
    if (path.endsWith('awardPerformance')) return 'Layout selector (not printed)';
    if (path.includes('.batter.') || path.includes('.secondBatter.')) {
        if (id === 'wicket') return path.endsWith('.name') || path.endsWith('.runs') || path.endsWith('.balls') ? 'Dismissed batter · optional runs and balls' : 'Recorded batter detail (not printed)';
        if (['four', 'six'].includes(id)) return path.endsWith('.name') ? 'Boundary batter' : 'Not printed in this event layout';
        if (bowling) return 'Not printed in bowling mode';
        if (['score', 'innings'].includes(id)) return 'Batter lines';
        if (id === 'partnership') return path.endsWith('.name') ? 'Player names / portraits' : 'Optional individual innings';
        return path.endsWith('.name') ? 'Player name / portrait' : path.endsWith('.runs') || path.endsWith('.notOut') ? 'Main performance figure' : 'Metrics';
    }
    if (path.includes('.bowler.')) {
        if (id === 'wicket') return path.endsWith('.name') ? 'Credited opposition bowler / optional portrait' : 'Recorded bowling details (not printed on wicket post)';
        if (data?.awardPerformance === 'batting') return 'Not printed in batting mode';
        if (data?.awardPerformance === 'all-round') return ['name', 'overs', 'maidens'].some(key => path.endsWith(`.${key}`)) ? 'Award identity / recorded bowling detail' : 'All-round bowling metrics';
        return path.endsWith('.name') ? 'Player name / portrait' : path.endsWith('.runs') || path.endsWith('.wickets') ? 'Main performance figure' : 'Metrics';
    }
    if (path.endsWith('.result')) return 'Status / winning margin';
    if (/wicketType|dismissal/.test(path)) return 'Dismissal line / portrait choice';
    if (/partnershipRuns|partnershipBalls/.test(path)) return 'Shared partnership statistics';
    if (path.endsWith('.target')) return id === 'innings' ? 'Official target metric' : ['target', 'dls'].includes(id) ? 'Main target figure' : 'Chase requirements';
    if (path.endsWith('.scoreInnings')) return 'Innings status / chase requirements';
    if (path.endsWith('.powerplayOvers')) return 'Powerplay duration / score endpoint';
    if (/opponentRuns|opponentWickets|opponentOvers/.test(path)) return ['result', 'champions'].includes(id) ? 'Opposition result score' : bowling ? 'Opposition score strip' : 'Recorded opposition innings';
    if (/\.runs$|\.wickets$|\.overs$/.test(path)) return ['score', 'innings'].includes(id) ? 'Main team score' : ['result', 'champions'].includes(id) ? 'Featured team result score' : id === 'scorecard' ? 'Innings total above tables' : bowling ? 'Not printed in bowling mode' : 'Batting team score strip';
    return 'Post details';
}
function fieldsFor(payload: Record<string, unknown>, id: string, design: PostDesign): ExampleField[] {
    const fields: ExampleField[] = [];
    const walk = (value: unknown, path: string) => {
        if (Array.isArray(value) && value.length && typeof value[0] === 'object' && value[0] !== null) { walk(value[0], `${path}.0`); return; }
        if (value && typeof value === 'object' && !Array.isArray(value)) { for (const [key, child] of Object.entries(value)) walk(child, path ? `${path}.${key}` : key); return; }
        const key = path.split('.').at(-1)!;
        const section = sectionFor(path, id, design);
        fields.push({ path: path.replace(/\.0(?=\.|$)/g, '[0]'), label: labels[key] ?? key, value, section, help: key === 'overs' || key === 'powerplayOvers' ? 'Cricket notation: 14.2 means 14 overs and 2 legal balls; 14.6 is invalid.' : key === 'notOut' ? 'Boolean true/false. The star means not out, never striker.' : key === 'teamId' ? path.startsWith('match.') ? 'The selected fixture pairing. Each post can feature either side.' : 'The batting side, bowler’s team, award winner’s team or described side, according to this template.' : section.includes('evidence') ? 'Retained as context/evidence; this field is not printed on the artwork.' : /(?:batting|bowling|fixtures|standings)\.0\./.test(path) ? 'First row example; repeat the same field structure for the remaining rows.' : 'Copy the confirmed value from the attached image. Leave unknown values empty; never guess.' });
    };
    walk(payload, '');
    for (const field of fields) {
        if (field.path.endsWith('.bowler.runs')) field.label = 'Bowler runs conceded';
        if (field.path.endsWith('.bowler.wickets')) field.label = 'Bowler wickets credited';
        if (field.path.endsWith('.data.wickets')) field.label = 'Batting team wickets lost';
        if (field.path.endsWith('.opponentRuns')) field.label = 'Opposition innings runs';
        if (field.path.endsWith('.opponentWickets')) field.label = 'Opposition wickets lost';
        if (field.path.endsWith('.opponentOvers')) field.label = 'Opposition innings overs';
    }
    const data = design.cricket;
    const calculated = (label: string, value: unknown, section: string, help: string) => fields.push({ path: 'Automatic · do not add to JSON', label, value, section, help });
    if (data) {
        if (['score', 'innings', 'powerplay'].includes(id)) calculated('Current run rate', runRate(data.runs, data.overs), 'Run rate (calculated)', 'Studio divides team runs by legal balls and multiplies by six. 14.2 is 86 legal balls, not 14.2 decimal overs.');
        if (['batting', 'fifty', 'century'].includes(id) || (id === 'player-of-match' && data.awardPerformance !== 'bowling')) calculated('Strike rate', strikeRate(data.batter.runs, data.batter.balls), 'Metrics (calculated)', 'Studio calculates batter runs ÷ balls faced × 100. Supply the two source figures, not a strikeRate field.');
        if (['bowling', 'five-for', 'hat-trick'].includes(id) || (id === 'player-of-match' && data.awardPerformance === 'bowling')) calculated('Economy rate', runRate(data.bowler.runs, data.bowler.overs), 'Metrics (calculated)', 'Studio calculates runs conceded per six legal balls. Do not add an economy field.');
        if (id === 'partnership') calculated('Partnership run rate', data.partnershipRuns !== null && data.partnershipBalls ? (data.partnershipRuns * 6 / data.partnershipBalls).toFixed(2) : '—', 'Shared partnership statistics', 'Calculated from stand runs and stand balls. It is not the sum of the batters’ individual innings.');
        const chase = chaseEquation(data);
        if (chase && ['score', 'target', 'dls'].includes(id)) calculated('Chase requirements', `${chase.runs} needed · ${chase.balls} legal balls left · required rate ${chase.rate}`, 'Chase requirements (calculated)', 'Derived from the official target, current score, legal overs and allotted overs. Never guess a DLS target.');
        if (id === 'scorecard' && data.batting[0]) calculated('Table strike rate (first batter)', strikeRate(data.batting[0].runs, data.batting[0].balls), 'Batting table', 'Each SR cell is calculated from that row’s runs and balls; it is not an input field.');
    }
    fields.push({ path: 'Studio → Text → Byline', label: 'Footer byline', value: design.author, section: 'Footer', help: 'Set inside Studio. The AI response contract does not accept an author field.' });
    return fields;
}

function cricketExample(id: CricketTemplateId, award: CricketData['awardPerformance'] = 'batting'): TemplateExample {
    const spec = cricketTemplates.find(item => item.id === id)!;
    const data = { ...blankCricketData(id), ...match, runs: 128, wickets: 3, overs: '14.2', opponentRuns: 179, opponentWickets: 8, opponentOvers: '20', target: 180,
        batter: { name: 'Rohit Paudel', runs: 68, balls: 42, fours: 6, sixes: 3, notOut: true },
        secondBatter: { name: 'Aakash Tripathi', runs: 45, balls: 31, fours: 4, sixes: 1, notOut: true },
        bowler: { name: 'Sher Malla', overs: '4', maidens: 0, runs: 24, wickets: id === 'five-for' ? 5 : 3 },
        partnershipRuns: 76, partnershipBalls: 48, powerplayOvers: '6', scoreInnings: 'chase' as const, awardPerformance: award,
        result: 'Won by 7 wickets', dismissal: 'Caught at cover', wicketType: 'caught' as const,
        toss: { winnerId: 'sudurpaschim' as const, decision: 'bowl' as const },
        teamProfile: { captain: 'Rohit Paudel', headCoach: 'Example Coach', homeCity: 'Butwal' },
        headToHead: { played: 6, teamWins: 3, opponentWins: 2, ties: 0, noResults: 1, asOf: '2026-10-25' },
        lineup: findPlayers('lumbini', '', false).slice(0, 11).map(player => player.name + (player.name === 'Rohit Paudel' ? ' (c)' : player.name === 'Aasif Sheikh' ? ' (wk)' : '')),
        fixtures: [{ teamId: 'lumbini' as const, opponentId: 'sudurpaschim' as const, when: '2026-10-26 · 16:30 NPT', venue: 'Kirtipur' }],
        standings: nplTeams.map((team, index) => ({ teamId: team.id, played: 6, won: Math.max(0, 5 - index), lost: Math.min(6, index + 1), points: Math.max(0, 10 - index * 2), nrr: (1.25 - index * .3).toFixed(3) })),
    };
    if (id === 'powerplay') Object.assign(data, { runs: 48, wickets: 1, overs: '6' });
    if (id === 'innings') Object.assign(data, { runs: 179, wickets: 8, overs: '20', target: 180 });
    if (['target', 'dls'].includes(id)) Object.assign(data, { runs: 0, wickets: 0, overs: '0', target: id === 'dls' ? 142 : 180, oversLimit: id === 'dls' ? 16 : 20 });
    if (id === 'wicket') { data.bowler.name = 'Dipendra Singh Airee'; data.batter.notOut = false; }
    if (id === 'rain') data.result = 'Play paused due to rain. Awaiting the official restart time.';
    if (id === 'qualified') data.result = 'A place in the playoffs is confirmed.';
    if (id === 'fifty') Object.assign(data.batter, { runs: 50, balls: 34, fours: 5, sixes: 2 });
    if (id === 'century') { Object.assign(data.batter, { runs: 100, balls: 60, fours: 8, sixes: 6 }); data.runs = 160; }
    if (['result', 'champions'].includes(id)) Object.assign(data, { runs: 180, wickets: 3, overs: '19.2' });
    if (id === 'player-of-match' && award !== 'batting') data.bowler.name = award === 'all-round' ? data.batter.name : 'Sher Malla';
    data.batting = [data.batter, data.secondBatter];
    data.bowling = [{ ...data.bowler, name: 'Dipendra Singh Airee', wickets: 2 }, { ...data.bowler, name: 'Abinash Bohara', wickets: 1 }];
    const content = Object.fromEntries(cricketPromptFields(id).map(key => [key, data[key]]));
    const options: PromptOptions = { kind: 'cricket', templates: [id], language: 'en', format: 'portrait', brief: 'Illustrative training data only.', teams: { teamId: 'lumbini', opponentId: 'sudurpaschim' } };
    const draft = createCricketDraftDesign(id);
    const payload = { version: 1, title: `TRAINING ONLY · ${spec.title}`, sources: [], match: { ...match, oversLimit: data.oversLimit }, posts: [{ template: id, ...(hasPostTeam(id) ? { teamId: 'lumbini' } : {}), headline: draft.headline, summary: 'Illustrative training data. Replace before publishing.', data: content }] };
    responseSchema(options).parse(payload);
    const design = digestCreationResponse(JSON.stringify(payload), options).designs[0];
    design.author = 'TRAINING EXAMPLE · THE LEADERS';
    const problems = coverageIssues(design);
    if (problems.length) throw new Error(`${id}: ${problems.join(' ')}`);
    const exampleId = id === 'player-of-match' && award !== 'batting' ? `${id}-${award}` : id;
    return { id: exampleId, title: spec.title + (id === 'player-of-match' ? ` · ${award}` : ''), group: spec.category, purpose: spec.description, design, response: payload, fields: fieldsFor(payload, id, design), notes: [
        'Training data only. Names may be real; all performances, results, table figures and announcements here are illustrative.',
        id === 'wicket' ? 'The batting side owns the score and dismissed batter. The credited bowler belongs to the other team; run-outs and retired-out have no credited bowler.' : 'The fixture pairing stays fixed. post.teamId selects the side whose innings, player, lineup or result this page describes.',
        'Attach the real stats image to your AI chat with the Studio prompt. Search only when no image is attached. Never copy training figures into a real update.',
        ...(id === 'hat-trick' ? ['Three wickets alone do not prove a hat-trick. Confirm the consecutive-ball sequence from the attached evidence before using this template.'] : []),
        'Photos, logos, colors, format and byline are Studio controls; do not add image URLs or design fields to the AI JSON.',
    ] };
}

export function studioTemplateExamples(): TemplateExample[] {
    const cricket = cricketTemplates.map(template => cricketExample(template.id));
    cricket.push(cricketExample('player-of-match', 'bowling'), cricketExample('player-of-match', 'all-round'));
    const news = (['breaking', 'explainer', 'quote'] as const).map(id => {
        const options: PromptOptions = { kind: 'news', templates: [id], language: 'en', format: 'portrait', brief: 'Fictional training example.' };
        const headline = id === 'breaking' ? 'Public consultation opens this week' : id === 'explainer' ? 'How to take part in a public consultation' : '“Public decisions should begin with public voices.”';
        const summary = id === 'quote' ? 'Illustrative quotation by a fictional civic speaker.' : 'Fictional sample: read the proposal, check the deadline and send your response.';
        const payload = { version: 1, title: `TRAINING ONLY · ${id}`, sources: [], posts: [{ template: id, headline, summary }] };
        const design = digestCreationResponse(JSON.stringify(payload), options).designs[0];
        design.author = 'TRAINING EXAMPLE · THE LEADERS';
        return { id, title: id === 'breaking' ? 'News update' : id === 'explainer' ? 'Explainer' : 'Quotation', group: 'News & perspectives', purpose: 'Headline, supporting context and byline in the standard news composition.', design, response: payload, fields: fieldsFor(payload, id, design), notes: ['Fictional copy and quotation for training only. Replace with sourced reporting.', 'Set category, eyebrow and byline inside Studio. AI responses accept headline and summary only.'] };
    });
    const book = { ...bookReviewPresets[1].data, criticSays: 'A useful lens on institutions, power and accountability.' };
    const bookDrafts = generateBookReviewDrafts(book);
    const bookTitles = ['Book review · thesis', 'Book review · purpose & evidence', 'Book review · critical lens', 'Book review · relevance & takeaways', 'Book review · verdict'];
    const sectionByBookField: Record<string, string> = { title: 'Slide 1 · headline', author: 'Slide 1 · author / kicker', tag: 'Slide 1 · category', rating: 'Slides 1 & 5 · rating', centralThesis: 'Slide 1 · central thesis', purpose: 'Slide 2 · purpose', argumentEvidence: 'Slide 2 · evidence', assumptionIdeology: 'Slide 3 · critical lens', relevanceApplication: 'Slide 4 · relevance', keyTakeaways: 'Slide 4 · takeaways', whyItMatters: 'Slide 5 · supporting context', criticSays: 'Slide 5 · verdict headline', accent: 'All five slides · background / accent' };
    const books = bookDrafts.map((draft, index) => ({ id: `book-${index + 1}`, title: bookTitles[index], group: 'Book review carousel', purpose: 'One book-review response generates a coordinated five-slide carousel.', design: { ...draft.design, author: 'TRAINING EXAMPLE · THE LEADERS' }, response: book,
        fields: Object.entries(book).filter(([key]) => key !== 'imageUri').map(([path, value]) => ({ path, label: path, value, section: sectionByBookField[path] ?? 'Studio controls', help: 'Book reviews use the separate 13-field importer. This field may appear on a different slide in the same five-slide pack.' })), notes: ['Illustrative editorial analysis, not a verified quotation or external rating.', 'Book review JSON uses thirteen flat string fields, not match/posts/data.', 'A single response supplies all five slides. Review every slide before export.'] }));
    const all = [...cricket, ...news, ...books];
    for (const item of all) postDesignSchema.parse(item.design);
    return all;
}

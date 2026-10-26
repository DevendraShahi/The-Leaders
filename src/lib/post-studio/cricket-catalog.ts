/** Team identities checked against franchise sites on 2026-10-25.
 * Palettes are editorial interpretations of their visual identities, not official brand specifications.
 * Asset provenance is in public/studio/cricket/ASSETS.json and docs/NPL_CRICKET_RESEARCH.md.
 */
export const nplTeamIds = ['biratnagar', 'chitwan', 'janakpur', 'karnali', 'kathmandu', 'lumbini', 'pokhara', 'sudurpaschim'] as const;
export type NplTeamId = typeof nplTeamIds[number];
export type CricketLanguage = 'en' | 'ne';
export interface NplTeam {
    id: NplTeamId; name: string; nameNe: string; short: string; primary: string; secondary: string; dark: string; website: string;
}
export const nplTeams: NplTeam[] = [
    { id: 'biratnagar', name: 'Biratnagar Kings', nameNe: 'विराटनगर किङ्स', short: 'BK', primary: '#F5C542', secondary: '#2C72D9', dark: '#071936', website: 'https://biratkings.com/' },
    { id: 'chitwan', name: 'Chitwan Rhinos', nameNe: 'चितवन राइनोज', short: 'CR', primary: '#F08A27', secondary: '#F6D347', dark: '#17231C', website: 'https://chitwanrhinos.com/' },
    { id: 'janakpur', name: 'Janakpur Bolts', nameNe: 'जनकपुर बोल्ट्स', short: 'JB', primary: '#EB247B', secondary: '#35B8ED', dark: '#101D49', website: 'https://boltsjanakpur.com/' },
    { id: 'karnali', name: 'Karnali Yaks', nameNe: 'कर्णाली याक्स', short: 'KY', primary: '#F5C547', secondary: '#2A9AD5', dark: '#112642', website: 'https://karnaliyaks.com/' },
    { id: 'kathmandu', name: 'Kathmandu Gorkhas', nameNe: 'काठमाडौं गोर्खाज', short: 'KG', primary: '#F5D247', secondary: '#9C6BC3', dark: '#2C1647', website: 'https://kathmandugorkhas.com/' },
    { id: 'lumbini', name: 'Lumbini Lions', nameNe: 'लुम्बिनी लायन्स', short: 'LL', primary: '#F1C64C', secondary: '#CF293A', dark: '#321C30', website: 'https://lumbinilions.com.np/' },
    { id: 'pokhara', name: 'Pokhara Avengers', nameNe: 'पोखरा एभेन्जर्स', short: 'PA', primary: '#E9CB7D', secondary: '#BE1E4A', dark: '#330D27', website: 'https://pokharaavengers.com/' },
    { id: 'sudurpaschim', name: 'Sudurpaschim Royals', nameNe: 'सुदूरपश्चिम रोयल्स', short: 'SR', primary: '#FFCC39', secondary: '#E33437', dark: '#172B59', website: 'https://sudurpaschimroyals.com/' },
];
export const nplTeam = (id: NplTeamId): NplTeam => nplTeams.find(team => team.id === id)!;
export const teamName = (team: NplTeam, language: CricketLanguage) => language === 'ne' ? team.nameNe : team.name;
export const teamLogo = (id: NplTeamId) => `/studio/cricket/${id}.png`;

export const cricketTemplateIds = ['matchday', 'fixtures', 'head-to-head', 'toss', 'playing-xi', 'team', 'score', 'four', 'six', 'wicket', 'powerplay', 'partnership', 'innings', 'target', 'dls', 'rain', 'fifty', 'century', 'batting', 'bowling', 'five-for', 'hat-trick', 'player-of-match', 'result', 'scorecard', 'points-table', 'qualified', 'champions'] as const;
export type CricketTemplateId = typeof cricketTemplateIds[number];
export type CricketLayout = 'versus' | 'fixtures' | 'lineup' | 'event' | 'score' | 'batter' | 'bowler' | 'table' | 'result' | 'team';
export type CricketCategory = 'Before the match' | 'Match moments' | 'Player performances' | 'Results & tournament';
export interface CricketTemplate {
    id: CricketTemplateId; title: string; titleNe: string; category: CricketCategory; layout: CricketLayout; headline: string; headlineNe: string; description: string;
}
export const cricketTemplates: CricketTemplate[] = [
    { id: 'matchday', title: 'Matchday', titleNe: 'आजको खेल', category: 'Before the match', layout: 'versus', headline: 'MATCHDAY', headlineNe: 'आजको खेल', description: 'Two teams, one contest. Date, time and venue.' },
    { id: 'fixtures', title: 'Fixtures', titleNe: 'खेल तालिका', category: 'Before the match', layout: 'fixtures', headline: 'ON THE CALENDAR', headlineNe: 'खेल तालिका', description: 'Upcoming matches or the day’s double-header.' },
    { id: 'head-to-head', title: 'Head to head', titleNe: 'आमनेसामने', category: 'Before the match', layout: 'versus', headline: 'THE MATCHUP', headlineNe: 'आमनेसामने', description: 'Team comparison with editable matchup statistics.' },
    { id: 'toss', title: 'Toss update', titleNe: 'टस अपडेट', category: 'Before the match', layout: 'team', headline: 'TOSS UPDATE', headlineNe: 'टस अपडेट', description: 'Toss winner and the decision to bat or bowl.' },
    { id: 'playing-xi', title: 'Playing XI', titleNe: 'प्लेइङ ११', category: 'Before the match', layout: 'lineup', headline: 'THE PLAYING XI', headlineNe: 'प्लेइङ ११', description: 'Eleven names with captain and wicketkeeper markers.' },
    { id: 'team', title: 'Team spotlight', titleNe: 'टोली परिचय', category: 'Before the match', layout: 'team', headline: 'MEET THE TEAM', headlineNe: 'टोली परिचय', description: 'A franchise identity, logo and key information.' },
    { id: 'score', title: 'Score update', titleNe: 'स्कोर अपडेट', category: 'Match moments', layout: 'score', headline: 'SCORE UPDATE', headlineNe: 'स्कोर अपडेट', description: 'Runs, wickets, overs, run rate and chase equation.' },
    { id: 'four', title: 'Four', titleNe: 'चौका', category: 'Match moments', layout: 'event', headline: 'FOUR', headlineNe: 'चौका', description: 'A boundary celebration with batter and score.' },
    { id: 'six', title: 'Six', titleNe: 'छक्का', category: 'Match moments', layout: 'event', headline: 'SIX', headlineNe: 'छक्का', description: 'A maximum, made for an instant post.' },
    { id: 'wicket', title: 'Wicket', titleNe: 'विकेट', category: 'Match moments', layout: 'event', headline: 'WICKET', headlineNe: 'विकेट', description: 'Dismissed batter, bowler and the updated score.' },
    { id: 'powerplay', title: 'Powerplay', titleNe: 'पावरप्ले', category: 'Match moments', layout: 'score', headline: 'POWERPLAY REPORT', headlineNe: 'पावरप्ले रिपोर्ट', description: 'The score and momentum at the end of the powerplay.' },
    { id: 'partnership', title: 'Partnership', titleNe: 'साझेदारी', category: 'Match moments', layout: 'event', headline: 'BUILDING TOGETHER', headlineNe: 'बलियो साझेदारी', description: 'Partnership runs and balls with both batters.' },
    { id: 'innings', title: 'Innings break', titleNe: 'इनिङ्स ब्रेक', category: 'Match moments', layout: 'score', headline: 'INNINGS BREAK', headlineNe: 'इनिङ्स ब्रेक', description: 'The completed innings and its leading performances.' },
    { id: 'target', title: 'Target', titleNe: 'लक्ष्य', category: 'Match moments', layout: 'event', headline: 'THE CHASE IS ON', headlineNe: 'लक्ष्य पछ्याउँदै', description: 'Target runs, available overs and required rate.' },
    { id: 'dls', title: 'Revised target · DLS', titleNe: 'संशोधित लक्ष्य', category: 'Match moments', layout: 'event', headline: 'REVISED TARGET', headlineNe: 'संशोधित लक्ष्य', description: 'Enter an officially announced revised target and overs.' },
    { id: 'rain', title: 'Match interruption', titleNe: 'खेल अवरुद्ध', category: 'Match moments', layout: 'team', headline: 'PLAY INTERRUPTED', headlineNe: 'खेल अवरुद्ध', description: 'Rain, delay or resumption with a time-stamped update.' },
    { id: 'fifty', title: 'Half-century', titleNe: 'अर्धशतक', category: 'Player performances', layout: 'batter', headline: 'FIFTY. WELL PLAYED.', headlineNe: 'शानदार अर्धशतक', description: 'A fifty, balls faced, boundaries and strike rate.' },
    { id: 'century', title: 'Century', titleNe: 'शतक', category: 'Player performances', layout: 'batter', headline: 'A HUNDRED TO REMEMBER', headlineNe: 'अविस्मरणीय शतक', description: 'Celebrate a hundred with the complete batting line.' },
    { id: 'batting', title: 'Batter spotlight', titleNe: 'ब्याटिङ प्रदर्शन', category: 'Player performances', layout: 'batter', headline: 'BATTING MASTERCLASS', headlineNe: 'उत्कृष्ट ब्याटिङ', description: 'A batter’s runs, balls, fours, sixes and strike rate.' },
    { id: 'bowling', title: 'Bowler spotlight', titleNe: 'बलिङ प्रदर्शन', category: 'Player performances', layout: 'bowler', headline: 'A SPELL TO REMEMBER', headlineNe: 'शानदार बलिङ', description: 'Wickets, runs conceded, overs, maidens and economy.' },
    { id: 'five-for', title: 'Five-wicket haul', titleNe: 'पाँच विकेट', category: 'Player performances', layout: 'bowler', headline: 'FIVE OF THE BEST', headlineNe: 'पाँच विकेटको कमाल', description: 'A five-for with a full bowling analysis.' },
    { id: 'hat-trick', title: 'Hat-trick', titleNe: 'ह्याट्रिक', category: 'Player performances', layout: 'bowler', headline: 'THREE BALLS. THREE WICKETS.', headlineNe: 'तीन बल, तीन विकेट', description: 'An extraordinary sequence and the bowler’s figures.' },
    { id: 'player-of-match', title: 'Player of the match', titleNe: 'प्लेयर अफ द म्याच', category: 'Player performances', layout: 'batter', headline: 'PLAYER OF THE MATCH', headlineNe: 'प्लेयर अफ द म्याच', description: 'The match award with a portrait and performance line.' },
    { id: 'result', title: 'Match result', titleNe: 'खेलको नतिजा', category: 'Results & tournament', layout: 'result', headline: 'VICTORY', headlineNe: 'विजयी', description: 'Winning margin and both innings totals.' },
    { id: 'scorecard', title: 'Scorecard', titleNe: 'स्कोरकार्ड', category: 'Results & tournament', layout: 'table', headline: 'THE SCORECARD', headlineNe: 'स्कोरकार्ड', description: 'Selected batting and bowling performances in one card.' },
    { id: 'points-table', title: 'Points table', titleNe: 'अङ्क तालिका', category: 'Results & tournament', layout: 'table', headline: 'THE STANDINGS', headlineNe: 'अङ्क तालिका', description: 'All eight teams with played, wins, losses, points and NRR.' },
    { id: 'qualified', title: 'Qualification', titleNe: 'प्लेअफमा प्रवेश', category: 'Results & tournament', layout: 'team', headline: 'PLAYOFFS, HERE WE COME', headlineNe: 'प्लेअफमा प्रवेश', description: 'Qualification, elimination or a place in the final.' },
    { id: 'champions', title: 'Champions', titleNe: 'च्याम्पियन', category: 'Results & tournament', layout: 'result', headline: 'CHAMPIONS', headlineNe: 'च्याम्पियन', description: 'The title-winning team in a gold-accented composition.' },
];
export const cricketTemplate = (id: CricketTemplateId) => cricketTemplates.find(template => template.id === id)!;

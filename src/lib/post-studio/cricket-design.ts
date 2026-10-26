import { defaultPostDesign, type PostDesign, type PostFormat } from './types';
import { blankCricketData, cricketNumber, defaultCricketData } from './cricket-data';
import { cricketTemplate, nplTeam, nplTeams, type CricketLanguage, type CricketTemplateId, type NplTeamId } from './cricket-catalog';

export function createCricketDesign(templateId: CricketTemplateId, teamId: NplTeamId = 'lumbini', opponentId: NplTeamId = 'sudurpaschim', format: PostFormat = 'portrait', language: CricketLanguage = 'en'): PostDesign {
    const spec = cricketTemplate(templateId), team = nplTeam(teamId), cricket = defaultCricketData(templateId);
    cricket.teamId = teamId; cricket.opponentId = opponentId; cricket.language = language;
    const otherTeams = nplTeams.filter(item => item.id !== teamId && item.id !== opponentId);
    cricket.fixtures = cricket.fixtures.map((row, index) => ({ ...row, teamId: index === 0 ? teamId : otherTeams[0].id, opponentId: index === 0 ? opponentId : otherTeams[1].id }));
    if (language === 'ne') {
        cricket.batter.name = 'ब्याटरको नाम'; cricket.secondBatter.name = 'साझेदारको नाम'; cricket.bowler.name = 'बलरको नाम';
        cricket.batting = cricket.batting.map((row, index) => ({ ...row, name: ['ब्याटरको नाम', 'साझेदारको नाम', 'ओपनरको नाम'][index] }));
        cricket.bowling = cricket.bowling.map((row, index) => ({ ...row, name: index ? 'स्पिनरको नाम' : 'बलरको नाम' }));
        cricket.lineup = cricket.lineup.map((_, index) => `खेलाडी ${cricketNumber(index + 1, 'ne')}${index === 0 ? ' (c)' : index === 1 ? ' (wk)' : ''}`);
        cricket.result = '७ विकेटले जितेको'; cricket.dismissal = 'क्याच: फिल्डरको नाम, बलिङ: बलरको नाम';
        cricket.statRows = cricket.statRows.map((row, index) => ({ ...row, label: ['खेल', 'जित', 'पछिल्लो लय'][index] }));
        cricket.fixtures = cricket.fixtures.map(row => ({ ...row, when: 'पुष्टि भएको मिति · नेपाल समय' }));
    }
    if (templateId === 'target') { cricket.runs = 0; cricket.wickets = 0; cricket.overs = '0'; }
    if (templateId === 'toss') cricket.result = language === 'ne' ? 'टस जितेर ब्याटिङ रोजेको' : 'Won the toss · elected to bat';
    if (templateId === 'rain') cricket.result = language === 'ne' ? 'अर्को आधिकारिक अपडेटको प्रतीक्षामा' : 'Awaiting the next official update';
    if (templateId === 'qualified') cricket.result = language === 'ne' ? 'प्लेअफमा स्थान पक्का' : 'A place in the playoffs';
    if (templateId === 'team') cricket.result = '';
    if (templateId === 'fifty') cricket.batter = { ...cricket.batter, runs: 50, balls: 34, fours: 4, sixes: 3 };
    if (templateId === 'century') cricket.batter = { ...cricket.batter, runs: 100, balls: 60, fours: 8, sixes: 6 };
    if (templateId === 'five-for') cricket.bowler.wickets = 5;
    if (templateId === 'powerplay') { cricket.runs = 48; cricket.wickets = 1; cricket.overs = '6'; }
    if (templateId === 'innings') { cricket.runs = 179; cricket.wickets = 8; cricket.overs = '20'; }
    if (templateId === 'result' || templateId === 'champions') { cricket.runs = 180; cricket.wickets = 3; cricket.overs = '19.2'; }
    return {
        ...structuredClone(defaultPostDesign), template: 'cricket', format, cricket,
        category: 'NPL 2026', eyebrow: language === 'ne' ? 'द लिडर्स · क्रिकेट' : 'THE LEADERS / CRICKET',
        headline: language === 'ne' ? spec.headlineNe : spec.headline,
        summary: '', author: language === 'ne' ? 'द लिडर्स खेलकुद' : 'The Leaders Sports',
        accent: templateId === 'champions' ? '#EFCB73' : team.primary, backgroundColor: team.dark, imageTone: 'ink',
    };
}

/** Production drafts retain the chosen composition and identity, with empty match data. */
export function createCricketDraftDesign(...args: Parameters<typeof createCricketDesign>): PostDesign {
    const preview = createCricketDesign(...args), before = preview.cricket!;
    return { ...preview, cricket: {
        ...blankCricketData(before.template), teamId: before.teamId, opponentId: before.opponentId,
        language: before.language, theme: before.theme,
        statRows: before.statRows.map(row => ({ ...row, value: '—' })),
    } };
}

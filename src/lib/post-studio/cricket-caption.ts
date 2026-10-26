import type { PostDraft } from './drafts';
import { nplTeam, teamName } from './cricket-catalog';
import { cricketNumber, cricketScore } from './cricket-data';

export function generateCricketCaption(slides: PostDraft[]): string {
    const first = slides[0]?.design, data = first?.cricket;
    if (!first || !data) return '';
    const language = data.language, n = (value: number | string | null) => cricketNumber(value, language);
    const team = nplTeam(data.teamId), opponent = nplTeam(data.opponentId);

    const details = slides.map((item, index) => {
        const cricket = item.design.cricket;
        if (!cricket) return [item.design.headline, item.design.summary].filter(Boolean).join('\n');
        let detail = '';
        if (['score', 'powerplay', 'innings', 'four', 'six', 'wicket'].includes(cricket.template)) detail = `${nplTeam(cricket.teamId).short} ${n(cricketScore(cricket.runs, cricket.wickets))} (${n(cricket.overs)} ${language === 'ne' ? 'ओभर' : 'ov'})`;
        if (['batting', 'fifty', 'century', 'player-of-match'].includes(cricket.template)) detail = `${cricket.batter.name}: ${n(cricket.batter.runs)}${cricket.batter.notOut ? '*' : ''} (${n(cricket.batter.balls)})`;
        if (['bowling', 'five-for', 'hat-trick'].includes(cricket.template) || (cricket.template === 'player-of-match' && cricket.awardPerformance === 'bowling')) detail = `${cricket.bowler.name}: ${n(cricket.bowler.wickets)}/${n(cricket.bowler.runs)} (${n(cricket.bowler.overs)} ${language === 'ne' ? 'ओभर' : 'ov'})`;
        if (cricket.template === 'player-of-match' && cricket.awardPerformance === 'all-round') detail += ` · ${n(cricket.bowler.wickets)}/${n(cricket.bowler.runs)} ${language === 'ne' ? 'बलिङ' : 'with the ball'}`;
        if (cricket.template === 'target' || cricket.template === 'dls') detail = `${language === 'ne' ? 'लक्ष्य' : 'Target'} ${n(cricket.target)} · ${n(cricket.oversLimit)} ${language === 'ne' ? 'ओभर' : 'overs'}${cricket.template === 'dls' ? ' · DLS' : ''}`;
        if (['result', 'champions', 'qualified', 'toss', 'rain'].includes(cricket.template)) detail = cricket.result;
        const body = [item.design.headline, detail, item.design.summary].filter(Boolean).join('\n');
        return slides.length > 1 ? `${n(index + 1)}. ${body}` : body;
    }).filter(Boolean).join('\n\n');
    const sources = Array.from(new Set(slides.map(item => item.design.cricket?.sourceUrl).filter((url): url is string => Boolean(url))));
    const photoCredits = Array.from(new Set(slides.filter(item => item.design.imageUri).map(item => item.design.imageCredit).filter(Boolean)));
    const tags = ['#NPL', '#NepalPremierLeague', '#NepalCricket', '#TheLeaders', `#${team.name.replace(/[^a-zA-Z0-9]/g, '')}`, `#${opponent.name.replace(/[^a-zA-Z0-9]/g, '')}`].join(' ');
    const when = [data.matchDate, data.startTime ? `${data.startTime} NPT` : '', data.venue].filter(Boolean).join(' · ');
    return `${data.competition} | ${teamName(team, language)} vs ${teamName(opponent, language)}\n${when}\n\n${details}${sources.length ? `\n\n${language === 'ne' ? 'स्रोत' : 'Sources'}:\n${sources.join('\n')}` : ''}${photoCredits.length ? `\n\n${photoCredits.join('\n\n')}` : ''}\n\n${first.author || 'The Leaders Sports'}\n\n${tags}`;
}

import { composeCaption, uniqueCaptionParts } from './caption-utils';
import type { PostDraft } from './drafts';
import { nplTeam, teamName } from './cricket-catalog';
import { cricketNumber, cricketScore } from './cricket-data';
import { hasBatter, scoreChase, scoreState } from './score-update';
import { bowlerCreditedTypes } from './moment-posts';

export function generateCricketCaption(slides: PostDraft[]): string {
    const first = slides[0]?.design, data = first?.cricket;
    if (!first || !data) return '';
    const language = data.language, n = (value: number | string | null) => cricketNumber(value, language);
    const team = nplTeam(data.teamId), opponent = nplTeam(data.opponentId);
    const profilesOnly = slides.every(item => item.design.cricket?.template === 'team');

    const details = slides.map(item => {
        const cricket = item.design.cricket;
        if (!cricket) return [item.design.headline, item.design.summary].filter(Boolean).join('\n');
        let detail = '';
        if (['score', 'powerplay', 'innings', 'four', 'six', 'wicket'].includes(cricket.template) && cricket.runs !== null && cricket.wickets !== null) detail = `${teamName(nplTeam(cricket.teamId), language)} ${n(cricketScore(cricket.runs, cricket.wickets))} (${n(cricket.overs)} ${language === 'ne' ? 'ओभर' : 'ov'})`;
        if (['four', 'six'].includes(cricket.template)) detail = `${cricket.batter.name}\n${detail}`;
        if (cricket.template === 'powerplay') detail += `\n${language === 'ne' ? 'पावरप्ले समाप्त' : 'Powerplay complete'} · ${n(cricket.powerplayOvers||'—')} ${language === 'ne' ? 'ओभर' : 'overs'}`;
        if (cricket.template === 'partnership') detail = `${cricket.batter.name} & ${cricket.secondBatter.name}\n${n(cricket.partnershipRuns)} ${language === 'ne' ? 'रन' : 'runs'} · ${n(cricket.partnershipBalls)} ${language === 'ne' ? 'बल' : 'balls'}\n${teamName(nplTeam(cricket.teamId), language)} ${n(cricketScore(cricket.runs,cricket.wickets))} (${n(cricket.overs)} ${language === 'ne' ? 'ओभर' : 'ov'})`;
        if (cricket.template === 'wicket') detail = [`${language === 'ne' ? 'आउट' : 'OUT'}: ${cricket.batter.name}`, cricket.dismissal, cricket.wicketType && bowlerCreditedTypes.includes(cricket.wicketType) && cricket.bowler.name ? `${language === 'ne' ? 'बलर' : 'Bowler'}: ${cricket.bowler.name}` : '', detail].filter(Boolean).join('\n');
        if (cricket.template === 'score') {
            const equation = scoreChase(cricket), state = scoreState(cricket);
            detail += `\n${cricket.scoreInnings === 'first' ? language === 'ne' ? 'पहिलो इनिङ्स' : 'First innings' : cricket.scoreInnings === 'chase' ? language === 'ne' ? 'लक्ष्य पछ्याउँदै' : 'Chase' : ''}`;
            if (equation) detail += language === 'ne' ? `\n${n(equation.runs)} रन आवश्यक, ${n(equation.balls)} बल बाँकी · लक्ष्य ${n(cricket.target)}` : `\n${n(equation.runs)} needed from ${n(equation.balls)} balls · Target ${n(cricket.target)}`;
            if (state === 'target-reached') detail += language === 'ne' ? '\nलक्ष्य पूरा' : '\nTarget reached';
            if (state === 'all-out') detail += language === 'ne' ? '\nअलआउट' : '\nAll out';
            if (state === 'overs-complete') detail += language === 'ne' ? '\nओभर पूरा' : '\nOvers complete';
            for (const batter of [cricket.batter, cricket.secondBatter].filter(hasBatter)) detail += `\n${batter.name}: ${n(batter.runs)}${batter.notOut ? '*' : ''} (${n(batter.balls)})`;
        }
        if (['batting', 'fifty', 'century', 'player-of-match'].includes(cricket.template)) detail = `${cricket.batter.name}: ${n(cricket.batter.runs)}${cricket.batter.notOut ? '*' : ''} (${n(cricket.batter.balls)})`;
        if (['bowling', 'five-for', 'hat-trick'].includes(cricket.template) || (cricket.template === 'player-of-match' && cricket.awardPerformance === 'bowling')) detail = `${cricket.bowler.name}: ${n(cricket.bowler.wickets)}/${n(cricket.bowler.runs)} (${n(cricket.bowler.overs)} ${language === 'ne' ? 'ओभर' : 'ov'})`;
        if (cricket.template === 'player-of-match' && cricket.awardPerformance === 'all-round') detail += ` · ${n(cricket.bowler.wickets)}/${n(cricket.bowler.runs)} ${language === 'ne' ? 'बलिङ' : 'with the ball'}`;
        if (cricket.template === 'target' || cricket.template === 'dls') detail = `${language === 'ne' ? 'लक्ष्य' : 'Target'} ${n(cricket.target)} · ${n(cricket.oversLimit)} ${language === 'ne' ? 'ओभर' : 'overs'}${cricket.template === 'dls' ? ' · DLS' : ''}`;
        if (['result', 'champions', 'qualified', 'rain'].includes(cricket.template)) detail = cricket.result;
        if (cricket.template === 'toss') {
            const winner = cricket.toss?.winnerId, decision = cricket.toss?.decision;
            detail = winner && [cricket.teamId, cricket.opponentId].includes(winner) ? `${teamName(nplTeam(winner), language)} · ${language === 'ne' ? 'टस जितेको' : 'won the toss'}` : '';
            detail += `\n${decision === 'bat' ? language === 'ne' ? 'पहिले ब्याटिङ रोजेको' : 'Elected to bat first' : decision === 'bowl' ? language === 'ne' ? 'पहिले बलिङ रोजेको' : 'Elected to bowl first' : ''}`;
        }
        if (cricket.template === 'playing-xi') detail = cricket.lineup.map((name, i) => `${n(i + 1)}. ${name}`).join('\n');
        if (cricket.template === 'team') detail = [[language === 'ne' ? 'कप्तान' : 'Captain', cricket.teamProfile?.captain], [language === 'ne' ? 'मुख्य प्रशिक्षक' : 'Head coach', cricket.teamProfile?.headCoach], [language === 'ne' ? 'गृह सहर' : 'Home city', cricket.teamProfile?.homeCity]].filter(row => row[1]?.trim()).map(([label, value]) => `${label}: ${value}`).join('\n');
        if (cricket.template === 'head-to-head') {
            const record = cricket.headToHead;
            detail = language === 'ne'
                ? `एनपीएलका सबै भेट · ${n(record?.played ?? null)} खेल\n${teamName(nplTeam(cricket.teamId), language)}: ${n(record?.teamWins ?? null)} जित · ${teamName(nplTeam(cricket.opponentId), language)}: ${n(record?.opponentWins ?? null)} जित\nविजेताविनाको बराबरी: ${n(record?.ties ?? null)} · नतिजाविहीन: ${n(record?.noResults ?? null)}\nतथ्याङ्क मिति: ${record?.asOf || '—'}`
                : `All NPL meetings · ${n(record?.played ?? null)} played\n${nplTeam(cricket.teamId).name}: ${n(record?.teamWins ?? null)} ${record?.teamWins === 1 ? 'win' : 'wins'} · ${nplTeam(cricket.opponentId).name}: ${n(record?.opponentWins ?? null)} ${record?.opponentWins === 1 ? 'win' : 'wins'}\nTied without a winner: ${n(record?.ties ?? null)} · No result: ${n(record?.noResults ?? null)}\nRecord as of: ${record?.asOf || '—'}`;
        }
        if (cricket.template === 'fixtures') detail = cricket.fixtures.map(game => [
            `${teamName(nplTeam(game.teamId), language)} vs ${teamName(nplTeam(game.opponentId), language)}`, game.when, game.venue,
        ].filter(Boolean).join(' · ')).join('\n');
        if (cricket.template === 'points-table') detail = cricket.standings.map(row => [teamName(nplTeam(row.teamId), language), row.played !== null ? `${n(row.played)} ${language === 'ne' ? 'खेल' : 'played'}` : '', row.points !== null ? `${n(row.points)} ${language === 'ne' ? 'अङ्क' : 'pts'}` : '', row.nrr ? `NRR ${n(row.nrr)}` : ''].filter(Boolean).join(' · ')).join('\n');
        if (cricket.template === 'scorecard') detail = [
            cricket.runs !== null && cricket.wickets !== null ? `${teamName(nplTeam(cricket.teamId), language)} ${n(cricketScore(cricket.runs, cricket.wickets))}${cricket.overs ? ` (${n(cricket.overs)} ${language === 'ne' ? 'ओभर' : 'ov'})` : ''}` : '',
            ...cricket.batting.map(row => `${row.name}: ${row.runs !== null ? n(row.runs) : ''}${row.notOut ? '*' : ''}${row.balls !== null ? ` (${n(row.balls)})` : ''}`),
            ...cricket.bowling.map(row => `${row.name}: ${row.wickets !== null ? n(row.wickets) : ''}/${row.runs !== null ? n(row.runs) : ''}${row.overs ? ` (${n(row.overs)} ${language === 'ne' ? 'ओभर' : 'ov'})` : ''}`),
        ].filter(Boolean).join('\n');
        return uniqueCaptionParts([item.design.headline, detail, item.design.summary]).join('\n');
    }).filter(Boolean).join('\n\n');
    const tags = ['#NPL', '#NepalPremierLeague', '#NepalCricket', '#TheLeaders', `#${team.name.replace(/[^a-zA-Z0-9]/g, '')}`, ...profilesOnly ? [] : [`#${opponent.name.replace(/[^a-zA-Z0-9]/g, '')}`]].join(' ');
    const when = profilesOnly ? '' : [data.matchDate, data.startTime ? `${data.startTime} NPT` : '', data.venue].filter(Boolean).join(' · ');
    return composeCaption([`${[data.competition, `${teamName(team, language)}${profilesOnly ? '' : ` vs ${teamName(opponent, language)}`}`].filter(Boolean).join(' | ')}\n${when}`.trim(), ...details.split('\n\n')], tags.split(' '), first.author || 'The Leaders Sports');
}

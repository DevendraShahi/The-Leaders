import type { PostDraft } from './drafts';
import { nplTeam, teamName } from './cricket-catalog';
import { cricketNumber, cricketScore } from './cricket-data';
import { hasBatter, scoreChase, scoreState } from './score-update';
import { bowlerCreditedTypes } from './moment-posts';
import { matchingPortraitFor } from './player-portraits';
import { playerPhotoCredit } from './cricket-players';

export function generateCricketCaption(slides: PostDraft[]): string {
    const first = slides[0]?.design, data = first?.cricket;
    if (!first || !data) return '';
    const language = data.language, n = (value: number | string | null) => cricketNumber(value, language);
    const team = nplTeam(data.teamId), opponent = nplTeam(data.opponentId);
    const profilesOnly = slides.every(item => item.design.cricket?.template === 'team');

    const details = slides.map((item, index) => {
        const cricket = item.design.cricket;
        if (!cricket) return [item.design.headline, item.design.summary].filter(Boolean).join('\n');
        let detail = '';
        if (['score', 'powerplay', 'innings', 'four', 'six', 'wicket'].includes(cricket.template)) detail = `${nplTeam(cricket.teamId).short} ${n(cricketScore(cricket.runs, cricket.wickets))} (${n(cricket.overs)} ${language === 'ne' ? 'ओभर' : 'ov'})`;
        if (['four', 'six'].includes(cricket.template)) detail = `${cricket.batter.name}\n${detail}`;
        if (cricket.template === 'powerplay') detail += `\n${language === 'ne' ? 'पावरप्ले समाप्त' : 'Powerplay complete'} · ${n(cricket.powerplayOvers||'—')} ${language === 'ne' ? 'ओभर' : 'overs'}`;
        if (cricket.template === 'partnership') detail = `${cricket.batter.name} & ${cricket.secondBatter.name}\n${n(cricket.partnershipRuns)} ${language === 'ne' ? 'रन' : 'runs'} · ${n(cricket.partnershipBalls)} ${language === 'ne' ? 'बल' : 'balls'}\n${nplTeam(cricket.teamId).short} ${n(cricketScore(cricket.runs,cricket.wickets))} (${n(cricket.overs)} ${language === 'ne' ? 'ओभर' : 'ov'})`;
        if (cricket.template === 'wicket') detail = [`${language === 'ne' ? 'आउट' : 'OUT'}: ${cricket.batter.name}`, cricket.dismissal, cricket.wicketType && bowlerCreditedTypes.includes(cricket.wicketType) && cricket.bowler.name ? `${language === 'ne' ? 'बलर' : 'Bowler'}: ${cricket.bowler.name}` : '', detail].filter(Boolean).join('\n');
        if (cricket.template === 'score') {
            const equation = scoreChase(cricket), state = scoreState(cricket);
            detail += `\n${cricket.scoreInnings === 'first' ? language === 'ne' ? 'पहिलो इनिङ्स' : 'First innings' : cricket.scoreInnings === 'chase' ? language === 'ne' ? 'लक्ष्य पछ्याउँदै' : 'Chase' : language === 'ne' ? 'इनिङ्स पुष्टि हुन बाँकी' : 'Innings to confirm'}`;
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
            detail = winner && [cricket.teamId, cricket.opponentId].includes(winner) ? `${teamName(nplTeam(winner), language)} · ${language === 'ne' ? 'टस जितेको' : 'won the toss'}` : language === 'ne' ? 'टस विजेता पुष्टि हुन बाँकी' : 'Toss winner to confirm';
            detail += `\n${decision === 'bat' ? language === 'ne' ? 'पहिले ब्याटिङ रोजेको' : 'Elected to bat first' : decision === 'bowl' ? language === 'ne' ? 'पहिले बलिङ रोजेको' : 'Elected to bowl first' : language === 'ne' ? 'निर्णय पुष्टि हुन बाँकी' : 'Decision to confirm'}`;
        }
        if (cricket.template === 'playing-xi') detail = cricket.lineup.map((name, i) => `${n(i + 1)}. ${name}`).join('\n');
        if (cricket.template === 'team') detail = [[language === 'ne' ? 'कप्तान' : 'Captain', cricket.teamProfile?.captain], [language === 'ne' ? 'मुख्य प्रशिक्षक' : 'Head coach', cricket.teamProfile?.headCoach], [language === 'ne' ? 'गृह सहर' : 'Home city', cricket.teamProfile?.homeCity]].filter(row => row[1]?.trim()).map(([label, value]) => `${label}: ${value}`).join('\n');
        if (cricket.template === 'head-to-head') {
            const record = cricket.headToHead;
            detail = language === 'ne'
                ? `एनपीएलका सबै भेट · ${n(record?.played ?? null)} खेल\n${teamName(nplTeam(cricket.teamId), language)}: ${n(record?.teamWins ?? null)} जित · ${teamName(nplTeam(cricket.opponentId), language)}: ${n(record?.opponentWins ?? null)} जित\nविजेताविनाको बराबरी: ${n(record?.ties ?? null)} · नतिजाविहीन: ${n(record?.noResults ?? null)}\nतथ्याङ्क मिति: ${record?.asOf || '—'}`
                : `All NPL meetings · ${n(record?.played ?? null)} played\n${nplTeam(cricket.teamId).name}: ${n(record?.teamWins ?? null)} ${record?.teamWins === 1 ? 'win' : 'wins'} · ${nplTeam(cricket.opponentId).name}: ${n(record?.opponentWins ?? null)} ${record?.opponentWins === 1 ? 'win' : 'wins'}\nTied without a winner: ${n(record?.ties ?? null)} · No result: ${n(record?.noResults ?? null)}\nRecord as of: ${record?.asOf || '—'}`;
        }
        const body = [item.design.headline, detail, item.design.summary].filter(Boolean).join('\n');
        return slides.length > 1 ? `${n(index + 1)}. ${body}` : body;
    }).filter(Boolean).join('\n\n');
    const sources = Array.from(new Set(slides.flatMap(item => [item.design.cricket?.sourceUrl, ...(item.design.sourceUrls ?? [])]).filter((url): url is string => Boolean(url))));
    const photoCredits = Array.from(new Set(slides.flatMap(item => {
        const d=item.design,c=d.cricket;if(c?.showPlayerPhoto===false||d.hiddenLayers.includes('visual'))return [];
        const second=c?.template==='partnership'?matchingPortraitFor(c.secondBatter.name,c.teamId):undefined;
        return [d.imageUri?d.imageCredit:'',second?playerPhotoCredit(second):''].filter(Boolean);
    })));
    const tags = ['#NPL', '#NepalPremierLeague', '#NepalCricket', '#TheLeaders', `#${team.name.replace(/[^a-zA-Z0-9]/g, '')}`, ...profilesOnly ? [] : [`#${opponent.name.replace(/[^a-zA-Z0-9]/g, '')}`]].join(' ');
    const when = profilesOnly ? '' : [data.matchDate, data.startTime ? `${data.startTime} NPT` : '', data.venue].filter(Boolean).join(' · ');
    return `${data.competition} | ${teamName(team, language)}${profilesOnly ? '' : ` vs ${teamName(opponent, language)}`}\n${when}\n\n${details}${sources.length ? `\n\n${language === 'ne' ? 'स्रोत' : 'Sources'}:\n${sources.join('\n')}` : ''}${photoCredits.length ? `\n\n${photoCredits.join('\n\n')}` : ''}\n\n${first.author || 'The Leaders Sports'}\n\n${tags}`;
}

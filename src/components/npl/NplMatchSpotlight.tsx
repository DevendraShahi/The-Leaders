"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Award, Calendar, ChevronRight, Clock, MapPin } from 'lucide-react';
import type { NplTeamExtended } from '@/lib/npl-data';
import type { CricketFixture } from '@/lib/post-studio/cricket-fixtures';
import type { CompletedMatchScorecard } from '@/lib/npl-match-data';
import { fixtureTeamScore, selectNplSpotlight } from '@/lib/npl-spotlight';

export function NplMatchSpotlight({ teams, fixtures, scorecards, initialNow, isNe, onScorecard, onFixtures }: {
    teams: NplTeamExtended[]; fixtures: CricketFixture[]; scorecards: Record<number, CompletedMatchScorecard>;
    initialNow?: string; isNe: boolean; onScorecard: (card: CompletedMatchScorecard) => void; onFixtures: () => void;
}) {
    const [now, setNow] = useState(() => initialNow ? new Date(initialNow) : new Date());
    const [view, setView] = useState<'match' | 'result'>('match');
    useEffect(() => {
        const refresh = () => { if (document.visibilityState !== 'hidden') setNow(new Date()); };
        refresh(); const timer = setInterval(refresh, 60000);
        window.addEventListener('focus', refresh); document.addEventListener('visibilitychange', refresh);
        return () => { clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
    }, []);
    const { featured, result, scorecard } = selectNplSpotlight(fixtures, scorecards, now);
    const resultView = result && (view === 'result' || !featured);
    const fixture = resultView ? result : featured?.fixture;
    const t = (en: string, ne: string) => isNe ? ne : en;
    const matchTab = featured?.state === 'live' ? t('Live match', 'प्रत्यक्ष खेल') : featured?.isToday ? t('Today’s match', 'आजको खेल') : featured?.state === 'awaiting-update' ? t('Latest fixture', 'पछिल्लो खेल') : t('Next match', 'आगामी खेल');
    const status = resultView ? t('Completed', 'सम्पन्न') : featured?.state === 'live' ? t('Live', 'प्रत्यक्ष') : featured?.state === 'awaiting-update' ? t('Awaiting match update', 'खेलको अपडेटको प्रतीक्षामा') : t('Scheduled', 'निर्धारित');
    const date = fixture ? new Intl.DateTimeFormat(isNe ? 'ne-NP' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kathmandu' }).format(new Date(`${fixture.matchDate}T12:00:00+05:45`)) : '';
    const actualCard = resultView ? scorecard : undefined;
    const resultText = fixture && resultView ? isNe ? actualCard?.resultNe || fixture.resultNe || fixture.result : actualCard?.result || fixture.result : undefined;
    const potm = fixture && resultView ? isNe ? actualCard?.playerOfTheMatch.nameNe || fixture.playerOfTheMatchNe || fixture.playerOfTheMatch : actualCard?.playerOfTheMatch.name || fixture.playerOfTheMatch : undefined;
    const performance = actualCard ? isNe ? actualCard.playerOfTheMatch.performanceNe : actualCard.playerOfTheMatch.performance : fixture?.playerOfTheMatchPerf;
    return <section aria-label={t('Match spotlight', 'मुख्य खेल')} className="w-full lg:w-[400px] shrink-0 rounded-lg border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3" role="group" aria-label={t('Match view', 'खेल दृश्य')}>
            <button disabled={!featured} aria-pressed={!resultView} onClick={() => setView('match')} className={`min-h-10 rounded-md px-3 text-xs font-semibold disabled:opacity-40 ${!resultView ? 'bg-foreground text-background' : 'bg-muted/40 text-muted-foreground'}`}>{matchTab}</button>
            <button disabled={!result} aria-pressed={Boolean(resultView)} onClick={() => setView('result')} className={`min-h-10 rounded-md px-3 text-xs font-semibold disabled:opacity-40 ${resultView ? 'bg-foreground text-background' : 'bg-muted/40 text-muted-foreground'}`}>{t('Latest result', 'पछिल्लो नतिजा')}</button>
        </div>
        {!fixture ? <div className="py-6 text-sm text-muted-foreground">{t('No confirmed match schedule is available.', 'पुष्टि भएको खेल तालिका उपलब्ध छैन।')}</div> : <>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 text-[11px]">
                <span className="font-mono font-semibold">{t('Match', 'खेल')} #{String(fixture.matchNumber).padStart(2, '0')}</span>
                <span data-testid="npl-spotlight-status" className={`rounded px-2 py-1 font-medium ${featured?.state === 'live' && !resultView ? 'bg-red-500/10 text-red-600' : resultView ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>{status}</span>
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground"><Calendar className="h-3 w-3" /><time dateTime={fixture.matchDate}>{date}</time>{!resultView && fixture.startTime && <><Clock className="ml-1 h-3 w-3" /><time dateTime={`${fixture.matchDate}T${fixture.startTime}:00+05:45`}>{fixture.startTime} NPT</time></>}</p>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 py-5">
                {[fixture.teamId, fixture.opponentId].map((id, index) => {
                    const team = teams.find(item => item.id === id), winner = resultView && (actualCard?.winnerId || fixture.winnerId) === id;
                    return <div className="contents" key={id}>{index === 1 && <span className="text-[10px] font-bold text-muted-foreground">VS</span>}<div className="flex min-w-0 flex-col items-center gap-2 text-center"><div className={`relative h-12 w-12 ${winner ? 'rounded border border-emerald-500/50 bg-emerald-500/5' : ''}`}><Image src={team?.logo || `/studio/cricket/${id}.png`} alt={team?.name || id} fill sizes="48px" className="object-contain p-0.5" /></div><strong className="text-xs leading-snug">{team ? isNe ? team.nameNe : team.name : id}</strong>{fixtureTeamScore(fixture, id, actualCard) ? <span data-testid={`npl-score-${id}`} className="font-mono text-xs font-bold">{fixtureTeamScore(fixture, id, actualCard)}</span> : !resultView && team?.captain ? <span className="text-[10px] text-muted-foreground">{team.captain} (C)</span> : null}</div></div>;
                })}
            </div>
            {resultView && <div className="rounded-md border border-border bg-muted/30 p-3 text-center text-xs"><p className="font-semibold leading-relaxed">{resultText || t('Result details awaiting confirmation.', 'नतिजाको विवरण पुष्टि हुन बाँकी छ।')}</p>{potm && <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-muted-foreground"><Award className="h-3 w-3 shrink-0" /><span>{t('POTM', 'उत्कृष्ट खेलाडी')}: {potm}{performance ? ` · ${performance}` : ''}</span></p>}</div>}
            {!resultView && featured?.state === 'awaiting-update' && <p className="pb-3 text-xs leading-relaxed text-muted-foreground">{t('The scheduled start has passed. A confirmed score or result has not been added yet.', 'निर्धारित सुरु हुने समय बितिसकेको छ। पुष्टि भएको स्कोर वा नतिजा थपिएको छैन।')}</p>}
            <p className="my-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground"><MapPin className="mt-0.5 h-3 w-3 shrink-0" />{actualCard && isNe ? actualCard.venueNe : fixture.venue}</p>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">{actualCard && <button onClick={() => onScorecard(actualCard)} className="inline-flex min-h-10 items-center gap-1 rounded-md bg-foreground px-3 text-xs font-semibold text-background">{t('View scorecard', 'स्कोरकार्ड हेर्नुहोस्')}<ChevronRight className="h-3 w-3" /></button>}{resultView && !actualCard && fixture.sourceUrl && <a href={fixture.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center text-xs font-semibold underline underline-offset-4">{t('View result source', 'नतिजाको स्रोत हेर्नुहोस्')} ↗</a>}<button className="min-h-10 text-xs font-semibold underline underline-offset-4" onClick={onFixtures}>{t('All fixtures', 'सम्पूर्ण खेल तालिका')}</button></div>
        </>}
    </section>;
}

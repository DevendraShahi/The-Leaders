import ElectionCountdown from "@/components/home/ElectionCountdown";
import { ElectionSpecial } from "@/components/home/ElectionSpecial";
import { LeadersGrid } from "@/components/home/LeadersGrid";
import { Timeline } from "@/components/home/timeline";
import { Manifesto } from "@/components/home/manifesto";
import { NewsSection } from "@/components/home/news-section";
import { HomeScrollEffects } from "@/components/home/HomeScrollEffects";
import { getArticles } from "@/lib/data";
import { getDailyBriefs, getElectionArticles, getFactChecks } from "@/lib/election-data";

export const revalidate = 3600;


export default async function Home() {
  const articles = await getArticles(3);
  const [dailyBriefs, factChecks, electionArticles] = await Promise.all([
    getDailyBriefs(),
    getFactChecks(),
    getElectionArticles(6),
  ]);

  // Home is a server component; language switching happens client-side.
  // We keep this neutral and let child components handle localization.
  return (
    <HomeScrollEffects>
      <ElectionCountdown />
      <ElectionSpecial
        dailyBriefs={dailyBriefs.slice(0, 6)}
        factChecks={factChecks.slice(0, 6)}
        analyses={electionArticles.slice(0, 6)}
      />
      <LeadersGrid />
      <NewsSection articles={articles} />
      <Manifesto />
      <Timeline limit={2} showViewAll={true} />
    </HomeScrollEffects>
  );
}

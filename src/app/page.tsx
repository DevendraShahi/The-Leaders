import ElectionCountdown from "@/components/home/ElectionCountdown";
import { LeadersGrid } from "@/components/home/leaders-grid";
import { Timeline } from "@/components/home/timeline";
import { Manifesto } from "@/components/home/manifesto";
import { NewsSection } from "@/components/home/news-section";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ElectionCountdown />
      <LeadersGrid />
      <NewsSection />
      <Manifesto />
      <Timeline />
    </div>
  );
}

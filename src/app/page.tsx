import { Hero } from "@/components/home/hero";
import { LeadersGrid } from "@/components/home/leaders-grid";
import { Timeline } from "@/components/home/timeline";
import { Manifesto } from "@/components/home/manifesto";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Hero />
      <LeadersGrid />
      <Manifesto />
      <Timeline />
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { constructMetadata } from "@/lib/metadata";
import { getNplTeamsData, getNplFixtures } from "@/lib/npl-data";
import { nplTeamIds, type NplTeamId } from "@/lib/post-studio/cricket-catalog";
import {
  Shield,
  Users,
  Trophy,
  Calendar,
  ExternalLink,
  ChevronLeft,
  Flame,
  Award,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface TeamPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export async function generateStaticParams() {
  return nplTeamIds.map((id) => ({
    teamId: id,
  }));
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { teamId } = await params;
  const teams = getNplTeamsData();
  const team = teams.find((t) => t.id === teamId);

  if (!team) {
    return {
      title: "Team Not Found | The Leaders",
    };
  }

  const title = `${team.name} (${team.nameNe}) | NPL 2026 Squad, Players & Schedule | The Leaders`;
  const description = `Complete official roster, player statistics, coaching staff, and match fixtures for ${team.name} in Nepal Premier League (NPL) Season 3 (2026). Captain: ${team.captain}, Marquee: ${team.marqueePlayer}.`;

  return constructMetadata({
    title,
    description,
    canonical: `/npl/teams/${team.id}`,
    ogImage: team.logo,
    ogImageType: "image/png",
    keywords: [
      team.name,
      team.nameNe,
      `${team.name} squad`,
      `${team.name} players`,
      `${team.name} NPL 2026`,
      team.captain,
      team.marqueePlayer,
      "Nepal Premier League",
      "NPL Season 3",
    ],
  });
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const teams = getNplTeamsData();
  const team = teams.find((t) => t.id === teamId);

  if (!team) {
    notFound();
  }

  const fixtures = getNplFixtures().filter(
    (f) => f.teamId === team.id || f.opponentId === team.id
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: team.name,
    alternateName: team.nameNe,
    url: `https://theleaders.com.np/npl/teams/${team.id}`,
    logo: `https://theleaders.com.np${team.logo}`,
    sport: "Cricket",
    coach: {
      "@type": "Person",
      name: team.coach,
    },
    athlete: team.players.map((p) => ({
      "@type": "Person",
      name: p.name,
      jobTitle: p.role,
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 1. TEAM HERO BANNER */}
      <section
        className="relative overflow-hidden border-b border-border/80 pt-8 pb-12 md:pt-12 md:pb-16"
        style={{
          background: `linear-gradient(135deg, ${team.dark} 0%, rgba(10, 10, 15, 0.95) 100%)`,
        }}
      >
        <div
          className="absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: team.primary }}
        />

        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Link href="/npl" className="hover:text-primary transition flex items-center gap-1">
              <ChevronLeft className="h-3.5 w-3.5" /> Back to NPL 2026 Hub
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Franchises</span>
            <span>/</span>
            <span className="text-primary font-bold">{team.name}</span>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Logo */}
            <div className="relative h-32 w-32 md:h-40 md:w-40 shrink-0 rounded-2xl bg-black/40 backdrop-blur-md p-4 border border-white/10 shadow-2xl flex items-center justify-center">
              <Image
                src={team.logo}
                alt={team.name}
                fill
                priority
                className="object-contain p-2 drop-shadow-xl"
              />
            </div>

            {/* Details */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="inline-flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-black"
                  style={{ backgroundColor: team.primary }}
                >
                  NPL Season 3 (2026)
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 border border-white/10">
                  Valuation: <strong>{team.bidPriceNpr}</strong>
                </span>
              </div>

              <h1 className="font-bebas text-4xl sm:text-6xl md:text-7xl tracking-tight leading-none text-white uppercase">
                {team.name} <span className="text-white/60 font-hind text-3xl sm:text-4xl">({team.nameNe})</span>
              </h1>

              <p className="text-sm text-white/70 max-w-2xl font-manrope">
                Owned by <strong>{team.owner}</strong>. Competing in the Nepal Premier League (NPL) representing Koshi/Bagmati/Gandaki/Lumbini/Karnali/Sudurpaschim provincial pride.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs">
                <a
                  href={team.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white px-3.5 py-2 font-medium border border-white/15 transition"
                >
                  Official Franchise Site <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Leadership Cards */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
              <span className="text-[10px] text-white/60 uppercase tracking-wider block">Captain</span>
              <strong className="text-white text-sm md:text-base font-semibold block mt-0.5">{team.captain}</strong>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
              <span className="text-[10px] text-white/60 uppercase tracking-wider block">Head Coach</span>
              <strong className="text-white text-sm md:text-base font-semibold block mt-0.5">{team.coach}</strong>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
              <span className="text-[10px] text-white/60 uppercase tracking-wider block">Domestic Marquee</span>
              <strong className="text-white text-sm md:text-base font-semibold block mt-0.5">{team.marqueePlayer}</strong>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
              <span className="text-[10px] text-white/60 uppercase tracking-wider block">Overseas Star</span>
              <strong
                className="text-sm md:text-base font-semibold block mt-0.5 truncate"
                style={{ color: team.primary }}
              >
                {team.overseasStar}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SQUAD ROSTER SECTION */}
      <section className="container mx-auto px-4 max-w-7xl py-10 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">
              Official Squad
            </span>
            <h2 className="font-bebas text-3xl md:text-4xl tracking-tight uppercase">
              {team.name} Players Roster ({team.players.length} Players)
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            All photos with verified transparent studio cutouts
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {team.players.map((p) => (
            <Link
              key={p.id}
              href={`/npl/players/${p.id}`}
              className="group rounded-2xl border border-border/80 bg-card p-3 shadow-sm hover:border-primary/60 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              <div className="relative h-44 w-full flex items-center justify-center bg-gradient-to-b from-primary/5 to-transparent rounded-xl p-2">
                <Image
                  src={p.image.local}
                  alt={p.name}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
                />
                {p.isCaptain && (
                  <span className="absolute top-2 left-2 rounded bg-amber-500 text-black font-extrabold text-[9px] px-1.5 py-0.5 uppercase tracking-wider">
                    Captain
                  </span>
                )}
                {p.isMarquee && (
                  <span className="absolute top-2 right-2 rounded bg-primary text-primary-foreground font-bold text-[9px] px-1.5 py-0.5 uppercase tracking-wider">
                    Marquee
                  </span>
                )}
              </div>

              <div className="mt-3 text-center">
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                  {p.category} · {p.origin}
                </span>
                <h3 className="font-semibold text-xs md:text-sm leading-tight text-foreground truncate mt-0.5 group-hover:text-primary transition">
                  {p.name}
                </h3>
                <span className="text-[11px] text-muted-foreground block truncate">
                  {p.role}
                </span>

                {/* Career Numbers */}
                <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-around text-[10px] text-muted-foreground font-mono">
                  <span>
                    <strong className="text-foreground">{p.stats.matches}</strong> M
                  </span>
                  <span>
                    <strong className="text-foreground">{p.stats.runs}</strong> R
                  </span>
                  <span>
                    <strong className="text-foreground">{p.stats.wickets}</strong> W
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. TEAM FIXTURES SCHEDULE */}
      <section className="container mx-auto px-4 max-w-7xl py-6 space-y-6">
        <div className="border-t border-border pt-8">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">
            Match Calendar
          </span>
          <h2 className="font-bebas text-3xl md:text-4xl tracking-tight uppercase">
            {team.name} Schedule in NPL 2026 ({fixtures.length} Matches)
          </h2>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {fixtures.map((f) => {
              const opponentId = f.teamId === team.id ? f.opponentId : f.teamId;
              const opp = teams.find((item) => item.id === opponentId);
              const isDay = f.startTime === "12:30";

              return (
                <div
                  key={f.id}
                  className="rounded-xl border border-border/70 bg-card/80 p-4 flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="w-16 shrink-0 text-center border-r border-border/60 pr-3">
                    <span className="font-bebas text-xl leading-none text-foreground block">
                      #{f.matchNumber}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {f.matchDate.replace("2026-", "")}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded ${
                        isDay ? "bg-amber-500/10 text-amber-500" : "bg-purple-500/10 text-purple-500"
                      }`}
                    >
                      {f.startTime} NPT
                    </span>
                  </div>

                  <div className="flex-1 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="relative h-8 w-8 shrink-0">
                        <Image src={team.logo} alt={team.name} fill className="object-contain" />
                      </div>
                      <span className="text-xs md:text-sm font-semibold">{team.name}</span>
                    </div>

                    <span className="text-xs font-bebas text-muted-foreground/60 italic">VS</span>

                    <div className="flex items-center gap-2 text-right">
                      <span className="text-xs md:text-sm font-semibold">{opp?.name}</span>
                      {opp && (
                        <div className="relative h-8 w-8 shrink-0">
                          <Image src={opp.logo} alt={opp.name} fill className="object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. OTHER TEAMS QUICK NAV */}
      <section className="container mx-auto px-4 max-w-7xl pt-8">
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="font-bebas text-xl text-muted-foreground uppercase tracking-wider mb-4">
            Explore Other Franchises
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {teams
              .filter((item) => item.id !== team.id)
              .map((other) => (
                <Link
                  key={other.id}
                  href={`/npl/teams/${other.id}`}
                  className="rounded-xl border border-border/70 bg-background/80 p-2.5 hover:border-primary transition text-center flex flex-col items-center gap-1.5 group"
                >
                  <div className="relative h-10 w-10">
                    <Image
                      src={other.logo}
                      alt={other.name}
                      fill
                      className="object-contain group-hover:scale-105 transition"
                    />
                  </div>
                  <span className="text-xs font-semibold truncate w-full text-foreground">
                    {other.short}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

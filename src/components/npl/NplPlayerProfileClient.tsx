"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import type { NplPlayer, NplTeamExtended } from "@/lib/npl-data";
import type { PlayerComputedMeta } from "@/lib/npl-player-meta";
import type { CricketFixture } from "@/lib/post-studio/cricket-fixtures";
import { ArrowLeft, Share2, CheckCircle2, ChevronRight, MapPin, Clock } from "lucide-react";
import { nplTeam } from "@/lib/post-studio/cricket-catalog";

interface NplPlayerProfileClientProps {
  player: NplPlayer;
  team: NplTeamExtended;
  meta: PlayerComputedMeta;
  teamFixtures: CricketFixture[];
  relatedPlayers: NplPlayer[];
}

function formatNplDate(dateStr: string) {
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const mIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${monthNames[mIdx]} ${day}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

export function NplPlayerProfileClient({
  player,
  team,
  meta,
  teamFixtures,
  relatedPlayers
}: NplPlayerProfileClientProps) {
  const { language } = useLanguage();
  const isNe = language === "ne";
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"overview" | "stats" | "fixtures">("overview");

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="npl-sports-hub min-h-screen bg-background text-foreground pb-24 font-sans">
      {/* 1. TOP EDITORIAL BREADCRUMB */}
      <div className="border-b border-border bg-card/40">
        <div className="container mx-auto px-4 max-w-6xl h-11 flex items-center justify-between text-xs gap-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground min-w-0">
            <Link href="/npl" className="hover:text-foreground transition flex items-center gap-1 font-medium shrink-0">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isNe ? "नेपाल प्रिमियर लिग" : "NPL 2026"}</span>
              <span className="sm:hidden">NPL</span>
            </Link>
            <span>/</span>
            <Link href={`/npl/teams/${team.id}`} className="hover:text-foreground transition font-medium truncate shrink-0 max-w-[120px] sm:max-w-none">
              {isNe ? team.short : team.name}
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold truncate">
              {isNe ? player.nameNe : player.name}
            </span>
          </nav>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition shrink-0"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600">{isNe ? "कपी भयो" : "Copied"}</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>{isNe ? "सेयर" : "Share"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. AUTHENTIC SPORTS HERO (ESPN Cricinfo Style - Zero AI Badges) */}
      <header className="border-b border-border bg-card/40">
        <div className="container mx-auto px-4 max-w-6xl py-8 md:py-10">
          <div className="flex flex-col-reverse lg:flex-row items-center lg:items-center justify-between gap-6 sm:gap-8">
            {/* Player Details */}
            <div className="flex-1 space-y-4 text-center lg:text-left w-full">
              {/* National Identity & Franchise Eyebrow */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="text-base leading-none">{meta.flag}</span>
                <span className="text-foreground">{player.origin}</span>
                <span>·</span>
                <div className="inline-flex items-center gap-1.5">
                  <div className="relative h-4 w-4 shrink-0">
                    <Image src={team.logo} alt={team.name} fill className="object-contain" />
                  </div>
                  <span className="text-foreground">{team.name}</span>
                </div>
                {player.isCaptain && (
                  <>
                    <span>·</span>
                    <span className="font-bold text-foreground">Captain</span>
                  </>
                )}
                {player.isMarquee && (
                  <>
                    <span>·</span>
                    <span className="font-bold text-foreground">Domestic Marquee</span>
                  </>
                )}
                {player.category === "Overseas" && (
                  <>
                    <span>·</span>
                    <span className="font-bold text-foreground">Overseas Star</span>
                  </>
                )}
              </div>

              {/* Name */}
              <div>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground font-sans leading-tight">
                  {player.name}
                </h1>
                <p className="text-lg sm:text-2xl text-muted-foreground font-nepali font-bold mt-1">
                  {player.nameNe}
                </p>
              </div>

              {/* Tagline / Subtitle */}
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed mx-auto lg:mx-0">
                {player.role} for {team.name} in Nepal Premier League Season 3 (2026).
              </p>

              {/* Clean Definition Grid (8 Athletic Tiles - Zero Monospace Terminal Look) */}
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 pt-4 border-t border-border text-xs">
                <div className="rounded-lg border border-border/70 bg-card p-2.5 sm:p-3 text-left">
                  <dt className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-semibold truncate">Playing Role</dt>
                  <dd className="font-bold text-foreground mt-0.5 text-xs sm:text-sm truncate">{player.role}</dd>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-2.5 sm:p-3 text-left">
                  <dt className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-semibold truncate">Batting Style</dt>
                  <dd className="font-bold text-foreground mt-0.5 text-xs sm:text-sm truncate">{player.battingStyle || "Right-hand bat"}</dd>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-2.5 sm:p-3 text-left">
                  <dt className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-semibold truncate">Bowling Style</dt>
                  <dd className="font-bold text-foreground mt-0.5 text-xs sm:text-sm truncate">{player.bowlingStyle || "Right-arm legbreak"}</dd>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-2.5 sm:p-3 text-left">
                  <dt className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-semibold truncate">Squad Jersey</dt>
                  <dd className="font-bold text-foreground mt-0.5 text-xs sm:text-sm truncate tabular-nums">#{meta.jerseyNumber}</dd>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-2.5 sm:p-3 text-left">
                  <dt className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-semibold truncate">Auction Tier</dt>
                  <dd className="font-bold text-foreground mt-0.5 text-xs sm:text-sm truncate">{player.category}</dd>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-2.5 sm:p-3 text-left">
                  <dt className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-semibold truncate">Franchise</dt>
                  <dd className="font-bold text-foreground mt-0.5 text-xs sm:text-sm truncate">{team.name}</dd>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-2.5 sm:p-3 text-left">
                  <dt className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-semibold truncate">Club Valuation</dt>
                  <dd className="font-bold text-foreground mt-0.5 text-xs sm:text-sm truncate">{team.bidPriceNpr}</dd>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-2.5 sm:p-3 text-left">
                  <dt className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-semibold truncate">Home Venue</dt>
                  <dd className="font-bold text-foreground mt-0.5 text-xs sm:text-sm truncate">TU Ground, Kirtipur</dd>
                </div>
              </dl>
            </div>

            {/* Player Photo Card (Framed portrait with bottom-anchored cutout & crest badge) */}
            <div className="shrink-0 w-full sm:w-60 md:w-68 flex justify-center lg:justify-end">
              <div className="relative aspect-[4/5] w-52 sm:w-60 md:w-68 rounded-xl bg-gradient-to-b from-muted/30 via-muted/15 to-transparent border border-border overflow-hidden shadow-xs">
                <Image
                  src={player.image.local}
                  alt={player.name}
                  fill
                  priority
                  className="object-contain object-bottom p-2 drop-shadow-md"
                />
                {/* Team Crest at Top Right */}
                <div className="absolute top-2.5 right-2.5 relative h-7 w-7 rounded bg-background/95 p-1 border border-border/60 shadow-xs">
                  <Image src={team.logo} alt={team.name} fill className="object-contain" />
                </div>
                {/* Squad Jersey at Bottom Right */}
                <div className="absolute bottom-2 right-2 text-xs font-bold text-foreground/80 bg-background/90 px-2 py-0.5 rounded border border-border/60 tabular-nums shadow-xs">
                  #{meta.jerseyNumber}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. CLEAN EDITORIAL SUB-NAVIGATION */}
      <nav className="border-b border-border bg-background sticky top-[56px] md:top-[64px] z-20">
        <div className="container mx-auto px-4 max-w-6xl flex items-center gap-8 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {isNe ? "विवरण" : "Overview"}
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === "stats"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {isNe ? "तथ्याङ्क" : "Career Stats"}
          </button>

          <button
            onClick={() => setActiveTab("fixtures")}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === "fixtures"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {isNe ? `खेल तालिका (${teamFixtures.length})` : `Fixtures (${teamFixtures.length})`}
          </button>
        </div>
      </nav>

      {/* 4. MAIN EDITORIAL CONTENT */}
      <main className="container mx-auto px-4 max-w-6xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-10">
                {/* 1. Career Summary / Bio */}
                <section className="space-y-3">
                  <h2 className="text-lg font-bold tracking-tight text-foreground uppercase border-b border-border pb-2">
                    Profile
                  </h2>
                  <p className="text-base leading-relaxed text-foreground/90 font-serif">
                    {player.highlights}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Representing {team.name} in Nepal Premier League Season 3 (2026), under Head Coach {team.coach}.
                  </p>
                </section>

                {/* 2. Official Career Statistics Table (ESPN Cricinfo Clean Standard) */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground uppercase font-sans">
                      Career Statistics
                    </h2>
                    <span className="text-xs text-muted-foreground font-medium">Twenty20 Format</span>
                  </div>

                  {/* Quick Stats Glance Ribbon (Always Visible on Mobile Without Scrolling) */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="rounded-lg border border-border/80 bg-card p-2 sm:p-3">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">Matches</span>
                      <strong className="text-sm sm:text-xl font-extrabold text-foreground tabular-nums block mt-0.5">{player.stats.matches}</strong>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-card p-2 sm:p-3">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">Runs</span>
                      <strong className="text-sm sm:text-xl font-extrabold text-foreground tabular-nums block mt-0.5">{player.stats.runs}</strong>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-card p-2 sm:p-3">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">Strike Rate</span>
                      <strong className="text-sm sm:text-xl font-extrabold text-foreground tabular-nums block mt-0.5">{player.stats.strikeRate ?? "-"}</strong>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-card p-2 sm:p-3">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">Wickets</span>
                      <strong className="text-sm sm:text-xl font-extrabold text-foreground tabular-nums block mt-0.5">{player.stats.wickets}</strong>
                    </div>
                  </div>

                  {/* Batting Table */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-sans">
                        Batting & Fielding
                      </h3>
                      <span className="text-[10px] text-muted-foreground sm:hidden">Swipe table →</span>
                    </div>
                    <div className="border border-border rounded-lg overflow-x-auto bg-card no-scrollbar">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-border bg-muted/30 text-muted-foreground font-sans uppercase text-[11px]">
                            <th className="py-2.5 px-3 font-semibold">Format</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Mat</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Inns</th>
                            <th className="py-2.5 px-3 font-bold text-foreground text-right">Runs</th>
                            <th className="py-2.5 px-3 font-semibold text-right">HS</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Ave</th>
                            <th className="py-2.5 px-3 font-bold text-foreground text-right">SR</th>
                            <th className="py-2.5 px-3 font-semibold text-right">50s</th>
                            <th className="py-2.5 px-3 font-semibold text-right">100s</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border tabular-nums">
                          <tr>
                            <td className="py-3 px-3 font-sans font-medium text-foreground">T20 Career</td>
                            <td className="py-3 px-3 text-right">{player.stats.matches}</td>
                            <td className="py-3 px-3 text-right">{player.stats.innings}</td>
                            <td className="py-3 px-3 text-right font-bold text-foreground">{player.stats.runs}</td>
                            <td className="py-3 px-3 text-right font-medium">{player.stats.highestScore}</td>
                            <td className="py-3 px-3 text-right">{player.stats.battingAverage ?? "-"}</td>
                            <td className="py-3 px-3 text-right font-bold text-foreground">{player.stats.strikeRate ?? "-"}</td>
                            <td className="py-3 px-3 text-right">{player.stats.fifties}</td>
                            <td className="py-3 px-3 text-right">{player.stats.hundreds}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bowling Table */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-sans">
                        Bowling
                      </h3>
                      <span className="text-[10px] text-muted-foreground sm:hidden">Swipe table →</span>
                    </div>
                    <div className="border border-border rounded-lg overflow-x-auto bg-card no-scrollbar">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-border bg-muted/30 text-muted-foreground font-sans uppercase text-[11px]">
                            <th className="py-2.5 px-3 font-semibold">Format</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Mat</th>
                            <th className="py-2.5 px-3 font-bold text-foreground text-right">Wkts</th>
                            <th className="py-2.5 px-3 font-semibold text-right">BBI</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Ave</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Econ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border tabular-nums">
                          <tr>
                            <td className="py-3 px-3 font-sans font-medium text-foreground">T20 Career</td>
                            <td className="py-3 px-3 text-right">{player.stats.matches}</td>
                            <td className="py-3 px-3 text-right font-bold text-foreground">{player.stats.wickets}</td>
                            <td className="py-3 px-3 text-right font-medium">{player.stats.bestBowling}</td>
                            <td className="py-3 px-3 text-right">{player.stats.bowlingAverage ?? "-"}</td>
                            <td className="py-3 px-3 text-right">{player.stats.economy ?? "-"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                {/* 3. Verified Career Distinctions */}
                {meta.records.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="text-lg font-bold tracking-tight text-foreground uppercase border-b border-border pb-2">
                      Honors & Distinctions
                    </h2>
                    <ul className="divide-y divide-border border border-border rounded-lg bg-card text-xs">
                      {meta.records.map((rec, i) => (
                        <li key={i} className="p-4 flex items-start gap-4">
                          <span className="font-mono font-bold text-muted-foreground w-12 shrink-0">
                            {rec.rank}
                          </span>
                          <div>
                            <h3 className="font-semibold text-foreground text-sm">
                              {rec.title}
                            </h3>
                            <p className="text-muted-foreground mt-0.5">
                              {rec.subtitle}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}

            {/* TAB: STATS */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                <div className="border-b border-border pb-2">
                  <h2 className="text-lg font-bold tracking-tight text-foreground uppercase">
                    Career Data Summary
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="border border-border rounded-lg p-4 bg-card">
                    <span className="text-muted-foreground block font-mono">CAREER MATCHES</span>
                    <strong className="text-2xl font-bold text-foreground block mt-1">{player.stats.matches}</strong>
                  </div>
                  <div className="border border-border rounded-lg p-4 bg-card">
                    <span className="text-muted-foreground block font-mono">TOTAL RUNS</span>
                    <strong className="text-2xl font-bold text-foreground block mt-1">{player.stats.runs}</strong>
                  </div>
                  <div className="border border-border rounded-lg p-4 bg-card">
                    <span className="text-muted-foreground block font-mono">CAREER WICKETS</span>
                    <strong className="text-2xl font-bold text-foreground block mt-1">{player.stats.wickets}</strong>
                  </div>
                  <div className="border border-border rounded-lg p-4 bg-card">
                    <span className="text-muted-foreground block font-mono">STRIKE RATE</span>
                    <strong className="text-2xl font-bold text-foreground block mt-1">{player.stats.strikeRate ?? "-"}</strong>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Data verified against official Nepal Premier League (NPL) Season 3 records and player career dossiers.
                </p>
              </div>
            )}

            {/* TAB: FIXTURES */}
            {activeTab === "fixtures" && (
              <div className="space-y-4">
                <div className="border-b border-border pb-2 flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight text-foreground uppercase">
                    {team.name} Schedule ({teamFixtures.length} Matches)
                  </h2>
                  <span className="text-xs text-muted-foreground font-mono">TU Ground, Kirtipur</span>
                </div>

                <div className="border border-border rounded-lg divide-y divide-border bg-card">
                  {teamFixtures.map((f) => {
                    const oppId = f.teamId === team.id ? f.opponentId : f.teamId;
                    const oppTeam = nplTeam(oppId);
                    const oppLogo = `/studio/cricket/${oppId}.png`;

                    return (
                      <div
                        key={f.matchNumber}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-muted/30 transition"
                      >
                        {/* Match Number & Date */}
                        <div className="flex items-center gap-4">
                          <div className="w-14 shrink-0 text-center border-r border-border pr-3">
                            <span className="font-bold text-foreground block text-sm">
                              #{f.matchNumber}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground block mt-0.5 whitespace-nowrap">
                              {formatNplDate(f.matchDate)}
                            </span>
                          </div>

                          {/* Match Teams with Logos */}
                          <div className="flex items-center gap-3">
                            {/* Team 1 (Current Player Team) */}
                            <div className="flex items-center gap-2">
                              <div className="relative h-8 w-8 shrink-0 rounded bg-muted/20 p-1 border border-border/60">
                                <Image
                                  src={team.logo}
                                  alt={team.name}
                                  fill
                                  className="object-contain p-0.5"
                                />
                              </div>
                              <span className="font-semibold text-sm text-foreground">
                                {team.short}
                              </span>
                            </div>

                            <span className="text-xs font-mono text-muted-foreground px-1">
                              vs
                            </span>

                            {/* Team 2 (Opponent) */}
                            <div className="flex items-center gap-2">
                              <div className="relative h-8 w-8 shrink-0 rounded bg-muted/20 p-1 border border-border/60">
                                <Image
                                  src={oppLogo}
                                  alt={oppTeam?.name || oppId}
                                  fill
                                  className="object-contain p-0.5"
                                />
                              </div>
                              <span className="font-semibold text-sm text-foreground">
                                {oppTeam?.short || oppTeam?.name}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Match Timing & Venue */}
                        <div className="font-mono text-muted-foreground text-left sm:text-right shrink-0">
                          <span className="font-semibold text-foreground">{f.startTime} NPT</span>
                          <span className="block text-[10px] text-muted-foreground">TU Ground, Kirtipur</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR RAIL: FRANCHISE & SQUAD (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Franchise Info Card */}
            <div className="border border-border rounded-lg p-5 bg-card space-y-4">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="relative h-10 w-10 shrink-0">
                  <Image src={team.logo} alt={team.name} fill className="object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground leading-tight">
                    {isNe ? team.nameNe : team.name}
                  </h3>
                  <span className="text-xs text-muted-foreground">Nepal Premier League 2026</span>
                </div>
              </div>

              <dl className="text-xs space-y-2 text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-border/60">
                  <dt>Owner</dt>
                  <dd className="font-medium text-foreground text-right truncate max-w-[170px]">{team.owner}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <dt>Head Coach</dt>
                  <dd className="font-medium text-foreground">{team.coach}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <dt>Captain</dt>
                  <dd className="font-medium text-foreground">{team.captain}</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt>Franchise Valuation</dt>
                  <dd className="font-medium text-foreground">{team.bidPriceNpr}</dd>
                </div>
              </dl>

              <Link
                href={`/npl/teams/${team.id}`}
                className="inline-flex items-center justify-between w-full pt-2 text-xs font-semibold text-foreground hover:text-primary transition"
              >
                <span>View Full Team Roster</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Squad Teammates */}
            <div className="border border-border rounded-lg p-5 bg-card space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2.5 text-xs">
                <span className="font-semibold text-foreground">
                  {team.short} Squad Teammates
                </span>
                <span className="text-muted-foreground">{relatedPlayers.length} Players</span>
              </div>

              <ul className="divide-y divide-border/60 text-xs">
                {relatedPlayers.slice(0, 6).map((rp) => (
                  <li key={rp.id}>
                    <Link
                      href={`/npl/players/${rp.id}`}
                      className="py-2.5 flex items-center justify-between hover:text-primary transition group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden bg-muted/50 border border-border shrink-0">
                          <Image src={rp.image.thumbnail} alt={rp.name} fill className="object-contain" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground block group-hover:text-primary transition leading-tight">
                            {isNe ? rp.nameNe : rp.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{rp.role}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import type { NplPlayer, NplTeamExtended } from "@/lib/npl-data";
import type { PlayerComputedMeta } from "@/lib/npl-player-meta";
import type { CricketFixture } from "@/lib/post-studio/cricket-fixtures";
import {
  Trophy,
  Shield,
  Calendar,
  Award,
  Sparkles,
  MapPin,
  Clock,
  ArrowLeft,
  Share2,
  ChevronRight,
  CheckCircle2,
  Tv,
  Activity,
  ArrowUpRight,
  Flame,
  Zap,
  Target
} from "lucide-react";
import { nplTeam } from "@/lib/post-studio/cricket-catalog";

interface NplPlayerProfileClientProps {
  player: NplPlayer;
  team: NplTeamExtended;
  meta: PlayerComputedMeta;
  teamFixtures: CricketFixture[];
  relatedPlayers: NplPlayer[];
}

type TabType = "overview" | "stats" | "records" | "matches";

export function NplPlayerProfileClient({
  player,
  team,
  meta,
  teamFixtures,
  relatedPlayers
}: NplPlayerProfileClientProps) {
  const { language } = useLanguage();
  const isNe = language === "ne";
  const [activeTab, setActiveTab] = React.useState<TabType>("overview");
  const [copied, setCopied] = React.useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 selection:bg-amber-500/20 pb-24">
      {/* 1. TOP BREADCRUMB & UTILITY BAR */}
      <div className="border-b border-slate-800/80 bg-[#080d19]/90 backdrop-blur-md sticky top-[56px] md:top-[64px] z-30">
        <div className="container mx-auto px-4 max-w-7xl h-12 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400 truncate">
            <Link href="/npl" className="hover:text-amber-400 transition flex items-center gap-1 shrink-0 font-medium">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{isNe ? "एनपीएल हब" : "NPL Hub"}</span>
            </Link>
            <span>/</span>
            <Link href={`/npl/teams/${team.id}`} className="hover:text-amber-400 transition shrink-0 font-medium">
              {isNe ? team.nameNe : team.name}
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-semibold truncate">
              {isNe ? player.nameNe : player.name}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition text-xs font-medium"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{isNe ? "लिङ्क कपी भयो" : "Copied"}</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>{isNe ? "सेयर गर्नुहोस्" : "Share"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. GRAND HERO / BROADCAST SPOTLIGHT (Premier League / F1 Style) */}
      <section
        className="relative overflow-hidden border-b border-slate-800/80 pt-10 pb-0"
        style={{
          background: `linear-gradient(145deg, ${team.dark} 0%, #060a12 70%)`
        }}
      >
        {/* Subtle Atmospheric Stadium Grid & Team Radial Glow */}
        <div
          className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ backgroundColor: team.primary }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            {/* Left Headline & Vitals (7 cols) */}
            <div className="lg:col-span-7 space-y-6 pb-12 text-center lg:text-left">
              {/* Franchise & Captaincy Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <Link
                  href={`/npl/teams/${team.id}`}
                  className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:brightness-110 transition"
                  style={{ backgroundColor: team.primary }}
                >
                  <span className="relative h-4 w-4">
                    <Image src={team.logo} alt={team.name} fill className="object-contain" />
                  </span>
                  <span>{isNe ? team.nameNe : team.name}</span>
                </Link>

                {player.isCaptain && (
                  <span className="rounded-full bg-amber-400 text-black font-extrabold text-[11px] px-3 py-1 uppercase tracking-wider shadow">
                    Captain
                  </span>
                )}

                {player.isMarquee && (
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold px-3 py-1 uppercase tracking-wider">
                    Marquee Icon
                  </span>
                )}

                <span className="rounded-full bg-slate-800/90 border border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-300">
                  {meta.flag} {player.origin}
                </span>
              </div>

              {/* Monumental Player Name */}
              <div className="space-y-1">
                <div className="text-xs uppercase font-mono tracking-[0.25em] text-slate-400">
                  {meta.roleLabel}
                </div>
                <h1 className="font-bebas text-5xl sm:text-7xl md:text-8xl tracking-tight leading-[0.9] text-white uppercase drop-shadow-lg">
                  {player.name}
                </h1>
                <p className="font-hind text-2xl sm:text-3xl text-amber-400/90 font-medium">
                  {player.nameNe}
                </p>
              </div>

              {/* Tactical Specifications Pill Strip */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-slate-300">
                <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 backdrop-blur-sm">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Batting Style</span>
                  <strong className="text-white font-semibold">{player.battingStyle || "Right-hand bat"}</strong>
                </div>

                <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 backdrop-blur-sm">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Bowling Style</span>
                  <strong className="text-white font-semibold">{player.bowlingStyle || "Right-arm offbreak"}</strong>
                </div>

                <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 backdrop-blur-sm">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Roster Category</span>
                  <strong className="text-amber-400 font-semibold">{player.category}</strong>
                </div>

                <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 backdrop-blur-sm">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Squad Number</span>
                  <strong className="text-white font-mono font-bold text-sm">#{meta.jerseyNumber}</strong>
                </div>
              </div>

              {/* PREMIER LEAGUE STYLE: VITAL STATISTICS STRIP */}
              <div className="rounded-2xl border border-slate-700/70 bg-slate-900/90 backdrop-blur-md p-4 shadow-xl">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-3">
                  Career Vital Statistics · T20 Cricket
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
                  <div className="pt-2 sm:pt-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Matches</span>
                    <strong className="font-bebas text-3xl text-white block leading-none mt-1">{player.stats.matches}</strong>
                    <span className="text-[10px] text-slate-400">{player.stats.innings} Innings</span>
                  </div>

                  <div className="pt-2 sm:pt-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Runs</span>
                    <strong className="font-bebas text-3xl text-amber-400 block leading-none mt-1">{player.stats.runs}</strong>
                    <span className="text-[10px] text-slate-400">HS: {player.stats.highestScore}</span>
                  </div>

                  <div className="pt-2 sm:pt-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Strike Rate</span>
                    <strong className="font-bebas text-3xl text-white block leading-none mt-1">
                      {player.stats.strikeRate ?? "-"}
                    </strong>
                    <span className="text-[10px] text-slate-400">Avg: {player.stats.battingAverage ?? "-"}</span>
                  </div>

                  <div className="pt-2 sm:pt-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Wickets</span>
                    <strong className="font-bebas text-3xl text-sky-400 block leading-none mt-1">{player.stats.wickets}</strong>
                    <span className="text-[10px] text-slate-400">BBI: {player.stats.bestBowling}</span>
                  </div>

                  <div className="pt-2 sm:pt-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Economy</span>
                    <strong className="font-bebas text-3xl text-white block leading-none mt-1">
                      {player.stats.economy ?? "-"}
                    </strong>
                    <span className="text-[10px] text-slate-400">Avg: {player.stats.bowlingAverage ?? "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Towering Player Silhouette Cutout (5 cols) */}
            <div className="lg:col-span-5 flex items-end justify-center relative">
              {/* Giant Watermark Jersey Number behind cutout */}
              <div className="absolute bottom-0 right-1/2 translate-x-1/2 select-none pointer-events-none opacity-10 font-bebas text-[220px] sm:text-[320px] lg:text-[380px] text-white leading-none -z-0">
                {meta.jerseyNumber}
              </div>

              {/* Towering Player Cutout - 520px height, anchored to bottom */}
              <div className="relative h-[380px] sm:h-[480px] lg:h-[540px] w-full max-w-[440px] z-10 flex items-end justify-center">
                <Image
                  src={player.image.local}
                  alt={player.name}
                  fill
                  priority
                  className="object-contain object-bottom drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] filter hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SPORTS INTELLIGENCE STICKY SUB-NAV */}
      <div className="sticky top-[104px] md:top-[112px] z-20 bg-[#080d19]/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="container mx-auto px-4 max-w-7xl flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5">
          {[
            { id: "overview", labelEn: "Overview & Intelligence", labelNe: "सिंहावलोकन", icon: Activity },
            { id: "stats", labelEn: "Career Command Center", labelNe: "तथ्याङ्क विवरण", icon: Trophy },
            { id: "records", labelEn: "Verified Honors & Milestones", labelNe: "कीर्तिमानहरू", icon: Award },
            { id: "matches", labelEn: `NPL Fixtures (${teamFixtures.length})`, labelNe: "खेल तालिका", icon: Calendar }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-amber-400 text-black shadow-md font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {isNe ? tab.labelNe : tab.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN DOSSIER & ANALYTICS BODY */}
      <div className="container mx-auto px-4 max-w-7xl py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT RAIL: FRANCHISE & TACTICAL DOSSIER (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Franchise Card */}
            <div className="rounded-2xl border border-slate-800 bg-[#0a1122]/80 backdrop-blur-md p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0">
                    <Image src={team.logo} alt={team.name} fill className="object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bebas text-2xl text-white leading-none">
                      {isNe ? team.nameNe : team.name}
                    </h3>
                    <span className="text-[11px] text-slate-400">Nepal Premier League 2026</span>
                  </div>
                </div>
              </div>

              <div className="text-xs space-y-2 text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Franchise Valuation:</span>
                  <strong className="text-amber-400 font-semibold">{team.bidPriceNpr}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Head Coach:</span>
                  <strong className="text-white">{team.coach}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Captain:</span>
                  <strong className="text-white">{team.captain}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Official Home Venue:</span>
                  <span className="text-slate-200">TU Ground, Kirtipur</span>
                </div>
              </div>

              <Link
                href={`/npl/teams/${team.id}`}
                className="inline-flex items-center justify-between w-full rounded-xl bg-slate-800 hover:bg-slate-700 p-2.5 text-xs font-semibold text-amber-400 transition"
              >
                <span>{isNe ? "टोलीको सम्पूर्ण रोस्टर हेर्नुहोस्" : "Explore Franchise Hub"}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Tactical Cricket Radar / Attribute Breakdown */}
            <div className="rounded-2xl border border-slate-800 bg-[#0a1122]/80 backdrop-blur-md p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-amber-400" />
                  Tactical Profile Index
                </span>
                <span className="text-xs font-bold text-amber-400 font-mono">
                  {meta.overallRating} OVR
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Boundary Impact Rate</span>
                    <strong className="font-mono text-white">{meta.tacticalMetrics.boundaryPercent}%</strong>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${meta.tacticalMetrics.boundaryPercent}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Strike Rotation & Running</span>
                    <strong className="font-mono text-white">{meta.tacticalMetrics.strikeRotation}%</strong>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-sky-400" style={{ width: `${meta.tacticalMetrics.strikeRotation}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Death Overs Impact (16–20)</span>
                    <strong className="font-mono text-white">{meta.tacticalMetrics.deathOversImpact}%</strong>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${meta.tacticalMetrics.deathOversImpact}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Powerplay Efficiency (1–6)</span>
                    <strong className="font-mono text-white">{meta.tacticalMetrics.powerplayImpact}%</strong>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-purple-400" style={{ width: `${meta.tacticalMetrics.powerplayImpact}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Franchise Teammates Rail */}
            <div className="rounded-2xl border border-slate-800 bg-[#0a1122]/80 backdrop-blur-md p-5 space-y-3 shadow-xl">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                {isNe ? "टोलीका अन्य स्टार खेलाडीहरू" : `${team.short} Squad Teammates`}
              </span>

              <div className="space-y-2">
                {relatedPlayers.slice(0, 5).map((rp) => (
                  <Link
                    key={rp.id}
                    href={`/npl/players/${rp.id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-amber-400/60 hover:bg-slate-800/80 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-slate-800/80 shrink-0">
                        <Image src={rp.image.thumbnail} alt={rp.name} fill className="object-contain" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-200 block group-hover:text-amber-400 transition leading-tight">
                          {isNe ? rp.nameNe : rp.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{rp.role} · {rp.origin}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Broadcast & Matchday Transmission */}
            <div className="rounded-2xl border border-slate-800 bg-[#0a1122]/80 backdrop-blur-md p-4 text-xs text-slate-400 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                <Tv className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-slate-200 block">Live Broadcast Transmission</strong>
                <span>Star Sports HD, Action Sports & NetTV OTT</span>
              </div>
            </div>
          </div>

          {/* RIGHT RAIL: DEEP CRICKET INTELLIGENCE (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* TAB 1: OVERVIEW & INTELLIGENCE */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* 1. In-depth Editorial Narrative */}
                <section className="rounded-2xl border border-slate-800 bg-[#0a1122]/80 backdrop-blur-md p-6 md:p-8 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    <h3 className="font-bebas text-3xl tracking-wide uppercase text-white">
                      {isNe ? "खेलाडी प्रोफाइल तथा रणनीतिक भूमिका" : "Editorial Dossier & Tactical Profile"}
                    </h3>
                  </div>

                  <p className="text-sm md:text-base leading-relaxed text-slate-200 font-manrope">
                    {player.highlights}
                  </p>

                  <div className="pt-2 text-xs md:text-sm text-slate-400 leading-relaxed border-t border-slate-800">
                    {isNe
                      ? `${player.name} नेपाल प्रिमियर लिग सिजन ३ मा ${team.nameNe} का प्रमुख खेलाडीका रूपमा प्रस्तुत भएका छन्। अन्तर्राष्ट्रिय क्रिकेटको उच्च अनुभव र म्याच-विनिङ क्षमताले उनलाई प्रतियोगिताकै सबैभन्दा प्रभावकारी खेलाडीहरूमध्ये एक बनाएको छ।`
                      : `${player.name} represents a cornerstone signing for ${team.name} in Nepal Premier League Season 3. Armed with verified global pedigree and high-pressure match-winning temperament, he anchors the franchise's campaign for the NPR 3.00 Crore championship title.`}
                  </div>
                </section>

                {/* 2. Visual Comparative Performance Chart */}
                <section className="rounded-2xl border border-slate-800 bg-[#0a1122]/80 backdrop-blur-md p-6 md:p-8 space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                        Telemetry Benchmarks
                      </span>
                      <h3 className="font-bebas text-3xl tracking-wide uppercase text-white">
                        T20 Performance vs League Benchmark
                      </h3>
                    </div>
                    <span className="text-xs text-amber-400 font-mono font-semibold">
                      Sample Size: {player.stats.matches} T20 Matches
                    </span>
                  </div>

                  {/* Visual Bar Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                    {/* Runs Benchmark */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                        Batting Production
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bebas text-4xl text-amber-400">{player.stats.runs}</span>
                        <span className="text-xs text-slate-400 font-mono">Career Runs</span>
                      </div>
                      <div className="space-y-1.5 pt-1 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Strike Rate:</span>
                          <strong className="text-white font-mono">{player.stats.strikeRate ?? "-"}</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Highest Score:</span>
                          <strong className="text-white font-mono">{player.stats.highestScore}</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>50s / 100s:</span>
                          <strong className="text-white font-mono">{player.stats.fifties} / {player.stats.hundreds}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Bowling Benchmark */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                        Bowling Weaponry
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bebas text-4xl text-sky-400">{player.stats.wickets}</span>
                        <span className="text-xs text-slate-400 font-mono">Wickets Taken</span>
                      </div>
                      <div className="space-y-1.5 pt-1 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Economy Rate:</span>
                          <strong className="text-white font-mono">{player.stats.economy ?? "-"}</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Best Bowling:</span>
                          <strong className="text-white font-mono">{player.stats.bestBowling}</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Bowling Avg:</span>
                          <strong className="text-white font-mono">{player.stats.bowlingAverage ?? "-"}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Tournament Impact */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                        NPL 2026 Standing
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bebas text-4xl text-emerald-400">{meta.overallRating}</span>
                        <span className="text-xs text-slate-400 font-mono">Impact Score</span>
                      </div>
                      <div className="space-y-1.5 pt-1 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Classification:</span>
                          <strong className="text-white">{meta.rankingTier}</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Franchise:</span>
                          <strong className="text-amber-400">{team.short}</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>DRS Eligibility:</span>
                          <strong className="text-emerald-400">Hawk-Eye UltraEdge</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 3. Verified Honors & Key Records */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-400" />
                    <h3 className="font-bebas text-3xl tracking-wide uppercase text-white">
                      {isNe ? "प्रमाणित कीर्तिमान तथा करियर उपलब्धीहरू" : "Verified Records & Achievements"}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {meta.records.map((rec, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-slate-800 bg-[#0a1122]/80 backdrop-blur-md p-5 flex items-start gap-4 shadow-lg hover:border-slate-700 transition"
                      >
                        <div className="h-12 w-12 shrink-0 rounded-xl bg-amber-400/10 text-amber-400 font-bebas text-2xl flex items-center justify-center border border-amber-400/30">
                          {rec.rank}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white leading-snug">
                            {rec.title}
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {rec.subtitle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 4. Matchday Schedule at TU Ground */}
                <section className="space-y-4">
                  <div className="flex items-end justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                        NPL 2026 Match Calendar
                      </span>
                      <h3 className="font-bebas text-3xl tracking-wide uppercase text-white">
                        {team.name} Upcoming Battles ({teamFixtures.length} Matches)
                      </h3>
                    </div>
                    <Link
                      href="/npl"
                      className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-0.5"
                    >
                      {isNe ? "सम्पूर्ण तालिका" : "Full Fixture Matrix"}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {teamFixtures.slice(0, 4).map((f) => {
                      const oppId = f.teamId === team.id ? f.opponentId : f.teamId;
                      const oppTeam = nplTeam(oppId);
                      return (
                        <div
                          key={f.matchNumber}
                          className="rounded-xl border border-slate-800 bg-[#0a1122]/80 p-4 flex items-center justify-between text-xs hover:border-slate-700 transition"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase font-mono">
                              Match {f.matchNumber} · {f.matchDate}
                            </span>
                            <h4 className="font-semibold text-white text-sm">
                              vs {isNe ? oppTeam.nameNe : oppTeam.name}
                            </h4>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-amber-400" /> {f.startTime} NPT · TU Ground
                            </span>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                            Scheduled
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {/* TAB 2: COMPLETE CAREER COMMAND CENTER */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-[#0a1122]/90 p-6 md:p-8 space-y-6 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h3 className="font-bebas text-3xl uppercase tracking-wide text-white">
                      Comprehensive Career Command Center
                    </h3>
                    <span className="text-xs font-mono text-slate-400">All Professional T20 Cricket</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono tracking-wider">
                          <th className="py-3 px-3">Discipline</th>
                          <th className="py-3 px-3">Primary Total</th>
                          <th className="py-3 px-3">Rates & Averages</th>
                          <th className="py-3 px-3">Personal Best</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 font-mono text-slate-200">
                        <tr>
                          <td className="py-3.5 px-3 font-sans font-medium text-white">Match Participation</td>
                          <td className="py-3.5 px-3 text-amber-400 font-bold text-sm">{player.stats.matches} Matches</td>
                          <td className="py-3.5 px-3">{player.stats.innings} Innings Batted</td>
                          <td className="py-3.5 px-3 text-slate-400">-</td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-3 font-sans font-medium text-white">Batting Runs</td>
                          <td className="py-3.5 px-3 text-amber-400 font-bold text-sm">{player.stats.runs} Runs</td>
                          <td className="py-3.5 px-3">SR: {player.stats.strikeRate ?? "-"} · Avg: {player.stats.battingAverage ?? "-"}</td>
                          <td className="py-3.5 px-3 text-white font-bold">HS: {player.stats.highestScore}</td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-3 font-sans font-medium text-white">Milestone Scores</td>
                          <td className="py-3.5 px-3">{player.stats.fifties} Fifties</td>
                          <td className="py-3.5 px-3">{player.stats.hundreds} Centuries</td>
                          <td className="py-3.5 px-3 text-slate-400">-</td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-3 font-sans font-medium text-white">Bowling Wickets</td>
                          <td className="py-3.5 px-3 text-sky-400 font-bold text-sm">{player.stats.wickets} Wickets</td>
                          <td className="py-3.5 px-3">Econ: {player.stats.economy ?? "-"} · Avg: {player.stats.bowlingAverage ?? "-"}</td>
                          <td className="py-3.5 px-3 text-white font-bold">{player.stats.bestBowling}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: RECORDS & MILESTONES */}
            {activeTab === "records" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-[#0a1122]/90 p-6 md:p-8 space-y-6 shadow-xl">
                  <h3 className="font-bebas text-3xl uppercase tracking-wide text-white">
                    Official Honors & Historical Milestones
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {meta.records.map((r, idx) => (
                      <div key={idx} className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                        <span className="font-bebas text-3xl text-amber-400 block leading-none">{r.rank}</span>
                        <h4 className="font-bold text-sm text-white">{r.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{r.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FIXTURES */}
            {activeTab === "matches" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-[#0a1122]/90 p-6 md:p-8 space-y-6 shadow-xl">
                  <h3 className="font-bebas text-3xl uppercase tracking-wide text-white">
                    {team.name} Schedule in NPL Season 3 ({teamFixtures.length} Matches)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {teamFixtures.map((f) => {
                      const t1 = nplTeam(f.teamId);
                      const t2 = nplTeam(f.opponentId);
                      return (
                        <div
                          key={f.matchNumber}
                          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5"
                        >
                          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                            <span className="font-bold text-amber-400">Match {f.matchNumber}</span>
                            <span>{f.matchDate} · {f.startTime} NPT</span>
                          </div>
                          <h4 className="font-bold text-sm text-white">
                            {isNe ? t1.nameNe : t1.name} vs {isNe ? t2.nameNe : t2.name}
                          </h4>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1.5 border-t border-slate-800">
                            <MapPin className="h-3.5 w-3.5 text-red-400" />
                            <span>TU International Cricket Ground, Kirtipur</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

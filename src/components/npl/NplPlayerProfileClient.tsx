"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/providers/language-provider";
import type { NplPlayer, NplTeamExtended } from "@/lib/npl-data";
import type { PlayerComputedMeta } from "@/lib/npl-player-meta";
import type { CricketFixture } from "@/lib/post-studio/cricket-fixtures";
import {
  Trophy,
  Shield,
  Calendar,
  Star,
  Award,
  Sparkles,
  MapPin,
  Clock,
  ArrowLeft,
  Share2,
  ExternalLink,
  Flame,
  ChevronRight,
  CheckCircle2,
  Tv,
  Coins,
  Activity,
  ArrowUpRight,
  Users
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
    <div className="min-h-screen bg-background text-foreground pb-20 selection:bg-primary/20">
      {/* 1. TOP BREADCRUMB & UTILITY BAR */}
      <div className="border-b border-border/60 bg-card/60 backdrop-blur-md sticky top-[56px] md:top-[64px] z-30">
        <div className="container mx-auto px-4 max-w-7xl h-12 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground truncate">
            <Link href="/npl" className="hover:text-primary transition flex items-center gap-1 shrink-0">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{isNe ? "एनपीएल हब" : "NPL Hub"}</span>
            </Link>
            <span>/</span>
            <Link href={`/npl/teams/${team.id}`} className="hover:text-primary transition shrink-0">
              {isNe ? team.nameNe : team.name}
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold truncate">
              {isNe ? player.nameNe : player.name}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-accent transition text-xs font-medium"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
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

      {/* 2. GRAND HERO / BIO SPOTLIGHT (ESPN Cricinfo + FUT Luxury Banner) */}
      <section
        className="relative overflow-hidden border-b border-border/80 pt-8 pb-12 md:pt-12 md:pb-16"
        style={{
          background: `linear-gradient(135deg, ${team.dark} 0%, rgba(10, 15, 26, 0.98) 100%)`
        }}
      >
        {/* Giant Watermarked Jersey Number in background */}
        <div className="absolute right-6 md:right-1/4 top-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.07] font-bebas text-[180px] sm:text-[260px] md:text-[360px] lg:text-[440px] text-white leading-none">
          {meta.jerseyNumber}
        </div>

        {/* Ambient Team Glow */}
        <div
          className="absolute -top-24 left-1/3 h-96 w-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: team.primary }}
        />

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Bio Info (4 cols) */}
            <div className="lg:col-span-4 space-y-4 text-center lg:text-left order-2 lg:order-1">
              {/* Badges */}
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-black"
                  style={{ backgroundColor: team.primary }}
                >
                  {team.short} · {isNe ? team.nameNe : team.name}
                </span>
                {player.isCaptain && (
                  <span className="rounded-full bg-amber-500 text-black font-extrabold text-[11px] px-2.5 py-0.5 uppercase tracking-wider shadow">
                    Captain
                  </span>
                )}
                {player.isMarquee && (
                  <span className="rounded-full bg-primary/20 border border-primary/40 text-primary-foreground text-[11px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
                    Marquee Icon
                  </span>
                )}
              </div>

              {/* Player Name */}
              <div>
                <h1 className="font-bebas text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-none text-white uppercase drop-shadow-md">
                  {player.name}
                </h1>
                <p className="font-hind text-xl sm:text-2xl text-white/80 mt-1">
                  {player.nameNe}
                </p>
              </div>

              {/* Role pill & Country */}
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-white border border-white/15 backdrop-blur-sm">
                <span>{meta.flag}</span>
                <span>{player.origin}</span>
                <span className="text-white/40">·</span>
                <span style={{ color: team.primary }}>{player.role}</span>
              </div>

              {/* Stances */}
              <div className="grid grid-cols-2 gap-2 text-left pt-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <span className="text-[10px] text-white/60 uppercase tracking-wider block">Batting Stance</span>
                  <strong className="text-white text-xs font-semibold block mt-0.5 truncate">
                    {player.battingStyle || "Right-hand bat"}
                  </strong>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <span className="text-[10px] text-white/60 uppercase tracking-wider block">Bowling Stance</span>
                  <strong className="text-white text-xs font-semibold block mt-0.5 truncate">
                    {player.bowlingStyle || "Right-arm medium"}
                  </strong>
                </div>
              </div>

              <div className="text-[11px] text-white/60 font-mono tracking-wider pt-1">
                CAREER ACTIVE: {meta.careerSpan}
              </div>
            </div>

            {/* Center Player Cutout (4 cols) */}
            <div className="lg:col-span-4 flex items-center justify-center relative order-1 lg:order-2">
              <div className="relative h-[320px] sm:h-[420px] md:h-[460px] w-full max-w-[340px]">
                <Image
                  src={player.image.local}
                  alt={player.name}
                  fill
                  priority
                  className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] filter hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Right Skills & Team Table (4 cols) */}
            <div className="lg:col-span-4 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md order-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  {isNe ? "खेलाडी क्षमता मूल्याङ्कन" : "Skills Rating Index"}
                </span>
                <span
                  className="font-bebas text-2xl leading-none"
                  style={{ color: team.primary }}
                >
                  {meta.overallRating} OVR
                </span>
              </div>

              {/* Skill Bars */}
              <div className="space-y-3">
                {[
                  { label: "Technical Variation", labelNe: "प्राविधिक विविधता", val: meta.skills.variation },
                  { label: "Control & Discipline", labelNe: "नियन्त्रण र शुद्धता", val: meta.skills.control },
                  { label: "Power & Strike Rate", labelNe: "प्रहार क्षमता", val: meta.skills.power },
                  { label: "Tactical & Mental", labelNe: "मानसिक दृढता", val: meta.skills.physicalMental }
                ].map((skill, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/80">{isNe ? skill.labelNe : skill.label}</span>
                      <strong className="text-white font-mono">{skill.val}</strong>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${skill.val}%`,
                          backgroundColor: team.primary
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Teams & Franchise */}
              <div className="pt-3 border-t border-white/10 space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-white/50 block">
                  {isNe ? "सम्बद्ध टोलीहरू" : "Represented Teams & Circuit"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {meta.teams.map((t, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/90 border border-white/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tournament Classification */}
              <div className="pt-2 text-xs flex justify-between items-center text-white/70 border-t border-white/10">
                <span>Roster Tier:</span>
                <strong className="text-white">{player.category}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TAB CONTROLS */}
      <div className="sticky top-[104px] md:top-[112px] z-20 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5">
          {[
            { id: "overview", labelEn: "Overview & Highlights", labelNe: "सिंहावलोकन", icon: Trophy },
            { id: "stats", labelEn: "Career Statistics", labelNe: "तथ्याङ्क विवरण", icon: Activity },
            { id: "records", labelEn: "Records & Milestones", labelNe: "कीर्तिमानहरू", icon: Award },
            { id: "matches", labelEn: `Fixtures (${teamFixtures.length})`, labelNe: "खेल तालिका", icon: Calendar }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {isNe ? tab.labelNe : tab.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN DOSSIER & TRADING CARD BODY */}
      <div className="container mx-auto px-4 max-w-7xl py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: FUT CRICKET TRADING CARD & MEDIA (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* FIFA ULTIMATE TEAM / CRICKET TRADING CARD */}
            <div className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-b from-card via-card/90 to-background p-6 shadow-2xl overflow-hidden group">
              {/* Glossy Top Foil Shine */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />

              {/* Card Top Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bebas text-5xl leading-none text-foreground">
                    {meta.overallRating}
                  </div>
                  <div className="font-bebas text-xl text-primary leading-none mt-0.5">
                    {meta.roleCode}
                  </div>
                  <div className="text-xl mt-1.5">{meta.flag}</div>
                </div>

                <div className="relative h-14 w-14">
                  <Image src={team.logo} alt={team.name} fill className="object-contain" />
                </div>
              </div>

              {/* Cutout Image in Card */}
              <div className="relative h-56 w-full flex items-center justify-center my-2">
                <Image
                  src={player.image.local}
                  alt={player.name}
                  fill
                  className="object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Card Name */}
              <div className="text-center border-t border-border/80 pt-3">
                <h3 className="font-bebas text-2xl tracking-wider uppercase text-foreground leading-tight truncate">
                  {player.name}
                </h3>
                <span className="text-[11px] font-semibold text-primary uppercase tracking-widest block">
                  {team.name}
                </span>
              </div>

              {/* Stat Grid Matrix (Fut Style) */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs border-t border-border/60 pt-3 font-mono">
                <div className="bg-muted/40 p-1.5 rounded-lg">
                  <span className="text-[10px] text-muted-foreground block uppercase">MAT</span>
                  <strong className="text-foreground font-bold">{player.stats.matches}</strong>
                </div>
                <div className="bg-muted/40 p-1.5 rounded-lg">
                  <span className="text-[10px] text-muted-foreground block uppercase">RUNS</span>
                  <strong className="text-foreground font-bold">{player.stats.runs}</strong>
                </div>
                <div className="bg-muted/40 p-1.5 rounded-lg">
                  <span className="text-[10px] text-muted-foreground block uppercase">WKTS</span>
                  <strong className="text-foreground font-bold">{player.stats.wickets}</strong>
                </div>
                <div className="bg-muted/40 p-1.5 rounded-lg">
                  <span className="text-[10px] text-muted-foreground block uppercase">SR</span>
                  <strong className="text-foreground font-bold">{player.stats.strikeRate ?? "-"}</strong>
                </div>
                <div className="bg-muted/40 p-1.5 rounded-lg">
                  <span className="text-[10px] text-muted-foreground block uppercase">AVG</span>
                  <strong className="text-foreground font-bold">
                    {player.stats.battingAverage ?? player.stats.bowlingAverage ?? "-"}
                  </strong>
                </div>
                <div className="bg-muted/40 p-1.5 rounded-lg">
                  <span className="text-[10px] text-muted-foreground block uppercase">ECON</span>
                  <strong className="text-foreground font-bold">{player.stats.economy ?? "-"}</strong>
                </div>
              </div>
            </div>

            {/* Franchise Matchday Context Card */}
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <h4 className="font-bebas text-lg uppercase tracking-wide">
                  {isNe ? "फ्रेन्चाइज टोली विवरण" : "Franchise Context"}
                </h4>
              </div>
              <div className="text-xs text-muted-foreground space-y-1.5">
                <div className="flex justify-between">
                  <span>Owner:</span>
                  <strong className="text-foreground truncate max-w-[180px] text-right">{team.owner}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Head Coach:</span>
                  <strong className="text-foreground">{team.coach}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Franchise Bid:</span>
                  <span className="text-primary font-semibold">{team.bidPriceNpr}</span>
                </div>
              </div>

              <Link
                href={`/npl/teams/${team.id}`}
                className="mt-2 inline-flex items-center justify-between w-full rounded-xl bg-muted/60 hover:bg-muted p-2.5 text-xs font-semibold text-primary transition"
              >
                <span>{isNe ? "टिमको सम्पूर्ण रोस्टर हेर्नुहोस्" : "View Full Team Roster"}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Related Marquee Stars */}
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                {isNe ? "सम्बन्धित स्टार खेलाडीहरू" : "Teammates & Stars"}
              </span>

              <div className="space-y-2">
                {relatedPlayers.slice(0, 4).map((rp) => (
                  <Link
                    key={rp.id}
                    href={`/npl/players/${rp.id}`}
                    className="flex items-center justify-between p-2 rounded-xl border border-border/60 bg-background hover:border-primary/60 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted/40">
                        <Image src={rp.image.thumbnail} alt={rp.name} fill className="object-contain" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold block group-hover:text-primary transition leading-tight">
                          {isNe ? rp.nameNe : rp.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{rp.role}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: TABBED DETAILED DOSSIER (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* 1. Narrative Bio */}
                <section className="rounded-2xl border border-border/80 bg-card/70 p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <h3 className="font-bebas text-2xl tracking-wide uppercase">
                      {isNe ? "खेलाडी प्रोफाइल तथा विशेष समीक्षा" : "Player Profile & Editorial Dossier"}
                    </h3>
                  </div>
                  <p className="text-sm md:text-base leading-relaxed text-foreground/90 font-manrope">
                    {player.highlights}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed pt-1">
                    {isNe
                      ? `${player.name} नेपाल प्रिमियर लिग २०२६ मा ${team.nameNe} का प्रमुख खेलाडी हुन्। उनको उपस्थिति टोलीको रणनीति र प्रदर्शनमा निर्णायक सावित हुने अपेक्षा गरिएको छ।`
                      : `${player.name} enters Nepal Premier League Season 3 representing ${team.name}. With verified international credentials and match-winning prowess, he stands as a vital pillar in the franchise's campaign for the NPR 3.00 Crore title.`}
                  </p>
                </section>

                {/* 2. Visual Stat Bars & Analytics */}
                <section className="rounded-2xl border border-border/80 bg-card/70 p-6 space-y-6">
                  <div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                      Performance Metrics
                    </span>
                    <h3 className="font-bebas text-2xl tracking-wide uppercase">
                      {isNe ? "करियर तथ्याङ्क तुलनात्मक चार्ट" : "Career Analytical Breakdown"}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Matches</span>
                      <strong className="font-bebas text-3xl text-foreground block mt-1">{player.stats.matches}</strong>
                      <span className="text-[10px] text-muted-foreground">Innings: {player.stats.innings}</span>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Runs Scored</span>
                      <strong className="font-bebas text-3xl text-amber-500 block mt-1">{player.stats.runs}</strong>
                      <span className="text-[10px] text-muted-foreground">Highest: {player.stats.highestScore}</span>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Wickets Taken</span>
                      <strong className="font-bebas text-3xl text-purple-400 block mt-1">{player.stats.wickets}</strong>
                      <span className="text-[10px] text-muted-foreground">Best: {player.stats.bestBowling}</span>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Strike Rate</span>
                      <strong className="font-bebas text-3xl text-primary block mt-1">
                        {player.stats.strikeRate ?? "-"}
                      </strong>
                      <span className="text-[10px] text-muted-foreground">
                        Econ: {player.stats.economy ?? "-"}
                      </span>
                    </div>
                  </div>
                </section>

                {/* 3. Records & Honors Cards */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    <h3 className="font-bebas text-2xl tracking-wide uppercase">
                      {isNe ? "प्रमुख कीर्तिमान तथा उपलब्धीहरू" : "Key Records & Achievements"}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {meta.records.map((rec, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-border/80 bg-card/60 p-4 flex items-start gap-3.5"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-500/15 text-amber-500 font-bebas text-xl flex items-center justify-center border border-amber-500/30">
                          {rec.rank}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground leading-snug">
                            {rec.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {rec.subtitle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 4. Upcoming NPL 2026 Fixtures */}
                <section className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                        Match Calendar
                      </span>
                      <h3 className="font-bebas text-2xl tracking-wide uppercase">
                        {isNe ? "आगामी खेलहरू (एनपीएल २०२६)" : `Upcoming NPL 2026 Fixtures for ${team.name}`}
                      </h3>
                    </div>
                    <Link
                      href="/npl"
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
                    >
                      {isNe ? "सम्पूर्ण तालिका" : "Full Schedule"}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {teamFixtures.slice(0, 4).map((f) => {
                      const oppId = f.teamId === team.id ? f.opponentId : f.teamId;
                      const oppTeam = nplTeam(oppId);
                      return (
                        <div
                          key={f.matchNumber}
                          className="rounded-xl border border-border/80 bg-card/60 p-3.5 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-mono">
                              Match {f.matchNumber} · {f.matchDate}
                            </span>
                            <h4 className="font-semibold text-foreground text-sm mt-0.5">
                              vs {isNe ? oppTeam.nameNe : oppTeam.name}
                            </h4>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" /> {f.startTime} NPT · TU Ground
                            </span>
                          </div>

                          <span className="px-2 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] uppercase">
                            Confirmed
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {/* TAB 2: DETAILED STATS */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
                  <h3 className="font-bebas text-2xl uppercase tracking-wide">
                    {isNe ? "विस्तृत ब्याटिङ तथा बलिङ आँकडा" : "Complete Career Statistics"}
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/80 text-muted-foreground uppercase">
                          <th className="py-2.5 px-3">Metric</th>
                          <th className="py-2.5 px-3">Career Total</th>
                          <th className="py-2.5 px-3">Average / Rate</th>
                          <th className="py-2.5 px-3">Best Performance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 font-mono">
                        <tr>
                          <td className="py-3 px-3 font-sans font-medium text-foreground">Matches / Innings</td>
                          <td className="py-3 px-3">{player.stats.matches} Matches</td>
                          <td className="py-3 px-3">{player.stats.innings} Innings</td>
                          <td className="py-3 px-3 text-muted-foreground">-</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-sans font-medium text-foreground">Batting Runs</td>
                          <td className="py-3 px-3 text-amber-500 font-bold">{player.stats.runs} Runs</td>
                          <td className="py-3 px-3">Avg: {player.stats.battingAverage ?? "-"} · SR: {player.stats.strikeRate ?? "-"}</td>
                          <td className="py-3 px-3">HS: {player.stats.highestScore}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-sans font-medium text-foreground">Fifties / Hundreds</td>
                          <td className="py-3 px-3">{player.stats.fifties} Fifties</td>
                          <td className="py-3 px-3">{player.stats.hundreds} Hundreds</td>
                          <td className="py-3 px-3 text-muted-foreground">-</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-sans font-medium text-foreground">Bowling Wickets</td>
                          <td className="py-3 px-3 text-purple-400 font-bold">{player.stats.wickets} Wickets</td>
                          <td className="py-3 px-3">Avg: {player.stats.bowlingAverage ?? "-"} · Econ: {player.stats.economy ?? "-"}</td>
                          <td className="py-3 px-3 font-bold text-foreground">{player.stats.bestBowling}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: RECORDS */}
            {activeTab === "records" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
                  <h3 className="font-bebas text-2xl uppercase tracking-wide">
                    {isNe ? "कीर्तिमान तथा ऐतिहासिक तथ्याङ्क" : "Historical Milestones & Records"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {meta.records.map((r, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                        <span className="font-bebas text-2xl text-amber-500 block leading-none">{r.rank}</span>
                        <h4 className="font-semibold text-sm text-foreground">{r.title}</h4>
                        <p className="text-xs text-muted-foreground">{r.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MATCHES */}
            {activeTab === "matches" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
                  <h3 className="font-bebas text-2xl uppercase tracking-wide">
                    {team.name} Match Schedule in NPL 2026 ({teamFixtures.length} Matches)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {teamFixtures.map((f) => {
                      const t1 = nplTeam(f.teamId);
                      const t2 = nplTeam(f.opponentId);
                      return (
                        <div
                          key={f.matchNumber}
                          className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2"
                        >
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span className="font-mono font-bold text-primary">Match {f.matchNumber}</span>
                            <span>{f.matchDate} · {f.startTime} NPT</span>
                          </div>
                          <h4 className="font-semibold text-sm">
                            {isNe ? t1.nameNe : t1.name} vs {isNe ? t2.nameNe : t2.name}
                          </h4>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1 border-t border-border/40">
                            <MapPin className="h-3 w-3 text-red-500" />
                            <span>TU Cricket Ground, Kirtipur</span>
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

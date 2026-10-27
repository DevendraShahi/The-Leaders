"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ExternalLink,
  ChevronRight,
  Calendar,
  Users,
  Shield,
  Award,
  Sparkles,
  MapPin,
  Clock,
  Tv,
  CheckCircle2,
  Share2,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Star,
  Zap,
  Flame
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import type { NplTeamExtended, NplPlayer } from "@/lib/npl-data";
import type { CricketFixture } from "@/lib/post-studio/cricket-fixtures";
import { nplTeam } from "@/lib/post-studio/cricket-catalog";
import { NplScorecardModal } from "@/components/npl/NplScorecardModal";
import { nplMatch1Scorecard, type CompletedMatchScorecard } from "@/lib/npl-match-data";

interface NplTeamProfileClientProps {
  team: NplTeamExtended;
  allTeams: NplTeamExtended[];
  fixtures: CricketFixture[];
}

type TeamTabType = "squad" | "fixtures" | "leadership" | "analytics";
type RoleFilterType = "all" | "batter" | "bowler" | "allrounder" | "wicketkeeper" | "overseas";

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

function getContrastTextColor(hexColor: string): string {
  try {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 140 ? "#0a0d14" : "#ffffff";
  } catch {
    return "#ffffff";
  }
}

export function NplTeamProfileClient({
  team,
  allTeams,
  fixtures
}: NplTeamProfileClientProps) {
  const { language } = useLanguage();
  const isNe = language === "ne";

  const [activeTab, setActiveTab] = React.useState<TeamTabType>("squad");
  const [roleFilter, setRoleFilter] = React.useState<RoleFilterType>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [selectedScorecardMatch, setSelectedScorecardMatch] = React.useState<CompletedMatchScorecard | null>(null);

  const primaryContrast = React.useMemo(() => getContrastTextColor(team.primary), [team.primary]);
  const secondaryContrast = React.useMemo(() => getContrastTextColor(team.secondary), [team.secondary]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Filter players
  const filteredPlayers = React.useMemo(() => {
    return team.players.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameNe.includes(searchQuery) ||
        p.origin.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "batter" && p.role.toLowerCase().includes("bat")) ||
        (roleFilter === "bowler" && p.role.toLowerCase().includes("bowl")) ||
        (roleFilter === "allrounder" && p.role.toLowerCase().includes("all-round")) ||
        (roleFilter === "wicketkeeper" && p.role.toLowerCase().includes("keeper")) ||
        (roleFilter === "overseas" && p.category.toLowerCase().includes("overseas"));

      return matchesSearch && matchesRole;
    });
  }, [team.players, searchQuery, roleFilter]);

  // Key Individuals
  const captainPlayer = React.useMemo(() => {
    return team.players.find((p) => p.isCaptain) || team.players[0];
  }, [team.players]);

  const marqueePlayer = React.useMemo(() => {
    return team.players.find((p) => p.isMarquee) || team.players[0];
  }, [team.players]);

  const overseasStars = React.useMemo(() => {
    return team.players.filter((p) => p.category === "Overseas");
  }, [team.players]);

  // Statistical leaders inside the squad
  const topBattersInSquad = React.useMemo(() => {
    return [...team.players]
      .filter((p) => p.stats.runs > 0)
      .sort((a, b) => b.stats.runs - a.stats.runs)
      .slice(0, 3);
  }, [team.players]);

  const topBowlersInSquad = React.useMemo(() => {
    return [...team.players]
      .filter((p) => p.stats.wickets > 0)
      .sort((a, b) => b.stats.wickets - a.stats.wickets)
      .slice(0, 3);
  }, [team.players]);

  // Squad Composition Breakdown
  const roleBreakdown = React.useMemo(() => {
    const batters = team.players.filter((p) => p.role.toLowerCase().includes("bat")).length;
    const bowlers = team.players.filter((p) => p.role.toLowerCase().includes("bowl")).length;
    const allrounders = team.players.filter((p) => p.role.toLowerCase().includes("all-round")).length;
    const keepers = team.players.filter((p) => p.role.toLowerCase().includes("keeper")).length;
    const overseas = team.players.filter((p) => p.category === "Overseas").length;
    const domestic = team.players.length - overseas;
    return { batters, bowlers, allrounders, keepers, overseas, domestic };
  }, [team.players]);

  return (
    <div
      className="npl-sports-hub min-h-screen bg-background text-foreground pb-24 font-sans relative selection:bg-primary/20"
      style={{
        "--team-primary": team.primary,
        "--team-secondary": team.secondary,
        "--team-dark": team.dark,
      } as React.CSSProperties}
    >
      {/* 0. FULL-PAGE FRANCHISE AMBIENT LIGHTING & SUBTLE WATERMARK */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          background: `radial-gradient(circle at 90% 15%, ${team.primary}10 0%, transparent 45%), radial-gradient(circle at 10% 65%, ${team.secondary}08 0%, transparent 50%), radial-gradient(circle at 50% 95%, ${team.primary}06 0%, transparent 40%)`,
        }}
      />

      {/* Subtle Full-Page Watermark Crest in Main Canvas */}
      <div
        className="fixed right-0 top-1/4 w-[480px] h-[480px] sm:w-[650px] sm:h-[650px] pointer-events-none select-none z-0 opacity-[0.03] dark:opacity-[0.045] -mr-32 sm:-mr-48"
        style={{
          maskImage: "radial-gradient(circle at center, black 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 0%, transparent 70%)",
        }}
      >
        <Image src={team.logo} alt="" fill className="object-contain" priority={false} />
      </div>

      {/* 1. EDITORIAL TOP BREADCRUMB */}
      <div className="relative z-10 border-b border-border bg-card/60 backdrop-blur-md">
        {/* Chromatic Top Accent Stripe */}
        <div
          className="h-1 w-full shrink-0"
          style={{
            background: `linear-gradient(90deg, ${team.primary} 0%, ${team.secondary} 50%, ${team.primary} 100%)`,
          }}
        />

        <div className="container mx-auto px-4 max-w-6xl h-11 flex items-center justify-between text-xs gap-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground min-w-0">
            <Link href="/npl" className="hover:text-foreground transition flex items-center gap-1 font-medium shrink-0">
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isNe ? "एनपीएल २०२६" : "NPL Hub"}</span>
              <span className="sm:hidden">NPL</span>
            </Link>
            <span>/</span>
            <Link href="/npl" className="hover:text-foreground transition font-medium hidden sm:inline">
              {isNe ? "फ्रेन्चाइजहरू" : "Franchises"}
            </Link>
            <span className="hidden sm:inline">/</span>
            <span className="text-foreground font-semibold truncate flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: team.primary }}
              />
              {isNe ? team.nameNe : team.name}
            </span>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href={team.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition font-medium"
            >
              <span className="hidden sm:inline">{isNe ? "आधिकारिक पोर्टल" : "Official Portal"}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="text-border">|</span>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition"
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
      </div>

      {/* 2. STATELY FRANCHISE HERO BANNER (Border-Free Floating Logo + Fading Watermark Background) */}
      <header
        className="border-b border-border text-white relative overflow-hidden z-10"
        style={{
          background: `radial-gradient(circle at 80% 25%, ${team.primary}35 0%, transparent 50%), radial-gradient(circle at 20% 75%, ${team.secondary}25 0%, transparent 55%), linear-gradient(135deg, ${team.dark} 0%, #06090f 100%)`,
        }}
      >
        {/* High-Impact Atmospheric Fading Watermark Logo */}
        <div
          className="absolute -right-10 -bottom-16 sm:-right-6 sm:-bottom-12 md:right-8 md:-bottom-8 w-72 h-72 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] lg:w-[580px] lg:h-[580px] pointer-events-none select-none z-0"
          style={{
            maskImage: "radial-gradient(circle at 55% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.35) 60%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(circle at 55% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.35) 60%, transparent 78%)",
          }}
        >
          <div className="relative w-full h-full opacity-20 sm:opacity-25 filter drop-shadow-[0_0_80px_rgba(255,255,255,0.08)] transform rotate-[-6deg] scale-105">
            <Image
              src={team.logo}
              alt=""
              fill
              className="object-contain"
              priority={false}
            />
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl py-8 md:py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
            {/* Club Crest - Border-Free, Pure Floating Emblem (No Container Box) */}
            <div className="relative h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 lg:h-52 lg:w-52 shrink-0 flex items-center justify-center filter drop-shadow-[0_16px_36px_rgba(0,0,0,0.7)] hover:scale-105 transition-transform duration-300">
              <Image
                src={team.logo}
                alt={team.name}
                fill
                priority
                className="object-contain"
              />
            </div>

            {/* Franchise Identity & Information */}
            <div className="flex-1 text-center md:text-left space-y-3.5 w-full">
              {/* Eyebrow */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-semibold uppercase tracking-wider text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white">{isNe ? "सिजन ३ (२०२६)" : "NPL Season 3"}</span>
                </span>
                <span>·</span>
                <span>{isNe ? "फ्रेन्चाइज ब्युरो" : "Official Franchise Bureau"}</span>
                <span>·</span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${team.primary}25`,
                    color: team.primary,
                    border: `1px solid ${team.primary}50`,
                  }}
                >
                  {team.short}
                </span>
              </div>

              {/* Title with Franchise Primary Accent */}
              <div>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white font-sans leading-tight">
                  {team.name}
                </h1>
                <p
                  className="text-lg sm:text-2xl font-nepali font-bold mt-1"
                  style={{ color: team.primary }}
                >
                  {team.nameNe}
                </p>
              </div>

              {/* Bio & Ownership Statement */}
              <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed mx-auto md:mx-0">
                {isNe
                  ? `${team.owner} को स्वामित्वमा रहेको टिम। टियु अन्तर्राष्ट्रिय क्रिकेट मैदान, कीर्तिपुरमा एनपीएल उपाधिका लागि प्रतिस्पर्धा गर्दै।`
                  : `Owned and operated by ${team.owner}. Competing in the Nepal Premier League (NPL) representing regional pride at the TU International Cricket Ground, Kirtipur.`}
              </p>

              {/* 4-Col Key Leadership Strip with Franchise Accents */}
              <dl className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                <div
                  className="rounded-lg bg-black/40 p-2.5 sm:p-3 text-left backdrop-blur-xs transition hover:bg-black/55"
                  style={{ border: `1px solid ${team.primary}35` }}
                >
                  <dt className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/60 font-semibold truncate">Captain</dt>
                  <dd className="text-white font-bold text-xs sm:text-sm mt-0.5 truncate">{team.captain}</dd>
                </div>
                <div
                  className="rounded-lg bg-black/40 p-2.5 sm:p-3 text-left backdrop-blur-xs transition hover:bg-black/55"
                  style={{ border: `1px solid ${team.primary}35` }}
                >
                  <dt className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/60 font-semibold truncate">Head Coach</dt>
                  <dd className="text-white font-bold text-xs sm:text-sm mt-0.5 truncate">{team.coach}</dd>
                </div>
                <div
                  className="rounded-lg bg-black/40 p-2.5 sm:p-3 text-left backdrop-blur-xs transition hover:bg-black/55"
                  style={{ border: `1px solid ${team.primary}35` }}
                >
                  <dt className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/60 font-semibold truncate">Domestic Marquee</dt>
                  <dd className="text-white font-bold text-xs sm:text-sm mt-0.5 truncate">{team.marqueePlayer}</dd>
                </div>
                <div
                  className="rounded-lg bg-black/40 p-2.5 sm:p-3 text-left backdrop-blur-xs transition hover:bg-black/55"
                  style={{ border: `1px solid ${team.primary}35` }}
                >
                  <dt className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/60 font-semibold truncate">Overseas Star</dt>
                  <dd className="text-white font-bold text-xs sm:text-sm mt-0.5 truncate">{team.overseasStar}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Quick Metrics KPIs Bar */}
          <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
            <div className="rounded-lg bg-black/35 border border-white/10 p-2 sm:p-2.5">
              <span className="text-[10px] uppercase tracking-wider text-white/60 font-medium block">Total Roster</span>
              <strong className="text-sm sm:text-base font-bold text-white block mt-0.5 tabular-nums">
                {team.players.length} Players
              </strong>
            </div>
            <div className="rounded-lg bg-black/35 border border-white/10 p-2 sm:p-2.5">
              <span className="text-[10px] uppercase tracking-wider text-white/60 font-medium block">Franchise Valuation</span>
              <strong
                className="text-sm sm:text-base font-bold block mt-0.5 tabular-nums"
                style={{ color: team.primary }}
              >
                {team.bidPriceNpr}
              </strong>
            </div>
            <div className="rounded-lg bg-black/35 border border-white/10 p-2 sm:p-2.5">
              <span className="text-[10px] uppercase tracking-wider text-white/60 font-medium block">Group Matches</span>
              <strong className="text-sm sm:text-base font-bold text-white block mt-0.5 tabular-nums">
                {fixtures.length} Battles
              </strong>
            </div>
            <div className="rounded-lg bg-black/35 border border-white/10 p-2 sm:p-2.5">
              <span className="text-[10px] uppercase tracking-wider text-white/60 font-medium block">Home Venue</span>
              <strong className="text-sm sm:text-base font-bold text-white block mt-0.5 truncate">
                TU Ground, Kirtipur
              </strong>
            </div>
          </div>
        </div>
      </header>

      {/* 3. STICKY SUB-NAVIGATION TABS (Themed Active Tab Highlights) */}
      <nav className="sticky top-[56px] md:top-[64px] z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-xs">
        <div className="container mx-auto px-4 max-w-6xl flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "squad", labelEn: `Squad Roster (${team.players.length})`, labelNe: `खेलाडी रोस्टर (${team.players.length})`, icon: Users },
            { id: "fixtures", labelEn: `Match Schedule (${fixtures.length})`, labelNe: `खेल तालिका (${fixtures.length})`, icon: Calendar },
            { id: "leadership", labelEn: "Leadership & Dossier", labelNe: "नेतृत्व तथा स्वामित्व", icon: Shield },
            { id: "analytics", labelEn: "Squad Analytics & Leaders", labelNe: "टोली विश्लेषण", icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TeamTabType)}
                className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? "font-bold text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                style={
                  isActive
                    ? {
                        borderBottomColor: team.primary,
                        color: team.primary,
                      }
                    : undefined
                }
              >
                <Icon
                  className="h-4 w-4 shrink-0"
                  style={isActive ? { color: team.primary } : undefined}
                />
                <span>{isNe ? tab.labelNe : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 4. MAIN CONTENT TABS */}
      <main className="container mx-auto px-4 max-w-6xl py-8 relative z-10">
        {/* TAB 1: SQUAD ROSTER */}
        {activeTab === "squad" && (
          <div className="space-y-6">
            {/* Header + Filter Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-1 rounded-full shrink-0"
                    style={{ backgroundColor: team.primary }}
                  />
                  {isNe ? `${team.nameNe} टोली रोस्टर` : `${team.name} Official Squad`}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isNe
                    ? "१४५ खेलाडीको पारदर्शी प्रोफाइल, टी२० तथ्याङ्क र कटआउट"
                    : "High-density player dossiers with verified T20 statistics"}
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={isNe ? "खेलाडी खोज्नुहोस्..." : "Search squad..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </div>

            {/* Role Filter Chips (Themed Active Chip) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider mr-1 hidden sm:inline">Role:</span>
              {[
                { id: "all", labelEn: `All (${team.players.length})`, labelNe: "सबै" },
                { id: "batter", labelEn: `Batters (${roleBreakdown.batters})`, labelNe: "ब्याटर" },
                { id: "allrounder", labelEn: `All-Rounders (${roleBreakdown.allrounders})`, labelNe: "अलराउन्डर" },
                { id: "bowler", labelEn: `Bowlers (${roleBreakdown.bowlers})`, labelNe: "बलर" },
                { id: "wicketkeeper", labelEn: `Keepers (${roleBreakdown.keepers})`, labelNe: "किपर" },
                { id: "overseas", labelEn: `Overseas (${roleBreakdown.overseas})`, labelNe: "विदेशी" },
              ].map((rf) => {
                const isSelected = roleFilter === rf.id;
                return (
                  <button
                    key={rf.id}
                    onClick={() => setRoleFilter(rf.id as RoleFilterType)}
                    className="px-3 py-1.5 rounded-md transition whitespace-nowrap border"
                    style={
                      isSelected
                        ? {
                            backgroundColor: team.primary,
                            color: primaryContrast,
                            borderColor: team.primary,
                            boxShadow: `0 2px 8px ${team.primary}35`,
                          }
                        : {
                            backgroundColor: "var(--card)",
                            color: "var(--muted-foreground)",
                            borderColor: "var(--border)",
                          }
                    }
                  >
                    {isNe ? rf.labelNe : rf.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Players Grid */}
            {filteredPlayers.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border rounded-lg bg-card">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-foreground">No players found matching your criteria</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("all");
                  }}
                  className="mt-3 text-xs text-primary underline underline-offset-4"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {filteredPlayers.map((player) => (
                  <Link
                    key={player.id}
                    href={`/npl/players/${player.id}`}
                    className="group rounded-lg border border-border bg-card overflow-hidden hover:border-foreground transition flex flex-col justify-between shadow-xs hover:shadow-md"
                  >
                    {/* Portrait Frame with grounded bottom cutout & subtle team color glow */}
                    <div
                      className="relative h-44 sm:h-48 w-full flex items-end justify-center overflow-hidden p-2"
                      style={{
                        background: `linear-gradient(180deg, ${team.primary}15 0%, rgba(var(--muted), 0.15) 100%)`,
                      }}
                    >
                      <Image
                        src={player.image.thumbnail || player.image.local}
                        alt={player.name}
                        fill
                        className="object-contain object-bottom p-1 drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Corner Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {player.isCaptain && (
                          <span className="text-[9px] font-bold text-foreground bg-background/95 px-1.5 py-0.5 border border-border rounded uppercase">
                            Captain
                          </span>
                        )}
                        {player.isMarquee && (
                          <span
                            className="text-[9px] font-bold bg-background/95 px-1.5 py-0.5 rounded uppercase"
                            style={{
                              color: team.primary,
                              border: `1px solid ${team.primary}60`,
                            }}
                          >
                            Marquee
                          </span>
                        )}
                        {player.category === "Overseas" && (
                          <span className="text-[9px] font-bold text-blue-500 bg-background/95 px-1.5 py-0.5 border border-blue-500/30 rounded uppercase">
                            Overseas
                          </span>
                        )}
                      </div>

                      {/* Small Team Crest at Top Right */}
                      <div className="absolute top-2 right-2 relative h-5 w-5 shrink-0 rounded bg-background/90 p-0.5 border border-border/60 shadow-xs z-10">
                        <Image src={team.logo} alt={team.name} fill className="object-contain" />
                      </div>
                    </div>

                    {/* Player Info & 3-Cell Wisden Stats */}
                    <div className="p-3 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                        <span className="truncate">{player.origin}</span>
                        <span
                          className="truncate font-semibold ml-1"
                          style={{ color: team.primary }}
                        >
                          {team.short}
                        </span>
                      </div>
                      <h3 className="font-bold text-xs md:text-sm text-foreground truncate group-hover:text-primary transition leading-tight">
                        {isNe ? player.nameNe : player.name}
                      </h3>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        {player.role}
                      </span>

                      {/* 3-Cell Career Figures */}
                      <div className="mt-2 pt-2 border-t border-border grid grid-cols-3 text-center text-xs">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">Mat</span>
                          <strong className="font-semibold text-foreground tabular-nums text-xs">{player.stats.matches}</strong>
                        </div>
                        <div className="border-x border-border/60">
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">Runs</span>
                          <strong className="font-semibold text-foreground tabular-nums text-xs">{player.stats.runs}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">
                            {player.stats.wickets > 0 ? "Wkts" : "SR"}
                          </span>
                          <strong className="font-semibold text-foreground tabular-nums text-xs">
                            {player.stats.wickets > 0 ? player.stats.wickets : (player.stats.strikeRate || "-")}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FIXTURES & SCHEDULE */}
        {activeTab === "fixtures" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border pb-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-1 rounded-full shrink-0"
                    style={{ backgroundColor: team.primary }}
                  />
                  {isNe ? `${team.nameNe} खेल तालिका` : `${team.name} Match Schedule`}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Complete 7 group-stage fixtures at TU International Cricket Ground, Kirtipur
                </p>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                Live Broadcast: Star Sports Network · NetTV
              </span>
            </div>

            <div className="border border-border rounded-lg divide-y divide-border bg-card overflow-hidden">
              {fixtures.map((f) => {
                const opponentId = f.teamId === team.id ? f.opponentId : f.teamId;
                const opp = allTeams.find((item) => item.id === opponentId);
                const oppLogo = opp?.logo || `/studio/cricket/${opponentId}.png`;
                const isCompleted = f.status === "completed" || f.matchNumber === 1;
                const isWinner = f.winnerId === team.id;
                const teamRuns = f.teamId === team.id ? f.teamScore : f.opponentScore;
                const oppRuns = f.teamId === team.id ? f.opponentScore : f.teamScore;

                return (
                  <div
                    key={f.id || f.matchNumber}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition relative ${
                      isCompleted ? "bg-muted/10 hover:bg-muted/20" : "hover:bg-muted/20"
                    }`}
                    style={{
                      borderLeft: isCompleted
                        ? isWinner
                          ? "4px solid #10b981"
                          : "4px solid #64748b"
                        : `3px solid ${team.primary}`,
                    }}
                  >
                    {/* Match Info & Teams */}
                    <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
                      {/* Match Number & Date */}
                      <div className="w-16 shrink-0 text-center border-r border-border pr-3">
                        <span className="font-bold text-foreground block text-sm">
                          #{f.matchNumber < 10 ? `0${f.matchNumber}` : f.matchNumber}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground block mt-0.5 whitespace-nowrap font-mono">
                          {formatNplDate(f.matchDate)}
                        </span>
                        {isCompleted && (
                          <span
                            className={`mt-1 inline-block text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                              isWinner
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {isWinner ? "WON" : "LOST"}
                          </span>
                        )}
                      </div>

                      {/* Head-to-Head Logos & Names & Scores */}
                      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                        {/* Team 1 (Current Team) */}
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 shrink-0 rounded bg-muted/20 p-1 border border-border/60 shadow-xs">
                            <Image src={team.logo} alt={team.name} fill className="object-contain p-0.5" />
                          </div>
                          <div>
                            <span
                              className="font-bold text-sm block leading-tight"
                              style={{ color: team.primary }}
                            >
                              {team.short}
                            </span>
                            {isCompleted && teamRuns && (
                              <span className="text-xs font-mono font-extrabold text-foreground tabular-nums block">
                                {teamRuns}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* VS / Result Emblem */}
                        <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted/40 px-1.5 py-0.5 rounded border border-border/50">
                          {isCompleted ? (isWinner ? "def." : "lost to") : "VS"}
                        </span>

                        {/* Team 2 (Opponent) */}
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 shrink-0 rounded bg-muted/20 p-1 border border-border/60 shadow-xs">
                            <Image
                              src={oppLogo}
                              alt={opp?.name || opponentId}
                              fill
                              className="object-contain p-0.5"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-foreground block leading-tight">
                              {opp?.short || opp?.name || opponentId}
                            </span>
                            {isCompleted && oppRuns && (
                              <span className="text-xs font-mono font-bold text-muted-foreground tabular-nums block">
                                {oppRuns}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timing, Stage & Venue OR Completed Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 text-muted-foreground border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60 shrink-0">
                      {isCompleted ? (
                        <div className="flex items-center gap-3">
                          {f.playerOfTheMatch && (
                            <span className="text-[11px] font-mono text-muted-foreground hidden md:inline">
                              POTM: <strong className="text-foreground">{f.playerOfTheMatch}</strong>
                            </span>
                          )}
                          <button
                            onClick={() => setSelectedScorecardMatch(nplMatch1Scorecard)}
                            className="px-3 py-1.5 rounded-md bg-foreground text-background font-semibold text-xs hover:opacity-90 transition shadow-xs flex items-center gap-1"
                          >
                            <span>{isNe ? "स्कोरकार्ड" : "Scorecard"}</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="text-left sm:text-right">
                            <span className="font-bold text-foreground block text-xs sm:text-sm tabular-nums font-mono">
                              {f.startTime} NPT
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              TU Ground, Kirtipur
                            </span>
                          </div>
                          <span className="rounded bg-muted/40 px-2 py-1 text-[10px] font-semibold text-foreground uppercase border border-border/60 font-mono">
                            League
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: LEADERSHIP & DOSSIER */}
        {activeTab === "leadership" && (
          <div className="space-y-8">
            <div className="border-b border-border pb-3">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans flex items-center gap-2">
                <span
                  className="inline-block h-3 w-1 rounded-full shrink-0"
                  style={{ backgroundColor: team.primary }}
                />
                {isNe ? "टोली नेतृत्व तथा व्यवस्थापन" : "Franchise Leadership & Management"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Key personnel steering {team.name} in Nepal Premier League Season 3
              </p>
            </div>

            {/* Spotlight Leadership Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Captain Spotlight */}
              {captainPlayer && (
                <div
                  className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs flex flex-col justify-between"
                  style={{ borderTop: `3px solid ${team.primary}` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative h-20 w-20 shrink-0 rounded-lg bg-muted/30 border border-border overflow-hidden">
                      <Image
                        src={captainPlayer.image.thumbnail || captainPlayer.image.local}
                        alt={captainPlayer.name}
                        fill
                        className="object-contain object-bottom p-1"
                      />
                    </div>
                    <div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider block"
                        style={{ color: team.primary }}
                      >
                        Team Captain
                      </span>
                      <h3 className="text-lg font-bold text-foreground">
                        {captainPlayer.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-nepali">
                        {captainPlayer.nameNe}
                      </p>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {captainPlayer.role} · #{captainPlayer.origin}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
                    {captainPlayer.highlights || `${captainPlayer.name} leads ${team.name} as captain in NPL 2026.`}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                    <span className="text-muted-foreground">Career T20 Figures:</span>
                    <strong className="text-foreground">
                      {captainPlayer.stats.matches} Mat · {captainPlayer.stats.runs} Runs · {captainPlayer.stats.wickets} Wkts
                    </strong>
                  </div>
                </div>
              )}

              {/* Head Coach Spotlight */}
              <div
                className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs flex flex-col justify-between"
                style={{ borderTop: `3px solid ${team.secondary}` }}
              >
                <div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider block"
                    style={{ color: team.secondary }}
                  >
                    Technical Leadership
                  </span>
                  <h3 className="text-lg font-bold text-foreground mt-1">
                    {team.coach}
                  </h3>
                  <span className="text-xs text-muted-foreground">Head Coach</span>

                  <p className="text-xs text-muted-foreground leading-relaxed mt-4 pt-3 border-t border-border">
                    Responsible for tactical gameplans, squad conditioning, matchday field strategies, and technical mentorship for {team.name} throughout the tournament.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <span className="text-muted-foreground">Tactical Command:</span>
                  <strong className="text-foreground">{team.name} Dugout</strong>
                </div>
              </div>
            </div>

            {/* Franchise Ownership & Commercial Dossier */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">Commercial Dossier</span>
                  <h3 className="text-base font-bold text-foreground">
                    Franchise Ownership & Valuation Records
                  </h3>
                </div>
                <div className="relative h-8 w-8">
                  <Image src={team.logo} alt={team.name} fill className="object-contain" />
                </div>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2">
                <div className="border border-border/70 rounded-lg p-3 bg-muted/20">
                  <dt className="text-muted-foreground font-semibold uppercase text-[10px]">Owning Entity</dt>
                  <dd className="font-bold text-foreground mt-1">{team.owner}</dd>
                </div>
                <div className="border border-border/70 rounded-lg p-3 bg-muted/20">
                  <dt className="text-muted-foreground font-semibold uppercase text-[10px]">Auction Bid Valuation</dt>
                  <dd
                    className="font-bold mt-1 tabular-nums text-sm"
                    style={{ color: team.primary }}
                  >
                    {team.bidPriceNpr}
                  </dd>
                </div>
                <div className="border border-border/70 rounded-lg p-3 bg-muted/20">
                  <dt className="text-muted-foreground font-semibold uppercase text-[10px]">Domestic Marquee</dt>
                  <dd className="font-bold text-foreground mt-1">{team.marqueePlayer}</dd>
                </div>
                <div className="border border-border/70 rounded-lg p-3 bg-muted/20">
                  <dt className="text-muted-foreground font-semibold uppercase text-[10px]">Official Web Presence</dt>
                  <dd className="mt-1">
                    <a
                      href={team.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:underline inline-flex items-center gap-1"
                      style={{ color: team.primary }}
                    >
                      <span>Visit Site</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* TAB 4: SQUAD ANALYTICS & LEADERS */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div className="border-b border-border pb-3">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans flex items-center gap-2">
                <span
                  className="inline-block h-3 w-1 rounded-full shrink-0"
                  style={{ backgroundColor: team.primary }}
                />
                {isNe ? "टोली विश्लेषण तथा लिडरबोर्ड" : "Squad Composition & Key Figures"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Roster breakdown, overseas quota, and statistical leaders within {team.name}
              </p>
            </div>

            {/* 1. Squad Composition Grid with Top Colored Accents */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div
                className="rounded-lg border border-border bg-card p-3.5 text-center overflow-hidden"
                style={{ borderTop: `3px solid ${team.primary}` }}
              >
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">Total Players</span>
                <strong className="text-2xl font-extrabold text-foreground block mt-1 tabular-nums">{team.players.length}</strong>
              </div>
              <div
                className="rounded-lg border border-border bg-card p-3.5 text-center overflow-hidden"
                style={{ borderTop: `3px solid ${team.primary}` }}
              >
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">Batters</span>
                <strong className="text-2xl font-extrabold text-foreground block mt-1 tabular-nums">{roleBreakdown.batters}</strong>
              </div>
              <div
                className="rounded-lg border border-border bg-card p-3.5 text-center overflow-hidden"
                style={{ borderTop: `3px solid ${team.secondary}` }}
              >
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">All-Rounders</span>
                <strong className="text-2xl font-extrabold text-foreground block mt-1 tabular-nums">{roleBreakdown.allrounders}</strong>
              </div>
              <div
                className="rounded-lg border border-border bg-card p-3.5 text-center overflow-hidden"
                style={{ borderTop: `3px solid ${team.secondary}` }}
              >
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">Bowlers</span>
                <strong className="text-2xl font-extrabold text-foreground block mt-1 tabular-nums">{roleBreakdown.bowlers}</strong>
              </div>
              <div
                className="rounded-lg border border-border bg-card p-3.5 text-center overflow-hidden"
                style={{ borderTop: `3px solid ${team.primary}` }}
              >
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">Wicketkeepers</span>
                <strong className="text-2xl font-extrabold text-foreground block mt-1 tabular-nums">{roleBreakdown.keepers}</strong>
              </div>
              <div
                className="rounded-lg border border-border bg-card p-3.5 text-center overflow-hidden"
                style={{ borderTop: `3px solid #3b82f6` }}
              >
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">Overseas Stars</span>
                <strong className="text-2xl font-extrabold text-blue-600 block mt-1 tabular-nums">{roleBreakdown.overseas}</strong>
              </div>
            </div>

            {/* 2. Squad Statistical Leaders (Top Batters & Bowlers) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Leading Batters */}
              <div
                className="rounded-xl border border-border bg-card overflow-hidden shadow-xs"
                style={{ borderTop: `3px solid ${team.primary}` }}
              >
                <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                      Squad Batting Powerhouses
                    </h3>
                    <span className="text-[10px] text-muted-foreground">Highest Career T20 Runs</span>
                  </div>
                  <Flame
                    className="h-4 w-4"
                    style={{ color: team.primary }}
                  />
                </div>

                <div className="divide-y divide-border text-xs">
                  {topBattersInSquad.map((p, idx) => (
                    <Link
                      key={p.id}
                      href={`/npl/players/${p.id}`}
                      className="p-3.5 flex items-center justify-between hover:bg-muted/20 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-muted-foreground tabular-nums w-4">#{idx + 1}</span>
                        <div className="relative h-9 w-9 shrink-0 rounded bg-muted/30 border border-border overflow-hidden">
                          <Image src={p.image.thumbnail || p.image.local} alt={p.name} fill className="object-contain" />
                        </div>
                        <div>
                          <strong className="text-foreground block group-hover:text-primary transition">{p.name}</strong>
                          <span className="text-[10px] text-muted-foreground">{p.role} · {p.origin}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <strong
                          className="text-sm font-bold block tabular-nums"
                          style={{ color: team.primary }}
                        >
                          {p.stats.runs} R
                        </strong>
                        <span className="text-[10px] text-muted-foreground tabular-nums">SR {p.stats.strikeRate ?? "-"}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Leading Bowlers */}
              <div
                className="rounded-xl border border-border bg-card overflow-hidden shadow-xs"
                style={{ borderTop: `3px solid ${team.secondary}` }}
              >
                <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                      Squad Strike Bowlers
                    </h3>
                    <span className="text-[10px] text-muted-foreground">Highest Career T20 Wickets</span>
                  </div>
                  <Zap
                    className="h-4 w-4"
                    style={{ color: team.secondary }}
                  />
                </div>

                <div className="divide-y divide-border text-xs">
                  {topBowlersInSquad.map((p, idx) => (
                    <Link
                      key={p.id}
                      href={`/npl/players/${p.id}`}
                      className="p-3.5 flex items-center justify-between hover:bg-muted/20 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-muted-foreground tabular-nums w-4">#{idx + 1}</span>
                        <div className="relative h-9 w-9 shrink-0 rounded bg-muted/30 border border-border overflow-hidden">
                          <Image src={p.image.thumbnail || p.image.local} alt={p.name} fill className="object-contain" />
                        </div>
                        <div>
                          <strong className="text-foreground block group-hover:text-primary transition">{p.name}</strong>
                          <span className="text-[10px] text-muted-foreground">{p.role} · {p.origin}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <strong
                          className="text-sm font-bold block tabular-nums"
                          style={{ color: team.secondary }}
                        >
                          {p.stats.wickets} W
                        </strong>
                        <span className="text-[10px] text-muted-foreground tabular-nums">Econ {p.stats.economy ?? "-"}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. FRANCHISE DIRECTORY STRIP (Jump to any other team) */}
      <aside className="container mx-auto px-4 max-w-6xl pt-8 relative z-10">
        <div className="border border-border rounded-xl bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {isNe ? "अन्य प्रतिस्पर्धी फ्रेन्चाइजहरू" : "Other Competing Franchises in NPL 2026"}
              </h3>
            </div>
            <Link
              href="/npl"
              className="text-xs font-semibold text-foreground hover:text-primary transition flex items-center gap-1"
            >
              <span>{isNe ? "सबै ८ टिम हेर्नुहोस्" : "Browse All 8 Teams"}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {allTeams
              .filter((item) => item.id !== team.id)
              .map((other) => (
                <Link
                  key={other.id}
                  href={`/npl/teams/${other.id}`}
                  className="rounded-lg border border-border/70 bg-background/80 p-2.5 hover:border-foreground transition text-center flex flex-col items-center gap-1.5 group shadow-2xs hover:scale-[1.02]"
                >
                  <div className="relative h-9 w-9">
                    <Image
                      src={other.logo}
                      alt={other.name}
                      fill
                      className="object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                  <span className="text-xs font-bold truncate w-full text-foreground group-hover:text-primary transition">
                    {other.short}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </aside>

      {/* Official Match Scorecard Modal */}
      <NplScorecardModal
        scorecard={selectedScorecardMatch}
        onClose={() => setSelectedScorecardMatch(null)}
      />
    </div>
  );
}

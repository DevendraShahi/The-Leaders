"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Calendar,
  Users,
  Shield,
  Coins,
  Flame,
  Search,
  X,
  ExternalLink,
  Star,
  Award,
  Sparkles,
  MapPin,
  Clock,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronRight,
  Tv,
  Target,
  Zap,
  CheckCircle2
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import type { NplTeamExtended, NplPlayer, NplStanding } from "@/lib/npl-data";
import type { CricketFixture } from "@/lib/post-studio/cricket-fixtures";
import type { NplTeamId } from "@/lib/post-studio/cricket-catalog";
import { nplTournamentMeta } from "@/lib/npl-data";
import { nplUpdate, nplResultUpdates } from '@/lib/npl-season-update';
import { NplMatchSpotlight } from '@/components/npl/NplMatchSpotlight';
import { completedFixture, fixtureScorecard } from '@/lib/npl-spotlight';
import { NplScorecardModal } from "@/components/npl/NplScorecardModal";
import {
  nplCompletedMatches,
  type CompletedMatchScorecard
} from "@/lib/npl-match-data";

interface NplHubClientProps {
  teams: NplTeamExtended[];
  players: NplPlayer[];
  fixtures: CricketFixture[];
  playoffs: any[];
  standings: NplStanding[];
  initialNow?: string;
}

type TabType = "overview" | "franchises" | "players" | "fixtures" | "standings" | "commercials";

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

export function NplHubClient({
  teams,
  players,
  fixtures,
  playoffs,
  standings,
  initialNow
}: NplHubClientProps) {
  const { language } = useLanguage();
  const isNe = language === "ne";

  const [activeTab, setActiveTab] = React.useState<TabType>("overview");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTeamFilter, setSelectedTeamFilter] = React.useState<string>("all");
  const [selectedRoleFilter, setSelectedRoleFilter] = React.useState<string>("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = React.useState<string>("all");
  const [selectedPlayer, setSelectedPlayer] = React.useState<NplPlayer | null>(null);
  const [selectedTeamModal, setSelectedTeamModal] = React.useState<NplTeamExtended | null>(null);
  const [fixtureStageFilter, setFixtureStageFilter] = React.useState<"all" | "league" | "playoffs">("all");
  const [selectedScorecardMatch, setSelectedScorecardMatch] = React.useState<CompletedMatchScorecard | null>(null);
  const [leaderboardMode, setLeaderboardMode] = React.useState<"tournament" | "career">("tournament");

  // Filter players
  const filteredPlayers = React.useMemo(() => {
    return players.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameNe.includes(searchQuery) ||
        p.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.origin.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTeam =
        selectedTeamFilter === "all" || p.teamId === selectedTeamFilter;

      const matchesRole =
        selectedRoleFilter === "all" ||
        (selectedRoleFilter === "batter" && p.role.toLowerCase().includes("bat")) ||
        (selectedRoleFilter === "bowler" && p.role.toLowerCase().includes("bowl")) ||
        (selectedRoleFilter === "allrounder" && p.role.toLowerCase().includes("all-round")) ||
        (selectedRoleFilter === "wicketkeeper" && p.role.toLowerCase().includes("keeper"));

      const matchesCategory =
        selectedCategoryFilter === "all" ||
        (selectedCategoryFilter === "overseas" && p.category.toLowerCase().includes("overseas")) ||
        (selectedCategoryFilter === "marquee" && (p.isMarquee || p.category.toLowerCase().includes("marquee"))) ||
        (selectedCategoryFilter === "retained" && p.category.toLowerCase().includes("retained")) ||
        (selectedCategoryFilter === "auction" && p.category.toLowerCase().includes("auction"));

      return matchesSearch && matchesTeam && matchesRole && matchesCategory;
    });
  }, [players, searchQuery, selectedTeamFilter, selectedRoleFilter, selectedCategoryFilter]);

  // Statistical Leaders & Cap Contenders
  const topBatters = React.useMemo(() => {
    return [...players]
      .filter((p) => (p.stats.runs ?? 0) > 0)
      .sort((a, b) => (b.stats.runs ?? 0) - (a.stats.runs ?? 0))
      .slice(0, 4);
  }, [players]);

  const topBowlers = React.useMemo(() => {
    return [...players]
      .filter((p) => (p.stats.wickets ?? 0) > 0)
      .sort((a, b) => (b.stats.wickets ?? 0) - (a.stats.wickets ?? 0))
      .slice(0, 4);
  }, [players]);

  const topAllRounders = React.useMemo(() => {
    return [...players]
      .filter((p) => p.role.toLowerCase().includes("all-round") || ((p.stats.runs ?? 0) > 200 && (p.stats.wickets ?? 0) > 15))
      .sort((a, b) => ((b.stats.runs ?? 0) + (b.stats.wickets ?? 0) * 20) - ((a.stats.runs ?? 0) + (a.stats.wickets ?? 0) * 20))
      .slice(0, 4);
  }, [players]);


  return (
    <div className="npl-sports-hub min-h-screen bg-background text-foreground selection:bg-primary/20 font-sans">
      {/* 1. HERO BANNER */}
      <section className="border-b border-border bg-card/40 pt-6 pb-10 md:pt-12 md:pb-14">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left max-w-3xl">
              {/* Editorial Eyebrow with robust responsive wrapping */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-2.5 gap-y-1 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                <span className="inline-flex items-center gap-1.5 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-red-600 shrink-0 animate-pulse" />
                  <span className="text-foreground font-semibold">
                    {isNe ? "सिजन ३ (२०२६)" : "Season 3 (2026)"}
                  </span>
                  <span>·</span>
                  <span>{isNe ? "आधिकारिक ब्युरो" : "Editorial Desk"}</span>
                </span>
                <span className="hidden sm:inline text-border">|</span>
                <span>{isNe ? "टियु मैदान, कीर्तिपुर" : "TU Ground, Kirtipur"}</span>
                <span className="hidden sm:inline text-border">|</span>
                <span className="text-foreground/90 font-medium">{isNe ? nplTournamentMeta.datesNe : nplTournamentMeta.dates}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                {isNe ? (
                  <>
                    नेपाल प्रिमियर लिग <span className="text-primary font-bold">२०२६</span>
                  </>
                ) : (
                  <>
                    Nepal Premier <span className="text-primary font-bold">League</span>
                  </>
                )}
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
                {isNe
                  ? `८ फ्रेन्चाइज टिम, ${players.length} खेलाडी प्रोफाइल र ३२ खेलको तालिका। पुष्टि भएका नतिजा, टोली र खेलाडीको विवरण।`
                  : `Follow 8 franchises, ${players.length} player profiles and the 32-match schedule, with sourced results and squad updates.`}
              </p>

              {/* Quick Action Navigation Buttons - Responsive Equal Grid */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-xl mx-auto lg:mx-0">
                <button
                  onClick={() => setActiveTab("franchises")}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-foreground text-background px-4 py-2.5 text-xs sm:text-sm font-semibold hover:opacity-90 transition shadow-xs"
                >
                  <Shield className="h-4 w-4 shrink-0" />
                  <span>{isNe ? "८ फ्रेन्चाइज टिमहरू" : "8 Franchises"}</span>
                </button>
                <button
                  onClick={() => setActiveTab("players")}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-xs sm:text-sm font-medium hover:bg-accent transition"
                >
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{isNe ? `${players.length} खेलाडी रोस्टर` : `${players.length} Players & Stats`}</span>
                </button>
                <button
                  onClick={() => setActiveTab("fixtures")}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-xs sm:text-sm font-medium hover:bg-accent transition"
                >
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{isNe ? "३२ खेल तालिका" : "32 Match Schedule"}</span>
                </button>
              </div>
            </div>

            <div className="w-full lg:w-[400px] shrink-0 space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">{isNe ? 'अन्तिम जाँच' : 'Last checked'}: <time dateTime={nplUpdate.checkedAt}>{new Intl.DateTimeFormat(isNe ? 'ne-NP' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kathmandu' }).format(new Date(nplUpdate.checkedAt))} NPT</time> · {isNe ? 'सम्पादकीय अपडेट' : 'Editorial updates'}</p>
            <NplMatchSpotlight teams={teams} fixtures={fixtures} scorecards={nplCompletedMatches} initialNow={initialNow} isNe={isNe} onScorecard={setSelectedScorecardMatch} onFixtures={() => setActiveTab('fixtures')} />
            </div>
          </div>

          {/* Key Metrics Definition Grid - Compact 3-Column on Mobile */}
          <dl className="mt-6 sm:mt-8 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
            {[
              { labelEn: "Franchises", labelNe: "फ्रेन्चाइज", val: "8 Teams", desc: "Regional Clubs" },
              { labelEn: "Total Squads", labelNe: "खेलाडी", val: `${players.length}`, desc: "Cutout Dossiers" },
              { labelEn: "Matches", labelNe: "म्याच", val: "32 Battles", desc: "TU Ground, Kirtipur" },
              { labelEn: "Prize Fund", labelNe: "पुरस्कार", val: "रु ३.०० Cr", desc: "NPR 3.00 Cr Pool" },
              { labelEn: "Review Tech", labelNe: "अम्पायरिङ", val: "Hawk-Eye DRS", desc: "Ball-Tracking" },
              { labelEn: "Telecast", labelNe: "प्रसारण", val: "Star Sports", desc: "Global Linear TV" },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card p-2 sm:p-3 space-y-0.5 text-center sm:text-left"
              >
                <dt className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-semibold truncate">
                  {isNe ? stat.labelNe : stat.labelEn}
                </dt>
                <dd className="text-xs sm:text-sm md:text-base font-bold text-foreground truncate">
                  {stat.val}
                </dd>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground block truncate">
                  {stat.desc}
                </span>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 2. TAB CONTROLS */}
      <div className="sticky top-[56px] md:top-[64px] z-30 bg-background border-b border-border">
        <div className="container mx-auto px-4 max-w-7xl flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", labelEn: "Overview", labelNe: "सिंहावलोकन", icon: Trophy },
            { id: "franchises", labelEn: "Franchises (8)", labelNe: "८ फ्रेन्चाइजहरू", icon: Shield },
            { id: "players", labelEn: `Players (${players.length})`, labelNe: "खेलाडी रोस्टर", icon: Users },
            { id: "fixtures", labelEn: "Fixtures & Results", labelNe: "खेल तालिका", icon: Calendar },
            { id: "standings", labelEn: "Standings", labelNe: "अंक तालिका", icon: Award },
            { id: "commercials", labelEn: "Financials & Rules", labelNe: "नियम तथा बोलकबोल", icon: Coins },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-3.5 px-4 text-xs md:text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {isNe ? tab.labelNe : tab.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TAB CONTENT AREAS */}
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-12">
            {/* Headline Global Stars Carousel / Grid */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border pb-3">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
                    {isNe ? "विश्वस्तरीय सुपरस्टारहरू" : "World Cricket Icons"}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {isNe ? "एनपीएल सिजन ३ का अन्तर्राष्ट्रिय ताराहरू" : "Global Marquee Signings in NPL"}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategoryFilter("overseas");
                    setActiveTab("players");
                  }}
                  className="text-xs font-medium text-foreground hover:text-primary transition flex items-center gap-1 underline underline-offset-4"
                >
                  {isNe ? "सबै विदेशी खेलाडी हेर्नुहोस्" : "View All Overseas Stars"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {players
                  .filter((p) => p.category === "Overseas" && (p.isMarquee || (p.stats.matches ?? 0) > 100))
                  .slice(0, 6)
                  .map((player) => {
                    const playerTeam = teams.find((t) => t.id === player.teamId);
                    const teamLogo = playerTeam?.logo || `/studio/cricket/${player.teamId}.png`;

                    return (
                      <div
                        key={player.id}
                        onClick={() => setSelectedPlayer(player)}
                        className="group relative cursor-pointer rounded-lg border border-border bg-card hover:border-foreground/80 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                      >
                        {/* Portrait Frame with anchored cutout & team crest */}
                        <div className="relative h-44 sm:h-48 w-full bg-gradient-to-b from-muted/30 to-muted/10 flex items-end justify-center overflow-hidden p-2">
                          <Image
                            src={player.image.thumbnail}
                            alt={player.name}
                            fill
                            className="object-contain object-bottom p-1 drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                          />
                          {/* Corner Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {player.isCaptain && (
                              <span className="text-[9px] font-bold text-foreground bg-background/95 px-1.5 py-0.5 border border-border rounded uppercase">
                                Captain
                              </span>
                            )}
                            {player.isMarquee && (
                              <span className="text-[9px] font-bold text-amber-500 bg-background/95 px-1.5 py-0.5 border border-amber-500/30 rounded uppercase">
                                Marquee
                              </span>
                            )}
                          </div>
                          {/* Team Crest at Top Right */}
                          <div className="absolute top-2 right-2 relative h-6 w-6 shrink-0 rounded bg-background/95 p-0.5 border border-border/60 shadow-xs">
                            <Image
                              src={teamLogo}
                              alt={player.teamName}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>

                        {/* Player Information & Stats */}
                        <div className="p-3 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                            <span className="truncate">{player.origin}</span>
                            <span className="truncate font-medium text-foreground/80 ml-1">{playerTeam?.short || player.teamName}</span>
                          </div>
                          <h4 className="font-bold text-xs md:text-sm text-foreground truncate group-hover:text-primary transition leading-tight">
                            {isNe ? player.nameNe : player.name}
                          </h4>
                          <span className="text-[11px] text-muted-foreground block truncate">
                            {player.role}
                          </span>

                          {/* 3-Cell Career Figures */}
                          <div className="mt-2 pt-2 border-t border-border grid grid-cols-3 text-center text-xs">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">Mat</span>
                              <strong className="font-semibold text-foreground tabular-nums text-xs">{player.stats.matches ?? "—"}</strong>
                            </div>
                            <div className="border-x border-border/60">
                              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">Runs</span>
                              <strong className="font-semibold text-foreground tabular-nums text-xs">{player.stats.runs ?? "—"}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">
                                {(player.stats.wickets ?? 0) > 0 ? "Wkts" : "SR"}
                              </span>
                              <strong className="font-semibold text-foreground tabular-nums text-xs">
                                {(player.stats.wickets ?? 0) > 0 ? player.stats.wickets : (player.stats.strikeRate || "-")}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>

            {/* Franchise Cards Grid Preview */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border pb-3">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
                    {isNe ? "८ प्रदेशीय टिमहरू" : "8 Competing Franchises"}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {isNe ? "नेपाल प्रिमियर लिग टोलीहरू" : "Franchise Roster Summary"}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab("franchises")}
                  className="text-xs font-medium text-foreground hover:text-primary transition flex items-center gap-1 underline underline-offset-4"
                >
                  {isNe ? "विस्तृत विवरण हेर्नुहोस्" : "Detailed Franchise Dossiers"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {teams.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTeamModal(t)}
                    className="group relative cursor-pointer rounded-lg border border-border bg-card p-5 hover:border-foreground transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 border-b border-border pb-3">
                        <div className="relative h-12 w-12 shrink-0 rounded bg-muted/20 p-1 border border-border/60">
                          <Image src={t.logo} alt={t.name} fill className="object-contain p-0.5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-foreground leading-tight group-hover:text-primary transition">
                            {isNe ? t.nameNe : t.name}
                          </h3>
                          <span className="text-[11px] font-mono text-muted-foreground block mt-0.5">
                            {t.bidPriceNpr}
                          </span>
                        </div>
                      </div>

                      <dl className="mt-4 text-xs space-y-1.5 text-muted-foreground">
                        <div className="flex justify-between py-0.5">
                          <dt>Captain</dt>
                          <dd className="font-semibold text-foreground">{t.captain}</dd>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <dt>Head Coach</dt>
                          <dd className="font-medium text-foreground">{t.coach}</dd>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <dt>Overseas Star</dt>
                          <dd className="font-medium text-foreground truncate max-w-[140px] text-right">{t.overseasStar}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs font-medium text-foreground group-hover:text-primary transition">
                      <span>{t.players.length} Players in Roster</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Tournament Pillar Highlights */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              <div className="rounded-lg border border-border bg-card p-5 space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">
                  Prize Distribution
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {isNe ? "रु ३ करोड पुरस्कार राशि" : "NPR 3.00 Crore Prize Fund"}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {isNe
                    ? "विजेताले रु १.५० करोड, उपविजेताले रु ८० लाख, तेस्रो हुनेले रु ४० लाख तथा चौथो हुनेले रु ३० लाख नगद पाउनेछन्। उत्कृष्ट खेलाडीलाई विद्युतीय कार प्रदान गरिनेछ।"
                    : "The champions walk away with NPR 1.50 Crore, while the runners-up claim NPR 80 Lakh. Individual MVP honors include a brand-new electric SUV."}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-5 space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">
                  Umpiring Standard
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {isNe ? "हक-आई डिटिएस प्रविधि" : "Hawk-Eye DRS Review"}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {isNe
                    ? "प्रत्येक खेलमा अन्तर्राष्ट्रिय मापदण्डको बल-ट्र्याकिङ, अल्ट्रा-एज (स्निकोमिटर) तथा दुई सफल/असफल रिभ्यु प्रणाली लागू गरिएको छ।"
                    : "Every single match features high-speed optical tracking cameras, real-time ball-path trajectory, and UltraEdge snicko with two team reviews per innings."}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-5 space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">
                  Broadcaster
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {isNe ? "स्टार स्पोर्ट्स विश्वव्यापी प्रसारण" : "Star Sports Telecast"}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {isNe
                    ? "नेपालको घरेलु क्रिकेटलाई पहिलो पटक विश्वविख्यात स्टार स्पोर्ट्स च्यानलमार्फत दक्षिण एसिया तथा विश्वभर प्रत्यक्ष प्रसारण गरिएको छ।"
                    : "Carried live via linear TV on the Star Sports Network across the subcontinent, alongside Action Sports HD and Himalaya TV in Nepal."}
                </p>
              </div>
            </section>

            {/* Statistical Leaders & Cap Contenders */}
            {/* Statistical Leaders & Cap Contenders */}
            <section className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold block font-mono">
                      {isNe ? "लिडरबोर्ड तथा उच्च प्रदर्शनकर्ता" : "Tournament Honors & Leaderboard"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] px-1.5 py-0.5 font-bold border border-emerald-500/20">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {nplResultUpdates.length} {isNe ? "खेलको नतिजा" : "confirmed results"}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {isNe ? "सिजन ३ नतिजा र खेलाडी तथ्याङ्क" : "Season 3 Results & Player Stats"}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center rounded-md bg-muted/40 p-0.5 border border-border/60">
                    <button
                      onClick={() => setLeaderboardMode("tournament")}
                      className={`px-3 py-1 text-xs font-semibold rounded transition ${
                        leaderboardMode === "tournament"
                          ? "bg-background text-foreground shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isNe ? "पुष्टि भएका नतिजा" : "Confirmed results"}
                    </button>
                    <button
                      onClick={() => setLeaderboardMode("career")}
                      className={`px-3 py-1 text-xs font-semibold rounded transition ${
                        leaderboardMode === "career"
                          ? "bg-background text-foreground shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isNe ? "करियर तथ्याङ्क" : "Career T20 Overall"}
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveTab("players")}
                    className="text-xs font-medium text-foreground hover:text-primary transition hidden sm:flex items-center gap-1 underline underline-offset-4 ml-2"
                  >
                    {isNe ? `सबै ${players.length} खेलाडी` : `All ${players.length} Players`}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {leaderboardMode === "tournament" && <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {nplResultUpdates.map(result => <a key={result.matchNumber} href={result.sourceUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border bg-card p-5 hover:bg-muted/40 transition">
                    <p className="text-xs text-muted-foreground">{isNe ? 'खेल' : 'Match'} #{result.matchNumber} · {result.matchDate}</p>
                    {[result.teamId, result.opponentId].map((id, index) => { const team = teams.find(team => team.id === id); return <div key={id} className="mt-4 flex items-center gap-3"><Image src={team?.logo || ''} alt="" width={32} height={32} className="object-contain" /><span className="min-w-0 flex-1 text-sm font-semibold">{isNe ? team?.nameNe : team?.name}</span><span className="text-xs font-mono">{index ? result.opponentScore : result.teamScore}</span></div>; })}
                    <p className="mt-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{isNe ? result.resultNe : result.result}</p>
                    <p className="mt-3 text-xs text-muted-foreground underline">{isNe ? 'स्रोत हेर्नुहोस्' : 'View source'} ↗</p>
                  </a>)}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{isNe ? 'सबै खेलको पूर्ण व्यक्तिगत तथ्याङ्क पुष्टि भएपछि उच्च रनकर्ता र विकेट लिने खेलाडीको सूची थपिनेछ।' : 'Season batting and bowling leaders will be published after complete player statistics for all completed matches are verified.'}</p>
              </div>}

              {leaderboardMode === "career" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* 1. Orange Cap / Top Batters */}
                  <div className="rounded-lg border border-border bg-card overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                          {isNe ? "अरेन्ज क्याप (उच्च रनकर्ता)" : "Orange Cap Leaders"}
                        </h3>
                        <span className="text-[10px] text-muted-foreground">Top Run-Getters</span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">T20 Runs</span>
                    </div>

                    <div className="divide-y divide-border">
                      {topBatters.map((p, idx) => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPlayer(p)}
                          className="p-3 flex items-center justify-between hover:bg-muted/30 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-muted-foreground tabular-nums w-4">
                              #{idx + 1}
                            </span>
                            <div className="relative h-9 w-9 shrink-0 rounded bg-muted/20 overflow-hidden border border-border/60">
                              <Image src={p.image.thumbnail} alt={p.name} fill className="object-contain" />
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-foreground hover:text-primary transition leading-tight">
                                {isNe ? p.nameNe : p.name}
                              </h4>
                              <span className="text-[10px] text-muted-foreground block">
                                {p.teamName} · {p.origin}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <strong className="text-sm font-bold text-foreground block leading-tight tabular-nums">
                              {p.stats.runs ?? "—"}
                            </strong>
                            <span className="text-[10px] text-muted-foreground tabular-nums">
                              SR {p.stats.strikeRate ?? "-"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                {/* 2. Purple Cap / Top Bowlers */}
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        {isNe ? "पर्पल क्याप (उच्च विकेटकर्ता)" : "Purple Cap Leaders"}
                      </h3>
                      <span className="text-[10px] text-muted-foreground">Strike Bowlers</span>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">Wickets</span>
                  </div>

                  <div className="divide-y divide-border">
                    {topBowlers.map((p, idx) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlayer(p)}
                        className="p-3 flex items-center justify-between hover:bg-muted/30 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground tabular-nums w-4">
                            #{idx + 1}
                          </span>
                          <div className="relative h-9 w-9 shrink-0 rounded bg-muted/20 overflow-hidden border border-border/60">
                            <Image src={p.image.thumbnail} alt={p.name} fill className="object-contain" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-foreground hover:text-primary transition leading-tight">
                              {isNe ? p.nameNe : p.name}
                            </h4>
                            <span className="text-[10px] text-muted-foreground block">
                              {p.teamName} · {p.origin}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <strong className="text-sm font-bold text-foreground block leading-tight tabular-nums">
                            {p.stats.wickets ?? "—"} W
                          </strong>
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {p.stats.economy ? `Econ ${p.stats.economy}` : `${p.stats.matches ?? "—"} M`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. MVP All-Rounders */}
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        {isNe ? "करियर अलराउन्डर तथ्याङ्क" : "Career All-Rounders"}
                      </h3>
                      <span className="text-[10px] text-muted-foreground">Career T20 runs and wickets</span>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">Runs / Wkts</span>
                  </div>

                  <div className="divide-y divide-border">
                    {topAllRounders.map((p, idx) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlayer(p)}
                        className="p-3 flex items-center justify-between hover:bg-muted/30 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground tabular-nums w-4">
                            #{idx + 1}
                          </span>
                          <div className="relative h-9 w-9 shrink-0 rounded bg-muted/20 overflow-hidden border border-border/60">
                            <Image src={p.image.thumbnail} alt={p.name} fill className="object-contain" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-foreground hover:text-primary transition leading-tight">
                              {isNe ? p.nameNe : p.name}
                            </h4>
                            <span className="text-[10px] text-muted-foreground block">
                              {p.teamName} · {p.origin}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <strong className="text-sm font-bold text-foreground block leading-tight tabular-nums">
                            {p.stats.runs ?? "—"} R · {p.stats.wickets ?? "—"} W
                          </strong>
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {p.stats.highestScore ? `HS ${p.stats.highestScore}` : `${p.stats.matches ?? "—"} M`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
          </div>
        )}

        {/* TAB 2: FRANCHISES */}
        {activeTab === "franchises" && (
          <div className="space-y-6">
            <div className="border-b border-border pb-3">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold block">
                {isNe ? "टिम विवरण" : "Franchise Dossiers"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {isNe ? "८ वटै टिमको सम्पूर्ण विवरण र तथ्याङ्क" : "Official NPL Season 3 Franchises"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teams.map((t) => (
                <div
                  key={t.id}
                  className="rounded-lg border border-border bg-card overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0 rounded bg-muted/20 p-1.5 border border-border/60">
                          <Image src={t.logo} alt={t.name} fill className="object-contain p-0.5" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
                            {isNe ? t.nameNe : t.name}
                          </h3>
                          <span className="text-xs text-muted-foreground block mt-0.5">
                            {t.owner}
                          </span>
                          <span className="text-xs text-muted-foreground block mt-1">
                            Auction Bid: <strong className="text-foreground">{t.bidPriceNpr}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <dl className="mt-5 grid grid-cols-2 gap-3 text-xs bg-muted/20 p-3.5 rounded border border-border">
                      <div>
                        <dt className="text-muted-foreground text-[10px] font-semibold uppercase">Captain</dt>
                        <dd className="text-foreground font-semibold text-sm mt-0.5">{t.captain}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground text-[10px] font-semibold uppercase">Head Coach</dt>
                        <dd className="text-foreground font-medium text-sm mt-0.5">{t.coach}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground text-[10px] font-semibold uppercase">Domestic Marquee</dt>
                        <dd className="text-foreground font-medium mt-0.5">{t.marqueePlayer}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground text-[10px] font-semibold uppercase">Overseas Star</dt>
                        <dd className="text-foreground font-medium mt-0.5 truncate">{t.overseasStar}</dd>
                      </div>
                    </dl>

                    <div className="mt-5">
                      <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
                        Squad Highlights ({t.players.length} Players)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {t.players.slice(0, 7).map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedPlayer(p)}
                            className="rounded border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition"
                          >
                            {isNe ? p.nameNe : p.name}
                          </button>
                        ))}
                        {t.players.length > 7 && (
                          <button
                            onClick={() => {
                              setSelectedTeamFilter(t.id);
                              setActiveTab("players");
                            }}
                            className="rounded border border-dashed border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground transition font-mono"
                          >
                            +{t.players.length - 7} more
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 px-6 py-3 border-t border-border flex items-center justify-between text-xs">
                    <a
                      href={t.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition flex items-center gap-1 font-medium"
                    >
                      Official Portal <ExternalLink className="h-3 w-3" />
                    </a>
                    <Link
                      href={`/npl/teams/${t.id}`}
                      className="font-medium text-foreground hover:text-primary transition flex items-center gap-1 underline underline-offset-4"
                    >
                      <span>Full Squad Roster</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PLAYERS EXPLORER */}
        {activeTab === "players" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-3">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold block">
                  {isNe ? "खेलाडी रोस्टर र तथ्याङ्क" : "Official Player Dossier"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {isNe ? `सबै ${players.length} खेलाडीहरूको प्रोफाइल र तथ्याङ्क` : `Explore All ${players.length} Player Profiles`}
                </h2>
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                Showing <strong className="text-foreground">{filteredPlayers.length}</strong> of {players.length} players
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-3.5">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isNe ? "खेलाडी, टिम वा देशको नाम खोज्नुहोस्..." : "Search players by name, team, country, or role..."}
                    className="w-full rounded-md border border-border bg-background pl-10 pr-9 py-2 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Compact Role Selector */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: "all", label: "All Roles" },
                    { id: "batter", label: "Batters" },
                    { id: "bowler", label: "Bowlers" },
                    { id: "allrounder", label: "All-Round" },
                    { id: "wicketkeeper", label: "Keepers" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRoleFilter(r.id)}
                      className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition ${
                        selectedRoleFilter === r.id
                          ? "bg-foreground text-background font-semibold"
                          : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team Franchise Selector Strip WITH LOGOS */}
              <div className="pt-2 border-t border-border/60">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                  <button
                    onClick={() => setSelectedTeamFilter("all")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap border transition shrink-0 ${
                      selectedTeamFilter === "all"
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/50"
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>All Franchises (8)</span>
                  </button>

                  {teams.map((t) => {
                    const isSelected = selectedTeamFilter === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTeamFilter(t.id)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-semibold whitespace-nowrap border transition shrink-0 ${
                          isSelected
                            ? "bg-foreground text-background border-foreground"
                            : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/50"
                        }`}
                      >
                        <div className="relative h-4 w-4 shrink-0">
                          <Image src={t.logo} alt={t.name} fill className="object-contain" />
                        </div>
                        <span>{isNe ? t.nameNe : t.short}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Sub-Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mr-1 shrink-0">
                  Tier:
                </span>
                {[
                  { id: "all", label: "All Squads" },
                  { id: "marquee", label: "Marquee Icons" },
                  { id: "overseas", label: "Overseas Stars" },
                  { id: "retained", label: "Retained" },
                  { id: "auction", label: "Auction Bids" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategoryFilter(c.id)}
                    className={`px-2 py-0.5 rounded text-[11px] transition whitespace-nowrap ${
                      selectedCategoryFilter === c.id
                        ? "bg-foreground text-background font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}

                {(selectedTeamFilter !== "all" || selectedRoleFilter !== "all" || selectedCategoryFilter !== "all" || searchQuery) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTeamFilter("all");
                      setSelectedRoleFilter("all");
                      setSelectedCategoryFilter("all");
                    }}
                    className="ml-auto text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 shrink-0"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            </div>

            {/* Players Grid with Team Logos on Every Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {filteredPlayers.map((player) => {
                const playerTeam = teams.find((t) => t.id === player.teamId);
                const teamLogo = playerTeam?.logo || `/studio/cricket/${player.teamId}.png`;

                return (
                  <div
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className="group relative cursor-pointer rounded-lg border border-border bg-card hover:border-foreground/80 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                  >
                    {/* Portrait Frame with anchored cutout & team crest */}
                    <div className="relative h-44 sm:h-48 w-full bg-gradient-to-b from-muted/30 to-muted/10 flex items-end justify-center overflow-hidden p-2">
                      <Image
                        src={player.image.thumbnail}
                        alt={player.name}
                        fill
                        className="object-contain object-bottom p-1 drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Corner Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {player.isCaptain && (
                          <span className="text-[9px] font-bold text-foreground bg-background/95 px-1.5 py-0.5 border border-border rounded uppercase">
                            Captain
                          </span>
                        )}
                        {player.isMarquee && (
                          <span className="text-[9px] font-bold text-amber-500 bg-background/95 px-1.5 py-0.5 border border-amber-500/30 rounded uppercase">
                            Marquee
                          </span>
                        )}
                      </div>

                      {/* Official Team Crest at Top Right */}
                      <div className="absolute top-2 right-2 relative h-6 w-6 shrink-0 rounded bg-background/95 p-0.5 border border-border/60 shadow-xs">
                        <Image
                          src={teamLogo}
                          alt={player.teamName}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>

                    {/* Player Information & Stats */}
                    <div className="p-3 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                        <span className="truncate">{player.origin}</span>
                        <span className="truncate font-medium text-foreground/80 ml-1">{playerTeam?.short || player.teamName}</span>
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
                          <strong className="font-semibold text-foreground tabular-nums text-xs">{player.stats.matches ?? "—"}</strong>
                        </div>
                        <div className="border-x border-border/60">
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">Runs</span>
                          <strong className="font-semibold text-foreground tabular-nums text-xs">{player.stats.runs ?? "—"}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">
                            {(player.stats.wickets ?? 0) > 0 ? "Wkts" : "SR"}
                          </span>
                          <strong className="font-semibold text-foreground tabular-nums text-xs">
                            {(player.stats.wickets ?? 0) > 0 ? player.stats.wickets : (player.stats.strikeRate || "-")}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredPlayers.length === 0 && (
              <div className="rounded-lg border border-border bg-card/60 p-12 text-center text-muted-foreground space-y-2">
                <p className="text-base font-semibold text-foreground">No players matched your active search or filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTeamFilter("all");
                    setSelectedRoleFilter("all");
                    setSelectedCategoryFilter("all");
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FIXTURES */}
        {activeTab === "fixtures" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
                  {isNe ? "खेल तालिका र नतिजा" : "Tournament Schedule & Venues"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {isNe ? "३२ म्याचहरूको खेल तालिका" : "All 32 Official NPL Season 3 Fixtures"}
                </h2>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {[
                  { id: "all", label: "All Matches (32)" },
                  { id: "league", label: "League Phase (28)" },
                  { id: "playoffs", label: "Playoffs (4)" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setFixtureStageFilter(s.id as any)}
                    className={`px-3 py-1 rounded text-xs font-mono uppercase transition whitespace-nowrap ${
                      fixtureStageFilter === s.id
                        ? "bg-foreground text-background font-bold"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* League Stage Fixtures */}
            {(fixtureStageFilter === "all" || fixtureStageFilter === "league") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    Round-Robin League Stage (Matches 1 to 28)
                  </h3>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Tribhuvan University Ground, Kirtipur
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {fixtures.map((f) => {
                    const t1 = teams.find((t) => t.id === f.teamId);
                    const t2 = teams.find((t) => t.id === f.opponentId);
                    const logo1 = t1?.logo || `/studio/cricket/${f.teamId}.png`;
                    const logo2 = t2?.logo || `/studio/cricket/${f.opponentId}.png`;
                    const name1 = isNe ? (t1?.nameNe || f.teamId) : (t1?.name || f.teamId);
                    const name2 = isNe ? (t2?.nameNe || f.opponentId) : (t2?.name || f.opponentId);
                    const isCompleted = completedFixture(f, nplCompletedMatches);
                    const scorecard = fixtureScorecard(f, nplCompletedMatches);

                    return (
                      <div
                        key={f.id}
                        className={`rounded-lg border bg-card p-4 flex flex-col justify-between gap-3 transition ${
                          isCompleted
                            ? "border-emerald-500/50 shadow-xs hover:border-emerald-500"
                            : "border-border hover:border-foreground"
                        }`}
                      >
                        {/* Header metadata row */}
                        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground border-b border-border/50 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">
                              Match #{f.matchNumber < 10 ? `0${f.matchNumber}` : f.matchNumber}
                            </span>
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 text-[10px] uppercase font-mono border border-emerald-500/20">
                                <CheckCircle2 className="h-3 w-3" />
                                Completed
                              </span>
                            )}
                          </div>
                          <span>{f.matchDate} · {f.startTime} NPT</span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Tv className="h-3 w-3" />
                            Star Sports HD
                          </span>
                        </div>

                        {/* Matchup row */}
                        <div className="flex items-center justify-between gap-3 py-1">
                          {/* Team 1 */}
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="relative h-10 w-10 shrink-0 rounded bg-muted/20 p-1 border border-border/60">
                              <Image src={logo1} alt={name1} fill className="object-contain p-0.5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs md:text-sm font-semibold truncate block leading-tight text-foreground">
                                {name1}
                              </span>
                              {isCompleted && f.teamScore ? (
                                <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5 tabular-nums">
                                  {f.teamScore}
                                </span>
                              ) : t1?.captain ? (
                                <span className="text-[10px] text-muted-foreground font-mono block truncate">
                                  {t1.captain} (C)
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {/* VS / Result Marker */}
                          <div className="shrink-0 px-2 text-center">
                            <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase bg-muted/30 px-1.5 py-0.5 rounded border border-border/40">
                              {"VS"}
                            </span>
                          </div>

                          {/* Team 2 */}
                          <div className="flex items-center justify-end gap-2.5 min-w-0 flex-1 text-right">
                            <div className="min-w-0">
                              <span className="text-xs md:text-sm font-semibold truncate block leading-tight text-foreground">
                                {name2}
                              </span>
                              {isCompleted && f.opponentScore ? (
                                <span className="text-xs font-mono font-bold text-foreground block mt-0.5 tabular-nums">
                                  {f.opponentScore}
                                </span>
                              ) : t2?.captain ? (
                                <span className="text-[10px] text-muted-foreground font-mono block truncate">
                                  {t2.captain} (C)
                                </span>
                              ) : null}
                            </div>
                            <div className="relative h-10 w-10 shrink-0 rounded bg-muted/20 p-1 border border-border/60">
                              <Image src={logo2} alt={name2} fill className="object-contain p-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Completed Match Result & POTM Banner */}
                        {isCompleted && (
                          <div className="rounded bg-muted/30 border border-border/50 p-2 text-xs space-y-1">
                            <p className="font-semibold text-foreground text-[11px]">
                              {isNe ? (f.resultNe || f.result) : f.result}
                            </p>
                            {f.playerOfTheMatch && (
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                                <span className="flex items-center gap-1">
                                  <Award className="h-3 w-3 text-amber-500" />
                                  POTM: <strong className="text-foreground">{isNe ? (f.playerOfTheMatchNe || f.playerOfTheMatch) : f.playerOfTheMatch}</strong> ({f.playerOfTheMatchPerf})
                                </span>
                                <button
                                  disabled={!scorecard}
                                  onClick={() => { if (scorecard) setSelectedScorecardMatch(scorecard); }}
                                  className="text-foreground hover:text-primary font-bold underline underline-offset-2 transition"
                                >
                                  {isNe ? "स्कोरकार्ड हेर्नुहोस्" : "Scorecard"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Venue footnote */}
                        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            TU International Cricket Ground, Kirtipur
                          </span>
                          <span className="shrink-0 text-foreground font-medium">Hawk-Eye DRS</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Playoff Stage */}
            {(fixtureStageFilter === "all" || fixtureStageFilter === "playoffs") && (
              <div className="space-y-4 pt-6 border-t border-border">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
                      Knockout Stage
                    </span>
                    <h3 className="text-lg font-bold tracking-tight text-foreground">
                      Page Playoff Phase & Grand Finale (Matches 29 to 32)
                    </h3>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">TU Ground, Kirtipur</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {playoffs.map((po) => (
                    <div
                      key={po.id}
                      className="rounded-lg border border-border bg-card p-5 relative overflow-hidden flex flex-col justify-between hover:border-foreground transition"
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground pb-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <div className="relative h-6 w-6 shrink-0 rounded bg-muted/20 p-0.5 border border-border/60">
                            <Image src="/studio/cricket/npl-icon.png" alt="NPL" fill className="object-contain" />
                          </div>
                          <span className="font-bold text-sm text-foreground">{po.label}</span>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {po.matchDate} · {po.startTime} NPT
                        </span>
                      </div>

                      <div className="py-4 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">{po.participants}</p>
                          <p className="text-xs text-muted-foreground">
                            Tribhuvan University International Cricket Ground, Kirtipur
                          </p>
                        </div>
                        <div className="h-10 w-10 shrink-0 rounded bg-muted/20 border border-border/60 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-amber-500" />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                        <span>Linear Broadcast: Star Sports HD</span>
                        <span className="text-foreground font-medium">Scheduled playoff</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: STANDINGS & PLAYOFF TREE */}
        {activeTab === "standings" && (
          <div className="space-y-8">
            <div className="border-b border-border pb-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
                {isNe ? "तालिका तथा नकआउट संरचना" : "Calculated League Table & Knockout Pathway"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {isNe ? "एनपीएल अंक तालिका र प्लेअफ संरचना" : "NPL Standings & Page Playoff Pathway"}
              </h2>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">{isNe ? `${nplResultUpdates.length} पुष्टि भएका लिग खेलको नतिजाबाट गणना गरिएको अंक र नेट रन रेट।` : `Points and net run rate calculated from ${nplResultUpdates.length} confirmed league results.`}</p>

            {/* Standings Table in Cricinfo Editorial High-Density Layout */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-muted/20 text-muted-foreground font-mono text-[11px] uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4 w-14">POS</th>
                      <th className="py-3 px-4">Club / Franchise</th>
                      <th className="py-3 px-3 text-center font-mono">P</th>
                      <th className="py-3 px-3 text-center font-mono">W</th>
                      <th className="py-3 px-3 text-center font-mono">L</th>
                      <th className="py-3 px-3 text-center font-mono">T</th>
                      <th className="py-3 px-3 text-center font-mono">NR</th>
                      <th className="py-3 px-4 text-center font-mono font-bold text-foreground">PTS</th>
                      <th className="py-3 px-4 text-right font-mono">NRR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {standings.map((s, idx) => {
                      const t = teams.find((item) => item.id === s.teamId);
                      const isTop2 = idx < 2;
                      const isTop4 = idx < 4;
                      return (
                        <tr
                          key={s.teamId}
                          className="hover:bg-muted/30 transition"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-sm text-foreground">
                            0{idx + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {t && (
                                <div className="relative h-7 w-7 shrink-0 rounded bg-muted/20 p-0.5 border border-border/60">
                                  <Image src={t.logo} alt={t.name} fill className="object-contain" />
                                </div>
                              )}
                              <div>
                                <span className="font-semibold text-foreground block leading-tight">
                                  {isNe ? t?.nameNe : t?.name}
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground block mt-0.5">
                                  {isTop2
                                    ? "Qualifier 1 Slot (Double Chance)"
                                    : isTop4
                                    ? "Eliminator Slot (Single Knockout)"
                                    : "League Phase Roster"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono">{s.played}</td>
                          <td className="py-3.5 px-3 text-center font-mono text-foreground font-semibold">{s.won}</td>
                          <td className="py-3.5 px-3 text-center font-mono text-muted-foreground">{s.lost}</td>
                          <td className="py-3.5 px-3 text-center font-mono text-muted-foreground">{s.tied}</td>
                          <td className="py-3.5 px-3 text-center font-mono text-muted-foreground">{s.nr}</td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-foreground text-sm">
                            {s.points}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-xs text-muted-foreground">
                            {s.nrr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Playoff Tree Diagram */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="border-b border-border pb-3">
                <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
                  Knockout Blueprint
                </span>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Page Playoff Architecture
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Teams ranked 1st and 2nd receive two opportunities to advance to the Grand Finale, rewarding round-robin dominance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
                <div className="rounded-lg border border-border bg-background p-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                    Match 29 · Nov 17
                  </span>
                  <h4 className="text-base font-bold text-foreground">Qualifier 1</h4>
                  <p className="text-xs text-muted-foreground">1st Place vs 2nd Place</p>
                  <div className="text-[11px] font-mono pt-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    Winner ➔ Grand Finale
                  </div>
                  <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-medium">
                    Loser ➔ Qualifier 2
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-background p-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                    Match 30 · Nov 18
                  </span>
                  <h4 className="text-base font-bold text-foreground">Eliminator</h4>
                  <p className="text-xs text-muted-foreground">3rd Place vs 4th Place</p>
                  <div className="text-[11px] font-mono pt-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    Winner ➔ Qualifier 2
                  </div>
                  <div className="text-[11px] font-mono text-red-600 dark:text-red-400 font-medium">
                    Loser ➔ Eliminated
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-background p-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                    Match 31 · Nov 19
                  </span>
                  <h4 className="text-base font-bold text-foreground">Qualifier 2</h4>
                  <p className="text-xs text-muted-foreground">Loser Q1 vs Winner Eliminator</p>
                  <div className="text-[11px] font-mono pt-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    Winner ➔ Grand Finale
                  </div>
                  <div className="text-[11px] font-mono text-red-600 dark:text-red-400 font-medium">
                    Loser ➔ Eliminated
                  </div>
                </div>

                <div className="rounded-lg border-2 border-foreground bg-background p-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-foreground font-bold block">
                    Match 32 · Nov 21
                  </span>
                  <h4 className="text-base font-bold text-foreground flex items-center gap-1.5">
                    Grand Finale
                  </h4>
                  <p className="text-xs text-muted-foreground">Winner Q1 vs Winner Q2</p>
                  <div className="text-xs font-mono font-bold text-foreground pt-1 flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>NPR 1.50 Crore Champion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: COMMERCIALS & REGULATIONS */}
        {activeTab === "commercials" && (
          <div className="space-y-8">
            <div className="border-b border-border pb-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block">
                {isNe ? "अर्थतन्त्र, बोलकबोल र नियमावली" : "Financials, Commercials & Governance"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {isNe ? "फ्रेन्चाइज बोलकबोल, पुरस्कार राशि र खेल नियमहरू" : "Franchise Auction Bids, Prize Pool & Tournament Regulations"}
              </h2>
            </div>

            {/* Franchise Bids Table */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="p-4 bg-muted/20 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    Franchise Ownership Auction Bids (CAN Official)
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    10-Year Franchise Ownership License Rights
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-foreground">
                  Total Valuation: NPR 16.88 Crore
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-muted/10 text-muted-foreground font-mono text-[11px] uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="py-2.5 px-4">Franchise</th>
                      <th className="py-2.5 px-4">Owner / Corporate Group</th>
                      <th className="py-2.5 px-4 text-right">Winning Bid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {teams
                      .slice()
                      .sort((a, b) => b.bidAmountRaw - a.bidAmountRaw)
                      .map((t) => (
                        <tr key={t.id} className="hover:bg-muted/30 transition">
                          <td className="py-3 px-4 font-semibold text-foreground flex items-center gap-2.5">
                            <div className="relative h-7 w-7 shrink-0 rounded bg-muted/20 p-0.5 border border-border/60">
                              <Image src={t.logo} alt={t.name} fill className="object-contain" />
                            </div>
                            <span>{isNe ? t.nameNe : t.name}</span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-xs">{t.owner}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                            {t.bidPriceNpr}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Squad Rules Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                <div className="border-b border-border pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
                    Roster Composition
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-foreground">
                    Playing XI & Squad Constraints
                  </h3>
                </div>
                <ul className="text-xs md:text-sm text-muted-foreground space-y-2.5 list-disc pl-5">
                  <li><strong>Overseas Players:</strong> Exactly 4 overseas players must feature in every Playing XI (squads permit up to 5-6 international signings).</li>
                  <li><strong>Domestic Marquee:</strong> Each team signs 1 pre-designated national icon.</li>
                  <li><strong>Emerging Talent:</strong> Minimum of one talent-hunt regional player included in matchday rosters.</li>
                  <li><strong>Squad Ceiling:</strong> 16 to 19 total players per franchise.</li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                <div className="border-b border-border pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
                    Umpiring & Adjudication
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-foreground">
                    Match Conditions & Technology
                  </h3>
                </div>
                <ul className="text-xs md:text-sm text-muted-foreground space-y-2.5 list-disc pl-5">
                  <li><strong>DRS Allocation:</strong> 2 player reviews per innings with ball-tracking & UltraEdge.</li>
                  <li><strong>Tie-break:</strong> Super Over decides all tied games immediately.</li>
                  <li><strong>Bouncer Quota:</strong> 2 shoulder-high bouncers permitted per over.</li>
                  <li><strong>Strategic Timeouts:</strong> 2.5 minutes per side during middle overs.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. PLAYER DETAIL MODAL */}
      <AnimatePresence>
        {selectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl rounded-lg border border-border bg-card p-6 md:p-8 shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPlayer(null)}
                className="absolute top-5 right-5 h-8 w-8 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Full Cutout Portrait */}
                <div className="relative h-64 w-52 shrink-0 flex items-center justify-center bg-muted/20 rounded-lg p-2 border border-border">
                  <Image
                    src={selectedPlayer.image.local}
                    alt={selectedPlayer.name}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Profile Details */}
                <div className="flex-1 space-y-3 text-center md:text-left">
                  <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                    <span>{selectedPlayer.teamName}</span>
                    <span>·</span>
                    <span>{selectedPlayer.origin}</span>
                    {selectedPlayer.isCaptain && (
                      <>
                        <span>·</span>
                        <span className="text-foreground font-bold">Captain</span>
                      </>
                    )}
                    {selectedPlayer.isMarquee && (
                      <>
                        <span>·</span>
                        <span className="text-foreground font-bold">Marquee</span>
                      </>
                    )}
                  </div>

                  <div>
                    <h3 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
                      {isNe ? selectedPlayer.nameNe : selectedPlayer.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {selectedPlayer.role}
                    </p>
                  </div>

                  {/* Definition Grid */}
                  <dl className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
                    <div>
                      <dt className="text-muted-foreground font-mono text-[10px] uppercase">Batting Style</dt>
                      <dd className="font-semibold text-foreground mt-0.5">{selectedPlayer.battingStyle || "Right-hand bat"}</dd>
                    </div>
                    {selectedPlayer.bowlingStyle && (
                      <div>
                        <dt className="text-muted-foreground font-mono text-[10px] uppercase">Bowling Style</dt>
                        <dd className="font-semibold text-foreground mt-0.5">{selectedPlayer.bowlingStyle}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-muted-foreground font-mono text-[10px] uppercase">Roster Tier</dt>
                      <dd className="font-semibold text-foreground mt-0.5">{selectedPlayer.category}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground font-mono text-[10px] uppercase">Franchise</dt>
                      <dd className="font-semibold text-foreground mt-0.5">{selectedPlayer.teamName}</dd>
                    </div>
                  </dl>

                  {/* Career Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border text-center">
                    <div className="border border-border rounded p-2 bg-card">
                      <span className="text-[10px] text-muted-foreground font-mono uppercase block">Matches</span>
                      <strong className="text-sm font-mono font-bold">{selectedPlayer.stats.matches}</strong>
                    </div>
                    <div className="border border-border rounded p-2 bg-card">
                      <span className="text-[10px] text-muted-foreground font-mono uppercase block">Runs</span>
                      <strong className="text-sm font-mono font-bold">{selectedPlayer.stats.runs}</strong>
                    </div>
                    <div className="border border-border rounded p-2 bg-card">
                      <span className="text-[10px] text-muted-foreground font-mono uppercase block">Strike Rate</span>
                      <strong className="text-sm font-mono font-bold">{selectedPlayer.stats.strikeRate ?? "-"}</strong>
                    </div>
                    <div className="border border-border rounded p-2 bg-card">
                      <span className="text-[10px] text-muted-foreground font-mono uppercase block">Wickets</span>
                      <strong className="text-sm font-mono font-bold">{selectedPlayer.stats.wickets}</strong>
                    </div>
                  </div>

                  {/* Highlights */}
                  {selectedPlayer.highlights && (
                    <p className="text-xs text-muted-foreground font-serif pt-1 leading-relaxed">
                      "{selectedPlayer.highlights}"
                    </p>
                  )}

                  {/* Link to Full Player Dossier */}
                  <div className="pt-3 border-t border-border">
                    <Link
                      href={`/npl/players/${selectedPlayer.id}`}
                      className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-4 py-2.5 text-xs md:text-sm font-semibold hover:opacity-90 transition w-full justify-center"
                    >
                      <span>{isNe ? "विस्तृत प्रोफाइल तथा आधिकारिक तथ्याङ्क हेर्नुहोस्" : "View Official Player Profile & Career Statistics"}</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. TEAM DETAIL MODAL */}
      <AnimatePresence>
        {selectedTeamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card p-6 md:p-8 shadow-2xl"
            >
              <button
                onClick={() => setSelectedTeamModal(null)}
                className="absolute top-5 right-5 h-8 w-8 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4 pb-6 border-b border-border">
                <div className="relative h-16 w-16 shrink-0 rounded bg-muted/20 p-1.5 border border-border/60">
                  <Image src={selectedTeamModal.logo} alt={selectedTeamModal.name} fill className="object-contain p-0.5" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                    {isNe ? selectedTeamModal.nameNe : selectedTeamModal.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedTeamModal.owner} · Valuation: <strong className="text-foreground font-mono">{selectedTeamModal.bidPriceNpr}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Coach: <span className="text-foreground font-medium">{selectedTeamModal.coach}</span> · Captain: <span className="text-foreground font-medium">{selectedTeamModal.captain}</span>
                  </p>
                </div>
              </div>

              <div className="py-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Registered Squad ({selectedTeamModal.players.length} Players)
                  </h4>
                  <Link
                    href={`/npl/teams/${selectedTeamModal.id}`}
                    className="text-xs font-medium text-foreground hover:text-primary transition underline underline-offset-4 flex items-center gap-1"
                  >
                    <span>Open Full Franchise Page</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {selectedTeamModal.players.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedTeamModal(null);
                        setSelectedPlayer(p);
                      }}
                      className="cursor-pointer rounded-lg border border-border bg-background p-2.5 hover:border-foreground transition text-center flex flex-col items-center justify-between"
                    >
                      <div className="relative h-24 w-20 rounded bg-muted/20 p-1 border border-border/40 overflow-hidden">
                        <Image src={p.image.thumbnail} alt={p.name} fill className="object-contain" />
                      </div>
                      <div className="mt-2 w-full truncate">
                        <span className="text-xs font-semibold leading-tight block truncate text-foreground">
                          {isNe ? p.nameNe : p.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono truncate block mt-0.5">{p.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Match Scorecard Modal */}
      <NplScorecardModal
        scorecard={selectedScorecardMatch}
        onClose={() => setSelectedScorecardMatch(null)}
      />
    </div>
  );
}

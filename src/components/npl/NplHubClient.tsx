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
  Zap
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import type { NplTeamExtended, NplPlayer, NplStanding } from "@/lib/npl-data";
import type { CricketFixture } from "@/lib/post-studio/cricket-fixtures";
import type { NplTeamId } from "@/lib/post-studio/cricket-catalog";
import { nplTournamentMeta } from "@/lib/npl-data";

interface NplHubClientProps {
  teams: NplTeamExtended[];
  players: NplPlayer[];
  fixtures: CricketFixture[];
  playoffs: any[];
  standings: NplStanding[];
}

type TabType = "overview" | "franchises" | "players" | "fixtures" | "standings" | "commercials";

export function NplHubClient({
  teams,
  players,
  fixtures,
  playoffs,
  standings
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
      .filter((p) => p.stats.runs > 0)
      .sort((a, b) => b.stats.runs - a.stats.runs)
      .slice(0, 4);
  }, [players]);

  const topBowlers = React.useMemo(() => {
    return [...players]
      .filter((p) => p.stats.wickets > 0)
      .sort((a, b) => b.stats.wickets - a.stats.wickets)
      .slice(0, 4);
  }, [players]);

  const topAllRounders = React.useMemo(() => {
    return [...players]
      .filter((p) => p.role.toLowerCase().includes("all-round") || (p.stats.runs > 200 && p.stats.wickets > 15))
      .sort((a, b) => (b.stats.runs + b.stats.wickets * 20) - (a.stats.runs + a.stats.wickets * 20))
      .slice(0, 4);
  }, [players]);

  // Next fixture (first upcoming or today's fixture)
  const nextFixture = fixtures[0];
  const nextTeam1 = teams.find((t) => t.id === nextFixture?.teamId);
  const nextTeam2 = teams.find((t) => t.id === nextFixture?.opponentId);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-card via-background to-background pt-8 pb-12 md:pt-12 md:pb-16">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-10 -z-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left max-w-3xl">
              {/* Badges */}
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Flame className="h-3.5 w-3.5 animate-pulse text-amber-500" />
                  {isNe ? "सिजन ३ · प्रत्यक्ष कभरेज" : "Season 3 (2026) · Official Hub"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 text-red-500" />
                  {isNe ? "टियु मैदान, कीर्तिपुर" : "TU Ground, Kirtipur"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 text-blue-500" />
                  {isNe ? nplTournamentMeta.datesNe : nplTournamentMeta.dates}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-bebas text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-none text-foreground uppercase">
                {isNe ? (
                  <>
                    नेपाल प्रिमियर लिग <span className="text-primary">२०२६</span>
                  </>
                ) : (
                  <>
                    Nepal Premier <span className="text-primary">League</span>
                  </>
                )}
              </h1>

              <p className="text-sm md:text-base text-muted-foreground max-w-2xl font-manrope leading-relaxed">
                {isNe
                  ? "नेपालको सबैभन्दा ठूलो क्रिकेट महाकुम्भ। ८ फ्रेन्चाइज टिम, १४५ खेलाडी, ३२ खेल र रु ३ करोड पुरस्कार राशिसहितको सम्पूर्ण विवरण, प्रत्यक्ष खेल तालिका, खेलाडी प्रोफाइल र विश्लेषण।"
                  : "The definitive digital command center for the Nepal Premier League (NPL). Featuring 8 regional franchises, 145 transparent player cutouts, complete 32-match schedule, DRS tracking, and franchise valuations."}
              </p>

              {/* Quick Action Navigation Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <button
                  onClick={() => setActiveTab("franchises")}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs md:text-sm font-semibold text-primary-foreground shadow hover:opacity-95 transition"
                >
                  <Shield className="h-4 w-4" />
                  {isNe ? "८ फ्रेन्चाइज टिमहरू" : "Explore 8 Franchises"}
                </button>
                <button
                  onClick={() => setActiveTab("players")}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-4 py-2.5 text-xs md:text-sm font-medium hover:bg-accent transition"
                >
                  <Users className="h-4 w-4 text-primary" />
                  {isNe ? "खेलाडी रोस्टर (१४५)" : "Squads & Player Stats"}
                </button>
                <button
                  onClick={() => setActiveTab("fixtures")}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-4 py-2.5 text-xs md:text-sm font-medium hover:bg-accent transition"
                >
                  <Calendar className="h-4 w-4 text-amber-500" />
                  {isNe ? "खेल तालिका (३२)" : "32 Match Fixtures"}
                </button>
              </div>
            </div>

            {/* Quick Match Spotlight Card */}
            {nextFixture && nextTeam1 && nextTeam2 && (
              <div className="w-full lg:w-[380px] shrink-0 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md p-5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-amber-500 to-sky-500" />
                
                <div className="flex items-center justify-between text-xs text-muted-foreground pb-3 border-b border-border/60">
                  <span className="font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping inline-block" />
                    {isNe ? "उद्घाटन / मुख्य खेल" : "Featured Match"}
                  </span>
                  <span>{nextFixture.matchDate} · {nextFixture.startTime} NPT</span>
                </div>

                <div className="py-4 flex items-center justify-between">
                  {/* Team 1 */}
                  <div className="flex flex-col items-center gap-2 text-center w-5/12">
                    <div className="relative h-16 w-16 transition-transform group-hover:scale-105">
                      <Image
                        src={nextTeam1.logo}
                        alt={nextTeam1.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-semibold text-xs md:text-sm leading-tight">
                      {isNe ? nextTeam1.nameNe : nextTeam1.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{nextTeam1.captain} (C)</span>
                  </div>

                  {/* VS Emblem */}
                  <div className="flex flex-col items-center justify-center w-2/12">
                    <span className="font-bebas text-2xl text-muted-foreground/60 italic">VS</span>
                    <span className="text-[10px] uppercase font-mono tracking-tighter px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      Match {nextFixture.matchNumber}
                    </span>
                  </div>

                  {/* Team 2 */}
                  <div className="flex flex-col items-center gap-2 text-center w-5/12">
                    <div className="relative h-16 w-16 transition-transform group-hover:scale-105">
                      <Image
                        src={nextTeam2.logo}
                        alt={nextTeam2.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-semibold text-xs md:text-sm leading-tight">
                      {isNe ? nextTeam2.nameNe : nextTeam2.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{nextTeam2.captain} (C)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Tv className="h-3.5 w-3.5 text-sky-500" />
                    Star Sports HD · Action Sports
                  </span>
                  <button
                    onClick={() => setActiveTab("fixtures")}
                    className="font-semibold text-primary hover:underline flex items-center gap-0.5"
                  >
                    {isNe ? "तालिका हेर्नुहोस्" : "All Fixtures"}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { labelEn: "Franchises", labelNe: "फ्रेन्चाइज टिम", val: "8 Teams", icon: Shield, color: "text-amber-500" },
              { labelEn: "Total Squads", labelNe: "कुल खेलाडी", val: `${players.length} Players`, icon: Users, color: "text-blue-500" },
              { labelEn: "Total Battles", labelNe: "कुल म्याच", val: "32 Matches", icon: Flame, color: "text-red-500" },
              { labelEn: "Prize Purse", labelNe: "पुरस्कार राशि", val: "NPR 3.00 Cr", icon: Trophy, color: "text-yellow-500" },
              { labelEn: "Tech & Review", labelNe: "अम्पायरिङ प्रविधि", val: "Hawk-Eye DRS", icon: Sparkles, color: "text-emerald-500" },
              { labelEn: "Global Telecast", labelNe: "विश्वव्यापी प्रसारण", val: "Star Sports", icon: Tv, color: "text-purple-500" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-border/70 bg-card/60 p-3.5 flex items-center gap-3 backdrop-blur-sm"
                >
                  <div className={`rounded-lg bg-background p-2 border border-border/60 ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bebas text-lg leading-none tracking-wide text-foreground">
                      {stat.val}
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                      {isNe ? stat.labelNe : stat.labelEn}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. TAB CONTROLS */}
      <div className="sticky top-[56px] md:top-[64px] z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between gap-4 overflow-x-auto no-scrollbar py-2">
          <div className="flex items-center gap-1.5 min-w-max">
            {[
              { id: "overview", labelEn: "Tournament Overview", labelNe: "सिंहावलोकन", icon: Trophy },
              { id: "franchises", labelEn: "Franchises (8)", labelNe: "८ फ्रेन्चाइजहरू", icon: Shield },
              { id: "players", labelEn: "Player Dossier", labelNe: "खेलाडी प्रोफाइल", icon: Users },
              { id: "fixtures", labelEn: "Fixtures & Results", labelNe: "खेल तालिका", icon: Calendar },
              { id: "standings", labelEn: "Standings & Playoffs", labelNe: "अंक तालिका", icon: Award },
              { id: "commercials", labelEn: "Bids & Regulations", labelNe: "नियम तथा बोलकबोल", icon: Coins },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {isNe ? tab.labelNe : tab.labelEn}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. TAB CONTENT AREAS */}
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-12">
            {/* Headline Global Stars Carousel / Grid */}
            <section className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                    {isNe ? "विश्वस्तरीय सुपरस्टारहरू" : "World Cricket Icons"}
                  </span>
                  <h2 className="font-bebas text-3xl md:text-4xl tracking-tight uppercase">
                    {isNe ? "एनपीएल सिजन ३ का अन्तर्राष्ट्रिय ताराहरू" : "Global Marquee Signings in NPL"}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategoryFilter("overseas");
                    setActiveTab("players");
                  }}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  {isNe ? "सबै विदेशी खेलाडी हेर्नुहोस्" : "View All Overseas Stars"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {players
                  .filter((p) => p.category === "Overseas" && (p.isMarquee || p.stats.matches > 100))
                  .slice(0, 6)
                  .map((player) => (
                    <div
                      key={player.id}
                      onClick={() => setSelectedPlayer(player)}
                      className="group relative cursor-pointer rounded-2xl border border-border/80 bg-card/80 p-3 hover:border-primary/60 transition-all duration-300 hover:shadow-lg flex flex-col items-center text-center overflow-hidden"
                    >
                      <div className="relative h-32 w-full flex items-center justify-center">
                        <Image
                          src={player.image.thumbnail}
                          alt={player.name}
                          fill
                          className="object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
                        />
                      </div>
                      <div className="mt-2 w-full">
                        <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                          {player.origin} · {player.teamName}
                        </span>
                        <h4 className="font-semibold text-xs md:text-sm truncate leading-snug">
                          {isNe ? player.nameNe : player.name}
                        </h4>
                        <span className="text-[11px] text-muted-foreground block truncate">
                          {player.role}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {/* Franchise Cards Grid Preview */}
            <section className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                    {isNe ? "८ प्रदेशीय टिमहरू" : "8 Competing Franchises"}
                  </span>
                  <h2 className="font-bebas text-3xl md:text-4xl tracking-tight uppercase">
                    {isNe ? "नेपाल प्रिमियर लिग टोलीहरू" : "Franchise Roster Summary"}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab("franchises")}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
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
                    className="group relative cursor-pointer rounded-2xl border border-border/80 bg-card/90 p-5 hover:border-primary/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div
                      className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-xl rounded-full pointer-events-none"
                      style={{ backgroundColor: t.primary }}
                    />
                    
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 shrink-0 transition-transform group-hover:scale-105">
                        <Image src={t.logo} alt={t.name} fill className="object-contain" />
                      </div>
                      <div>
                        <h3 className="font-bebas text-xl tracking-wide leading-none group-hover:text-primary transition">
                          {isNe ? t.nameNe : t.name}
                        </h3>
                        <span className="text-[11px] text-muted-foreground block mt-1">
                          {t.bidPriceNpr}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 text-xs space-y-1.5 text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Captain:</span>
                        <strong className="text-foreground">{t.captain}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Head Coach:</span>
                        <span className="text-foreground">{t.coach}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overseas Star:</span>
                        <span className="text-primary truncate max-w-[140px] text-right">{t.overseasStar}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 flex items-center justify-between text-xs font-semibold text-primary group-hover:translate-x-0.5 transition">
                      <span>{t.players.length} Players in Squad</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Tournament Pillar Highlights */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="rounded-2xl border border-border/80 bg-card/70 p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Trophy className="h-5 w-5" />
                </div>
                <h3 className="font-bebas text-2xl tracking-wide uppercase">
                  {isNe ? "रु ३ करोड पुरस्कार राशि" : "NPR 3.00 Crore Prize Pool"}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {isNe
                    ? "विजेताले रु १.५० करोड, उपविजेताले रु ८० लाख, तेस्रो हुनेले रु ४० लाख तथा चौथो हुनेले रु ३० लाख नगद पाउनेछन्। उत्कृष्ट खेलाडीलाई विद्युतीय कार प्रदान गरिनेछ।"
                    : "The champions walk away with NPR 1.50 Crore, while the runners-up claim NPR 80 Lakh. Individual MVP honors include a brand-new electric SUV."}
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card/70 p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-bebas text-2xl tracking-wide uppercase">
                  {isNe ? "हक-आई डिटिएस प्रविधि" : "Full Hawk-Eye DRS Review"}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {isNe
                    ? "प्रत्येक खेलमा अन्तर्राष्ट्रिय मापदण्डको बल-ट्र्याकिङ, अल्ट्रा-एज (स्निकोमिटर) तथा दुई सफल/असफल रिभ्यु प्रणाली लागू गरिएको छ।"
                    : "Every single match features high-speed optical tracking cameras, real-time ball-path trajectory, and UltraEdge snicko with two team reviews per innings."}
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card/70 p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Tv className="h-5 w-5" />
                </div>
                <h3 className="font-bebas text-2xl tracking-wide uppercase">
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
            <section className="space-y-6 pt-2">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                    {isNe ? "लिडरबोर्ड तथा उच्च प्रदर्शनकर्ता" : "Tournament Honors & Leaderboard"}
                  </span>
                  <h2 className="font-bebas text-3xl md:text-4xl tracking-tight uppercase">
                    {isNe ? "अरेन्ज क्याप, पर्पल क्याप तथा एमभीपी दाबेदार" : "Cap Contenders & Statistical Leaders"}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab("players")}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  {isNe ? "सबै १४५ खेलाडी हेर्नुहोस्" : "Browse All 145 Players"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Orange Cap / Top Batters */}
                <div className="rounded-2xl border border-orange-500/30 bg-card/80 p-5 space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-orange-500/15 text-orange-500 flex items-center justify-center font-bold">
                        <Flame className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bebas text-xl leading-none text-foreground">
                          {isNe ? "अरेन्ज क्याप (उच्च रनकर्ता)" : "Orange Cap Contenders"}
                        </h3>
                        <span className="text-[10px] text-muted-foreground">Top Run-Getters</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {topBatters.map((p, idx) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlayer(p)}
                        className="group flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:border-orange-500/50 hover:bg-muted/40 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-muted-foreground w-4">
                            #{idx + 1}
                          </span>
                          <div className="relative h-11 w-11 shrink-0 rounded-lg overflow-hidden bg-background border border-border/60">
                            <Image src={p.image.thumbnail} alt={p.name} fill className="object-contain" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold group-hover:text-primary transition leading-tight">
                              {isNe ? p.nameNe : p.name}
                            </h4>
                            <span className="text-[10px] text-muted-foreground">
                              {p.teamName} · {p.origin}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-sm font-bold text-orange-500 block leading-tight">
                            {p.stats.runs} R
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            SR {p.stats.strikeRate ?? "-"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Purple Cap / Top Bowlers */}
                <div className="rounded-2xl border border-purple-500/30 bg-card/80 p-5 space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-purple-500/15 text-purple-500 flex items-center justify-center font-bold">
                        <Target className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bebas text-xl leading-none text-foreground">
                          {isNe ? "पर्पल क्याप (उच्च विकेटकर्ता)" : "Purple Cap Contenders"}
                        </h3>
                        <span className="text-[10px] text-muted-foreground">Strike Bowlers</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {topBowlers.map((p, idx) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlayer(p)}
                        className="group flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:border-purple-500/50 hover:bg-muted/40 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-muted-foreground w-4">
                            #{idx + 1}
                          </span>
                          <div className="relative h-11 w-11 shrink-0 rounded-lg overflow-hidden bg-background border border-border/60">
                            <Image src={p.image.thumbnail} alt={p.name} fill className="object-contain" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold group-hover:text-primary transition leading-tight">
                              {isNe ? p.nameNe : p.name}
                            </h4>
                            <span className="text-[10px] text-muted-foreground">
                              {p.teamName} · {p.origin}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-sm font-bold text-purple-400 block leading-tight">
                            {p.stats.wickets} W
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {p.stats.economy ? `Econ ${p.stats.economy}` : `${p.stats.matches} M`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. MVP All-Rounders */}
                <div className="rounded-2xl border border-amber-500/30 bg-card/80 p-5 space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bebas text-xl leading-none text-foreground">
                          {isNe ? "एमभीपी / अलराउन्डरहरू" : "Most Valuable All-Rounders"}
                        </h3>
                        <span className="text-[10px] text-muted-foreground">Dual Threat Impact</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {topAllRounders.map((p, idx) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlayer(p)}
                        className="group flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:border-amber-500/50 hover:bg-muted/40 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-muted-foreground w-4">
                            #{idx + 1}
                          </span>
                          <div className="relative h-11 w-11 shrink-0 rounded-lg overflow-hidden bg-background border border-border/60">
                            <Image src={p.image.thumbnail} alt={p.name} fill className="object-contain" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold group-hover:text-primary transition leading-tight">
                              {isNe ? p.nameNe : p.name}
                            </h4>
                            <span className="text-[10px] text-muted-foreground">
                              {p.teamName} · {p.origin}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-xs font-bold text-amber-500 block leading-tight">
                            {p.stats.runs} R · {p.stats.wickets} W
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {p.stats.highestScore ? `HS ${p.stats.highestScore}` : `${p.stats.matches} M`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: FRANCHISES */}
        {activeTab === "franchises" && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                {isNe ? "टिम विवरण" : "Franchise Dossiers"}
              </span>
              <h2 className="font-bebas text-3xl md:text-4xl tracking-tight uppercase">
                {isNe ? "८ वटै टिमको सम्पूर्ण विवरण र तथ्याङ्क" : "Official NPL Season 3 Franchises"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teams.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-border/80 bg-card/90 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 shrink-0">
                          <Image src={t.logo} alt={t.name} fill className="object-contain" />
                        </div>
                        <div>
                          <h3 className="font-bebas text-3xl tracking-tight leading-none text-foreground">
                            {isNe ? t.nameNe : t.name}
                          </h3>
                          <span className="text-xs text-muted-foreground block mt-1">
                            {t.owner}
                          </span>
                          <span className="inline-block mt-2 rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                            Auction Bid: {t.bidPriceNpr}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3.5 rounded-xl border border-border/60">
                      <div>
                        <span className="text-muted-foreground block">Captain:</span>
                        <strong className="text-foreground text-sm font-semibold">{t.captain}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Head Coach:</span>
                        <strong className="text-foreground text-sm font-semibold">{t.coach}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Domestic Marquee:</span>
                        <span className="text-foreground font-medium">{t.marqueePlayer}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Overseas Star:</span>
                        <span className="text-primary font-medium">{t.overseasStar}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Squad Highlights ({t.players.length} Players)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {t.players.slice(0, 7).map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedPlayer(p)}
                            className="rounded-md border border-border/60 bg-background/80 hover:bg-primary hover:text-primary-foreground px-2 py-1 text-[11px] font-medium transition"
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
                            className="rounded-md border border-dashed border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground transition"
                          >
                            +{t.players.length - 7} more
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/40 px-6 py-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <a
                      href={t.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition flex items-center gap-1"
                    >
                      Official Website <ExternalLink className="h-3 w-3" />
                    </a>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/npl/teams/${t.id}`}
                        className="font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        Team Page & Squad <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PLAYERS EXPLORER */}
        {activeTab === "players" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                  {isNe ? "खेलाडी रोस्टर र रेकर्ड" : "Official Player Dossier"}
                </span>
                <h2 className="font-bebas text-3xl md:text-4xl tracking-tight uppercase">
                  {isNe ? "सबै १४५ खेलाडीहरूको प्रोफाइल र तथ्याङ्क" : "Explore All 145 Registered Players"}
                </h2>
              </div>
              <div className="text-xs text-muted-foreground">
                Showing <strong className="text-foreground">{filteredPlayers.length}</strong> of {players.length} players
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="rounded-2xl border border-border/80 bg-card/80 p-4 space-y-3 backdrop-blur-sm shadow-sm">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isNe ? "खेलाडी, टिम वा देशको नाम खोज्नुहोस्..." : "Search players by name, team, country, or role..."}
                  className="w-full rounded-xl border border-border bg-background/90 pl-10 pr-4 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Team Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <span className="text-[11px] font-semibold text-muted-foreground shrink-0 uppercase tracking-wider mr-1">
                  Team:
                </span>
                <button
                  onClick={() => setSelectedTeamFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    selectedTeamFilter === "all"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All (8 Teams)
                </button>
                {teams.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTeamFilter(t.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                      selectedTeamFilter === t.id
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isNe ? t.nameNe : t.short}
                  </button>
                ))}
              </div>

              {/* Role & Category Pills */}
              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-border/60 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Role:
                  </span>
                  {[
                    { id: "all", label: "All Roles" },
                    { id: "batter", label: "Batter" },
                    { id: "bowler", label: "Bowler" },
                    { id: "allrounder", label: "All-rounder" },
                    { id: "wicketkeeper", label: "Wicketkeeper" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRoleFilter(r.id)}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition ${
                        selectedRoleFilter === r.id
                          ? "bg-foreground text-background font-semibold"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap ml-auto">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Category:
                  </span>
                  {[
                    { id: "all", label: "All" },
                    { id: "marquee", label: "Marquee" },
                    { id: "overseas", label: "Overseas" },
                    { id: "retained", label: "Retained" },
                    { id: "auction", label: "Auction" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategoryFilter(c.id)}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition ${
                        selectedCategoryFilter === c.id
                          ? "bg-foreground text-background font-semibold"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className="group relative cursor-pointer rounded-2xl border border-border/80 bg-card/90 p-3 hover:border-primary/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div className="relative h-40 w-full flex items-center justify-center">
                    <Image
                      src={player.image.thumbnail}
                      alt={player.name}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
                    />
                    {player.isCaptain && (
                      <span className="absolute top-1 left-1 rounded bg-amber-500 text-black font-extrabold text-[9px] px-1.5 py-0.5 uppercase tracking-wider">
                        Captain
                      </span>
                    )}
                    {player.isMarquee && (
                      <span className="absolute top-1 right-1 rounded bg-primary text-primary-foreground font-bold text-[9px] px-1.5 py-0.5 uppercase tracking-wider">
                        Marquee
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-center">
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block truncate">
                      {player.teamName}
                    </span>
                    <h3 className="font-semibold text-xs md:text-sm leading-snug truncate group-hover:text-primary transition">
                      {isNe ? player.nameNe : player.name}
                    </h3>
                    <span className="text-[11px] text-muted-foreground block truncate">
                      {player.role}
                    </span>

                    {/* Compact career figures */}
                    <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-around text-[10px] text-muted-foreground">
                      <span>
                        <strong className="text-foreground">{player.stats.matches}</strong> M
                      </span>
                      {player.stats.runs > 0 && (
                        <span>
                          <strong className="text-foreground">{player.stats.runs}</strong> R
                        </span>
                      )}
                      {player.stats.wickets > 0 && (
                        <span>
                          <strong className="text-foreground">{player.stats.wickets}</strong> W
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPlayers.length === 0 && (
              <div className="rounded-2xl border border-border bg-card/60 p-12 text-center text-muted-foreground space-y-2">
                <p className="text-base font-semibold">No players matched your active search or filters.</p>
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
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                  {isNe ? "खेल तालिका" : "Tournament Schedule"}
                </span>
                <h2 className="font-bebas text-3xl md:text-4xl tracking-tight uppercase">
                  {isNe ? "३२ म्याचहरूको खेल तालिका तथा नतिजा" : "All 32 Official NPL Season 3 Fixtures"}
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { id: "all", label: "All Matches" },
                  { id: "league", label: "League Phase (28)" },
                  { id: "playoffs", label: "Playoffs (4)" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setFixtureStageFilter(s.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      fixtureStageFilter === s.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/70 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* League Stage Fixtures */}
            {(fixtureStageFilter === "all" || fixtureStageFilter === "league") && (
              <div className="space-y-3">
                <h3 className="font-bebas text-xl tracking-wide uppercase text-muted-foreground">
                  Round-Robin League Stage (Matches 1 to 28)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fixtures.map((f) => {
                    const t1 = teams.find((t) => t.id === f.teamId);
                    const t2 = teams.find((t) => t.id === f.opponentId);
                    const isDay = f.startTime === "12:30";
                    return (
                      <div
                        key={f.id}
                        className="rounded-xl border border-border/70 bg-card/80 p-4 flex items-center justify-between gap-4 shadow-sm hover:border-primary/50 transition"
                      >
                        <div className="w-16 shrink-0 text-center border-r border-border/60 pr-3">
                          <span className="font-bebas text-xl leading-none text-foreground block">
                            #{f.matchNumber}
                          </span>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">
                            {f.matchDate.replace("2026-", "")}
                          </span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded ${
                            isDay ? "bg-amber-500/10 text-amber-500" : "bg-purple-500/10 text-purple-500"
                          }`}>
                            {f.startTime} NPT
                          </span>
                        </div>

                        <div className="flex-1 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 w-5/12">
                            {t1 && (
                              <div className="relative h-9 w-9 shrink-0">
                                <Image src={t1.logo} alt={t1.name} fill className="object-contain" />
                              </div>
                            )}
                            <span className="text-xs md:text-sm font-semibold truncate leading-tight">
                              {isNe ? t1?.nameNe : t1?.name}
                            </span>
                          </div>

                          <span className="text-xs font-bebas text-muted-foreground/60 italic">VS</span>

                          <div className="flex items-center justify-end gap-2.5 w-5/12 text-right">
                            <span className="text-xs md:text-sm font-semibold truncate leading-tight">
                              {isNe ? t2?.nameNe : t2?.name}
                            </span>
                            {t2 && (
                              <div className="relative h-9 w-9 shrink-0">
                                <Image src={t2.logo} alt={t2.name} fill className="object-contain" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Playoff Stage */}
            {(fixtureStageFilter === "all" || fixtureStageFilter === "playoffs") && (
              <div className="space-y-3 pt-6 border-t border-border">
                <h3 className="font-bebas text-2xl tracking-wide uppercase text-primary">
                  Page Playoff Phase & Grand Finale (Matches 29 to 32)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {playoffs.map((po) => (
                    <div
                      key={po.id}
                      className="rounded-2xl border-2 border-primary/30 bg-card/90 p-5 shadow-lg relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/60">
                        <span className="font-bebas text-lg text-primary tracking-wide">{po.label}</span>
                        <span>{po.matchDate} · 16:30 NPT</span>
                      </div>
                      <div className="py-4">
                        <p className="text-sm font-semibold text-foreground">{po.participants}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tribhuvan University International Cricket Ground, Kirtipur
                        </p>
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
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                {isNe ? "तालिका तथा संरचना" : "Standings & Knockout Pathway"}
              </span>
              <h2 className="font-bebas text-3xl md:text-4xl tracking-tight uppercase">
                {isNe ? "अंक तालिका र प्लेअफ संरचना" : "NPL Standings & Page Playoff Tree"}
              </h2>
            </div>

            {/* Standings Table */}
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border/60">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Team</th>
                      <th className="py-3 px-3 text-center">P</th>
                      <th className="py-3 px-3 text-center">W</th>
                      <th className="py-3 px-3 text-center">L</th>
                      <th className="py-3 px-3 text-center">T</th>
                      <th className="py-3 px-3 text-center">NR</th>
                      <th className="py-3 px-4 text-center font-bold text-foreground">PTS</th>
                      <th className="py-3 px-4 text-right">NRR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {standings.map((s, idx) => {
                      const t = teams.find((item) => item.id === s.teamId);
                      const isTop2 = idx < 2;
                      const isTop4 = idx < 4;
                      return (
                        <tr
                          key={s.teamId}
                          className="hover:bg-accent/40 transition"
                        >
                          <td className="py-3.5 px-4 font-mono font-semibold">
                            <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                              isTop2 ? "bg-primary text-primary-foreground" : isTop4 ? "bg-amber-500/20 text-amber-500" : "text-muted-foreground"
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {t && (
                                <div className="relative h-7 w-7 shrink-0">
                                  <Image src={t.logo} alt={t.name} fill className="object-contain" />
                                </div>
                              )}
                              <div>
                                <span className="font-semibold text-foreground block">
                                  {isNe ? t?.nameNe : t?.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground block">
                                  {isTop2 ? "Qualifier 1 Slot" : isTop4 ? "Eliminator Slot" : "League Phase"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono">{s.played}</td>
                          <td className="py-3.5 px-3 text-center font-mono">{s.won}</td>
                          <td className="py-3.5 px-3 text-center font-mono">{s.lost}</td>
                          <td className="py-3.5 px-3 text-center font-mono">{s.tied}</td>
                          <td className="py-3.5 px-3 text-center font-mono">{s.nr}</td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-primary text-base">
                            {s.points}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-muted-foreground">
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
            <div className="rounded-2xl border border-border/80 bg-card/60 p-6 space-y-4">
              <h3 className="font-bebas text-2xl tracking-wide uppercase text-primary">
                Page Playoff Architecture
              </h3>
              <p className="text-xs text-muted-foreground">
                Teams ranked 1st and 2nd receive two opportunities to advance to the Grand Finale, rewarding round-robin dominance.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Match 29 · Nov 17</span>
                  <h4 className="font-bebas text-xl">Qualifier 1</h4>
                  <p className="text-xs text-muted-foreground">1st Place vs 2nd Place</p>
                  <div className="text-[11px] text-emerald-500 font-semibold pt-1">Winner ➔ Grand Finale</div>
                  <div className="text-[11px] text-amber-500 font-semibold">Loser ➔ Qualifier 2</div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Match 30 · Nov 18</span>
                  <h4 className="font-bebas text-xl">Eliminator</h4>
                  <p className="text-xs text-muted-foreground">3rd Place vs 4th Place</p>
                  <div className="text-[11px] text-emerald-500 font-semibold pt-1">Winner ➔ Qualifier 2</div>
                  <div className="text-[11px] text-red-500 font-semibold">Loser ➔ Eliminated</div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Match 31 · Nov 19</span>
                  <h4 className="font-bebas text-xl">Qualifier 2</h4>
                  <p className="text-xs text-muted-foreground">Loser Q1 vs Winner Eliminator</p>
                  <div className="text-[11px] text-emerald-500 font-semibold pt-1">Winner ➔ Grand Finale</div>
                  <div className="text-[11px] text-red-500 font-semibold">Loser ➔ Eliminated</div>
                </div>

                <div className="rounded-xl border-2 border-primary bg-primary/5 p-4 space-y-2 shadow-lg">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Match 32 · Nov 21</span>
                  <h4 className="font-bebas text-2xl text-primary">Grand Finale</h4>
                  <p className="text-xs text-muted-foreground">Winner Q1 vs Winner Q2</p>
                  <div className="text-xs font-bold text-foreground pt-1 flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    NPR 1.50 Crore Champion
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: COMMERCIALS & REGULATIONS */}
        {activeTab === "commercials" && (
          <div className="space-y-8">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                {isNe ? "अर्थतन्त्र र नियमावली" : "Financials & Governance"}
              </span>
              <h2 className="font-bebas text-3xl md:text-4xl tracking-tight uppercase">
                {isNe ? "फ्रेन्चाइज बोलकबोल, पुरस्कार राशि र खेल नियमहरू" : "NPL Commercials, Bidding & Playing Rules"}
              </h2>
            </div>

            {/* Franchise Bids Table */}
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
              <div className="p-4 bg-muted/40 border-b border-border/60 flex items-center justify-between">
                <span className="font-semibold text-sm">Franchise Ownership Auction Bids (CAN Official)</span>
                <span className="font-mono text-xs font-bold text-primary">Total: NPR 16.88 Crore</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-muted/20 text-muted-foreground border-b border-border/60">
                    <tr>
                      <th className="py-2.5 px-4">Franchise</th>
                      <th className="py-2.5 px-4">Owner / Promoter</th>
                      <th className="py-2.5 px-4 text-right">Winning Bid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {teams
                      .slice()
                      .sort((a, b) => b.bidAmountRaw - a.bidAmountRaw)
                      .map((t) => (
                        <tr key={t.id} className="hover:bg-accent/40 transition">
                          <td className="py-3 px-4 font-semibold text-foreground flex items-center gap-2">
                            <div className="relative h-6 w-6 shrink-0">
                              <Image src={t.logo} alt={t.name} fill className="object-contain" />
                            </div>
                            {isNe ? t.nameNe : t.name}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{t.owner}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-primary">
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
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-bebas text-2xl tracking-wide uppercase text-foreground">
                  Playing XI & Squad Constraints
                </h3>
                <ul className="text-xs md:text-sm text-muted-foreground space-y-2.5 list-disc pl-5">
                  <li><strong>Overseas Players:</strong> Exactly 4 overseas players must feature in every Playing XI (squads permit up to 5-6 international signings).</li>
                  <li><strong>Domestic Marquee:</strong> Each team signs 1 pre-designated national icon.</li>
                  <li><strong>Emerging Talent:</strong> Minimum of one talent-hunt regional player included in matchday rosters.</li>
                  <li><strong>Squad Ceiling:</strong> 16 to 19 total players per franchise.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-bebas text-2xl tracking-wide uppercase text-foreground">
                  Match Conditions & Technology
                </h3>
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
              className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPlayer(null)}
                className="absolute top-5 right-5 h-8 w-8 rounded-full border border-border bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Full Cutout */}
                <div className="relative h-64 w-52 shrink-0 flex items-center justify-center bg-gradient-to-b from-primary/10 to-transparent rounded-2xl p-2 border border-border/40">
                  <Image
                    src={selectedPlayer.image.local}
                    alt={selectedPlayer.name}
                    fill
                    className="object-contain drop-shadow-xl"
                  />
                </div>

                {/* Profile Details */}
                <div className="flex-1 space-y-3 text-center md:text-left">
                  <div className="inline-flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      {selectedPlayer.teamName} · {selectedPlayer.origin}
                    </span>
                    {selectedPlayer.isCaptain && (
                      <span className="rounded bg-amber-500 text-black text-[10px] font-extrabold px-1.5 py-0.5 uppercase">
                        Captain
                      </span>
                    )}
                    {selectedPlayer.isMarquee && (
                      <span className="rounded bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 uppercase">
                        Marquee
                      </span>
                    )}
                  </div>

                  <h3 className="font-bebas text-4xl leading-none text-foreground">
                    {isNe ? selectedPlayer.nameNe : selectedPlayer.name}
                  </h3>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div><strong>Role:</strong> {selectedPlayer.role}</div>
                    <div><strong>Batting Style:</strong> {selectedPlayer.battingStyle || "Right-hand bat"}</div>
                    {selectedPlayer.bowlingStyle && (
                      <div><strong>Bowling Style:</strong> {selectedPlayer.bowlingStyle}</div>
                    )}
                    <div><strong>Auction / Roster Tier:</strong> {selectedPlayer.category}</div>
                  </div>

                  {/* Career Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border/60 text-center">
                    <div className="rounded-lg bg-muted/40 p-2">
                      <span className="text-[10px] text-muted-foreground block">Matches</span>
                      <strong className="text-sm font-mono">{selectedPlayer.stats.matches}</strong>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2">
                      <span className="text-[10px] text-muted-foreground block">Runs</span>
                      <strong className="text-sm font-mono">{selectedPlayer.stats.runs}</strong>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2">
                      <span className="text-[10px] text-muted-foreground block">Strike Rate</span>
                      <strong className="text-sm font-mono">{selectedPlayer.stats.strikeRate ?? "-"}</strong>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2">
                      <span className="text-[10px] text-muted-foreground block">Wickets</span>
                      <strong className="text-sm font-mono">{selectedPlayer.stats.wickets}</strong>
                    </div>
                  </div>

                  {/* Highlights */}
                  {selectedPlayer.highlights && (
                    <p className="text-xs text-muted-foreground/90 italic pt-2 leading-relaxed">
                      "{selectedPlayer.highlights}"
                    </p>
                  )}

                  {/* Link to Full Player Dossier */}
                  <div className="pt-4 border-t border-border/60">
                    <Link
                      href={`/npl/players/${selectedPlayer.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs md:text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition w-full justify-center"
                    >
                      <span>{isNe ? "विस्तृत प्रोफाइल तथा ट्रेडिङ कार्ड हेर्नुहोस्" : "Open Full Dossier & Ultimate Team Card"}</span>
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
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl"
            >
              <button
                onClick={() => setSelectedTeamModal(null)}
                className="absolute top-5 right-5 h-8 w-8 rounded-full border border-border bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4 pb-6 border-b border-border/60">
                <div className="relative h-20 w-20 shrink-0">
                  <Image src={selectedTeamModal.logo} alt={selectedTeamModal.name} fill className="object-contain" />
                </div>
                <div>
                  <h3 className="font-bebas text-4xl text-foreground leading-none">
                    {isNe ? selectedTeamModal.nameNe : selectedTeamModal.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedTeamModal.owner} · Valuation: <strong className="text-primary">{selectedTeamModal.bidPriceNpr}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Coach: <span className="text-foreground">{selectedTeamModal.coach}</span> · Captain: <span className="text-foreground">{selectedTeamModal.captain}</span>
                  </p>
                </div>
              </div>

              <div className="py-6 space-y-4">
                <h4 className="font-bebas text-xl text-primary uppercase">
                  Squad Players ({selectedTeamModal.players.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {selectedTeamModal.players.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedTeamModal(null);
                        setSelectedPlayer(p);
                      }}
                      className="cursor-pointer rounded-xl border border-border/60 bg-muted/20 p-2.5 hover:border-primary transition text-center flex flex-col items-center"
                    >
                      <div className="relative h-24 w-20">
                        <Image src={p.image.thumbnail} alt={p.name} fill className="object-contain drop-shadow" />
                      </div>
                      <span className="text-xs font-semibold leading-tight mt-1 truncate w-full">
                        {isNe ? p.nameNe : p.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate w-full">{p.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

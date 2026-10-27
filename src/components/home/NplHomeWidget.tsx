"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { nplTeams, nplTournamentLogo } from "@/lib/post-studio/cricket-catalog";
import {
  Flame,
  Trophy,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
  Tv,
  ChevronRight,
  MapPin,
  Coins
} from "lucide-react";

interface SpotlightStar {
  id: string;
  name: string;
  nameNe: string;
  team: string;
  teamNe: string;
  teamColor: string;
  role: string;
  image: string;
  metric: string;
  metricLabel: string;
  metricLabelNe: string;
}

const spotlightStars: SpotlightStar[] = [
  {
    id: "rohit-paudel",
    name: "Rohit Paudel",
    nameNe: "रोहित पौडेल",
    team: "Lumbini Lions",
    teamNe: "लुम्बिनी लायन्स",
    teamColor: "#F1C64C",
    role: "National Captain & Marquee",
    image: "/studio/cricket/players/rohit-paudel.webp",
    metric: "1,400+ T20 Runs",
    metricLabel: "Leading T20I Run Scorer",
    metricLabelNe: "उच्च रनकर्ता",
  },
  {
    id: "sandeep-lamichhane",
    name: "Sandeep Lamichhane",
    nameNe: "सन्दैप लामिछाने",
    team: "Biratnagar Kings",
    teamNe: "विराटनगर किङ्स",
    teamColor: "#2C72D9",
    role: "Marquee Leg-spinner",
    image: "/studio/cricket/players/sandeep-lamichhane.webp",
    metric: "135+ T20I Wkts",
    metricLabel: "Global T20 Icon",
    metricLabelNe: "विश्वस्तरीय स्पिनर",
  },
  {
    id: "dipendra-singh-airee",
    name: "Dipendra Singh Airee",
    nameNe: "दीपेन्द्र सिंह ऐरी",
    team: "Sudurpaschim Royals",
    teamNe: "सुदूरपश्चिम रोयल्स",
    teamColor: "#FFCC39",
    role: "Elite All-rounder",
    image: "/studio/cricket/players/dipendra-singh-airee.webp",
    metric: "Fastest 50 (9 balls)",
    metricLabel: "World Record Holder",
    metricLabelNe: "विश्व कीर्तिमानी",
  },
  {
    id: "kushal-bhurtel",
    name: "Kushal Bhurtel",
    nameNe: "कुशल भुर्तेल",
    team: "Pokhara Avengers",
    teamNe: "पोखरा एभेन्जर्स",
    teamColor: "#BE1E4A",
    role: "Explosive Opener & Captain",
    image: "/studio/cricket/players/kushal-bhurtel.webp",
    metric: "1,150+ T20 Runs",
    metricLabel: "Dynamic Top-Order",
    metricLabelNe: "आक्रामक ओपनर",
  },
];

export function NplHomeWidget() {
  const { language } = useLanguage();
  const isNe = language === "ne";
  const [activeStarIndex, setActiveStarIndex] = React.useState(0);

  // Auto-cycle through marquee stars every 4.5 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveStarIndex((prev) => (prev + 1) % spotlightStars.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const activeStar = spotlightStars[activeStarIndex];

  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-card/90 via-background to-background py-10 md:py-14">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 -z-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top Header Badge & Live Alert */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/70">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 rounded-xl bg-primary/10 border border-primary/20 p-1 flex items-center justify-center">
              <Image
                src={nplTournamentLogo}
                alt="NPL Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                <Flame className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                <span>{isNe ? "एनपीएल सिजन ३ · २०२६" : "NPL Season 3 (2026) · Official Hub"}</span>
              </div>
              <h2 className="font-bebas text-2xl sm:text-3xl tracking-tight text-foreground uppercase">
                {isNe ? "नेपाल प्रिमियर लिग विशेष" : "Nepal Premier League Headquarters"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/npl"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs md:text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition"
            >
              <span>{isNe ? "सम्पूर्ण एनपीएल हब खोल्नुहोस्" : "Enter NPL 2026 Hub"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Center Grid: Left spotlight & Right details */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Star Spotlight (5 cols) */}
          <div className="lg:col-span-5 relative rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 overflow-hidden flex flex-col justify-between min-h-[380px]">
            {/* Dynamic ambient color behind the cutout */}
            <div
              className="absolute -top-12 -right-12 h-64 w-64 rounded-full opacity-20 blur-2xl transition-colors duration-700 pointer-events-none"
              style={{ backgroundColor: activeStar.teamColor }}
            />

            {/* Header info */}
            <div className="flex items-center justify-between z-10">
              <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/80 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground backdrop-blur-sm">
                <Sparkles className="h-3 w-3 text-amber-500" />
                {isNe ? "मार्वी / स्टार खेलाडी" : "Marquee Spotlight"}
              </span>
              <span className="text-[11px] font-mono font-medium text-muted-foreground">
                0{activeStarIndex + 1} / 0{spotlightStars.length}
              </span>
            </div>

            {/* Cutout Image with soft floor shadow */}
            <div className="relative my-2 h-56 w-full flex items-center justify-center z-10">
              <Image
                src={activeStar.image}
                alt={activeStar.name}
                fill
                priority
                className="object-contain drop-shadow-2xl transition-all duration-500 hover:scale-105"
              />
            </div>

            {/* Player details */}
            <div className="z-10 text-center space-y-1">
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: `${activeStar.teamColor}25`, color: activeStar.teamColor }}
              >
                {isNe ? activeStar.teamNe : activeStar.team}
              </div>
              <h3 className="font-bebas text-2xl md:text-3xl tracking-wide text-foreground">
                {isNe ? activeStar.nameNe : activeStar.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {activeStar.role} · <strong className="text-foreground">{activeStar.metric}</strong>
              </p>
            </div>

            {/* Mini Selector Dots */}
            <div className="mt-4 flex items-center justify-center gap-2 z-10">
              {spotlightStars.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStarIndex(idx)}
                  aria-label={`Select ${s.name}`}
                  className={`h-2 rounded-full transition-all ${
                    idx === activeStarIndex
                      ? "w-7 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Tournament Grid & Franchises (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 4 Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 backdrop-blur-sm">
                <Shield className="h-4 w-4 text-amber-500 mb-1.5" />
                <div className="font-bebas text-xl leading-none text-foreground">8 Teams</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {isNe ? "८ फ्रेन्चाइज" : "Franchises"}
                </div>
              </div>

              <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 backdrop-blur-sm">
                <Users className="h-4 w-4 text-blue-500 mb-1.5" />
                <div className="font-bebas text-xl leading-none text-foreground">145 Squads</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {isNe ? "खेलाडीहरू" : "Verified Cutouts"}
                </div>
              </div>

              <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 backdrop-blur-sm">
                <Calendar className="h-4 w-4 text-red-500 mb-1.5" />
                <div className="font-bebas text-xl leading-none text-foreground">32 Clashes</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {isNe ? "खेल तालिका" : "TU Kirtipur"}
                </div>
              </div>

              <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 backdrop-blur-sm">
                <Coins className="h-4 w-4 text-emerald-500 mb-1.5" />
                <div className="font-bebas text-xl leading-none text-foreground">रु ३.०० करोड</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {isNe ? "पुरस्कार राशि" : "Prize Purse"}
                </div>
              </div>
            </div>

            {/* 8 Franchises Crest Strip */}
            <div className="rounded-2xl border border-border/80 bg-card/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  {isNe ? "८ प्रदेशीय फ्रेन्चाइज टिमहरू" : "Official 8 Franchises"}
                </span>
                <Link
                  href="/npl"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
                >
                  {isNe ? "सबै टिम हेर्नुहोस्" : "Browse All"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {nplTeams.map((team) => (
                  <Link
                    key={team.id}
                    href={`/npl/teams/${team.id}`}
                    title={team.name}
                    className="group relative flex flex-col items-center justify-center p-2 rounded-xl border border-border/60 bg-background/80 hover:border-primary/60 hover:bg-accent/40 transition-all duration-200"
                  >
                    <div className="relative h-11 w-11 transition-transform group-hover:scale-110">
                      <Image
                        src={`/studio/cricket/${team.id}.png`}
                        alt={team.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="mt-1 text-[10px] font-bold text-muted-foreground group-hover:text-primary transition truncate max-w-full">
                      {team.short}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Feature Callouts */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-border/70 bg-card/60">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Tv className="h-4 w-4" />
                </div>
                <span>
                  {isNe
                    ? "स्टार स्पोर्ट्स, एक्सन स्पोर्ट्स र हिमालय टिभीबाट प्रत्यक्ष प्रसारण"
                    : "Live Broadcast on Star Sports HD, Action Sports & NetTV OTT"}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/npl"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  {isNe ? "तालिका र खेलाडी विवरण" : "Fixtures & Squads"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

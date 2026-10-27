"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { nplTeams, nplTournamentLogo } from "@/lib/post-studio/cricket-catalog";
import { ArrowRight, ChevronRight, Tv } from "lucide-react";

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
    role: "National Captain & Domestic Marquee",
    image: "/studio/cricket/players/rohit-paudel.webp",
    metric: "1,400+ Runs",
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
    role: "Marquee Leg-Spinner",
    image: "/studio/cricket/players/sandeep-lamichhane.webp",
    metric: "135+ Wkts",
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
    role: "Elite All-Rounder & Vice Captain",
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
    role: "Dynamic Opening Batter & Captain",
    image: "/studio/cricket/players/kushal-bhurtel.webp",
    metric: "1,150+ Runs",
    metricLabel: "Leading Top-Order Anchor",
    metricLabelNe: "आक्रामक ओपनर",
  },
];

export function NplHomeWidget() {
  const { language } = useLanguage();
  const isNe = language === "ne";
  const [activeStarIndex, setActiveStarIndex] = React.useState(0);

  // Auto-cycle through marquee stars every 5 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveStarIndex((prev) => (prev + 1) % spotlightStars.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const activeStar = spotlightStars[activeStarIndex];

  return (
    <section className="border-b border-border bg-card/40 py-10 md:py-14 text-foreground">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Masthead Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-center gap-3.5">
            <div className="relative h-12 w-12 shrink-0 rounded-lg bg-background border border-border p-1.5 flex items-center justify-center">
              <Image
                src={nplTournamentLogo}
                alt="NPL Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-600" />
                <span>{isNe ? "नेपाल प्रिमियर लिग विशेष कभरेज" : "Official Tournament Desk · Season 3 (2026)"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {isNe ? "नेपाल प्रिमियर लिग विशेष" : "Nepal Premier League Headquarters"}
              </h2>
            </div>
          </div>

          <Link
            href="/npl"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:text-primary transition border border-border bg-background px-4 py-2.5 rounded-md hover:bg-accent"
          >
            <span>{isNe ? "सम्पूर्ण एनपीएल हब खोल्नुहोस्" : "Enter Tournament Hub"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Center Grid: Left Spotlight Dossier & Right Tournament Digest */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Player Dossier Frame (5 cols) */}
          <div className="lg:col-span-5 border border-border rounded-lg bg-card p-6 flex flex-col justify-between relative">
            {/* Top Bar inside card */}
            <div className="flex items-center justify-between pb-4 border-b border-border text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
                  Marquee Dossier
                </span>
                <span className="font-semibold text-foreground">
                  {isNe ? activeStar.teamNe : activeStar.team}
                </span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                0{activeStarIndex + 1} / 0{spotlightStars.length}
              </span>
            </div>

            {/* Cutout Portrait with clean neutral framing */}
            <div className="relative my-4 h-60 w-full flex items-center justify-center">
              <Image
                src={activeStar.image}
                alt={activeStar.name}
                fill
                priority
                className="object-contain transition-all duration-500"
              />
            </div>

            {/* Player Information & Metric */}
            <div className="space-y-3 pt-3 border-t border-border">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
                  {isNe ? activeStar.nameNe : activeStar.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeStar.role}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground font-mono uppercase block">
                    {isNe ? activeStar.metricLabelNe : activeStar.metricLabel}
                  </span>
                  <strong className="text-base font-bold text-foreground font-mono">
                    {activeStar.metric}
                  </strong>
                </div>

                <Link
                  href={`/npl/players/${activeStar.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary transition underline underline-offset-4"
                >
                  <span>Full Profile</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Star Selector Tabs */}
            <div className="mt-5 grid grid-cols-4 gap-1.5 pt-3 border-t border-border/60">
              {spotlightStars.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStarIndex(idx)}
                  className={`py-1.5 text-center text-[10px] font-mono uppercase transition border-b-2 ${
                    idx === activeStarIndex
                      ? "border-foreground text-foreground font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Tournament Details & Franchises (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            {/* 4 Key Metrics Definition Grid */}
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 border border-border rounded-lg bg-card">
              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Franchises
                </dt>
                <dd className="text-2xl font-bold text-foreground mt-1 font-mono">
                  8 Teams
                </dd>
                <span className="text-[11px] text-muted-foreground">
                  {isNe ? "८ प्रदेशीय टिम" : "Regional Clubs"}
                </span>
              </div>

              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Squads
                </dt>
                <dd className="text-2xl font-bold text-foreground mt-1 font-mono">
                  145 Rosters
                </dd>
                <span className="text-[11px] text-muted-foreground">
                  {isNe ? "खेलाडी विवरण" : "Verified Cutouts"}
                </span>
              </div>

              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Schedule
                </dt>
                <dd className="text-2xl font-bold text-foreground mt-1 font-mono">
                  32 Matches
                </dd>
                <span className="text-[11px] text-muted-foreground">
                  TU Ground, Kirtipur
                </span>
              </div>

              <div>
                <dt className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Prize Purse
                </dt>
                <dd className="text-2xl font-bold text-foreground mt-1 font-mono">
                  रु ३.०० करोड
                </dd>
                <span className="text-[11px] text-muted-foreground">
                  {isNe ? "विजेता पुरस्कार" : "Prize Fund"}
                </span>
              </div>
            </dl>

            {/* Official 8 Franchises Crest Strip */}
            <div className="border border-border rounded-lg bg-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {isNe ? "८ प्रदेशीय फ्रेन्चाइज टिमहरू" : "Official 8 Franchises"}
                </span>
                <Link
                  href="/npl"
                  className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-0.5 transition"
                >
                  <span>{isNe ? "सबै हेर्नुहोस्" : "Browse All"}</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
                {nplTeams.map((team) => (
                  <Link
                    key={team.id}
                    href={`/npl/teams/${team.id}`}
                    title={team.name}
                    className="group flex flex-col items-center justify-center p-2 rounded border border-border/60 bg-background hover:border-foreground transition text-center"
                  >
                    <div className="relative h-10 w-10 transition-transform group-hover:scale-105">
                      <Image
                        src={`/studio/cricket/${team.id}.png`}
                        alt={team.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="mt-1.5 text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition truncate max-w-full">
                      {team.short}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Broadcast & Official Information */}
            <div className="p-4 rounded-lg border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Tv className="h-4 w-4 text-foreground shrink-0" />
                <span>
                  {isNe
                    ? "स्टार स्पोर्ट्स एचडी, एक्सन स्पोर्ट्स र नेटटिभीबाट प्रत्यक्ष प्रसारण"
                    : "Live Broadcast on Star Sports HD, Action Sports & NetTV OTT"}
                </span>
              </div>

              <Link
                href="/npl"
                className="font-semibold text-foreground hover:text-primary transition inline-flex items-center gap-1 shrink-0"
              >
                <span>{isNe ? "खेल तालिका तथा नतिजा" : "Fixtures & Standings"}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

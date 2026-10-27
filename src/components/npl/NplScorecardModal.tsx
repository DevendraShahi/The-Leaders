"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trophy,
  Award,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Tv,
  Shield,
  Zap,
  Info
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import type { CompletedMatchScorecard } from "@/lib/npl-match-data";

interface NplScorecardModalProps {
  scorecard: CompletedMatchScorecard | null;
  onClose: () => void;
}

export function NplScorecardModal({ scorecard, onClose }: NplScorecardModalProps) {
  const { language } = useLanguage();
  const isNe = language === "ne";
  const [activeInningsTab, setActiveInningsTab] = React.useState<"inn1" | "inn2" | "info">("inn1");

  // Handle ESC key to close
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (scorecard) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [scorecard, onClose]);

  if (!scorecard) return null;

  const { innings1, innings2, playerOfTheMatch } = scorecard;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-4xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                <span className="font-bold text-foreground">
                  Match #{scorecard.matchNumber} · Official Scorecard
                </span>
                <span>•</span>
                <span>{scorecard.matchDate}</span>
                <span>•</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Completed
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                {innings2.teamName} vs {innings1.teamName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{isNe ? scorecard.venueNe : scorecard.venue}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition shrink-0"
              aria-label="Close Scorecard"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Result & POTM Highlights Banner */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-muted/20 to-primary/10 border-b border-border p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Match Result
                  </span>
                </div>
                <p className="text-sm sm:text-base font-bold text-foreground">
                  {isNe ? scorecard.resultNe : scorecard.result}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {isNe ? scorecard.tossNe : scorecard.toss}
                </p>
              </div>

              {/* Player of the Match Card */}
              {playerOfTheMatch && (
                <div className="rounded-lg border border-border/80 bg-card/80 p-2.5 sm:p-3 flex items-center gap-3 shrink-0 shadow-xs">
                  <div className="relative h-11 w-11 shrink-0 rounded bg-muted/40 p-1 border border-border overflow-hidden">
                    <Image
                      src={playerOfTheMatch.image || `/studio/cricket/${playerOfTheMatch.teamId}.png`}
                      alt={playerOfTheMatch.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-amber-500 font-semibold">
                      <Award className="h-3 w-3" />
                      Player of the Match
                    </div>
                    <strong className="text-xs sm:text-sm font-bold text-foreground block leading-tight">
                      {isNe ? playerOfTheMatch.nameNe : playerOfTheMatch.name}
                    </strong>
                    <span className="text-[11px] font-mono text-muted-foreground block tabular-nums">
                      {isNe ? playerOfTheMatch.performanceNe : playerOfTheMatch.performance}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Innings Tabs */}
          <div className="border-b border-border bg-muted/20 px-4 sm:px-5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveInningsTab("inn1")}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeInningsTab === "inn1"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative h-4 w-4 shrink-0 rounded bg-muted p-0.5">
                <Image src={`/studio/cricket/${innings1.teamId}.png`} alt={innings1.teamName} fill className="object-contain" />
              </div>
              <span>{isNe ? innings1.teamNameNe : innings1.teamName}</span>
              <span className="font-mono font-bold tabular-nums text-xs bg-muted/60 px-1.5 py-0.5 rounded">
                {innings1.score} ({innings1.overs} ov)
              </span>
            </button>

            <button
              onClick={() => setActiveInningsTab("inn2")}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeInningsTab === "inn2"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative h-4 w-4 shrink-0 rounded bg-muted p-0.5">
                <Image src={`/studio/cricket/${innings2.teamId}.png`} alt={innings2.teamName} fill className="object-contain" />
              </div>
              <span>{isNe ? innings2.teamNameNe : innings2.teamName}</span>
              <span className="font-mono font-bold tabular-nums text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                {innings2.score} ({innings2.overs} ov)
              </span>
            </button>

            <button
              onClick={() => setActiveInningsTab("info")}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeInningsTab === "info"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Info className="h-4 w-4" />
              <span>{isNe ? "म्याच विवरण र अधिकारी" : "Match Info & Notes"}</span>
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
            {/* INNINGS 1 VIEW */}
            {activeInningsTab === "inn1" && (
              <div className="space-y-6">
                {/* Batting Card */}
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                      {isNe ? "ब्याटिङ विवरण" : "Batting Scorecard"} — {isNe ? innings1.teamNameNe : innings1.teamName}
                    </h3>
                    <span className="text-xs font-mono font-bold text-foreground">
                      RR: {innings1.runRate}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground border-b border-border bg-muted/20">
                        <tr>
                          <th className="py-2 px-3">Batter</th>
                          <th className="py-2 px-2">Dismissal</th>
                          <th className="py-2 px-2 text-right font-mono">R</th>
                          <th className="py-2 px-2 text-right font-mono">B</th>
                          <th className="py-2 px-2 text-right font-mono">4s</th>
                          <th className="py-2 px-2 text-right font-mono">6s</th>
                          <th className="py-2 px-3 text-right font-mono">SR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {innings1.batting.map((b, idx) => (
                          <tr key={idx} className="hover:bg-muted/20 transition">
                            <td className="py-2.5 px-3 font-semibold text-foreground">
                              {isNe ? b.nameNe : b.name}
                              {b.isNotOut && <span className="text-emerald-500 font-bold ml-1">*</span>}
                            </td>
                            <td className="py-2.5 px-2 text-muted-foreground text-[11px] truncate max-w-[200px]">
                              {isNe ? b.dismissalNe : b.dismissal}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono font-bold text-foreground tabular-nums">
                              {b.runs}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-muted-foreground tabular-nums">
                              {b.balls}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-muted-foreground tabular-nums">
                              {b.fours}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-muted-foreground tabular-nums">
                              {b.sixes}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground tabular-nums">
                              {b.strikeRate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Extras & Total Rows */}
                  <div className="mt-3 border-t border-border pt-2.5 text-xs font-mono space-y-1.5 bg-muted/10 p-3 rounded-lg">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Extras</span>
                      <span className="text-foreground font-semibold">
                        {innings1.extras.total} (b {innings1.extras.b}, lb {innings1.extras.lb}, w {innings1.extras.w}, nb {innings1.extras.nb})
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold border-t border-border/60 pt-1.5 text-foreground">
                      <span>Total</span>
                      <span>
                        {innings1.score} ({innings1.overs} Overs, RR {innings1.runRate})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fall of Wickets */}
                {innings1.fow && innings1.fow.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-2">
                      Fall of Wickets
                    </h4>
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                      {innings1.fow.map((item, i) => (
                        <span
                          key={i}
                          className="rounded bg-muted/40 border border-border px-2 py-1 text-muted-foreground"
                        >
                          <strong className="text-foreground">{item.score}</strong> ({item.player}, {item.over} ov)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bowling Card */}
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-2">
                    {isNe ? "बलिङ विवरण" : "Bowling Figures"} — {isNe ? innings2.teamNameNe : innings2.teamName}
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground border-b border-border bg-muted/20">
                        <tr>
                          <th className="py-2 px-3">Bowler</th>
                          <th className="py-2 px-2 text-right font-mono">O</th>
                          <th className="py-2 px-2 text-right font-mono">M</th>
                          <th className="py-2 px-2 text-right font-mono">R</th>
                          <th className="py-2 px-2 text-right font-mono font-bold text-foreground">W</th>
                          <th className="py-2 px-3 text-right font-mono">ECON</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {innings1.bowling.map((bw, idx) => (
                          <tr key={idx} className="hover:bg-muted/20 transition">
                            <td className="py-2.5 px-3 font-semibold text-foreground">
                              {isNe ? bw.nameNe : bw.name}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-muted-foreground tabular-nums">
                              {bw.overs}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-muted-foreground tabular-nums">
                              {bw.maidens}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-muted-foreground tabular-nums">
                              {bw.runs}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono font-bold text-foreground tabular-nums">
                              {bw.wickets}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground tabular-nums">
                              {bw.economy}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* INNINGS 2 VIEW */}
            {activeInningsTab === "inn2" && (
              <div className="space-y-6">
                {/* Batting Card */}
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                      {isNe ? "ब्याटिङ विवरण" : "Batting Scorecard"} — {isNe ? innings2.teamNameNe : innings2.teamName}
                    </h3>
                    <span className="text-xs font-mono font-bold text-foreground">
                      RR: {innings2.runRate}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground border-b border-border bg-muted/20">
                        <tr>
                          <th className="py-2 px-3">Batter</th>
                          <th className="py-2 px-2">Dismissal</th>
                          <th className="py-2 px-2 text-right font-mono">R</th>
                          <th className="py-2 px-2 text-right font-mono">B</th>
                          <th className="py-2 px-2 text-right font-mono">4s</th>
                          <th className="py-2 px-2 text-right font-mono">6s</th>
                          <th className="py-2 px-3 text-right font-mono">SR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {innings2.batting.map((b, idx) => (
                          <tr key={idx} className="hover:bg-muted/20 transition">
                            <td className="py-2.5 px-3 font-semibold text-foreground">
                              {isNe ? b.nameNe : b.name}
                              {b.isNotOut && <span className="text-emerald-500 font-bold ml-1">*</span>}
                            </td>
                            <td className="py-2.5 px-2 text-muted-foreground text-[11px] truncate max-w-[200px]">
                              {isNe ? b.dismissalNe : b.dismissal}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono font-bold text-foreground tabular-nums">
                              {b.runs}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-muted-foreground tabular-nums">
                              {b.balls}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-muted-foreground tabular-nums">
                              {b.fours}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-muted-foreground tabular-nums">
                              {b.sixes}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground tabular-nums">
                              {b.strikeRate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Extras & Total Rows */}
                  <div className="mt-3 border-t border-border pt-2.5 text-xs font-mono space-y-1.5 bg-muted/10 p-3 rounded-lg">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Extras</span>
                      <span className="text-foreground font-semibold">
                        {innings2.extras.total} (b {innings2.extras.b}, lb {innings2.extras.lb}, w {innings2.extras.w}, nb {innings2.extras.nb})
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold border-t border-border/60 pt-1.5 text-foreground">
                      <span>Total</span>
                      <span>
                        {innings2.score} ({innings2.overs} Overs, RR {innings2.runRate})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fall of Wickets */}
                {innings2.fow && innings2.fow.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground mb-2">
                      Fall of Wickets
                    </h4>
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                      {innings2.fow.map((item, i) => (
                        <span
                          key={i}
                          className="rounded bg-muted/40 border border-border px-2 py-1 text-muted-foreground"
                        >
                          <strong className="text-foreground">{item.score}</strong> ({item.player}, {item.over} ov)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bowling Card */}
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-2">
                    {isNe ? "बलिङ विवरण" : "Bowling Figures"} — {isNe ? innings1.teamNameNe : innings1.teamName}
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground border-b border-border bg-muted/20">
                        <tr>
                          <th className="py-2 px-3">Bowler</th>
                          <th className="py-2 px-2 text-right font-mono">O</th>
                          <th className="py-2 px-2 text-right font-mono">M</th>
                          <th className="py-2 px-2 text-right font-mono">R</th>
                          <th className="py-2 px-2 text-right font-mono font-bold text-foreground">W</th>
                          <th className="py-2 px-3 text-right font-mono">ECON</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {innings2.bowling.map((bw, idx) => (
                          <tr key={idx} className="hover:bg-muted/20 transition">
                            <td className="py-2.5 px-3 font-semibold text-foreground">
                              {isNe ? bw.nameNe : bw.name}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-muted-foreground tabular-nums">
                              {bw.overs}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-muted-foreground tabular-nums">
                              {bw.maidens}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-muted-foreground tabular-nums">
                              {bw.runs}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono font-bold text-foreground tabular-nums">
                              {bw.wickets}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground tabular-nums">
                              {bw.economy}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* MATCH INFO VIEW */}
            {activeInningsTab === "info" && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4 bg-muted/10 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    Match Overview & Conditions
                  </h4>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="text-muted-foreground font-mono">Match</dt>
                      <dd className="font-semibold text-foreground">NPL 2026 Match #1 (League Phase)</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground font-mono">Date & Time</dt>
                      <dd className="font-semibold text-foreground">Monday, October 26, 2026 · 16:30 NPT</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground font-mono">Venue</dt>
                      <dd className="font-semibold text-foreground">TU International Cricket Ground, Kirtipur</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground font-mono">Toss</dt>
                      <dd className="font-semibold text-foreground">{scorecard.toss}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground font-mono">Player of the Match</dt>
                      <dd className="font-semibold text-emerald-500 font-bold">
                        {playerOfTheMatch.name} ({playerOfTheMatch.performance})
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground font-mono">DRS Technology</dt>
                      <dd className="font-semibold text-foreground">Hawk-Eye Optical Ball-Tracking & UltraEdge</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-lg border border-border p-4 bg-muted/10 space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    Match Notes & Highlights
                  </h4>
                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                    <li>
                      <strong className="text-foreground">Dominant Chase:</strong> Lumbini Lions hunted down the target of 88 in just 9.5 overs, registering a crushing +4.599 Net Run Rate.
                    </li>
                    <li>
                      <strong className="text-foreground">Opening Fireworks:</strong> Australian international D&apos;Arcy Short hammered 40 off 18 deliveries (4 fours, 3 sixes) at an extraordinary strike rate of 222.22.
                    </li>
                    <li>
                      <strong className="text-foreground">Deadly Spin & Seam Tandem:</strong> Kishore Mahato dismantled the top order with 4/22 in 4.0 overs, while Sher Malla registered a match-winning 3/11 with an economy of 2.75 to earn Player of the Match.
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3 sm:p-4 border-t border-border bg-muted/30 flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Tv className="h-3.5 w-3.5 text-foreground" />
              Official NPL Match Center · Star Sports Network
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-md bg-foreground text-background font-semibold text-xs hover:opacity-90 transition"
            >
              {isNe ? "बन्द गर्नुहोस्" : "Close"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

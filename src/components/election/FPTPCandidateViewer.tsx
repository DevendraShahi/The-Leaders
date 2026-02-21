"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FPTPCandidateDataset } from "@/lib/fptp-candidate-data";
import { useElectionStore } from "@/lib/election-store";
import { getNepaliDistrict } from "@/lib/district-mapping";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, ArrowUpDown, X, ArrowUpRight, ImageIcon, ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import { getFPTPCandidateSlug } from "@/lib/candidate-slug";
import type { PartyRankIndex } from "@/lib/fptp-party-ranking";

type SortField =
  | "partyRank"
  | "candidateName"
  | "district"
  | "constituency"
  | "age";

const GENDER_TO_EN: Record<string, string> = {
  पुरुष: "Male",
  महिला: "Female",
  अन्य: "Other",
};

const DISTRICT_NORMALIZATION: Record<string, string> = {
  काठमाडौं: "काठमाडौँ",
  काठमाडौँ: "काठमाडौँ",
  कञ्चनपुर: "कन्चनपुर",
  कन्चनपुर: "कन्चनपुर",
  तेह्रथुम: "तेर्हथुम",
  तेर्हथुम: "तेर्हथुम",
  इलाम: "ईलाम",
  ईलाम: "ईलाम",
  कपिलवस्तु: "कपिलबस्तु",
  कपिलबस्तु: "कपिलबस्तु",
  रूपन्देही: "रूपन्देही",
  रुपन्देही: "रूपन्देही",
};

function normalizeDistrict(value: string): string {
  const v = value.trim();
  return DISTRICT_NORMALIZATION[v] || v;
}

function compareNullableNumbers(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, "ne");
}

function toNumberLabel(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "-";
  return value.toLocaleString();
}

function formatConstituencySummary(values: number[]): string {
  if (values.length === 0) return "-";
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length <= 4) return sorted.join(", ");
  return `${sorted.slice(0, 4).join(", ")} +${sorted.length - 4}`;
}

interface FPTPCandidateViewerProps {
  dataset: FPTPCandidateDataset;
  partyRankIndex: PartyRankIndex;
}

export function FPTPCandidateViewer({ dataset, partyRankIndex }: FPTPCandidateViewerProps) {
  const { language } = useLanguage();
  const locale = LOCALES.election2026.components.fptpViewer;

  const selectedMapDistrict = useElectionStore((state) => state.selectedDistrict);
  const clearMapDistrict = useElectionStore((state) => state.setSelectedDistrict);

  const [query, setQuery] = useState("");
  const [selectedParty, setSelectedParty] = useState("all");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedConstituency, setSelectedConstituency] = useState("all");
  const [sortField, setSortField] = useState<SortField>("district");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const effectiveMapDistrict = useMemo(() => {
    if (!selectedMapDistrict) return null;
    return normalizeDistrict(getNepaliDistrict(selectedMapDistrict) || selectedMapDistrict);
  }, [selectedMapDistrict]);

  const districtFilterValue =
    selectedDistrict !== "all" ? normalizeDistrict(selectedDistrict) : effectiveMapDistrict;

  const hasFocusedFilter = selectedParty !== "all" || selectedConstituency !== "all";

  const parties = useMemo(() => {
    return Array.from(new Set(dataset.candidates.map((candidate) => candidate.partyName)))
      .filter(Boolean)
      .sort((a, b) => {
        const rankA = partyRankIndex[a]?.rank ?? Number.MAX_SAFE_INTEGER;
        const rankB = partyRankIndex[b]?.rank ?? Number.MAX_SAFE_INTEGER;
        return compareNullableNumbers(rankA, rankB) || compareText(a, b);
      });
  }, [dataset.candidates, partyRankIndex]);
  const provinces = useMemo(() => dataset.lookups.stateNames.filter(Boolean), [dataset.lookups.stateNames]);
  const districts = useMemo(() => {
    return Array.from(new Set(dataset.candidates.map((candidate) => normalizeDistrict(candidate.district))))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "ne"));
  }, [dataset.candidates]);

  const constituencies = useMemo(() => {
    return Array.from(
      new Set(
        dataset.candidates
          .filter((candidate) =>
            districtFilterValue ? normalizeDistrict(candidate.district) === districtFilterValue : true
          )
          .map((candidate) => candidate.constituency)
          .filter((value): value is number => value !== null)
      )
    ).sort((a, b) => a - b);
  }, [dataset.candidates, districtFilterValue]);

  const filteredCandidates = useMemo(() => {
    const q = query.trim().toLowerCase();

    return dataset.candidates.filter((candidate) => {
      if (selectedParty !== "all" && candidate.partyName !== selectedParty) return false;
      if (selectedProvince !== "all" && candidate.province !== selectedProvince) return false;
      if (districtFilterValue && normalizeDistrict(candidate.district) !== districtFilterValue) return false;

      const gender = GENDER_TO_EN[candidate.gender] || candidate.gender;
      if (selectedGender !== "all" && gender !== selectedGender) return false;

      if (
        selectedConstituency !== "all" &&
        String(candidate.constituency ?? "") !== selectedConstituency
      ) {
        return false;
      }

      if (!q) return true;
      const searchable = [
        candidate.candidateName,
        candidate.partyName,
        candidate.district,
        candidate.province,
        String(candidate.constituency ?? ""),
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    });
  }, [
    dataset.candidates,
    districtFilterValue,
    query,
    selectedConstituency,
    selectedGender,
    selectedParty,
    selectedProvince,
  ]);

  const sortedCandidates = useMemo(() => {
    return [...filteredCandidates].sort((a, b) => {
      let comparison = 0;

      const rankA = a.details.rank ?? Number.MAX_SAFE_INTEGER;
      const rankB = b.details.rank ?? Number.MAX_SAFE_INTEGER;
      const districtComparison = compareText(normalizeDistrict(a.district), normalizeDistrict(b.district));
      const constituencyComparison = compareNullableNumbers(a.constituency, b.constituency);

      if (sortField === "district") {
        comparison =
          districtComparison ||
          constituencyComparison ||
          compareNullableNumbers(rankA, rankB) ||
          compareText(a.candidateName || "", b.candidateName || "");
      } else if (sortField === "constituency") {
        comparison =
          districtComparison ||
          constituencyComparison ||
          compareNullableNumbers(rankA, rankB) ||
          compareText(a.candidateName || "", b.candidateName || "");
      } else if (sortField === "partyRank") {
        comparison =
          districtComparison ||
          constituencyComparison ||
          compareNullableNumbers(rankA, rankB) ||
          compareText(a.candidateName || "", b.candidateName || "");
      } else if (sortField === "age") {
        comparison =
          districtComparison ||
          constituencyComparison ||
          compareNullableNumbers(a.age, b.age) ||
          compareText(a.candidateName || "", b.candidateName || "");
      } else {
        comparison =
          districtComparison ||
          constituencyComparison ||
          compareText(String(a[sortField] || ""), String(b[sortField] || "")) ||
          compareNullableNumbers(rankA, rankB);
      }

      return sortDir === "asc" ? comparison : comparison * -1;
    });
  }, [
    filteredCandidates,
    partyRankIndex,
    sortDir,
    sortField,
  ]);

  const groupedCandidates = useMemo(() => {
    const groups = new Map<
      string,
      {
        key: string;
        district: string;
        constituency: number | null;
        constituencies: number[];
        candidates: typeof sortedCandidates;
      }
    >();

    for (const candidate of sortedCandidates) {
      const district = normalizeDistrict(candidate.district);
      const constituency = candidate.constituency;
      const key = hasFocusedFilter ? district : `${district}::${constituency ?? "na"}`;

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          district,
          constituency: hasFocusedFilter ? null : constituency,
          constituencies: [],
          candidates: [],
        });
      }

      const group = groups.get(key)!;
      group.candidates.push(candidate);
      if (constituency !== null && !group.constituencies.includes(constituency)) {
        group.constituencies.push(constituency);
      }
    }

    return Array.from(groups.values());
  }, [hasFocusedFilter, sortedCandidates]);

  useEffect(() => {
    setExpandedGroups((prev) => {
      const validKeys = new Set(groupedCandidates.map((group) => group.key));
      return new Set(Array.from(prev).filter((groupKey) => validKeys.has(groupKey)));
    });
  }, [groupedCandidates]);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  const expandAllGroups = () => {
    setExpandedGroups(new Set(groupedCandidates.map((group) => group.key)));
  };

  const collapseAllGroups = () => {
    setExpandedGroups(new Set());
  };

  const handleReset = () => {
    setQuery("");
    setSelectedParty("all");
    setSelectedProvince("all");
    setSelectedDistrict("all");
    setSelectedGender("all");
    setSelectedConstituency("all");
    setSortField("district");
    setSortDir("asc");
    clearMapDistrict(null);
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-none border border-border/70 bg-card/60 backdrop-blur">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-xl font-sans leading-tight tracking-tight">
            <span>{tString(locale.title, language)}</span>
            <Badge variant="outline" className="rounded-none font-mono text-[10px] uppercase tracking-widest">
              {dataset.stats.totalCandidates.toLocaleString()} {tString(locale.candidates, language)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={tString(locale.searchPlaceholder, language)}
                className="rounded-none pl-9"
              />
            </div>

            <Select
              value={selectedParty}
              onValueChange={setSelectedParty}
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={tString(locale.allParties, language)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tString(locale.allParties, language)}</SelectItem>
                {parties.map((party) => (
                  <SelectItem key={party} value={party}>
                    {party}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedProvince}
              onValueChange={setSelectedProvince}
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={tString(locale.allProvinces, language)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tString(locale.allProvinces, language)}</SelectItem>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedDistrict}
              onValueChange={setSelectedDistrict}
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={tString(locale.allDistricts, language)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tString(locale.allDistricts, language)}</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
            <Select
              value={selectedGender}
              onValueChange={setSelectedGender}
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={tString(locale.allGenders, language)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tString(locale.allGenders, language)}</SelectItem>
                <SelectItem value="Male">{tString(locale.genders.Male, language)}</SelectItem>
                <SelectItem value="Female">{tString(locale.genders.Female, language)}</SelectItem>
                <SelectItem value="Other">{tString(locale.genders.Other, language)}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedConstituency}
              onValueChange={setSelectedConstituency}
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={tString(locale.allConstituencies, language)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tString(locale.allConstituencies, language)}</SelectItem>
                {constituencies.map((constituency) => (
                  <SelectItem key={constituency} value={String(constituency)}>
                    {tString(locale.constituency, language)} {constituency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortField}
              onValueChange={(value) => setSortField(value as SortField)}
            >
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder={tString(locale.sortBy, language)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="district">{tString(locale.sort.district, language)}</SelectItem>
                <SelectItem value="constituency">{tString(locale.sort.constituency, language)}</SelectItem>
                <SelectItem value="candidateName">{tString(locale.sort.name, language)}</SelectItem>
                <SelectItem value="partyRank">{tString(locale.sort.partyRank, language)}</SelectItem>
                <SelectItem value="age">{tString(locale.sort.age, language)}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))}
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {sortDir === "asc"
                ? tString(locale.sortDirection.asc, language)
                : tString(locale.sortDirection.desc, language)}
            </Button>

            <Button variant="ghost" className="rounded-none" onClick={handleReset}>
              <X className="mr-2 h-4 w-4" />
              {tString(locale.reset, language)}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="rounded-none">
              {tString(locale.showing, language)} {sortedCandidates.length.toLocaleString()}{" "}
              {tString(locale.results, language)}
            </Badge>
            {effectiveMapDistrict && (
              <Badge variant="outline" className="rounded-none">
                <MapPin className="mr-1 h-3 w-3" />
                {tString(locale.mapDistrict, language)}: {effectiveMapDistrict}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {sortedCandidates.length === 0 ? (
        <Card className="rounded-none border border-border/70">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-semibold">{tString(locale.emptyTitle, language)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{tString(locale.emptyDesc, language)}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant="secondary" className="rounded-none font-mono text-[10px] uppercase tracking-widest">
                {sortedCandidates.length.toLocaleString()} {tString(locale.candidates, language)}
              </Badge>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none"
                  onClick={expandAllGroups}
                  disabled={groupedCandidates.length === 0 || expandedGroups.size === groupedCandidates.length}
                >
                  {tString(locale.expandAll, language)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none"
                  onClick={collapseAllGroups}
                  disabled={expandedGroups.size === 0}
                >
                  {tString(locale.collapseAll, language)}
                </Button>
              </div>
            </div>

            {groupedCandidates.map((group, groupIndex) => {
              const isExpanded = expandedGroups.has(group.key);
              const panelId = `fptp-group-panel-${groupIndex}`;

              return (
                <section key={group.key} className="space-y-3">
                  <div className="border-y border-border/60 bg-muted/15 px-3 py-2">
                    <button
                      type="button"
                      className="w-full text-left"
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      onClick={() => toggleGroup(group.key)}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="rounded-none font-mono text-[10px] uppercase tracking-widest">
                            {group.district}
                          </Badge>
                          <Badge variant="secondary" className="rounded-none font-mono text-[10px] uppercase tracking-widest">
                            {hasFocusedFilter
                              ? `${tString(locale.constituency, language)}: ${formatConstituencySummary(group.constituencies)}`
                              : group.constituency === null
                                ? tString(locale.allConstituencies, language)
                                : `${tString(locale.constituency, language)} ${group.constituency}`}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                            {group.candidates.length.toLocaleString()} {tString(locale.candidates, language)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                            {isExpanded ? tString(locale.hideGroup, language) : tString(locale.showGroup, language)}
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>

                  {isExpanded && (
                    <div id={panelId} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {group.candidates.map((candidate) => (
                        <Card
                          key={`${candidate.candidateId}-${candidate.sourceSerialNo}-${candidate.candidateName}`}
                          className="group overflow-hidden rounded-none border border-border/70 bg-card/60 backdrop-blur-sm transition-colors hover:border-primary/50"
                        >
                          <div className="relative aspect-[3/4] w-full overflow-hidden border-b border-border/70 bg-gradient-to-b from-muted/30 via-muted/15 to-background/40">
                            {candidate.imageUrl ? (
                              <img
                                src={candidate.imageUrl}
                                alt={candidate.candidateName}
                                className="h-full w-full object-contain object-center p-2 transition-transform duration-500 group-hover:scale-[1.02]"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                <ImageIcon className="h-8 w-8" />
                                <span className="text-xs uppercase tracking-widest">{tString(locale.table.photo, language)}</span>
                              </div>
                            )}
                            <div className="absolute left-3 top-3">
                              <Badge variant="secondary" className="rounded-none border border-border/70 bg-background/85 font-mono text-[10px] uppercase tracking-widest">
                                {candidate.partyName}
                              </Badge>
                            </div>
                            <div className="absolute right-3 top-3">
                              <Badge variant="outline" className="rounded-none border border-primary/50 bg-background/85 font-mono text-[10px] uppercase tracking-widest text-primary">
                                #{candidate.details.rank ?? "-"}
                              </Badge>
                            </div>
                          </div>

                          <CardContent className="space-y-3 p-4">
                            <div>
                              <p className="line-clamp-2 text-base font-semibold leading-tight text-foreground">
                                {candidate.candidateName}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {candidate.district}
                                {candidate.constituency !== null && (
                                  <> • {tString(locale.constituency, language)} {candidate.constituency}</>
                                )}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 border-t border-dashed border-border pt-3 text-xs">
                              <div>
                                <p className="font-mono uppercase tracking-widest text-muted-foreground">{tString(locale.table.gender, language)}</p>
                                <p className="mt-1 text-foreground">{GENDER_TO_EN[candidate.gender] || candidate.gender}</p>
                              </div>
                              <div>
                                <p className="font-mono uppercase tracking-widest text-muted-foreground">{tString(locale.table.province, language)}</p>
                                <p className="mt-1 text-foreground">{candidate.province}</p>
                              </div>
                              <div>
                                <p className="font-mono uppercase tracking-widest text-muted-foreground">{tString(locale.table.age, language)}</p>
                                <p className="mt-1 text-foreground">{toNumberLabel(candidate.age)}</p>
                              </div>
                              <div>
                                <p className="font-mono uppercase tracking-widest text-muted-foreground">{tString(locale.table.constituency, language)}</p>
                                <p className="mt-1 text-foreground">{toNumberLabel(candidate.constituency)}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-end border-t border-border pt-3">
                              <Link
                                href={`/election-2026/profiles/${getFPTPCandidateSlug(candidate)}`}
                                className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-primary hover:underline"
                              >
                                {tString(locale.viewProfile, language)}
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

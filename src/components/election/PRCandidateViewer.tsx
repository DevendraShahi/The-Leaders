"use client";

import { useElectionStore } from "@/lib/election-store";
import { PRCandidate, PRPartyList } from "@/lib/pr-candidate-data";
import { DistrictCandidateDialog } from "@/components/election/DistrictCandidateDialog"; // New Import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, X, ChevronDown } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { getPartyLogo } from "@/lib/party-symbols";
import Image from "next/image";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import type { PartyRankIndex } from "@/lib/fptp-party-ranking";

interface PRCandidateViewerProps {
    initialData: PRPartyList[]; // We pass initial data from server
    partyRankIndex: PartyRankIndex;
}

export function PRCandidateViewer({ initialData, partyRankIndex }: PRCandidateViewerProps) {
    const { language } = useLanguage();
    const locale = LOCALES.election2026.components.prViewer;

    // Optimization: Select only what we need to prevent re-renders when 'hoveredDistrict' changes
    const selectedDistrict = useElectionStore((state) => state.selectedDistrict);
    const setSelectedDistrict = useElectionStore((state) => state.setSelectedDistrict);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedParty, setSelectedParty] = useState<string>("all");
    const [selectedGender, setSelectedGender] = useState<string>("all");
    const [selectedGroup, setSelectedGroup] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"party" | "district">("party");
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // Get unique lists for dropdowns
    const parties = useMemo(() => Array.from(new Set(initialData.map(p => p.party_name))).sort(), [initialData]);
    const groups = useMemo(() => {
        const s = new Set<string>();
        initialData.forEach(p => p.candidates.forEach(c => s.add(c.group)));
        return Array.from(s).sort();
    }, [initialData]);

    // Unique Districts for Dropdown
    const districts = useMemo(() => {
        const d = new Set<string>();
        initialData.forEach(p => p.candidates.forEach(c => d.add(c.district)));
        return Array.from(d).sort();
    }, [initialData]);

    const districtSet = useMemo(() => new Set(districts), [districts]);
    const effectiveSelectedDistrict = useMemo(() => {
        if (!selectedDistrict) return null;
        return districtSet.has(selectedDistrict) ? selectedDistrict : null;
    }, [districtSet, selectedDistrict]);

    // Prevent stale cross-view district values from collapsing PR results.
    useEffect(() => {
        if (selectedDistrict && !districtSet.has(selectedDistrict)) {
            setSelectedDistrict(null);
        }
    }, [districtSet, selectedDistrict, setSelectedDistrict]);

    // Memoized filtering
    const filteredCandidates = useMemo(() => {
        const results: PRCandidate[] = [];

        initialData.forEach((party) => {
            // Apply party filter early
            if (selectedParty !== "all" && party.party_name !== selectedParty) return;

            party.candidates.forEach((candidate) => {
                const enriched = { ...candidate, party_name: party.party_name };

                // Apply Search
                if (searchTerm && !enriched.name.toLowerCase().includes(searchTerm.toLowerCase())) return;

                // Apply district filter
                if (effectiveSelectedDistrict && enriched.district !== effectiveSelectedDistrict) return;

                // Apply gender
                if (selectedGender !== "all" && enriched.gender !== selectedGender) return;

                // Apply group
                if (selectedGroup !== "all" && enriched.group !== selectedGroup) return;

                results.push(enriched);
            });
        });

        return results;
    }, [initialData, selectedParty, searchTerm, effectiveSelectedDistrict, selectedGender, selectedGroup]);

    // Group filtered results by Party or District for display
    const groupedResults = useMemo(() => {
        const groups: Record<string, PRCandidate[]> = {};
        filteredCandidates.forEach((candidate) => {
            const key = viewMode === "party" ? candidate.party_name! : candidate.district;
            if (!groups[key]) groups[key] = [];
            groups[key].push(candidate);
        });

        return Object.keys(groups)
            .sort((a, b) => {
                if (viewMode === "party") {
                    const rankA = partyRankIndex[a]?.rank ?? Number.MAX_SAFE_INTEGER;
                    const rankB = partyRankIndex[b]?.rank ?? Number.MAX_SAFE_INTEGER;
                    if (rankA !== rankB) return rankA - rankB;
                }

                return a.localeCompare(b, "ne");
            })
            .reduce((acc, key) => {
                acc[key] = groups[key];
                return acc;
            }, {} as Record<string, PRCandidate[]>);
    }, [filteredCandidates, partyRankIndex, viewMode]);

    const groupedEntries = useMemo(
        () => Object.entries(groupedResults),
        [groupedResults]
    );

    useEffect(() => {
        setExpandedGroups((prev) => {
            const validKeys = new Set(groupedEntries.map(([groupKey]) => groupKey));
            return new Set(Array.from(prev).filter((groupKey) => validKeys.has(groupKey)));
        });
    }, [groupedEntries]);

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
        setExpandedGroups(new Set(groupedEntries.map(([groupKey]) => groupKey)));
    };

    const collapseAllGroups = () => {
        setExpandedGroups(new Set());
    };

    return (
        <div className="space-y-6">
            <DistrictCandidateDialog initialData={initialData} />

            <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
                <div className="flex-1 space-y-2">
                    <h2 className="text-2xl font-bebas text-primary uppercase tracking-wide">{tString(locale.browse, language)}</h2>
                </div>
                <div className="flex bg-muted p-1 border border-border rounded-none">
                    <Button
                        variant={viewMode === "party" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("party")}
                        className="text-xs rounded-none font-mono uppercase tracking-widest"
                    >
                        {tString(locale.byParty, language)}
                    </Button>
                    <Button
                        variant={viewMode === "district" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("district")}
                        className="text-xs rounded-none font-mono uppercase tracking-widest"
                    >
                        {tString(locale.byDistrict, language)}
                    </Button>
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-col gap-4 p-4 bg-muted/30 border border-border rounded-none">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={tString(locale.searchPlaceholder, language)}
                            className="pl-10 bg-background rounded-none font-manrope"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Active Filters Display */}
                    {effectiveSelectedDistrict && (
                        <Badge variant="secondary" className="px-3 py-1 flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3" />
                            {tString(locale.table.district, language)}: {effectiveSelectedDistrict}
                            <X
                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                onClick={() => setSelectedDistrict(null)}
                            />
                        </Badge>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {/* District Dropdown */}
                    <Select
                        value={effectiveSelectedDistrict || "all"}
                        onValueChange={(val) => setSelectedDistrict(val === "all" ? null : val)}
                    >
                        <SelectTrigger className="w-full md:w-[150px]">
                            <SelectValue placeholder={tString(locale.allDistricts, language)} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{tString(locale.allDistricts, language)}</SelectItem>
                            {districts.map(d => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedParty} onValueChange={setSelectedParty}>
                        <SelectTrigger className="w-full md:w-[180px] rounded-none font-mono text-xs uppercase tracking-widest">
                            <SelectValue placeholder={tString(locale.allParties, language)} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{tString(locale.allParties, language)}</SelectItem>
                            {parties.map((p, idx) => (
                                <SelectItem key={`party-${idx}-${p}`} value={p}>{p}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Gender Filter */}
                    <Select value={selectedGender} onValueChange={setSelectedGender}>
                        <SelectTrigger className="w-full md:w-[150px] rounded-none font-mono text-xs uppercase tracking-widest">
                            <SelectValue placeholder={tString(locale.allGenders, language)} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{tString(locale.allGenders, language)}</SelectItem>
                            <SelectItem value="Male">{tString(locale.genders.Male, language)}</SelectItem>
                            <SelectItem value="Female">{tString(locale.genders.Female, language)}</SelectItem>
                            <SelectItem value="Other">{tString(locale.genders.Other, language)}</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Group Filter */}
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger className="w-full md:w-[150px] rounded-none font-mono text-xs uppercase tracking-widest">
                            <SelectValue placeholder={tString(locale.allGroups, language)} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{tString(locale.allGroups, language)}</SelectItem>
                            {groups.map(g => (
                                <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setSelectedParty("all");
                            setSelectedGroup("all");
                            setSelectedGender("all");
                            setSearchTerm("");
                            setSelectedDistrict(null);
                        }}
                        title={tString(locale.reset, language)}
                        className="rounded-none"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Results */}
            <div className="space-y-8">
                {groupedEntries.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        {tString(locale.noCandidates, language)}
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <Badge variant="secondary" className="rounded-none font-mono text-[10px] uppercase tracking-widest">
                                {filteredCandidates.length.toLocaleString()} {tString(locale.candidates, language)}
                            </Badge>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-none"
                                    onClick={expandAllGroups}
                                    disabled={groupedEntries.length === 0 || expandedGroups.size === groupedEntries.length}
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

                        {groupedEntries.map(([groupKey, candidates], groupIndex) => {
                            const isExpanded = expandedGroups.has(groupKey);
                            const groupSlug = groupKey
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-+|-+$/g, "");
                            const panelId = `pr-group-panel-${groupSlug || groupIndex}`;

                            return (
                                <Card key={groupKey} className="overflow-hidden border border-border rounded-none bg-card">
                                    <CardHeader className="bg-muted/10 pb-4 border-b border-border">
                                        <button
                                            type="button"
                                            className="w-full text-left"
                                            aria-expanded={isExpanded}
                                            aria-controls={panelId}
                                            onClick={() => toggleGroup(groupKey)}
                                        >
                                            <CardTitle className="flex justify-between items-center gap-3 text-lg md:text-xl font-sans leading-tight tracking-tight">
                                                <div className="flex items-center gap-3">
                                                    {getPartyLogo(groupKey) && (
                                                        <div className="relative h-8 w-8 overflow-hidden border border-border bg-white rounded-none">
                                                            <Image
                                                                src={getPartyLogo(groupKey)!}
                                                                alt={groupKey}
                                                                fill
                                                                className="object-contain p-0.5"
                                                            />
                                                        </div>
                                                    )}
                                                    {groupKey}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="rounded-none font-mono text-[10px] uppercase tracking-widest">
                                                        {candidates.length} {tString(locale.candidates, language)}
                                                    </Badge>
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                                        {isExpanded ? tString(locale.hideGroup, language) : tString(locale.showGroup, language)}
                                                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                                    </span>
                                                </div>
                                            </CardTitle>
                                        </button>
                                    </CardHeader>
                                    {isExpanded && (
                                        <CardContent id={panelId} className="p-0">
                                            <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                                        {candidates.map((candidate, index) => {
                                            const initials = candidate.name
                                                .split(" ")
                                                .filter(Boolean)
                                                .slice(0, 2)
                                                .map((part) => part[0])
                                                .join("")
                                                .toUpperCase();

                                            return (
                                                <div
                                                    key={`${candidate.voter_id}-${candidate.sn}-${index}`}
                                                    className="rounded-none border border-border/70 bg-background/70 p-4 transition-colors hover:border-primary/40"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-none border border-border/70 bg-primary/5 font-bebas text-sm tracking-wide text-primary">
                                                                {initials || "PR"}
                                                            </div>
                                                            <div>
                                                                <p className="line-clamp-2 text-sm font-semibold text-foreground">
                                                                    {candidate.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {candidate.group}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline" className="rounded-none font-mono text-[10px] uppercase tracking-widest">
                                                            {candidate.gender}
                                                        </Badge>
                                                    </div>

                                                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-dashed border-border pt-3 text-xs">
                                                        <div>
                                                            <p className="font-mono uppercase tracking-widest text-muted-foreground">
                                                                {tString(locale.table.district, language)}
                                                            </p>
                                                            <p className="mt-1 text-foreground">{candidate.district}</p>
                                                        </div>
                                                        <div>
                                                            <p className="font-mono uppercase tracking-widest text-muted-foreground">
                                                                {tString(locale.table.group, language)}
                                                            </p>
                                                            <p className="mt-1 text-foreground">{candidate.group}</p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap gap-1 border-t border-border pt-3">
                                                        {candidate.backward_area && (
                                                            <Badge variant="secondary" className="text-[10px] rounded-none font-mono uppercase tracking-widest">
                                                                {tString(locale.badges.backward, language)}
                                                            </Badge>
                                                        )}
                                                        {candidate.disability && (
                                                            <Badge variant="secondary" className="text-[10px] rounded-none font-mono uppercase tracking-widest">
                                                                {tString(locale.badges.disability, language)}
                                                            </Badge>
                                                        )}
                                                        {!candidate.backward_area && !candidate.disability && (
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })}

                    </>
                )}
            </div>
        </div>
    );
}

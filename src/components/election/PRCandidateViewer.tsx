"use client";

import { useQuery } from "@tanstack/react-query";
import { useElectionStore } from "@/lib/election-store";
import { PRCandidate, PRPartyList } from "@/lib/pr-candidate-data";
import { DistrictCandidateDialog } from "@/components/election/DistrictCandidateDialog"; // New Import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Users, X, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { getPartyLogo } from "@/lib/party-symbols";
import Image from "next/image";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

interface PRCandidateViewerProps {
    initialData: PRPartyList[]; // We pass initial data from server
}

export function PRCandidateViewer({ initialData }: PRCandidateViewerProps) {
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

    // Memoized filtering
    const filteredCandidates = useMemo(() => {
        const results: PRCandidate[] = [];

        // First flatten
        initialData.forEach(party => {
            // Apply party filter early
            if (selectedParty !== "all" && party.party_name !== selectedParty) return;

            party.candidates.forEach(candidate => {
                const enriched = { ...candidate, party_name: party.party_name };

                // Apply Search (with null safety)
                if (searchTerm && (!enriched.name || !enriched.name.toLowerCase().includes(searchTerm.toLowerCase()))) return;

                // Apply District Filter (Global Store)
                // Apply District Filter (Global Store) -- MATCHING WITH ENGLISH DATA NOW
                if (selectedDistrict && enriched.district !== selectedDistrict) return;

                // Apply Gender
                if (selectedGender !== "all" && enriched.gender !== selectedGender) return;

                // Apply Group
                if (selectedGroup !== "all" && enriched.group !== selectedGroup) return;

                results.push(enriched);
            });
        });

        return results;
    }, [initialData, selectedParty, searchTerm, selectedDistrict, selectedGender, selectedGroup]);

    // Group filtered results by Party or District for display
    const groupedResults = useMemo(() => {
        const groups: Record<string, PRCandidate[]> = {};
        filteredCandidates.forEach(c => {
            const key = viewMode === "party" ? c.party_name! : c.district;
            if (!groups[key]) groups[key] = [];
            groups[key].push(c);
        });
        // Sort keys
        return Object.keys(groups).sort().reduce((acc, key) => {
            acc[key] = groups[key];
            return acc;
        }, {} as Record<string, PRCandidate[]>);
    }, [filteredCandidates, viewMode]);

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
                    {selectedDistrict && (
                        <Badge variant="secondary" className="px-3 py-1 flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3" />
                            {tString(locale.table.district, language)}: {selectedDistrict}
                            <X
                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                onClick={() => setSelectedDistrict(null)}
                            />
                        </Badge>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {/* District Dropdown */}
                    <Select value={selectedDistrict || "all"} onValueChange={(val) => setSelectedDistrict(val === "all" ? null : val)}>
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
                {Object.keys(groupedResults).length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        {tString(locale.noCandidates, language)}
                    </div>
                ) : (
                    Object.entries(groupedResults).map(([partyName, candidates]) => (
                        <Card key={partyName} className="overflow-hidden border border-border rounded-none bg-card">
                            <CardHeader className="bg-muted/10 pb-4 border-b border-border">
                                <CardTitle className="flex justify-between items-center text-lg md:text-xl font-sans leading-tight tracking-tight">
                                    <div className="flex items-center gap-3">
                                        {getPartyLogo(partyName) && (
                                            <div className="relative h-8 w-8 overflow-hidden border border-border bg-white rounded-none">
                                                <Image
                                                    src={getPartyLogo(partyName)!}
                                                    alt={partyName}
                                                    fill
                                                    className="object-contain p-0.5"
                                                />
                                            </div>
                                        )}
                                        {partyName}
                                    </div>
                                    <Badge variant="outline" className="rounded-none font-mono text-[10px] uppercase tracking-widest">
                                        {candidates.length} {tString(locale.candidates, language)}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border-t border-border">
                                        <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b font-mono tracking-widest">
                                            <tr>
                                                <th className="px-6 py-3">{tString(locale.table.sn, language)}</th>
                                                <th className="px-6 py-3">{tString(locale.table.name, language)}</th>
                                                <th className="px-6 py-3">{tString(locale.table.group, language)}</th>
                                                <th className="px-6 py-3">{tString(locale.table.gender, language)}</th>
                                                <th className="px-6 py-3">{tString(locale.table.district, language)}</th>
                                                <th className="px-6 py-3">{tString(locale.table.status, language)}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {candidates.map((candidate, index) => (
                                                <tr key={`${candidate.voter_id}-${candidate.sn}-${index}`} className="border-b border-border hover:bg-muted/5 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                                                        {candidate.sn}
                                                    </td>
                                                    <td className="px-6 py-4 font-manrope font-semibold text-sm text-primary">
                                                        {candidate.name}
                                                    </td>
                                                    <td className="px-6 py-4 font-manrope text-sm text-foreground/80">
                                                        {candidate.group}
                                                    </td>
                                                    <td className="px-6 py-4 font-manrope text-sm text-foreground/80">
                                                        {candidate.gender}
                                                    </td>
                                                    <td className="px-6 py-4 font-manrope text-sm text-foreground/80">
                                                        {candidate.district}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-1">
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
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

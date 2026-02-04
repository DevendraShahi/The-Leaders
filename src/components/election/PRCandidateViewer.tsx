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

interface PRCandidateViewerProps {
    initialData: PRPartyList[]; // We pass initial data from server
}

export function PRCandidateViewer({ initialData }: PRCandidateViewerProps) {
    const { selectedDistrict, setSelectedDistrict } = useElectionStore();
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
                    <h2 className="text-2xl font-bebas text-primary">Browse Candidates</h2>
                </div>
                <div className="flex bg-muted p-1 rounded-lg">
                    <Button
                        variant={viewMode === "party" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("party")}
                        className="text-xs"
                    >
                        By Party
                    </Button>
                    <Button
                        variant={viewMode === "district" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("district")}
                        className="text-xs"
                    >
                        By District
                    </Button>
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-col gap-4 p-4 bg-muted/30 rounded-lg border">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search candidates by name..."
                            className="pl-10 bg-background"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Active Filters Display */}
                    {selectedDistrict && (
                        <Badge variant="secondary" className="px-3 py-1 flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3" />
                            District: {selectedDistrict}
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
                            <SelectValue placeholder="All Districts" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Districts</SelectItem>
                            {districts.map(d => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedParty} onValueChange={setSelectedParty}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by Party" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Parties</SelectItem>
                            {parties.map((p, idx) => (
                                <SelectItem key={`party-${idx}-${p}`} value={p}>{p}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Gender Filter */}
                    <Select value={selectedGender} onValueChange={setSelectedGender}>
                        <SelectTrigger className="w-full md:w-[150px]">
                            <SelectValue placeholder="All Genders" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Genders</SelectItem>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Group Filter */}
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger className="w-full md:w-[150px]">
                            <SelectValue placeholder="All Groups" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Groups</SelectItem>
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
                        title="Reset Filters"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Results */}
            <div className="space-y-8">
                {Object.keys(groupedResults).length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        No candidates found matching criteria.
                    </div>
                ) : (
                    Object.entries(groupedResults).map(([partyName, candidates]) => (
                        <Card key={partyName} className="overflow-hidden">
                            <CardHeader className="bg-muted/10 pb-4">
                                <CardTitle className="flex justify-between items-center text-xl font-bold font-bebas tracking-wide">
                                    <div className="flex items-center gap-3">
                                        {getPartyLogo(partyName) && (
                                            <div className="relative h-8 w-8 rounded-full overflow-hidden border bg-white">
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
                                    <Badge variant="outline">{candidates.length} Candidates</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b">
                                            <tr>
                                                <th className="px-6 py-3">SN</th>
                                                <th className="px-6 py-3">Name</th>
                                                <th className="px-6 py-3">Group</th>
                                                <th className="px-6 py-3">Gender</th>
                                                <th className="px-6 py-3">District</th>
                                                <th className="px-6 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {candidates.map((candidate, index) => (
                                                <tr key={`${candidate.voter_id}-${candidate.sn}-${index}`} className="border-b hover:bg-muted/5 transition-colors">
                                                    <td className="px-6 py-4 font-medium">{candidate.sn}</td>
                                                    <td className="px-6 py-4 font-bold text-primary">{candidate.name}</td>
                                                    <td className="px-6 py-4">{candidate.group}</td>
                                                    <td className="px-6 py-4">{candidate.gender}</td>
                                                    <td className="px-6 py-4">{candidate.district}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-1">
                                                            {candidate.backward_area && (
                                                                <Badge variant="secondary" className="text-[10px]">Backward</Badge>
                                                            )}
                                                            {candidate.disability && (
                                                                <Badge variant="secondary" className="text-[10px]">Disability</Badge>
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

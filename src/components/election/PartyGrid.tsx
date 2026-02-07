"use client";

import { useMemo, useCallback, Suspense, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { Search, User, Flag, Filter, SortAsc, ChevronDown, ArrowUpRight, Trophy, Vote, History, Star, Gavel, Briefcase } from "lucide-react";
import { PartyDTO } from "@/lib/election-data";
import { cn } from "@/lib/utils";

interface PartyGridProps {
    parties: PartyDTO[];
}

// Maps to JSON keys in 'ranking' object or handled specially
type SortBasis = "overall" | "electoral" | "government" | "popularity" | "votes" | "name";

// Constants for strict typing
const SORT_OPTIONS: { value: SortBasis; label: string; icon: any }[] = [
    { value: "overall", label: "Overall Rank", icon: Trophy },
    { value: "electoral", label: "Electoral Power", icon: Gavel },
    { value: "popularity", label: "Popularity", icon: Star },
    { value: "government", label: "Govt Experience", icon: Briefcase },
    { value: "votes", label: "Total Votes", icon: Vote },
    { value: "name", label: "Party Name", icon: Flag },
];

function PartyGridContent({ parties }: PartyGridProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 1. Initial State from URL
    // We use a single state object to ensure instant UI updates (Optimistic UI)
    // independent of the router's roundtrip time.
    const [filters, setFilters] = useState({
        query: searchParams.get("q") || "",
        hasSeats: searchParams.get("seats") === "true",
        inParliament: searchParams.get("parliament") === "true",
        sort: (searchParams.get("sort") as SortBasis) || "overall",
        sortDir: (searchParams.get("dir") as "asc" | "desc") || "asc"
    });

    const isFirstRun = useRef(true);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 2. Sync URL when Local State Changes (Debounced for Query)
    useEffect(() => {
        // Skip initial mount to avoid replacing URL with same params
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const updateUrl = () => {
            const params = new URLSearchParams();

            if (filters.query) params.set("q", filters.query);
            if (filters.hasSeats) params.set("seats", "true");
            if (filters.inParliament) params.set("parliament", "true");
            if (filters.sort !== "overall") params.set("sort", filters.sort);
            if (filters.sortDir !== "asc") params.set("dir", filters.sortDir);

            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        };

        if (debounceRef.current) clearTimeout(debounceRef.current);

        // Immediate update for non-text filters, debounce for text
        debounceRef.current = setTimeout(() => {
            updateUrl();
        }, 300); // 300ms debounce covers both typing and rapid clicks

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [filters, pathname, router]);

    // 3. Sync Local State when URL Changes Externally (Back/Forward)
    // This ensures we stay in sync if the user navigates browser history
    useEffect(() => {
        const urlParams = {
            query: searchParams.get("q") || "",
            hasSeats: searchParams.get("seats") === "true",
            inParliament: searchParams.get("parliament") === "true",
            sort: (searchParams.get("sort") as SortBasis) || "overall",
            sortDir: (searchParams.get("dir") as "asc" | "desc") || "asc"
        };

        // Only update if deeply different to avoid loops, though basic equality works for primitives
        setFilters(prev => {
            if (
                prev.query !== urlParams.query ||
                prev.hasSeats !== urlParams.hasSeats ||
                prev.inParliament !== urlParams.inParliament ||
                prev.sort !== urlParams.sort ||
                prev.sortDir !== urlParams.sortDir
            ) {
                return urlParams;
            }
            return prev;
        });
    }, [
        searchParams.get("q"),
        searchParams.get("seats"),
        searchParams.get("parliament"),
        searchParams.get("sort"),
        searchParams.get("dir")
    ]);


    // 4. Handlers
    const updateSort = (sort: SortBasis) => setFilters(prev => ({ ...prev, sort }));
    const updateSortDir = (sortDir: "asc" | "desc") => setFilters(prev => ({ ...prev, sortDir }));
    const updateQuery = (query: string) => setFilters(prev => ({ ...prev, query }));
    const toggleSeats = (checked: boolean) => setFilters(prev => ({ ...prev, hasSeats: checked }));
    const toggleParliament = (checked: boolean) => setFilters(prev => ({ ...prev, inParliament: checked }));

    const handleReset = useCallback(() => {
        setFilters({
            query: "",
            hasSeats: false,
            inParliament: false,
            sort: "overall",
            sortDir: "asc"
        });
        // Force URL cleanup immediately
        router.replace(pathname, { scroll: false });
    }, [pathname, router]);

    // 5. Format Helper
    const formatVotes = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "k";
        return num.toLocaleString();
    };

    // 6. Core Filtering Engine (Memoized on Local State)
    const processedParties = useMemo(() => {
        if (!parties?.length) return [];

        const q = filters.query.trim().toLowerCase();

        // 1. Deduplicate by Name (Robustness Fix)
        const uniquePartiesMap = new Map();
        parties.forEach(p => {
            if (!uniquePartiesMap.has(p.name)) {
                uniquePartiesMap.set(p.name, p);
            }
        });
        const uniqueParties = Array.from(uniquePartiesMap.values());

        // 2. Filter
        const result = uniqueParties.filter((party) => {
            const seatsHoR = party.performance?.total_seats_hor ?? 0;
            const seatsNA = party.performance?.national_assembly_seats ?? 0;

            if (filters.hasSeats && seatsHoR < 1) return false;
            if (filters.inParliament && seatsHoR < 1 && seatsNA < 1) return false;

            if (q) {
                const matchName = party.name.toLowerCase().includes(q);
                const matchShort = party.shortName?.toLowerCase().includes(q);
                const matchLeader = party.leader?.toLowerCase().includes(q);
                const matchSymbol = party.symbol?.toLowerCase().includes(q);
                if (!matchName && !matchShort && !matchLeader && !matchSymbol) return false;
            }

            return true;
        });

        // Sort
        return [...result].sort((a, b) => {
            let valA: number | string = 0;
            let valB: number | string = 0;

            switch (filters.sort) {
                case "votes":
                    valA = a.performance?.pr_votes_2022_aggregate ?? a.performance?.pr_votes_2022 ?? 0;
                    valB = b.performance?.pr_votes_2022_aggregate ?? b.performance?.pr_votes_2022 ?? 0;
                    break;
                case "name":
                    valA = (a.name || "").toLowerCase();
                    valB = (b.name || "").toLowerCase();
                    return filters.sortDir === "asc"
                        ? (valA as string).localeCompare(valB as string)
                        : (valB as string).localeCompare(valA as string);

                // Numeric Ranking Fields
                case "overall":
                case "electoral":
                case "government":
                case "popularity":
                default:
                    valA = a.ranking?.[filters.sort as keyof typeof a.ranking] ?? 9999;
                    valB = b.ranking?.[filters.sort as keyof typeof a.ranking] ?? 9999;
                    break;
            }

            // Numeric Comparison
            if (typeof valA === "number" && typeof valB === "number") {
                if (filters.sort === "votes") {
                    return filters.sortDir === "asc" ? valA - valB : valB - valA;
                }
                return filters.sortDir === "asc" ? valA - valB : valB - valA;
            }

            return 0;
        });
    }, [parties, filters]); // Re-runs immediately when 'filters' state changes

    const hasActiveFilters = filters.query !== "" || filters.hasSeats || filters.inParliament;

    return (
        <div className="space-y-8">
            {/* Controls Bar */}
            <div className="flex flex-col space-y-4 bg-background/50 backdrop-blur-sm sticky top-0 z-30 py-4 border-b border-transparent data-[stuck=true]:border-border transition-colors">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">

                    {/* Search - Premium Sharp Input */}
                    <div className="relative w-full md:max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                        <Input
                            placeholder="Search by party, leader, or symbol..."
                            className="pl-12 h-12 text-base border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary rounded-none shadow-sm bg-background/80 transition-all font-manrope placeholder:text-muted-foreground/70"
                            value={filters.query}
                            onChange={(e) => updateQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto">

                        {/* Structure Filters (Clean Toggles) */}
                        <div className="flex items-center gap-0 bg-background border border-input rounded-none h-12 shadow-sm p-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-full px-4 rounded-none gap-2 hover:bg-muted text-muted-foreground hover:text-foreground font-mono uppercase text-xs tracking-wider border-r border-transparent hover:border-border">
                                        <Filter className="h-3.5 w-3.5" />
                                        <span>Filters</span>
                                        {(filters.hasSeats || filters.inParliament) &&
                                            <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-[1.25rem] text-[10px] bg-primary/10 text-primary border-primary/20 rounded-none">
                                                {[filters.hasSeats, filters.inParliament].filter(Boolean).length}
                                            </Badge>
                                        }
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-none border-border">
                                    <DropdownMenuLabel className="font-mono text-xs uppercase text-muted-foreground">Representation</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem
                                        checked={filters.hasSeats}
                                        onCheckedChange={toggleSeats}
                                        className="font-manrope text-sm cursor-pointer rounded-none focus:bg-primary/5 focus:text-primary"
                                    >
                                        Has HoR Seats
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={filters.inParliament}
                                        onCheckedChange={toggleParliament}
                                        className="font-manrope text-sm cursor-pointer rounded-none focus:bg-primary/5 focus:text-primary"
                                    >
                                        In Parliament (HoR/NA)
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="w-px h-6 bg-border/50 mx-1" />

                            {/* Sort Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-full px-4 rounded-none gap-2 hover:bg-muted text-muted-foreground hover:text-foreground font-mono uppercase text-xs tracking-wider">
                                        <SortAsc className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Sort:</span>
                                        <span className="font-bold text-primary truncate max-w-[100px]">
                                            {SORT_OPTIONS.find(o => o.value === filters.sort)?.label}
                                        </span>
                                        <ChevronDown className="h-3 w-3 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-none border-border key-sort">
                                    <DropdownMenuLabel className="font-mono text-xs uppercase text-muted-foreground">Sort Basis</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup
                                        value={filters.sort}
                                        onValueChange={(v) => updateSort(v as SortBasis)}
                                    >
                                        {SORT_OPTIONS.map(option => (
                                            <DropdownMenuRadioItem key={option.value} value={option.value} className="font-manrope text-sm gap-2 cursor-pointer rounded-none focus:bg-primary/5 focus:text-primary">
                                                <option.icon className="h-3 w-3 text-muted-foreground" />
                                                {option.label}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel className="font-mono text-xs uppercase text-muted-foreground">Direction</DropdownMenuLabel>
                                    <DropdownMenuRadioGroup
                                        value={filters.sortDir}
                                        onValueChange={(v) => updateSortDir(v as "asc" | "desc")}
                                    >
                                        <DropdownMenuRadioItem value="asc" className="font-manrope text-sm rounded-none focus:bg-primary/5 focus:text-primary">
                                            {filters.sort === 'votes' ? 'Low to High' : 'Rank 1 → Last (Best First)'}
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="desc" className="font-manrope text-sm rounded-none focus:bg-primary/5 focus:text-primary">
                                            {filters.sort === 'votes' ? 'High to Low (Most Votes)' : 'Last → Rank 1'}
                                        </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Filter Summary & Reset */}
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground font-mono pb-2">
                    <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 border border-border/50 rounded-none">
                        <Filter className="h-3 w-3" />
                        Showing <span className="text-foreground font-bold">{processedParties.length}</span> of {parties.length}
                    </span>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive rounded-none transition-colors"
                        >
                            Reset All Filters
                        </Button>
                    )}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start min-h-[50vh]">
                {processedParties.map((party) => {
                    const rank = party.ranking?.[filters.sort as keyof typeof party.ranking] || 0;
                    const votes = party.performance?.pr_votes_2022_aggregate ?? party.performance?.pr_votes_2022 ?? 0;

                    return (
                        <Card
                            key={party.name}
                            className="group h-full flex flex-col bg-card border border-border hover:border-primary transition-all duration-300 rounded-none relative overflow-visible"
                        >
                            {filters.sort !== 'name' && filters.sort !== 'votes' && rank > 0 && rank <= 20 && (
                                <div className="absolute -top-3 -right-3 z-10 transition-transform group-hover:scale-110">
                                    <div className={cn(
                                        "flex flex-col items-center justify-center w-10 h-10 rounded-none border border-border shadow-sm font-bebas text-lg leading-none",
                                        rank <= 3 ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground"
                                    )}>
                                        <span className="text-[8px] font-mono opacity-70">#</span>
                                        {rank}
                                    </div>
                                </div>
                            )}

                            <CardHeader className="pb-3 pt-5 px-5">
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    {/* Logo */}
                                    {party.logo ? (
                                        <div className="w-14 h-14 relative flex-shrink-0 bg-white border border-border p-2 rounded-none shadow-sm group-hover:shadow-md transition-shadow">
                                            <Image
                                                src={party.logo}
                                                alt={party.name}
                                                fill
                                                className="object-contain"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-14 h-14 bg-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0 rounded-none">
                                            <span className="font-bebas text-sm text-primary tracking-wide text-center leading-none px-1">
                                                {party.shortName || party.symbol?.slice(0, 2) || "PTY"}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex flex-col items-end gap-1">
                                        {party.shortName && (
                                            <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider rounded-none border-border bg-muted/30">
                                                {party.shortName}
                                            </Badge>
                                        )}

                                        {(party.performance?.total_seats_hor ?? 0) > 0 && (
                                            <Badge variant="outline" className="font-mono text-[8px] uppercase tracking-wider rounded-none border-primary/30 text-primary bg-primary/5">
                                                HoR: {party.performance?.total_seats_hor}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <CardTitle className="font-bebas text-2xl leading-none text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                        {party.name}
                                    </CardTitle>
                                    {party.status && (
                                        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
                                            {party.status}
                                        </p>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col justify-between px-5 pb-5 pt-0">
                                <div className="space-y-4 py-4 border-t border-dashed border-border mt-2">
                                    {party.leader && (
                                        <div className="flex items-center gap-2">
                                            <User className="h-3.5 w-3.5 text-primary/70" />
                                            <span className="text-sm font-manrope font-medium text-foreground line-clamp-1">
                                                {party.leader}
                                            </span>
                                        </div>
                                    )}

                                    {votes > 0 && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Vote className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground font-mono uppercase">2022 Votes</span>
                                            </div>
                                            <span className="font-manrope font-bold text-sm tabular-nums">{formatVotes(votes)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-border flex justify-between items-center group/link">
                                    <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5 truncate max-w-[150px]">
                                        {party.symbol && <><Flag className="h-3 w-3 shrink-0" /> {party.symbol}</>}
                                    </span>
                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover/link:text-primary transition-colors shrink-0" />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Empty State */}
            {processedParties.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border bg-muted/5">
                    <Search className="h-10 w-10 text-muted-foreground/30 mb-4" />
                    <h3 className="font-bebas text-xl text-foreground mb-2">No Results Found</h3>
                    <p className="text-muted-foreground font-manrope text-sm text-center max-w-sm mb-6">
                        No parties match your current filters. Try adjusting your search query.
                    </p>
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="font-mono text-xs uppercase rounded-none border-primary/30 hover:border-primary hover:text-primary"
                    >
                        Reset All Filters
                    </Button>
                </div>
            )}
        </div>
    );
}

export function PartyGrid(props: PartyGridProps) {
    return (
        <Suspense fallback={<div className="h-96 flex items-center justify-center font-mono text-sm text-muted-foreground animate-pulse">Loading Archive...</div>}>
            <PartyGridContent {...props} />
        </Suspense>
    );
}

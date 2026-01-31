"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Search, User, Calendar, Flag, Filter, SortAsc, ChevronDown } from "lucide-react";
import { PartyDTO } from "@/lib/election-data";

interface PartyGridProps {
    parties: PartyDTO[];
}

type SortOption = "name-asc" | "name-desc" | "date-new" | "date-old";
type FilterOption = "all" | "has-leader" | "has-symbol";

export function PartyGrid({ parties }: PartyGridProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState<SortOption>("name-asc");
    const [filterOption, setFilterOption] = useState<FilterOption>("all");

    const getFilteredAndSortedParties = () => {
        let result = parties.filter((party) =>
            party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            party.leader?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            party.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Apply Filter
        if (filterOption === "has-leader") {
            result = result.filter(p => p.leader);
        } else if (filterOption === "has-symbol") {
            result = result.filter(p => p.symbol);
        }

        // Apply Sort
        result.sort((a, b) => {
            if (sortOption === "name-asc") {
                return a.name.localeCompare(b.name);
            } else if (sortOption === "name-desc") {
                return b.name.localeCompare(a.name);
            } else if (sortOption === "date-new") {
                return (b.regDate || "").localeCompare(a.regDate || "");
            } else if (sortOption === "date-old") {
                return (a.regDate || "").localeCompare(b.regDate || "");
            }
            return 0;
        });

        return result;
    };

    const filteredParties = getFilteredAndSortedParties();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search parties..."
                        className="pl-10 bg-background/50 backdrop-blur border-primary/20 focus-visible:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    {/* Sort Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 w-full md:w-auto justify-between md:justify-start">
                                <SortAsc className="h-4 w-4" />
                                <span>Sort</span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSortOption("name-asc")}>
                                Name (A-Z) {sortOption === "name-asc" && "✓"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOption("name-desc")}>
                                Name (Z-A) {sortOption === "name-desc" && "✓"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSortOption("date-new")}>
                                Date (Newest) {sortOption === "date-new" && "✓"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOption("date-old")}>
                                Date (Oldest) {sortOption === "date-old" && "✓"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 w-full md:w-auto justify-between md:justify-start">
                                <Filter className="h-4 w-4" />
                                <span>Filter</span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setFilterOption("all")}>
                                All Parties {filterOption === "all" && "✓"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterOption("has-leader")}>
                                With Leader {filterOption === "has-leader" && "✓"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterOption("has-symbol")}>
                                With Symbol {filterOption === "has-symbol" && "✓"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredParties.map((party) => (
                    <Card key={party.id || party.name} className="hover:border-primary/50 transition-colors group h-full flex flex-col">
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                                <CardTitle className="font-bebas text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                    {party.name}
                                </CardTitle>
                                {party.logo && (
                                    <div className="h-8 w-8 relative flex-shrink-0 rounded-full overflow-hidden border bg-muted">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={party.logo} alt={party.name} className="object-cover w-full h-full" />
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm flex-1 flex flex-col justify-end">
                            {party.leader ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    <span className="font-medium text-foreground line-clamp-1">{party.leader}</span>
                                </div>
                            ) : (
                                <div className="h-5" /> // Spacer
                            )}
                            <div className="flex justify-between items-center text-xs text-muted-foreground/80 mt-2 pt-2 border-t border-dashed">
                                <span className="flex items-center gap-1 line-clamp-1" title={party.symbol}>
                                    <Flag className="h-3 w-3 flex-shrink-0" /> {party.symbol || "N/A"}
                                </span>
                                {party.regDate && (
                                    <span className="flex items-center gap-1 flex-shrink-0">
                                        <Calendar className="h-3 w-3" /> {party.regDate}
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredParties.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p>No parties found matching your criteria.</p>
                    <Button
                        variant="link"
                        onClick={() => { setSearchTerm(""); setFilterOption("all"); }}
                        className="mt-2"
                    >
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    );
}

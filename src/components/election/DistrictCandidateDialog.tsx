"use client";

import { useElectionStore } from "@/lib/election-store";
import { PRCandidate, PRPartyList } from "@/lib/pr-candidate-data";
import { getNepaliDistrict } from "@/lib/district-mapping";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, User, Info } from "lucide-react";
import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { getPartyLogo } from "@/lib/party-symbols";
import Image from "next/image";

// Helper for Party Symbol Placeholder
const PartySymbol = ({ name }: { name: string }) => {
    const logoSrc = getPartyLogo(name);

    if (logoSrc) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="relative h-8 w-8 rounded-full overflow-hidden border border-muted bg-white flex-shrink-0">
                            <Image
                                src={logoSrc}
                                alt={name}
                                fill
                                className="object-contain p-1"
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{name}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    // Generate a consistent color based on name
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorClass = colors[Math.abs(hash) % colors.length];
    const initial = name.charAt(0).toUpperCase();

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={`h-8 w-8 rounded-full ${colorClass} text-white flex items-center justify-center font-bold text-xs cursor-help flex-shrink-0`}>
                        {initial}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{name}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const GenderIcon = ({ gender }: { gender: string }) => {
    const isMale = gender.toLowerCase() === "male";
    const isFemale = gender.toLowerCase() === "female";

    return (
        <div className={`flex items-center gap-2 ${isMale ? "text-blue-600" : isFemale ? "text-pink-600" : "text-gray-600"}`}>
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{gender}</span>
        </div>
    );
};

interface DistrictCandidateDialogProps {
    initialData: PRPartyList[];
}

export function DistrictCandidateDialog({ initialData }: DistrictCandidateDialogProps) {
    const { selectedDistrict, setSelectedDistrict } = useElectionStore();

    // const mappedDistrict = useMemo(() => getNepaliDistrict(selectedDistrict), [selectedDistrict]);
    // Since data is now English, we use selectedDistrict directly.
    const mappedDistrict = selectedDistrict;

    // Filter candidates for this district
    const districtCandidates = useMemo(() => {
        if (!mappedDistrict) return [];
        const results: PRCandidate[] = [];

        initialData.forEach(party => {
            party.candidates.forEach(candidate => {
                if (candidate.district === mappedDistrict) {
                    results.push({ ...candidate, party_name: party.party_name });
                }
            });
        });

        // Sort by Party Name then Candidate Name
        return results.sort((a, b) => (a.party_name || "").localeCompare(b.party_name || "") || a.name.localeCompare(b.name));
    }, [initialData, mappedDistrict]);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setSelectedDistrict(null);
        }
    };

    if (!selectedDistrict) return null;

    return (
        <Dialog open={!!selectedDistrict} onOpenChange={handleOpenChange}>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] flex flex-col p-4 md:p-6 overflow-hidden">
                <DialogHeader className="flex-shrink-0">
                    <div className="flex items-center gap-2 text-primary mb-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">District Focus</span>
                    </div>
                    <DialogTitle className="text-2xl md:text-3xl font-bebas flex flex-wrap items-center gap-2">
                        {selectedDistrict}
                        {mappedDistrict && mappedDistrict !== selectedDistrict && (
                            <span className="text-muted-foreground text-xl md:text-2xl">({mappedDistrict})</span>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-xs md:text-sm">
                        Found {districtCandidates.length} Proportional Representation candidates.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 -mx-4 px-4 overflow-y-auto max-h-[60vh] md:max-h-[65vh] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 transition-colors">
                    {districtCandidates.length > 0 ? (
                        <div className="mt-4 pb-4 overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="text-[10px] text-muted-foreground uppercase bg-muted/20 border-b sticky top-0 bg-background z-10 font-normal tracking-wider">
                                    <tr>
                                        <th className="px-4 py-2 whitespace-nowrap font-normal">Name</th>
                                        <th className="px-4 py-2 whitespace-nowrap text-center font-normal">Party</th>
                                        <th className="px-4 py-2 whitespace-nowrap font-normal">Gender</th>
                                        <th className="px-4 py-2 whitespace-nowrap font-normal">Group</th>
                                    </tr>
                                </thead>
                                <tbody className="text-muted-foreground/90 font-light">
                                    {districtCandidates.map((candidate, idx) => (
                                        <tr
                                            key={`${candidate.party_name}-${candidate.name}-${idx}`}
                                            className="border-b hover:bg-muted/5 transition-colors"
                                        >
                                            <td className="px-4 py-2 text-foreground font-normal">
                                                {candidate.name}
                                                {candidate.backward_area && (
                                                    <span className="ml-2 text-[9px] text-muted-foreground bg-secondary/50 px-1 rounded border border-secondary">Backward</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 max-w-[50px]">
                                                <div className="flex justify-center scale-90 origin-center">
                                                    <PartySymbol name={candidate.party_name || "?"} />
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap font-light">
                                                <GenderIcon gender={candidate.gender} />
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap font-light">{candidate.group}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                            <Users className="h-10 w-10 mb-2 opacity-50" />
                            <p className="font-light text-sm">No candidates found for this district.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

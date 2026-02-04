import { Suspense } from "react";
import PartyData from "@/data/registered-parties-2026EC.json";
import { PartyGrid } from "@/components/election/PartyGrid";
import { PartyDTO } from "@/lib/election-data";

// Type assertion since JSON import might be loose
const PARTIES_DATA = PartyData.parties as unknown as PartyDTO[];

export const metadata = {
    title: "Political Parties | Election 2026",
    description: "Browse and analyze all registered political parties for the 2026 General Election.",
};

export default function PartiesPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="font-bebas text-4xl md:text-6xl text-primary">Political Parties</h1>
                    <p className="text-muted-foreground mt-2 font-manrope text-lg">
                        The registered organizations shaping Nepal's political landscape in the 2026 Election.
                    </p>
                </div>

                {/* Main Grid Component - Handles all filtering/sorting client-side */}
                <PartyGrid parties={PARTIES_DATA} />
            </div>
        </div>
    );
}
